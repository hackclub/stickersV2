<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>admin overview</title>
</svelte:head>

<div class="page">
	<h1>overview</h1>
	<p class="lede">description goes here</p>

	<div class="stats">
		<a class="stat" href="/admin/users">
			<span class="stat-value">{data.counts.users}</span>
			<span class="stat-label">users</span>
		</a>
		<a class="stat" href="/admin/shop">
			<span class="stat-value">{data.counts.shopItems}</span>
			<span class="stat-label">shop items</span>
		</a>
		<a class="stat" href="/admin/deals">
			<span class="stat-value">{data.counts.deals}</span>
			<span class="stat-label">deals</span>
		</a>
	</div>
</div>

<style>
	.page {
		padding: clamp(2rem, 4vw, 4rem);
		max-width: 70rem;
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

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.stat {
		background: #1d1c23;
		border: clamp(0.12rem, 0.18vw, 0.28rem) solid #37373c;
		border-radius: 1rem;
		padding: 1.4rem 1.3rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		text-decoration: none;
		color: white;
		transition:
			border-color 0.15s ease,
			transform 0.15s ease;
	}

	.stat:hover {
		border-color: #3758c4;
		transform: translateY(-2px);
		text-decoration: none;
	}

	.stat-value {
		font-size: 2.4rem;
		font-weight: bold;
		font-style: italic;
		font-variant-numeric: tabular-nums;
		-webkit-text-stroke: black 0.14rem;
		paint-order: stroke fill;
	}

	.stat-label {
		color: #56565d;
		font-size: 0.78rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		font-weight: 600;
	}
</style>
