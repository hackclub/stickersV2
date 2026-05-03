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
	<title>stickers - catalog</title>
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
	<a href={home} class="back-link"
		><svg
			fill-rule="evenodd"
			clip-rule="evenodd"
			stroke-linejoin="round"
			stroke-miterlimit="1.414"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="back"
			viewBox="0 0 32 32"
			preserveAspectRatio="xMidYMid meet"
			fill="currentColor"
			width="clamp(1.2rem, 1.6vw, 1.7rem)"
			height="clamp(1.2rem, 1.6vw, 1.7rem)"
			><path
				d="M13.504 10.132C13.983 9.85799 14.594 10.024 14.868 10.504C15.142 10.983 14.976 11.594 14.496 11.868C12.942 12.754 11.465 13.797 10.139 15H24C24.552 15 25 15.448 25 16C25 16.552 24.552 17 24 17H10.139C11.465 18.203 12.942 19.246 14.496 20.132C14.976 20.406 15.142 21.017 14.868 21.496C14.594 21.976 13.983 22.142 13.504 21.868C11.344 20.631 8.645 18.982 7.267 16.807C7.191 16.687 7 16.376 7 16C7 15.624 7.191 15.313 7.267 15.193C8.67 12.978 11.288 11.401 13.504 10.132V10.132Z"
			/></svg
		> home</a
	>

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
			{#each filteredStickers as sticker (sticker.id)}
				<div
					class="c-sticker-card"
					onclick={() => (selected = sticker)}
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter') selected = sticker;
					}}
				>
					<div class="c-sticker-img" style="--rot: {((sticker.id * 17) % 26) - 13}deg">
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
