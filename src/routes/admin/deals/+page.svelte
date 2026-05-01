<script lang="ts">
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingId = $state<number | null>(null);
	let creating = $state(false);
</script>

<svelte:head>
	<title>admin — deals</title>
</svelte:head>

<div class="page">
	<header class="head">
		<h1>deals</h1>
		<button type="button" class="btn primary" onclick={() => (creating = !creating)}>
			{creating ? 'cancel' : '+ add deal'}
		</button>
	</header>

	{#if form?.error}<p class="status err">{form.error}</p>{/if}

	{#if creating}
		<form method="POST" action="?/create" class="card form">
			<h2>new deal</h2>
			<label>title<input type="text" name="title" required /></label>
			<label>description<textarea name="description" rows="2"></textarea></label>
			<div class="row2">
				<label>color (hex)<input type="text" name="color" value="#ed344f" pattern="^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$" required /></label>
				<label>href<input type="text" name="href" value="/shop" required /></label>
			</div>
			<button type="submit" class="btn primary">create</button>
		</form>
	{/if}

	<ul class="items">
		{#each data.deals as deal, i (deal.id)}
			<li class="card">
				{#if editingId === deal.id}
					<form method="POST" action="?/update" class="form">
						<input type="hidden" name="id" value={deal.id} />
						<label>title<input type="text" name="title" value={deal.title} required /></label>
						<label>description<textarea name="description" rows="2">{deal.description ?? ''}</textarea></label>
						<div class="row2">
							<label>color (hex)<input type="text" name="color" value={deal.color} pattern="^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$" required /></label>
							<label>href<input type="text" name="href" value={deal.href} required /></label>
						</div>
						<div class="row-actions">
							<button type="submit" class="btn primary">save</button>
							<button type="button" class="btn ghost" onclick={() => (editingId = null)}>cancel</button>
						</div>
					</form>
				{:else}
					<div class="row">
						<span class="swatch" style="background: {deal.color}"></span>
						<div class="meta">
							<strong>{deal.title}</strong>
							{#if deal.description}<span class="desc">{deal.description}</span>{/if}
							<span class="href">→ {deal.href}</span>
						</div>
						<div class="reorder">
							<form method="POST" action="?/move">
								<input type="hidden" name="id" value={deal.id} />
								<input type="hidden" name="direction" value="up" />
								<button type="submit" class="icon" disabled={i === 0} aria-label="move up">↑</button>
							</form>
							<form method="POST" action="?/move">
								<input type="hidden" name="id" value={deal.id} />
								<input type="hidden" name="direction" value="down" />
								<button type="submit" class="icon" disabled={i === data.deals.length - 1} aria-label="move down">↓</button>
							</form>
						</div>
						<div class="row-actions">
							<button type="button" class="btn ghost" onclick={() => (editingId = deal.id)}>edit</button>
							<form method="POST" action="?/delete" onsubmit={(e) => !confirm('delete?') && e.preventDefault()}>
								<input type="hidden" name="id" value={deal.id} />
								<button type="submit" class="btn danger">delete</button>
							</form>
						</div>
					</div>
				{/if}
			</li>
		{/each}
		{#if data.deals.length === 0}
			<li class="empty">no deals yet.</li>
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

	h2 {
		margin: 0 0 0.5rem;
		font-size: 0.78rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #56565d;
		font-weight: 600;
	}

	.items {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.card {
		background: #1d1c23;
		border: clamp(0.1rem, 0.16vw, 0.25rem) solid #37373c;
		border-radius: 0.9rem;
		padding: 0.9rem 1rem;
	}

	.row {
		display: grid;
		grid-template-columns: 40px 1fr auto auto;
		align-items: center;
		gap: 1rem;
	}

	.swatch {
		width: 40px;
		height: 40px;
		border-radius: 0.5rem;
		border: 1px solid #37373c;
	}

	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.desc {
		color: #a3a3ad;
		font-size: 0.85rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.href {
		color: #56565d;
		font-size: 0.78rem;
		font-family: monospace;
	}

	.reorder {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.icon {
		width: 1.7rem;
		height: 1.7rem;
		background: #141318;
		color: white;
		border: 1px solid #37373c;
		border-radius: 0.4rem;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.icon:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.icon:hover:not(:disabled) {
		background: #2a2932;
	}

	.row-actions {
		display: flex;
		gap: 0.4rem;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.form label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
		color: #c8c8d0;
	}

	.form input,
	.form textarea {
		font-family: 'Phantom Sans', sans-serif;
		font-size: 0.95rem;
		padding: 0.5rem 0.7rem;
		background: #141318;
		color: white;
		border: 1px solid #37373c;
		border-radius: 0.4rem;
		outline: none;
	}

	.form input:focus,
	.form textarea:focus {
		border-color: #6f8fff;
	}

	.row2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
	}

	.btn {
		font-family: 'Phantom Sans', sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		padding: 0.45rem 0.9rem;
		border-radius: 999px;
		cursor: pointer;
		border: none;
	}

	.btn.primary {
		background: #3758c4;
		color: white;
	}

	.btn.primary:hover {
		filter: brightness(1.15);
	}

	.btn.ghost {
		background: transparent;
		color: #c8c8d0;
		border: 1px solid #37373c;
	}

	.btn.ghost:hover {
		border-color: #56565d;
	}

	.btn.danger {
		background: #ed344f;
		color: white;
	}

	.btn.danger:hover {
		filter: brightness(1.15);
	}

	.status.err {
		margin: 0;
		color: #ed344f;
		font-size: 0.9rem;
	}

	.empty {
		color: #56565d;
		text-align: center;
		padding: 2rem;
		font-style: italic;
		list-style: none;
	}

	@media (max-width: 720px) {
		.row {
			grid-template-columns: 40px 1fr;
		}

		.reorder,
		.row-actions {
			grid-column: 1 / -1;
			justify-content: flex-end;
		}
	}
</style>
