<script lang="ts">
    import './page.css';

    type Sticker = {
        id: number;
        src: string;
        x: number;
        y: number;
        rotation: number;
        size: number;
        z: number;
    };

    let stickers = $state<Sticker[]>([
        { id: 1, src: 'https://cdn.hackclub.com/019d730b-766a-7cb4-ac34-ec2cdeab9260/e7ibKbv-Wg8ABpJMfnpbIxQcEjWrZATLIyxlq5_tbAI', x: 13, y: 28, rotation: -15, size: 275, z: 1 },
        { id: 2, src: 'https://cdn.hackclub.com/019d730d-3223-7023-a3d3-5b767cf50c61/n9Fdod5XHsv83GJUtOJYoA5gJtHE2jYvon66s4hvo28', x: 78, y: 16, rotation: 12, size: 250, z: 2 },
        { id: 3, src: 'https://cdn.hackclub.com/019d730a-9c86-70a5-a7b8-5dee27b5f67b/gV2GrpOYYMktbS1RCYmwyzH4G5uEdyzxv0aWYXuhvKc', x: 22, y: 67, rotation: -8, size: 175, z: 3 },
        { id: 4, src: 'https://cdn.hackclub.com/019d730b-44d5-7dff-a0ac-98a3be898a20/mhABU_nGcch7Baek8TdOGxLTZzi0l8oiBBlweCJfKT8', x: 72, y: 65, rotation: 20, size: 170, z: 4 },
        { id: 5, src: 'https://cdn.hackclub.com/019d730b-513b-7efa-a4bb-0aebcfb397b7/3wqTb6Vzcjd7HVEovqW7zn7CM7RMwBf-u1nL_eGpR9M', x: 58, y: 5, rotation: -5, size: 350, z: 5 },
        { id: 6, src: 'https://cdn.hackclub.com/019d730a-b2f2-7daf-832f-90df3b78e4eb/TItCSknK9qP-XN9oCqAz6kkwVdjDarWU8468JgO1osM', x: 32, y: 5, rotation: -5, size: 250, z: 6 },
    ]);

    let topZ = $state(6);
    let dragging: number | null = $state(null);
    let dragOffset = { x: 0, y: 0 };
    let heroEl: HTMLDivElement;

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
</svelte:head>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="hero" bind:this={heroEl} onpointermove={onPointerMove} onpointerup={onPointerUp}>
    {#each stickers as sticker (sticker.id)}
        <img
            class="sticker"
            class:dragging={dragging === sticker.id}
            src={sticker.src}
            alt="sticker"
            style="left: {sticker.x}%; top: {sticker.y}%; width: {sticker.size}px; z-index: {sticker.z}; transform: rotate({sticker.rotation}deg) scale({dragging === sticker.id ? 1.1 : 1});"
            onpointerdown={(e) => onPointerDown(e, sticker)}
            draggable="false"
        />
    {/each}
    <div class="hero-title">
        <h1>stickers</h1>
        <h2>hack club</h2>
        <form>
            <input id="email" placeholder="your@email.com" type="email" required>
            <button id="submit">rsvp!</button>
        </form>
    </div>
</div>
