<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	type Stage = {
		key: string;
		label: string;
		hint: string;
		color: string;
	};

	const stages: Stage[] = [
		{
			key: 'received',
			label: 'order received',
			hint: 'description goes here',
			color: '#ed344f'
		},
		{
			key: 'packed',
			label: 'order packed',
			hint: 'description goes here',
			color: '#f5ee49'
		},
		{
			key: 'courier',
			label: 'order with courier',
			hint: 'description goes here',
			color: '#239640'
		},
		{
			key: 'delivered',
			label: 'order delivered',
			hint: 'description goes here',
			color: '#3758c4'
		}
	];

	const sectionAccents = {
		tracking: '#ed344f',
		past: '#f5ee49',
		wishlist: '#239640',
		owned: '#3758c4'
	} as const;

	type ActiveOrder = (typeof data.activeOrders)[number];
	type PastOrder = (typeof data.pastOrders)[number];

	const activeOrders = $derived(data.activeOrders);
	const pastOrders = $derived(data.pastOrders);
	const wishlistStickers = $derived(data.wishlist);
	const ownedStickers = $derived(data.owned);

	function stageIndex(status: ActiveOrder['status']): number {
		if (status === 'packed') return 1;
		if (status === 'courier') return 2;
		if (status === 'delivered') return 3;
		return 0;
	}

	const monthAbbr = [
		'jan',
		'feb',
		'mar',
		'apr',
		'may',
		'jun',
		'jul',
		'aug',
		'sep',
		'oct',
		'nov',
		'dec'
	];

	function formatDate(d: Date | string): string {
		const date = d instanceof Date ? d : new Date(d);
		return `${monthAbbr[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
	}

	function shortId(id: string): string {
		return id.slice(0, 8);
	}

	function pastStatusColor(status: PastOrder['status']): string {
		if (status === 'delivered') return '#239640';
		return '#ed344f';
	}
</script>

<svelte:head>
	<title>stickers orders</title>
</svelte:head>

<div class="page">
	<h1>orders</h1>
	<p class="lede">description goes here</p>

	<section class="section" style="--section-accent: {sectionAccents.tracking}">
		<h2 class="section-title">tracking</h2>
		{#if activeOrders.length === 0}
			<p class="empty-msg">no active orders.</p>
		{:else}
			{#each activeOrders as order (order.id)}
				{@const currentIndex = stageIndex(order.status)}
				{@const visibleItems = order.items.slice(0, 4)}
				{@const extraItems = Math.max(order.items.length - 4, 0)}
				<article class="active-order">
					<header class="active-head">
						<span class="active-id">order {shortId(order.id)}</span>
						<span class="active-kind">{order.kind}</span>
						<span class="active-date">{formatDate(order.created_at)}</span>
					</header>
					<ol class="stages">
						{#each stages as stage, i (stage.key)}
							<li
								class="stage"
								class:done={i < currentIndex}
								class:active={i === currentIndex}
								class:pending={i > currentIndex}
								style="--accent: {stage.color}; --prev-accent: {i > 0
									? stages[i - 1].color
									: stage.color}"
							>
								<div class="dot">
									<span class="num">{i + 1}</span>
								</div>
								<div class="label">{stage.label}</div>
								<div class="hint">{stage.hint}</div>
							</li>
						{/each}
					</ol>
					<div class="active-detail">
						<div class="detail-block">
							<span class="detail-label">items</span>
							<div class="active-thumbs">
								{#each visibleItems as item, i (i)}
									<div class="active-thumb" title="{item.sticker_name} ×{item.count}">
										<img src={item.sticker_cdn_url} alt={item.sticker_name} loading="lazy" />
										{#if item.count > 1}<span class="thumb-qty">×{item.count}</span>{/if}
									</div>
								{/each}
								{#if extraItems > 0}
									<div class="active-thumb more">+{extraItems}</div>
								{/if}
								{#if order.items.length === 0}
									<div class="active-thumb empty">no items</div>
								{/if}
							</div>
						</div>
						<div class="detail-block">
							<span class="detail-label">shipping to</span>
							{#if order.recipient_name || order.line_1 || order.city}
								<address class="active-addr">
									{#if order.recipient_name}{order.recipient_name}<br />{/if}
									{#if order.line_1}{order.line_1}<br />{/if}
									{#if order.line_2}{order.line_2}<br />{/if}
									{[order.city, order.state, order.postal_code].filter(Boolean).join(', ')}
									{#if order.country}<br />{order.country}{/if}
								</address>
							{:else}
								<span class="active-addr muted">no address on file</span>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		{/if}
	</section>

	<section class="section" style="--section-accent: {sectionAccents.past}">
		<h2 class="section-title">past</h2>
		<div class="past-list">
			{#each pastOrders as order (order.id)}
				{@const visible = order.items.slice(0, 4)}
				{@const extra = Math.max(order.items.length - 4, 0)}
				<article class="past-card">
					<header class="past-head">
						<span class="past-id">{shortId(order.id)}</span>
						<span class="past-date">{formatDate(order.created_at)}</span>
						<span class="past-status" style="--status-color: {pastStatusColor(order.status)}">
							{order.status}
						</span>
					</header>
					<div class="past-thumbs">
						{#each visible as item, i (i)}
							<div class="thumb">
								<img src={item.sticker_cdn_url} alt={item.sticker_name} loading="lazy" />
							</div>
						{/each}
						{#if extra > 0}
							<div class="thumb more">+{extra} more</div>
						{/if}
						{#if order.items.length === 0}
							<div class="thumb empty">no stickers</div>
						{/if}
					</div>
				</article>
			{/each}
			{#if pastOrders.length === 0}
				<p class="empty-msg">no past orders.</p>
			{/if}
		</div>
	</section>

	<section class="section" style="--section-accent: {sectionAccents.wishlist}">
		<h2 class="section-title">wishlist</h2>
		<div class="grid">
			{#each wishlistStickers as sticker, i (sticker.id)}
				<div class="sticker-card">
					<div class="sticker-img" style="--rot: {((i * 17) % 26) - 13}deg">
						<img src={sticker.cdn_url} alt={sticker.name} loading="lazy" />
					</div>
					<p class="sticker-name">{sticker.name}</p>
					<form method="POST" action="?/removeWishlist" use:enhance>
						<input type="hidden" name="sticker_id" value={sticker.id} />
						<button type="submit" class="remove-btn">remove</button>
					</form>
				</div>
			{/each}
			{#if wishlistStickers.length === 0}
				<p class="empty-msg">your wishlist is empty.</p>
			{/if}
		</div>
	</section>

	<section class="section" style="--section-accent: {sectionAccents.owned}">
		<h2 class="section-title">owned</h2>
		<div class="grid">
			{#each ownedStickers as entry, i (entry.sticker.id)}
				<div class="sticker-card owned">
					<div class="sticker-img" style="--rot: {((i * 13) % 26) - 13}deg">
						<img src={entry.sticker.cdn_url} alt={entry.sticker.name} loading="lazy" />
						{#if entry.count > 1}
							<span class="count-badge">×{entry.count}</span>
						{/if}
					</div>
					<p class="sticker-name">{entry.sticker.name}</p>
				</div>
			{/each}
			{#if ownedStickers.length === 0}
				<p class="empty-msg">you don't own any stickers yet.</p>
			{/if}
		</div>
	</section>
</div>

<style>
	.page {
		padding: clamp(2rem, 4vw, 4rem);
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: clamp(1rem, 2vw, 2rem);
	}

	.active-order {
		background: #1d1c23;
		border: clamp(0.12rem, 0.18vw, 0.24rem) solid #37373c;
		border-radius: 0.9rem;
		padding: 1rem 1.2rem 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.active-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem;
	}

	.active-id {
		font-weight: bold;
		font-style: italic;
		color: white;
		-webkit-text-stroke: black 0.14rem;
		paint-order: stroke fill;
		font-size: 1.05rem;
	}

	.active-kind {
		font-size: 0.7rem;
		padding: 0.15rem 0.55rem;
		border-radius: 9999px;
		background: #2a3a8c;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: 600;
	}

	.active-date {
		color: #a3a3ad;
		font-size: 0.95rem;
		margin-left: auto;
	}

	.active-detail {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1.2rem;
		padding-top: 0.8rem;
		border-top: 1px dashed #37373c;
	}

	.detail-block {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.detail-label {
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #56565d;
		font-weight: 600;
	}

	.active-thumbs {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.active-thumb {
		position: relative;
		width: 4.2rem;
		height: 4.2rem;
		border-radius: 0.5rem;
		background: #faf8f5;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.active-thumb img {
		max-width: 90%;
		max-height: 90%;
		object-fit: contain;
	}

	.active-thumb.more,
	.active-thumb.empty {
		background: #2a2930;
		color: #c8c8d0;
		font-size: 0.85rem;
		font-weight: bold;
		font-style: italic;
	}

	.thumb-qty {
		position: absolute;
		bottom: 0.15rem;
		right: 0.2rem;
		background: #1d1c23;
		color: white;
		font-size: 0.7rem;
		font-weight: bold;
		padding: 0.05rem 0.35rem;
		border-radius: 9999px;
		font-variant-numeric: tabular-nums;
	}

	.active-addr {
		margin: 0;
		font-style: normal;
		color: #c8c8d0;
		font-size: 0.95rem;
		line-height: 1.45;
	}

	.active-addr.muted {
		color: #56565d;
	}

	@media (max-width: 640px) {
		.active-detail {
			grid-template-columns: 1fr;
		}
		.active-date {
			margin-left: 0;
		}
	}

	h1 {
		margin: 0;
		font-weight: bold;
		font-style: italic;
		font-size: clamp(1.6rem, 2.4vw, 2.4rem);
		color: white;
		-webkit-text-stroke: black clamp(0.14rem, 0.22vw, 0.32rem);
		paint-order: stroke fill;
	}

	.lede {
		margin: 0;
		color: #c8c8d0;
		font-size: clamp(1rem, 1.2vw, 1.2rem);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: clamp(0.75rem, 1.4vw, 1.25rem);
	}

	.section-title {
		margin: 0;
		font-weight: bold;
		font-style: italic;
		font-size: clamp(1.2rem, 1.6vw, 1.6rem);
		color: var(--section-accent);
		-webkit-text-stroke: black clamp(0.12rem, 0.2vw, 0.28rem);
		paint-order: stroke fill;
	}

	.stages {
		list-style: none;
		padding: 0;
		margin: 1rem 0 0;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0;
		position: relative;
	}

	.stage {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.55rem;
		padding: 0 0.75rem;
		text-align: center;
		position: relative;
	}

	.stage::before {
		content: '';
		position: absolute;
		top: calc(clamp(2.6rem, 4vw, 3.4rem) / 2);
		left: -50%;
		right: 50%;
		height: clamp(0.25rem, 0.4vw, 0.5rem);
		background: #37373c;
		z-index: 0;
		transform: translateY(-50%);
	}

	.stage:first-child::before {
		display: none;
	}

	.stage.done::before,
	.stage.active::before {
		background: #ed344f;
	}

	.stage.done + .stage.done::before,
	.stage.done + .stage.active::before {
		background: linear-gradient(to right, var(--prev-accent, #ed344f), var(--accent));
	}

	.dot {
		position: relative;
		width: clamp(2.6rem, 4vw, 3.4rem);
		height: clamp(2.6rem, 4vw, 3.4rem);
		border-radius: 50%;
		background: #37373c;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #56565d;
		z-index: 1;
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease;
	}

	.num {
		font-weight: bold;
		font-style: italic;
		font-size: clamp(1.1rem, 1.4vw, 1.4rem);
	}

	.stage.done .dot {
		background: var(--accent);
		border: none;
		color: white;
		-webkit-text-stroke: black 0.14rem;
		paint-order: stroke fill;
	}

	.stage.active .dot {
		background: var(--accent);
		border: none;
		color: white;
		-webkit-text-stroke: black 0.14rem;
		paint-order: stroke fill;
		transform: scale(1.12);
		box-shadow: 0 0 0 0.6rem color-mix(in srgb, var(--accent) 28%, transparent);
		animation: pulse 1.6s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0.4rem color-mix(in srgb, var(--accent) 22%, transparent);
		}
		50% {
			box-shadow: 0 0 0 0.9rem color-mix(in srgb, var(--accent) 8%, transparent);
		}
	}

	.label {
		font-weight: bold;
		font-style: italic;
		font-size: clamp(0.95rem, 1.1vw, 1.15rem);
		color: white;
		-webkit-text-stroke: black clamp(0.1rem, 0.16vw, 0.22rem);
		paint-order: stroke fill;
	}

	.stage.pending .label {
		color: #56565d;
		-webkit-text-stroke: 0;
	}

	.hint {
		font-size: 0.85rem;
		color: #a3a3ad;
		line-height: 1.4;
		max-width: 14rem;
	}

	.stage.pending .hint {
		color: #56565d;
	}

	@media (max-width: 720px) {
		.stages {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.stage {
			flex-direction: row;
			align-items: flex-start;
			text-align: left;
			padding: 0;
		}

		.stage::before {
			top: clamp(2.6rem, 4vw, 3.4rem);
			bottom: -1rem;
			left: calc(clamp(2.6rem, 4vw, 3.4rem) / 2 - clamp(0.125rem, 0.2vw, 0.25rem));
			right: auto;
			width: clamp(0.25rem, 0.4vw, 0.5rem);
			height: auto;
			transform: none;
		}

		.stage:first-child::before {
			display: none;
		}

		.stage:last-child::before {
			display: none;
		}

		.dot {
			flex-shrink: 0;
		}

		.label,
		.hint {
			text-align: left;
		}

		.hint {
			max-width: none;
		}
	}

	/* past orders */
	.past-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.past-card {
		background: #1d1c23;
		border: clamp(0.12rem, 0.18vw, 0.24rem) solid #37373c;
		border-radius: 0.9rem;
		padding: 1rem 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.past-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem;
	}

	.past-id {
		font-weight: bold;
		font-style: italic;
		color: white;
		-webkit-text-stroke: black 0.14rem;
		paint-order: stroke fill;
		font-size: 1.05rem;
	}

	.past-date {
		color: #a3a3ad;
		font-size: 0.95rem;
	}

	.past-status {
		margin-left: auto;
		padding: 0.25rem 0.7rem;
		border-radius: 9999px;
		font-weight: bold;
		font-style: italic;
		font-size: 0.85rem;
		background: var(--status-color);
		color: black;
		-webkit-text-stroke: 0;
	}

	.past-thumbs {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.thumb {
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 0.6rem;
		background: #faf8f5;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		flex-shrink: 0;
	}

	.thumb img {
		max-width: 90%;
		max-height: 90%;
		object-fit: contain;
	}

	.thumb.more,
	.thumb.empty {
		background: #2a2930;
		color: #c8c8d0;
		font-size: 0.85rem;
		font-weight: bold;
		font-style: italic;
		text-align: center;
		padding: 0.4rem;
		box-sizing: border-box;
	}

	/* sticker grids (wishlist + owned) */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(180px, 100%), 1fr));
		gap: 1.5rem;
		padding: clamp(1rem, 2vw, 2rem);
	}

	.sticker-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
	}

	.sticker-img {
		position: relative;
		width: 100%;
		max-width: 160px;
		aspect-ratio: 200 / 230;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: rotate(var(--rot, 0deg));
		transition: transform 0.2s;
	}

	.sticker-card:hover .sticker-img {
		transform: rotate(var(--rot, 0deg)) scale(1.05);
	}

	.sticker-img img {
		max-width: 97%;
		max-height: 97%;
		object-fit: contain;
		user-select: none;
	}

	.sticker-name {
		margin: 0;
		font-size: 1.05rem;
		text-align: center;
	}

	.remove-btn {
		font-family: inherit;
		font-weight: bold;
		font-style: italic;
		background: #ed344f;
		color: white;
		-webkit-text-stroke: black 0.12rem;
		paint-order: stroke fill;
		border: 0.18rem solid black;
		border-radius: 9999px;
		padding: 0.45rem 1.1rem;
		font-size: 0.9rem;
		cursor: pointer;
		box-shadow: 0 4px 0 black;
		transition:
			transform 0.1s ease,
			filter 0.1s ease,
			box-shadow 0.1s ease;
	}

	.remove-btn:hover {
		filter: brightness(1.15);
		transform: translateY(-2px);
		box-shadow: 0 6px 0 black;
	}

	.remove-btn:active {
		transform: translateY(2px);
		box-shadow: 0 1px 0 black;
	}

	.count-badge {
		position: absolute;
		top: 0;
		right: 0;
		transform: rotate(calc(-1 * var(--rot, 0deg)));
		background: #3758c4;
		color: white;
		-webkit-text-stroke: black 0.1rem;
		paint-order: stroke fill;
		font-weight: bold;
		font-style: italic;
		font-size: 0.9rem;
		padding: 0.18rem 0.55rem;
		border-radius: 9999px;
		border: 0.14rem solid black;
	}

	.empty-msg {
		grid-column: 1 / -1;
		text-align: center;
		font-size: 1.1rem;
		color: #a3a3ad;
		margin: 1rem 0;
	}
</style>
