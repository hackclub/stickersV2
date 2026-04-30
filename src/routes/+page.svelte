<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { resolve } from '$app/paths';
	import { slide } from 'svelte/transition';
	import './page.css';
	import sepImg from '$lib/assets/sep.png';

	const catalog = resolve('/catalog');

	type StickerAsset = { src: string; size: number };
	type Slot = { x: number; y: number; z: number };
	type Sticker = Slot & StickerAsset & { id: number; rotation: number; visible: boolean };

	type PeelStageInstance = import('$lib/peel/peel').PeelStage;

	const stickerPool: StickerAsset[] = [
		{ src: '/stickers/nasa.svg', size: 14 },
		{ src: '/stickers/juice.png', size: 12 },
		{ src: '/stickers/boba.png', size: 9 },
		{ src: '/stickers/hc-inside.png', size: 9 },
		{ src: '/stickers/kawaii.png', size: 20 },
		{ src: '/stickers/drake.svg', size: 11 },
		{ src: '/stickers/undertale.svg', size: 19 },
		{ src: '/stickers/skullpup-boba.png', size: 13 },
		{ src: '/stickers/macintosh.svg', size: 10 },
		{ src: '/stickers/grab.png', size: 15 },
		{ src: '/stickers/yippee.png', size: 10 },
		{ src: '/stickers/airlines.png', size: 20 },
		{ src: '/stickers/logo.png', size: 11 },
		{ src: '/stickers/heidi-pleading.png', size: 11 },
		{ src: '/stickers/hack-cola.svg', size: 19 }
	];

	const slots: Slot[] = [
		{ x: 11, y: 28, z: 1 },
		{ x: 78, y: 16, z: 2 },
		{ x: 22, y: 67, z: 3 },
		{ x: 72, y: 65, z: 4 },
		{ x: 58, y: 5, z: 5 },
		{ x: 32, y: 5, z: 6 }
	];

	const stickers: Sticker[] = $state(
		slots.map((slot, i) => ({
			id: i + 1,
			...slot,
			...stickerPool[i % stickerPool.length],
			rotation: 0,
			visible: false
		}))
	);

	let peelStage: PeelStageInstance | null = null;
	let useWebGL = $state(false);
	let dragging: number | null = $state(null);
	let dragOffset = { x: 0, y: 0 };
	let topZ = $state(slots.length + 1);
	let heroEl: HTMLDivElement;
	let titleEl: HTMLElement;
	let catalogEl: HTMLAnchorElement;
	let scrollY = $state(0);
	let openFaq = $state<number | null>(null);

	type FaqPart = string | { text: string; href: string };
	type Faq = { q: string; a: string | FaqPart[] };

	const faqs: Faq[] = [
		{
			q: 'why stickers?',
			a: 'we believe every hack clubber should have access to free and high-quality stickers. this program lets you choose what stickers you receive, so you not only get free stickers, but the stickers you actually want.'
		},
		{
			q: 'how do i get tokens?',
			a: "ship creative, unique, and high-quality projects through our dashboard, and you'll receive a set amount of x tokens / hour shipped! if your projects are REALLY cool, you might even get a token boost from your reviewer."
		},
		{
			q: 'what are "sticker boxes?"',
			a: 'sticker boxes are our plan to bring monthly subscriptions to the YSWS model (lol). every month in the shop, for 10 hours worth of tokens you can buy one "sticker box" that will contain exclusive stickers, signed postcards, and more hack club goodies!'
		},
		{
			q: 'is this free?',
			a: "yep, completely free! all it takes is your hard work and creativity. we'll also cover shipping (except customs fees)!"
		},
		{ q: 'who is eligible?', a: 'to participate, you need to be between the ages of 13 and 18!' },
		{
			q: 'how many projects can i make?',
			a: "there's no limit, so you can make as many as you please! mo' projects, mo' stickers. and that's a good thing!"
		},
		{
			q: 'can i put stickers on my forehead? ',
			a: "legally, we can't stop you, and truthfully, we don't want to."
		},
		{
			q: 'is this legit? ',
			a: [
				"yep! hack club is the world's largest community of teenage makers, and a 501(c)(3) nonprofit. we've hosted programs like ",
				{ text: 'high seas', href: 'https://highseas.hackclub.com/' },
				' and ',
				{ text: 'summer of making', href: 'https://summer.hackclub.com/' },
				" which gave out prizes like devboards, keyboards, and even 3d printers! we're supported by donations from companies like GitHub or AMD, as well as generous individuals."
			]
		}
	];

	onMount(() => {
		const isMobile =
			/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
			('ontouchstart' in window && window.innerWidth < 1024);
		useWebGL = !isMobile;

		const lockHeroHeight = () => {
			heroEl.style.height = `${window.innerHeight}px`;
		};
		if (isMobile) {
			lockHeroHeight();
			window.addEventListener('orientationchange', lockHeroHeight);
		}

		const shuffled = [...stickerPool].sort(() => Math.random() - 0.5);
		for (let i = 0; i < stickers.length; i++) {
			const pick = shuffled[i % shuffled.length];
			stickers[i].src = pick.src;
			stickers[i].size = pick.size;
			stickers[i].rotation = Math.random() * 30 - 15;
		}

		if (useWebGL) {
			void start();
		} else {
			void startDom();
		}

		return () => {
			if (isMobile) window.removeEventListener('orientationchange', lockHeroHeight);
			peelStage?.destroy();
			peelStage = null;
		};
	});

	const aspects: Record<number, number> = {};

	function preloadAspects(): Promise<void> {
		return Promise.all(
			stickers.map(
				(s) =>
					new Promise<void>((res) => {
						const img = new Image();
						img.onload = () => {
							aspects[s.id] =
								img.naturalWidth > 0 && img.naturalHeight > 0
									? img.naturalWidth / img.naturalHeight
									: 1;
							res();
						};
						img.onerror = () => {
							aspects[s.id] = 1;
							res();
						};
						img.src = s.src;
					})
			)
		).then(() => undefined);
	}

	async function startDom() {
		await preloadAspects();
		await tick();
		layoutStickers();
		const order = stickers.map((_, i) => i).sort(() => Math.random() - 0.5);
		order.forEach((idx, i) => {
			setTimeout(() => {
				stickers[idx].visible = true;
			}, 150 + i * 180);
		});
	}

	const CLICK_THRESHOLD_PX = 6;
	let pressStart = { x: 0, y: 0, moved: false };

	function onPointerDown(e: PointerEvent, sticker: Sticker) {
		dragging = sticker.id;
		sticker.z = topZ++;
		const rect = heroEl.getBoundingClientRect();
		dragOffset = {
			x: e.clientX - rect.left - (sticker.x / 100) * rect.width,
			y: e.clientY - rect.top - (sticker.y / 100) * rect.height
		};
		pressStart = { x: e.clientX, y: e.clientY, moved: false };
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (dragging === null) return;
		if (
			!pressStart.moved &&
			Math.hypot(e.clientX - pressStart.x, e.clientY - pressStart.y) > CLICK_THRESHOLD_PX
		) {
			pressStart.moved = true;
		}
		if (!pressStart.moved) return;
		const rect = heroEl.getBoundingClientRect();
		const sticker = stickers.find((s) => s.id === dragging);
		if (sticker) {
			sticker.x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
			sticker.y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
		}
	}

	function onPointerUp() {
		dragging = null;
	}

	async function start() {
		const reduceMotion =
			typeof window !== 'undefined' &&
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) {
			console.log('[peel] start skipped: prefers-reduced-motion');
			return;
		}

		try {
			await preloadAspects();
			await tick();
			layoutStickers();
			console.log('[peel] layout done', stickers.map((s) => ({ id: s.id, x: s.x, y: s.y })));

			const mod = await import('$lib/peel/peel');
			console.log('[peel] module loaded');
			peelStage = new mod.PeelStage(heroEl);
			console.log('[peel] PeelStage constructed');

			const adds = stickers.map((s) =>
				peelStage!
					.add({
						id: s.id,
						src: s.src,
						xPct: s.x,
						yPct: s.y,
						rotationDeg: s.rotation,
						sizeRem: s.size * 0.65,
						sizeVw: s.size,
						sizeScale: stickerScale(),
						z: s.z
					})
					.then(() => console.log('[peel] added', s.id))
					.catch((err) => console.error('[peel] add failed', s.id, s.src, err))
			);
			await Promise.all(adds);

			const order = stickers.map((_, i) => i).sort(() => Math.random() - 0.5);
			order.forEach((idx, i) => {
				peelStage!.scheduleAppear(stickers[idx].id, 150 + i * 180);
			});
			peelStage!.startIdleWiggleLoop(6000);
			console.log('[peel] start complete');
		} catch (err) {
			console.error('[peel] start failed:', err);
		}
	}

	function stickerScale(): number {
		const w = window.innerWidth;
		if (w <= 455) return 0.63;
		if (w <= 640) return 0.77;
		return 0.9;
	}

	function layoutStickers() {
		const heroRect = heroEl.getBoundingClientRect();
		const rootFontPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
		const scale = stickerScale();

		const pad = 3;
		const toZone = (r: DOMRect) => ({
			left: ((r.left - heroRect.left) / heroRect.width) * 100 - pad,
			right: ((r.right - heroRect.left) / heroRect.width) * 100 + pad,
			top: ((r.top - heroRect.top) / heroRect.height) * 100 - pad,
			bottom: ((r.bottom - heroRect.top) / heroRect.height) * 100 + pad
		});
		const zone = toZone(titleEl.getBoundingClientRect());
		const catalogZone = toZone(catalogEl.getBoundingClientRect());

		// approximate sticker box size in % of hero, assuming square layout box;
		// the WebGL stage will use the actual texture aspect when sizing the mesh
		const sizes = stickers.map((s) => {
			const wPx = Math.max(s.size * 0.65 * rootFontPx, (s.size / 100) * heroRect.width) * scale;
			const aspect = aspects[s.id] || 1;
			const hPx = wPx / aspect;
			return {
				sW: (wPx / heroRect.width) * 100,
				sH: (hPx / heroRect.height) * 100
			};
		});

		const hitsRect = (
			x: number,
			y: number,
			sW: number,
			sH: number,
			r: { left: number; right: number; top: number; bottom: number }
		) => x < r.right && x + sW > r.left && y < r.bottom && y + sH > r.top;
		const hitsZone = (x: number, y: number, sW: number, sH: number) =>
			hitsRect(x, y, sW, sH, zone) || hitsRect(x, y, sW, sH, catalogZone);

		const vMargin = 8;
		for (let i = 0; i < stickers.length; i++) {
			const sticker = stickers[i];
			const { sW, sH } = sizes[i];

			if (hitsZone(sticker.x, sticker.y, sW, sH)) {
				const centerX = sticker.x + sW / 2;
				const zoneCenter = (zone.left + zone.right) / 2;
				if (centerX < zoneCenter) {
					sticker.x = Math.max(1, zone.left - sW - pad);
				} else {
					sticker.x = Math.min(99 - sW, zone.right + pad);
				}
			}

			const hMargin = 1;
			sticker.x = Math.max(hMargin, Math.min(100 - sW - hMargin, sticker.x));
			sticker.y = Math.max(vMargin, Math.min(100 - sH - vMargin, sticker.y));
		}

		type Box = { x: number; y: number; sW: number; sH: number };
		const placedBoxes: Box[] = [];

		for (let i = 0; i < stickers.length; i++) {
			const sticker = stickers[i];
			const { sW, sH } = sizes[i];

			const hitsPlaced = (x: number, y: number) =>
				placedBoxes.some(
					(b: Box) => x < b.x + b.sW && x + sW > b.x && y < b.y + b.sH && y + sH > b.y
				);

			const isOpen = (x: number, y: number) =>
				x >= 0 &&
				y >= vMargin &&
				x + sW <= 100 &&
				y + sH <= 100 - vMargin &&
				!hitsZone(x, y, sW, sH) &&
				!hitsPlaced(x, y);

			if (hitsPlaced(sticker.x, sticker.y) || hitsZone(sticker.x, sticker.y, sW, sH)) {
				let bestPos: { x: number; y: number } | null = null;
				let bestDist = Infinity;

				for (let gx = 0; gx <= 100 - sW; gx += 5) {
					for (let gy = vMargin; gy <= 100 - sH - vMargin; gy += 5) {
						if (isOpen(gx, gy)) {
							const dist = Math.hypot(gx - sticker.x, gy - sticker.y);
							if (dist < bestDist) {
								bestDist = dist;
								bestPos = { x: gx, y: gy };
							}
						}
					}
				}

				if (bestPos) {
					sticker.x = bestPos.x;
					sticker.y = bestPos.y;
				}
			}

			// shift to box center so stage receives center coords (matches WebGL placement)
			placedBoxes.push({ x: sticker.x, y: sticker.y, sW, sH });
			sticker.x = sticker.x + sW / 2;
			sticker.y = sticker.y + sH / 2;
		}
	}
