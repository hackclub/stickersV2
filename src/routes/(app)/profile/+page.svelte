<script lang="ts">
	import { untrack } from 'svelte';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	const NICKNAME_MAX = 50;

	const hcaPortalUrl = $derived(
		(() => {
			const base = 'https://auth.hackclub.com/portal/address';
			if (typeof window === 'undefined') return base;
			const params = new URLSearchParams({ return_to: window.location.href });
			return `${base}?${params.toString()}`;
		})()
	);

	let usePostalName = $state(untrack(() => !!data.user?.postal_name));
	$effect(() => {
		usePostalName = !!data.user?.postal_name;
	});
</script>

<svelte:head>
	<title>stickers profile</title>
</svelte:head>

<div class="page">
	<h1>profile</h1>
	<p class="lede">description goes here</p>

	<section class="group">
		<h2>account</h2>
		<dl>
			<div>
				<dt>name</dt>
				<dd>{data.user?.first_name ?? '—'}</dd>
			</div>
			<div>
				<dt>email</dt>
				<dd>{data.user?.email ?? '—'}</dd>
			</div>
			<div class="editable">
				<dt>nickname</dt>
				<dd>
					<form method="POST" action="?/updateNickname" class="inline">
						<input
							type="text"
							name="nickname"
							maxlength={NICKNAME_MAX}
							placeholder="(optional)"
							value={(form?.action === 'nickname' ? form.nickname : data.user?.nickname) ?? ''}
						/>
						<button type="submit" class="btn small">save</button>
					</form>
				</dd>
			</div>
		</dl>
		{#if form?.action === 'nickname'}
			{#if form.error}
				<p class="status err">{form.error}</p>
			{:else if form.saved}
				<p class="status ok">saved.</p>
			{/if}
		{/if}
	</section>

	<section class="group">
		<h2>favorite sticker</h2>
		{#if data.favoriteSticker}
			<div class="favorite-row">
				<img src={data.favoriteSticker.cdn_url} alt={data.favoriteSticker.name} />
				<div class="favorite-meta">
					<strong>{data.favoriteSticker.name}</strong>
					{#if data.favoriteSticker.artist}<span class="artist">by {data.favoriteSticker.artist}</span>{/if}
				</div>
			</div>
		{:else}
			<p class="hint">no favorite picked yet.</p>
		{/if}
		<a class="btn ghost" href="/library">change in catalog →</a>
	</section>

	<section class="group">
		<h2>shipping</h2>
		<p class="hint">your address and phone number live on hack club identity.</p>
		<a class="btn" href={hcaPortalUrl} target="_blank" rel="noopener noreferrer">
			edit on HCA ↗
		</a>

		<form method="POST" action="?/updatePostalName" class="postal">
			<label class="toggle">
				<input
					type="checkbox"
					name="use_postal_name"
					bind:checked={usePostalName}
				/>
				<span>address my mail to a different name</span>
			</label>
			{#if usePostalName}
				<div class="row">
					<input
						type="text"
						name="postal_name"
						maxlength={NICKNAME_MAX}
						placeholder="name on package"
						value={(form?.action === 'postal' ? form.postalName : data.user?.postal_name) ?? ''}
					/>
					<button type="submit" class="btn small">save</button>
				</div>
			{:else}
				<button type="submit" class="btn small ghost">clear</button>
			{/if}
			{#if form?.action === 'postal'}
				{#if form.error}
					<p class="status err">{form.error}</p>
				{:else if form.saved}
					<p class="status ok">saved.</p>
				{/if}
			{/if}
		</form>
	</section>

	{#if data.slack?.avatar_url || data.slack?.display_name}
		<section class="group">
			<h2>slack</h2>
			<div class="slack-row">
				{#if data.slack.avatar_url}
					<img src={data.slack.avatar_url} alt="" class="slack-avatar" />
				{/if}
				<div class="slack-meta">
					{#if data.slack.display_name}<strong>{data.slack.display_name}</strong>{/if}
					{#if data.user?.slack_id}<code>{data.user.slack_id}</code>{/if}
				</div>
			</div>
		</section>
	{/if}

	<section class="group">
		<h2>session</h2>
		<p class="hint">signed in as {data.user?.email ?? 'unknown'}.</p>
		<form method="POST" action="?/logout">
			<button type="submit" class="btn danger">sign out</button>
		</form>
	</section>
</div>

<style>
	.page {
		padding: clamp(2rem, 4vw, 4rem);
		max-width: 50rem;
		display: flex;
		flex-direction: column;
		gap: clamp(1rem, 1.6vw, 1.6rem);
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

	.group {
		background: #1d1c23;
		border: clamp(0.1rem, 0.16vw, 0.25rem) solid #37373c;
		border-radius: 1rem;
		padding: clamp(1rem, 1.6vw, 1.6rem);
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.group h2 {
		margin: 0;
		font-size: 0.78rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #56565d;
		font-weight: 600;
	}

	dl {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	dl > div {
		display: flex;
		gap: 1rem;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px dotted #37373c;
		padding-bottom: 0.5rem;
		min-height: 2rem;
	}

	dl > div:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	dt {
		color: #a3a3ad;
		font-size: 0.95rem;
		flex-shrink: 0;
	}

	dd {
		margin: 0;
		color: white;
		font-weight: 500;
		text-align: right;
		word-break: break-all;
		min-width: 0;
	}

	dl > div.editable dd {
		flex: 1;
		text-align: right;
	}

	.inline {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		justify-content: flex-end;
	}

	.inline input {
		flex: 1;
		min-width: 0;
		max-width: 18rem;
		font-family: 'Phantom Sans', sans-serif;
		font-size: 0.95rem;
		padding: 0.4rem 0.7rem;
		background: #141318;
		color: white;
		border: clamp(0.1rem, 0.16vw, 0.25rem) solid #37373c;
		border-radius: 0.5rem;
		outline: none;
		text-align: right;
		transition: border-color 0.12s ease;
	}

	.inline input:focus {
		border-color: #6f8fff;
		text-align: left;
	}

	.inline input::placeholder {
		color: #56565d;
	}

	.hint {
		margin: 0;
		color: #a3a3ad;
		font-size: 0.95rem;
	}

	.btn {
		align-self: flex-start;
		font-family: 'Phantom Sans', sans-serif;
		font-size: 1rem;
		font-weight: bold;
		padding: 0.55rem 1.2rem;
		color: white;
		-webkit-text-stroke: black 0.16rem;
		paint-order: stroke fill;
		background: #3758c4;
		border: clamp(0.12rem, 0.2vw, 0.3rem) solid black;
		border-radius: 999px;
		text-decoration: none;
		box-shadow: 0 4px 0 black;
		cursor: pointer;
		transition:
			transform 0.12s ease,
			filter 0.12s ease,
			box-shadow 0.12s ease;
	}

	.btn:hover {
		filter: brightness(1.15);
		transform: translateY(-2px);
		box-shadow: 0 6px 0 black;
		text-decoration: none;
	}

	.btn:active {
		transform: translateY(2px);
		box-shadow: 0 1px 0 black;
	}

	.btn.small {
		font-size: 0.85rem;
		padding: 0.35rem 0.85rem;
		box-shadow: 0 3px 0 black;
		-webkit-text-stroke: black 0.12rem;
	}

	.btn.small:hover {
		box-shadow: 0 5px 0 black;
	}

	.btn.small:active {
		box-shadow: 0 1px 0 black;
	}

	.btn.danger {
		background: #ed344f;
	}

	.btn.ghost {
		background: transparent;
		color: #a3a3ad;
		border-color: #37373c;
		-webkit-text-stroke: 0;
		box-shadow: none;
	}

	.btn.ghost:hover {
		filter: none;
		color: white;
		border-color: #56565d;
		transform: none;
		box-shadow: none;
	}

	.btn.ghost:active {
		transform: none;
		box-shadow: none;
	}

	.postal {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: 0.4rem;
		padding-top: 0.8rem;
		border-top: 1px dotted #37373c;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #c8c8d0;
		font-size: 0.95rem;
		cursor: pointer;
		user-select: none;
	}

	.toggle input {
		accent-color: #3758c4;
		width: 1rem;
		height: 1rem;
	}

	.row {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.row input {
		flex: 1;
		min-width: 12rem;
		font-family: 'Phantom Sans', sans-serif;
		font-size: 1rem;
		padding: 0.55rem 0.9rem;
		background: #141318;
		color: white;
		border: clamp(0.1rem, 0.16vw, 0.25rem) solid #37373c;
		border-radius: 0.6rem;
		outline: none;
		transition: border-color 0.12s ease;
	}

	.row input:focus {
		border-color: #6f8fff;
	}

	.row input::placeholder {
		color: #56565d;
	}

	.status {
		margin: 0;
		font-size: 0.9rem;
	}

	.status.ok {
		color: #67c87a;
	}

	.status.err {
		color: #ed344f;
	}

	.favorite-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.favorite-row img {
		width: 4.5rem;
		height: 4.5rem;
		object-fit: contain;
		background: #141318;
		border: clamp(0.1rem, 0.16vw, 0.25rem) solid #37373c;
		border-radius: 0.6rem;
		padding: 0.3rem;
	}

	.favorite-meta {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.favorite-meta strong {
		color: white;
		font-weight: 600;
		font-size: 1rem;
	}

	.artist {
		color: #a3a3ad;
		font-size: 0.9rem;
	}

	.slack-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.slack-avatar {
		width: 4rem;
		height: 4rem;
		border-radius: 999px;
		object-fit: cover;
		background: #141318;
		border: clamp(0.1rem, 0.16vw, 0.25rem) solid #37373c;
	}

	.slack-meta {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.slack-meta strong {
		color: white;
		font-weight: 600;
		font-size: 1rem;
	}

	.slack-meta code {
		color: #a3a3ad;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.85rem;
	}
</style>
