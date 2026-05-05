<svelte:head>
	<title>stickers gacha</title>
</svelte:head>

<div class="page">
	<h1>gacha</h1>

	<div class="banner"></div>

	<div class="roll-buttons">
		<button class="roll">x1 roll - 20 tokens</button>
		<button class="roll">x10 roll - 200 tokens</button>
	</div>
</div>

<style>
	.page {
		padding: clamp(2rem, 4vw, 4rem);
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: clamp(1rem, 2vw, 2rem);
	}

	h1 {
		margin: 0;
		font-weight: bold;
		font-style: italic;
		font-size: clamp(3.2rem, 4.8vw, 4.8rem);
		color: white;
		-webkit-text-stroke: black clamp(0.28rem, 0.44vw, 0.64rem);
		paint-order: stroke fill;
	}

	.banner {
		width: 100%;
		aspect-ratio: 2 / 1;
		background: #141318;
		border: clamp(0.12rem, 0.18vw, 0.28rem) solid #37373c;
		border-radius: 1rem;
	}

	.roll-buttons {
		display: flex;
		gap: clamp(0.5rem, 0.8vw, 0.9rem);
		justify-content: flex-end;
	}

	.roll {
		padding: clamp(0.6rem, 1vw, 1.2rem) clamp(1.2rem, 2.4vw, 2.7rem);
		font-family: inherit;
		font-size: clamp(0.95rem, 1.4vw, 1.55rem);
		font-weight: bold;
		font-style: italic;
		color: white;
		-webkit-text-stroke: black clamp(0.11rem, 0.16vw, 0.18rem);
		paint-order: stroke fill;
		background: linear-gradient(
			90deg,
			hsl(350, 90%, 75%),
			hsl(57, 90%, 75%),
			hsl(134, 90%, 75%),
			hsl(225, 90%, 75%)
		);
		border: clamp(0.14rem, 0.2vw, 0.22rem) solid black;
		border-radius: 999px;
		box-shadow: 0 clamp(3px, 0.4vw, 5px) 0 black;
		cursor: pointer;
		animation: prismatic 1.5s linear infinite;
		animation-play-state: paused;
		transition:
			transform 0.12s ease,
			box-shadow 0.12s ease;
	}

	@keyframes prismatic {
		to { filter: hue-rotate(360deg); }
	}

	.roll:hover {
		animation-play-state: running;
		transform: translateY(-2px);
		box-shadow: 0 clamp(5px, 0.6vw, 7px) 0 black;
	}

	.roll:active {
		transform: translateY(2px);
		box-shadow: 0 clamp(1px, 0.2vw, 2px) 0 black;
	}
</style>
