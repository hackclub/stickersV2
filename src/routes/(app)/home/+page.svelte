<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const greetingName = $derived(data.user?.nickname ?? data.user?.first_name);

	type RecentSticker = (typeof data.recentStickers)[number];

	const ORPHEUS_IMG = 'https://cdn.hackclub.com/019de1a5-95db-71ff-ab8c-d937131b55c2/image.png';

	const freshStickers = $derived(data.recentStickers.slice(0, 4));

	const featuredArtists = $derived.by(() => {
		const map = new Map<string, RecentSticker[]>();
		for (const s of data.recentStickers) {
			if (!s.artist) continue;
			const existing = map.get(s.artist);
			if (existing) {
				if (existing.length < 3) existing.push(s);
			} else {
				if (map.size >= 4) continue;
				map.set(s.artist, [s]);
			}
		}
		const padPool = data.recentStickers;
		const list = Array.from(map.entries()).map(([artist, stickers]) => {
			const padded = [...stickers];
			let i = 0;
			while (padded.length < 3 && i < padPool.length) {
				const candidate = padPool[i++];
				if (!padded.some((p) => p.id === candidate.id)) padded.push(candidate);
			}
			return { artist, stickers: padded.slice(0, 3) };
		});
		while (list.length < 4 && padPool.length > 0) {
			list.push({ artist: `__filler_${list.length}`, stickers: padPool.slice(0, 3) });
		}
		return list.slice(0, 4);
	});

</script>

<svelte:head>
	<title>home — stickers</title>
</svelte:head>

