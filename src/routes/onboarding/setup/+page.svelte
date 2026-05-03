<script lang="ts">
	import { goto } from '$app/navigation';
	import '../../page.css';
	import { resolve } from '$app/paths';

	const HCA_PORTAL = $derived(
		(() => {
			const base = 'https://auth.hackclub.com/portal/address';
			if (typeof window === 'undefined') return base;
			const params = new URLSearchParams({ return_to: window.location.href });
			return `${base}?${params.toString()}`;
		})()
	);
</script>

<svelte:head>
	<title>stickers - set your address</title>
</svelte:head>

<main class="scene">
	<div class="card">
		<h1 class="headline">first, we need somewhere to send stickers</h1>
		<p class="body">
			hack club auth (HCA) holds your shipping address and phone number. set them once on HCA and
			every hack club service (including this one) can ship things to you.
		</p>

		<ol class="s-steps">
			<li>
				<span class="step-num">1</span>
				<span>open your HCA profile and add your shipping address + phone number.</span>
			</li>
			<li>
				<span class="step-num">2</span>
				<span>come back here and continue.</span>
			</li>
		</ol>

		<div class="actions">
			<a class="btn primary" href={HCA_PORTAL} target="_blank" rel="noopener noreferrer">
				open HCA profile <svg
				fill-rule="evenodd"
				clip-rule="evenodd"
				stroke-linejoin="round"
				stroke-miterlimit="1.414"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				viewBox="0 0 32 32"
				preserveAspectRatio="xMidYMid meet"
				fill="currentColor"
				style="width:1em;height:1em;flex-shrink:0"
			><path
				paint-order="stroke fill"
				stroke="black"
				stroke-width="5"
				stroke-linejoin="round"
				d="M8.26533 22.3155L22.3035 8.27736C21.1495 8.2793 20.2555 8.36029 18.7669 8.49512L18.5569 8.51413C18.0069 8.56413 17.5205 8.15879 17.4705 7.60878C17.4205 7.05876 17.8375 6.64361 18.3763 6.5223C20.2342 6.10404 21.6484 6.10404 24.15 6.35514C24.5244 6.42095 24.908 6.53525 25.1839 6.81113C25.4598 7.08702 25.5741 7.47064 25.6399 7.845C25.891 10.3467 25.891 11.7609 25.4728 13.6176L25.4727 13.6192C25.4227 14.1692 24.9363 14.5745 24.3862 14.5245C23.8362 14.4745 23.4309 13.9881 23.4809 13.4381L23.5092 13.1202C23.6342 11.7164 23.7135 10.8267 23.7167 9.69262L9.68059 23.7287Z"
			/></svg>
			</a>
			<button class="btn secondary" onclick={() => goto(resolve('/onboarding/free'))}>
				i've set my address!
			</button>
		</div>
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
		max-width: 48rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(1rem, 1.6vw, 1.6rem);
		text-align: center;
	}

	.headline {
		margin: 0;
		font-weight: bold;
		font-style: italic;
		font-size: clamp(1.8rem, 3.6vw, 3.6rem);
		line-height: 1.15;
		color: white;
		-webkit-text-stroke: black clamp(0.2rem, 0.34vw, 0.5rem);
		paint-order: stroke fill;
	}

	.body {
		margin: 0;
		color: #c8c8d0;
		font-size: clamp(1rem, 1.2vw, 1.2rem);
		line-height: 1.55;
		max-width: 38rem;
	}

	.s-steps {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		text-align: left;
		width: 100%;
		max-width: 36rem;
	}

	.s-steps li {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		background: #1d1c23;
		border: clamp(0.1rem, 0.16vw, 0.25rem) solid #37373c;
		border-radius: 0.9rem;
		padding: 0.85rem 1rem;
		color: white;
		font-size: clamp(0.95rem, 1.1vw, 1.1rem);
	}

	.step-num {
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

	.actions {
		display: flex;
		gap: clamp(0.6rem, 1vw, 1rem);
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 0.5rem;
	}

	.btn {
		font-family: 'Phantom Sans', sans-serif;
		font-size: clamp(1rem, 1.2vw, 1.2rem);
		font-weight: bold;
		padding: 0.75rem 1.7rem;
		color: white;
		-webkit-text-stroke: black 0.18rem;
		paint-order: stroke fill;
		border: clamp(0.15rem, 0.22vw, 0.35rem) solid black;
		border-radius: 999px;
		cursor: pointer;
		box-shadow: 0 5px 0 black;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		transition:
			transform 0.12s ease,
			filter 0.12s ease,
			box-shadow 0.12s ease;
	}

	.btn.primary {
		background: #3758c4;
	}

	.btn.secondary {
		background: white;
		color: black;
		-webkit-text-stroke: 0;
	}

	.btn:hover {
		filter: brightness(1.15);
		transform: translateY(-2px);
		box-shadow: 0 7px 0 black;
		text-decoration: none;
	}

	.btn:active {
		transform: translateY(2px);
		box-shadow: 0 2px 0 black;
	}
</style>
