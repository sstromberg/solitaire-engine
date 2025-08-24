export class Pile {
	constructor(type, index, maxCards = null) {
		this.type = type; // 'foundation', 'tableau', 'stock', 'waste'
		this.index = index; // Position in the game layout
		this.cards = [];
		this.maxCards = maxCards; // Optional limit on number of cards
	}

	// Add a card to the pile
	addCard(card) {
		if (this.maxCards && this.cards.length >= this.maxCards) {
			throw new Error(`Pile is full (max ${this.maxCards} cards)`);
		}
		
		card.position = { pile: this.type, index: this.index, cardIndex: this.cards.length };
		this.cards.push(card);
	}

	// Add multiple cards to the pile
	addCards(cards) {
		cards.forEach(card => this.addCard(card));
	}

	// Remove the top card from the pile
	removeTopCard() {
		if (this.cards.length === 0) {
			throw new Error('Pile is empty');
		}
		
		const card = this.cards.pop();
		card.position = null;
		return card;
	}

	// Remove multiple cards from the top
	removeTopCards(count) {
		if (count > this.cards.length) {
			throw new Error(`Cannot remove ${count} cards from pile with ${this.cards.length} cards`);
		}
		
		const removedCards = [];
		for (let i = 0; i < count; i++) {
			removedCards.unshift(this.removeTopCard());
		}
		
		return removedCards;
	}

	// Get the top card without removing it
	getTopCard() {
		return this.cards.length > 0 ? this.cards[this.cards.length - 1] : null;
	}

	// Get a card at a specific index
	getCard(index) {
		if (index < 0 || index >= this.cards.length) {
			return null;
		}
		return this.cards[index];
	}

	// Get the number of cards in the pile
	getCardCount() {
		return this.cards.length;
	}

	// Check if the pile is empty
	isEmpty() {
		return this.cards.length === 0;
	}

	// Check if the pile is full
	isFull() {
		return this.maxCards ? this.cards.length >= this.maxCards : false;
	}

	// Get all cards in the pile
	getAllCards() {
		return [...this.cards];
	}

	// Get cards from a specific index to the top
	getCardsFromIndex(index) {
		if (index < 0 || index >= this.cards.length) {
			return [];
		}
		return this.cards.slice(index);
	}

	// Check if a card can be added to this pile
	canAddCard(card, gameRules) {
		// This is a basic check - specific rules should be implemented in game rules
		if (this.maxCards && this.cards.length >= this.maxCards) {
			return false;
		}
		
		// Delegate to game rules for specific logic
		return gameRules.isValidMove(card, this, { piles: [this] });
	}

	// Clear all cards from the pile
	clear() {
		this.cards.forEach(card => {
			card.position = null;
		});
		this.cards = [];
	}

	// Shuffle the cards in the pile
	shuffle() {
		for (let i = this.cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
		
		// Update positions after shuffling
		this.cards.forEach((card, index) => {
			card.position = { pile: this.type, index: this.index, cardIndex: index };
		});
	}

	// Get a string representation of the pile
	toString() {
		return `${this.type} pile ${this.index}: ${this.cards.length} cards`;
	}
}
