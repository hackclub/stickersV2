<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import type { ActionData, PageData } from './$types';

	const { data, form }: { data: PageData; form: ActionData } = $props();

	function safeHttpUrl(value: unknown): string | null {
		if (typeof value !== 'string') return null;
		try {
			const u = new URL(value);
			if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
			return u.toString();
		} catch {
			return null;
		}
	}

	let creating = $state(false);
	let submitting = $state(false);

	let description = $state(untrack(() => form?.values?.description ?? ''));
	let codeUrl = $state(untrack(() => form?.values?.codeUrl ?? ''));
	let playableUrl = $state(untrack(() => form?.values?.playableUrl ?? ''));
	let screenshot1 = $state(untrack(() => form?.values?.screenshot1 ?? ''));
	let screenshot2 = $state(untrack(() => form?.values?.screenshot2 ?? ''));

	function resetForm() {
		creating = false;
		description = '';
		codeUrl = '';
		playableUrl = '';
		screenshot1 = '';
		screenshot2 = '';
	}

	const canSubmit = $derived(description.trim() !== '' && !submitting);

	function firstScreenshot(p: (typeof data.projects)[number]) {
		const shots = p.fields.screenshot;
		if (Array.isArray(shots) && shots.length > 0) return safeHttpUrl(shots[0]?.url);
		return null;
	}

	function shortDate(iso: string) {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleDateString();
	}
</script>

<svelte:head>
	<title>projects — stickers</title>
</svelte:head>

