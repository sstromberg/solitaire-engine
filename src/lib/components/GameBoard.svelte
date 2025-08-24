<script>
	import { onMount } from 'svelte';
	import { gameState, deckConfig, gameActions } from '$lib/stores/gameStore.js';
	import { Game } from '$lib/game/core/Game.js';
	import { StandardDeck } from '$lib/game/configs/StandardDeck.js';
	import { KlondikeRules } from '$lib/game/rules/KlondikeRules.js';
	import { FreeCellRules } from '$lib/game/rules/FreeCellRules.js';
	import { shouldShowDebug, shouldHighlightValidMoves, shouldLogToConsole } from '$lib/config/environment.js';
	import Card from './Card.svelte';
	
	let game = null;
	let gameStarted = false;
	let selectedCard = null;
	
				let showDebugInfo = false; // Default value
	let showValidMoves = false; // Default value
	
	// Initialize debug values from environment
	onMount(() => {
		showDebugInfo = import.meta.env.DEV;
		showValidMoves = import.meta.env.DEV;
	});
		let validTargets = []; // Cache valid targets for highlighting
	
	// Props
	export let gameType = 'klondike';
	
	// Subscribe to stores
	$: ({ gameStarted } = $gameState);
	$: ({ suits, ranks, deckSize } = $deckConfig);
	
	// Watch for gameType changes and start new game
	$: if (gameType && game) {
		console.log('GameType changed to:', gameType, 'starting new game');
		startNewGame();
	}
	

	
	onMount(() => {
		console.log('GameBoard onMount called with gameType:', gameType);
		
		// Initialize with a standard deck for now
		deckConfig.update(config => ({
			...config,
			suits: ['spades', 'hearts', 'diamonds', 'clubs'],
			ranks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
			deckSize: 52
		}));
		
		// Start the game automatically - but only if we have a valid gameType
		if (gameType) {
			console.log('Starting new game for:', gameType);
			startNewGame();
		} else {
			console.log('No gameType provided, skipping game start');
		}
	});
	
	function startNewGame() {
		// Create a new game with the selected game type
		const standardDeck = new StandardDeck();
		let gameRules;
		
		if (gameType === 'freecell') {
			gameRules = new FreeCellRules();
		} else {
			gameRules = new KlondikeRules(standardDeck);
		}
		
		game = new Game(standardDeck, gameRules);
		game.startNewGame();
		selectedCard = null;
		validTargets = []; // Clear valid targets when starting new game
		
		// Update the game state store
		gameState.update(state => ({
			...state,
			gameStarted: true,
			currentDeck: standardDeck,
			gameRules: gameRules,
			piles: [...game.piles],
			score: game.score,
			moves: [...game.moves],
			lastUpdate: Date.now() // Force reactivity
		}));
	}
	
	// Helper function to find the stack of cards to move
	function findCardStack(card, sourcePile) {
		if (!card || !sourcePile) return [card];
		
		const cardIndex = sourcePile.cards.findIndex(c => c === card);
		if (cardIndex === -1) return [card];
		
		// Find all face-up cards from the clicked card down to the bottom
		const stack = [];
		for (let i = cardIndex; i < sourcePile.cards.length; i++) {
			const currentCard = sourcePile.cards[i];
			if (currentCard.isFaceUp) {
				stack.push(currentCard);
			} else {
				// Stop at first face-down card
				break;
			}
		}
		
		return stack;
	}

	function handleCardClick(event) {
		event.stopPropagation(); // Prevent pile click from firing
		const { card } = event.detail;
		
		if (shouldLogToConsole()) {
			console.log('Card clicked:', card ? card.getShortDisplay() : 'none');
			console.log('Card object:', card);
			if (card) {
				console.log('Card details:', {
					suit: card.suit,
					rank: card.rank,
					isFaceUp: card.isFaceUp,
					isWild: card.isWild
				});
			}
		}
		
		// If clicking the same card, deselect it
		if (selectedCard === card) {
			selectedCard = null;
			validTargets = []; // Clear valid targets
			if (shouldLogToConsole()) {
				console.log('Card deselected');
			}
		} else {
			// Only change selection if we don't already have a selected card
			// This prevents changing selection when trying to move a card
			if (!selectedCard) {
				selectedCard = card;
				// Calculate valid targets for highlighting (without running full validation)
				if (card && game) {
					validTargets = game.gameRules.getValidTargets(card, game);
					if (shouldLogToConsole()) {
						console.log('Valid targets calculated for highlighting:', validTargets.map(p => `${p.type} ${p.index}`));
					}
				}
				if (shouldLogToConsole()) {
					console.log('Card selected:', card ? card.getShortDisplay() : 'none');
				}
			} else {
				// If we already have a selected card, don't change selection
				// This allows pile clicks to work for moving cards
				if (shouldLogToConsole()) {
					console.log('Card click ignored - already have selected card for moving');
				}
			}
		}
	}
	

	

	

	
	function handlePileClick(pile) {
		if (shouldLogToConsole()) {
			console.log('=== PILE CLICK EVENT ===');
			console.log('Pile clicked:', pile.type, pile.index);
			console.log('Selected card:', selectedCard ? selectedCard.getShortDisplay() : 'none');
			console.log('Selected card object:', selectedCard);
			console.log('Valid targets:', validTargets.map(p => `${p.type} ${p.index}`));
			if (selectedCard) {
				console.log('Card details:', {
					suit: selectedCard.suit,
					rank: selectedCard.rank,
					isFaceUp: selectedCard.isFaceUp,
					isWild: selectedCard.isWild
				});
				console.log('Is valid move?', game.isValidMove(selectedCard, pile));
			}
		}
		
		// Check if we're trying to move a card to its own pile (invalid)
		if (selectedCard && pile.cards.includes(selectedCard)) {
			if (shouldLogToConsole()) {
				console.log('Cannot move card to its own pile - ignoring click');
			}
			return;
		}
		
		if (selectedCard && game.isValidMove(selectedCard, pile)) {
			if (shouldLogToConsole()) {
				console.log('=== ATTEMPTING MOVE ===');
				console.log('Moving card', selectedCard.getShortDisplay(), 'to', pile.type, 'pile', pile.index);
				console.log('Card object before move:', selectedCard);
				console.log('Target pile before move:', pile);
				console.log('Game state before move:', {
					totalCards: game.cards.length,
					totalPiles: game.piles.length,
					score: game.score,
					moves: game.moves.length
				});
			}
			
			try {
				// Find the source pile to determine if this is a stack move
				const sourcePile = game.findCardPile(selectedCard);
				const cardStack = findCardStack(selectedCard, sourcePile);
				
				// For stack moves, validate the entire stack can be moved
				if (cardStack.length > 1) {
					if (shouldLogToConsole()) {
						console.log('Validating stack move of', cardStack.length, 'cards');
					}
					
					// Check if the stack can be moved according to game rules
					if (game.gameRules.canMoveStack && !game.gameRules.canMoveStack(cardStack, pile, game)) {
						if (shouldLogToConsole()) {
							console.log('Stack move validation failed - too many cards for current game state');
						}
						return; // Don't proceed with the move
					}
					
					if (shouldLogToConsole()) {
						console.log('Stack move validation passed, proceeding with move');
					}
				}
				
				let moveResult;
				if (cardStack.length > 1) {
					if (shouldLogToConsole()) {
						console.log('Moving stack of', cardStack.length, 'cards');
					}
					moveResult = game.makeStackMove(selectedCard, pile, cardStack);
				} else {
					if (shouldLogToConsole()) {
						console.log('Moving single card');
					}
					moveResult = game.makeMove(selectedCard, pile);
				}
				
				if (shouldLogToConsole()) {
					console.log('Move result:', moveResult);
					console.log('Game state after move:', {
						totalCards: game.cards.length,
						totalPiles: game.piles.length,
						score: game.score,
						moves: game.moves.length
					});
					console.log('Target pile after move:', pile);
				}
				
				selectedCard = null;
				validTargets = []; // Clear valid targets after move
				
				// Update the store with new object references to trigger reactivity
				gameState.update(state => ({
					...state,
					piles: [...game.piles],
					score: game.score,
					moves: [...game.moves],
					gameWon: game.gameWon,
					lastUpdate: Date.now() // Force reactivity
				}));
				
				if (shouldLogToConsole()) {
					console.log('Store updated, move completed successfully');
				}
			} catch (error) {
				if (shouldLogToConsole()) {
					console.error('Error during move:', error);
				}
			}
		} else if (selectedCard) {
			if (shouldLogToConsole()) {
				console.log('Invalid move:', selectedCard.getShortDisplay(), 'to', pile.type, 'pile', pile.index);
			}
		}
	}
	
	function drawFromStock() {
		if (game) {
			game.drawFromStock();
			gameState.update(state => ({
				...state,
				piles: game.piles
			}));
		}
	}
	
	function undoMove() {
		if (game && game.undoMove()) {
			gameState.update(state => ({
				...state,
				piles: [...game.piles],
				score: game.score,
				moves: [...game.moves],
				lastUpdate: Date.now() // Force reactivity
			}));
		}
	}
	
	function resetGame() {
		if (game) {
			game.reset();
			selectedCard = null;
			validTargets = []; // Clear valid targets when resetting game
			gameState.update(state => ({
				...state,
				gameStarted: false,
				piles: [],
				score: 0,
				moves: [],
				gameWon: false
			}));
		}
	}
