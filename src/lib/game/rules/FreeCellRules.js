import { GameRules } from '../core/GameRules.js';

export class FreeCellRules extends GameRules {
	constructor() {
		super();
		this.name = 'FreeCell';
		this.description = 'Strategic solitaire with free cells for temporary card storage';
	}

	/**
	 * Get the number of tableau piles for FreeCell
	 */
	getTableauPileCount() {
		return 8;
	}

	/**
	 * Get the number of foundation piles for FreeCell
	 */
	getFoundationPileCount() {
		return 4;
	}

	/**
	 * Get the number of free cells for FreeCell
	 */
	getFreeCellCount() {
		return 4;
	}

	/**
	 * Check if a move to a foundation pile is valid
	 */
	isValidFoundationMove(card, targetPile, gameState) {
		// Foundation piles build up by suit from Ace (1) to King (13)
		if (targetPile.cards.length === 0) {
			// Empty foundation pile - only Ace can be placed
			return card.rank === 1;
		}

		const topCard = targetPile.cards[targetPile.cards.length - 1];
		return card.suit === topCard.suit && card.rank === topCard.rank + 1;
	}

	/**
	 * Check if a move to a tableau pile is valid
	 */
	isValidTableauMove(card, targetPile, gameState) {
		// Tableau piles build down by alternating colors
		if (targetPile.cards.length === 0) {
			// Empty tableau pile - any card can be placed
			return true;
		}

		const topCard = targetPile.cards[targetPile.cards.length - 1];
		const cardSuitColor = card.getSuitColor();
		const topCardSuitColor = topCard.getSuitColor();

		// Colors must alternate (red/black)
		return cardSuitColor !== topCardSuitColor && card.rank === topCard.rank - 1;
	}

	/**
	 * Check if a move to a free cell is valid
	 */
	isValidFreeCellMove(card, targetPile, gameState) {
		console.log('FreeCellRules.isValidFreeCellMove called with:', {
			card: card ? card.getShortDisplay() : 'null',
			targetPileType: targetPile.type,
			targetPileIndex: targetPile.index,
			targetPileCardCount: targetPile.cards.length
		});
		
		// Free cells can only hold one card at a time
		const result = targetPile.cards.length === 0;
		console.log('FreeCell move validation result:', result);
		return result;
	}

	/**
	 * Main move validation method - overrides base class
	 */
	isValidMove(card, targetPile, gameState) {
		console.log('FreeCellRules.isValidMove called with:', {
			card: card ? card.getShortDisplay() : 'null',
			targetPileType: targetPile.type,
			targetPileIndex: targetPile.index
		});

		switch (targetPile.type) {
			case 'foundation':
				return this.isValidFoundationMove(card, targetPile, gameState);
			case 'tableau':
				return this.isValidTableauMove(card, targetPile, gameState);
			case 'freecell':
				return this.isValidFreeCellMove(card, targetPile, gameState);
			default:
				console.log('Unknown pile type:', targetPile.type);
				return false;
		}
	}

	/**
	 * Get all valid target piles for a card
	 */
	getValidTargets(card, gameState) {
		const validTargets = [];

		// Check foundation piles
		const foundationPiles = gameState.piles.filter(p => p.type === 'foundation');
		foundationPiles.forEach(pile => {
			if (this.isValidFoundationMove(card, pile, gameState)) {
				validTargets.push(pile);
			}
		});

		// Check tableau piles
		const tableauPiles = gameState.piles.filter(p => p.type === 'tableau');
		tableauPiles.forEach(pile => {
			if (this.isValidTableauMove(card, pile, gameState)) {
				validTargets.push(pile);
			}
		});

		// Check free cells
		const freeCellPiles = gameState.piles.filter(p => p.type === 'freecell');
		console.log('FreeCell getValidTargets - found free cell piles:', freeCellPiles.length);
		freeCellPiles.forEach(pile => {
			const isValid = this.isValidFreeCellMove(card, pile, gameState);
			console.log(`FreeCell pile ${pile.index} validation:`, isValid);
			if (isValid) {
				validTargets.push(pile);
			}
		});

		return validTargets;
	}

	/**
	 * Check if the game is won
	 */
	checkWinCondition(gameState) {
		// All foundation piles must be complete (Ace to King of each suit)
		const foundationPiles = gameState.piles.filter(p => p.type === 'foundation');
		
		return foundationPiles.every(pile => {
			// Each foundation pile should have 13 cards (Ace through King)
			return pile.cards.length === 13;
		});
	}