</script>

<svelte:head>
	{#each stickerPool as asset (asset.src)}
		<link rel="preload" href={asset.src} as="image" type={asset.src.endsWith('.svg') ? 'image/svg+xml' : 'image/png'} />
	{/each}
	<link
		rel="preload"
		href="https://assets.hackclub.com/flag-standalone-wtransparent.svg"
		as="image"
	/>
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
	<title>Stickers - Hack Club</title>
</svelte:head>

<svelte:window bind:scrollY />

<!-- <a href="https://hackclub.com"><img id="home" src="https://assets.hackclub.com/flag-orpheus-top.svg" class="hc-logo" loading="lazy" decoding="async" style="position: absolute; top: 0; left: 2vw; height: 7vw; min-height: 7rem; z-index: 20;" alt="Hack Club flag"></a> -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="hero"
	bind:this={heroEl}
	onpointermove={useWebGL ? undefined : onPointerMove}
	onpointerup={useWebGL ? undefined : onPointerUp}
	style="--bg-offset-y: {scrollY * 0.2}px"
>
	<a href={catalog} class="catalog-link" bind:this={catalogEl}
		>catalog <span class="catalog-arrow">↗</span></a
	>
	{#if !useWebGL}
		{#each stickers as sticker (sticker.id)}
			<img
				class="sticker"
				class:dragging={dragging === sticker.id}
				class:placed={sticker.visible}
				src={sticker.src}
				alt=""
				role="presentation"
				decoding="async"
				fetchpriority="high"
				style="left: {sticker.x}%; top: {sticker.y}%; width: calc(max({sticker.size *
					0.65}rem, {sticker.size}vw) * var(--sticker-scale, 1)); z-index: {sticker.z}; --r: {sticker.rotation}deg;"
				onpointerdown={(e) => onPointerDown(e, sticker)}
				draggable="false"
			/>
		{/each}
	{/if}
	<section class="hero-title" bind:this={titleEl}>
		<a href="https://hackclub.com" aria-label="Hack Club homepage"
			><img
				class="hero-flag"
				src="https://assets.hackclub.com/flag-standalone-wtransparent.svg"
				alt="Hack Club"
				decoding="async"
			/></a
		>
		<h1>stickers</h1>
		<form method="GET" action="/auth/start">
			<input id="email" placeholder="your@email.com" type="email" name="login_hint" />
			<button id="submit" type="submit">Go!</button>
		</form>
	</section>
	<a
		class="scroll-arrow"
		href="#steps"
		aria-label="Scroll to steps"
		style="opacity: {scrollY > 0 ? 0 : 0.7}; pointer-events: {scrollY > 0 ? 'none' : 'auto'}"
	>
		<span>scroll</span>
		<svg
			width="32"
			height="32"
			viewBox="0 0 24 24"
			fill="none"
			stroke="white"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</a>