</script>

<div class="game-board">
	{#if !gameStarted}
		<div class="welcome-screen">
			<h2>Welcome to Solitaire!</h2>
			<p>Click the button below to start a new game.</p>
			<button class="start-button" on:click={startNewGame}>
				Start New Game
			</button>
		</div>
	{:else}
		<div class="game-layout">
			<!-- Foundation and Free Cells area (top) - side by side for FreeCell -->
			{#if gameType === 'freecell' && $gameState.piles.filter(p => p.type === 'freecell').length > 0}
				<div class="foundation-freecell-area">
					<!-- Foundation area (left) -->
					<div class="foundation-area">
						<div class="area-header">
							<h3>Foundation</h3>
						</div>
						<div class="foundation-piles">
							{#each $gameState.piles.filter(p => p.type === 'foundation') as pile, i}
								<div 
									class="foundation-pile pile {shouldHighlightValidMoves() && selectedCard && validTargets.includes(pile) ? 'valid-target' : ''}" 
									role="button"
									tabindex="0"
									on:click={() => handlePileClick(pile)}
									on:keydown={(e) => e.key === 'Enter' && handlePileClick(pile)}
								>
									{#if pile.isEmpty()}
										<div class="pile-placeholder">+</div>
									{:else}
										<Card 
											card={pile.getTopCard()} 
											isSelected={selectedCard === pile.getTopCard()}
											showDebugInfo={showDebugInfo}
											on:click={handleCardClick}
										/>
									{/if}
								</div>
							{/each}
						</div>
					</div>
					
					<!-- Free Cell area (right) -->
					<div class="freecell-area">
						<div class="area-header">
							<h3>Free Cells</h3>
						</div>
						<div class="freecell-piles">
							{#each $gameState.piles.filter(p => p.type === 'freecell') as pile, i}
								<div 
									class="freecell-pile pile {shouldHighlightValidMoves() && selectedCard && validTargets.includes(pile) ? 'valid-target' : ''}" 
									role="button"
									tabindex="0"
									on:click={() => handlePileClick(pile)}
									on:keydown={(e) => e.key === 'Enter' && handlePileClick(pile)}
								>
									{#if pile.isEmpty()}
										<div class="pile-placeholder">+</div>
									{:else}
										<Card 
											card={pile.getTopCard()} 
											isSelected={selectedCard === pile.getTopCard()}
											showDebugInfo={showDebugInfo}
											on:click={handleCardClick}
										/>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>
			{:else}
				<!-- Foundation area (top) - standalone for Klondike -->
				<div class="foundation-area">
					<div class="area-header">
						<h3>Foundation</h3>
					</div>
					<div class="foundation-piles">
						{#each $gameState.piles.filter(p => p.type === 'foundation') as pile, i}
							<div 
								class="foundation-pile pile {shouldHighlightValidMoves() && selectedCard && validTargets.includes(pile) ? 'valid-target' : ''}" 
								role="button"
								tabindex="0"
								on:click={() => handlePileClick(pile)}
								on:keydown={(e) => e.key === 'Enter' && handlePileClick(pile)}
							>
								{#if pile.isEmpty()}
									<div class="pile-placeholder">+</div>
								{:else}
									<Card 
										card={pile.getTopCard()} 
										isSelected={selectedCard === pile.getTopCard()}
										showDebugInfo={showDebugInfo}
										on:click={handleCardClick}
									/>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
			
			<!-- Tableau area (middle) -->
					<div class="tableau-area" class:freecell={gameType === 'freecell'}>
			<div class="area-header">
				<h3>Tableau</h3>
			</div>
			<div class="tableau-piles">
					{#each $gameState.piles.filter(p => p.type === 'tableau') as pile, i}
						<div 
							class="tableau-pile pile {shouldHighlightValidMoves() && selectedCard && validTargets.includes(pile) ? 'valid-target' : ''}" 
							role="button"
							tabindex="0"
							on:click={() => handlePileClick(pile)}
							on:keydown={(e) => e.key === 'Enter' && handlePileClick(pile)}

						>
							{#if pile.isEmpty()}
								<div class="pile-placeholder">+</div>
							{:else}
								{#each pile.cards as card, cardIndex}
									{@const isStacked = cardIndex < pile.cards.length - 1}
									<div class="stacked-card" style="top: {cardIndex * 20}px; z-index: {cardIndex};">
										<Card 
											card={card} 
											isSelected={selectedCard === card}
											showFace={card.isFaceUp}
											isStacked={isStacked}
											showDebugInfo={showDebugInfo}
											on:click={handleCardClick}
										/>
									</div>
								{/each}
							{/if}
						</div>
					{/each}
				</div>
			</div>
			
			<!-- Stock and waste area (bottom) - only for Klondike -->
			{#if gameType === 'klondike'}
			<div class="stock-waste-area">
				<div class="stock-area">
					<div class="area-header">
						<h3>Stock</h3>
					</div>
					<button 
						class="stock-pile pile" 
						type="button"
						on:click={drawFromStock}
						disabled={$gameState.piles.find(p => p.type === 'stock')?.isEmpty()}
					>
						{#if $gameState.piles.find(p => p.type === 'stock')?.isEmpty()}
							<div class="pile-placeholder">Empty</div>
						{:else}
							<div class="stock-count">{$gameState.piles.find(p => p.type === 'stock')?.getCardCount()}</div>
						{/if}
					</button>
				</div>
				<div class="waste-area">
					<div class="area-header">
						<h3>Waste</h3>
					</div>
					<div class="waste-pile">
						{#if $gameState.piles.find(p => p.type === 'waste')?.isEmpty()}
							<div class="pile-placeholder">Empty</div>
						{:else}
							{#each $gameState.piles.find(p => p.type === 'waste')?.cards || [] as card, cardIndex}
								{@const isStacked = cardIndex < ($gameState.piles.find(p => p.type === 'waste')?.cards.length - 1)}
								<div class="waste-card" style="left: {cardIndex * 23}px; z-index: {cardIndex};">
									<Card 
										card={card} 
										isSelected={selectedCard === card}
										showFace={card.isFaceUp}
										isStacked={isStacked}
										stackType={isStacked ? 'horizontal' : 'vertical'}
										showDebugInfo={showDebugInfo}
										on:click={handleCardClick}
									/>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
			{/if}
		</div>
		
		<!-- Win condition display -->
		{#if $gameState.gameWon}
			<div class="win-message">
				<h2>🎉 Congratulations! 🎉</h2>
				<p>You've won {gameType === 'freecell' ? 'FreeCell' : 'Klondike'} Solitaire!</p>
				<p>Final Score: {$gameState.score}</p>
				<button class="control-button" on:click={resetGame}>
					Play Again
				</button>
			</div>
		{/if}
		
		<!-- Debug controls (only visible in dev mode) -->
		{#if shouldShowDebug()}
			<div class="debug-controls">
				<h4>🐛 Debug Controls</h4>
				<label class="debug-toggle">
					<input type="checkbox" bind:checked={showDebugInfo}>
					Show Debug Info
				</label>
				<label class="debug-toggle">
					<input type="checkbox" bind:checked={showValidMoves}>
					Highlight Valid Moves
				</label>
			</div>
		{/if}
		
		<!-- Game status -->
		<div class="game-status">
			<div class="status-line">
				<span class="status-label">Selected:</span>
				<span class="status-value">
					{selectedCard ? selectedCard.getShortDisplay() : 'None'}
				</span>
			</div>
			{#if showDebugInfo}
				<div class="status-line">
					<span class="status-label">Valid Moves:</span>
					<span class="status-value">
						{selectedCard && game ? game.getValidMoves(selectedCard).length : 0}
					</span>
				</div>
				<div class="status-line">
					<span class="status-label">Last Move:</span>
					<span class="status-value">
						{$gameState.moves.length > 0 ? 
							`${$gameState.moves[$gameState.moves.length - 1].cards ? 
								$gameState.moves[$gameState.moves.length - 1].cards[0].getShortDisplay() + ' (+' + ($gameState.moves[$gameState.moves.length - 1].cards.length - 1) + ' more)' :
								$gameState.moves[$gameState.moves.length - 1].card.getShortDisplay()
							} → ${$gameState.moves[$gameState.moves.length - 1].toPile.type} ${$gameState.moves[$gameState.moves.length - 1].toPile.index}` : 
							'None'
						}
					</span>
				</div>
				<div class="status-line">
					<span class="status-label">Game State:</span>
					<span class="status-value">
						{$gameState.piles.filter(p => p.type === 'foundation').reduce((sum, p) => sum + p.getCardCount(), 0)}/{gameType === 'freecell' ? '52' : '52'} foundation
					</span>
				</div>
				{#if gameType === 'freecell'}
				<div class="status-line">
					<span class="status-label">Free Cells:</span>
					<span class="status-value">
						{$gameState.piles.filter(p => p.type === 'freecell' && p.isEmpty()).length} empty
					</span>
				</div>
				<div class="status-line">
					<span class="status-label">Max Moveable:</span>
					<span class="status-value">
						{game ? game.gameRules.getMaxMoveableCards(game) : 0} cards
					</span>
				</div>
				{/if}
			{/if}
			<div class="status-line">
				<span class="status-label">Moves:</span>
				<span class="status-value">{$gameState.moves.length}</span>
			</div>
		</div>
		
		<!-- Game controls -->
		<div class="game-controls">
			<button class="control-button" on:click={undoMove}>
				Undo
			</button>
			<button class="control-button" on:click={resetGame}>
				New Game
			</button>
			<div class="score">Score: {game ? game.score : 0}</div>
		</div>
	{/if}
</div>

<style>
	.game-board {
		width: 100%;
		max-width: min(100vw - 40px, 1200px);
		margin: 0 auto;
		padding: 20px;
		box-sizing: border-box;
	}
	
	.welcome-screen {
		text-align: center;
		padding: 60px 20px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		backdrop-filter: blur(10px);
	}
	
	.welcome-screen h2 {
		color: white;
		margin-bottom: 20px;
		font-size: 2rem;
	}
	
	.welcome-screen p {
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 30px;
		font-size: 1.1rem;
	}
	
	.start-button {
		background: linear-gradient(45deg, #007bff, #0056b3);
		color: white;
		border: none;
		padding: 15px 30px;
		font-size: 1.1rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
	}
	
	.start-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
	}
	
	.game-layout {
		display: flex;
		flex-direction: column;
		gap: 20px; /* Reduced gap between main sections */
	}
	
	.foundation-area,
	.tableau-area,
	.stock-waste-area,
	.freecell-area {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 10px; /* Further reduced padding for more compact layout */
		backdrop-filter: blur(10px);
		display: flex;
		align-items: flex-start;
		gap: 15px;
	}
	
	.foundation-freecell-area {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 10px;
		backdrop-filter: blur(10px);
		display: flex;
		align-items: flex-start;
		gap: 15px; /* Reduced gap between Foundation and Free Cells */
	}
	
	.foundation-freecell-area .foundation-area,
	.foundation-freecell-area .freecell-area {
		background: transparent;
		padding: 0;
		backdrop-filter: none;
		flex: 1;
		display: flex;
		align-items: flex-start;
		gap: 8px; /* Reduced gap between label and piles */
	}
	
	/* Special handling for tableau area to accommodate stacked cards */
	.tableau-area {
		overflow: visible;
		margin-bottom: 20px; /* Further reduced for more compact layout */
		min-height: 280px; /* Reduced height while still accommodating stacked cards */
	}
	
	/* FreeCell needs taller tableau for deeper stacks (up to 16 cards) */
	.tableau-area.freecell {
		min-height: 500px; /* Increased height to accommodate deeper stacks */
	}
	
	.area-header {
		flex-shrink: 0;
		width: clamp(60px, 8vw, 80px);
	}
	
	.area-header h3 {
		color: white;
		margin: 0;
		text-align: left;
		font-size: clamp(0.9rem, 2.5vw, 1.1rem);
		writing-mode: vertical-rl;
		text-orientation: mixed;
		transform: rotate(180deg);
		white-space: nowrap;
	}
	
	/* Responsive adjustments for smaller screens */
	@media (max-width: 768px) {
		.game-board {
			padding: 15px;
		}
		
		.game-layout {
			gap: 15px;
		}
		
		.foundation-area,
		.tableau-area,
		.stock-waste-area,
		.freecell-area {
			padding: 8px;
			gap: 10px;
		}
		
		.foundation-freecell-area {
			padding: 8px;
			gap: 12px;
		}
		
		.foundation-freecell-area .foundation-area,
		.foundation-freecell-area .freecell-area {
			gap: 6px;
		}
		
		.area-header {
			width: 50px;
		}
		
		.area-header h3 {
			font-size: 0.9rem;
		}
		
		/* FreeCell tableau adjustments for medium screens */
		.tableau-area.freecell {
			min-height: 450px; /* Adjusted for medium screens */
		}
	}
	
	@media (max-width: 480px) {
		.game-board {
			padding: 10px;
		}
		
		.game-layout {
			gap: 10px;
		}
		
		.foundation-area,
		.tableau-area,
		.stock-waste-area {
			padding: 5px;
			gap: 8px;
		}
		
		.area-header {
			width: 40px;
		}
		
		.area-header h3 {
			font-size: 0.8rem;
		}
	}
	
	/* Mobile orientation-specific layouts */
	@media (max-width: 768px) and (orientation: portrait) {
		/* Portrait mode: Stack areas vertically with compact spacing */
		.game-layout {
			gap: 10px;
		}
		
		.foundation-area,
		.tableau-area,
		.stock-waste-area {
			flex-direction: column;
			gap: 8px;
		}
		
		.area-header {
			width: 100%;
			text-align: center;
		}
		
		.area-header h3 {
			writing-mode: horizontal-tb;
			transform: none;
			font-size: 1rem;
		}
		
		.tableau-piles {
			grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
			gap: 5px;
		}
		
		.foundation-piles {
			grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
			gap: 5px;
		}
		
		/* Reset stock-waste positioning for mobile portrait */
		.stock-waste-area {
			justify-content: center;
		}
		
		.stock-area {
			margin-left: 0;
		}
		
		/* FreeCell tableau adjustments for mobile portrait */
		.tableau-area.freecell {
			min-height: 400px; /* Slightly reduced for mobile but still tall enough */
		}

	}
	
	@media (max-width: 768px) and (orientation: landscape) {
		/* Landscape mode: Use horizontal layout with side labels */
		.game-layout {
			gap: 12px;
		}
		
		.foundation-area,
		.tableau-area,
		.stock-waste-area,
		.freecell-area {
			flex-direction: row;
			gap: 12px;
		}
		
		.foundation-freecell-area {
			flex-direction: row;
			gap: 12px;
		}
		
		.foundation-freecell-area .foundation-area,
		.foundation-freecell-area .freecell-area {
			gap: 6px;
		}
		
		.area-header {
			width: 60px;
		}
		
		.area-header h3 {
			writing-mode: vertical-rl;
			transform: rotate(180deg);
			font-size: 0.9rem;
		}
		
		.tableau-piles {
			grid-template-columns: repeat(auto-fit, minmax(65px, 1fr));
			gap: 8px;
		}
		
		.foundation-piles {
			grid-template-columns: repeat(auto-fit, minmax(65px, 1fr));
			gap: 8px;
		}
		
		/* Adjust stock-waste positioning for mobile landscape */
		.stock-waste-area {
			justify-content: center;
		}
		
		.stock-area {
			margin-left: 0;
		}
	}
	
	/* Extra small screens in portrait mode */
	@media (max-width: 480px) and (orientation: portrait) {
		.game-board {
			padding: 8px;
		}
		
		.game-layout {
			gap: 8px;
		}
		
		.foundation-area,
		.tableau-area,
		.stock-waste-area,
		.freecell-area {
			padding: 4px;
			gap: 6px;
		}
		
		.foundation-freecell-area {
			padding: 4px;
			gap: 6px;
			flex-direction: column;
		}
		
		.foundation-freecell-area .foundation-area,
		.foundation-freecell-area .freecell-area {
			background: rgba(255, 255, 255, 0.05);
			padding: 4px;
			border-radius: 8px;
			gap: 4px;
		}
		
		.area-header h3 {
			font-size: 0.9rem;
		}
		
		.tableau-piles {
			grid-template-columns: repeat(auto-fit, minmax(55px, 1fr));
			gap: 3px;
		}
		
		.foundation-piles {
			grid-template-columns: repeat(auto-fit, minmax(55px, 1fr));
			gap: 3px;
		}
	}
	
	.foundation-piles,
	.tableau-piles {
		display: grid;
		gap: 10px; /* Reduced gap between piles */
		justify-content: center;
	}
	
	.foundation-piles {
		grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
		width: 100%;
		max-width: min(100%, 400px);
		margin: 0 auto;
		gap: clamp(5px, 1vw, 15px); /* Responsive gap */
	}
	
	.freecell-piles {
		display: grid;
		grid-template-columns: repeat(4, 70px);
		gap: 10px;
		justify-content: center;
		width: 100%;
		max-width: min(100%, 320px);
		margin: 0 auto;
	}
	
	.tableau-piles {
		grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
		width: 100%;
		max-width: min(100%, 700px);
		margin: 0 auto;
		gap: clamp(5px, 1vw, 15px); /* Responsive gap */
		overflow: visible; /* Allow cards to extend beyond container */
	}
	
	.stock-waste-area {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		position: relative;
		z-index: 10; /* Ensure stock/waste stays above tableau cards */
		gap: 20px;
		width: 100%;
	}
	
	.stock-area {
		flex-shrink: 0;
	}
	
	.stock-area,
	.waste-area {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}
	
	.stock-area {
		flex-shrink: 0;
	}
	
	.waste-area {
		flex: 1;
		min-width: 0;
	}
	
	.pile {
		width: 70px;
		height: 100px;
		border: 2px dashed rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		transition: all 0.2s ease;
	}
	
	.pile:hover {
		border-color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.1);
		cursor: pointer;
	}
	
	.pile:focus {
		outline: 2px solid rgba(0, 123, 255, 0.8);
		border-color: rgba(0, 123, 255, 0.8);
	}
	
	.pile.valid-target {
		border-color: rgba(0, 255, 0, 0.8);
		background: rgba(0, 255, 0, 0.15);
		box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
		animation: pulse 1.5s infinite;
	}
	

	
	@keyframes pulse {
		0% { box-shadow: 0 0 10px rgba(0, 255, 0, 0.3); }
		50% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.5); }
		100% { box-shadow: 0 0 10px rgba(0, 255, 0, 0.3); }
	}
	
	.pile-placeholder {
		color: rgba(255, 255, 255, 0.6);
		font-size: 1.2rem;
		font-weight: bold;
	}
	
	.stacked-card {
		position: absolute;
		left: 0;
		transition: all 0.2s ease;
	}
	
	.waste-pile {
		position: relative;
		min-height: 100px;
		min-width: 500px; /* Reduced width to prevent overflow */
		overflow: visible;
	}
	
	.waste-card {
		position: absolute;
		top: 0;
		transition: all 0.2s ease;
	}
	
	/* Make stacked cards slightly smaller to show more of underlying cards */
	.stacked-card:not(:last-child) .card {
		transform: scale(0.95);
		opacity: 0.9;
	}
	
	/* Ensure stacked cards don't interfere with clicking */
	.stacked-card .card {
		pointer-events: auto;
	}
	
	/* Add subtle shadow to stacked cards for depth */
	.stacked-card:not(:last-child) .card {
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
	}
	
	/* Debug: Add border to stacked cards to make them more visible */
	.stacked-card:not(:last-child) .card {
		border: 1px solid rgba(255, 255, 255, 0.3);
	}
	
	.tableau-pile {
		position: relative;
		min-height: 220px; /* Reduced height while still accommodating stacked cards */
		overflow: visible; /* Allow stacked cards to extend beyond pile boundaries */
	}
	
	/* FreeCell tableau piles need to be taller for deeper stacks */
	.tableau-area.freecell .tableau-pile {
		min-height: 300px; /* Increased height for FreeCell's deeper stacks */
	}
	
	.stock-count {
		color: white;
		font-size: 1.5rem;
		font-weight: bold;
		background: rgba(0, 123, 255, 0.3);
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
	}
	
	.game-controls {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 20px;
		margin-top: 30px;
		padding: 20px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		backdrop-filter: blur(10px);
	}
	
	.control-button {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		padding: 10px 20px;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.control-button:hover {
		background: rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.5);
	}
	
	.score {
		color: white;
		font-size: 1.1rem;
		font-weight: bold;
		padding: 10px 20px;
		background: rgba(0, 123, 255, 0.3);
		border-radius: 6px;
	}
	
	.win-message {
		text-align: center;
		padding: 40px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		margin: 30px 0;
		backdrop-filter: blur(10px);
		border: 2px solid rgba(255, 255, 255, 0.3);
	}
	
	.win-message h2 {
		color: #ffd700;
		font-size: 2.5rem;
		margin-bottom: 20px;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	}
	
	.win-message p {
		color: white;
		font-size: 1.2rem;
		margin-bottom: 15px;
	}
	
	.game-status {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 20px;
		margin: 20px 0;
		backdrop-filter: blur(10px);
	}
	
	.status-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}
	
	.status-line:last-child {
		margin-bottom: 0;
	}
	
	.status-label {
		color: rgba(255, 255, 255, 0.8);
		font-weight: bold;
	}
	
	.status-value {
		color: white;
		font-size: 1.1rem;
		background: rgba(0, 123, 255, 0.3);
		padding: 5px 15px;
		border-radius: 6px;
	}
	
	.debug-controls {
		background: rgba(255, 193, 7, 0.1);
		border: 2px solid rgba(255, 193, 7, 0.3);
		border-radius: 12px;
		padding: 20px;
		margin: 20px 0;
		backdrop-filter: blur(10px);
	}
	
	.debug-controls h4 {
		color: #ffc107;
		margin-bottom: 15px;
		text-align: center;
		font-size: 1.1rem;
	}
	
	.debug-toggle {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;
		color: rgba(255, 255, 255, 0.9);
		cursor: pointer;
	}
	
	.debug-toggle:last-child {
		margin-bottom: 0;
	}
	
	.debug-toggle input[type="checkbox"] {
		width: 18px;
		height: 18px;
		accent-color: #ffc107;
	}
</style>
