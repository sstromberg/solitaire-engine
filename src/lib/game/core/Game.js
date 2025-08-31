import { Pile } from './Pile.js';

export class Game {
	constructor(deckConfig, gameRules) {
		this.deckConfig = deckConfig;
		this.gameRules = gameRules;
		this.piles = [];
		this.cards = [];
		this.score = 0;
		this.moves = [];
		this.gameStarted = false;
		this.gameWon = false;
		this.selectedCard = null;
		this.debugMode = false; // Debug mode flag for score limiting
	}

	// Initialize a new game
	startNewGame() {
		// Create and shuffle the deck
		this.cards = this.deckConfig.createDeck();
		this.shuffleDeck();
		
		// Create piles
		this.createPiles();
		
		// Deal initial cards
		this.dealInitialCards();
		
		// Reset game state
		this.score = 0;
		this.moves = [];
		this.gameStarted = true;
		this.gameWon = false;
		this.selectedCard = null;
	}

	// Shuffle the deck
	shuffleDeck() {
		for (let i = this.cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
	}

	// Create all the piles for the game
	createPiles() {
		this.piles = [];
		
		// Get pile configuration from game rules
		const pileConfig = this.gameRules.getPileConfiguration();
		
		// Create piles based on configuration
		Object.entries(pileConfig).forEach(([pileType, config]) => {
			if (config.create) {
				for (let i = 0; i < config.count; i++) {
					this.piles.push(new Pile(pileType, i));
				}
			}
		});
	}

	// Implement the deal using the dealPattern object for the relevant variant
	dealInitialCards() {
		const dealPattern = this.gameRules.getDealPattern();
		console.log('Deal pattern:', dealPattern);
		console.log('Available cards:', this.cards.length);
		console.log('Available piles:', this.piles.map(p => ({ type: p.type, index: p.index })));
		
		let cardIndex = 0;
		
		// Deal cards based on the deal pattern configuration
		if (dealPattern.type === 'sequential') {
			// Deal cards sequentially to pile types in the specified order
			dealPattern.piles.forEach(pileType => {
				const pileConfig = dealPattern[pileType];
				if (!pileConfig || pileConfig.piles === 0) return;
				
				cardIndex = this.dealToPileType(pileType, pileConfig, cardIndex);
			});
		} else {
			// For other deal types, handle each pile type that has configuration
			Object.keys(dealPattern).forEach(pileType => {
				if (['type', 'piles', 'faceUp', 'distribution'].includes(pileType)) return;
				
				const pileConfig = dealPattern[pileType];
				if (!pileConfig || pileConfig.piles === 0) return;
				
				cardIndex = this.dealToPileType(pileType, pileConfig, cardIndex);
			});
		}
		
		console.log(`Dealt ${cardIndex} cards, ${this.cards.length - cardIndex} remaining`);
		
		// Verify dealing results
		this.verifyDealingResults();
	}
	
	// Verify that dealing worked correctly
	verifyDealingResults() {
		console.log('=== DEALING VERIFICATION ===');
		
		const tableauPiles = this.piles.filter(p => p.type === 'tableau');
		const foundationPiles = this.piles.filter(p => p.type === 'foundation');
		const stockPiles = this.piles.filter(p => p.type === 'stock');
		const wastePiles = this.piles.filter(p => p.type === 'waste');
		const freecellPiles = this.piles.filter(p => p.type === 'freecell');
		
		console.log('Tableau piles:', tableauPiles.map((p, i) => `${i}: ${p.cards.length} cards (top: ${p.getTopCard()?.isFaceUp ? 'face-up' : 'face-down'})`));
		console.log('Foundation piles:', foundationPiles.map((p, i) => `${i}: ${p.cards.length} cards`));
		console.log('Stock piles:', stockPiles.map((p, i) => `${i}: ${p.cards.length} cards`));
		console.log('Waste piles:', wastePiles.map((p, i) => `${i}: ${p.cards.length} cards`));
		console.log('Free cell piles:', freecellPiles.map((p, i) => `${i}: ${p.cards.length} cards`));
		
		const totalCardsInPiles = this.piles.reduce((sum, pile) => sum + pile.cards.length, 0);
		console.log(`Total cards in piles: ${totalCardsInPiles}, Expected: ${this.cards.length}`);
		
		if (totalCardsInPiles !== this.cards.length) {
			console.error('DEALING ERROR: Card count mismatch!');
		} else {
			console.log('DEALING SUCCESS: All cards properly dealt');
		}
		
		console.log('=== END VERIFICATION ===');
	}
	
	// Deal cards to a specific pile type based on configuration
	dealToPileType(pileType, pileConfig, startCardIndex) {
		console.log(`Dealing to ${pileType} piles:`, pileConfig);
		
		const targetPiles = this.piles.filter(p => p.type === pileType);
		let cardIndex = startCardIndex;
		
		// Deal cards to each pile according to the configuration
		for (let pileIndex = 0; pileIndex < pileConfig.piles; pileIndex++) {
			const targetPile = targetPiles[pileIndex];
			if (!targetPile) {
				console.warn(`Pile ${pileType}[${pileIndex}] not found`);
				continue;
			}
			
			const cardsForThisPile = pileConfig.cardsPerPile[pileIndex] || 0;
			const faceUpForThisPile = pileConfig.faceUp[pileIndex] || false;
			const faceUpPositions = pileConfig.faceUpPositions;
			const aceRedirection = pileConfig.aceRedirection;
			
			console.log(`Dealing ${cardsForThisPile} cards to ${pileType}[${pileIndex}], faceUp: ${faceUpForThisPile}`);
			
			let cardsDealtToPile = 0;
			while (cardsDealtToPile < cardsForThisPile) {
				if (cardIndex >= this.cards.length) {
					console.warn('Ran out of cards during dealing');
					return cardIndex;
				}
				
				const card = this.cards[cardIndex++];
				
				// Check for ace redirection (Fortune's Foundation special logic)
				if (aceRedirection && aceRedirection.enabled) {
					if (this.shouldRedirectCard(card, aceRedirection)) {
						const redirectSuccess = this.redirectCardToFoundation(card, aceRedirection);
						if (redirectSuccess) {
							console.log(`Redirected ${card.getShortDisplay()} to foundation`);
							// Don't increment cardsDealtToPile - we'll deal another card to replace it
							continue;
						}
					}
				}
				
				// Determine face-up state for this card
				let isFaceUp = faceUpForThisPile;
				if (faceUpPositions && faceUpPositions.includes('top')) {
					// Special case: only top card in pile is face up
					isFaceUp = (cardsDealtToPile === cardsForThisPile - 1);
				}
				
				card.isFaceUp = isFaceUp;
				targetPile.addCard(card);
				cardsDealtToPile++;
				
				console.log(`Added card ${cardIndex-1} to ${pileType}[${pileIndex}], position ${cardsDealtToPile-1}, faceUp: ${isFaceUp}`);
			}
		}
		
		return cardIndex;
	}
	
	// Check if a card should be redirected based on redirection rules
	shouldRedirectCard(card, redirectionConfig) {
		// Parse the condition string - for now, handle the Fortune's Foundation case
		if (redirectionConfig.condition === 'isMinorArcana() && rank === 1') {
			return card.isMinorArcana() && card.rank === 1;
		}
		return false;
	}
	
	// Redirect a card to the appropriate foundation pile
	redirectCardToFoundation(card, redirectionConfig) {
		if (redirectionConfig.targetPileType !== 'foundation') {
			return false;
		}
		
		const foundationPiles = this.piles.filter(p => p.type === 'foundation');
		const suitMapping = redirectionConfig.suitMapping;
		
		if (suitMapping && suitMapping[card.suit] !== undefined) {
			const foundationIndex = suitMapping[card.suit];
			if (foundationIndex < foundationPiles.length) {
				card.isFaceUp = true;
				foundationPiles[foundationIndex].addCard(card);
				return true;
			}
		}
		
		return false;
	}
	

	// Make a move
	makeMove(card, targetPile) {
		console.log('Game.makeMove called with:', {
			card: card ? card.getShortDisplay() : 'null',
			targetPileType: targetPile.type,
			targetPileIndex: targetPile.index
		});
		
		if (!this.isValidMove(card, targetPile)) {
			console.log('Move validation failed in makeMove');
			return false;
		}

		// Find the source pile
		const sourcePile = this.findCardPile(card);
		if (!sourcePile) {
			console.log('Could not find source pile for card');
			return false;
		}
		
		console.log('Source pile found:', {
			type: sourcePile.type,
			index: sourcePile.index,
			cardCount: sourcePile.cards.length,
			topCard: sourcePile.getTopCard() ? sourcePile.getTopCard().getShortDisplay() : 'none'
		});

		// Get move recording configuration from game rules
		const moveConfig = this.gameRules.getMoveRecordingConfig();
		
		// Record the move based on configuration
		const move = {};
		if (moveConfig.recordCard) move.card = card;
		if (moveConfig.recordFromPile) move.fromPile = sourcePile;
		if (moveConfig.recordToPile) move.toPile = targetPile;
		if (moveConfig.recordTimestamp) move.timestamp = Date.now();

		// Remove card from source pile
		console.log('Removing card from source pile...');
		const removedCard = sourcePile.removeTopCard();
		console.log('Removed card:', removedCard ? removedCard.getShortDisplay() : 'null');
		console.log('Source pile after removal:', {
			cardCount: sourcePile.cards.length,
			topCard: sourcePile.getTopCard() ? sourcePile.getTopCard().getShortDisplay() : 'none'
		});

		// Add card to target pile
		console.log('Adding card to target pile...');
		targetPile.addCard(card);
		console.log('Target pile after addition:', {
			cardCount: targetPile.cards.length,
			topCard: targetPile.getTopCard() ? targetPile.getTopCard().getShortDisplay() : 'null'
		});

		// Update score
		const moveScore = this.gameRules.getMoveScore(card, targetPile, this);
		this.score += moveScore;
		
		// Check for maximum score to prevent infinite loops (only in debug mode)
		if (this.debugMode) {
			const maxScore = this.gameRules.getMaximumScore();
			if (this.score > maxScore) {
				console.error(`Score ${this.score} exceeds maximum ${maxScore} - possible infinite loop detected!`);
				this.score = maxScore; // Cap the score
			}
		}

		// Add move to history
		this.moves.push(move);

		// Check if we need to flip a card and record it
		const flippedCard = this.flipTopCardIfNeededAndRecord(sourcePile);
		if (flippedCard) {
			move.flippedCard = flippedCard;
		}

		// Check win condition
		this.checkWinCondition();

		console.log('Move completed successfully');
		return true;
	}

	// Make a move with a stack of cards
	makeStackMove(card, targetPile, cardStack) {
		console.log('Game.makeStackMove called with:', {
			card: card ? card.getShortDisplay() : 'null',
			targetPileType: targetPile.type,
			targetPileIndex: targetPile.index,
			stackSize: cardStack.length
		});
		
		if (!this.isValidMove(card, targetPile)) {
			console.log('Move validation failed in makeStackMove');
			return false;
		}

		// Find the source pile
		const sourcePile = this.findCardPile(card);
		if (!sourcePile) {
			console.log('Could not find source pile for card');
			return false;
		}
		
		console.log('Source pile found:', {
			type: sourcePile.type,
			index: sourcePile.index,
			cardCount: sourcePile.cards.length,
			topCard: sourcePile.getTopCard() ? sourcePile.getTopCard().getShortDisplay() : 'none'
		});

		// Get move recording configuration from game rules
		const moveConfig = this.gameRules.getMoveRecordingConfig();
		
		// Record the move based on configuration
		const move = {};
		if (moveConfig.recordCards) move.cards = cardStack;
		if (moveConfig.recordFromPile) move.fromPile = sourcePile;
		if (moveConfig.recordToPile) move.toPile = targetPile;
		if (moveConfig.recordTimestamp) move.timestamp = Date.now();

		// Remove all cards in the stack from source pile
		console.log('Removing stack from source pile...');
		for (let i = 0; i < cardStack.length; i++) {
			const removedCard = sourcePile.removeTopCard();
			console.log('Removed card:', removedCard ? removedCard.getShortDisplay() : 'null');
		}
		
		console.log('Source pile after stack removal:', {
			cardCount: sourcePile.cards.length,
			topCard: sourcePile.getTopCard() ? sourcePile.getTopCard().getShortDisplay() : 'none'
		});

		// Add all cards in the stack to target pile
		console.log('Adding stack to target pile...');
		for (const stackCard of cardStack) {
			targetPile.addCard(stackCard);
		}
		
		console.log('Target pile after stack addition:', {
			cardCount: targetPile.cards.length,
			topCard: targetPile.getTopCard() ? targetPile.getTopCard().getShortDisplay() : 'null'
		});

		// Update score (only for the top card)
		const moveScore = this.gameRules.getMoveScore(card, targetPile, this);
		this.score += moveScore;
		
		// Check for maximum score to prevent infinite loops (only in debug mode)
		if (this.debugMode) {
			const maxScore = this.gameRules.getMaximumScore();
			if (this.score > maxScore) {
				console.error(`Score ${this.score} exceeds maximum ${maxScore} - possible infinite loop detected!`);
				this.score = maxScore; // Cap the score
			}
		}

		// Add move to history
		this.moves.push(move);

		// Check if we need to flip a card and record it
		const flippedCard = this.flipTopCardIfNeededAndRecord(sourcePile);
		if (flippedCard) {
			move.flippedCard = flippedCard;
		}

		// Check win condition
		this.checkWinCondition();

		console.log('Stack move completed successfully');
		return true;
	}

	// Check if a move is valid
	isValidMove(card, targetPile) {
		// First check if the card can be moved from its current pile
		const sourcePile = this.findCardPile(card);
		if (!sourcePile) {
			console.log('Cannot find source pile for card');
			return false;
		}
		
		// Check if the card can be moved from its current pile (prevents Foundation → Tableau in Klondike)
		if (!this.gameRules.canCardBeMovedFromPile(card, sourcePile, this)) {
			console.log('Card cannot be moved from its current pile type:', sourcePile.type);
			return false;
		}
		
		// Then check if the move to the target pile is valid
		return this.gameRules.isValidMove(card, targetPile, this);
	}

	// Set debug mode for score limiting
	setDebugMode(enabled) {
		this.debugMode = enabled;
	}

	// Find which pile contains a specific card
	findCardPile(card) {
		console.log('Finding source pile for card:', card ? card.getShortDisplay() : 'null');
		
		const sourcePile = this.piles.find(pile => 
			pile.cards.some(pileCard => pileCard === card)
		);
		
		if (sourcePile) {
			console.log('Source pile found:', {
				type: sourcePile.type,
				index: sourcePile.index,
				cardCount: sourcePile.cards.length
			});
		} else {
			console.log('No source pile found for card');
		}
		
		return sourcePile;
	}

	// Flip the top card of a pile if it's face down
	flipTopCardIfNeeded(pile) {
		// Get card flipping rules from game rules
		const flipRules = this.gameRules.getCardFlippingRules();
		
		// Check if this pile type has flipping rules
		if (!flipRules[pile.type]) {
			return;
		}
		
		const pileRules = flipRules[pile.type];
		
		// Check if we should flip on move
		if (pileRules.flipOnMove && pile.cards.length > 0) {
			const topCard = pile.getTopCard();
			
			// Check the flip condition
			if (pileRules.flipCondition === 'faceDown' && !topCard.isFaceUp) {
				topCard.flip();
			} else if (pileRules.flipCondition === 'always') {
				topCard.flip();
			}
		}
	}
	
	// Flip the top card of a pile if needed and return the flipped card
	flipTopCardIfNeededAndRecord(pile) {
		// Get card flipping rules from game rules
		const flipRules = this.gameRules.getCardFlippingRules();
		
		// Check if this pile type has flipping rules
		if (!flipRules[pile.type]) {
			return null;
		}
		
		const pileRules = flipRules[pile.type];
		
		// Check if we should flip on move
		if (pileRules.flipOnMove && pile.cards.length > 0) {
			const topCard = pile.getTopCard();
			
			// Check the flip condition
			if (pileRules.flipCondition === 'faceDown' && !topCard.isFaceUp) {
				topCard.flip();
				return topCard; // Return the card that was flipped
			} else if (pileRules.flipCondition === 'always') {
				topCard.flip();
				return topCard; // Return the card that was flipped
			}
		}
		
		return null; // No card was flipped
	}

	// Draw a card from stock to waste
	drawFromStock() {
		// Check if this game variant uses stock/waste
		if (!this.gameRules.usesStockWaste()) {
			console.log('This game variant does not use stock/waste piles');
			return;
		}
		
		console.log('drawFromStock called');
		console.log('Available piles:', this.piles.map(p => ({ type: p.type, index: p.index, cardCount: p.cards.length })));
		
		const stockPile = this.piles.find(p => p.type === 'stock');
		console.log('Stock pile found:', stockPile ? 'yes' : 'no');
		
		const wastePile = this.piles.find(p => p.type === 'waste');
		console.log('Waste pile found:', wastePile ? 'yes' : 'no');

		// Safety check - ensure both piles exist
		if (!stockPile || !wastePile) {
			console.error('Stock or waste pile not found:', { stockPile: !!stockPile, wastePile: !!wastePile });
			return;
		}

		// Get stock drawing rules from game rules
		const stockRules = this.gameRules.getStockDrawingRules();

		console.log('Both piles found, proceeding with draw...');
		if (stockPile.isEmpty()) {
			// Check if we should redeal
			if (stockRules.redealWhenEmpty) {
				console.log('Stock is empty, redealing waste to stock...');
				this.redealWasteToStock();
			}
		} else {
			console.log('Drawing card(s) from stock...');
			const cardsToDrawCount = Math.min(stockRules.cardsPerDraw, stockPile.cards.length);
			
			for (let i = 0; i < cardsToDrawCount; i++) {
				const card = stockPile.removeTopCard();
				card.isFaceUp = stockRules.faceUpOnDraw;
				wastePile.addCard(card);
				console.log('Card drawn and added to waste:', card.getShortDisplay());
			}
			
			console.log(`Drew ${cardsToDrawCount} card(s) from stock`);
		}
	}

	// Redeal waste pile back to stock
	redealWasteToStock() {
		// Check if this game variant uses stock/waste
		if (!this.gameRules.usesStockWaste()) {
			console.log('This game variant does not use stock/waste piles');
			return;
		}
		
		const stockPile = this.piles.find(p => p.type === 'stock');
		const wastePile = this.piles.find(p => p.type === 'waste');

		// Safety check - ensure both piles exist
		if (!stockPile || !wastePile) {
			console.error('Stock or waste pile not found in redealWasteToStock:', { stockPile: !!stockPile, wastePile: !!wastePile });
			return;
		}

		// Get stock drawing rules from game rules
		const stockRules = this.gameRules.getStockDrawingRules();

		while (!wastePile.isEmpty()) {
			const card = wastePile.removeTopCard();
			card.isFaceUp = stockRules.faceDownOnRedeal;
			stockPile.addCard(card);
		}

		// Check if we should shuffle on redeal
		if (stockRules.shuffleOnRedeal) {
			stockPile.shuffle();
		}
	}

	// Check if the game is won
	checkWinCondition() {
		this.gameWon = this.gameRules.checkWinCondition(this);
		return this.gameWon;
	}

	// Undo the last move
	undoMove() {
		if (this.moves.length === 0) {
			return false;
		}

		const lastMove = this.moves.pop();
		
		// Handle both single card and stack moves
		if (lastMove.cards) {
			// Stack move - remove all cards from target pile
			for (let i = 0; i < lastMove.cards.length; i++) {
				lastMove.toPile.removeTopCard();
			}
			
			// Add all cards back to source pile
			for (const card of lastMove.cards) {
				lastMove.fromPile.addCard(card);
			}
			
			// Revert score (only for the top card)
			if (lastMove.cards.length > 0) {
				const moveScore = this.gameRules.getMoveScore(lastMove.cards[lastMove.cards.length - 1], lastMove.toPile, this);
				this.score -= moveScore;
			}
		} else if (lastMove.card) {
			// Single card move
			lastMove.toPile.removeTopCard();
			lastMove.fromPile.addCard(lastMove.card);
			
			// Revert score
			const moveScore = this.gameRules.getMoveScore(lastMove.card, lastMove.toPile, this);
			this.score -= moveScore;
		}
		
		// Check if we need to flip a card back
		this.flipTopCardIfNeeded(lastMove.fromPile);
		
		// Revert any card that was flipped during the original move
		if (lastMove.flippedCard) {
			lastMove.flippedCard.flip(); // Flip it back to its original state
		}

		return true;
	}

	// Get the current game state
	getGameState() {
		return {
			cards: this.cards,
			piles: this.piles,
			score: this.score,
			moves: this.moves,
			gameStarted: this.gameStarted,
			gameWon: this.gameWon,
			selectedCard: this.selectedCard
		};
	}

	// Get all valid moves for a card
	getValidMoves(card) {
		return this.gameRules.getValidTargets(card, this);
	}

	// Reset the game
	reset() {
		this.cards = [];
		this.piles = [];
		this.score = 0;
		this.moves = [];
		this.gameStarted = false;
		this.gameWon = false;
		this.selectedCard = null;
	}
}