</div>

<img src={sepImg} alt="" role="presentation" class="sep sep-top" draggable="false" />

<section id="steps" class="steps">
	<h2>make projects. get stickers.</h2>
	<div>
		<img
			alt=""
			role="presentation"
			loading="lazy"
			decoding="async"
			src="https://cdn.hackclub.com/019dd9d6-0ef3-7e31-845b-efe8427006b8/image.png"
		/>make creative projects
	</div>
	<div>
		<img
			alt=""
			role="presentation"
			loading="lazy"
			decoding="async"
			src="https://cdn.hackclub.com/019dd9e8-3c94-7e2e-bec9-1da4f429cf12/image.png"
		/>get tokens for your efforts!
	</div>
	<div>
		<img
			alt=""
			role="presentation"
			loading="lazy"
			decoding="async"
			src="https://cdn.hackclub.com/019d93f7-1a10-7a99-8c05-abed82ea42f9/me%20when%20remove%20bg.png"
		/>buy stickers from the shop
	</div>
	<div>
		<img
			alt=""
			role="presentation"
			loading="lazy"
			decoding="async"
			src="https://cdn.hackclub.com/019d730c-5d3c-7aa7-8b2c-bc6a123cba01/0gH7FoPip8sxo_GVALeVgz4DR2qHd0s1HHVEn8NlO0o"
		/>we'll mail them to you!
	</div>
	<p class="steps-caption">Yes, all for free! Hack Club will send high quality stickers to your door if you are between 13-18 years old.</p>
