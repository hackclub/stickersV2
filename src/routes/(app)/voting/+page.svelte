<svelte:head>
	<title>stickers voting</title>
</svelte:head>

<div class="page">
	<header class="head">
		<h1>voting</h1>
		<span class="soon">coming soon</span>
	</header>
	<p class="lede">
		vote for your favourite submitted designs. each week the winning sticker will be added to the
		shop.
	</p>

	<section class="placeholder">
		<div class="badge">soon</div>
		<p>this is where you'll pick the next sticker. check back later.</p>
	</section>
</div>

<style>
	.page {
		padding: clamp(2rem, 4vw, 4rem);
		max-width: 60rem;
		display: flex;
		flex-direction: column;
		gap: clamp(1rem, 2vw, 2rem);
	}

	.head {
		display: flex;
		align-items: center;
		gap: 0.9rem;
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

	.soon {
		font-family: 'Phantom Sans', sans-serif;
		font-weight: bold;
		font-style: italic;
		font-size: 0.78rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		padding: 0.3rem 0.75rem;
		border-radius: 999px;
		background: #fff959;
		color: black;
		border: 0.16rem solid black;
		box-shadow: 0 3px 0 black;
	}

	.lede {
		margin: 0;
		color: #c8c8d0;
		font-size: clamp(1rem, 1.2vw, 1.2rem);
		max-width: 38rem;
		line-height: 1.5;
	}

	.placeholder {
		background: #1d1c23;
		border: clamp(0.12rem, 0.2vw, 0.28rem) dashed #37373c;
		border-radius: 1.1rem;
		padding: clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 3vw, 2.5rem);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.1rem;
		text-align: center;
	}

	.placeholder .badge {
		font-family: 'Phantom Sans', sans-serif;
		font-weight: bold;
		font-style: italic;
		font-size: 1.1rem;
		padding: 0.55rem 1.4rem;
		background: #ed344f;
		color: white;
		-webkit-text-stroke: black 0.14rem;
		paint-order: stroke fill;
		border: 0.2rem solid black;
		border-radius: 999px;
		box-shadow: 0 5px 0 black;
		text-transform: uppercase;
		letter-spacing: 0.16em;
	}

	.placeholder p {
		margin: 0;
		color: #a3a3ad;
		font-size: 1rem;
		max-width: 28rem;
		line-height: 1.5;
	}
</style>
