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
			list = list.filter(
				(s) => s.name.toLowerCase().includes(q) || (s.artist ?? '').toLowerCase().includes(q)
			);
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
			{#each filteredStickers as sticker (sticker.id)}
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
					<div class="sticker-img" style="--rot: {((sticker.id * 17) % 26) - 13}deg">
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
			>
				{#if data.favoriteId === selected.id}
					<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="star-fill" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M14.6549 6.72548C15.2051 5.61061 16.7949 5.61061 17.3451 6.72548L19.1777 10.4387C19.3962 10.8814 19.8185 11.1883 20.3071 11.2593L24.4049 11.8547C25.6353 12.0335 26.1265 13.5455 25.2363 14.4133L22.271 17.3037C21.9175 17.6483 21.7562 18.1448 21.8396 18.6313L22.5396 22.7126C22.7498 23.938 21.4637 24.8724 20.3632 24.2939L16.698 22.367C16.261 22.1372 15.739 22.1372 15.302 22.367L11.6368 24.2939C10.5363 24.8724 9.2502 23.938 9.46036 22.7126L10.1604 18.6314C10.2438 18.1448 10.0825 17.6483 9.72896 17.3037L6.76375 14.4133C5.87347 13.5455 6.36474 12.0335 7.59507 11.8547L11.6929 11.2593C12.1815 11.1883 12.6038 10.8814 12.8223 10.4387L14.6549 6.72548Z"/></svg>
					favorite
				{:else}
					<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="star" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M16 8.51912L14.6158 11.3239C14.1059 12.3569 13.1205 13.0729 11.9805 13.2385L8.88523 13.6883L11.125 15.8715C11.9499 16.6756 12.3263 17.8341 12.1316 18.9695L11.6028 22.0522L14.3713 20.5967C15.3909 20.0607 16.609 20.0607 17.6287 20.5967L20.3971 22.0522L19.8684 18.9695C19.6737 17.8341 20.0501 16.6756 20.875 15.8715L23.1147 13.6883L20.0195 13.2385C18.8795 13.0729 17.894 12.3569 17.3842 11.3239L16 8.51912ZM17.3451 6.72549C16.7949 5.61063 15.2051 5.61063 14.6549 6.7255L12.8223 10.4387C12.6038 10.8815 12.1814 11.1883 11.6929 11.2593L7.59505 11.8548C6.36472 12.0335 5.87346 13.5455 6.76373 14.4133L9.72894 17.3037C10.0825 17.6483 10.2438 18.1448 10.1603 18.6314L9.46035 22.7126C9.25018 23.938 10.5363 24.8724 11.6368 24.2939L15.302 22.367C15.739 22.1372 16.261 22.1372 16.698 22.367L20.3632 24.2939C21.4636 24.8724 22.7498 23.938 22.5396 22.7126L21.8396 18.6314C21.7562 18.1448 21.9175 17.6483 22.271 17.3037L25.2362 14.4133C26.1265 13.5455 25.6352 12.0335 24.4049 11.8548L20.3071 11.2593C19.8185 11.1883 19.3962 10.8815 19.1777 10.4387L17.3451 6.72549Z"/></svg>
					set as favorite
				{/if}
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
