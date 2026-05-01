<script lang="ts">
	import { untrack } from 'svelte';
	import '../../page.css';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let agreed = $state(untrack(() => data.termsAgreed));
	const canContinue = $derived(data.hackatimeLinked && (data.termsAgreed || agreed));
</script>

<svelte:head>
	<title>stickers almost there</title>
</svelte:head>

<main class="scene">
	<div class="card">
		<h1 class="headline">almost there</h1>
		<p class="sub">two last things and you're in.</p>

		<section class="step" class:done={data.hackatimeLinked}>
			<header>
				<span class="badge">1</span>
				<h2>link hackatime</h2>
				{#if data.hackatimeLinked}
					<span class="tick" aria-label="linked">✓</span>
				{/if}
			</header>
			<p>
				hackatime tracks your coding time. linking it lets us reward you for projects you ship.
			</p>
			{#if data.hackatimeLinked}
				<p class="status linked">hackatime is linked.</p>
			{:else}
				<form method="POST" action="/api/auth/hackatime/start">
					<button type="submit" class="btn primary">link hackatime ↗</button>
				</form>
			{/if}
		</section>

		{#if !data.termsAgreed}
			<section class="step">
				<header>
					<span class="badge">2</span>
					<h2>agree to terms</h2>
				</header>
				<label class="check">
					<input type="checkbox" bind:checked={agreed} />
					<span>
						i agree to not cheat the time tracking system. no bots, no fake key presses, no UI
						manipulation. i recognize that if i do, i may be banned from hackatime and other
						participating YSWS / events / programs.
					</span>
				</label>
			</section>
		{/if}

		<form method="POST" action="?/agree">
			<button type="submit" class="btn continue" disabled={!canContinue}>
				continue →
			</button>
		</form>
	</div>
</main>

<style>
	.scene {
		position: fixed;
		inset: 0;
		overflow: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background-size: var(--page-grid) var(--page-grid);
		background-color: #141318;
		background-image:
			linear-gradient(to right, #1c1c20 var(--page-grid-line), transparent var(--page-grid-line)),
			linear-gradient(to bottom, #1c1c20 var(--page-grid-line), transparent var(--page-grid-line));
		background-position: calc(var(--page-grid) / 2) calc(var(--page-grid) / 2);
		font-family: 'Phantom Sans', sans-serif;
	}

	.card {
		max-width: 44rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: clamp(1rem, 1.6vw, 1.6rem);
		text-align: left;
	}

	.headline {
		margin: 0;
		text-align: center;
		font-weight: bold;
		font-style: italic;
		font-size: clamp(2rem, 4.5vw, 4.5rem);
		line-height: 1.1;
		color: white;
		-webkit-text-stroke: black clamp(0.22rem, 0.4vw, 0.6rem);
		paint-order: stroke fill;
	}

	.sub {
		margin: 0;
		text-align: center;
		color: #a3a3ad;
		font-size: clamp(1rem, 1.3vw, 1.3rem);
	}

	.step {
		background: #1d1c23;
		border: clamp(0.12rem, 0.18vw, 0.28rem) solid #37373c;
		border-radius: 1rem;
		padding: clamp(1rem, 1.6vw, 1.6rem);
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		color: white;
	}

	.step header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.step.done {
		border-color: #239640;
	}

	.tick {
		margin-left: auto;
		color: #239640;
		font-weight: bold;
		font-size: 1.2rem;
	}

	.status.linked {
		margin: 0;
		color: #239640;
		font-weight: 600;
		font-size: 0.95rem;
	}

	.step h2 {
		margin: 0;
		font-weight: bold;
		font-style: italic;
		font-size: clamp(1.1rem, 1.4vw, 1.4rem);
		color: white;
	}

	.badge {
		flex-shrink: 0;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 999px;
		background: black;
		color: white;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
	}

	.step p {
		margin: 0;
		color: #c8c8d0;
		font-size: 0.95rem;
		line-height: 1.45;
	}

	.check {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		color: #c8c8d0;
		font-size: 0.95rem;
		cursor: pointer;
		user-select: none;
		line-height: 1.4;
	}

	.check input {
		flex-shrink: 0;
		margin-top: 0.15rem;
		width: 1rem;
		height: 1rem;
		accent-color: #239640;
	}

	.btn {
		font-family: 'Phantom Sans', sans-serif;
		font-size: clamp(1rem, 1.2vw, 1.2rem);
		font-weight: bold;
		padding: 0.7rem 1.6rem;
		color: white;
		-webkit-text-stroke: black 0.18rem;
		paint-order: stroke fill;
		border: clamp(0.15rem, 0.22vw, 0.35rem) solid black;
		border-radius: 999px;
		cursor: pointer;
		box-shadow: 0 5px 0 black;
		text-decoration: none;
		display: inline-block;
		text-align: center;
		transition:
			transform 0.12s ease,
			filter 0.12s ease,
			box-shadow 0.12s ease;
	}

	.btn.primary {
		background: #3758c4;
		align-self: flex-start;
	}

	.btn.continue {
		background: #239640;
		align-self: center;
		margin-top: 0.4rem;
	}

	.btn:hover:not(:disabled) {
		filter: brightness(1.15);
		transform: translateY(-2px);
		box-shadow: 0 7px 0 black;
		text-decoration: none;
	}

	.btn:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: 0 2px 0 black;
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		box-shadow: 0 3px 0 black;
	}
</style>
