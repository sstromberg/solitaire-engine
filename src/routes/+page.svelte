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
			description: 'The classic: 7 face-down tableau piles, alternate colors',
			icon: '🃏',
			rules: 'Build up foundation piles by suit, build down tableau piles alternating colors'
		},
		{
			id: 'freecell',
			name: 'FreeCell',
			description: 'Another classic: use the free cells strategically to enable freedom of action',
			icon: '🏗️',
			rules: 'Four free cells temporarily store cards; alternate colors and build up foundation piles by suit'
		},
		{
			id: 'fortunes-foundation',
			name: "Fortune's Foundation",
			description: 'A tarot-deck variant created by Zachtronics; can you order the larger deck with limited degrees of freedom?',
			icon: '🔮',
			rules: 'Build same-suit stacks in ascending or descending order, Major Arcana can go into the foundation starting at both 0 and 21'
		},
		{
			id: 'sawayama',
			name: 'Sawayama',
			description: 'Another Zachtronics-created variant: when the draw pile is empty, it becomes a free cell',
			icon: '⛰️',
			rules: 'Build foundation piles by suit; draw-3, no recirculation, but the empty draw pile becomes a free cell; all cards dealt face-up, any card can occupy an empty tableau slot'
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
			<h1>{availableGames.find(g => g.id === $selectedGame)?.name}</h1>
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
			}}>Test: Set to Klondike</button>
		</div>
	</div>
{/if}

<style>
	/* Game Container Styles */
	.game-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}
	
	.game-header {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-bottom: 20px;
	}
	
	.return-btn {
		padding: 10px 15px;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 14px;
	}
	
	.return-btn:hover {
		background: #0056b3;
	}
	
	/* Menu Container Styles */
	.menu-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 40px 20px;
		text-align: center;
	}
	
	h1 {
		font-size: 3rem;
		margin-bottom: 10px;
		color: #333;
	}
	
	.subtitle {
		font-size: 1.2rem;
		color: #666;
		margin-bottom: 40px;
	}
	
	.game-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
		margin-bottom: 40px;
	}
	
	.game-card {
		background: white;
		border: 2px solid #e0e0e0;
		border-radius: 15px;
		padding: 25px;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}
	
	.game-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
		border-color: #007bff;
	}
	
	.game-icon {
		font-size: 3rem;
		margin-bottom: 15px;
	}
	
	.game-card h2 {
		font-size: 1.5rem;
		margin-bottom: 10px;
		color: #333;
	}
	
	.game-description {
		font-size: 1rem;
		color: #666;
		margin-bottom: 15px;
		line-height: 1.4;
	}
	
	.game-rules {
		font-size: 0.9rem;
		color: #888;
		margin-bottom: 20px;
		line-height: 1.3;
		font-style: italic;
	}
	
	.play-btn {
		background: #28a745;
		color: white;
		border: none;
		padding: 12px 25px;
		border-radius: 25px;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.3s ease;
	}
	
	.play-btn:hover {
		background: #218838;
	}
	
	/* Responsive Design */
	@media (max-width: 768px) {
		h1 {
			font-size: 2.5rem;
		}
		
		.game-grid {
			grid-template-columns: 1fr;
			gap: 15px;
		}
		
		.game-card {
			padding: 20px;
		}
	}
</style>

