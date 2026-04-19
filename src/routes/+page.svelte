<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { slide } from 'svelte/transition';
    import './page.css';

    type StickerAsset = { src: string; size: number };
    type Slot = { x: number; y: number; rotation: number; z: number };
    type Sticker = Slot & StickerAsset & { id: number; visible: boolean };

    const stickerPool: StickerAsset[] = [
        { src: 'https://cdn.hackclub.com/019d730b-766a-7cb4-ac34-ec2cdeab9260/e7ibKbv-Wg8ABpJMfnpbIxQcEjWrZATLIyxlq5_tbAI', size: 14 },
        { src: 'https://cdn.hackclub.com/019d730d-3223-7023-a3d3-5b767cf50c61/n9Fdod5XHsv83GJUtOJYoA5gJtHE2jYvon66s4hvo28', size: 12 },
        { src: 'https://cdn.hackclub.com/019d730a-9c86-70a5-a7b8-5dee27b5f67b/gV2GrpOYYMktbS1RCYmwyzH4G5uEdyzxv0aWYXuhvKc', size: 9 },
        { src: 'https://cdn.hackclub.com/019d730b-44d5-7dff-a0ac-98a3be898a20/mhABU_nGcch7Baek8TdOGxLTZzi0l8oiBBlweCJfKT8', size: 9 },
        { src: 'https://cdn.hackclub.com/019d730b-513b-7efa-a4bb-0aebcfb397b7/3wqTb6Vzcjd7HVEovqW7zn7CM7RMwBf-u1nL_eGpR9M', size: 18 },
        { src: 'https://cdn.hackclub.com/019d730a-b2f2-7daf-832f-90df3b78e4eb/TItCSknK9qP-XN9oCqAz6kkwVdjDarWU8468JgO1osM', size: 10 },
        { src: 'https://cdn.hackclub.com/019d730c-5328-7180-871a-de18bbc5270e/lywHE0oLCvwUT6nrk-nd08O6AjP7XBN0VfMip8cQXjk', size: 19 },
        { src: 'https://cdn.hackclub.com/019d730b-e3b1-7f9f-ae10-ce24f6270851/3ziK9V5dKzWmFvBVpIWn6IfhVYLkJSILMKsuIhB5UME', size: 13 },
        { src: 'https://cdn.hackclub.com/019d730b-6891-7e2f-94e7-7ae12c005aa0/kUZDRDYxRQYj81Y58kQx2IGDXuSCAj1HJmtkRtSPMU8', size: 10 },
        { src: 'https://cdn.hackclub.com/019d730a-e3aa-74d7-9bc3-e2699195ad2a/WT7qHNSIeKcZrJJXdoumXD9r_fyRnG8d0D169XL-xzI', size: 15 },
        { src: 'https://cdn.hackclub.com/019d730b-ad49-752d-b352-3d2476050a80/k9mMHxhtueYKK9F1p7WcTNrplskR78joIsvFkLAWNHw', size: 10 },
    ];

    const slots: Slot[] = [
        { x: 11, y: 28, rotation: -15, z: 1 },
        { x: 78, y: 16, rotation: 12, z: 2 },
        { x: 22, y: 67, rotation: -8, z: 3 },
        { x: 72, y: 65, rotation: 20, z: 4 },
        { x: 58, y: 5, rotation: -5, z: 5 },
        { x: 32, y: 5, rotation: -5, z: 6 },
    ];

    let stickers = $state<Sticker[]>(slots.map((slot, i) => ({
        id: i + 1,
        ...slot,
        ...stickerPool[i % stickerPool.length],
        visible: false,
    })));

    let topZ = $state(7);
    let dragging: number | null = $state(null);
    let dragOffset = { x: 0, y: 0 };
    let heroEl: HTMLDivElement;
    let titleEl: HTMLElement;
    let scrollY = $state(0);
    let openFaq = $state<number | null>(null);

    type FaqPart = string | { text: string; href: string };
    type Faq = { q: string; a: string | FaqPart[] };

    const faqs: Faq[] = [
        { q: 'how do i get tokens?', a: 'ship creative, unique, and high-quality projects through our dashboard, and you\'ll receive a set amount of x tokens / hour shipped! if your projects are REALLY cool, you might even get a token boost from your reviewer.' },
        { q: 'what are "sticker boxes?"', a: 'sticker boxes are our plan to bring monthly subscriptions to the YSWS model (lol). every month in the shop, for 10 hours worth of tokens you can buy one "sticker box" that will contain exclusive stickers, signed postcards, and more hack club goodies!' },
        { q: 'is this free?', a: 'yep, completely free! all it takes is your hard work and creativity. we\'ll also cover shipping (except customs fees)!' },
        { q: 'who is eligible?', a: 'to participate, you need to be between the ages of 13 and 18!' },
        { q: 'how many projects can i make?', a: 'there\'s no limit, so you can make as many as you please! mo\' projects, mo\' stickers. and that\'s a good thing!' },
        { q: 'can i put stickers on my forehead? ', a: 'legally, we can\'t stop you, and truthfully, we\'re not stopping you.' },
        { q: 'is this legit? ', a: [
            "yep! hack club is the world's largest community of teenage makers, and a 501(c)(3) nonprofit. we've hosted programs like ",
            { text: 'high seas', href: 'https://highseas.hackclub.com/' },
            ' and ',
            { text: 'summer of making', href: 'https://summer.hackclub.com/' },
            " which gave out prizes for building other sorts of projects. we're supported by donations from companies like GitHub or individual generous donations!",
        ]},
    ];

    onMount(() => {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ('ontouchstart' in window && window.innerWidth < 1024);
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
        }

        (async () => {
            await tick();
            placeStickers();
        })();

        return () => {
            if (isMobile) window.removeEventListener('orientationchange', lockHeroHeight);
        };
    });

    function placeStickers() {
        const heroRect = heroEl.getBoundingClientRect();
        const titleRect = titleEl.getBoundingClientRect();

        const pad = 3;
        const zone = {
            left: ((titleRect.left - heroRect.left) / heroRect.width) * 100 - pad,
            right: ((titleRect.right - heroRect.left) / heroRect.width) * 100 + pad,
            top: ((titleRect.top - heroRect.top) / heroRect.height) * 100 - pad,
            bottom: ((titleRect.bottom - heroRect.top) / heroRect.height) * 100 + pad,
        };

        const stickerEls = heroEl.querySelectorAll('.sticker') as NodeListOf<HTMLElement>;

        const sizes = stickers.map((_, i) => {
            const el = stickerEls[i];
            if (!el) return { sW: 0, sH: 0 };
            const r = el.getBoundingClientRect();
            return {
                sW: (r.width / heroRect.width) * 100,
                sH: (r.height / heroRect.height) * 100,
            };
        });

        const hitsZone = (x: number, y: number, sW: number, sH: number) =>
            x < zone.right && x + sW > zone.left && y < zone.bottom && y + sH > zone.top;

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

            sticker.y = Math.max(vMargin, Math.min(100 - sH - vMargin, sticker.y));
        }

        type Box = { x: number; y: number; sW: number; sH: number };
        const placedBoxes: Box[] = [];

        for (let i = 0; i < stickers.length; i++) {
            const sticker = stickers[i];
            const { sW, sH } = sizes[i];

            const hitsPlaced = (x: number, y: number) =>
                placedBoxes.some((b: Box) => x < b.x + b.sW && x + sW > b.x && y < b.y + b.sH && y + sH > b.y);

            const isOpen = (x: number, y: number) =>
                x >= 0 && y >= vMargin && x + sW <= 100 && y + sH <= 100 - vMargin &&
                !hitsZone(x, y, sW, sH) && !hitsPlaced(x, y);

            if (hitsPlaced(sticker.x, sticker.y)) {
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

            placedBoxes.push({ x: sticker.x, y: sticker.y, sW, sH });
        }

        const order = stickers.map((_, i) => i).sort(() => Math.random() - 0.5);
        order.forEach((idx, i) => {
            setTimeout(() => {
                stickers[idx].visible = true;
            }, 150 + i * 180);
        });
    }

    function onPointerDown(e: PointerEvent, sticker: Sticker) {
        dragging = sticker.id;
        sticker.z = topZ++;
        const rect = heroEl.getBoundingClientRect();
        dragOffset = {
            x: e.clientX - rect.left - (sticker.x / 100) * rect.width,
            y: e.clientY - rect.top - (sticker.y / 100) * rect.height,
        };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
        if (dragging === null) return;
        const rect = heroEl.getBoundingClientRect();
        const sticker = stickers.find(s => s.id === dragging);
        if (sticker) {
            sticker.x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
            sticker.y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
        }
    }

    function onPointerUp() {
        dragging = null;
    }
