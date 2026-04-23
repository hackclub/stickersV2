<script lang="ts">
	import './page.css';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	const home = resolve('/');

	const bgStickers = [
		{
			src: 'https://cdn.hackclub.com/019d730b-513b-7efa-a4bb-0aebcfb397b7/3wqTb6Vzcjd7HVEovqW7zn7CM7RMwBf-u1nL_eGpR9M',
			top: 8,
			left: 6,
			size: 20,
			dur: 22,
			delay: 0,
			rot: -14
		}, // kawaii
		{
			src: 'https://cdn.hackclub.com/019d730a-b2f2-7daf-832f-90df3b78e4eb/TItCSknK9qP-XN9oCqAz6kkwVdjDarWU8468JgO1osM',
			top: 18,
			left: 82,
			size: 11,
			dur: 26,
			delay: -5,
			rot: 12
		}, // drake
		{
			src: 'https://cdn.hackclub.com/019d730b-766a-7cb4-ac34-ec2cdeab9260/e7ibKbv-Wg8ABpJMfnpbIxQcEjWrZATLIyxlq5_tbAI',
			top: 72,
			left: 10,
			size: 14,
			dur: 24,
			delay: -10,
			rot: 18
		}, // nasa
		{
			src: 'https://cdn.hackclub.com/019d730a-e3aa-74d7-9bc3-e2699195ad2a/WT7qHNSIeKcZrJJXdoumXD9r_fyRnG8d0D169XL-xzI',
			top: 68,
			left: 78,
			size: 15,
			dur: 28,
			delay: -3,
			rot: -9
		}, // grab
		{
			src: 'https://cdn.hackclub.com/019d730b-6891-7e2f-94e7-7ae12c005aa0/kUZDRDYxRQYj81Y58kQx2IGDXuSCAj1HJmtkRtSPMU8',
			top: 48,
			left: 3,
			size: 10,
			dur: 30,
			delay: -8,
			rot: 6
		}, // macintosh
		{
			src: 'https://cdn.hackclub.com/019d730a-eaf5-711f-9196-c3b5021c5b4f/ZLdwcaB7eVfe6fScCgfdfSWY-XLvp5Ido9JCV4wW8Lw',
			top: 40,
			left: 88,
			size: 19,
			dur: 25,
			delay: -12,
			rot: -16
		} // hack cola
	];

	const rotatingMessages = [
		'stocking the shelves',
		'licking the envelopes',
		'herding the raccoons',
		'peeling the backings',
		'drawing new designs'
	];

	let msgIdx = $state(0);

	onMount(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) return;
		const interval = setInterval(() => {
			msgIdx = (msgIdx + 1) % rotatingMessages.length;
		}, 2800);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Catalog - Stickers</title>
	<link
		rel="preload"
		href="https://assets.hackclub.com/fonts/Phantom_Sans_0.7/SemiboldItalic.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
	<link
		rel="preload"
		href="https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Regular.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

<div class="page">
	<a href={home} class="back-link">← home</a>

	<div class="bg-stickers" aria-hidden="true">
		{#each bgStickers as s, i (i)}
			<img
				class="bg-sticker"
				src={s.src}
				alt=""
				decoding="async"
				loading="lazy"
				draggable="false"
				style="top: {s.top}%; left: {s.left}%; width: calc(max({s.size *
					0.65}rem, {s.size}vw) * var(--sticker-scale, 0.9)); animation-duration: {s.dur}s; animation-delay: {s.delay}s; --r: {s.rot}deg;"
			/>
		{/each}
	</div>

	<div class="content">
		<h1>under construction</h1>
		<p class="subtitle">
			{#key msgIdx}
				<span class="rotating"
					>{rotatingMessages[msgIdx]}<span class="ellipsis" aria-hidden="true"></span></span
				>
			{/key}
		</p>
		<a class="cta" href={home}>← back to the landing</a>
	</div>

	<footer>
		made with &lt;3 by <a href="https://github.com/maxstellar">maxstellar</a> and
		<a href="https://hackclub.com">hack club</a>
	</footer>
</div>
