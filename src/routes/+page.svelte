<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { resolve } from '$app/paths';
	import { slide } from 'svelte/transition';
	import './page.css';
	import sepImg from '$lib/assets/sep.png';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
		if (reduceMotion) return;

		try {
			await preloadAspects();
			await tick();
			layoutStickers();

			const mod = await import('$lib/peel/peel');
			peelStage = new mod.PeelStage(heroEl);

			const getAvoidZones = () => {
				const heroRect = heroEl.getBoundingClientRect();
				const pad = 3;
				const toZone = (r: DOMRect) => ({
					left: ((r.left - heroRect.left) / heroRect.width) * 100 - pad,
					right: ((r.right - heroRect.left) / heroRect.width) * 100 + pad,
					top: ((r.top - heroRect.top) / heroRect.height) * 100 - pad,
					bottom: ((r.bottom - heroRect.top) / heroRect.height) * 100 + pad
				});
				return [
					toZone(titleEl.getBoundingClientRect()),
					toZone(catalogEl.getBoundingClientRect())
				];
			};

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
						z: s.z,
						avoidZones: getAvoidZones
					})
					.catch((err) => console.error('[peel] add failed', s.id, s.src, err))
			);
			await Promise.all(adds);

			const order = stickers.map((_, i) => i).sort(() => Math.random() - 0.5);
			order.forEach((idx, i) => {
				peelStage!.scheduleAppear(stickers[idx].id, 150 + i * 180);
			});
			peelStage!.startIdlePeelLoop();
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
		<a href="https://hackclub.com" aria-label="Hack Club homepage">
			<svg
				class="hero-flag"
				viewBox="0 0 526 184"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M 113.02734,0.09179687 C 75.816049,-1.1136606 58.24376,9.9899464 56.203125,11.375 c -0.1462,0.0992 -0.239847,0.226872 -0.310547,0.388672 L 30.5,69.898438 17.4375,115.76953 c -0.202,0.709 0.412926,1.38467 1.140625,1.26367 33.739566,-5.60199 60.27883,-0.49175 115.421875,14.74024 55.99994,15.46898 103.42609,35.92383 191,35.92383 81.18592,0 184.59116,-94.773928 199.24414,-108.599614 0.658,-0.621099 0.14328,-1.650672 -0.76172,-1.638672 -21.81498,0.2896 -41.29582,0.06588 -46.88281,-0.01172 -0.74,-0.0102 -1.20423,-0.794226 -0.86523,-1.453125 L 497.2168,14.177734 c 0.38,-0.740899 -0.80663,-1.868187 -1.51563,-1.429687 C 474.32819,25.981234 355.38366,92.170018 237.42578,35.609375 182.79127,9.4126012 141.96946,1.0293749 113.02734,0.09179687 Z M 91.03125,26.007812 c 4.365606,0.232518 9.0974,5.501274 9.58008,18.970704 -0.076,3.461392 -1.802053,7.161105 -1.251955,8.595703 0.1677,0.564898 14.255855,5.769531 14.255855,5.769531 0,0 5.01166,-11.664346 8.09766,-16.990234 5.77298,-14.467572 18.53267,-6.293326 14.80469,2.660156 -2.473,13.991372 -11.4393,40.450423 -13.36328,46.787109 -4.323,12.321779 -19.95378,14.324299 -14.5918,-2.355469 1.405,-6.430486 2.7793,-14.203124 2.7793,-14.203124 L 94.273438,68.699219 c -10e-7,0 -3.315669,6.621421 -6.539063,12.724609 -5.43829,11.052578 -24.4309,15.393562 -13.294922,-11.208984 5.36139,-16.679568 7.91339,-29.587777 9.242188,-37.101563 0.781592,-4.421059 3.954137,-7.286314 7.349609,-7.105469 z m 80.18359,15.998047 c 0.24134,0.0089 0.47718,0.0281 0.70899,0.05273 1.6,0.1324 3.77545,3.385626 5.43945,6.511718 5.448,20.58766 -4.31503,58.453093 -6.04101,60.996103 -5.942,9.59798 -16.36819,7.78304 -12.40821,-2.58594 1.85,-6.29898 3.83203,-12.025397 3.83203,-12.025397 L 149.25,93.447266 c -10.60498,20.602064 -20.13953,11.976254 -14.64453,3.076172 5.87798,-10.42628 18.40036,-33.252543 24.27734,-44.761719 4.0725,-8.107484 8.71202,-9.889571 12.33203,-9.75586 z m 43.97266,16 c 10.93437,-0.290912 14.04937,9.862088 12.39844,14.513672 -0.944,2.736096 -4.6591,5.843758 -9.95508,-0.923828 -8.82498,-4.42129 -14.36,13.647212 -16.875,22.746094 -1.068,5.410288 -1.94434,15.470593 2.97266,19.433593 2.89998,2.365 6.48973,1.93141 9.13671,2.06641 2.079,0.261 6.24297,8.36158 -5.91601,12.01758 -2.08,-0.262 -12.79105,-0.29504 -17.20703,-10.625 -4.859,-10.71398 -1.7793,-26.433599 -1.7793,-26.433599 0,0 6.40863,-32.458297 24.93359,-32.591797 0.79938,-0.116943 1.56206,-0.18373 2.29102,-0.203125 z M 433.75,59 c 1.49197,0.0077 2.88144,0.244041 4.17969,0.712891 3.03998,1.867796 5.00554,7.000631 4.18554,11.419921 -0.94698,3.842194 -2.52734,6.978516 -2.52734,6.978516 5.256,0.5298 9.10352,5.774639 10.10352,12.640625 1,6.866086 -5.46812,13.328127 -17.4961,17.328127 -4.05198,1.141 -8.35587,1.12875 -8.54687,-0.28125 -0.129,-2.757 -10.3418,-35.601564 -10.3418,-35.601564 -0.319,-1.988196 -1.39512,-4.168769 3.92188,-7.164063 C 423.87425,61.015836 429.2741,58.976755 433.75,59 Z m -265.79492,0.386719 c -0.20118,-0.03582 -0.42977,0.01741 -0.68946,0.171875 l -12.84374,18.683594 13.30468,2.271484 c 0,0 3.24618,-20.589613 0.22852,-21.126953 z M 244.04492,68 c 3.91207,-0.06163 8.60513,5.076998 7.96094,11.396484 0.256,8.688984 -2.30859,20.160157 -2.30859,20.160157 0,0 1.25213,-2.91419 12.03711,-12.013672 10.78596,-9.098382 13.29887,-5.220521 11.92187,0.355469 -1.315,5.323988 -15.10937,19.041012 -15.10937,19.041012 1.94498,0.767 3.95703,6.67188 3.95703,6.67188 3.07798,8.06298 4.71329,14.41047 5.15429,19.10547 -0.18,13.69696 -12.54234,9.72704 -13.48632,2.74804 -0.883,-7.23198 -4.71876,-24.11328 -4.71876,-24.11328 l -4.39062,0.49414 c 0,0 -2.69367,8.74216 -5.13867,12.16016 -10.09198,14.93496 -19.25417,9.89759 -14.74219,1.34961 0.564,-1.204 5.32753,-9.68555 7.26953,-14.31055 8.14498,-18.935558 4.06136,-29.412293 7.31836,-39.359373 0.88063,-2.553777 2.49718,-3.657534 4.27539,-3.685547 z m 186.49805,0 c -2.73504,0.143894 -6.32807,1.731215 -9.64063,2.875 l 4.43946,10.396484 c 0,0 10.76218,-4.325368 9.49218,-10.097656 C 434.2788,68.64889 432.67022,67.888082 430.54297,68 Z m -31.82227,4 c 2.32834,-0.01668 5.17432,2.675652 6.90625,7.417969 2.566,9.39448 5.23944,24.570801 3.89844,29.966801 -1.278,5.13798 -2.6193,11.62784 -9.2793,13.21484 -1.72898,0.381 -16.13903,2.45543 -21.20703,-13.31055 -4.87798,-16.536762 -6.41609,-21.297073 -6.99609,-26.634763 -0.58,-5.33769 4.86236,-8.600329 8.06836,-2.869141 2.435,4.442792 5.26425,23.738584 9.24023,31.851564 2.18,3.285 6.66435,3.87728 8.77735,0.86328 2.49498,-4.557 0.69434,-15.940637 -0.84766,-25.074219 -1.092,-4.37499 -2.35011,-7.719115 -2.28711,-10.162109 C 395.41239,73.664847 396.90977,72.01297 398.7207,72 Z m -54.21093,10.001953 c 2.12729,0.0949 4.47031,2.956359 5.72656,10.695313 3.30998,10.667974 2.46864,31.295094 4.05664,33.205074 1.588,1.91 13.40839,-0.75503 16.60937,-1.83203 3.2,-1.077 9.09863,0.33697 7.76563,3.54297 -1.079,3.271 -4.13063,3.58086 -4.76563,3.96484 -0.636,0.383 -27.35565,8.30424 -28.34765,3.03126 -0.992,-5.274 -1.05469,-7.70065 -2.05469,-16.68165 -1,-8.98198 -3.432,-21.281627 -3.5,-28.666011 -0.0356,-3.92237 2.09882,-7.367325 4.50977,-7.259766 z M 318.72461,85 c 3.75961,0.04816 7.10011,2.248974 9.91992,6.232422 2.54,5.06509 1.14895,10.766328 -5.95703,5.623047 -0.445,-0.3903 -3.04408,-1.890748 -5.58008,-0.34375 -0.634,0.387098 -1.83747,0.902901 -3.10547,2.779297 -4.24498,6.338984 -2.97109,17.687314 -0.62109,23.529294 3.557,8.63298 7.80522,11.11122 13.44922,8.99024 5.64198,-2.122 5.89617,-0.95636 6.91015,-0.69336 1.268,0.329 4.50803,10.25837 -9.25195,12.48437 -13.75996,2.225 -21.81789,-8.95138 -22.46289,-28.40234 -0.325,-13.03098 2.58686,-21.64268 7.21484,-26.23047 3.38319,-2.740538 6.56023,-4.006212 9.48438,-3.96875 z m 117.73047,0.638672 c -4.46999,0.110534 -9.58985,3.648437 -9.58985,3.648437 0,0 3.04593,12.762551 2.91993,12.185551 -0.065,-0.833 15.69007,-3.971467 12.33007,-12.185551 -1.15567,-2.823247 -3.31873,-3.706336 -5.66015,-3.648437 z"
					fill="#fff"
				/>
				<path
					d="m 56.2741,6.96607 c 0,0 1.0366,-1.19259 2.9957,-0.94409 1.9591,0.2485 1.4758,2.50907 0.7379,3.98192 C 59.2698,11.4768 40.6829,49.588 27.2312,92.5764 13.7796,135.565 14.8081,181.5 14.8081,184 H 0.00983695 C -0.191864,179.5 2.61166,136.251 17.4214,92.5764 32.2312,48.9014 54.3114,8.48401 56.2741,6.96607 Z"
					fill="#fff"
				/>
			</svg>
		</a>
		<h1>stickers</h1>
		<form method="GET" action="/auth/start">
			<input
				id="email"
				placeholder="your@email.com"
				type="email"
				name="login_hint"
				value={data.email ?? ''}
			/>
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
