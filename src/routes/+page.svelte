<script>
	import GameBoard from '$lib/components/GameBoard.svelte';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	
	// Game selection state
	const selectedGame = writable(null);
	const availableGames = [
		{
			id: 'klondike',
			name: 'Klondike',
			description: 'Classic solitaire with 7 tableau piles',
			icon: '🃏',
			rules: 'Build up foundation piles by suit, build down tableau piles alternating colors'
		},
		{
			id: 'freecell',
			name: 'FreeCell',
			description: 'Strategic solitaire with 8 tableau piles and free cells',
			icon: '🏗️',
			rules: 'Use free cells to temporarily store cards, build up foundation piles by suit'
		}
	];
	
	onMount(() => {
		console.log('Main page mounted');
		console.log('availableGames:', availableGames);
		console.log('selectedGame store:', selectedGame);
		
		// Initialize config store with default values
		import('$lib/config/environment.js').then(({ config }) => {
			console.log('Config store initialized:', config);
		});
	});
	
	function selectGame(gameId) {
		console.log('selectGame called with:', gameId);
		selectedGame.set(gameId);
		console.log('selectedGame store value after set:', $selectedGame);
	}
	
	function returnToMenu() {
		selectedGame.set(null);
	}
</script>

<svelte:head>
	<title>Solitaire</title>
</svelte:head>

{#if $selectedGame}
	<!-- Game in progress -->
	<div class="game-container">
		<div class="game-header">
			<button class="return-btn" on:click={returnToMenu}>
				← Back to Menu
			</button>
			<h1>{availableGames.find(g => g.id === $selectedGame)?.name} Solitaire</h1>
		</div>
		<GameBoard gameType={$selectedGame} />
	</div>
{:else}
	<!-- Game selection menu -->
	<div class="menu-container">
		<h1>🎴 Solitaire</h1>
		<p class="subtitle">Choose your game variant</p>
		
		<div class="game-grid">
			{#each availableGames as game}
				<div class="game-card" on:click={() => {
					console.log('Card clicked for game:', game.id);
					selectGame(game.id);
				}}>
					<div class="game-icon">{game.icon}</div>
					<h2>{game.name}</h2>
					<p class="game-description">{game.description}</p>
					<p class="game-rules">{game.rules}</p>
					<button class="play-btn" on:click|stopPropagation={() => {
						console.log('Button clicked for game:', game.id);
						selectGame(game.id);
					}}>Play {game.name}</button>
				</div>
			{/each}
		</div>
		
		<!-- Debug info -->
		<div style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px;">
			<p>Debug: selectedGame = {$selectedGame}</p>
			<p>Debug: availableGames = {JSON.stringify(availableGames)}</p>
			<button on:click={() => {
				console.log('Test button clicked');
				selectedGame.set('klondike');
				console.log('Test: selectedGame set to klondike');
			}}>Test Store Update</button>
		</div>
		
		<div class="coming-soon">
			<h3>Coming Soon</h3>
			<p>Tarot variants, Spider, and more!</p>
		</div>
	</div>
{/if}

<style>
	.menu-container, .game-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
		text-align: center;
	}

	h1 {
		color: #2c3e50;
		margin-bottom: 10px;
		font-size: 3rem;
	}
	
	.subtitle {
		color: #7f8c8d;
		font-size: 1.2rem;
		margin-bottom: 40px;
	}

	.game-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 30px;
		margin-bottom: 50px;
	}

	.game-card {
		background: white;
		border-radius: 15px;
		padding: 30px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		cursor: pointer;
		border: 2px solid transparent;
	}

	.game-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
		border-color: #3498db;
	}

	.game-icon {
		font-size: 4rem;
		margin-bottom: 20px;
	}

	.game-card h2 {
		color: #2c3e50;
		margin-bottom: 15px;
		font-size: 1.8rem;
	}

	.game-description {
		color: #34495e;
		font-size: 1.1rem;
		margin-bottom: 15px;
		font-weight: 500;
	}

	.game-rules {
		color: #7f8c8d;
		font-size: 0.9rem;
		margin-bottom: 25px;
		line-height: 1.4;
	}

	.play-btn {
		background: #3498db;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 25px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.3s ease;
	}

	.play-btn:hover {
		background: #2980b9;
	}

	.coming-soon {
		background: #f8f9fa;
		border-radius: 15px;
		padding: 30px;
		border: 2px dashed #bdc3c7;
	}

	.coming-soon h3 {
		color: #7f8c8d;
		margin-bottom: 10px;
		font-size: 1.3rem;
	}

	.coming-soon p {
		color: #95a5a6;
		font-size: 1rem;
	}

	.game-header {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-bottom: 30px;
	}

	.return-btn {
		background: #95a5a6;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 20px;
		font-size: 0.9rem;
		cursor: pointer;
		transition: background 0.3s ease;
		white-space: nowrap;
	}

	.return-btn:hover {
		background: #7f8c8d;
	}

	.game-header h1 {
		margin: 0;
		font-size: 2.5rem;
	}

	@media (max-width: 768px) {
		.game-grid {
			grid-template-columns: 1fr;
			gap: 20px;
		}
		
		.game-card {
			padding: 20px;
		}
		
		.game-header {
			flex-direction: column;
			gap: 15px;
		}
		
		.return-btn {
			order: -1;
		}
	}
</style>
