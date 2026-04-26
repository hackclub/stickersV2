<script lang="ts">
	import './page.css';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	const home = resolve('/');
	const { data }: { data: PageData } = $props();

	type Sticker = (typeof data.stickers)[number];
	let selected = $state<Sticker | null>(null);
	let dialog = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (selected) dialog?.showModal();
		else dialog?.close();
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

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') selected = null; }} />

<div class="page">
	<a href={home} class="back-link">← home</a>

	<div class="content">
		<h1>catalog</h1>
		<div class="sticker-grid">
			{#each data.stickers as sticker (sticker.id)}
				<div class="sticker-card" onclick={() => selected = sticker} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter') selected = sticker; }}>
					<div class="sticker-img">
						<img src={sticker.cdn_url} alt={sticker.name} loading="lazy"/>
					</div>
					<p class="sticker-name">{sticker.name}</p>
				</div>
			{/each}
		</div>
	</div>

	<footer>
		made with &lt;3 <a href="https://hackclub.com">by teenagers, for teenagers.</a>
	</footer>
</div>

<dialog bind:this={dialog} class="modal" onclose={() => selected = null} onclick={(e) => { if (e.target === dialog) selected = null; }}>
	{#if selected}
		<button class="modal-close" onclick={() => selected = null} aria-label="Close">✕</button>
		<img src={selected.cdn_url} alt={selected.name} class="modal-img" />
		<div class="modal-text">
		<h2>{selected.name}</h2>
			{#if selected.artist}
				<p class="modal-row"><span>Artist:</span>{selected.artist}</p>
			{/if}
			{#if selected.event}
				<p class="modal-row">
					<span>Event:</span>
					{#if selected.event_url}
						<button class="event-link" onclick={() => window.open(selected!.event_url!, '_blank', 'noopener,noreferrer')}>
							{selected.event}
						</button>
					{:else}
						{selected.event}
					{/if}
				</p>
			{/if}
			{#if selected.sheet}
				<p class="modal-badge">Sheet</p>
			{/if}
			{#if selected.shiny}
				<p class="modal-badge shiny">Shiny! ✨</p>
			{/if}
		</div>
	{/if}
</dialog>
