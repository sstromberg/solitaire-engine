import { GameRules } from '../core/GameRules.js';

export class SawayamaRules extends GameRules {
	constructor(deckConfig) {
		super(deckConfig);
	}

	// Configure game board and deal cards
	getTableauPileCount() {
		return 7;
	}
	getFoundationPileCount() {
		return 4;
	}
    // there's one free cell, only accessible after the stock is empty
    	getFreeCellCount() {
		return 1;
	}

	// Create pile configuration
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
				count: this.getFreeCellCount(),
				create: true
			}
		};
	}

	// Create deal pattern for Sawayama
	getDealPattern() {
		return {
			type: 'sequential',
			piles: ['tableau', 'foundation', 'stock', 'waste', 'freecell'],
			faceUp: [true, false, false, false],
			distribution: 'custom',
			tableau: {
				piles: 7,
				cardsPerPile: [1, 2, 3, 4, 5, 6, 7],
				faceUp: [true, true, true, true, true, true, true],
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
				piles: 1,
				cardsPerPile: [0],
				faceUp: [false]
			}
		};
	}

	// Override stock drawing rules for Sawayama
	getStockDrawingRules() {
		return {
			cardsPerDraw: 3,
			redealWhenEmpty: false,
			shuffleOnRedeal: false,
			faceUpOnDraw: true, // Cards become face up when drawn
			faceDownOnRedeal: false
		};
	}


	// Card movement rules
	// Check if cards can be stacked on tableau (descending, alternating colors)
	canStackCards(card, targetCard) {
		console.log('SawayamaRules.canStackCards called with:', {
			card: card ? card.getShortDisplay() : 'null',
			targetCard: targetCard ? targetCard.getShortDisplay() : 'null'
		});
	}

    // Create validation rules for each possible move type, then use a Switch-case to check them
	isValidFoundationMove(card, targetPile, gameState) {
		// Foundation piles build up by suit from Ace (1) to King (13)
		if (targetPile.cards.length === 0) {
			// Empty foundation pile - only Ace can be placed
			return card.rank === 1;
		}

		const topCard = targetPile.cards[targetPile.cards.length - 1];
		return card.suit === topCard.suit && card.rank === topCard.rank + 1;
	}

	// standard alternating-colors descending tableau
	isValidTableauMove(card, targetPile, gameState) {
		if (targetPile.cards.length === 0) {
			// Empty tableau pile - any card can be placed -- differs from Klondike
			return true;
		}

		const topCard = targetPile.cards[targetPile.cards.length - 1];
		const cardSuitColor = card.getSuitColor();
		const topCardSuitColor = topCard.getSuitColor();

		return cardSuitColor !== topCardSuitColor && card.rank === topCard.rank - 1;
	}

	// Configure blocking conditions for Sawayama
	getBlockingConditions() {
		return {
			freecell: [
				{
					type: 'pileNotEmpty',
					pileType: 'stock',
					description: 'Free cell is blocked until stock pile is empty'
				}
			]
		};
	}

	// free cell must be empty to put a card into it, and not blocked by stock
	isValidFreeCellMove(card, targetPile, gameState) {
		// Check if freecell moves are blocked by the stock pile
		if (this.isPileTypeBlocked('freecell', gameState, targetPile)) {
			console.log('Free cell move blocked: stock pile is not empty');
			return false;
		}
		
		const result = targetPile.cards.length === 0;
		console.log('Free cell move validation result:', result);
		return result;
	}

	// the switching statement -- checks each pile based on pile type 
	isValidMove(card, targetPile, gameState) {
		console.log('SawayamaRules.isValidMove called with:', {
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

	// when a card is selected, we check every possible destination pile (which can be made visible via debugging)
	getValidTargets(card, gameState) {
		const validTargets = [];

		const foundationPiles = gameState.piles.filter(p => p.type === 'foundation');
		foundationPiles.forEach(pile => {
			if (this.isValidFoundationMove(card, pile, gameState)) {
				validTargets.push(pile);
			}
		});

		const tableauPiles = gameState.piles.filter(p => p.type === 'tableau');
		tableauPiles.forEach(pile => {
			if (this.isValidTableauMove(card, pile, gameState)) {
				validTargets.push(pile);
			}
		});

		const freeCellPiles = gameState.piles.filter(p => p.type === 'freecell');
		freeCellPiles.forEach(pile => {
			if (this.isValidFreeCellMove(card, pile, gameState)) {
				validTargets.push(pile);
			}
		});

		return validTargets;
	}

	// and stacks of cards can be moved together
	canMoveStack(cards, targetPile, gameState) {
		// First check if the target pile can accept the bottom card
		const bottomCard = cards[0];
		if (!this.isValidTableauMove(bottomCard, targetPile, gameState)) {
			return false;
		}
		return true; // If the bottom card can be placed, allow the stack move
	}

	// Check if a card can be moved from its current pile (prevents Foundation → Tableau)
	canCardBeMovedFromPile(card, sourcePile, gameState) {
		// Cards cannot be moved from foundation piles to tableau
		if (sourcePile.type === 'foundation') {
			return false;
		}
		
		// Cards can be moved from tableau (stack validation will happen later in canMoveStack)
		if (sourcePile.type === 'tableau' || sourcePile.type === 'freecell') {
			return true;
		}
		
		// Cards can be moved from stock/waste
		if (sourcePile.type === 'stock' || sourcePile.type === 'waste') {
			const topCard = sourcePile.getTopCard();
			return topCard === card;
		}
		
		return false;
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

	// Override card notation config for FreeCell
	getCardNotationConfig() {
		const self = this; // Capture 'this' reference
		return {
			showStackedIndicator: true,    // Show T/S/U for FreeCell-specific notation
			position: 'top-right',         // Top-right corner
			variant: 'sawayama',           // Indicate this is FreeCell-specific notation
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

	// Win conditions for Sawayama (same as Klondike)
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
}
