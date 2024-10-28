<script>
	import { onMount } from 'svelte';
	import { io } from 'socket.io-client';
  
	let socket;
	let question = "Write a fact about yourself";
	let answers = []; // Store answers with usernames
	const gameCode = "GAME123"; // Set default game code
	const username = "Main Screen"; // Default username for main screen
  
	onMount(() => {
	  // Connect to the Socket.IO server
	  socket = io("http://localhost:3000");
  
	  socket.on('connect', () => {
		console.log('Connected to server on main screen');
  
		// Join the default game room with the default username
		socket.emit('join_game', { gameCode, username });
		console.log(`Main screen joined game: ${gameCode} with username: ${username}`);
	  });
  
	  // Listen for funny answers from the server
	  socket.on('user_answered', (data) => {
		console.log("Answer received on main screen:", data);
  
		// Append received answer to the answers array
		if (data && data.username && data.answer) {
		  answers = [...answers, data];
		  console.log("Updated answers array:", answers);
		} else {
		  console.error("Unexpected data structure received:", data);
		}
	  });
  
	  socket.on('disconnect', () => {
		console.log("Disconnected from server");
	  });
	});
  </script>
  
  <h1>Main Screen</h1>
  <h2>{question}</h2>
  <h2>Type in the gamecode: {gameCode}</h2>
  
  <h3>Answers:</h3>
  <ul>
	{#each answers as answer}
	  <li>{answer.username}: {answer.answer}</li>
	{/each}
  </ul>
  
  
  

  
  