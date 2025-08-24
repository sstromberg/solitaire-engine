<script>
	import { createEventDispatcher } from 'svelte';
	
	export let card;
	export let isSelected = false;

	export let showFace = true;
	export let isStacked = false; // Whether this card is part of a stack (not the top card)
	export let stackType = 'vertical'; // 'vertical' for tableau stacks, 'horizontal' for waste pile
	export let showDebugInfo = false; // Optional debug info display

	
	const dispatch = createEventDispatcher();
	
	function handleClick() {
		dispatch('click', { card });
	}
	
	function handleDoubleClick() {
		dispatch('dblclick', { card });
	}
	

	

</script>

<div 
	class="card {card.isFaceUp ? 'face-up' : 'face-down'} {isSelected ? 'selected' : ''}"
	style="--card-suit-color: {card.isFaceUp ? card.getSuitColor() : '#333'}"
	role="button"
	tabindex="0"
	on:click={handleClick}
	on:dblclick={handleDoubleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
	{#if card.isFaceUp && showFace}
		<div class="card-content">
			<!-- Debug info - toggleable with debug mode -->
				{#if showDebugInfo}
		<div style="position: absolute; top: 0; right: 0; background: red; color: white; font-size: 8px; padding: 1px;">
			{isStacked ? 'S' : 'T'}
		</div>
		<!-- Debug: Show suit color value -->
		<div style="position: absolute; top: 0; right: 20px; background: blue; color: white; font-size: 8px; padding: 1px;">
			{card.isFaceUp ? card.getSuitColor() : '#333'}
		</div>
	{/if}
			
			<div class="card-corner top-left">
				{#if isStacked}
					{#if stackType === 'horizontal'}
						<!-- For horizontally stacked cards (waste pile), show rank above suit -->
						<div class="rank-suit-horizontal" style="color: {card.getSuitColor()}">
							<span class="rank">{card.getRankSymbol()}</span>
							<span class="suit">{card.getSuitSymbol()}</span>
						</div>
					{:else}
						<!-- For vertically stacked cards (tableau), show rank and suit stacked vertically -->
						<div class="rank-suit-combo" style="color: {card.getSuitColor()}">
							{card.getRankSymbol()}{card.getSuitSymbol()}
						</div>
					{/if}
				{:else}
					<!-- For top cards, show rank and suit stacked vertically -->
					<span class="rank" style="color: {card.getSuitColor()}">{card.getRankSymbol()}</span>
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
				<span class="rank" style="color: {card.getSuitColor()}">{card.getRankSymbol()}</span>
				<span class="suit" style="color: {card.getSuitColor()}">{card.getSuitSymbol()}</span>
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
		overflow: hidden;
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
		padding: 3px 6px 2px 6px;
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
		overflow: hidden;
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
		flex-direction: column;
		align-items: center;
		gap: 1px;
	}
</style>
