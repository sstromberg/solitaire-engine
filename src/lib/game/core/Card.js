export class Card {
	constructor(suit, rank, isWild = false, specialProperties = {}) {
		this.suit = suit;
		this.rank = rank;
		this.isWild = isWild;
		this.specialProperties = specialProperties;
		this.isFaceUp = false;
		this.position = null; // Will be set by the game board
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

	// Get rank symbol (A, 2, 3, ..., 10, J, Q, K)
	getRankSymbol() {
		if (this.isWild) {
			return this.specialProperties.rankSymbol || 'W';
		}
		
		const rankMap = {
			1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
			8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K'
		};
		return rankMap[this.rank] || this.rank.toString();
	}

	// Get suit symbol (♠, ♥, ♦, ♣)
	getSuitSymbol() {
		if (this.isWild) {
			return this.specialProperties.suitSymbol || '★';
		}
		
		const suitMap = {
			'spades': '♠',
			'hearts': '♥',
			'diamonds': '♦',
			'clubs': '♣'
		};
		return suitMap[this.suit] || this.suit;
	}

	// Get suit color (red or black)
	getSuitColor() {
		if (this.isWild) {
			return this.specialProperties.color || 'purple';
		}
		
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

	// Clone the card
	clone() {
		return new Card(this.suit, this.rank, this.isWild, { ...this.specialProperties });
	}
}
