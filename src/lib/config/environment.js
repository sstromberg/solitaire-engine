import { writable } from 'svelte/store';

// Environment configuration for the solitaire game
export const config = writable({
	// Development mode - automatically set by Vite
	isDev: import.meta.env.DEV,
	
	// Debug settings - can be overridden by user preferences
	debug: {
		// Default debug settings based on environment
		showDebugInfo: import.meta.env.DEV,
		showValidMoves: import.meta.env.DEV,
		enableConsoleLogs: import.meta.env.DEV,
		
		// Production overrides (these will be false in production builds)
		forceDebugMode: false,
	},
	
	// Game settings
	game: {
		animationSpeed: 'normal',
		autoComplete: true,
		showHints: false,
	},
	
	// Feature flags
	features: {
		dragAndDrop: true,
		keyboardNavigation: true,
		accessibility: true,
	},
});

// Helper function to check if debug features should be enabled
export function shouldShowDebug() {
	return import.meta.env.DEV || false; // Simplified for now
}

// Helper function to check if valid moves should be highlighted
export function shouldHighlightValidMoves() {
	return import.meta.env.DEV; // Simplified for now
}

// Helper function to check if console logs should be enabled
export function shouldLogToConsole() {
	return import.meta.env.DEV; // Simplified for now
}
