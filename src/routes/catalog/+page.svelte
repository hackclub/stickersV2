<script lang="ts">
	import './page.css';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	const home = resolve('/');
	const { data }: { data: PageData } = $props();

	type Sticker = (typeof data.stickers)[number];
	let selected = $state<Sticker | null>(null);
	let dialog = $state<HTMLDialogElement | null>(null);
	let searchQuery = $state('');

	const filteredStickers = $derived(
		searchQuery.trim() === ''
			? data.stickers
			: data.stickers.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
	);

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

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') selected = null;
	}}
/>

<div class="c-page">
	<a href={home} class="back-link">← home</a>

	<div class="catalog-content">
		<div class="c-search-row">
			<h1 class="c-h1">catalog</h1>
			<input
				class="c-search"
				type="search"
				placeholder="search stickers..."
				bind:value={searchQuery}
			/>
		</div>
		<div class="c-sticker-grid">
			{#each filteredStickers as sticker, i (sticker.id)}
				<div
					class="c-sticker-card"
					onclick={() => (selected = sticker)}
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter') selected = sticker;
					}}
				>
					<div class="c-sticker-img" style="--rot: {((i * 17) % 26) - 13}deg">
						<img src={sticker.cdn_url} alt={sticker.name} loading="lazy" />
					</div>
					<p class="c-sticker-name">{sticker.name}</p>
				</div>
			{/each}
			{#if filteredStickers.length == 0}
				<p class="no-results">We couldn't find the sticker you were looking for :C</p>
			{/if}
		</div>
	</div>

	<footer>
		made with &lt;3 <a href="https://hackclub.com">by teenagers, for teenagers.</a>
	</footer>
</div>

<dialog
	bind:this={dialog}
	class="modal"
	onclose={() => (selected = null)}
	onclick={(e) => {
		const rect = dialog!.getBoundingClientRect();
		if (
			e.clientX < rect.left ||
			e.clientX > rect.right ||
			e.clientY < rect.top ||
			e.clientY > rect.bottom
		)
			selected = null;
	}}
>
	{#if selected}
		<button class="modal-close" onclick={() => (selected = null)} aria-label="Close">✕</button>
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
						<button
							class="event-link"
							onclick={() => window.open(selected!.event_url!, '_blank', 'noopener,noreferrer')}
						>
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
