<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	let query = $state('');
	let expandedId = $state<string | null>(null);

	const filtered = $derived(
		query.trim() === ''
			? data.users
			: data.users.filter((u) => {
					const q = query.toLowerCase();
					return (
						(u.email ?? '').toLowerCase().includes(q) ||
						(u.first_name ?? '').toLowerCase().includes(q) ||
						(u.nickname ?? '').toLowerCase().includes(q) ||
						(u.slack_display_name ?? '').toLowerCase().includes(q) ||
						(u.slack_id ?? '').toLowerCase().includes(q)
					);
				})
	);

	function fmt(d: Date | string | null | undefined) {
		if (!d) return '—';
		const dt = typeof d === 'string' ? new Date(d) : d;
		return dt.toLocaleString();
	}
</script>

<svelte:head>
	<title>admin — users</title>
</svelte:head>

<div class="page">
	<header class="head">
		<h1>users</h1>
		<input type="search" placeholder="search…" bind:value={query} class="search" />
	</header>
	<p class="count">{filtered.length} of {data.users.length} shown</p>

	<ul class="list">
		{#each filtered as u (u.id)}
			{@const initial = (u.first_name ?? u.nickname ?? u.slack_display_name ?? u.email ?? '?')
				.trim()
				.charAt(0)
				.toUpperCase() || '?'}
			<li class="card">
				<button
					type="button"
					class="row"
					onclick={() => (expandedId = expandedId === u.id ? null : u.id)}
				>
					{#if u.slack_avatar_url}
						<img src={u.slack_avatar_url} alt="" class="avatar" />
					{:else}
						<span class="avatar empty">{initial}</span>
					{/if}
					<div class="meta">
						<strong>{u.first_name ?? u.nickname ?? '—'}</strong>
						<span class="email">{u.email ?? '(no email)'}</span>
					</div>
					<span class="chev">{expandedId === u.id ? '▾' : '▸'}</span>
				</button>
				{#if expandedId === u.id}
					<dl class="details">
						<div><dt>id</dt><dd><code>{u.id}</code></dd></div>
						<div><dt>email</dt><dd>{u.email ?? '—'}</dd></div>
						<div><dt>first_name</dt><dd>{u.first_name ?? '—'}</dd></div>
						<div><dt>nickname</dt><dd>{u.nickname ?? '—'}</dd></div>
						<div><dt>postal_name</dt><dd>{u.postal_name ?? '—'}</dd></div>
						<div><dt>slack_id</dt><dd>{u.slack_id ?? '—'}</dd></div>
						<div><dt>slack_display_name</dt><dd>{u.slack_display_name ?? '—'}</dd></div>
						<div>
							<dt>favorite sticker</dt>
							<dd>
								{#if u.favorite_sticker_url}
									<img src={u.favorite_sticker_url} alt="" class="fav-img" />
									{u.favorite_sticker_name}
								{:else}
									—
								{/if}
							</dd>
						</div>
						<div><dt>joined</dt><dd>{fmt(u.created_at)}</dd></div>
						<div><dt>updated</dt><dd>{fmt(u.updated_at)}</dd></div>
					</dl>
				{/if}
			</li>
		{/each}
		{#if filtered.length === 0}
			<li class="empty">no users match</li>
		{/if}
	</ul>
</div>

<style>
	.page {
		padding: clamp(1.5rem, 3vw, 3rem);
		max-width: 60rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
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

	.search {
		font-family: 'Phantom Sans', sans-serif;
		font-size: 0.95rem;
		padding: 0.5rem 0.9rem;
		background: #141318;
		color: white;
		border: 1px solid #37373c;
		border-radius: 999px;
		outline: none;
		min-width: 14rem;
	}

	.search:focus {
		border-color: #6f8fff;
	}

	.count {
		margin: 0;
		color: #56565d;
		font-size: 0.85rem;
	}

	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.card {
		background: #1d1c23;
		border: clamp(0.1rem, 0.16vw, 0.25rem) solid #37373c;
		border-radius: 0.9rem;
		overflow: hidden;
	}

	.row {
		width: 100%;
		display: grid;
		grid-template-columns: 40px 1fr auto;
		align-items: center;
		gap: 0.9rem;
		padding: 0.7rem 1rem;
		background: transparent;
		border: none;
		color: white;
		text-align: left;
		font-family: inherit;
		cursor: pointer;
	}

	.row:hover {
		background: #25242c;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 999px;
		object-fit: cover;
	}

	.avatar.empty {
		background: #141318;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #56565d;
		font-size: 1.1rem;
	}

	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.email {
		color: #a3a3ad;
		font-size: 0.85rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chev {
		color: #56565d;
		font-size: 0.85rem;
	}

	.details {
		margin: 0;
		padding: 0.5rem 1rem 1rem;
		border-top: 1px solid #37373c;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.details > div {
		display: grid;
		grid-template-columns: 11rem 1fr;
		gap: 1rem;
		align-items: baseline;
		padding: 0.25rem 0;
		border-bottom: 1px dotted #2a2932;
	}

	.details > div:last-child {
		border-bottom: none;
	}

	dt {
		color: #56565d;
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	dd {
		margin: 0;
		color: white;
		font-size: 0.92rem;
		word-break: break-all;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	code {
		font-size: 0.82rem;
		color: #c8c8d0;
		background: #141318;
		padding: 0.1rem 0.35rem;
		border-radius: 0.3rem;
	}

	.fav-img {
		width: 1.4rem;
		height: 1.4rem;
		object-fit: contain;
	}

	.empty {
		color: #56565d;
		text-align: center;
		padding: 2rem;
		font-style: italic;
	}
</style>
