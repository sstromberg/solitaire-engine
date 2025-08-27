<script>
	import { createEventDispatcher } from 'svelte';
	
	export let card;
	export let isSelected = false;

	export let showFace = true;
	export let isStacked = false; // Whether this card is part of a stack (not the top card)
	export let stackType = 'vertical'; // 'vertical' for tableau stacks, 'horizontal' for waste pile
	export let showDebugInfo = false; // Optional debug info display
	export let showCardNotation = false; // Optional card notation display (S/T, red/black)
	export let gameRules = null; // Game rules for variant-specific notation
	export let sourcePile = null; // Source pile for custom notation
	export let cardIndex = 0; // Card index in pile for custom notation
	export let gameState = null; // Game state for custom notation

	
	const dispatch = createEventDispatcher();
	
	function handleClick() {
		dispatch('click', { card });
	}
	
	function handleDoubleClick() {
		dispatch('dblclick', { card });
	}
	

	

</script>

<div 
	class="card {card.isFaceUp ? 'face-up' : 'face-down'} {isSelected ? 'selected' : ''} {card.orientation === 'horizontal' ? 'horizontal' : 'vertical'}"
	style="--card-suit-color: {card.isFaceUp ? card.getSuitColor() : '#333'}"
	role="button"
	tabindex="0"
	on:click={handleClick}
	on:dblclick={handleDoubleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
	<!-- Color bar at top of card for tarot suits -->
	{#if card.isFaceUp && (card.isMinorArcana() || card.isMajorArcana())}
		<div class="card-color-bar" style="background-color: {card.getSuitColor()}"></div>
	{/if}
	{#if card.isFaceUp && showFace}
		<div class="card-content">
			<!-- Card notation - toggleable with card notation flag -->
			{#if showCardNotation && gameRules}
				{@const config = gameRules.getCardNotationConfig()}
				
				<!-- Stacked indicator (S/T) or custom notation (T/S/U for FreeCell) -->
				{#if config.showStackedIndicator}
					<div style="position: absolute; top: 0; right: 0; background: red; color: white; font-size: 10px; padding: 2px 4px; border-radius: 2px; z-index: 1000;">
						{#if config.getNotationLabel && sourcePile && gameState}
							{config.getNotationLabel(card, sourcePile, cardIndex, gameState)}
						{:else}
							{isStacked ? 'S' : 'T'}
						{/if}
					</div>
				{/if}
				
				<!-- Major Arcana value display -->
				{#if config.showArcanaInfo && card.isMajorArcana()}
					<div style="position: absolute; top: 0; left: 0; background: purple; color: white; font-size: 10px; padding: 2px 4px; border-radius: 2px;">
						{card.getMajorArcanaValue()}
					</div>
				{/if}
			{/if}
			
			<div class="card-corner top-left">
				{#if isStacked}
					{#if stackType === 'horizontal'}
						<!-- For horizontally stacked cards (waste pile), show rank above suit -->
						<div class="rank-suit-horizontal">
							<span class="rank" style="color: {card.isMinorArcana() || card.isMajorArcana() ? (card.getSuitColor() === '#FFD700' ? '#333' : 'white') : card.getSuitColor()}">{card.getRankSymbol()}</span>
							<span class="suit" style="color: {card.getSuitColor()}">{card.getSuitSymbol()}</span>
						</div>
					{:else}
						<!-- For vertically stacked cards (tableau), show rank and suit stacked vertically -->
						<div class="rank-suit-combo">
							<span class="rank" style="color: {card.isMinorArcana() || card.isMajorArcana() ? (card.getSuitColor() === '#FFD700' ? '#333' : 'white') : card.getSuitColor()}">{card.getRankSymbol()}</span>
							<span class="suit" style="color: {card.getSuitColor()}">{card.getSuitSymbol()}</span>
						</div>
					{/if}
				{:else}
					<!-- For top cards, show rank and suit stacked vertically -->
					<span class="rank" style="color: {card.isMinorArcana() || card.isMajorArcana() ? (card.getSuitColor() === '#FFD700' ? '#333' : 'white') : card.getSuitColor()}">{card.getRankSymbol()}</span>
					<span class="suit" style="color: {card.getSuitColor()}">{card.getSuitSymbol()}</span>
				{/if}
			</div>
			
			{#if !isStacked}
				<div class="card-center">
					<span class="suit-large" style="color: {card.getSuitColor()}">{card.getSuitSymbol()}</span>
				</div>
			{:else}
				<!-- Stacked card - showing partial info -->
				<div class="card-center-stacked">
					<span class="suit-medium" style="color: {card.getSuitColor()}">{card.getSuitSymbol()}</span>
				</div>
			{/if}
			<div class="card-corner bottom-right">
				<span class="rank" style="color: #333">{card.getRankSymbol()}</span>
			</div>
		</div>
	{:else}
		<div class="card-back">
			<div class="card-pattern"></div>
		</div>
	{/if}
</div>



<style>
	.card {
		width: 70px;
		height: 100px;
		border-radius: 8px;
		border: 2px solid #333;
		background: white;
		position: relative;
		cursor: pointer;
		user-select: none;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		overflow: hidden; /* Back to hidden since we no longer need overflow for suit icon */
	}
	
	/* Color bar for tarot suits */
	.card-color-bar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 20px;
		z-index: 1;
	}
	
	.card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}
	
	.card.selected {
		border-color: #007bff;
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
		transform: translateY(-4px);
		z-index: 1000;
	}
	
	/* Horizontal orientation for free cell blocking */
	.card.horizontal {
		transform: rotate(90deg);
		width: 100px;
		height: 70px;
	}
	
	.card.horizontal .card-content {
		transform: rotate(-90deg);
	}
	
	/* Major Arcana styling */
	.card.major .card-center .suit-large {
		font-size: 24px; /* Larger than normal */
		font-weight: bold;
	}
	
	.card.major .rank {
		font-size: 16px; /* Larger rank text */
		font-weight: bold;
	}
	

	
	.card.face-down {
		background: linear-gradient(45deg, #1e3c72, #2a5298);
	}
	
	.card-back {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.card-pattern {
		width: 80%;
		height: 80%;
		background: repeating-linear-gradient(
			45deg,
			transparent,
			transparent 10px,
			rgba(255, 255, 255, 0.1) 10px,
			rgba(255, 255, 255, 0.1) 20px
		);
		border-radius: 4px;
	}
	
	.card-content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 4px 6px 3px 6px; /* Reduced horizontal padding for rank text */
		box-sizing: border-box;
	}
	
	.card-corner {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 12px;
		font-weight: bold;
		min-height: 0;
		flex-shrink: 0;
		max-width: 100%;
		overflow: visible; /* Changed from hidden to visible for scaled emojis */
	}
	
	.card-corner.top-left {
		align-self: flex-start;
		position: relative;
		z-index: 1;
	}
	
	.card-corner.bottom-right {
		align-self: flex-end;
		transform: rotate(180deg);
		transform-origin: center;
		position: relative;
		z-index: 1;
		/* Ensure rotated content doesn't get clipped */
		overflow: visible !important;
		/* Add padding to give rotated content space */
		padding: 2px;
	}
	
	.card-center {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
	}
	
	.suit-large {
		font-size: 28px;
	}
	
	.suit-medium {
		font-size: 24px;
		opacity: 1;
		font-weight: bold;
		color: inherit;
	}
	
	.card-center-stacked {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
	}
	

	
	.rank {
		font-size: 14px;
		font-weight: bold;
	}
	
	.suit {
		font-size: 12px;
	}
	
	/* Scale down emoji suit symbols to prevent overflow */
	.suit:has(span[role="img"]),
	.suit span[role="img"] {
		font-size: 10px;
		transform: scale(0.8);
		transform-origin: center;
	}
	
	/* Alternative approach for browsers that don't support :has() */
	.suit span[role="img"] {
		font-size: 10px;
		transform: scale(0.8);
		transform-origin: center;
	}
	
	/* Ensure proper spacing for scaled emojis */
	.suit span[role="img"] {
		display: inline-block;
		line-height: 1;
		vertical-align: middle;
	}
	

	
	.rank-suit-combo {
		font-size: 14px;
		font-weight: bold;
		line-height: 1;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}
	
	.rank-suit-horizontal {
		font-size: 14px;
		font-weight: bold;
		line-height: 1;
		text-align: center;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 2px;
	}
</style>
