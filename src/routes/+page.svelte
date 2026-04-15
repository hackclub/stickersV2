<script lang="ts">
    import { onMount } from 'svelte';
    import './page.css';

    type Sticker = {
        id: number;
        src: string;
        x: number;
        y: number;
        rotation: number;
        size: number;
        z: number;
        visible: boolean;
    };

    let stickers = $state<Sticker[]>([
        { id: 1, src: 'https://cdn.hackclub.com/019d730b-766a-7cb4-ac34-ec2cdeab9260/e7ibKbv-Wg8ABpJMfnpbIxQcEjWrZATLIyxlq5_tbAI', x: 13, y: 28, rotation: -15, size: 14, z: 1, visible: false },
        { id: 2, src: 'https://cdn.hackclub.com/019d730d-3223-7023-a3d3-5b767cf50c61/n9Fdod5XHsv83GJUtOJYoA5gJtHE2jYvon66s4hvo28', x: 78, y: 16, rotation: 12, size: 13, z: 2, visible: false },
        { id: 3, src: 'https://cdn.hackclub.com/019d730a-9c86-70a5-a7b8-5dee27b5f67b/gV2GrpOYYMktbS1RCYmwyzH4G5uEdyzxv0aWYXuhvKc', x: 22, y: 67, rotation: -8, size: 9, z: 3, visible: false },
        { id: 4, src: 'https://cdn.hackclub.com/019d730b-44d5-7dff-a0ac-98a3be898a20/mhABU_nGcch7Baek8TdOGxLTZzi0l8oiBBlweCJfKT8', x: 72, y: 65, rotation: 20, size: 9, z: 4, visible: false },
        { id: 5, src: 'https://cdn.hackclub.com/019d730b-513b-7efa-a4bb-0aebcfb397b7/3wqTb6Vzcjd7HVEovqW7zn7CM7RMwBf-u1nL_eGpR9M', x: 58, y: 5, rotation: -5, size: 18, z: 5, visible: false },
        { id: 6, src: 'https://cdn.hackclub.com/019d730a-b2f2-7daf-832f-90df3b78e4eb/TItCSknK9qP-XN9oCqAz6kkwVdjDarWU8468JgO1osM', x: 32, y: 5, rotation: -5, size: 10, z: 6, visible: false },
    ]);

    let topZ = $state(7);
    let dragging: number | null = $state(null);
    let dragOffset = { x: 0, y: 0 };
    let heroEl: HTMLDivElement;
    let titleEl: HTMLElement;

    onMount(() => {
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

        // Compute every sticker's size in hero-percentage units upfront
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
        }

        type Box = { x: number; y: number; sW: number; sH: number };
        const placedBoxes: Box[] = [];

        for (let i = 0; i < stickers.length; i++) {
            const sticker = stickers[i];
            const { sW, sH } = sizes[i];

            const hitsPlaced = (x: number, y: number) =>
                placedBoxes.some((b: Box) => x < b.x + b.sW && x + sW > b.x && y < b.y + b.sH && y + sH > b.y);

            const isOpen = (x: number, y: number) =>
                x >= 0 && y >= 0 && x + sW <= 100 && y + sH <= 100 &&
                !hitsZone(x, y, sW, sH) && !hitsPlaced(x, y);

            if (hitsPlaced(sticker.x, sticker.y)) {
                let bestPos: { x: number; y: number } | null = null;
                let bestDist = Infinity;

                for (let gx = 0; gx <= 100 - sW; gx += 5) {
                    for (let gy = 0; gy <= 100 - sH; gy += 5) {
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
    });

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
    {#each stickers as sticker (sticker.id)}
        <link rel="preload" href={sticker.src} as="image" />
    {/each}
    <title>Stickers - Hack Club</title>
</svelte:head>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="hero" bind:this={heroEl} onpointermove={onPointerMove} onpointerup={onPointerUp}>
    {#each stickers as sticker (sticker.id)}
        <img
            class="sticker"
            class:dragging={dragging === sticker.id}
            class:placed={sticker.visible}
            src={sticker.src}
            alt="sticker"
            style="left: {sticker.x}%; top: {sticker.y}%; width: calc(max(7rem, {sticker.size}vw) * var(--sticker-scale, 1)); z-index: {sticker.z}; transform: rotate({sticker.rotation}deg) scale({dragging === sticker.id ? 1.1 : 1});"
            onpointerdown={(e) => onPointerDown(e, sticker)}
            draggable="false"
        />
    {/each}
    <section class="hero-title" bind:this={titleEl}>
        <h1>stickers</h1>
        <h2>hack club</h2>
        <form>
            <input id="email" placeholder="your@email.com" type="email" required>
            <button id="submit">rsvp!</button>
        </form>
    </section>
</div>

<section class="steps">
    <div><img alt="Raccoon looking confused sticker" src="https://cdn.hackclub.com/019d730b-6fb1-751a-b3f9-54aa990c66df/6Wif_CyN9v5sKz5jTdOWYP916lhbpjdjbbi4EvztyEM">1. make projects</div>
    <div><img alt="Raccoon looking confused sticker" src="https://cdn.hackclub.com/019d730c-5028-7f36-aab8-89f22e8ad348/8vDDsHlYHuYjqLORvS2y6mkL577OQ7Xhegfbesf1Wzo">2. get tokens</div>
    <div><img alt="Raccoon looking confused sticker" src="https://cdn.hackclub.com/019d730c-1755-7a0c-9e6f-d9b08e0affd5/YDTGVqKSv30zwAf8kuudy8vr3dV_v2Q2gU4A01CZP7o">3. buy stickers from the shop</div>
    <div><img alt="Raccoon looking confused sticker" src="https://cdn.hackclub.com/019d730c-5d3c-7aa7-8b2c-bc6a123cba01/0gH7FoPip8sxo_GVALeVgz4DR2qHd0s1HHVEn8NlO0o">4. we'll mail them to you!</div>
</section>
