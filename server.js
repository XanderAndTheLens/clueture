import 'dotenv/config';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import axios from 'axios';
import { handler } from './build/handler.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

const APIPrompt = "Take this fact about someone and extend the sentence to make it funnier.";

let queue = [];
let apiCallCount = 0;
const users = {};  // Store user data with their socket ID as the key

async function makeAnswerFunnier(answer) {
  try {
    apiCallCount++;
    console.log(`API Call Count: ${apiCallCount}`);
    console.log("Making API call to OpenAI...");

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: APIPrompt },
          { role: "user", content: answer }
        ],
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("API call successful. Response received:", response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error communicating with OpenAI API:", error);
    return "Could not make the answer funnier due to an error.";
  }
}

async function processQueue() {
  if (queue.length === 0) {
    console.log("Queue is empty, exiting processQueue.");
    return;
  }

  const { answer, socket, gameCode, username } = queue[0];
  console.log(`Processing answer for game ${gameCode}: "${answer}" from user "${username}"`);

  try {
    const funnyAnswer = await makeAnswerFunnier(answer);
    console.log("Emitting funny answer back to the client:", { username, answer: funnyAnswer });

    // Emit the answer back to all clients in the game room
    io.to(gameCode).emit('user_answered', { username, answer: funnyAnswer });

  } finally {
    queue.shift();
    console.log("Answer processed and removed from queue.");
    processQueue();
  }
}


// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_game', ({ gameCode, username }) => {
    socket.join(gameCode);
    users[socket.id] = username || "Anonymous";  // Default to "Anonymous" if no username is provided
    console.log(`User ${username || "Anonymous"} joined game: ${gameCode}`);
  });

  socket.on('answer_question', (data) => {
    const { gameCode, answer } = data;
    const username = users[socket.id]; // Retrieve the username associated with the socket ID

    if (!username) {
      console.error(`No username found for socket ID: ${socket.id}`);
      return;
    }

    console.log(`Received answer from ${username} for game ${gameCode}: ${answer}`);

    // Add the request to the queue with the username
    queue.push({ answer, socket, gameCode, username });

    if (queue.length === 1) {
      processQueue();
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete users[socket.id];  // Remove the user from the list on disconnect
  });
});

// Use SvelteKit's handler for serving the Svelte app
app.use(handler);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
