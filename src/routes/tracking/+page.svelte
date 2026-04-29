<script lang="ts">
	import '../page.css';
</script>

<svelte:head>
	<title>tracking — coming soon</title>
</svelte:head>

<main class="tracking-scene">
	<h1>coming soon</h1>
</main>

<style>
	.tracking-scene {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Phantom Sans', sans-serif;
		background-size: var(--page-grid) var(--page-grid);
		background-color: #141318;
		background-image:
			linear-gradient(to right, #1c1c20 var(--page-grid-line), transparent var(--page-grid-line)),
			linear-gradient(to bottom, #1c1c20 var(--page-grid-line), transparent var(--page-grid-line));
		background-position: calc(var(--page-grid) / 2) calc(var(--page-grid) / 2);
	}

	h1 {
		margin: 0;
		color: white;
		-webkit-text-stroke: black clamp(0.3rem, 0.5vw, 0.7rem);
		paint-order: stroke fill;
		font-weight: bold;
		font-style: italic;
		font-size: clamp(3rem, 8vw, 9rem);
		text-align: center;
	}
</style>