<div class="page">
	<h1>projects</h1>
	<p class="lede">description goes here</p>

	{#if data.airtableError}
		<div class="alert">airtable: {data.airtableError}</div>
	{/if}

	{#if form?.error}
		<div class="alert">{form.error}</div>
	{/if}
	{#if form?.success}
		<div class="alert success">project submitted — check airtable</div>
	{/if}

	<div class="grid">
		{#each data.projects as p (p.id)}
			<article class="card">
				<div class="card-thumb">
					{#if firstScreenshot(p)}
						<img src={firstScreenshot(p)} alt="screenshot" loading="lazy" />
					{:else}
						<span class="card-thumb-empty">no screenshot</span>
					{/if}
				</div>
				<div class="card-body">
					<span class="card-date">{shortDate(p.createdTime)}</span>
					{#if p.fields.description}
						<p class="card-desc">{p.fields.description}</p>
					{/if}
					<div class="card-links">
						{#if safeHttpUrl(p.fields.code_url)}
							<a href={safeHttpUrl(p.fields.code_url)} target="_blank" rel="noopener noreferrer">
								code
							</a>
						{/if}
						{#if safeHttpUrl(p.fields.playable_url)}
							<a
								href={safeHttpUrl(p.fields.playable_url)}
								target="_blank"
								rel="noopener noreferrer"
							>
								playable
							</a>
						{/if}
					</div>
				</div>
			</article>
		{/each}

		<button
			type="button"
			class="card create-card"
			onclick={() => {
				creating = true;
			}}
		>
			<span class="plus">+</span>
			<span class="create-label">create new project</span>
		</button>
	</div>
</div>

{#if creating}
	<div
		class="modal-backdrop"
		role="dialog"
		aria-modal="true"
		aria-label="create project"
		onclick={(e) => {
			if (e.target === e.currentTarget) creating = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') creating = false;
		}}
		tabindex="-1"
	>
		<form
			method="POST"
			action="?/create"
			class="modal"
			use:enhance={() => {
				submitting = true;
				return async ({ result, update }) => {
					submitting = false;
					await update();
					if (result.type === 'success') resetForm();
				};
			}}
		>
			<header class="modal-head">
				<h2>new project</h2>
				<button
					type="button"
					class="modal-close"
					aria-label="close"
					onclick={() => (creating = false)}>×</button
				>
			</header>

			<div class="form-grid">
				<div class="form-group">
					<label class="form-label" for="description">
						description <span class="required">*</span>
					</label>
					<textarea
						id="description"
						name="description"
						class="form-input form-textarea"
						maxlength={300}
						placeholder={'Project goal:\nMy tech stack:\nHow long it took:'}
						bind:value={description}
					></textarea>
					<div class="caption-row">
						<span class="caption">describe your project</span>
						<span class="charcount" class:over={description.length >= 300}>
							{description.length}/300
						</span>
					</div>
					{#if form?.errors?.description}
						<span class="err">{form.errors.description}</span>
					{/if}
				</div>

				<div class="form-row">
					<div class="form-group">
						<label class="form-label" for="code_url">code URL</label>
						<input
							id="code_url"
							name="code_url"
							type="url"
							class="form-input"
							placeholder="https://github.com/hackclub/"
							bind:value={codeUrl}
						/>
						<span class="caption">link to your source code</span>
					</div>
					<div class="form-group">
						<label class="form-label" for="playable_url">playable URL</label>
						<input
							id="playable_url"
							name="playable_url"
							type="url"
							class="form-input"
							placeholder="https://hackclub.com"
							bind:value={playableUrl}
						/>
						<span class="caption">live demo / playable build</span>
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label class="form-label" for="screenshot1">screenshot 1 URL</label>
						<input
							id="screenshot1"
							name="screenshot1"
							type="url"
							class="form-input"
							placeholder="https://..."
							bind:value={screenshot1}
						/>
					</div>
					<div class="form-group">
						<label class="form-label" for="screenshot2">screenshot 2 URL</label>
						<input
							id="screenshot2"
							name="screenshot2"
							type="url"
							class="form-input"
							placeholder="https://..."
							bind:value={screenshot2}
						/>
					</div>
				</div>

				<p class="hca-note">
					You can upload a screenshot to #cdn to get a url
				</p>
			</div>

			<footer class="modal-foot">
				<button type="button" class="btn-cancel" onclick={() => (creating = false)}>cancel</button>
				<button type="submit" class="btn-submit" disabled={!canSubmit}>
					{submitting ? 'creating…' : 'create project'}
				</button>
			</footer>
		</form>
	</div>
{/if}

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

	.alert {
		background: #2a1d22;
		border: 1px solid #ed344f;
		color: #ffd6dd;
		padding: 0.7rem 0.9rem;
		border-radius: 0.6rem;
		font-size: 0.95rem;
	}

	.alert.success {
		background: #1d2a22;
		border-color: #239640;
		color: #c0f0cf;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
		gap: 1.25rem;
	}

	.card {
		background: #1d1c23;
		border: clamp(0.12rem, 0.18vw, 0.24rem) solid #37373c;
		border-radius: 0.9rem;
		padding: 0;
		overflow: hidden;
		text-align: left;
		display: flex;
		flex-direction: column;
		color: inherit;
	}

	.card-thumb {
		aspect-ratio: 16 / 9;
		background: #14131a;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.card-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.card-thumb-empty {
		color: #56565d;
		font-size: 0.85rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.card-body {
		padding: 0.9rem 1rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.card-date {
		font-size: 0.78rem;
		color: #56565d;
		letter-spacing: 0.05em;
	}

	.card-desc {
		margin: 0;
		color: #a3a3ad;
		font-size: 0.92rem;
		line-height: 1.45;
		white-space: pre-line;
	}

	.card-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: 0.2rem;
	}

	.card-links a {
		font-size: 0.85rem;
		color: #fff959;
		text-decoration: none;
	}

	.card-links a:hover {
		text-decoration: underline;
	}

	.create-card {
		cursor: pointer;
		background: #14131a;
		border-style: dashed;
		min-height: 14rem;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: inherit;
		transition:
			background 0.15s ease,
			border-color 0.15s ease;
	}

	.create-card:hover {
		background: #1d1c23;
		border-color: #fff959;
	}

	.plus {
		font-size: 3rem;
		font-weight: bold;
		color: #fff959;
		line-height: 1;
	}

	.create-label {
		font-style: italic;
		font-weight: bold;
		color: #c8c8d0;
		font-size: 1rem;
	}

	/* modal */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.65);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: clamp(1rem, 4vw, 3rem);
		z-index: 50;
		overflow-y: auto;
	}

	.modal {
		background: #1d1c23;
		border: clamp(0.12rem, 0.2vw, 0.28rem) solid #37373c;
		border-radius: 1rem;
		padding: 1.5rem;
		width: min(48rem, 100%);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.modal-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.modal-head h2 {
		margin: 0;
		font-weight: bold;
		font-style: italic;
		color: white;
		-webkit-text-stroke: black 0.14rem;
		paint-order: stroke fill;
		font-size: 1.3rem;
	}

	.modal-close {
		background: transparent;
		border: none;
		color: #c8c8d0;
		font-size: 1.6rem;
		cursor: pointer;
		line-height: 1;
		padding: 0.2rem 0.4rem;
	}

	.form-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	@media (max-width: 600px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.form-label {
		font-size: 0.95rem;
		font-weight: bold;
		font-style: italic;
		color: #e6e6ea;
	}

	.required {
		color: #ed344f;
	}

	.form-input {
		font-family: inherit;
		font-size: 0.95rem;
		background: #14131a;
		color: white;
		border: 0.12rem solid #37373c;
		border-radius: 0.55rem;
		padding: 0.55rem 0.7rem;
	}

	.form-input:focus {
		outline: none;
		border-color: #fff959;
	}

	.form-textarea {
		min-height: 5.5rem;
		resize: vertical;
	}

	.caption-row {
		display: flex;
		justify-content: space-between;
		gap: 0.6rem;
	}

	.caption {
		font-size: 0.8rem;
		color: #a3a3ad;
	}

	.charcount {
		font-size: 0.8rem;
		color: #56565d;
	}

	.charcount.over {
		color: #ed344f;
	}

	.err {
		color: #ed344f;
		font-size: 0.85rem;
	}

	.hca-note {
		margin: 0;
		font-size: 0.82rem;
		color: #56565d;
		font-style: italic;
	}

	.modal-foot {
		display: flex;
		justify-content: flex-end;
		gap: 0.6rem;
	}

	.btn-cancel,
	.btn-submit {
		font-family: inherit;
		font-weight: bold;
		font-style: italic;
		border: 0.14rem solid black;
		border-radius: 9999px;
		padding: 0.5rem 1.2rem;
		cursor: pointer;
	}

	.btn-cancel {
		background: #37373c;
		color: #e6e6ea;
	}

	.btn-submit {
		background: #239640;
		color: white;
		-webkit-text-stroke: black 0.1rem;
		paint-order: stroke fill;
	}

	.btn-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-submit:hover:not(:disabled) {
		filter: brightness(1.05);
	}
</style>
