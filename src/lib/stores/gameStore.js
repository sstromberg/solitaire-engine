import { writable } from 'svelte/store';

// Main game state store
export const gameState = writable({
	currentDeck: null,
	gameRules: null,
	cards: [],
	piles: [],
	score: 0,
	moves: [],
	gameStarted: false,
	gameWon: false
});

// Deck configuration store
export const deckConfig = writable({
	suits: [],
	ranks: [],
	deckSize: 0,
	currentVariant: 'klondike'
});

// Game settings store
export const gameSettings = writable({
	showHints: false,
	autoComplete: true,
	undoEnabled: true,
	animationSpeed: 'normal'
});

// UI state store
export const uiState = writable({
	selectedCard: null,
	draggedCards: [],
	showMenu: false,
	showRules: false
});

// Game actions
export const gameActions = {
	// Start a new game
	startNewGame: (deckConfig, gameRules) => {
		gameState.update(state => ({
			...state,
			currentDeck: deckConfig,
			gameRules: gameRules,
			cards: deckConfig.createDeck(),
			piles: [],
			score: 0,
			moves: [],
			gameStarted: true,
			gameWon: false
		}));
	},

	// Make a move
	makeMove: (card, targetPile) => {
		gameState.update(state => {
			// Implementation will be added when we create the game logic
			return state;
		});
	},

	// Undo last move
	undoMove: () => {
		gameState.update(state => {
			if (state.moves.length > 0) {
				const lastMove = state.moves[state.moves.length - 1];
				// Implementation will be added when we create the game logic
				return state;
			}
			return state;
		});
	},

	// Reset game
	resetGame: () => {
		gameState.update(state => ({
			...state,
			cards: [],
			piles: [],
			score: 0,
			moves: [],
			gameStarted: false,
			gameWon: false
		}));
	}
};
