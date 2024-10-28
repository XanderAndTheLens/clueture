<script>
	import { onMount } from 'svelte';
	import { io } from 'socket.io-client';
  
	let socket;
	let gameCode = '';
	let username = '';
	let answer = '';
	let connected = false;
  
	onMount(() => {
	  socket = io();
  
	  socket.on('connect', () => {
		console.log('Connected to server');
		connected = true;
	  });
	});
  
	function joinGame() {
	  if (gameCode.trim() !== '' && username.trim() !== '') {
		socket.emit('join_game', { gameCode: gameCode.trim(), username: username.trim() });
		alert(`Joined game: ${gameCode} as ${username}`);
	  } else {
		alert('Please enter both a game code and username.');
	  }
	}
  
	function submitAnswer() {
	  if (answer.trim() !== '') {
		socket.emit('answer_question', { gameCode: gameCode.trim(), answer: answer.trim() });
		answer = ''; // Clear the input field after submission
	  }
	}
  </script>
  
  {#if connected}
	<h1>Join Game</h1>
	<input bind:value={gameCode} placeholder="Enter game code" />
	<input bind:value={username} placeholder="Enter your username" />
	<button on:click={joinGame}>Join Game</button>
  
	<h2>Answer the Question</h2>
	<input bind:value={answer} placeholder="Write a fact about youself" />
	<button on:click={submitAnswer}>Submit Answer</button>
  {:else}
	<p>Connecting to the server...</p>
  {/if}
  