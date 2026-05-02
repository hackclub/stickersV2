<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import '../../page.css';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const hasAddress = $derived(!!data.address);
	let claimForm: HTMLFormElement | null = $state(null);

	type Falling = {
		id: number;
		src: string;
		size: number;
		name: string;
		x: number;
		lx: number;
		ly: number;
		es: number;
		rotStart: number;
		rotEnd: number;
		delay: number;
		duration: number;
	};

	const TOTAL = 3;
	const STAGGER = 800;
	const FALL_BASE = 2100;

	let falling = $state<Falling[]>([]);
	let envelopeClosed = $state(false);
	let envelopeFlying = $state(false);
	let runKey = $state(0);
	let showConfirm = $state(false);
	let mailStamp = $state(false);

	function start() {
		envelopeClosed = false;
		envelopeFlying = false;
		showConfirm = false;
		mailStamp = false;
		runKey++;

		const list: Falling[] = [];
		const picks = data.freeStickers ?? [];
		for (let i = 0; i < Math.min(TOTAL, picks.length); i++) {
			const a = picks[i];
			const size = 7 + Math.random() * 4;
			const rotStart = Math.random() * 50 - 25;
			const heightPct = size * 6;
			const halfH = heightPct / 2;
			const maxLy = Math.max(50, 100 - halfH - 2);
			const minLy = Math.min(50, halfH + 2);
			const proposedLy = 58 + Math.random() * 34;
			const ly = Math.max(minLy, Math.min(proposedLy, maxLy));
			list.push({
				id: runKey * 100 + i,
				src: a.cdn_url,
				size,
				name: a.name,
				x: 0,
				lx: 18 + Math.random() * 64,
				ly,
				es: 0.3 + Math.random() * 0.18,
				rotStart,
				rotEnd: rotStart + (Math.random() * 70 - 35),
				delay: 250 + i * STAGGER,
				duration: FALL_BASE + Math.random() * 200
			});
		}
		falling = list;

		const last = list[list.length - 1];
		if (!last) return;
		const allLandedAt = last.delay + last.duration;
		setTimeout(() => (showConfirm = true), allLandedAt + 200);
	}

	function onConfirm() {
		showConfirm = false;
		envelopeClosed = true;
		if (hasAddress) claimForm?.requestSubmit();
		setTimeout(() => (mailStamp = true), 850);
		setTimeout(() => {
			envelopeFlying = true;
		}, 2300);
		setTimeout(() => goto(resolve('/onboarding/connect')), 2300 + 1350);
	}

	onMount(() => {
		start();
	});
</script>

