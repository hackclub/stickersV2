<script lang="ts">
	import { untrack } from 'svelte';
	import '../page.css';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedId = $state<number | null>(untrack(() => data.votedStickerId));
</script>

<svelte:head>
	<title>stickers welcome</title>
</svelte:head>

<main class="scene">
	<div class="card">
		<h1 class="headline">welcome!</h1>
		<p class="sub">
			Hack Club is an amazing space for teenage creators, our artists regularly produce amazing designs and the favorite ones will be added to the shop and distributed globally! Vote for your favorite!
		</p>

		<div class="stickers">
			{#each data.stickers as s (s.id)}
				<button
					type="button"
					class="sticker-card"
					class:picked={selectedId === s.id}
					class:dim={selectedId !== null && selectedId !== s.id}
					onclick={() => (selectedId = s.id)}
					aria-pressed={selectedId === s.id}
					aria-label={`vote for ${s.name}`}
				>
					<div class="sticker-img-wrap">
						<img src={s.cdn_url} alt={s.name} draggable="false" />
					</div>
					<span class="sticker-name">{s.name}</span>
					{#if s.artist}
						<span class="sticker-artist">by {s.artist}</span>
					{/if}
					<span class="tally">{s.votes} {s.votes === 1 ? 'vote' : 'votes'}</span>
				</button>
			{/each}
		</div>

		{#if form?.error}<p class="status err">{form.error}</p>{/if}

		{#if selectedId !== null}
			<form method="POST" action="?/vote" class="actions">
				<input type="hidden" name="sticker_id" value={selectedId} />
				<button type="submit" class="btn primary">next →</button>
			</form>
		{/if}
	</div>
</main>

<style>
	.scene {
		position: fixed;
		inset: 0;
		overflow: auto;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: clamp(1.5rem, 3vw, 3rem) 2rem;
		background-size: var(--page-grid) var(--page-grid);
		background-color: #141318;
		background-image:
			linear-gradient(to right, #1c1c20 var(--page-grid-line), transparent var(--page-grid-line)),
			linear-gradient(to bottom, #1c1c20 var(--page-grid-line), transparent var(--page-grid-line));
		background-position: calc(var(--page-grid) / 2) calc(var(--page-grid) / 2);
		font-family: 'Phantom Sans', sans-serif;
	}

	.card {
		max-width: 60rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(1.2rem, 2vw, 2rem);
		text-align: center;
	}

	.headline {
		margin: 0;
		font-weight: bold;
		font-style: italic;
		font-size: clamp(1.8rem, 3.2vw, 3.2rem);
		line-height: 1.1;
		color: white;
		-webkit-text-stroke: black clamp(0.18rem, 0.32vw, 0.45rem);
		paint-order: stroke fill;
	}

	.sub {
		margin: 0;
		color: #c8c8d0;
		font-size: clamp(1rem, 1.3vw, 1.3rem);
		line-height: 1.5;
		max-width: 38rem;
	}

	.stickers {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: clamp(0.8rem, 1.2vw, 1.4rem);
		width: 100%;
		margin-top: 0.5rem;
	}

	.sticker-card {
		font-family: 'Phantom Sans', sans-serif;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		background: #1d1c23;
		border: clamp(0.15rem, 0.22vw, 0.35rem) solid black;
		border-radius: 1rem;
		padding: clamp(1rem, 1.4vw, 1.4rem);
		cursor: pointer;
		color: white;
		box-shadow: 0 5px 0 black;
		transition:
			transform 0.12s ease,
			filter 0.12s ease,
			box-shadow 0.12s ease,
			opacity 0.2s ease;
	}

	.sticker-card:hover:not(:disabled) {
		filter: brightness(1.15);
		transform: translateY(-2px);
		box-shadow: 0 7px 0 black;
	}

	.sticker-card:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: 0 2px 0 black;
	}

	.sticker-card:disabled {
		cursor: default;
	}

	.sticker-card.picked {
		background: #239640;
		box-shadow: 0 5px 0 black;
	}

	.sticker-card.dim {
		opacity: 0.55;
	}

	.sticker-img-wrap {
		width: 100%;
		aspect-ratio: 1 / 1;
		max-height: clamp(8rem, 22vh, 14rem);
		display: flex;
		align-items: center;
		justify-content: center;
		background: #141318;
		border-radius: 0.6rem;
		padding: 0.5rem;
		box-sizing: border-box;
	}

	.sticker-img-wrap img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		user-select: none;
		-webkit-user-drag: none;
	}

	.sticker-name {
		font-weight: bold;
		font-size: clamp(0.95rem, 1.1vw, 1.2rem);
		color: white;
	}

	.sticker-artist {
		font-size: clamp(0.75rem, 0.9vw, 0.95rem);
		color: #a3a3ad;
	}

	.tally {
		margin-top: 0.2rem;
		font-variant-numeric: tabular-nums;
		font-size: clamp(0.8rem, 0.95vw, 1rem);
		color: #c8c8d0;
		font-weight: 600;
	}

	.sticker-card.picked .tally,
	.sticker-card.picked .sticker-artist {
		color: white;
	}

	.actions {
		display: flex;
		gap: clamp(0.6rem, 1vw, 1rem);
		flex-wrap: wrap;
		justify-content: center;
		margin-top: clamp(0.5rem, 1vw, 1rem);
	}

	.status.err {
		margin: 0;
		color: #ed344f;
		font-size: 0.95rem;
		text-align: center;
	}

	.btn {
		font-family: 'Phantom Sans', sans-serif;
		font-size: clamp(1rem, 1.3vw, 1.3rem);
		font-weight: bold;
		padding: 0.8rem 2rem;
		color: white;
		-webkit-text-stroke: black 0.18rem;
		paint-order: stroke fill;
		border: clamp(0.15rem, 0.22vw, 0.35rem) solid black;
		border-radius: 999px;
		cursor: pointer;
		box-shadow: 0 5px 0 black;
		transition:
			transform 0.12s ease,
			filter 0.12s ease,
			box-shadow 0.12s ease;
	}

	.btn.primary {
		background: #239640;
	}

	.btn:hover {
		filter: brightness(1.15);
		transform: translateY(-2px);
		box-shadow: 0 7px 0 black;
	}

	.btn:active {
		transform: translateY(2px);
		box-shadow: 0 2px 0 black;
	}
</style>
