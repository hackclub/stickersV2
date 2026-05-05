<svelte:head>
	<title>stickers gacha</title>
</svelte:head>

<div class="page">
	<div class="banner"></div>

	<div class="roll-buttons">
		<button class="roll">
			roll x1
			<span class="roll-cost"
				><img src="/images/token.png" alt="tokens" class="token-icon" /> 30</span
			>
		</button>
		<button class="roll">
			roll x10
			<span class="roll-cost"
				><img src="/images/token.png" alt="tokens" class="token-icon" /> 300</span
			>
		</button>
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

	.banner {
		width: 100%;
		aspect-ratio: 16 / 9;
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
		padding: clamp(0.2rem, 0.7vw, 0.9rem) clamp(2.63rem, 4.8vw, 5.85rem);
		font-family: inherit;
		font-size: clamp(1.05rem, 1.6vw, 1.75rem);
		font-weight: bold;
		font-style: italic;
		color: white;
		-webkit-text-stroke: black clamp(0.16rem, 0.24vw, 0.28rem);
		paint-order: stroke fill;
		background: #f0f0f0;
		border: clamp(0.14rem, 0.2vw, 0.22rem) solid black;
		border-radius: 999px;
		box-shadow: 0 clamp(3px, 0.4vw, 5px) 0 black;
		cursor: pointer;
		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		transition:
			transform 0.12s ease,
			box-shadow 0.12s ease;
		line-height: 1.5;
	}

	.roll::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(
			90deg,
			#ed344f,
			#f5ee49,
			#239640,
			#3758c4,
			#ed344f,
			#f5ee49,
			#239640
		);
		background-size: 300% 100%;
		animation: rainbow-shift 2s linear infinite;
		animation-play-state: paused;
		opacity: 1;
		z-index: -1;
	}

	.roll:hover::after {
		animation-play-state: running;
	}

	@keyframes rainbow-shift {
		0% {
			background-position: 0% 50%;
		}
		100% {
			background-position: 100% 50%;
		}
	}

	.roll:hover {
		transform: translateY(-2px);
		box-shadow: 0 clamp(5px, 0.6vw, 7px) 0 black;
	}

	.roll-cost {
		display: flex;
		align-items: center;
		gap: 0.3em;
		font-size: 0.8em;
		font-style: normal;
		opacity: 0.9;
	}

	.token-icon {
		width: 1.1em;
		height: 1.1em;
		object-fit: contain;
		-webkit-filter: drop-shadow(0 1px 0 black);
		filter: drop-shadow(0 1px 0 black);
	}

	.roll:active {
		transform: translateY(2px);
		box-shadow: 0 clamp(1px, 0.2vw, 2px) 0 black;
	}
</style>
