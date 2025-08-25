export class Card {
	constructor(suit, rank, isWild = false, specialProperties = {}) {
		this.suit = suit;
		this.rank = rank;
		this.isWild = isWild;
		this.specialProperties = specialProperties;
		this.isFaceUp = false;
		this.position = null; // Will be set by the game board
		this.orientation = 'vertical'; // For free cell blocking in tarot variants
	}

	// Get display value for the card
	getDisplayValue() {
		if (this.isWild) {
			return this.specialProperties.displayName || 'Wild';
		}
		return `${this.rank} of ${this.suit}`;
	}

	// Get short display value (e.g., "A♠", "10♥")
	getShortDisplay() {
		if (this.isWild) {
			return this.specialProperties.shortName || 'W';
		}
		
		const rankSymbol = this.getRankSymbol();
		const suitSymbol = this.getSuitSymbol();
		return `${rankSymbol}${suitSymbol}`;
	}

	// Get rank symbol (A, 2, 3, ..., 10, J, Q, K for standard cards and Minor Arcana, numbers for Major Arcana)
	getRankSymbol() {
		if (this.isWild) {
			return this.specialProperties.rankSymbol || 'W';
		}
		
		// For Major Arcana only, show the numeric rank (0-21)
		if (this.isMajorArcana()) {
			return this.rank.toString();
		}
		
		// For standard playing cards and Minor Arcana, use the traditional rank map
		const rankMap = {
			1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
			8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K'
		};
		return rankMap[this.rank] || this.rank.toString();
	}

	// Get suit symbol (♠, ♥, ♦, ♣ for standard cards, emojis for tarot)
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
		
		// For standard playing cards, use traditional symbols
		const standardSuitMap = {
			'spades': '♠',
			'hearts': '♥',
			'diamonds': '♦',
			'clubs': '♣'
		};
		return standardSuitMap[this.suit] || this.suit;
	}

	// Get suit color (red/black for standard cards, tarot colors for tarot)
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
		
		// For standard playing cards, use traditional red/black
		const redSuits = ['hearts', 'diamonds'];
		return redSuits.includes(this.suit) ? 'red' : 'black';
	}

	// Flip the card
	flip() {
		this.isFaceUp = !this.isFaceUp;
	}

	// Check if card can be placed on top of another card
	canStackOn(otherCard, gameRules) {
		return gameRules.canStackCards(this, otherCard);
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
	
	// Set card orientation (for free cell blocking)
	setOrientation(orientation) {
		this.orientation = orientation; // 'vertical' or 'horizontal'
	}
	
	// Clone the card
	clone() {
		return new Card(this.suit, this.rank, this.isWild, { ...this.specialProperties });
	}
}
