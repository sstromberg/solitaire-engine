import { GameRules } from '../core/GameRules.js';

export class KlondikeRules extends GameRules {
	constructor(deckConfig) {
		super(deckConfig);
	}

	// Klondike-specific tableau pile count
	getTableauPileCount() {
		return 7; // Klondike always has 7 tableau piles
	}

	// Klondike-specific foundation pile count
	getFoundationPileCount() {
		return 4; // One for each suit
	}

	// Create pile configuration for Klondike
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
				count: 1,
				create: true
			},
			waste: {
				count: 1,
				create: true
			},
			freecell: {
				count: 0, // Klondike has no free cell piles
				create: false
			}
		};
	}

	// Create deal pattern for Klondike
	getDealPattern() {
		return {
			type: 'sequential',
			piles: ['tableau', 'foundation', 'stock', 'waste'],
			faceUp: [true, false, false, false],
			distribution: 'custom',
			tableau: {
				piles: 7,
				cardsPerPile: [1, 2, 3, 4, 5, 6, 7],
				faceUp: [true, true, true, true, true, true, true], // Per-pile face-up (for top card only)
				faceUpPositions: ['top'] // Special indicator: only top card in each pile is face up
			},
			foundation: {
				piles: 4,
				cardsPerPile: [0, 0, 0, 0], // No cards initially
				faceUp: [false, false, false, false]
			},
			stock: {
				piles: 1,
				cardsPerPile: [24], // Remaining 24 cards (52 - 28 tableau cards)
				faceUp: [false] // Face down
			},
			waste: {
				piles: 1,
				cardsPerPile: [0], // No cards initially
				faceUp: [false]
			},
			freecell: {
				piles: 0,
				cardsPerPile: [],
				faceUp: []
			}
		};
	}


	// movement rules
	// functions for each pile type, then a switch statement
	canStackCards(card, targetCard) {
		console.log('KlondikeRules.canStackCards called with:', {
			card: card ? card.getShortDisplay() : 'null',
			targetCard: targetCard ? targetCard.getShortDisplay() : 'null'
		});
		
		if (!targetCard || !targetCard.isFaceUp) {
			console.log('Target card is null or face down, returning false');
			return false;
		}
		
		// In Klondike, cards stack in descending order with alternating colors
		const isDescending = card.rank === targetCard.rank - 1;
		const isAlternatingColor = this.getSuitColor(card) !== this.getSuitColor(targetCard);
		
		console.log('Stacking validation details:', {
			cardRank: card.rank,
			targetRank: targetCard.rank,
			isDescending,
			cardSuitColor: this.getSuitColor(card),
			targetSuitColor: this.getSuitColor(targetCard),
			isAlternatingColor
		});
		
		const result = isDescending && isAlternatingColor;
		console.log('canStackCards result:', result);
		return result;
	}

	// Check if a card can be moved to a foundation pile
	isValidFoundationMove(card, targetPile, gameState) {
		console.log('KlondikeRules.isValidFoundationMove called with:', {
			card: card ? card.getShortDisplay() : 'null',
			targetPileType: targetPile.type,
			targetPileIndex: targetPile.index
		});
		
		if (targetPile.type !== 'foundation') {
			console.log('Target pile is not foundation, returning false');
			return false;
		}

		const topCard = targetPile.getTopCard();
		console.log('Top card of foundation pile:', topCard ? topCard.getShortDisplay() : 'none');
		
		if (!topCard) {
			// Empty foundation pile - only aces can be placed
			const result = card.rank === 1;
			console.log('Empty foundation pile, ace check result:', result);
			return result;
		}
		
		// Cards must be same suit and ascending order
		const sameSuit = card.suit === topCard.suit;
		const ascendingOrder = card.rank === topCard.rank + 1;
		const result = sameSuit && ascendingOrder;
		
		console.log('Foundation move validation details:', {
			sameSuit,
			ascendingOrder,
			result
		});
		
		return result;
	}

	// Check if a card can be moved to a tableau pile
	isValidTableauMove(card, targetPile, gameState) {
		console.log('KlondikeRules.isValidTableauMove called with:', {
			card: card ? card.getShortDisplay() : 'null',
			targetPileType: targetPile.type,
			targetPileIndex: targetPile.index
		});
		
		if (targetPile.type !== 'tableau') {
			console.log('Target pile is not tableau, returning false');
			return false;
		}

		const topCard = targetPile.getTopCard();
		console.log('Top card of tableau pile:', topCard ? topCard.getShortDisplay() : 'none');
		
		if (!topCard) {
			// Empty tableau pile - only kings can be placed
			const result = card.rank === 13;
			console.log('Empty tableau pile, king check result:', result);
			return result;
		}
		
		// Cards must be descending order with alternating colors
		const result = this.canStackCards(card, topCard);
		console.log('Tableau move validation result:', result);
		return result;
	}

	// Get all valid targets for a card
	getValidTargets(card, gameState) {
		const validTargets = [];
		
		// Check foundation piles
		gameState.piles
			.filter(pile => pile.type === 'foundation')
			.forEach(pile => {
				if (this.isValidFoundationMove(card, pile, gameState)) {
					validTargets.push(pile);
				}
			});
		
		// Check tableau piles
		gameState.piles
			.filter(pile => pile.type === 'tableau')
			.forEach(pile => {
				if (this.isValidTableauMove(card, pile, gameState)) {
					validTargets.push(pile);
				}
			});
		
		return validTargets;
	}

	// Get win conditions for Klondike
	getWinConditions() {
		return [
			{
				type: 'foundationComplete',
				required: 'all',
				cardsPerPile: 13,
				description: 'All foundation piles must be complete (Ace to King)'
			}
		];
	}

	// Get the score for a move
	getMoveScore(card, targetPile, gameState) {
		if (targetPile.type === 'foundation') {
			return 10; // Points for building foundation
		} else if (targetPile.type === 'tableau') {
			return 1;  // Points for tableau moves
		}
		return 0;
	}

	// Check if a card can be moved from its current pile (prevents Foundation → Tableau in Klondike)
	canCardBeMovedFromPile(card, sourcePile, gameState) {
		// In Klondike, cards cannot be moved from foundation piles to tableau
		if (sourcePile.type === 'foundation') {
			return false;
		}
		
		// Cards can be moved from tableau if they're face up
		// (Stack validation will happen later in canMoveStack)
		if (sourcePile.type === 'tableau') {
			return card.isFaceUp;
		}
		
		// Cards can be moved from stock/waste
		if (sourcePile.type === 'stock' || sourcePile.type === 'waste') {
			const topCard = sourcePile.getTopCard();
			return topCard === card;
		}
		
		return false;
	}

	// Override card notation config for Klondike
	getCardNotationConfig() {
		return {
			showStackedIndicator: true,    // Show S/T for stacked vs top cards
			position: 'top-right'          // Top-right corner
		};
	}


	// Override stock drawing rules for Klondike
	getStockDrawingRules() {
		return {
			cardsPerDraw: 1, // Klondike draws 1 card at a time
			redealWhenEmpty: true, // Klondike redeals waste to stock
			shuffleOnRedeal: true, // Klondike shuffles on redeal
			faceUpOnDraw: true, // Cards become face up when drawn
			faceDownOnRedeal: true // Cards become face down when redealt
		};
	}

	// Override card flipping rules for Klondike
	getCardFlippingRules() {
		return {
			tableau: {
				flipOnEmpty: false, // Don't flip when tableau becomes empty
				flipOnMove: true, // Flip top card when cards are moved
				flipCondition: 'faceDown' // Flip only face-down cards
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

	// Override move validation for Klondike
	isValidMove(card, targetPile, gameState) {
		console.log('KlondikeRules.isValidMove called with:', {
			card: card ? card.getShortDisplay() : 'null',
			targetPileType: targetPile.type,
			targetPileIndex: targetPile.index
		});

		if (targetPile.type === 'foundation') {
			return this.isValidFoundationMove(card, targetPile, gameState);
		} else if (targetPile.type === 'tableau') {
			return this.isValidTableauMove(card, targetPile, gameState);
		}
		
		console.log('Unknown pile type:', targetPile.type);
		return false;
	}

	// Override stack movement rules for Klondike
	canMoveStack(cards, targetPile, gameState) {
		// Klondike: If the bottom card can be placed, the entire stack can move
		// (The stack is already valid by definition - it wouldn't exist if it wasn't)
		if (cards.length === 0) return false;
		
		const bottomCard = cards[0];
		return this.isValidTableauMove(bottomCard, targetPile, gameState);
	}

	// Override scoring rules for Klondike
	getScoringRules() {
		return {
			foundation: { points: 10, bonus: 0 }, // 10 points for building foundation
			tableau: { points: 1, bonus: 0 },     // 1 point for tableau moves
			freecell: { points: 0, bonus: 0 },    // No points for free cells
			stock: { points: 0, bonus: 0 },       // No points for stock
			waste: { points: 0, bonus: 0 }        // No points for waste
		};
	}

	// Get maximum possible score for this game variant (prevents infinite loops)
	getMaximumScore() {
		// In Klondike: 52 cards × 10 points each for foundation = 520 points
		// Plus some points for tableau moves during play
		// Conservative estimate: 1000 points
		return 1000;
	}

	// Override win conditions for Klondike
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

	// Get game-specific rules description
	getRulesDescription() {
		return `Klondike Solitaire Rules:
		• Build foundation piles from Ace (1) to King (13) in the same suit
		• Build tableau piles in descending order with alternating colors
		• Only Kings can be placed on empty tableau piles
		• Only Aces can start foundation piles
		• Draw from stock to waste pile, one card at a time, no recirc`;
	}

	// Helper method to get suit color
	getSuitColor(card) {
		const redSuits = ['hearts', 'diamonds'];
		return redSuits.includes(card.suit) ? 'red' : 'black';
	}
}
