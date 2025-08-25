import { GameRules } from '../core/GameRules.js';

export class FortunesFoundationRules extends GameRules {
	constructor(deckConfig) {
		super(deckConfig);
	}
	
	// Override pile configuration for Fortune's Foundation
	getPileConfiguration() {
		return {
			foundation: {
				count: 6, // 4 Minor Arcana + 2 Major Arcana
				create: true
			},
			tableau: {
				count: 11, // 10 with cards + 1 empty at position 5
				create: true
			},
			freecell: {
				count: 1, // Single free cell
				create: true
			},
			stock: {
				count: 0, // No stock pile
				create: false
			},
			waste: {
				count: 0, // No waste pile
				create: false
			}
		};
	}
	
	// Override initial deal pattern with corrected positioning
	getInitialDeal() {
		return {
			type: 'fortunes-foundation',
			tableauPiles: 11,
			emptyPileIndex: 5, // Empty pile at position 5
			tableauCardsPerPile: 7,   // 7 cards per non-empty pile
			stockPile: 0,      // No stock pile
			wastePile: 0       // No waste pile
		};
	}
	
	// Override canCardBeMovedFromPile for Fortune's Foundation
	canCardBeMovedFromPile(card, sourcePile, gameState) {
		// In Fortune's Foundation, cards can be moved from any pile if they're the top card
		const topCard = sourcePile.getTopCard();
		return topCard === card;
	}
	
	// Override getValidTargets for Fortune's Foundation
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
		
		// Check free cell piles (if empty)
		gameState.piles
			.filter(pile => pile.type === 'freecell')
			.forEach(pile => {
				if (pile.isEmpty()) {
					validTargets.push(pile);
				}
			});
		
		return validTargets;
	}
	
	// Override tableau move validation for ascending/descending same suit
	isValidTableauMove(card, targetPile, gameState) {
		if (targetPile.type !== 'tableau') return false;
		
		const topCard = targetPile.getTopCard();
		if (!topCard) return true; // Empty tableau pile
		
		// Must be same suit and consecutive rank
		if (card.suit !== topCard.suit) return false;
		
		const rankDiff = Math.abs(card.rank - topCard.rank);
		return rankDiff === 1; // Consecutive (ascending or descending)
	}
	
	// Override foundation move validation
	isValidFoundationMove(card, targetPile, gameState) {
		if (targetPile.type !== 'foundation') return false;
		
		const pileIndex = targetPile.index;
		
		if (pileIndex < 4) {
			// Minor Arcana foundations (0-3)
			if (!card.isMinorArcana()) return false;
			
			// Check if free cell is blocking
			if (this.isFreeCellBlocking(gameState)) return false;
			
			// Must be ascending from Ace
			const topCard = targetPile.getTopCard();
			if (!topCard) return card.rank === 1; // Only Aces on empty piles
			return card.rank === topCard.rank + 1;
		} else {
			// Major Arcana foundations (4-5)
			if (!card.isMajorArcana()) return false;
			
			const topCard = targetPile.getTopCard();
			if (!topCard) {
				// Empty pile - check starting value
				const startValue = pileIndex === 4 ? 0 : 21;
				return card.rank === startValue;
			}
			
			// Must be consecutive in the right direction
			if (pileIndex === 4) {
				return card.rank === topCard.rank + 1; // Ascending from 0
			} else {
				return card.rank === topCard.rank - 1; // Descending from 21
			}
		}
	}
	
	// Check if free cell is blocking Minor Arcana foundation moves
	isFreeCellBlocking(gameState) {
		const freeCellPiles = gameState.piles.filter(p => p.type === 'freecell');
		return freeCellPiles.some(pile => !pile.isEmpty());
	}
	
	// Override move validation for Fortune's Foundation
	isValidMove(card, targetPile, gameState) {
		console.log('FortunesFoundationRules.isValidMove called with:', {
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

	// Override free cell move validation for Fortune's Foundation
	isValidFreeCellMove(card, targetPile, gameState) {
		console.log('FortunesFoundationRules.isValidFreeCellMove called with:', {
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
	
	// Override stack movement rules for Fortune's Foundation
	canMoveStack(cards, targetPile, gameState) {
		// Fortune's Foundation: If the bottom card can be placed, the entire stack can move
		if (cards.length === 0) return false;
		
		const bottomCard = cards[0];
		return this.isValidTableauMove(bottomCard, targetPile, gameState);
	}

	// Override card notation config for tarot
	getCardNotationConfig() {
		return {
			showStackedIndicator: true,    // Show S/T for stacked vs top cards
			showArcanaInfo: true,          // Show Major Arcana values
			position: 'top-right'
		};
	}
	
	// Get maximum possible score for this variant
	getMaximumScore() {
		// 74 cards × 10 points each for foundation = 740 points
		// Plus some points for tableau moves during play
		return 1000; // Conservative estimate
	}
	
	// Override scoring rules for Fortune's Foundation
	getScoringRules() {
		return {
			foundation: { points: 10, bonus: 0 }, // 10 points for building foundation
			tableau: { points: 1, bonus: 0 },     // 1 point for tableau moves
			freecell: { points: 0, bonus: 0 },    // No points for free cells
			stock: { points: 0, bonus: 0 },       // No stock in Fortune's Foundation
			waste: { points: 0, bonus: 0 }        // No waste in Fortune's Foundation
		};
	}
	
	// Override win conditions for Fortune's Foundation
	getWinConditions() {
		return [
			{
				type: 'foundationComplete',
				pileType: 'foundation',
				required: 'all',
				cardsPerPile: 'variable', // Different piles have different target sizes
				description: 'All foundation piles must be complete'
			}
		];
	}
	
	// Override stock drawing rules (no stock in Fortune's Foundation)
	getStockDrawingRules() {
		return {
			cardsPerDraw: 0, // No drawing in Fortune's Foundation
			redealWhenEmpty: false, // No redealing
			shuffleOnRedeal: false,
			faceUpOnDraw: false,
			faceDownOnRedeal: false
		};
	}
	
	// Override card flipping rules (all cards start face up)
	getCardFlippingRules() {
		return {
			tableau: {
				flipOnEmpty: false, // Don't flip when tableau becomes empty
				flipOnMove: false, // No flipping in Fortune's Foundation
				flipCondition: 'never'
			},
			foundation: {
				flipOnEmpty: false,
				flipOnMove: false,
				flipCondition: 'never'
			}
		};
	}
}