	/**
	 * Get the initial deal configuration for FreeCell
	 */
	getInitialDeal() {
		return {
			tableauPiles: 8,
			cardsPerPile: [7, 7, 7, 7, 6, 6, 6, 6], // 52 cards distributed across 8 piles
			stockPile: 0, // No stock pile in FreeCell
			wastePile: 0  // No waste pile in FreeCell
		};
	}

	/**
	 * Calculate the maximum number of cards that can be moved at once
	 * In FreeCell, this depends on the number of empty free cells and tableau piles
	 */
	getMaxMoveableCards(gameState) {
		const emptyFreeCells = gameState.piles.filter(p => p.type === 'freecell' && p.cards.length === 0).length;
		const emptyTableauPiles = gameState.piles.filter(p => p.type === 'tableau' && p.cards.length === 0).length;
		
		// Formula: (empty free cells + 1) * 2^(empty tableau piles)
		return (emptyFreeCells + 1) * Math.pow(2, emptyTableauPiles);
	}

	/**
	 * Check if a stack of cards can be moved together
	 */
	canMoveStack(cards, targetPile, gameState) {
		// First check if the target pile can accept the bottom card
		const bottomCard = cards[0];
		if (!this.isValidTableauMove(bottomCard, targetPile, gameState)) {
			return false;
		}

		// Then check if we have enough free cells/empty tableau piles to move the stack
		const maxMoveable = this.getMaxMoveableCards(gameState);
		return cards.length <= maxMoveable;
	}