</script>

<svelte:head>
    {#each stickerPool as asset (asset.src)}
        <link rel="preload" href={asset.src} as="image" />
    {/each}
    <link rel="preload" href="https://assets.hackclub.com/flag-standalone-wtransparent.svg" as="image" />
    <link rel="preload" href="https://assets.hackclub.com/fonts/Phantom_Sans_0.7/SemiboldItalic.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
    <link rel="preload" href="https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Regular.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
    <title>Stickers - Hack Club</title>
</svelte:head>

<svelte:window bind:scrollY={scrollY} />

<!-- <a href="https://hackclub.com"><img id="home" src="https://assets.hackclub.com/flag-orpheus-top.svg" class="hc-logo" loading="lazy" decoding="async" style="position: absolute; top: 0; left: 2vw; height: 7vw; min-height: 7rem; z-index: 20;" alt="Hack Club flag"></a> -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="hero" bind:this={heroEl} onpointermove={onPointerMove} onpointerup={onPointerUp}>
    <a href="https://example.com" class="catalog-link">catalog <span class="catalog-arrow">↗</span></a>
    {#each stickers as sticker (sticker.id)}
        <img
            class="sticker"
            class:dragging={dragging === sticker.id}
            class:placed={sticker.visible}
            src={sticker.src}
            alt="sticker"
            style="left: {sticker.x}%; top: {sticker.y}%; width: calc(max({sticker.size * 0.65}rem, {sticker.size}vw) * var(--sticker-scale, 1)); z-index: {sticker.z}; --r: {sticker.rotation}deg;"
            onpointerdown={(e) => onPointerDown(e, sticker)}
            draggable="false"
        />
    {/each}
    <section class="hero-title" bind:this={titleEl}>
        <a href="https://hackclub.com"><img class="hero-flag" src="https://assets.hackclub.com/flag-standalone-wtransparent.svg" alt="Hack Club" /></a>
        <h1>stickers</h1>
        <form>
            <input id="email" placeholder="your@email.com" type="email" required>
            <button id="submit">rsvp!</button>
        </form>
    </section>
    <a class="scroll-arrow" href="#steps" aria-label="Scroll to steps" style="opacity: {scrollY > 0 ? 0 : 0.7}; pointer-events: {scrollY > 0 ? 'none' : 'auto'}">
        <span>scroll</span>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    </a>
</div>

<section id="steps" class="steps">
    <h2>make projects. get stickers.</h2>
    <div><img alt="Raccoon looking confused sticker" src="https://cdn.hackclub.com/019d730b-6fb1-751a-b3f9-54aa990c66df/6Wif_CyN9v5sKz5jTdOWYP916lhbpjdjbbi4EvztyEM">make creative projects</div>
    <div><img alt="Raccoon with foot on chest of treasure sticker" src="https://cdn.hackclub.com/019d730c-5028-7f36-aab8-89f22e8ad348/8vDDsHlYHuYjqLORvS2y6mkL577OQ7Xhegfbesf1Wzo">get tokens for your efforts!</div>
    <div><img alt="Raccoon inside giftbox sticker" src="https://cdn.hackclub.com/019d93f7-1a10-7a99-8c05-abed82ea42f9/me%20when%20remove%20bg.png">buy stickers from the shop</div>
    <div><img alt='Raccoon hugging parcel sticker with "You got mail!" text' src="https://cdn.hackclub.com/019d730c-5d3c-7aa7-8b2c-bc6a123cba01/0gH7FoPip8sxo_GVALeVgz4DR2qHd0s1HHVEn8NlO0o">we'll mail them to you!</div>
</section>

<section class="faq">
    <h2>got questions?</h2>
    <div class="faq-grid">
        {#each faqs as faq, i (faq.q)}
            <div class="faq-item">
                <button class="faq-summary" onclick={() => openFaq = openFaq === i ? null : i}>
                    <span>{faq.q}</span>
                    <span class="faq-icon" class:open={openFaq === i}>+</span>
                </button>
                {#if openFaq === i}
                    <p transition:slide={{ duration: 250 }}>
                        {#if typeof faq.a === 'string'}
                            {faq.a}
                        {:else}
                            {#each faq.a as part, j (j)}
                                {#if typeof part === 'string'}
                                    {part}
                                {:else}
                                    <a href={part.href} target="_blank" rel="external noopener noreferrer">{part.text}</a>
                                {/if}
                            {/each}
                        {/if}
                    </p>
                {/if}
            </div>
        {/each}
    </div>
</section>

<footer>
    made with &lt;3 by <a href="https://github.com/maxstellar">maxstellar</a> and <a href="https://hackclub.com">hack club</a>
</footer>