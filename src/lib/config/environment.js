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

// Simplified helper functions - all just check if we're in dev mode
export const isDev = import.meta.env.DEV;
export const shouldShowDebug = () => isDev;
export const shouldHighlightValidMoves = () => isDev;
export const shouldLogToConsole = () => isDev;