	// Override pile configuration for FreeCell
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
				count: 0, // FreeCell has no stock pile
				create: false
			},
			waste: {
				count: 0, // FreeCell has no waste pile
				create: false
			},
			freecell: {
				count: this.getFreeCellCount(), // FreeCell has free cell piles
				create: true
			}
		};
	}

	// Override stock drawing rules for FreeCell
	getStockDrawingRules() {
		return {
			cardsPerDraw: 0, // FreeCell doesn't draw cards
			redealWhenEmpty: false, // No redealing in FreeCell
			shuffleOnRedeal: false,
			faceUpOnDraw: false,
			faceDownOnRedeal: false
		};
	}

	// Override card flipping rules for FreeCell
	getCardFlippingRules() {
		return {
			tableau: {
				flipOnEmpty: false, // Don't flip when tableau becomes empty
				flipOnMove: false, // No flipping in FreeCell (all cards start face up)
				flipCondition: 'never'
			},
			foundation: {
				flipOnEmpty: false,
				flipOnMove: false,
				flipCondition: 'never'
			}
		};
	}

	// Simple solvability check for FreeCell
	isPositionWinnable(gameState) {
		// Basic check: if any card is completely blocked, position is unwinnable
		const tableauPiles = gameState.piles.filter(p => p.type === 'tableau');
		
		for (const pile of tableauPiles) {
			if (pile.cards.length === 0) continue;
			
			// Check if any card is blocked by cards above it
			for (let i = 0; i < pile.cards.length - 1; i++) {
				const card = pile.cards[i];
				// If this card can't be moved anywhere, position is unwinnable
				if (!this.canCardBeMoved(card, gameState)) {
					return false;
				}
			}
		}
		
		return true; // Position appears winnable
	}
	
	// Helper: get the color of a card (red or black)
	getCardColor(card) {
		const redSuits = ['hearts', 'diamonds'];
		return redSuits.includes(card.suit) ? 'red' : 'black';
	}

	// Helper: check if a card can be moved anywhere
	canCardBeMoved(card, gameState) {
		// Check tableau piles
		const tableauPiles = gameState.piles.filter(p => p.type === 'tableau');
		for (const pile of tableauPiles) {
			if (this.isValidTableauMove(card, pile, gameState)) {
				return true;
			}
		}
		
		// Check foundation piles
		const foundationPiles = gameState.piles.filter(p => p.type === 'foundation');
		for (const pile of foundationPiles) {
			if (this.isValidFoundationMove(card, pile, gameState)) {
				return true;
			}
		}
		
		// Check free cells
		const freeCellPiles = gameState.piles.filter(p => p.type === 'freecell');
		for (const pile of freeCellPiles) {
			if (pile.isEmpty()) {
				return true;
			}
		}
		
		return false;
	}

	// Override scoring rules for FreeCell
	getScoringRules() {
		return {
			foundation: { points: 10, bonus: 0 }, // 10 points for building foundation
			tableau: { points: 1, bonus: 0 },     // 1 point for tableau moves
			freecell: { points: 0, bonus: 0 },    // No points for free cells
			stock: { points: 0, bonus: 0 },       // No stock in FreeCell
			waste: { points: 0, bonus: 0 }        // No waste in FreeCell
		};
	}

	// Get the score for a move
	getMoveScore(card, targetPile, gameState) {
		if (targetPile.type === 'foundation') {
			return 10; // Points for building foundation
		} else if (targetPile.type === 'tableau') {
			return 1;  // Points for tableau moves
		} else if (targetPile.type === 'freecell') {
			return 0;  // No points for moving to free cells
		}
		return 0;
	}

	// Check if a card can be moved from its current pile
	canCardBeMovedFromPile(card, sourcePile, gameState) {
		// In FreeCell, cards can be moved from any pile type
		if (sourcePile.type === 'tableau') {
			// Any face-up card in a tableau pile can be selected
			// The actual move validation happens in isValidMove
			return card.isFaceUp;
		}
		
		// For other pile types, only the top card can be moved
		const topCard = sourcePile.getTopCard();
		return topCard === card;
	}

	// Get maximum possible score for this game variant (prevents infinite loops)
	getMaximumScore() {
		// In FreeCell: 52 cards × 10 points each for foundation = 520 points
		// Plus some points for tableau moves during play
		// Conservative estimate: 1000 points
		return 1000;
	}

	// Override card notation config for FreeCell
	getCardNotationConfig() {
		const self = this; // Capture 'this' reference
		return {
			showStackedIndicator: true,    // Show T/S/U for FreeCell-specific notation
			position: 'top-right',         // Top-right corner
			variant: 'freecell',           // Indicate this is FreeCell-specific notation
			getNotationLabel: function(card, sourcePile, cardIndex, gameState) {
				if (sourcePile.type !== 'tableau') {
					// For non-tableau piles, just show T for top card
					return cardIndex === sourcePile.cards.length - 1 ? 'T' : '';
				}

				// For tableau piles, determine if this card is accessible
				if (cardIndex === sourcePile.cards.length - 1) {
					return 'T'; // Top card is always accessible
				}

				// Check if this card and all cards above it form a valid stack
				for (let i = cardIndex; i < sourcePile.cards.length - 1; i++) {
					const currentCard = sourcePile.cards[i];
					const nextCard = sourcePile.cards[i + 1];
					
					// Cards must be alternating colors and descending order
					const currentColor = self.getCardColor(currentCard);
					const nextColor = self.getCardColor(nextCard);
					if (currentColor === nextColor || nextCard.rank !== currentCard.rank - 1) {
						return 'U'; // Unaccessible - not part of a valid stack
					}
				}
				
				return 'S'; // Stacked - part of a valid stack
			}
		};
	}

	// Override win conditions for FreeCell
	getWinConditions() {
		return [
			{
				type: 'foundationComplete',
				pileType: 'foundation',
				required: 'all',
				cardsPerPile: 13, // Ace through King (13 cards)
				description: 'All foundation piles must be complete (Ace to King)'
			}
		];
	}

	// Override deal pattern for FreeCell
	getDealPattern() {
		return {
			type: 'sequential',
			piles: ['tableau', 'foundation', 'freecell'],
			faceUp: [true, false, false],
			distribution: 'custom',
			tableau: {
				piles: 8,
				cardsPerPile: [7, 7, 7, 7, 6, 6, 6, 6], // 52 cards distributed across 8 piles
				faceUp: [true, true, true, true, true, true, true, true] // All face up
			},
			foundation: {
				piles: 4,
				cardsPerPile: [0, 0, 0, 0], // No cards initially
				faceUp: [false, false, false, false]
			},
			stock: {
				piles: 0, // No stock pile in FreeCell
				cardsPerPile: [],
				faceUp: []
			},
			waste: {
				piles: 0, // No waste pile in FreeCell
				cardsPerPile: [],
				faceUp: []
			},
			freecell: {
				piles: 4,
				cardsPerPile: [0, 0, 0, 0], // No cards initially
				faceUp: [false, false, false, false]
			}
		};
	}
}
