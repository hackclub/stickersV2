<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { ORDER_STATUSES, type OrderStatus } from '$lib/orders';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let statusFilter = $state<'all' | OrderStatus>('all');
	let expandedId = $state<string | null>(null);

	const filtered = $derived(
		statusFilter === 'all' ? data.orders : data.orders.filter((o) => o.status === statusFilter)
	);

	const counts = $derived.by(() => {
		const c: Record<OrderStatus, number> = {
			received: 0,
			packed: 0,
			courier: 0,
			delivered: 0,
			cancelled: 0
		};
		for (const o of data.orders) c[o.status as OrderStatus]++;
		return c;
	});

	function fmt(d: Date | string | null | undefined) {
		if (!d) return '—';
		const dt = typeof d === 'string' ? new Date(d) : d;
		const yyyy = dt.getFullYear();
		const mm = String(dt.getMonth() + 1).padStart(2, '0');
		const dd = String(dt.getDate()).padStart(2, '0');
		const hh = String(dt.getHours()).padStart(2, '0');
		const mi = String(dt.getMinutes()).padStart(2, '0');
		return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
	}

	function addressLine(o: PageData['orders'][number]) {
		const parts = [o.recipient_name, o.line_1, o.city, o.state, o.country].filter(Boolean);
		return parts.join(', ');
	}
</script>

<svelte:head>
	<title>admin orders</title>
</svelte:head>

