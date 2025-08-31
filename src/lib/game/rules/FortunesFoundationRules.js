import { GameRules } from '../core/GameRules.js';

export class FortunesFoundationRules extends GameRules {
	constructor(deckConfig) {
		super(deckConfig);
	}

	// Configure blocking conditions for Fortune's Foundation
	getBlockingConditions() {
		return {
			// Use custom blocking for foundation piles since we need pile-specific logic
			foundation: [
				{
					type: 'custom',
					name: 'minorArcanaFreeCellBlocking',
					description: 'Minor Arcana foundation moves (piles 0-3) are blocked when free cell is not empty'
				}
			]
		};
	}

	// Custom blocking condition evaluation for Fortune's Foundation
	evaluateCustomBlockingCondition(condition, gameState, targetPile = null) {
		if (condition.name === 'minorArcanaFreeCellBlocking') {
			// Only block foundation piles 0-3 (Minor Arcana)
			if (targetPile && targetPile.type === 'foundation' && targetPile.index < 4) {
				const freeCellPiles = gameState.piles.filter(p => p.type === 'freecell');
				return freeCellPiles.some(pile => !pile.isEmpty());
			}
			return false; // Don't block Major Arcana foundations (indices 4-5)
		}
		
		return super.evaluateCustomBlockingCondition(condition, gameState, targetPile);
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
	
	// Override initial deal pattern with Fortune's Foundation rules
	getDealPattern() {
		return {
			type: 'sequential',
			piles: ['tableau', 'foundation', 'freecell'],
			faceUp: [true, true, true],
			distribution: 'custom',
			tableau: {
				piles: 11,
				cardsPerPile: [7, 7, 7, 7, 7, 0, 7, 7, 7, 7, 7], // Pile 5 (index 5) is empty
				faceUp: [true, true, true, true, true, true, true, true, true, true, true],
				aceRedirection: {
					enabled: true,
					condition: 'isMinorArcana() && rank === 1',
					targetPileType: 'foundation',
					suitMapping: {
						'wands': 0,
						'cups': 1, 
						'swords': 2,
						'pentacles': 3
					}
				}
			},
			foundation: {
				piles: 6, // 4 Minor Arcana + 2 Major Arcana
				cardsPerPile: [0, 0, 0, 0, 0, 0], // Will be populated by ace redirection
				faceUp: [true, true, true, true, true, true]
			},
			freecell: {
				piles: 1,
				cardsPerPile: [0], // Empty initially
				faceUp: [true]
			},
			stock: {
				piles: 0,
				cardsPerPile: [],
				faceUp: []
			},
			waste: {
				piles: 0,
				cardsPerPile: [],
				faceUp: []
			}
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

	// Override foundation move validation using the generalized blocking system
	isValidFoundationMove(card, targetPile, gameState) {
		console.log('FortunesFoundationRules.isValidFoundationMove called with:', {
			card: card ? card.getShortDisplay() : 'null',
			targetPileType: targetPile.type,
			targetPileIndex: targetPile.index
		});
		
		if (targetPile.type !== 'foundation') return false;
		
		const pileIndex = targetPile.index;
		
		if (pileIndex < 4) {
			// Minor Arcana foundations (0-3)
			if (!card.isMinorArcana()) return false;
			
			// Check blocking conditions using the generalized system
			if (this.isPileTypeBlocked('foundation', gameState, targetPile)) {
				console.log('Foundation move blocked by blocking conditions');
				return false;
			}
			
			// Must be ascending from Ace
			const topCard = targetPile.getTopCard();
			if (!topCard) return card.rank === 1; // Only Aces on empty piles
			
			// Must be same suit and next ascending rank
			return card.suit === topCard.suit && card.rank === topCard.rank + 1;
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
		const config = {
			showStackedIndicator: true,    // Show S/T for stacked vs top cards
			showArcanaInfo: true,          // Show Major Arcana values
			position: 'top-right',
			// Custom notation function for Fortune's Foundation
			getNotationLabel: function(card, sourcePile, cardIndex, gameState) {
				if (!card) return '';
				
				const isTopCard = cardIndex === sourcePile.cards.length - 1;
				
				// For all cards (Major and Minor Arcana), use consistent T/S/U notation
				if (isTopCard) {
					return 'T'; // Top card is always moveable
				} else {
					// Check if this card is part of a valid moveable sequence
					// In Fortune's Foundation, cards can only be moved as a stack if they form a valid sequence
					// (same suit, consecutive ranks in either direction)
					
					// Check if this card and all cards above it form a valid sequence
					for (let i = cardIndex; i < sourcePile.cards.length - 1; i++) {
						const currentCard = sourcePile.cards[i];
						const nextCard = sourcePile.cards[i + 1];
						
						// Cards must be same suit and consecutive rank
						if (currentCard.suit !== nextCard.suit) return 'U';
						
						const rankDiff = Math.abs(currentCard.rank - nextCard.rank);
						if (rankDiff !== 1) return 'U';
					}
					
					return 'S'; // Stacked - part of a valid sequence
				}
			}
		};
		
		return config;
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
				type: 'custom',
				description: 'All foundation piles must be complete with correct card counts'
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

	// Override custom win condition check for Fortune's Foundation
	checkCustomWinCondition(condition, gameState) {
		const foundationPiles = gameState.piles.filter(p => p.type === 'foundation');
		
		// Check Minor Arcana foundations (piles 0-3) - should have 13 cards each (Ace through King, no Knights)
		for (let i = 0; i < 4; i++) {
			const pile = foundationPiles.find(p => p.index === i);
			if (!pile || pile.cards.length !== 13) {
				return false;
			}
		}
		
		// Check Major Arcana foundations (piles 4-5) - should have 22 cards total between them
		const majorPile4 = foundationPiles.find(p => p.index === 4);
		const majorPile5 = foundationPiles.find(p => p.index === 5);
		
		if (!majorPile4 || !majorPile5) {
			return false;
		}
		
		const totalMajorArcana = majorPile4.cards.length + majorPile5.cards.length;
		if (totalMajorArcana !== 22) {
			return false;
		}
		
		// All foundation piles are complete
		return true;
	}
}
