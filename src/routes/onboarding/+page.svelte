<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import '../page.css';

	const nextHref = resolve('/onboarding/free');

	let arenaEl: HTMLElement;
	let cardEls: HTMLElement[] = [];
	let pathD = $state('');
	let arrowD = $state('');

	const TY = [0, 60, 0, 60];

	function catmullRomToBezier(pts: [number, number][]): string {
		if (pts.length < 2) return '';
		const segments: string[] = [`M ${pts[0][0]} ${pts[0][1]}`];
		for (let i = 0; i < pts.length - 1; i++) {
			const p0 = pts[Math.max(i - 1, 0)];
			const p1 = pts[i];
			const p2 = pts[i + 1];
			const p3 = pts[Math.min(i + 2, pts.length - 1)];
			const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
			const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
			const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
			const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
			segments.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`);
		}
		return segments.join(' ');
	}

	function buildPath() {
		if (!arenaEl || cardEls.length < 4) return;
		const pts: [number, number][] = cardEls.map((el, i) => [
			el.offsetLeft + el.offsetWidth / 2,
			el.offsetTop + el.offsetHeight / 2 + TY[i]
		]);

		pathD = catmullRomToBezier(pts);

		const last = pts[pts.length - 1];
		const secondLast = pts[pts.length - 2];
		const dx = last[0] - secondLast[0];
		const dy = last[1] - secondLast[1];
		const len = Math.sqrt(dx * dx + dy * dy);
		const ux = dx / len;
		const uy = dy / len;
		const size = 18;
		const ax = last[0] - ux * size - uy * size * 0.6;
		const ay = last[1] - uy * size + ux * size * 0.6;
		const bx = last[0] - ux * size + uy * size * 0.6;
		const by = last[1] - uy * size - ux * size * 0.6;
		arrowD = `M ${last[0]} ${last[1]} L ${ax} ${ay} M ${last[0]} ${last[1]} L ${bx} ${by}`;
	}

	onMount(() => {
		requestAnimationFrame(() => buildPath());
		const observer = new ResizeObserver(() => buildPath());
		observer.observe(arenaEl);
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>welcome to stickers</title>
	<link
		rel="preload"
		href="https://cdn.hackclub.com/019dd9d6-0ef3-7e31-845b-efe8427006b8/image.png"
		as="image"
	/>
	<link
		rel="preload"
		href="https://cdn.hackclub.com/019debab-836a-7077-9081-fe1b95b764a3/hampter-s2.png"
		as="image"
	/>
	<link
		rel="preload"
		href="https://cdn.hackclub.com/019debae-dc58-7f1c-a343-591454574143/hampter-s3.png"
		as="image"
	/>
	<link
		rel="preload"
		href="https://cdn.hackclub.com/019debd8-f3bb-72ed-b514-a1e3c0a9adbf/hampter-s4.png"
		as="image"
	/>
</svelte:head>

<main class="welcome-scene">
	<div class="welcome-card">
		<h1 class="welcome-title">welcome!</h1>
		<p class="welcome-sub">here's how stickers works:</p>

		<div class="step-arena" bind:this={arenaEl}>
			<div class="step-grid">
				<div class="step-item" bind:this={cardEls[0]}>
					<img
						src="https://cdn.hackclub.com/019debde-4fbd-792e-b04c-cf7d389f9baa/hampter-s1.png"
						alt=""
						role="presentation"
						decoding="async"
					/>
					make creative projects
				</div>
				<div class="step-item step-item--yellow" bind:this={cardEls[1]}>
					<img
						src="https://cdn.hackclub.com/019debab-836a-7077-9081-fe1b95b764a3/hampter-s2.png"
						alt=""
						role="presentation"
						decoding="async"
					/>
					get tokens for your efforts!
				</div>
				<div class="step-item step-item--green" bind:this={cardEls[2]}>
					<img
						src="https://cdn.hackclub.com/019debae-dc58-7f1c-a343-591454574143/hampter-s3.png"
						alt=""
						role="presentation"
						decoding="async"
					/>
					buy stickers from the shop
				</div>
				<div class="step-item step-item--blue" bind:this={cardEls[3]}>
					<img
						src="https://cdn.hackclub.com/019debd8-f3bb-72ed-b514-a1e3c0a9adbf/hampter-s4.png"
						alt=""
						role="presentation"
						decoding="async"
					/>
					we'll mail them to you!
					<span class="step-tag">FREE · 13-18</span>
				</div>
			</div>

			<svg
				class="step-path"
				aria-hidden="true"
				style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;"
			>
				<path
					d={pathD}
					fill="none"
					stroke="white"
					stroke-width="4"
					stroke-dasharray="10 12"
					stroke-linecap="round"
					opacity="0.35"
				/>
				<path
					d={arrowD}
					fill="none"
					stroke="white"
					stroke-width="4"
					stroke-linecap="round"
					opacity="0.5"
				/>
			</svg>
		</div>

		<a href={nextHref} class="welcome-btn">
			let's go
			<svg
				fill-rule="evenodd"
				clip-rule="evenodd"
				stroke-linejoin="round"
				stroke-miterlimit="1.414"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				viewBox="0 0 32 32"
				preserveAspectRatio="xMidYMid meet"
				fill="currentColor"
				class="welcome-btn-icon"
				><path
					paint-order="stroke fill"
					stroke="black"
					stroke-width="5"
					stroke-linejoin="round"
					d="M18.496,10.132c-0.479,-0.274 -1.09,-0.108 -1.364,0.372c-0.274,0.479 -0.108,1.09 0.372,1.364c1.554,0.886 3.031,1.929 4.357,3.132l-13.861,0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1l13.861,0c-1.326,1.203 -2.803,2.246 -4.357,3.132c-0.48,0.274 -0.646,0.885 -0.372,1.364c0.274,0.48 0.885,0.646 1.364,0.372c2.16,-1.237 4.859,-2.886 6.237,-5.061c0.076,-0.12 0.267,-0.431 0.267,-0.807c0,-0.376 -0.191,-0.687 -0.267,-0.807c-1.403,-2.215 -4.021,-3.792 -6.237,-5.061Z"
				/></svg
			>
		</a>
	</div>
</main>

<style>
	.welcome-scene {
		position: fixed;
		inset: 0;
		overflow: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding: clamp(1.5rem, 3vw, 3rem) 2rem clamp(3rem, 5vw, 5rem);
		background-size: var(--page-grid) var(--page-grid);
		background-color: #141318;
		background-image:
			linear-gradient(to right, #1c1c20 var(--page-grid-line), transparent var(--page-grid-line)),
			linear-gradient(to bottom, #1c1c20 var(--page-grid-line), transparent var(--page-grid-line));
		background-position: calc(var(--page-grid) / 2) calc(var(--page-grid) / 2);
		font-family: 'Phantom Sans', sans-serif;
	}

	.welcome-card {
		max-width: min(90vw, 112rem);
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(1.2rem, 2.5vw, 2.5rem);
		text-align: center;
	}

	.welcome-title {
		margin: 0;
		font-weight: bold;
		font-style: italic;
		font-size: clamp(1.8rem, 4vw, 4.5rem);
		line-height: 1.1;
		color: white;
		-webkit-text-stroke: black clamp(0.18rem, 0.32vw, 0.45rem);
		paint-order: stroke fill;
	}

	.welcome-sub {
		margin: 0;
		color: #c8c8d0;
		font-size: clamp(1rem, 1.5vw, 1.7rem);
		line-height: 1.5;
	}

	.step-arena {
		position: relative;
		width: 100%;
		overflow: visible;
		margin-top: clamp(1.5rem, 2.5vw, 3rem);
	}

	.step-grid {
		counter-reset: step;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: clamp(2rem, 4vw, 5rem);
		overflow: visible;
		padding-bottom: 70px;
		align-items: start;
	}

	.step-path {
		z-index: 1;
		animation: path-fade-in 800ms ease 400ms both;
	}

	@keyframes path-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.step-item {
		--r: 0deg;
		--ty: 0px;
		counter-increment: step;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: clamp(1.2rem, 2.5vw, 3.5rem);
		background-color: #ed344f;
		border: clamp(0.15rem, 0.25vw, 0.4rem) solid black;
		border-radius: 1.5rem;
		padding: clamp(1.4rem, 3vw, 4.5rem) clamp(1rem, 1.5vw, 1.8rem);
		font-weight: bold;
		font-size: clamp(1rem, 1.5vw, 1.8rem);
		color: white;
		-webkit-text-stroke: black clamp(0.15rem, 0.22vw, 0.35rem);
		paint-order: stroke fill;
		text-align: center;
		box-shadow: 3px 5px 0 rgba(0, 0, 0, 0.5);
		transform: translateY(var(--ty)) rotate(var(--r)) scale(1) translateZ(0);
		animation: card-in 700ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
		transition: transform 0.2s ease;
		will-change: transform;
		min-width: 0;
		z-index: 2;
	}

	.step-item:nth-child(1) {
		--r: -1.8deg;
		--ty: 0px;
		animation-delay: 0ms;
	}
	.step-item:nth-child(2) {
		--r: 1.2deg;
		--ty: 60px;
		animation-delay: 130ms;
	}
	.step-item:nth-child(3) {
		--r: -1deg;
		--ty: 0px;
		animation-delay: 260ms;
	}
	.step-item:nth-child(4) {
		--r: 1.6deg;
		--ty: 60px;
		animation-delay: 390ms;
	}

	.step-item:hover {
		transform: translateY(calc(var(--ty) - 10px)) rotate(var(--r)) scale(1) translateZ(0);
	}

	.step-item::before {
		content: counter(step);
		position: absolute;
		top: -12px;
		left: -10px;
		width: clamp(2.4rem, 3.2vw, 3.8rem);
		height: clamp(2.4rem, 3.2vw, 3.8rem);
		background-color: black;
		color: white;
		font-size: clamp(1.3rem, 1.7vw, 2rem);
		font-weight: bold;
		-webkit-text-stroke: none;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		transform: rotate(-12deg);
	}

	.step-item--yellow {
		background-color: #f5ee49;
	}
	.step-item--green {
		background-color: #239640;
	}
	.step-item--blue {
		background-color: #3758c4;
	}

	.step-item img {
		width: clamp(7rem, 11vw, 15rem);
		height: clamp(7rem, 11vw, 15rem);
		object-fit: contain;
		pointer-events: none;
		user-select: none;
		-webkit-user-drag: none;
	}

	.step-tag {
		position: absolute;
		bottom: -14px;
		right: -10px;
		transform: rotate(6deg);
		background-color: white;
		color: black;
		font-family: 'Phantom Sans', sans-serif;
		font-size: 1rem;
		font-weight: bold;
		letter-spacing: 0.1em;
		padding: 0.35rem 0.8rem;
		border-radius: 0.5rem;
		border: 2px solid black;
		box-shadow: 3px 5px 0 rgba(0, 0, 0, 0.5);
		white-space: nowrap;
		-webkit-text-stroke-width: 0;
	}

	.welcome-btn {
		font-family: 'Phantom Sans', sans-serif;
		font-size: clamp(1.2rem, 1.8vw, 1.8rem);
		font-weight: bold;
		padding: clamp(1rem, 1.4vw, 1.4rem) clamp(2.5rem, 3.5vw, 3.5rem);
		color: white;
		-webkit-text-stroke: black clamp(0.22rem, 0.35vw, 0.42rem);
		paint-order: stroke fill;
		border: clamp(0.15rem, 0.22vw, 0.35rem) solid black;
		border-radius: 999px;
		cursor: pointer;
		box-shadow: 3px 5px 0 rgba(0, 0, 0, 0.5);
		text-decoration: none;
		background: #f0f0f0;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: clamp(1.5rem, 2.5vw, 3rem);
		position: relative;
		isolation: isolate;
		transition: box-shadow 0.12s ease, transform 240ms ease;
	}

	.welcome-btn::after {
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
		opacity: 0;
		transition: opacity 0.25s ease;
		z-index: -1;
	}

	.welcome-btn:hover::after {
		opacity: 1;
	}

	.welcome-btn-icon {
		width: 1.1em;
		height: 1.1em;
		flex-shrink: 0;
	}

	.welcome-btn:hover {
		transform: translateY(-2px);
		box-shadow: 5px 8px 0 rgba(0, 0, 0, 0.5);
		text-decoration: none;
		color: white;
	}

	@keyframes rainbow-shift {
		0% {
			background-position: 0% 50%;
		}
		100% {
			background-position: 100% 50%;
		}
	}

	.welcome-btn-icon {
		transition: transform 0.15s;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}

	.welcome-btn:hover .welcome-btn-icon {
		transform: translateX(0.3rem);
	}

	.welcome-btn:active {
		transform: translateY(2px);
		box-shadow: 1px 2px 0 rgba(0, 0, 0, 0.5);
	}

	@keyframes card-in {
		from {
			opacity: 0;
			transform: translateY(calc(var(--ty) + 20px)) rotate(var(--r)) scale(0.94) translateZ(0);
		}
	}

	@media (max-width: 900px) {
		.step-grid {
			grid-template-columns: repeat(2, 1fr);
			padding-bottom: 0;
		}

		.step-item {
			--ty: 0px !important;
		}

		.step-path {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.step-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
