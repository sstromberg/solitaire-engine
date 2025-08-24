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

	// Deal initial cards according to game rules
	dealInitialCards() {
		const dealConfig = this.gameRules.getInitialDeal();
		console.log('Deal config:', dealConfig);
		console.log('Available cards:', this.cards.length);
		console.log('Available piles:', this.piles.map(p => ({ type: p.type, index: p.index })));
		
		let cardIndex = 0;
		
		// Deal to tableau piles
		if (dealConfig.tableau) {
			console.log('Dealing to tableau piles...');
			// Klondike-style dealing with face-up/face-down cards
			dealConfig.tableau.forEach((pileConfig, pileIndex) => {
				const tableauPile = this.piles.find(p => p.type === 'tableau' && p.index === pileIndex);
				console.log(`Tableau pile ${pileIndex}:`, tableauPile ? 'found' : 'not found');
				
				pileConfig.forEach((cardConfig, cardPosition) => {
					const card = this.cards[cardIndex++];
					console.log(`Adding card ${cardIndex-1} to tableau ${pileIndex}, faceUp: ${cardConfig.faceUp}`);
					card.isFaceUp = cardConfig.faceUp;
					tableauPile.addCard(card);
				});
			});
		} else if (dealConfig.cardsPerPile) {
			// FreeCell-style dealing - all cards face up
			dealConfig.cardsPerPile.forEach((cardCount, pileIndex) => {
				const tableauPile = this.piles.find(p => p.type === 'tableau' && p.index === pileIndex);
				
				for (let i = 0; i < cardCount; i++) {
					const card = this.cards[cardIndex++];
					card.isFaceUp = true; // All cards face up in FreeCell
					tableauPile.addCard(card);
				}
			});
		}
		
		// Remaining cards go to stock (if stock pile exists)
		if (dealConfig.stockPile > 0) {
			const stockPile = this.piles.find(p => p.type === 'stock');
			console.log('Stock pile found:', !!stockPile);
			console.log('Adding remaining cards to stock, starting from index:', cardIndex);
			while (cardIndex < this.cards.length) {
				const card = this.cards[cardIndex++];
				card.isFaceUp = false;
				stockPile.addCard(card);
			}
		}
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

		// Add move to history
		this.moves.push(move);

		// Check if we need to flip a card
		this.flipTopCardIfNeeded(sourcePile);

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

		// Add move to history
		this.moves.push(move);

		// Check if we need to flip a card
		this.flipTopCardIfNeeded(sourcePile);

		// Check win condition
		this.checkWinCondition();

		console.log('Stack move completed successfully');
		return true;
	}

	// Check if a move is valid
	isValidMove(card, targetPile) {
		return this.gameRules.isValidMove(card, targetPile, this);
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
			console.log('Drawing card from stock...');
			const card = stockPile.removeTopCard();
			card.isFaceUp = stockRules.faceUpOnDraw;
			wastePile.addCard(card);
			console.log('Card drawn and added to waste:', card.getShortDisplay());
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