<svelte:head>
	<title>your free stickers</title>
	{#each data.freeStickers ?? [] as a (a.id)}
		<link rel="preload" href={a.cdn_url} as="image" />
	{/each}
	<link
		rel="preload"
		href="https://cdn.hackclub.com/019d730c-5d3c-7aa7-8b2c-bc6a123cba01/0gH7FoPip8sxo_GVALeVgz4DR2qHd0s1HHVEn8NlO0o"
		as="image"
	/>
</svelte:head>

<main class="scene">
	{#if hasAddress}
		<form
			bind:this={claimForm}
			method="POST"
			action="?/claim"
			use:enhance={() => {
				return async () => {};
			}}
			class="claim-form"
			aria-hidden="true"
		></form>
	{/if}

	<svg class="motion-blur-defs" aria-hidden="true">
		<defs>
			<filter id="motion-blur" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="10 0" />
			</filter>
		</defs>
	</svg>

	<aside class="receipt">
		<div class="receipt-head">
			<span class="receipt-tag">welcome gift</span>
			<h2>free sticker pack</h2>
		</div>
		<ul class="receipt-items">
			{#each falling as s (s.id)}
				<li>
					<img src={s.src} alt="" />
					<span class="item-name">{s.name}</span>
					<span class="dots"></span>
					<span class="qty">×1</span>
				</li>
			{/each}
		</ul>
		<div class="ship-to">
			<span class="ship-label">ship to</span>
			{#if data.address}
				<address>
					{#if data.address.first_name || data.address.last_name}
						{[data.address.first_name, data.address.last_name].filter(Boolean).join(' ')}<br />
					{/if}
					{#if data.address.line_1}{data.address.line_1}<br />{/if}
					{#if data.address.line_2}{data.address.line_2}<br />{/if}
					{[data.address.city, data.address.state, data.address.postal_code]
						.filter(Boolean)
						.join(', ')}
					{#if data.address.country}<br />{data.address.country}{/if}
				</address>
				<a class="update-address" href="/onboarding/setup">update my address →</a>
			{:else}
				<address class="no-address">no address on file yet.</address>
			{/if}
		</div>
	</aside>

	<h1 class="headline">
		welcome to hack club!<br />we're sending you 3 free stickers.
	</h1>

	<div class="content">
		<div class="envelope-column">
			<div class="flap-reserve" aria-hidden="true"></div>

			<div class="envelope-wrap" class:flying={envelopeFlying}>
				<div class="envelope" class:closed={envelopeClosed}>
					<div class="back">
						<svg
							class="back-vshadow"
							viewBox="0 0 100 100"
							preserveAspectRatio="none"
							aria-hidden="true"
						>
							<polyline
								points="0,35 50,78 100,35"
								fill="none"
								stroke="black"
								stroke-width="4"
								vector-effect="non-scaling-stroke"
							/>
						</svg>
						<svg
							class="back-voutline"
							viewBox="0 0 100 100"
							preserveAspectRatio="none"
							aria-hidden="true"
						>
							<polyline
								points="0,35 50,78 100,35"
								fill="none"
								stroke="black"
								stroke-width="1.2"
								vector-effect="non-scaling-stroke"
							/>
						</svg>
					</div>

					<div class="sticker-clip">
						{#each falling as s (s.id)}
							<img
								class="falling-sticker"
								src={s.src}
								alt=""
								role="presentation"
								draggable="false"
								style="
									--x: {s.x};
									--lx: {s.lx}%;
									--ly: {s.ly}%;
									--es: {s.es};
									--size: {s.size * 3.6}cqw;
									--rs: {s.rotStart}deg;
									--re: {s.rotEnd}deg;
									--delay: {s.delay}ms;
									--dur: {s.duration}ms;
								"
							/>
						{/each}
					</div>

					<div class="front"></div>
					{#if mailStamp}
						<img
							class="mail-stamp"
							src="https://cdn.hackclub.com/019d730c-5d3c-7aa7-8b2c-bc6a123cba01/0gH7FoPip8sxo_GVALeVgz4DR2qHd0s1HHVEn8NlO0o"
							alt=""
							role="presentation"
							draggable="false"
						/>
					{/if}
					<div class="flap-group">
						<div class="flap"></div>
						<svg
							class="flap-outline"
							viewBox="0 0 100 100"
							preserveAspectRatio="none"
							aria-hidden="true"
						>
							<path d="M 0 0 L 0 44.87 L 50 100 L 100 44.87 L 100 0" />
						</svg>
					</div>
				</div>
			</div>

			<div class="actions">
				{#if hasAddress}
					<button
						class="confirm"
						class:visible={showConfirm}
						onclick={onConfirm}
						disabled={!showConfirm}
						aria-hidden={!showConfirm}
						tabindex={showConfirm ? 0 : -1}
					>
						claim my stickers
					</button>
				{:else}
					<button
						class="confirm"
						class:visible={showConfirm}
						onclick={() => goto('/onboarding/setup')}
						disabled={!showConfirm}
						aria-hidden={!showConfirm}
						tabindex={showConfirm ? 0 : -1}
					>
						set my address
					</button>
				{/if}
				<button
					class="change"
					class:visible={showConfirm}
					onclick={() => goto('/onboarding/connect')}
					disabled={!showConfirm}
					aria-hidden={!showConfirm}
					tabindex={showConfirm ? 0 : -1}
				>
					skip
				</button>
			</div>
		</div>
	</div>
</main>

<style>
	.claim-form {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.scene {
		--sidebar-w: clamp(220px, 24vw, 340px);
		--env-w: clamp(260px, min(36vw, 65vh), 760px);
		position: fixed;
		inset: 0;
		overflow: hidden;
		background-size: var(--page-grid) var(--page-grid);
		background-color: #141318;
		background-image:
			linear-gradient(to right, #1c1c20 var(--page-grid-line), transparent var(--page-grid-line)),
			linear-gradient(to bottom, #1c1c20 var(--page-grid-line), transparent var(--page-grid-line));
		background-position: calc(var(--page-grid) / 2) calc(var(--page-grid) / 2);
		font-family: 'Phantom Sans', sans-serif;
	}

	.headline {
		position: absolute;
		top: clamp(1.5rem, 5vh, 4rem);
		left: calc(var(--sidebar-w) + (100% - var(--sidebar-w)) / 2);
		transform: translateX(-50%);
		margin: 0;
		text-align: center;
		font-weight: bold;
		font-style: italic;
		font-size: clamp(1.4rem, min(2.6vw, 5vh), 4rem);
		line-height: 1.15;
		color: white;
		-webkit-text-stroke: black clamp(0.18rem, 0.3vw, 0.6rem);
		paint-order: stroke fill;
		width: calc(100% - var(--sidebar-w) - 2rem);
		z-index: 15;
	}

	.content {
		position: absolute;
		top: clamp(7rem, 14vh, 12rem);
		bottom: 0;
		left: calc(var(--sidebar-w) + (100% - var(--sidebar-w)) / 2);
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		max-width: calc(100% - var(--sidebar-w) - 2rem);
		z-index: 20;
	}

	.envelope-column {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		isolation: isolate;
	}

	.flap-reserve {
		width: 1px;
		height: calc(var(--env-w) * 0.468);
		pointer-events: none;
	}

	.envelope-wrap {
		flex: 0 0 auto;
		position: relative;
		width: var(--env-w);
		aspect-ratio: 5 / 3;
		z-index: 2;
		container-type: inline-size;
	}

	.actions {
		display: flex;
		gap: clamp(0.5rem, 1vw, 1rem);
		align-items: center;
		position: relative;
		z-index: 3;
		margin-top: clamp(1rem, 2vw, 2rem);
	}

	.confirm,
	.change {
		padding: clamp(0.7rem, 0.9vw, 1.1rem) clamp(1.8rem, 2.2vw, 2.8rem);
		font-family: 'Phantom Sans', sans-serif;
		font-size: clamp(1rem, 1.3vw, 1.7rem);
		font-weight: bold;
		color: white;
		-webkit-text-stroke: black clamp(0.18rem, 0.22vw, 0.3rem);
		paint-order: stroke fill;
		border: clamp(0.15rem, 0.22vw, 0.35rem) solid black;
		border-radius: 999px;
		cursor: pointer;
		box-shadow: 0 5px 0 black;
		opacity: 0;
		transform: scale(0.5);
		visibility: hidden;
		pointer-events: none;
		transition:
			transform 0.12s ease,
			filter 0.12s ease,
			box-shadow 0.12s ease;
	}

	.confirm {
		background: #239640;
	}

	.change {
		background: white;
		color: black;
		-webkit-text-stroke: 0;
	}

	.confirm.visible,
	.change.visible {
		visibility: visible;
		pointer-events: auto;
		animation: confirm-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.change.visible {
		animation-delay: 0.08s;
	}

	@keyframes confirm-pop {
		from {
			opacity: 0;
			transform: scale(0.5);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.confirm.visible:hover,
	.change.visible:hover {
		filter: brightness(1.15);
		transform: translateY(-2px) scale(1);
		box-shadow: 0 7px 0 black;
	}

	.confirm.visible:active,
	.change.visible:active {
		transform: translateY(2px) scale(1);
		box-shadow: 0 2px 0 black;
	}

	.envelope-wrap.flying {
		animation: fly 1.35s forwards;
	}

	@keyframes fly {
		0% {
			transform: translate3d(0, 0, 0) scale(1, 1);
			filter: none;
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		30% {
			transform: translate3d(-5vw, 0, 0) scale(1.13, 0.88);
			filter: none;
			animation-timing-function: cubic-bezier(0.5, 0, 0.7, 0.45);
		}
		55% {
			transform: translate3d(22vw, 0, 0) scale(1.06, 0.95);
			filter: none;
			animation-timing-function: linear;
		}
		65% {
			filter: none;
		}
		75% {
			filter: url(#motion-blur);
		}
		100% {
			transform: translate3d(170vw, 0, 0) scale(1, 1);
			filter: url(#motion-blur);
		}
	}

	.motion-blur-defs {
		position: absolute;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	.envelope {
		--paper-tex: url('/images/envelope_texture.png');
		position: relative;
		width: 100%;
		height: 100%;
		perspective: 900px;
		box-sizing: border-box;
		box-shadow:
			0 4px 10px rgba(0, 0, 0, 0.4),
			0 22px 40px rgba(0, 0, 0, 0.55),
			0 40px 70px rgba(0, 0, 0, 0.35);
	}

	.envelope::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-left: clamp(0.15rem, 0.25vw, 0.4rem) solid black;
		border-right: clamp(0.15rem, 0.25vw, 0.4rem) solid black;
		border-bottom: clamp(0.15rem, 0.25vw, 0.4rem) solid black;
		box-sizing: border-box;
		z-index: 4;
	}

	.envelope > div {
		box-sizing: border-box;
	}

	.back,
	.front,
	.flap {
		isolation: isolate;
	}

	.back::before,
	.front::before,
	.flap::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 60cqw;
		height: 100cqw;
		background-image: var(--paper-tex);
		background-size: cover;
		z-index: 0;
	}

	.back::before {
		background-position: 30% 70%;
		transform: translate(-50%, -50%) rotate(90deg);
	}

	.front::before {
		background-position: 70% 20%;
		transform: translate(-50%, -50%) rotate(-90deg) scaleX(-1);
	}

	.flap::before {
		background-position: 20% 80%;
		transform: translate(-50%, -50%) rotate(90deg);
		transition: transform 0s 0.35s;
	}

	.envelope.closed .flap::before {
		transform: translate(-50%, -50%) rotate(270deg);
	}

	.back {
		position: absolute;
		inset: 0;
		background: #a01f36;
		z-index: 1;
	}

	.back::before {
		opacity: 0.35;
	}

	.back-vshadow {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		opacity: 0.7;
		filter: blur(3.5px);
		z-index: 1;
		transition: opacity 0.25s ease;
	}

	.back-voutline {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		opacity: 0.3;
		z-index: 2;
		transition: opacity 0.25s ease;
	}

	.envelope:not(.closed):has(.front:hover) .back-vshadow,
	.envelope:not(.closed):has(.front:hover) .back-voutline {
		opacity: 0;
	}

	.front {
		position: absolute;
		inset: 0;
		clip-path: polygon(0 100%, 0 35%, 50% 78%, 100% 35%, 100% 100%);
		z-index: 4;
		filter: blur(1.2px);
		transition: opacity 0.25s ease;
	}

	.envelope:not(.closed) .front:hover {
		opacity: 0.25;
	}

	.mail-stamp {
		position: absolute;
		top: 68%;
		left: 50%;
		width: 32cqw;
		height: auto;
		transform: translate(-50%, -50%) rotate(-9deg);
		filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.45));
		z-index: 60;
		pointer-events: none;
		animation: stamp-slap 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	@keyframes stamp-slap {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) rotate(-9deg) scale(2.2);
		}
		60% {
			opacity: 1;
			transform: translate(-50%, -50%) rotate(-9deg) scale(0.92);
		}
		100% {
			opacity: 1;
			transform: translate(-50%, -50%) rotate(-9deg) scale(1);
		}
	}

	.flap-group {
		position: absolute;
		top: 1.5%;
		left: 0;
		width: 100%;
		height: 78%;
		transform-origin: top center;
		transform: rotateX(178deg);
		transition:
			transform 0.7s cubic-bezier(0.55, 0.05, 0.4, 1),
			top 0.7s ease-out;
		z-index: 2;
		pointer-events: none;
	}

	.envelope.closed .flap-group {
		top: 0;
		transform: rotateX(0deg);
		z-index: 5;
	}

	.flap {
		position: absolute;
		inset: 0;
		background: #c92842;
		clip-path: polygon(
			0 0.5%,
			11% 0.2%,
			23% 0.9%,
			36% 0.3%,
			50% 0.7%,
			63% 0.2%,
			77% 0.8%,
			89% 0.4%,
			100% 0.6%,
			100% 44.87%,
			50% 100%,
			0 44.87%
		);
		filter: blur(0.6px);
	}

	.flap::before {
		opacity: 0.35;
	}

	.flap::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4cqw;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), transparent);
		z-index: 2;
		pointer-events: none;
		transition: opacity 0.3s ease-out 0.15s;
	}

	.envelope.closed .flap::after {
		opacity: 0;
	}

	.flap-outline {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		transition: opacity 0.1s ease-out;
	}

	.envelope.closed .flap-outline {
		opacity: 0;
	}

	.flap-outline path {
		fill: none;
		stroke: black;
		stroke-width: clamp(0.15rem, 0.25vw, 0.4rem);
		vector-effect: non-scaling-stroke;
		stroke-linejoin: miter;
		stroke-linecap: butt;
	}

	.sticker-clip {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 3;
		clip-path: polygon(0 -1000%, 100% -1000%, 100% 100%, 0 100%);
	}

	.falling-sticker {
		position: absolute;
		top: var(--ly);
		left: var(--lx);
		width: var(--size);
		height: auto;
		transform: translate3d(calc(-50% + var(--x) * 1vw), calc(-50% - 130vh), 0) rotate(var(--rs));
		opacity: 0;
		cursor: grab;
		user-select: none;
		-webkit-user-drag: none;
		border-radius: 0.5rem;
		filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.35));
		animation: fall var(--dur) linear var(--delay) forwards;
		z-index: 3;
		will-change: transform;
		backface-visibility: hidden;
	}

	.falling-sticker:active {
		cursor: grabbing;
	}

	@keyframes fall {
		0% {
			transform: translate3d(calc(-50% + var(--x) * 1vw), calc(-50% - 130vh), 0) rotate(var(--rs));
			opacity: 0;
		}
		8% {
			opacity: 1;
		}
		100% {
			transform: translate3d(-50%, -50%, 0) rotate(var(--re));
			opacity: 1;
		}
	}

	.receipt {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		width: var(--sidebar-w);
		box-sizing: border-box;
		background: #1d1c23;
		border-right: clamp(0.15rem, 0.22vw, 0.35rem) solid #37373c;
		color: white;
		padding: clamp(1.5rem, 2.5vw, 2.5rem) clamp(1.2rem, 1.8vw, 1.8rem);
		display: flex;
		flex-direction: column;
		gap: clamp(1rem, 1.5vw, 1.5rem);
		overflow-y: auto;
		font-size: clamp(0.85rem, 0.95vw, 1.05rem);
		z-index: 5;
	}

	.receipt-head {
		padding-bottom: clamp(0.8rem, 1.2vw, 1.2rem);
		border-bottom: 1px solid #37373c;
	}

	.receipt-tag {
		display: block;
		font-size: 0.72em;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #56565d;
		margin-bottom: 0.45rem;
	}

	.receipt h2 {
		margin: 0;
		font-weight: 600;
		font-style: italic;
		font-size: clamp(1.3rem, 1.8vw, 1.8rem);
		color: white;
	}

	.receipt-items {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: clamp(0.55rem, 0.85vw, 0.9rem);
		flex: 1;
	}

	.receipt-items li {
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}

	.receipt-items img {
		width: clamp(1.6rem, 2vw, 2.2rem);
		height: clamp(1.6rem, 2vw, 2.2rem);
		object-fit: contain;
		flex-shrink: 0;
	}

	.receipt-items .item-name {
		font-weight: 500;
		white-space: nowrap;
		color: white;
	}

	.receipt-items .dots {
		flex: 1;
		min-width: 1rem;
		border-bottom: 1px dotted #37373c;
		transform: translateY(-0.25em);
	}

	.receipt-items .qty {
		font-variant-numeric: tabular-nums;
		color: #56565d;
	}

	.ship-to {
		padding-top: clamp(0.8rem, 1.2vw, 1.2rem);
		border-top: 1px solid #37373c;
	}

	.ship-label {
		display: block;
		font-size: 0.7em;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		font-weight: 600;
		color: #56565d;
		margin-bottom: 0.5rem;
	}

	.ship-to address {
		font-style: normal;
		line-height: 1.45;
		font-weight: 500;
		color: white;
	}

	.update-address {
		display: inline-block;
		margin-top: 0.6rem;
		font-size: 0.78em;
		color: #a3a3ad;
		text-decoration: none;
		border-bottom: 1px dotted #56565d;
		padding-bottom: 1px;
		transition:
			color 0.12s ease,
			border-color 0.12s ease;
	}

	.update-address:hover {
		color: white;
		border-bottom-color: white;
		text-decoration: none;
	}

	@media (max-width: 720px) {
		.scene {
			--sidebar-w: 0px;
		}
		.receipt {
			display: none;
		}
		.headline {
			font-size: clamp(1.1rem, 5vw, 1.6rem);
		}
	}
</style>