</section>

<section class="faq">
	<div class="faq-bg"></div>
	<div class="faq-overlay"></div>
	<div class="faq-content">
		<h2>got questions?</h2>
		<div class="faq-grid">
			{#each faqs as faq, i (faq.q)}
				<div class="faq-item">
					<button
						class="faq-summary"
						aria-expanded={openFaq === i}
						aria-controls="faq-panel-{i}"
						id="faq-trigger-{i}"
						onclick={() => (openFaq = openFaq === i ? null : i)}
					>
						<span>{faq.q}</span>
						<span class="faq-icon" class:open={openFaq === i} aria-hidden="true">+</span>
					</button>
					{#if openFaq === i}
						<p
							id="faq-panel-{i}"
							role="region"
							aria-labelledby="faq-trigger-{i}"
							transition:slide={{ duration: 250 }}
						>
							{#if typeof faq.a === 'string'}
								{faq.a}
							{:else}
								{#each faq.a as part, j (j)}
									{#if typeof part === 'string'}
										{part}
									{:else}
										<a href={part.href} target="_blank" rel="external noopener noreferrer"
											>{part.text}</a
										>
									{/if}
								{/each}
							{/if}
						</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<img src={sepImg} alt="" role="presentation" class="sep sep-footer" draggable="false" />

<footer class="lander-footer">
	made with &lt;3 <a href="https://hackclub.com">by teenagers, for teenagers</a>
</footer>
