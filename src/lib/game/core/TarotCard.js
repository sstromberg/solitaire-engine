import { Card } from './Card.js';

export class TarotCard extends Card {
	constructor(suit, rank, isWild = false, specialProperties = {}) {
		super(suit, rank, isWild, specialProperties);
	}

	// Check if this is a Minor Arcana card
	isMinorArcana() {
		return this.specialProperties.type === 'minor';
	}
	
	// Check if this is a Major Arcana card
	isMajorArcana() {
		return this.specialProperties.type === 'major';
	}
	
	// Get Major Arcana value (0-21)
	getMajorArcanaValue() {
		return this.isMajorArcana() ? this.rank : null;
	}

	// Override getSuitSymbol for tarot-specific symbols
	getSuitSymbol() {
		if (this.isWild) {
			return this.specialProperties.suitSymbol || '★';
		}
		
		// For tarot suits, use emojis based on the suit name and color
		if (this.isMinorArcana()) {
			const tarotSuitMap = {
				'wands': '🪄',      // Brown - magic wand
				'cups': '🏆',        // Blue - trophy cup
				'swords': '⚔️',      // Green - crossed swords
				'pentacles': '💰'    // Gold - money bag
			};
			return tarotSuitMap[this.suit] || this.suit;
		}
		
		// For Major Arcana, use a star
		if (this.isMajorArcana()) {
			return '⭐';
		}
		
		// Fallback to parent implementation
		return super.getSuitSymbol();
	}

	// Override getSuitColor for tarot-specific colors
	getSuitColor() {
		if (this.isWild) {
			return this.specialProperties.color || 'purple';
		}
		
		// For Major Arcana, use purple
		if (this.isMajorArcana()) {
			return '#8A2BE2'; // Blue Violet
		}
		
		// For Minor Arcana, use the tarot suit colors
		if (this.isMinorArcana()) {
			const tarotColors = {
				'wands': '#8B4513',      // Saddle Brown
				'cups': '#4169E1',       // Royal Blue
				'swords': '#2E8B57',     // Sea Green
				'pentacles': '#FFD700'   // Gold
			};
			return tarotColors[this.suit] || '#333';
		}
		
		// Fallback to parent implementation
		return super.getSuitColor();
	}
}
