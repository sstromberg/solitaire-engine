export class GameRules {
	constructor(deckConfig) {
		this.deckConfig = deckConfig;
	}

	// Check if a card can be placed on top of another card
	canStackCards(card, targetCard) {
		throw new Error('canStackCards must be implemented by subclass');
	}

	// Check if a card can be moved to a foundation pile
	isValidFoundationMove(card, targetPile) {
		throw new Error('isValidFoundationMove must be implemented by subclass');
	}

	// Check if a card can be moved to a tableau pile
	isValidTableauMove(card, targetPile) {
		throw new Error('isValidTableauMove must be implemented by subclass');
	}

	// Get all valid targets for a card
	getValidTargets(card, gameState) {
		throw new Error('getValidTargets must be implemented by subclass');
	}

	// Check if the game is won
	checkWinCondition(gameState) {
		// Get win conditions from configuration
		const winConditions = this.getWinConditions();
		
		// Check each win condition
		for (const condition of winConditions) {
			if (!this.checkWinConditionType(condition, gameState)) {
				return false; // If any condition fails, game is not won
			}
		}
		
		return true; // All conditions passed
	}

	// Check a specific win condition type
	checkWinConditionType(condition, gameState) {
		switch (condition.type) {
			case 'foundationComplete':
				return this.checkFoundationComplete(condition, gameState);
			case 'tableauEmpty':
				return this.checkTableauEmpty(condition, gameState);
			case 'allCardsInFoundation':
				return this.checkAllCardsInFoundation(condition, gameState);
			case 'custom':
				return this.checkCustomWinCondition(condition, gameState);
			default:
				console.warn('Unknown win condition type:', condition.type);
				return false;
		}
	}

	// Check if foundation piles are complete
	checkFoundationComplete(condition, gameState) {
		const foundationPiles = gameState.piles.filter(p => p.type === 'foundation');
		const required = condition.required || 'all';
		
		if (required === 'all') {
			return foundationPiles.every(pile => pile.cards.length === condition.cardsPerPile);
		} else if (required === 'any') {
			return foundationPiles.some(pile => pile.cards.length === condition.cardsPerPile);
		}
		
		return false;
	}

	// Check if tableau piles are empty
	checkTableauEmpty(condition, gameState) {
		const tableauPiles = gameState.piles.filter(p => p.type === 'tableau');
		const required = condition.required || 'all';
		
		if (required === 'all') {
			return tableauPiles.every(pile => pile.cards.length === 0);
		} else if (required === 'any') {
			return tableauPiles.some(pile => pile.cards.length === 0);
		}
		
		return false;
	}

	// Check if all cards are in foundation
	checkAllCardsInFoundation(condition, gameState) {
		const totalCards = gameState.cards.length;
		const foundationCards = gameState.piles
			.filter(p => p.type === 'foundation')
			.reduce((sum, pile) => sum + pile.cards.length, 0);
		
		return foundationCards === totalCards;
	}

	// Check custom win condition (to be implemented by subclasses)
	checkCustomWinCondition(condition, gameState) {
		// Subclasses should override this for custom win conditions
		return false;
	}

	// Get win conditions for this game variant
	getWinConditions() {
		return [
			{
				type: 'foundationComplete',
				pileType: 'foundation',
				required: 'all',
				cardsPerPile: 13, // Default: 13 cards per foundation pile (Ace to King)
				description: 'All foundation piles must be complete'
			}
		];
	}

	// Get the number of tableau piles for this game
	getTableauPileCount() {
		return this.deckConfig.getTableauPileCount();
	}

	// Get the number of foundation piles for this game
	getFoundationPileCount() {
		return this.deckConfig.getFoundationPileCount();
	}

	// Get the initial deal configuration
	getInitialDeal() {
		// Get deal pattern from configuration
		const dealPattern = this.getDealPattern();
		
		// Convert deal pattern to initial deal format for backward compatibility
		return this.convertDealPatternToInitialDeal(dealPattern);
	}

	// Get deal pattern for this game variant
	getDealPattern() {
		return {
			type: 'sequential', // 'sequential', 'random', 'pattern'
			piles: ['tableau'], // Which pile types to deal to
			faceUp: [true],     // Face-up state for each pile type
			distribution: 'custom', // 'custom', 'standard', 'even'
			tableau: {
				piles: 7,        // Number of tableau piles
				cardsPerPile: [1, 1, 1, 1, 1, 1, 1], // Cards per pile
				faceUp: [true, true, true, true, true, true, true] // Face-up per pile
			},
			foundation: {
				piles: 4,        // Number of foundation piles
				cardsPerPile: [0, 0, 0, 0], // Cards per pile (usually 0 initially)
				faceUp: [false, false, false, false] // Face-up per pile
			},
			stock: {
				piles: 1,        // Number of stock piles
				cardsPerPile: [24], // Cards per pile (remaining cards)
				faceUp: [false]  // Face-up per pile
			},
			waste: {
				piles: 1,        // Number of waste piles
				cardsPerPile: [0], // Cards per pile (usually 0 initially)
				faceUp: [false]  // Face-up per pile
			},
			freecell: {
				piles: 0,        // Number of free cell piles
				cardsPerPile: [], // Cards per pile
				faceUp: []       // Face-up per pile
			}
		};
	}

	// Convert deal pattern to initial deal format (for backward compatibility)
	convertDealPatternToInitialDeal(dealPattern) {
		const result = {};
		
		// Handle tableau dealing
		if (dealPattern.tableau) {
			if (dealPattern.distribution === 'custom') {
				result.tableau = dealPattern.tableau.cardsPerPile.map((count, index) => ({
					faceUp: dealPattern.tableau.faceUp[index] || false
				}));
			} else if (dealPattern.distribution === 'standard') {
				// Standard Klondike dealing: 7 piles with 1, 1, 1, 1, 1, 1, 1 cards
				result.tableau = Array(dealPattern.tableau.piles).fill().map((_, index) => ({
					faceUp: dealPattern.tableau.faceUp[index] || false
				}));
			} else if (dealPattern.distribution === 'even') {
				// Even distribution across all piles
				const totalCards = this.deckConfig.deckSize;
				const cardsPerPile = Math.floor(totalCards / dealPattern.tableau.piles);
				result.tableau = Array(dealPattern.tableau.piles).fill().map(() => ({
					faceUp: true
				}));
			}
		}
		
		// Handle stock pile
		if (dealPattern.stock) {
			const stockCards = dealPattern.stock.cardsPerPile.reduce((sum, count) => sum + count, 0);
			result.stockPile = stockCards;
		}
		
		// Handle waste pile
		if (dealPattern.waste) {
			const wasteCards = dealPattern.waste.cardsPerPile.reduce((sum, count) => sum + count, 0);
			result.wastePile = wasteCards;
		}
		
		return result;
	}

	// Get game state persistence configuration
	getGameStateConfig() {
		return {
			persistence: {
				enabled: true,           // Whether to save game state
				storage: 'localStorage', // 'localStorage', 'sessionStorage', 'custom'
				key: 'solitaire_game',   // Storage key prefix
				autoSave: true,          // Auto-save after each move
				saveHistory: true,       // Save move history
				saveScore: true,         // Save score
				saveTimestamp: true,     // Save last played timestamp
				maxHistory: 100          // Maximum moves to save
			},
			serialization: {
				includeCards: true,      // Include card data in save
				includePiles: true,      // Include pile structure in save
				includeMoves: true,      // Include move history in save
				includeScore: true,      // Include score in save
				includeMetadata: true,   // Include game metadata in save
				compression: false       // Whether to compress save data
			}
		};
	}

	// Serialize game state for persistence
	serializeGameState(gameState) {
		const config = this.getGameStateConfig();
		const result = {};
		
		if (config.serialization.includeMetadata) {
			result.metadata = {
				gameType: this.name || 'Unknown',
				deckType: this.deckConfig ? this.deckConfig.constructor.name : 'Unknown',
				timestamp: Date.now(),
				version: '1.0.0'
			};
		}
		
		if (config.serialization.includeCards) {
			result.cards = gameState.cards.map(card => ({
				suit: card.suit,
				rank: card.rank,
				isFaceUp: card.isFaceUp,
				isWild: card.isWild
			}));
		}
		
		if (config.serialization.includePiles) {
			result.piles = gameState.piles.map(pile => ({
				type: pile.type,
				index: pile.index,
				cardCount: pile.cards.length,
				topCard: pile.getTopCard() ? {
					suit: pile.getTopCard().suit,
					rank: pile.getTopCard().rank
				} : null
			}));
		}
		
		if (config.serialization.includeMoves && config.persistence.saveHistory) {
			result.moves = gameState.moves.slice(-config.persistence.maxHistory);
		}
		
		if (config.serialization.includeScore && config.persistence.saveScore) {
			result.score = gameState.score;
		}
		
		return result;
	}

	// Deserialize game state from persistence
	deserializeGameState(savedState) {
		// This would be implemented to restore a game from saved state
		// For now, return null to indicate no restoration
		return null;
	}

	// Check if a move is valid (abstract - must be implemented by subclass)
	isValidMove(card, targetPile, gameState) {
		throw new Error('isValidMove must be implemented by subclass');
	}

	// Get the score for a move
	getMoveScore(card, targetPile, gameState) {
		// Get scoring rules from configuration
		const scoringRules = this.getScoringRules();
		const pileType = targetPile.type;
		
		if (scoringRules[pileType]) {
			return scoringRules[pileType].points || 0;
		}
		
		return 0; // Default: no points for unknown pile types
	}

	// Get scoring rules for this game variant
	getScoringRules() {
		return {
			foundation: { points: 10, bonus: 0 }, // Default: 10 points for foundation
			tableau: { points: 1, bonus: 0 },     // Default: 1 point for tableau
			freecell: { points: 0, bonus: 0 },    // Default: no points for free cells
			stock: { points: 0, bonus: 0 },       // Default: no points for stock
			waste: { points: 0, bonus: 0 }        // Default: no points for waste
		};
	}

	// Abstract method: Check if a card can be moved from its current pile
	canCardBeMovedFromPile(card, sourcePile, gameState) {
		throw new Error('canCardBeMovedFromPile must be implemented by subclass');
	}
	


	// Abstract method: Get maximum possible score for this game variant
	getMaximumScore() {
		throw new Error('getMaximumScore must be implemented by subclass');
	}

	// Get debug label configuration for card notation
	getCardNotationConfig() {
		return {
			showStackedIndicator: true,    // Show S/T for stacked vs top cards
			position: 'top-right'          // Where to position the label
		};
	}

	// Get game-specific rules description
	getRulesDescription() {
		return 'Base solitaire rules - implement in subclass';
	}

	// NEW: Get pile configuration for this game variant
	getPileConfiguration() {
		return {
			foundation: {
				count: this.getFoundationPileCount(),
				create: true
			},
			tableau: {
				count: this.getTableauPileCount(),
				create: true
			},
			stock: {
				count: 0, // Default: no stock pile
				create: false
			},
			waste: {
				count: 0, // Default: no waste pile
				create: false
			},
			freecell: {
				count: 0, // Default: no free cell piles
				create: false
			}
		};
	}

	// NEW: Check if this game variant uses stock/waste piles
	usesStockWaste() {
		const dealConfig = this.getInitialDeal();
		return dealConfig.stockPile > 0;
	}

	// NEW: Get stock drawing rules
	getStockDrawingRules() {
		return {
			cardsPerDraw: 1, // Default: draw 1 card at a time
			redealWhenEmpty: true, // Default: redeal waste to stock
			shuffleOnRedeal: true, // Default: shuffle on redeal
			faceUpOnDraw: true, // Default: cards become face up when drawn
			faceDownOnRedeal: true // Default: cards become face down when redealt
		};
	}

	// NEW: Get card flipping rules
	getCardFlippingRules() {
		return {
			tableau: {
				flipOnEmpty: false, // Default: don't flip when tableau becomes empty
				flipOnMove: true, // Default: flip top card when cards are moved
				flipCondition: 'faceDown' // Default: flip only face-down cards
			},
			foundation: {
				flipOnEmpty: false,
				flipOnMove: false,
				flipCondition: 'never'
			},
			stock: {
				flipOnEmpty: false,
				flipOnMove: false,
				flipCondition: 'never'
			}
		};
	}

	// NEW: Get move recording configuration
	getMoveRecordingConfig() {
		return {
			recordCard: true, // Record the card being moved
			recordCards: true, // Record stack moves
			recordFromPile: true, // Record source pile
			recordToPile: true, // Record target pile
			recordTimestamp: true, // Record when move occurred
			recordScore: true, // Record score change
			recordSpecialActions: false // Record special game actions
		};
	}

	// NEW: Get special game actions (if any)
	getSpecialActions() {
		return []; // Default: no special actions
	}

	// NEW: Check if a special action is valid
	isValidSpecialAction(action, gameState) {
		return false; // Default: no special actions
	}

	// NEW: Execute a special game action
	executeSpecialAction(action, gameState) {
		throw new Error('Special actions not supported in this variant');
	}

	// Check if a stack of cards can be moved together (abstract - must be implemented by subclass)
	canMoveStack(cards, targetPile, gameState) {
		throw new Error('canMoveStack must be implemented by subclass');
	}
}
