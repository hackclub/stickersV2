<script lang="ts">
    import './page.css';
    import { resolve } from '$app/paths';

    const home = resolve("/")
</script>

<svelte:head>
    <title>Catalog - Stickers</title>
    <link rel="preload" href="https://assets.hackclub.com/fonts/Phantom_Sans_0.7/SemiboldItalic.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
    <link rel="preload" href="https://assets.hackclub.com/fonts/Phantom_Sans_0.7/Regular.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<div class="page">
    <a href="{home}" class="back-link">← home</a>

    <div class="content">
        <h1>page under construction</h1>
        <p class="subtitle">we're stocking the shelves. check back soon!</p>
    </div>

    <footer>
        made with &lt;3 by <a href="https://github.com/maxstellar">maxstellar</a> and <a href="https://hackclub.com">hack club</a>
    </footer>
</div>
