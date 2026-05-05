<svelte:head>
	<title>stickers artist portal</title>
</svelte:head>

<div class="page">
	<h1>artist portal</h1>
	<p class="lede">description goes here</p>

	<section class="section">
		<h2>actions</h2>
		<div class="grid">
			<div class="card">
				<h3>upload a new design</h3>
				<p>description goes here</p>
				<button type="button" class="btn ghost" disabled>upload (coming soon)</button>
			</div>

			<div class="card">
				<h3>remove a sticker</h3>
				<p>description goes here</p>
				<button type="button" class="btn ghost" disabled>Just DM us for now</button>
			</div>
		</div>
	</section>

	<section class="section">
		<h2>my designs</h2>
		<div class="grid">
			<div class="design-card">
				<div class="thumb"></div>
				<div class="meta">
					<h3>design 1</h3>
					<div class="row">
						<span class="label">produced</span>
						<span class="value">true</span>
					</div>
				</div>
				<span class="pill">0 prints</span>
			</div>

			<div class="design-card">
				<div class="thumb"></div>
				<div class="meta">
					<h3>design 2</h3>
					<div class="row">
						<span class="label">produced</span>
						<span class="value">false</span>
					</div>
				</div>
				<span class="pill">0 prints</span>
			</div>

			<div class="design-card">
				<div class="thumb"></div>
				<div class="meta">
					<h3>design 3</h3>
					<div class="row">
						<span class="label">produced</span>
						<span class="value">true</span>
					</div>
				</div>
				<span class="pill">0 prints</span>
			</div>
		</div>
	</section>
</div>

<style>
	.page {
		padding: clamp(2rem, 4vw, 4rem);
		width: 100%;
		box-sizing: border-box;
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

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.section h2 {
		margin: 0;
		font-size: 0.78rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #56565d;
		font-weight: 600;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: clamp(0.8rem, 1.4vw, 1.2rem);
	}

	.card {
		background: #1d1c23;
		border: clamp(0.1rem, 0.16vw, 0.25rem) solid #37373c;
		border-radius: 1rem;
		padding: clamp(1rem, 1.4vw, 1.4rem);
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.card h3 {
		margin: 0;
		color: white;
		font-size: 1.05rem;
		font-weight: 600;
	}

	.card p {
		margin: 0;
		color: #a3a3ad;
		font-size: 0.92rem;
		line-height: 1.4;
		flex: 1;
	}

	.btn {
		align-self: flex-start;
		font-family: 'Phantom Sans', sans-serif;
		font-style: italic;
		font-size: 0.95rem;
		font-weight: bold;
		padding: 0.6rem 1.2rem;
		border-radius: 999px;
		text-decoration: none;
		cursor: pointer;
		border: 0.18rem solid black;
		box-shadow: 0 4px 0 black;
		transition:
			transform 0.1s ease,
			filter 0.1s ease,
			box-shadow 0.1s ease;
	}

	.btn.ghost {
		background: #2a2930;
		color: white;
		-webkit-text-stroke: black 0.1rem;
		paint-order: stroke fill;
	}

	.btn.ghost:hover:not(:disabled) {
		filter: brightness(1.18);
		transform: translateY(-2px);
		box-shadow: 0 6px 0 black;
	}

	.btn.ghost:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: 0 1px 0 black;
	}

	.btn.ghost:disabled {
		cursor: not-allowed;
		background: #1d1c23;
		color: #56565d;
		-webkit-text-stroke: 0;
		box-shadow: 0 3px 0 black;
		opacity: 0.85;
	}

	.design-card {
		background: #1d1c23;
		border: clamp(0.1rem, 0.16vw, 0.25rem) solid #37373c;
		border-radius: 1rem;
		padding: clamp(1rem, 1.4vw, 1.4rem);
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		position: relative;
	}

	.thumb {
		aspect-ratio: 1 / 1;
		width: 100%;
		background: #2a2930;
		border-radius: 0.6rem;
		border: 1px dashed #37373c;
	}

	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.meta h3 {
		margin: 0;
		color: white;
		font-size: 1.05rem;
		font-weight: 600;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.label {
		color: #56565d;
		text-transform: uppercase;
		font-size: 0.72rem;
		letter-spacing: 0.16em;
	}

	.value {
		color: #c8c8d0;
		font-variant-numeric: tabular-nums;
	}

	.pill {
		align-self: flex-start;
		background: #2a2930;
		color: #c8c8d0;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.3rem 0.7rem;
		border-radius: 999px;
		border: 1px solid #37373c;
		font-variant-numeric: tabular-nums;
	}
</style>