<div class="page">
	<header class="head">
		<h1>orders</h1>
		<select class="filter" bind:value={statusFilter}>
			<option value="all">all ({data.orders.length})</option>
			{#each ORDER_STATUSES as s (s)}
				<option value={s}>{s} ({counts[s]})</option>
			{/each}
		</select>
	</header>

	<div class="pills">
		<span class="pill total">{data.orders.length} total</span>
		{#each ORDER_STATUSES as s (s)}
			<span class="pill" class:active={statusFilter === s} data-status={s}>
				{s}: {counts[s]}
			</span>
		{/each}
	</div>

	<p class="count">{filtered.length} of {data.orders.length} shown</p>

	<ul class="list">
		{#each filtered as o (o.id)}
			{@const initial = (o.user.first_name ?? o.user.slack_display_name ?? o.user.email ?? '?')
				.trim()
				.charAt(0)
				.toUpperCase() || '?'}
			<li class="card">
				<div class="row">
					<div class="id-col">
						<code class="oid">{o.id.slice(0, 8)}</code>
						<span class="kind kind-{o.kind}">{o.kind}</span>
						<span class="ts">{fmt(o.created_at)}</span>
					</div>

					<div class="user-col">
						{#if o.user.slack_avatar_url}
							<img src={o.user.slack_avatar_url} alt="" class="avatar" />
						{:else}
							<span class="avatar empty">{initial}</span>
						{/if}
						<div class="user-meta">
							<strong>{o.user.first_name ?? o.user.slack_display_name ?? '—'}</strong>
							<span class="email">{o.user.email ?? '(no email)'}</span>
						</div>
					</div>

					<div class="thumbs">
						{#each o.items.slice(0, 4) as item (item.id)}
							<img
								src={item.sticker_cdn_url}
								alt={item.sticker_name}
								class="thumb"
								title="{item.sticker_name} ×{item.count}"
							/>
						{/each}
						{#if o.items.length > 4}
							<span class="thumb more">+{o.items.length - 4}</span>
						{/if}
						{#if o.items.length === 0}
							<span class="thumb empty">—</span>
						{/if}
					</div>

					<div class="status-col">
						<form
							method="POST"
							action="?/setStatus"
							class="status-form"
							use:enhance={() => async ({ update }) => {
								await update({ reset: false });
								await invalidateAll();
							}}
						>
							<input type="hidden" name="order_id" value={o.id} />
							<select
								name="status"
								value={o.status}
								class="status-select status-{o.status}"
								onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()}
							>
								{#each ORDER_STATUSES as s (s)}
									<option value={s}>{s}</option>
								{/each}
							</select>
						</form>
						{#if o.status !== 'delivered' && o.status !== 'cancelled'}
							<form
								method="POST"
								action="?/setStatus"
								class="fulfill-form"
								use:enhance={() => async ({ update }) => {
									await update({ reset: false });
									await invalidateAll();
								}}
							>
								<input type="hidden" name="order_id" value={o.id} />
								<input type="hidden" name="status" value="delivered" />
								<button type="submit" class="fulfill-btn">mark fulfilled</button>
							</form>
						{/if}
					</div>

					<button
						type="button"
						class="expand"
						onclick={() => (expandedId = expandedId === o.id ? null : o.id)}
						aria-label="toggle details"
					>
						{expandedId === o.id ? '▾' : '▸'}
					</button>
				</div>

				<div class="addr">
					{#if o.duplicate_address}
						<span class="dup-flag" title="another order in the list ships to this same address">duplicate address</span>
					{/if}
					<span class="addr-text">{addressLine(o) || '(no address)'}</span>
				</div>

				{#if expandedId === o.id}
					<div class="details">
						<dl>
							<div><dt>order id</dt><dd><code>{o.id}</code></dd></div>
							<div><dt>created</dt><dd>{fmt(o.created_at)}</dd></div>
							<div><dt>updated</dt><dd>{fmt(o.updated_at)}</dd></div>
							<div><dt>recipient</dt><dd>{o.recipient_name ?? '—'}</dd></div>
							<div><dt>line 1</dt><dd>{o.line_1 ?? '—'}</dd></div>
							<div><dt>line 2</dt><dd>{o.line_2 ?? '—'}</dd></div>
							<div><dt>city</dt><dd>{o.city ?? '—'}</dd></div>
							<div><dt>state</dt><dd>{o.state ?? '—'}</dd></div>
							<div><dt>postal code</dt><dd>{o.postal_code ?? '—'}</dd></div>
							<div><dt>country</dt><dd>{o.country ?? '—'}</dd></div>
						</dl>

						<div class="items-list">
							<h3>items</h3>
							<ul>
								{#each o.items as item (item.id)}
									<li>
										<img src={item.sticker_cdn_url} alt="" class="thumb-sm" />
										<span>{item.sticker_name}</span>
										<span class="qty">×{item.count}</span>
									</li>
								{/each}
								{#if o.items.length === 0}
									<li class="muted">no items</li>
								{/if}
							</ul>
						</div>

						<form
							method="POST"
							action="?/setNotes"
							class="notes-form"
							use:enhance={() => async ({ update }) => {
								await update({ reset: false });
								await invalidateAll();
							}}
						>
							<input type="hidden" name="order_id" value={o.id} />
							<label>
								notes
								<textarea name="notes" rows="3">{o.notes ?? ''}</textarea>
							</label>
							<button type="submit" class="btn primary">save notes</button>
						</form>
					</div>
				{/if}
			</li>
		{/each}
		{#if filtered.length === 0}
			<li class="empty">no orders match</li>
		{/if}
	</ul>
</div>

<style>
	.page {
		padding: clamp(1.5rem, 3vw, 3rem);
		max-width: 72rem;
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

	.filter {
		font-family: 'Phantom Sans', sans-serif;
		font-size: 0.95rem;
		padding: 0.5rem 0.9rem;
		background: #141318;
		color: white;
		border: 1px solid #37373c;
		border-radius: 999px;
		outline: none;
	}

	.filter:focus {
		border-color: #6f8fff;
	}

	.pills {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.pill {
		font-size: 0.78rem;
		padding: 0.25rem 0.7rem;
		border-radius: 999px;
		background: #1d1c23;
		color: #c8c8d0;
		border: 1px solid #37373c;
		letter-spacing: 0.04em;
	}

	.pill.total {
		background: #3758c4;
		color: white;
		border-color: #3758c4;
	}

	.pill.active {
		border-color: #6f8fff;
		color: white;
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
		display: grid;
		grid-template-columns: minmax(11rem, 1.2fr) minmax(11rem, 1.4fr) auto auto 1.6rem;
		align-items: center;
		gap: 0.9rem;
		padding: 0.7rem 1rem;
	}

	.id-col {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.oid {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 0.82rem;
		color: #c8c8d0;
		background: #141318;
		padding: 0.1rem 0.4rem;
		border-radius: 0.3rem;
		display: inline-block;
		width: fit-content;
	}

	.kind {
		display: inline-block;
		width: fit-content;
		font-size: 0.7rem;
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
	}

	.kind-free {
		background: #2a3a8c;
		color: white;
	}

	.kind-shop {
		background: #563a8c;
		color: white;
	}

	.ts {
		font-size: 0.78rem;
		color: #56565d;
		font-variant-numeric: tabular-nums;
	}

	.user-col {
		display: grid;
		grid-template-columns: 36px 1fr;
		align-items: center;
		gap: 0.6rem;
		min-width: 0;
	}

	.avatar {
		width: 36px;
		height: 36px;
		border-radius: 999px;
		object-fit: cover;
	}

	.avatar.empty {
		background: #141318;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #56565d;
		font-size: 1rem;
	}

	.user-meta {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}

	.email {
		color: #a3a3ad;
		font-size: 0.82rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.thumbs {
		display: flex;
		gap: 0.3rem;
	}

	.thumb {
		width: 36px;
		height: 36px;
		object-fit: contain;
		background: #141318;
		border-radius: 0.4rem;
		padding: 0.2rem;
	}

	.thumb.more,
	.thumb.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #c8c8d0;
		font-size: 0.78rem;
		font-weight: 600;
	}

	.thumb.empty {
		color: #56565d;
	}

	.status-col {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		align-items: stretch;
	}

	.status-form,
	.fulfill-form {
		margin: 0;
	}

	.fulfill-btn {
		font-family: 'Phantom Sans', sans-serif;
		font-style: italic;
		font-size: 0.85rem;
		font-weight: bold;
		padding: 0.5rem 0.95rem;
		background: #239640;
		color: white;
		-webkit-text-stroke: black 0.1rem;
		paint-order: stroke fill;
		border: 0.16rem solid black;
		border-radius: 999px;
		box-shadow: 0 4px 0 black;
		cursor: pointer;
		transition:
			transform 0.1s ease,
			filter 0.1s ease,
			box-shadow 0.1s ease;
	}

	.fulfill-btn:hover {
		filter: brightness(1.15);
		transform: translateY(-2px);
		box-shadow: 0 6px 0 black;
	}

	.fulfill-btn:active {
		transform: translateY(2px);
		box-shadow: 0 1px 0 black;
	}

	.status-select {
		font-family: 'Phantom Sans', sans-serif;
		font-size: 0.85rem;
		padding: 0.4rem 0.7rem;
		background: #141318;
		color: white;
		border: 1px solid #37373c;
		border-radius: 999px;
		outline: none;
		font-weight: 600;
	}

	.status-select:focus {
		border-color: #6f8fff;
	}

	.status-select.status-received {
		border-color: #6f8fff;
	}

	.status-select.status-packed {
		border-color: #c4a437;
	}

	.status-select.status-courier {
		border-color: #37c4a4;
	}

	.status-select.status-delivered {
		border-color: #4ec437;
	}

	.status-select.status-cancelled {
		border-color: #ed344f;
		color: #ed344f;
	}

	.expand {
		background: transparent;
		border: none;
		color: #56565d;
		font-size: 0.95rem;
		cursor: pointer;
		padding: 0.2rem 0.4rem;
	}

	.expand:hover {
		color: white;
	}

	.addr {
		padding: 0 1rem 0.7rem;
		color: #a3a3ad;
		font-size: 0.82rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.addr-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.dup-flag {
		flex: 0 0 auto;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.12rem 0.5rem;
		border-radius: 999px;
		background: #c4a437;
		color: #141318;
	}

	.details {
		border-top: 1px solid #37373c;
		padding: 0.8rem 1rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	dl {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.3rem 1rem;
	}

	dl > div {
		display: grid;
		grid-template-columns: 7rem 1fr;
		gap: 0.6rem;
		align-items: baseline;
		padding: 0.2rem 0;
		border-bottom: 1px dotted #2a2932;
	}

	dt {
		color: #56565d;
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	dd {
		margin: 0;
		color: white;
		font-size: 0.88rem;
		word-break: break-word;
	}

	code {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 0.8rem;
		color: #c8c8d0;
		background: #141318;
		padding: 0.1rem 0.35rem;
		border-radius: 0.3rem;
	}

	.items-list h3 {
		margin: 0 0 0.4rem;
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #56565d;
		font-weight: 600;
	}

	.items-list ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.items-list li {
		display: grid;
		grid-template-columns: 28px 1fr auto;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.88rem;
		color: white;
	}

	.thumb-sm {
		width: 28px;
		height: 28px;
		object-fit: contain;
		background: #141318;
		border-radius: 0.3rem;
		padding: 0.15rem;
	}

	.qty {
		color: #c8c8d0;
		font-size: 0.82rem;
		font-variant-numeric: tabular-nums;
	}

	.muted {
		color: #56565d;
		font-style: italic;
	}

	.notes-form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.notes-form label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #56565d;
	}

	.notes-form textarea {
		font-family: 'Phantom Sans', sans-serif;
		font-size: 0.92rem;
		padding: 0.5rem 0.7rem;
		background: #141318;
		color: white;
		border: 1px solid #37373c;
		border-radius: 0.4rem;
		outline: none;
		resize: vertical;
	}

	.notes-form textarea:focus {
		border-color: #6f8fff;
	}

	.btn {
		font-family: 'Phantom Sans', sans-serif;
		font-style: italic;
		font-size: 0.9rem;
		font-weight: bold;
		padding: 0.55rem 1.1rem;
		color: white;
		-webkit-text-stroke: black 0.12rem;
		paint-order: stroke fill;
		border: 0.18rem solid black;
		border-radius: 999px;
		box-shadow: 0 5px 0 black;
		cursor: pointer;
		align-self: flex-start;
		transition:
			transform 0.1s ease,
			filter 0.1s ease,
			box-shadow 0.1s ease;
	}

	.btn.primary {
		background: #3758c4;
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

	.empty {
		color: #56565d;
		text-align: center;
		padding: 2rem;
		font-style: italic;
	}

	@media (max-width: 900px) {
		.row {
			grid-template-columns: 1fr;
			gap: 0.6rem;
		}

		dl {
			grid-template-columns: 1fr;
		}
	}
</style>
