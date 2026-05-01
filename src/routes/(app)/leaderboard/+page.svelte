<script lang="ts">
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	const badges = ['🥇', '🥈', '🥉'];

	const rows = $derived(
		data.leaderboard.map((u, i) => ({
			rank: i + 1,
			name: u.slack_display_name || u.nickname || u.first_name || 'anonymous',
			tickets: u.tickets,
			stickers_owned: Number(u.stickers_owned),
			badge: badges[i]
		}))
	);
</script>

<svelte:head>
	<title>stickers leaderboard</title>
</svelte:head>

<div class="page">
	<h1>leaderboard</h1>
	<p class="lede">description goes here</p>

	<ol class="board">
		{#each rows as row (row.rank)}
			<li
				class="row"
				class:rank-1={row.rank === 1}
				class:rank-2={row.rank === 2}
				class:rank-3={row.rank === 3}
			>
				<span class="rank">
					{#if row.badge}<span class="badge">{row.badge}</span>{/if}
					<span class="num">{row.rank}</span>
				</span>
				<span class="name">{row.name}</span>
				<span class="stat tokens">
					<span class="stat-value">{row.tickets.toLocaleString()}</span>
					<span class="stat-label">tickets</span>
				</span>
				<span class="stat stickers">
					<span class="stat-value">{row.stickers_owned}</span>
					<span class="stat-label">stickers</span>
				</span>
			</li>
		{/each}
		{#if rows.length === 0}
			<li class="row empty">no users yet.</li>
		{/if}
	</ol>
</div>

<style>
	.page {
		padding: clamp(2rem, 4vw, 4rem);
		max-width: 60rem;
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

	.board {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.row {
		display: grid;
		grid-template-columns: 4rem 1fr auto auto;
		align-items: center;
		gap: clamp(0.8rem, 1.4vw, 1.6rem);
		min-height: 3.4rem;
		padding: 0.7rem 1.1rem;
		background: #1d1c23;
		border: clamp(0.12rem, 0.18vw, 0.28rem) solid #37373c;
		border-radius: 1rem;
		color: white;
	}

	.rank {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-weight: bold;
		font-style: italic;
		font-size: 1.4rem;
	}

	.badge {
		font-size: 1.1rem;
	}

	.num {
		font-variant-numeric: tabular-nums;
	}

	.name {
		font-weight: bold;
		font-size: clamp(1rem, 1.2vw, 1.2rem);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		line-height: 1.1;
	}

	.stat-value {
		font-weight: bold;
		font-variant-numeric: tabular-nums;
		font-size: clamp(0.95rem, 1.1vw, 1.1rem);
	}

	.stat-label {
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #56565d;
	}

	.row.rank-1,
	.row.rank-2,
	.row.rank-3 {
		min-height: 4.4rem;
		padding: 0.95rem 1.3rem;
		border-color: black;
		font-style: italic;
	}

	.row.rank-1 .rank,
	.row.rank-1 .name,
	.row.rank-2 .rank,
	.row.rank-2 .name,
	.row.rank-3 .rank,
	.row.rank-3 .name {
		font-size: clamp(1.1rem, 1.4vw, 1.4rem);
	}

	.row.rank-1 .rank .num,
	.row.rank-2 .rank .num,
	.row.rank-3 .rank .num {
		font-size: 1.7rem;
	}

	.row.rank-1 {
		background: #fff959;
		color: #141318;
	}

	.row.rank-1 .stat-label {
		color: #5c5a16;
	}

	.row.rank-2 {
		background: #ed344f;
		color: white;
		-webkit-text-stroke: black clamp(0.12rem, 0.2vw, 0.3rem);
		paint-order: stroke fill;
	}

	.row.rank-2 .stat-label {
		color: #ffd6dc;
		-webkit-text-stroke: 0;
	}

	.row.rank-3 {
		background: #239640;
		color: white;
		-webkit-text-stroke: black clamp(0.12rem, 0.2vw, 0.3rem);
		paint-order: stroke fill;
	}

	.row.rank-3 .stat-label {
		color: #c8e8cf;
		-webkit-text-stroke: 0;
	}

	@media (max-width: 540px) {
		.row {
			grid-template-columns: 3rem 1fr auto;
		}

		.row .stat.stickers {
			display: none;
		}
	}
</style>
