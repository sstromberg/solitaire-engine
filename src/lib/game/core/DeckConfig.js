import { Card } from './Card.js';

export class DeckConfig {
	constructor(suits, ranks, wildCards = [], deckSize = null) {
		this.suits = suits;
		this.ranks = ranks;
		this.wildCards = wildCards;
		this.deckSize = deckSize || (suits.length * ranks.length + wildCards.length);
	}

	// Create a new deck based on this configuration
	createDeck() {
		const cards = [];
		
		// Add regular suit cards
		for (const suit of this.suits) {
			for (const rank of this.ranks) {
				cards.push(new Card(suit, rank));
			}
		}
		
		// Add wild cards
		for (const wildCard of this.wildCards) {
			cards.push(new Card(
				wildCard.suit || 'wild',
				wildCard.rank || 0,
				true,
				wildCard.specialProperties || {}
			));
		}
		
		return cards;
	}

	// Get the number of tableau piles for this deck
	getTableauPileCount() {
		// Default logic - can be overridden by specific game rules
		if (this.deckSize <= 52) return 7;  // Standard deck
		if (this.deckSize <= 78) return 8;  // Tarot deck
		return Math.ceil(this.deckSize / 10); // General rule
	}

	// Get the number of foundation piles for this deck
	getFoundationPileCount() {
		// Default logic - can be overridden by specific game rules
		return this.suits.length;
	}

	// Get the number of stock cards to deal initially
	getInitialDealCount() {
		// Default logic - can be overridden by specific game rules
		return this.deckSize - (this.getTableauPileCount() * 3); // Rough estimate
	}

	// Validate deck configuration
	validate() {
		if (!this.suits || this.suits.length === 0) {
			throw new Error('Deck must have at least one suit');
		}
		if (!this.ranks || this.ranks.length === 0) {
			throw new Error('Deck must have at least one rank');
		}
		if (this.deckSize !== this.suits.length * this.ranks.length + this.wildCards.length) {
			console.warn('Deck size mismatch - calculated vs provided');
		}
		return true;
	}
}
