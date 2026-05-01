<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	function discounted(price: number, pct: number): number {
		return Math.round(price * (1 - pct / 100));
	}
</script>

<svelte:head>
	<title>shop — stickers</title>
</svelte:head>

<div class="page">
	<h1>shop</h1>
	<p class="lede">description goes here</p>

	<div class="grid">
		{#each data.items as item (item.id)}
			<article class="card">
				{#if item.discount}
					<span class="discount-badge">{item.discount}% off</span>
				{/if}

				<div class="image-wrap">
					<img src={item.image_url} alt={item.name} draggable="false" />
				</div>

				<h2 class="name">{item.name}</h2>

				{#if item.description}
					<p class="desc">{item.description}</p>
				{/if}

				<div class="price-line">
					{#if item.discount}
						<span class="strike">🪙 {item.price}</span>
						<span class="price discounted">🪙 {discounted(item.price, item.discount)} tokens</span>
					{:else}
						<span class="price">🪙 {item.price} tokens</span>
					{/if}
				</div>

				<button type="button" class="buy">buy</button>
			</article>
		{/each}
		{#if data.items.length === 0}
			<p class="empty">no items in the shop yet.</p>
		{/if}
	</div>
</div>

<style>
	.page {
		padding: clamp(2rem, 4vw, 4rem);
		max-width: 64rem;
		display: flex;
		flex-direction: column;
		gap: clamp(1rem, 2vw, 2rem);
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

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1.2rem;
	}

	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 1.1rem;
		background: #1d1c23;
		border: clamp(0.12rem, 0.18vw, 0.28rem) solid #37373c;
		border-radius: 1rem;
	}

	.discount-badge {
		position: absolute;
		top: -0.55rem;
		right: -0.55rem;
		padding: 0.35rem 0.7rem;
		background: #ed344f;
		color: white;
		font-weight: bold;
		font-style: italic;
		font-size: 0.85rem;
		-webkit-text-stroke: black 0.12rem;
		paint-order: stroke fill;
		border: 0.18rem solid black;
		border-radius: 999px;
		box-shadow: 0 3px 0 black;
		z-index: 2;
	}

	.image-wrap {
		width: 100%;
		aspect-ratio: 200 / 230;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: #141318;
		border: 1px solid #2a2930;
		border-radius: 0.7rem;
		box-sizing: border-box;
	}

	.image-wrap img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		user-select: none;
		-webkit-user-drag: none;
	}

	.name {
		margin: 0.2rem 0 0;
		font-weight: bold;
		font-style: italic;
		font-size: 1.15rem;
		color: white;
		-webkit-text-stroke: black 0.12rem;
		paint-order: stroke fill;
	}

	.desc {
		margin: 0;
		color: #9a9aa3;
		font-size: 0.9rem;
		line-height: 1.4;
		flex: 1;
	}

	.price-line {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
		margin-top: 0.2rem;
	}

	.price {
		font-weight: bold;
		font-size: 1.1rem;
		color: white;
	}

	.price.discounted {
		color: #ed344f;
	}

	.strike {
		color: #56565d;
		font-size: 0.95rem;
		text-decoration: line-through;
	}

	.buy {
		margin-top: 0.4rem;
		padding: 0.6rem 1rem;
		font-family: inherit;
		font-size: 1rem;
		font-weight: bold;
		font-style: italic;
		color: white;
		-webkit-text-stroke: black 0.14rem;
		paint-order: stroke fill;
		background: #3758c4;
		border: 0.18rem solid black;
		border-radius: 999px;
		box-shadow: 0 4px 0 black;
		cursor: pointer;
		transition:
			transform 0.12s ease,
			filter 0.12s ease,
			box-shadow 0.12s ease;
	}

	.buy:hover {
		filter: brightness(1.15);
		transform: translateY(-2px);
		box-shadow: 0 6px 0 black;
	}

	.buy:active {
		transform: translateY(2px);
		box-shadow: 0 2px 0 black;
	}
</style>
