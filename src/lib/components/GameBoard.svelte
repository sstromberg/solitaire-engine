<script>
	import { onMount } from 'svelte';
	import { gameState, deckConfig, gameActions } from '$lib/stores/gameStore.js';
	import { Game } from '$lib/game/core/Game.js';
	import { StandardDeck } from '$lib/game/configs/StandardDeck.js';
	import { TarotDeck } from '$lib/game/configs/TarotDeck.js';
	import { KlondikeRules } from '$lib/game/rules/KlondikeRules.js';
	import { FreeCellRules } from '$lib/game/rules/FreeCellRules.js';
	import { FortunesFoundationRules } from '$lib/game/rules/FortunesFoundationRules.js';
	import { SawayamaRules } from '$lib/game/rules/SawayamaRules.js';
	import { shouldShowDebug, shouldHighlightValidMoves, shouldLogToConsole } from '$lib/config/environment.js';
	import Card from './Card.svelte';
	
	let game = null;
	let gameStarted = false;
	let selectedCard = null;
	let showDebugInfo = false; // Default value
	let showValidMoves = false; // Default value
	let showSolvabilityInfo = false; // Solvability info toggle (nested under Debug Info)
	let showCardNotation = false; // Card notation toggle (nested under Debug Info)
	let showNewGameConfirmation = false; // New game confirmation dialog
	

	// Simple solvability check (automatic)
	let isPositionWinnable = true;
	
	// Update solvability whenever game state changes (only when Debug Info is enabled)
	$: if (showDebugInfo && showSolvabilityInfo && game && game.gameRules && game.gameRules.isPositionWinnable) {
		isPositionWinnable = game.gameRules.isPositionWinnable($gameState);
	}

	// Update game debug mode when debug flag changes
	$: if (game) {
		game.setDebugMode(showDebugInfo);
	}
	
	let validTargets = []; // Cache valid targets for highlighting
	
	// Props
	export let gameType = 'klondike';
	
	// Subscribe to stores
	$: ({ gameStarted } = $gameState);
	$: ({ suits, ranks, deckSize } = $deckConfig);
	
	// Watch for gameType changes
	$: if (gameType) {
		console.log('GameBoard: gameType changed to:', gameType);
		// Update deck config when game type changes
		updateDeckConfig();
		// Start new game if we're already mounted
		if (game) {
			console.log('GameBoard: Starting new game for gameType:', gameType);
			startNewGame();
		}
	}
	
	// Helper function to get expected rules class name
	function getExpectedRulesClass(gameType) {
		switch (gameType) {
			case 'klondike': return 'KlondikeRules';
			case 'freecell': return 'FreeCellRules';
			case 'fortunes-foundation': return 'FortunesFoundationRules';
			case 'sawayama': return 'SawayamaRules';
			default: return 'KlondikeRules';
		}
	}
	
	// Initialize deck config based on game type
	function updateDeckConfig() {
		if (gameType === 'fortunes-foundation') {
			deckConfig.update(config => ({
				...config,
				suits: ['wands', 'cups', 'swords', 'pentacles', 'major'],
				ranks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
				deckSize: 74
			}));
		} else {
			deckConfig.update(config => ({
				...config,
				suits: ['spades', 'hearts', 'diamonds', 'clubs'],
				ranks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
				deckSize: 52
			}));
		}
	}
	
	onMount(() => {
		// Initialize debug values from environment
		if (import.meta.env.DEV) {
			showDebugInfo = true;
			showValidMoves = true;
			showSolvabilityInfo = true;
			showCardNotation = true;
		}
		
		console.log('GameBoard onMount called with gameType:', gameType);
		
		updateDeckConfig();
		
		// Start the game automatically - but only if we have a valid gameType
		if (gameType) {
			console.log('Starting new game for:', gameType);
			// Use setTimeout to ensure this runs after the component is fully mounted
			setTimeout(() => {
				startNewGame();
			}, 0);
		} else {
			console.log('No gameType provided, skipping game start');
		}
		
		// Add global keyboard event listener
		const handleKeyDown = (event) => {
			// Only handle keyboard shortcuts when game is active and no input fields are focused
			if (!gameStarted || !game || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
				return;
			}
			
			// Number keys for tableau pile selection
			if (event.key >= '0' && event.key <= '9') {
				event.preventDefault();
				selectTableauPileByKey(parseInt(event.key));
			}
			// Q key for 10th tableau pile (index 9)
			else if (event.key.toLowerCase() === 'q') {
				event.preventDefault();
				selectTableauPileByKey(10);
			}
			// W key for 11th tableau pile (index 10)
			else if (event.key.toLowerCase() === 'w') {
				event.preventDefault();
				selectTableauPileByKey(11);
			}
			// E key for 12th tableau pile (index 11)
			else if (event.key.toLowerCase() === 'e') {
				event.preventDefault();
				selectTableauPileByKey(12);
			}
			// R key for 13th tableau pile (index 12)
			else if (event.key.toLowerCase() === 'r') {
				event.preventDefault();
				selectTableauPileByKey(13);
			}
			// Spacebar for auto-complete
			else if (event.key === ' ') {
				event.preventDefault();
				handleAutoComplete();
			}
		};
		
		document.addEventListener('keydown', handleKeyDown);
		// Cleanup function
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});
	
	function startNewGame() {
		console.log('startNewGame called with gameType:', gameType);
		
		// Create a new game with the selected game type
		let deck, gameRules;
		
		if (gameType === 'freecell') {
			console.log('Creating FreeCell game');
			deck = new StandardDeck();
			gameRules = new FreeCellRules(deck);
		} else if (gameType === 'fortunes-foundation') {
			console.log('Creating Fortune\'s Foundation game');
			deck = new TarotDeck();
			gameRules = new FortunesFoundationRules(deck);
		} else if (gameType === 'sawayama') {
			console.log('Creating Sawayama game');
			deck = new StandardDeck();
			gameRules = new SawayamaRules(deck);
		} else {
			console.log('Creating Klondike game (default)');
			// Default to Klondike
			deck = new StandardDeck();
			gameRules = new KlondikeRules(deck);
		}
		
		console.log('Created deck:', deck.constructor.name);
		console.log('Created gameRules:', gameRules.constructor.name);
		
		game = new Game(deck, gameRules);
		console.log('Game created with rules:', game.gameRules.constructor.name);
		game.startNewGame();
		console.log('Game started, piles created:', game.piles.length);
		selectedCard = null;
		validTargets = []; // Clear valid targets when starting new game
		
		// Update the game state store
		gameState.update(state => ({
			...state,
			gameStarted: true,
			currentDeck: deck,
			gameRules: gameRules,
			piles: [...game.piles],
			score: game.score,
			moves: [...game.moves],
			gameWon: false, // Ensure win state is cleared
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
	
	function handleCardDoubleClick(event) {
		event.stopPropagation();
		const { card } = event.detail;
		
		if (shouldLogToConsole()) {
			console.log('Card double-clicked:', card ? card.getShortDisplay() : 'none');
		}
		
		// Only handle T cards (top cards that can be moved)
		if (!card || !game) return;
		
		const sourcePile = game.findCardPile(card);
		if (!sourcePile) return;
		
		// Check if this is a T card (top card of its pile)
		const isTopCard = sourcePile.getTopCard() === card;
		if (!isTopCard) {
			if (shouldLogToConsole()) {
				console.log('Double-click ignored - not a T card');
			}
			return;
		}
		
		// Find foundation piles that can accept this card
		const foundationPiles = game.piles.filter(p => p.type === 'foundation');
		let targetFoundation = null;
		
		for (const foundation of foundationPiles) {
			if (game.isValidMove(card, foundation)) {
				targetFoundation = foundation;
				break;
			}
		}
		
		if (targetFoundation) {
			if (shouldLogToConsole()) {
				console.log('Double-click: Moving T card', card.getShortDisplay(), 'to foundation pile', targetFoundation.index);
			}
			
			// Make the move
			try {
				const moveResult = game.makeMove(card, targetFoundation);
				if (moveResult) {
					// Clear selection and update store
					selectedCard = null;
					validTargets = [];
					
					gameState.update(state => ({
						...state,
						piles: [...game.piles],
						score: game.score,
						moves: [...game.moves],
						gameWon: game.gameWon,
						lastUpdate: Date.now()
					}));
					
					if (shouldLogToConsole()) {
						console.log('Double-click move completed successfully');
					}
				}
			} catch (error) {
				if (shouldLogToConsole()) {
					console.error('Error during double-click move:', error);
				}
			}
		} else {
			if (shouldLogToConsole()) {
				console.log('Double-click: No valid foundation move available for', card.getShortDisplay());
			}
		}
	}
	
	function selectTableauPileByKey(keyNumber) {
		if (!game) return;
		
		// Convert key number to pile index (0-9 for keys 0-9, 10+ for q,w,e,r)
		let pileIndex;
		if (keyNumber === 0) {
			pileIndex = 9; // 0 key selects 10th pile (index 9)
		} else if (keyNumber >= 1 && keyNumber <= 9) {
			pileIndex = keyNumber - 1; // 1-9 keys select piles 0-8
		} else if (keyNumber === 10) {
			pileIndex = 9; // Q key selects 10th pile (index 9)
		} else if (keyNumber === 11) {
			pileIndex = 10; // W key selects 11th pile (index 10)
		} else if (keyNumber === 12) {
			pileIndex = 11; // E key selects 12th pile (index 11)
		} else if (keyNumber === 13) {
			pileIndex = 12; // R key selects 13th pile (index 12)
		} else {
			return; // Invalid key number
		}
		
		// Find the tableau pile at this index
		const tableauPile = game.piles.find(p => p.type === 'tableau' && p.index === pileIndex);
		if (!tableauPile || tableauPile.isEmpty()) {
			if (shouldLogToConsole()) {
				console.log(`No tableau pile at index ${pileIndex} or pile is empty`);
			}
			return;
		}
		
		// Get the top card of the pile
		const topCard = tableauPile.getTopCard();
		if (!topCard || !topCard.isFaceUp) {
			if (shouldLogToConsole()) {
				console.log(`No face-up top card in tableau pile ${pileIndex}`);
			}
			return;
		}
		
		// Select the top card
		selectedCard = topCard;
		validTargets = game.gameRules.getValidTargets(topCard, game);
		
		if (shouldLogToConsole()) {
			console.log(`Selected tableau pile ${pileIndex} (${keyNumber === 0 ? '0 key' : keyNumber <= 9 ? keyNumber + ' key' : ['q', 'w', 'e', 'r'][keyNumber - 10] + ' key'}):`, topCard.getShortDisplay());
		}
	}
	
	function handleAutoComplete() {
		if (!game) return;
		
		if (shouldLogToConsole()) {
			console.log('Auto-complete triggered by spacebar');
		}
		
		// Check if all cards are accessible (T or S) and no cards are face down or in stock
		const allCardsAccessible = game.piles.every(pile => {
			if (pile.type === 'stock') {
				// Stock should be empty
				return pile.isEmpty();
			}
			
			// All cards in other piles should be face up
			return pile.cards.every(card => card.isFaceUp);
		});
		
		if (!allCardsAccessible) {
			if (shouldLogToConsole()) {
				console.log('Auto-complete: Not all cards are accessible');
			}
			return;
		}
		
		// Check if there are any valid moves to foundation
		let movesMade = 0;
		let hasValidMoves = true;
		
		while (hasValidMoves) {
			hasValidMoves = false;
			
			// Find all T cards that can be moved to foundation
			for (const pile of game.piles) {
				if (pile.type === 'stock' || pile.isEmpty()) continue;
				
				const topCard = pile.getTopCard();
				if (!topCard || !topCard.isFaceUp) continue;
				
				// Check if this card can be moved to any foundation pile
				const foundationPiles = game.piles.filter(p => p.type === 'foundation');
				for (const foundation of foundationPiles) {
					if (game.isValidMove(topCard, foundation)) {
						// Make the move
						try {
							const moveResult = game.makeMove(topCard, foundation);
							if (moveResult) {
								movesMade++;
								hasValidMoves = true;
								
								if (shouldLogToConsole()) {
									console.log(`Auto-complete: Moved ${topCard.getShortDisplay()} to foundation pile ${foundation.index}`);
								}
								
								// Update store after each move
								gameState.update(state => ({
									...state,
									piles: [...game.piles],
									score: game.score,
									moves: [...game.moves],
									gameWon: game.gameWon,
									lastUpdate: Date.now()
								}));
								
								break; // Move to next pile
							}
						} catch (error) {
							if (shouldLogToConsole()) {
								console.error('Error during auto-complete move:', error);
							}
						}
					}
				}
			}
		}
		
		// Clear selection after auto-complete
		selectedCard = null;
		validTargets = [];
		
		if (shouldLogToConsole()) {
			console.log(`Auto-complete completed: ${movesMade} moves made`);
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
				piles: game.piles,
				gameWon: game.gameWon // Update win state after drawing from stock
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
				gameWon: game.gameWon, // Update win state after undo
				lastUpdate: Date.now() // Force reactivity
			}));
		}
	}
	
	function resetGame() {
		showNewGameConfirmation = true;
	}
	
	function confirmNewGame() {
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
		showNewGameConfirmation = false;
		// Start a new game immediately after reset
		startNewGame();
	}
	
	function cancelNewGame() {
		showNewGameConfirmation = false;
	}
</script>

<div class="game-board">
	{#if gameStarted}
		<div class="game-layout">
						<!-- Foundation and Free Cells area (top) - for games with free cells -->
			{#if game && game.gameRules && ((game.gameRules.getFreeCellCount && game.gameRules.getFreeCellCount() > 0) || (game.gameRules.getPileConfiguration && game.gameRules.getPileConfiguration().freecell?.create))}
				<div class="foundation-freecell-area">
					<!-- Foundation area (left) -->
					<div class="foundation-area">
						<div class="area-header">
							<h3>Foundation</h3>
						</div>
						
						{#if gameType === 'fortunes-foundation'}
							<!-- Minor Arcana foundations (top row) -->
							<div class="foundation-row minor-arcana">
								{#each $gameState.piles.filter(p => p.type === 'foundation' && p.index < 4) as pile, i}
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
												showCardNotation={showCardNotation}
												gameRules={game ? game.gameRules : null}
												on:click={handleCardClick}
												on:dblclick={handleCardDoubleClick}
											/>
										{/if}

										<!-- Generalized blocking overlay for foundation piles -->
										{#if game && game.gameRules}
											{@const blockingStatus = game.gameRules.getBlockingStatusForPile(pile, $gameState)}
											{#if blockingStatus.isBlocked}
												<div class="foundation-lock-overlay">
													<div class="lock-icon">{blockingStatus.icon}</div>
													<div class="lock-text">Blocked</div>
													<div class="lock-tooltip">
														<div class="tooltip-content">
															<strong>Foundation Blocked</strong><br>
															{blockingStatus.description}
														</div>
													</div>
												</div>
											{/if}
										{/if}
									</div>
								{/each}

							</div>							<!-- Major Arcana foundations (bottom row) -->
							<div class="foundation-row major-arcana">
								{#each $gameState.piles.filter(p => p.type === 'foundation' && p.index >= 4) as pile, pileIndex}
									<div 
										class="foundation-pile pile major-arcana-pile {shouldHighlightValidMoves() && selectedCard && validTargets.includes(pile) ? 'valid-target' : ''}" 
										role="button"
										tabindex="0"
										on:click={() => handlePileClick(pile)}
										on:keydown={(e) => e.key === 'Enter' && handlePileClick(pile)}
									>
										{#if pile.isEmpty()}
											<div class="pile-placeholder">+</div>
										{:else}
											<!-- Show all cards in the pile with spreading effect -->
											{#each pile.cards as card, cardIndex}
												{@const isStacked = cardIndex < (pile.cards.length - 1)}
																							<div class="major-arcana-card" 
												 style="left: {pile.index === 4 ? card.rank * 15 : (240 - (21 - card.rank) * 15)}px; z-index: {cardIndex};">
													<Card 
														card={card}
														isSelected={selectedCard === card}
														showDebugInfo={showDebugInfo}
														showCardNotation={showCardNotation}
														gameRules={game ? game.gameRules : null}
														on:click={handleCardClick}
														on:dblclick={handleCardDoubleClick}
													/>
												</div>
											{/each}
										{/if}

										<!-- Generalized blocking overlay for major arcana foundation piles -->
										{#if game && game.gameRules}
											{@const blockingStatus = game.gameRules.getBlockingStatusForPile(pile, $gameState)}
											{#if blockingStatus.isBlocked}
												<div class="foundation-lock-overlay">
													<div class="lock-icon">{blockingStatus.icon}</div>
													<div class="lock-text">Blocked</div>
													<div class="lock-tooltip">
														<div class="tooltip-content">
															<strong>Foundation Blocked</strong><br>
															{blockingStatus.description}
														</div>
													</div>
												</div>
											{/if}
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<!-- FreeCell foundations (single row) -->
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
												showCardNotation={showCardNotation}
												gameRules={game ? game.gameRules : null}
												on:click={handleCardClick}
												on:dblclick={handleCardDoubleClick}
											/>
										{/if}

										<!-- Generalized blocking overlay for foundation piles -->
										{#if game && game.gameRules}
											{@const blockingStatus = game.gameRules.getBlockingStatusForPile(pile, $gameState)}
											{#if blockingStatus.isBlocked}
												<div class="foundation-lock-overlay">
													<div class="lock-icon">{blockingStatus.icon}</div>
													<div class="lock-text">Blocked</div>
													<div class="lock-tooltip">
														<div class="tooltip-content">
															<strong>Foundation Blocked</strong><br>
															{blockingStatus.description}
														</div>
													</div>
												</div>
											{/if}
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
					
					<!-- Free Cell area (right) -->
					<div class="freecell-area">
						<div class="area-header">
							<h3>{$gameState.piles.filter(p => p.type === 'freecell').length > 1 ? 'Free Cells' : 'Free Cell'}</h3>
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
											showCardNotation={showCardNotation}
											gameRules={game ? game.gameRules : null}
											sourcePile={pile}
											cardIndex={pile.cards.length - 1}
											gameState={$gameState}
											on:click={handleCardClick}
											on:dblclick={handleCardDoubleClick}
										/>
									{/if}

									<!-- Generalized blocking overlay for free cells -->
									{#if game && game.gameRules}
										{@const blockingStatus = game.gameRules.getBlockingStatusForPile(pile, $gameState)}
										{#if blockingStatus.isBlocked}
											<div class="foundation-lock-overlay">
												<div class="lock-icon">{blockingStatus.icon}</div>
												<div class="lock-text">Blocked</div>
												<div class="lock-tooltip">
													<div class="tooltip-content">
														<strong>Free Cell Blocked</strong><br>
														{blockingStatus.description}
													</div>
												</div>
											</div>
										{/if}
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
									showCardNotation={showCardNotation}
									gameRules={game ? game.gameRules : null}
									on:click={handleCardClick}
									on:dblclick={handleCardDoubleClick}
								/>
								{/if}

								<!-- Generalized blocking overlay for foundation piles -->
								{#if game && game.gameRules}
									{@const blockingStatus = game.gameRules.getBlockingStatusForPile(pile, $gameState)}
									{#if blockingStatus.isBlocked}
										<div class="foundation-lock-overlay">
											<div class="lock-icon">{blockingStatus.icon}</div>
											<div class="lock-text">Blocked</div>
											<div class="lock-tooltip">
												<div class="tooltip-content">
													<strong>Foundation Blocked</strong><br>
													{blockingStatus.description}
												</div>
											</div>
										</div>
									{/if}
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
											stackType={isStacked ? 'horizontal' : 'vertical'}
											showDebugInfo={showDebugInfo}
											showCardNotation={showCardNotation}
											gameRules={game ? game.gameRules : null}
											sourcePile={pile}
											cardIndex={cardIndex}
											gameState={$gameState}
											on:click={handleCardClick}
											on:dblclick={handleCardDoubleClick}
										/>
									</div>
								{/each}
							{/if}
						</div>
					{/each}
				</div>
			</div>
			
			<!-- Stock and waste area (bottom) - for games with stock and waste piles -->
			{#if game && game.gameRules && game.gameRules.getPileConfiguration && game.gameRules.getPileConfiguration().stock?.create}
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
										stackType={isStacked ? 'vertical' : 'vertical'}
										showDebugInfo={showDebugInfo}
										showCardNotation={showCardNotation}
										gameRules={game ? game.gameRules : null}
										on:click={handleCardClick}
										on:dblclick={handleCardDoubleClick}
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
				<p>You've won {gameType === 'freecell' ? 'FreeCell' : gameType === 'fortunes-foundation' ? "Fortune's Foundation" : 'Klondike'} Solitaire!</p>
				<p>Final Score: {$gameState.score}</p>
				<button class="control-button" on:click={confirmNewGame}>
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
				
				{#if showDebugInfo}
					<div class="nested-debug-controls">
						<label class="debug-toggle nested">
							<input type="checkbox" bind:checked={showValidMoves}>
							Highlight Valid Moves
						</label>
						<label class="debug-toggle nested">
							<input type="checkbox" bind:checked={showSolvabilityInfo}>
							Show Solvability Info
						</label>
						<label class="debug-toggle nested">
							<input type="checkbox" bind:checked={showCardNotation}>
							Show Card Notation
						</label>
					</div>
				{/if}
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
						{$gameState.piles.filter(p => p.type === 'foundation').reduce((sum, p) => sum + p.getCardCount(), 0)}/{gameType === 'fortunes-foundation' ? '74' : '52'} foundation
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
				{#if showDebugInfo && showSolvabilityInfo && gameType === 'freecell'}
					<div class="status-line">
						<span class="status-label">Winnable:</span>
						<span class="status-value {isPositionWinnable ? 'winnable' : 'unwinnable'}">
							{isPositionWinnable ? 'Yes' : 'No'}
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
			<div class="score">
				Score: {game ? game.score : 0}
				{#if showDebugInfo && game && game.gameRules && game.score >= game.gameRules.getMaximumScore() * 0.9}
					<span class="score-warning" title="Score approaching maximum - possible infinite loop detected!">
						⚠️
					</span>
				{/if}
			</div>
		<!-- New Game Confirmation Dialog -->
		{#if showNewGameConfirmation}
			<div class="confirmation-overlay">
				<div class="confirmation-dialog">
					<h3>Start New Game?</h3>
					<p>This will end the current deal. Are you sure you want to start a new game?</p>
					<div class="confirmation-buttons">
						<button class="control-button cancel" on:click={cancelNewGame}>
							Cancel
						</button>
						<button class="control-button confirm" on:click={confirmNewGame}>
							Start New Game
						</button>
					</div>
				</div>
			</div>
		{/if}
		</div> <!-- Close game-layout -->
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
	
	/* Two-row foundation layout for Fortune's Foundation */
	.foundation-row {
		display: flex !important; /* Override any grid display */
		justify-content: center;
		gap: 10px;
		margin-bottom: 15px;
		flex-direction: row;
		flex-wrap: nowrap;
	}
	
	/* Override the general grid rule specifically for foundation rows */
	.foundation-area .foundation-row {
		display: flex !important;
	}
	
	/* Most specific override for the exact structure */
	.foundation-freecell-area .foundation-area .foundation-row {
		display: flex !important;
		grid: none !important;
		grid-template-columns: none !important;
		grid-template-rows: none !important;
	}
	
	/* Override for the specific foundation rows */
	.foundation-freecell-area .foundation-area .foundation-row.minor-arcana,
	.foundation-freecell-area .foundation-area .foundation-row.major-arcana {
		display: flex !important;
		grid: none !important;
	}
	
	/* Force flexbox properties */
	.foundation-freecell-area .foundation-area .foundation-row {
		flex-direction: row !important;
		flex-wrap: nowrap !important;
		align-items: flex-start !important;
		justify-content: center !important;
	}
	
	/* Override grid display on foundation-area itself */
	.foundation-freecell-area .foundation-area {
		display: flex !important;
		flex-direction: column !important;
		grid: none !important;
		grid-template: none !important;
		grid-template-columns: none !important;
		grid-template-rows: none !important;
		overflow: visible !important;
	}
	
	/* Fix Foundation area header to be horizontal like other areas */
	.foundation-freecell-area .foundation-area .area-header {
		writing-mode: horizontal-tb !important;
		transform: none !important;
		width: auto !important;
	}
	
	.foundation-freecell-area .foundation-area .area-header h3 {
		writing-mode: horizontal-tb !important;
		transform: none !important;
		text-align: center !important;
	}
	
	.foundation-row:last-child {
		margin-bottom: 0;
	}
	
	/* Minor Arcana foundations (top row) */
	.foundation-row.minor-arcana {
		justify-content: center;
		gap: 15px;
	}
	
	/* Foundation lock overlay when free cell is occupied */
	.foundation-lock-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(128, 128, 128, 0.7); /* Translucent gray */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		backdrop-filter: blur(2px);
		z-index: 10;
		pointer-events: auto; /* Allow hover events for tooltip */
	}
	
	.foundation-lock-overlay .lock-icon {
		font-size: 24px;
		margin-bottom: 4px;
		opacity: 0.9;
	}
	
	.foundation-lock-overlay .lock-text {
		font-size: 12px;
		font-weight: 600;
		color: #333;
		text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
	}
	
	/* Enhanced tooltip */
	.foundation-lock-overlay .lock-tooltip {
		position: absolute;
		bottom: -10px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.9);
		color: white;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 11px;
		line-height: 1.3;
		max-width: min(280px, calc(100vw - 40px)); /* Responsive width that stays on screen */
		white-space: normal; /* Allow text to wrap */
		text-align: center;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		z-index: 20;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		/* Ensure tooltip stays on screen */
		word-wrap: break-word;
		overflow-wrap: break-word;
	}
	
	/* Show tooltip on hover */
	.foundation-lock-overlay:hover .lock-tooltip {
		opacity: 1;
	}
	
	/* Responsive adjustments for smaller screens */
	@media (max-width: 768px) {
		.foundation-lock-overlay .lock-tooltip {
			max-width: 240px;
			font-size: 10px;
			padding: 6px 10px;
		}
	}
	
	@media (max-width: 480px) {
		.foundation-lock-overlay .lock-tooltip {
			max-width: 200px;
			font-size: 9px;
			padding: 5px 8px;
		}
	}
	

	
	/* Tooltip arrow */
	.foundation-lock-overlay .lock-tooltip::before {
		content: '';
		position: absolute;
		top: -6px;
		left: 50%;
		transform: translateX(-50%);
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-bottom: 6px solid rgba(0, 0, 0, 0.9);
	}
	
	/* Tooltip content styling */
	.foundation-lock-overlay .tooltip-content {
		text-align: center;
	}
	
	.foundation-lock-overlay .tooltip-content strong {
		color: #ffd700;
		font-weight: 700;
	}
	
	/* Major Arcana foundations (bottom row) */
	.foundation-row.major-arcana {
		justify-content: space-between;
		max-width: 800px; /* Wider to accommodate spreading */
		margin: 0 auto;
	}
	

	
	.major-arcana-pile {
		position: relative;
		min-width: 300px; /* Wide enough for spreading */
		overflow: visible;
	}
	
	.major-arcana-card {
		position: absolute;
		top: 0;
		transition: all 0.2s ease;
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
		max-width: min(100%, 900px); /* Increased to accommodate 11 tableau piles */
		margin: 0 auto;
		gap: clamp(3px, 0.5vw, 8px); /* Reduced gap to align with Foundation piles */
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
		position: relative; /* For positioning overlays */
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
	
	/* Confirmation Dialog Styles */
	.confirmation-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(5px);
	}
	
	.confirmation-dialog {
		background: white;
		border-radius: 12px;
		padding: 30px;
		max-width: 400px;
		text-align: center;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
		position: relative;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	
	.confirmation-dialog h3 {
		margin: 0 0 15px 0;
		color: #333;
		font-size: 1.5rem;
	}
	
	.confirmation-dialog p {
		margin: 0 0 25px 0;
		color: #666;
		line-height: 1.5;
	}
	
	.confirmation-buttons {
		display: flex;
		gap: 15px;
		justify-content: center;
	}
	
	.confirmation-buttons .control-button {
		min-width: 120px;
	}
	
	.confirmation-buttons .cancel {
		background: #6c757d;
	}
	
	.confirmation-buttons .cancel:hover {
		background: #5a6268;
	}
	
	.confirmation-buttons .confirm {
		background: #dc3545;
	}
	
	.confirmation-buttons .confirm:hover {
		background: #c82333;
	}
	
	.score {
		color: white;
		font-size: 1.1rem;
		font-weight: bold;
		padding: 10px 20px;
		background: rgba(0, 123, 255, 0.3);
		border-radius: 6px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.score-warning {
		color: #ff6b35;
		font-size: 1rem;
		cursor: help;
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

	.nested-debug-controls {
		margin-left: 20px;
		padding-left: 15px;
		border-left: 2px solid rgba(255, 193, 7, 0.3);
		margin-top: 10px;
	}

	.debug-toggle.nested {
		margin-bottom: 8px;
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.8);
	}
	
	.debug-toggle:last-child {
		margin-bottom: 0;
	}
	
	.debug-toggle input[type="checkbox"] {
		width: 18px;
		height: 18px;
		accent-color: #ffc107;
	}



	.winnable {
		color: #4CAF50;
	}

	.unwinnable {
		color: #F44336;
	}
</style>
