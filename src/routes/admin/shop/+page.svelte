<script lang="ts">
	import { untrack } from 'svelte';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingId = $state<number | null>(null);
	let creating = $state(false);

	// Local mutable copy of items for drag-to-reorder. Re-syncs when the server load returns
	// fresh data (e.g. after the reorder form submission redirects).
	let localItems = $state(untrack(() => [...data.items]));
	$effect(() => {
		localItems = [...data.items];
	});

	let dragId = $state<number | null>(null);
	let dragOverId = $state<number | null>(null);
	let reorderForm = $state<HTMLFormElement | null>(null);
	let idsInput = $state<HTMLInputElement | null>(null);

	function onDragStart(e: DragEvent, id: number) {
		dragId = id;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(id));
		}
	}

	function onDragOver(e: DragEvent, id: number) {
		if (dragId === null || dragId === id) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		dragOverId = id;
	}

	function onDragLeave(id: number) {
		if (dragOverId === id) dragOverId = null;
	}

	function onDragEnd() {
		dragId = null;
		dragOverId = null;
	}

	function onDrop(e: DragEvent, id: number) {
		e.preventDefault();
		if (dragId === null || dragId === id) {
			onDragEnd();
			return;
		}
		const fromIdx = localItems.findIndex((i) => i.id === dragId);
		const toIdx = localItems.findIndex((i) => i.id === id);
		if (fromIdx < 0 || toIdx < 0) {
			onDragEnd();
			return;
		}
		const next = [...localItems];
		const [moved] = next.splice(fromIdx, 1);
		next.splice(toIdx, 0, moved);
		localItems = next;
		onDragEnd();

		// Submit the reorder form with the new id sequence.
		if (reorderForm && idsInput) {
			idsInput.value = next.map((i) => i.id).join(',');
			reorderForm.requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>admin — shop</title>
</svelte:head>

<div class="page">
	<header class="head">
		<h1>shop items</h1>
		<button type="button" class="btn primary" onclick={() => (creating = !creating)}>
			{creating ? 'cancel' : '+ add item'}
		</button>
	</header>

	{#if form?.error}<p class="status err">{form.error}</p>{/if}

	{#if creating}
		<form method="POST" action="?/create" class="card form">
			<h2>new item</h2>
			<label>name<input type="text" name="name" required /></label>
			<label>description<textarea name="description" rows="2"></textarea></label>
			<div class="row2">
				<label>price (tokens)<input type="number" name="price" min="0" step="1" required /></label>
				<label>discount %<input type="number" name="discount" min="0" max="99" step="1" placeholder="(none)" /></label>
			</div>
			<label>image url<input type="url" name="image_url" required /></label>
			<button type="submit" class="btn primary">create</button>
		</form>
	{/if}

	<form method="POST" action="?/reorder" bind:this={reorderForm} class="hidden-form">
		<input type="hidden" name="ids" bind:this={idsInput} />
	</form>

	<ul class="items">
		{#each localItems as item (item.id)}
			<li
				class="card"
				class:dragging={dragId === item.id}
				class:drag-over={dragOverId === item.id}
				ondragover={(e) => onDragOver(e, item.id)}
				ondragleave={() => onDragLeave(item.id)}
				ondrop={(e) => onDrop(e, item.id)}
				role="listitem"
			>
				{#if editingId === item.id}
					<form method="POST" action="?/update" class="form">
						<input type="hidden" name="id" value={item.id} />
						<label>name<input type="text" name="name" value={item.name} required /></label>
						<label>description<textarea name="description" rows="2">{item.description ?? ''}</textarea></label>
						<div class="row2">
							<label>price<input type="number" name="price" min="0" step="1" value={item.price} required /></label>
							<label>discount %<input type="number" name="discount" min="0" max="99" step="1" value={item.discount ?? ''} placeholder="(none)" /></label>
						</div>
						<label>image url<input type="url" name="image_url" value={item.image_url} required /></label>
						<div class="row-actions">
							<button type="submit" class="btn primary">save</button>
							<button type="button" class="btn ghost" onclick={() => (editingId = null)}>cancel</button>
						</div>
					</form>
				{:else}
					<div class="row">
						<span
							class="handle"
							draggable="true"
							ondragstart={(e) => onDragStart(e, item.id)}
							ondragend={onDragEnd}
							role="button"
							tabindex="0"
							aria-label="drag to reorder"
							title="drag to reorder"
						>⋮⋮</span>
						<img src={item.image_url} alt="" class="thumb" />
						<div class="meta">
							<strong>{item.name}</strong>
							{#if item.description}<span class="desc">{item.description}</span>{/if}
							<span class="price">
								🪙 {item.price}
								{#if item.discount}<span class="discount">−{item.discount}%</span>{/if}
							</span>
						</div>
						<div class="row-actions">
							<button type="button" class="btn ghost" onclick={() => (editingId = item.id)}>edit</button>
							<form method="POST" action="?/delete" onsubmit={(e) => !confirm('delete?') && e.preventDefault()}>
								<input type="hidden" name="id" value={item.id} />
								<button type="submit" class="btn danger">delete</button>
							</form>
						</div>
					</div>
				{/if}
			</li>
		{/each}
		{#if localItems.length === 0}
			<li class="empty">no items yet.</li>
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
		grid-template-columns: 1.6rem 56px 1fr auto;
		align-items: center;
		gap: 0.75rem;
	}

	.thumb {
		width: 56px;
		height: 56px;
		object-fit: contain;
		background: #141318;
		border-radius: 0.5rem;
		padding: 0.25rem;
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

	.price {
		font-size: 0.9rem;
		color: #c8c8d0;
		font-variant-numeric: tabular-nums;
	}

	.discount {
		margin-left: 0.4rem;
		color: #ed344f;
		font-weight: 600;
	}

	.handle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.6rem;
		height: 1.7rem;
		color: #56565d;
		font-size: 1.05rem;
		letter-spacing: -0.1em;
		cursor: grab;
		user-select: none;
		border-radius: 0.4rem;
		transition: color 0.12s ease, background 0.12s ease;
	}

	.handle:hover,
	.handle:focus-visible {
		color: white;
		background: #2a2932;
		outline: none;
	}

	.handle:active {
		cursor: grabbing;
	}

	.hidden-form {
		display: none;
	}

	.card.dragging {
		opacity: 0.45;
	}

	.card.drag-over {
		outline: 2px dashed #6f8fff;
		outline-offset: -2px;
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
		text-decoration: none;
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
			grid-template-columns: 1.6rem 56px 1fr;
		}

		.row-actions {
			grid-column: 1 / -1;
			justify-content: flex-end;
		}
	}
</style>
