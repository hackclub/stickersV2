<script lang="ts">
	import './page.css';
	import { enhance } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	type Sticker = (typeof data.stickers)[number];
	let selected = $state<Sticker | null>(null);
	let dialog = $state<HTMLDialogElement | null>(null);
	let searchQuery = $state('');

	const wishlistSet = $derived(new Set(data.wishlist));
	const ownedSet = $derived(new Set(data.owned));
	const artistFilter = $derived(page.url.searchParams.get('artist') ?? '');

	const filteredStickers = $derived.by(() => {
		let list = data.stickers;
		if (artistFilter) {
			const a = artistFilter.toLowerCase();
			list = list.filter((s) => (s.artist ?? '').toLowerCase() === a);
		}
		if (searchQuery.trim() !== '') {
			const q = searchQuery.toLowerCase();
			list = list.filter((s) => s.name.toLowerCase().includes(q));
		}
		return list;
	});

	function clearArtist() {
		const url = new URL(page.url);
		url.searchParams.delete('artist');
		goto(url.pathname + (url.search ? url.search : ''), { replaceState: true });
	}

	$effect(() => {
		if (selected) dialog?.showModal();
		else dialog?.close();
	});
</script>

<svelte:head>
	<title>stickers catalog</title>
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

<div class="catalog-page">
	<div class="content">
		<div class="search-row">
			<h1>catalog</h1>
			<input
				class="search"
				type="search"
				placeholder="search stickers..."
				bind:value={searchQuery}
			/>
		</div>
		{#if artistFilter}
			<div class="filter-chip">
				<span>artist: <strong>{artistFilter}</strong></span>
				<button type="button" onclick={clearArtist} aria-label="clear artist filter">✕</button>
			</div>
		{/if}
		<div class="legend" aria-hidden="true">
			<span class="legend-item">
				<span class="legend-swatch wishlist"></span>
				<span>wishlist</span>
			</span>
			<span class="legend-item">
				<span class="legend-swatch owned"></span>
				<span>owned</span>
			</span>
		</div>
		<div class="sticker-grid">
			{#each filteredStickers as sticker, i (sticker.id)}
				{@const inWishlist = wishlistSet.has(sticker.id)}
				{@const inOwned = ownedSet.has(sticker.id)}
				<div
					class="sticker-card"
					onclick={() => (selected = sticker)}
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter') selected = sticker;
					}}
				>
					<div class="sticker-img" style="--rot: {((i * 17) % 26) - 13}deg">
						<img src={sticker.cdn_url} alt={sticker.name} loading="lazy" />
						<div class="marks" onclick={(e) => e.stopPropagation()} role="presentation">
							<form
								method="POST"
								action={inWishlist ? '?/clear' : '?/wishlist'}
								use:enhance={() =>
									async ({ result, update }) => {
										if (result.type === 'success') await invalidateAll();
										else await update();
									}}
							>
								<input type="hidden" name="sticker_id" value={sticker.id} />
								<label class="mark wishlist" title="wishlist">
									<input
										type="checkbox"
										checked={inWishlist}
										onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()}
									/>
									<span class="mark-box"></span>
								</label>
							</form>
							<form
								method="POST"
								action={inOwned ? '?/clear' : '?/owned'}
								use:enhance={() =>
									async ({ result, update }) => {
										if (result.type === 'success') await invalidateAll();
										else await update();
									}}
							>
								<input type="hidden" name="sticker_id" value={sticker.id} />
								<label class="mark owned" title="owned">
									<input
										type="checkbox"
										checked={inOwned}
										onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()}
									/>
									<span class="mark-box"></span>
								</label>
							</form>
						</div>
					</div>
					<p class="sticker-name">{sticker.name}</p>
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
		<form method="POST" action="?/setFavorite" class="favorite-form" use:enhance>
			<input type="hidden" name="sticker_id" value={selected.id} />
			<button
				type="submit"
				class="favorite-btn"
				class:on={data.favoriteId === selected.id}
				disabled={data.favoriteId === selected.id}
			>
				{data.favoriteId === selected.id ? '★ favorite' : '☆ set as favorite'}
			</button>
		</form>
	{/if}
</dialog>

<style>
	.catalog-page {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		min-height: 100%;
	}

	.filter-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		align-self: flex-start;
		margin: 0 0 1rem 1rem;
		padding: 0.4rem 0.85rem;
		background: #1d1c23;
		border: clamp(0.1rem, 0.16vw, 0.22rem) solid #37373c;
		border-radius: 9999px;
		color: white;
		font-size: 0.95rem;
	}

	.filter-chip strong {
		font-weight: 700;
	}

	.filter-chip button {
		background: transparent;
		border: none;
		color: #c8c8d0;
		cursor: pointer;
		font-size: 0.95rem;
		padding: 0;
		line-height: 1;
	}

	.filter-chip button:hover {
		color: white;
	}

	.legend {
		display: flex;
		gap: 1.2rem;
		align-self: flex-start;
		margin: 0 0 0.6rem 1rem;
		font-size: 0.92rem;
		color: white;
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	.legend-swatch {
		display: inline-block;
		width: 0.95rem;
		height: 0.95rem;
		border: 0.12rem solid black;
		border-radius: 0.25rem;
		box-shadow: 0 2px 0 black;
	}

	.legend-swatch.wishlist {
		background: #239640;
	}

	.legend-swatch.owned {
		background: #3758c4;
	}

	:global(.sticker-card .marks) {
		position: absolute;
		top: 0.3rem;
		right: 0.3rem;
		display: flex;
		gap: 0.25rem;
		padding: 0.18rem 0.25rem;
		background: rgba(20, 19, 24, 0.78);
		border: 0.08rem solid black;
		border-radius: 0.4rem;
		box-shadow: 0 1px 0 black;
		transform: rotate(calc(-1 * var(--rot, 0deg)));
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.12s ease;
		z-index: 2;
	}

	:global(.sticker-card:hover .marks),
	:global(.sticker-card:focus-within .marks) {
		opacity: 1;
		pointer-events: auto;
	}

	:global(.sticker-card .mark) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		position: relative;
	}

	:global(.sticker-card .mark input) {
		position: absolute;
		opacity: 0;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		cursor: pointer;
	}

	:global(.sticker-card .mark .mark-box) {
		display: inline-block;
		width: 0.85rem;
		height: 0.85rem;
		border: 0.1rem solid black;
		border-radius: 0.22rem;
		background: white;
		box-shadow: 0 1px 0 black;
		transition:
			background 0.1s ease,
			transform 0.1s ease,
			box-shadow 0.1s ease;
	}

	:global(.sticker-card .mark:hover .mark-box) {
		transform: translateY(-1px);
		box-shadow: 0 2px 0 black;
	}

	:global(.sticker-card .mark input:checked ~ .mark-box) {
		background-image:
			linear-gradient(45deg, transparent 45%, white 45% 55%, transparent 55%),
			linear-gradient(-45deg, transparent 45%, white 45% 55%, transparent 55%);
	}

	:global(.sticker-card .mark.wishlist input:checked ~ .mark-box) {
		background-color: #239640;
	}

	:global(.sticker-card .mark.owned input:checked ~ .mark-box) {
		background-color: #3758c4;
	}
</style>
