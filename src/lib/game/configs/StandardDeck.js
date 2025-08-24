import { DeckConfig } from '../core/DeckConfig.js';

export class StandardDeck extends DeckConfig {
	constructor() {
		const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
		const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
		
		super(suits, ranks);
	}

	// Override to provide standard deck-specific methods
	getTableauPileCount() {
		return 7; // Standard Klondike uses 7 tableau piles
	}

	getFoundationPileCount() {
		return 4; // One for each suit
	}

	getInitialDealCount() {
		return 28; // 7+6+5+4+3+2+1 = 28 cards dealt initially
	}

	// Get a description of this deck
	getDescription() {
		return 'Standard 52-card deck with 4 suits (spades, hearts, diamonds, clubs) and ranks Ace through King';
	}

	// Get the name of this deck type
	getName() {
		return 'Standard Deck';
	}
}
