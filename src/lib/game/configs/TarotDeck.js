import { DeckConfig } from '../core/DeckConfig.js';
import { Card } from '../core/Card.js';

export class TarotDeck extends DeckConfig {
	constructor() {
		const minorSuits = ['wands', 'cups', 'swords', 'pentacles'];
		const minorRanks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // No Knight (14)
		const majorArcana = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
		
		super(minorSuits, minorRanks, [], 74); // 74 total cards, no wild cards
		this.majorArcana = majorArcana;
	}
	
	// Override suit colors for 5 distinct colors
	getSuitColor(suit) {
		const colors = {
			'wands': '#8B4513',      // Saddle Brown
			'cups': '#4169E1',       // Royal Blue  
			'swords': '#2E8B57',     // Sea Green
			'pentacles': '#FFD700',  // Gold
			'major': '#8A2BE2'       // Blue Violet
		};
		return colors[suit] || '#333';
	}
	
	// Override to create tarot deck
	createDeck() {
		const cards = [];
		
		// Add Minor Arcana (4 suits × 13 ranks = 52 cards)
		for (const suit of this.suits) {
			for (const rank of this.ranks) {
				cards.push(new Card(suit, rank, false, { type: 'minor' }));
			}
		}
		
		// Add Major Arcana (22 cards, special suit)
		for (const rank of this.majorArcana) {
			cards.push(new Card('major', rank, false, { type: 'major', arcana: rank }));
		}
		
		return cards;
	}
	
	// Override tableau pile count for Fortune's Foundation
	getTableauPileCount() {
		return 11; // 10 with cards + 1 empty at position 5
	}
	
	// Override foundation pile count for Fortune's Foundation
	getFoundationPileCount() {
		return 6; // 4 Minor Arcana + 2 Major Arcana
	}
}