<div class="page">
	<header class="greeting">
		{#if data.user?.slack_avatar_url}
			<img src={data.user.slack_avatar_url} alt="" class="avatar" />
		{/if}
		<div class="greeting-text">
			<h1>welcome back{greetingName ? `, ${greetingName}` : ''}</h1>
			{#if data.user?.slack_display_name}
				<span class="slack-handle">@{data.user.slack_display_name}</span>
			{/if}
		</div>
	</header>

	{#if data.recentStickers.length === 0}
		<p class="empty-hint">no stickers yet — check back soon</p>
	{:else}
		<section class="group">
			<h2>fresh off the press</h2>
			<div class="fresh-grid">
				{#each freshStickers as sticker, i (sticker.id)}
					<article class="fresh-card">
						<span class="new-badge">new</span>
						<div class="fresh-img-wrap">
							<img src={ORPHEUS_IMG} alt="new sticker {i + 1}" />
						</div>
						<span class="fresh-name">new sticker {i + 1}</span>
					</article>
				{/each}
			</div>
		</section>

		{#if featuredArtists.length > 0}
			<section class="group">
				<h2>featured artists</h2>
				<div class="artists-grid">
					{#each featuredArtists as feat, i (feat.artist)}
						{@const label = `featured artist ${i + 1}`}
						<a class="artist-card" href="/library?artist={encodeURIComponent(feat.artist)}">
							<div class="artist-photo">
								<img src={ORPHEUS_IMG} alt="" />
							</div>
							<div class="artist-text">
								<span class="artist-name">{label}</span>
								<p class="artist-bio">
									Hi im {label} i joined hackclub through [event] [x] months ago and i like to draw
									[preference] style.
								</p>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		{#if data.deals.length > 0}
			<section class="group">
				<h2>deals this week</h2>
				<div class="deals">
					{#each data.deals as deal (deal.id)}
						<article class="deal-banner" style="background: {deal.color}">
							<div class="deal-meta">
								<span class="deal-copy">{deal.title}</span>
								{#if deal.description}<span class="deal-sub">{deal.description}</span>{/if}
							</div>
							<a class="deal-cta" href={deal.href}>shop now →</a>
						</article>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>

<style>
	.page {
		padding: clamp(2rem, 4vw, 4rem);
		max-width: 70rem;
		display: flex;
		flex-direction: column;
		gap: clamp(1.4rem, 2.4vw, 2.4rem);
	}

	.greeting {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.avatar {
		width: 64px;
		height: 64px;
		border-radius: 9999px;
		border: 2px solid white;
		object-fit: cover;
		flex-shrink: 0;
	}

	.greeting-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	h1 {
		margin: 0;
		font-weight: bold;
		font-style: italic;
		font-size: clamp(1.6rem, 2.4vw, 2.4rem);
		line-height: 1.15;
		color: white;
		-webkit-text-stroke: black clamp(0.14rem, 0.22vw, 0.32rem);
		paint-order: stroke fill;
		word-break: break-word;
	}

	.slack-handle {
		color: #a3a3ad;
		font-size: 0.95rem;
	}

	.empty-hint {
		margin: 0;
		color: #a3a3ad;
		font-size: 1rem;
	}

	.group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.group h2 {
		margin: 0;
		font-size: 0.78rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #56565d;
		font-weight: 600;
	}

	/* Fresh off the press */
	.fresh-grid {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(160px, 1fr);
		grid-template-rows: auto;
		gap: 1rem;
		overflow-x: auto;
	}

	.fresh-card {
		position: relative;
		background: #1d1c23;
		border: clamp(0.12rem, 0.2vw, 0.3rem) solid #37373c;
		border-radius: 1.1rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		align-items: center;
	}

	.new-badge {
		position: absolute;
		top: 0.6rem;
		right: 0.6rem;
		background: #fff959;
		color: black;
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		padding: 0.2rem 0.45rem;
		border-radius: 0.35rem;
		z-index: 1;
	}

	.fresh-img-wrap {
		width: 100%;
		aspect-ratio: 1 / 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem;
	}

	.fresh-img-wrap img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.fresh-name {
		font-weight: bold;
		font-style: italic;
		color: white;
		-webkit-text-stroke: black 0.12rem;
		paint-order: stroke fill;
		text-align: center;
		font-size: 0.95rem;
		word-break: break-word;
	}

	/* Featured artists */
	.artists-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-rows: repeat(2, auto);
		gap: 1rem;
	}

	@media (max-width: 540px) {
		.artists-grid {
			grid-template-columns: 1fr;
			grid-template-rows: repeat(4, auto);
		}
	}

	.artist-card {
		background: #1d1c23;
		border: clamp(0.12rem, 0.2vw, 0.3rem) solid #37373c;
		border-radius: 1.1rem;
		padding: 1rem 1.1rem;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		text-decoration: none;
		color: inherit;
		transition:
			border-color 0.15s ease,
			transform 0.15s ease;
	}

	.artist-card:hover {
		border-color: #56565d;
		transform: translateY(-2px);
		text-decoration: none;
	}

	.artist-photo {
		flex-shrink: 0;
		width: clamp(4rem, 8vw, 5.5rem);
		aspect-ratio: 1 / 1;
		background: #15141a;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem;
		overflow: hidden;
	}

	.artist-photo img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.artist-text {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		flex: 1;
		min-width: 0;
	}

	.artist-name {
		font-weight: bold;
		font-style: italic;
		color: white;
		-webkit-text-stroke: black 0.14rem;
		paint-order: stroke fill;
		font-size: 1.1rem;
		word-break: break-word;
	}

	.artist-bio {
		margin: 0;
		color: #c8c8d0;
		font-size: 0.95rem;
		line-height: 1.45;
	}

	/* Deals */
	.deals {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.deal-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: clamp(1.2rem, 2.4vw, 2rem) clamp(1.4rem, 3vw, 2.4rem);
		border-radius: 1.1rem;
		flex-wrap: wrap;
	}

	.deal-meta {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.deal-sub {
		color: rgba(255, 255, 255, 0.85);
		font-size: 0.95rem;
	}

	.deal-copy {
		font-weight: bold;
		font-style: italic;
		color: white;
		-webkit-text-stroke: black clamp(0.14rem, 0.22vw, 0.3rem);
		paint-order: stroke fill;
		font-size: clamp(1.3rem, 2.2vw, 2rem);
		line-height: 1.1;
	}

	.deal-cta {
		background: white;
		color: black;
		text-decoration: none;
		font-weight: bold;
		font-style: italic;
		padding: 0.7rem 1.3rem;
		border-radius: 999px;
		font-size: 1rem;
		border: 0.2rem solid black;
		box-shadow: 0 5px 0 black;
		flex-shrink: 0;
		transition:
			transform 0.1s ease,
			filter 0.1s ease,
			box-shadow 0.1s ease;
	}

	.deal-cta:hover {
		text-decoration: none;
		filter: brightness(1.05);
		transform: translateY(-2px);
		box-shadow: 0 7px 0 black;
	}

	.deal-cta:active {
		transform: translateY(2px);
		box-shadow: 0 2px 0 black;
	}
</style>
