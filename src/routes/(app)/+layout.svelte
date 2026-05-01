<script lang="ts">
	import { page } from '$app/state';
	import '../page.css';

	let { children, data } = $props();

	const links = [
		{ href: '/home', label: 'home' },
		{ href: '/shop', label: 'shop' },
		{ href: '/projects', label: 'projects' },
		{ href: '/library', label: 'catalog' },
		{ href: '/voting', label: 'voting' },
		{ href: '/leaderboard', label: 'leaderboard' },
		{ href: '/orders', label: 'orders' },
		{ href: '/artist', label: 'artist' },
		{ href: '/profile', label: 'profile' }
	];
</script>

<div class="app-shell">
	<aside class="sidebar">
		<a href="/" class="brand" aria-label="back to root">
			<span class="brand-tag">stickers</span>
			{#if data.user?.email}
				<span class="brand-email">{data.user.email}</span>
			{/if}
		</a>
		<nav>
			<ul>
				{#each links as link (link.href)}
					<li>
						<a
							href={link.href}
							class:active={page.url.pathname === link.href ||
								page.url.pathname.startsWith(link.href + '/')}
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		{#if data.isAdmin}
			<a class="admin-link" href="/admin">admin →</a>
		{/if}
	</aside>
	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	.app-shell {
		--sidebar-w: clamp(220px, 22vw, 300px);
		position: fixed;
		inset: 0;
		display: flex;
		background-size: var(--page-grid) var(--page-grid);
		background-color: #141318;
		background-image:
			linear-gradient(to right, #1c1c20 var(--page-grid-line), transparent var(--page-grid-line)),
			linear-gradient(to bottom, #1c1c20 var(--page-grid-line), transparent var(--page-grid-line));
		background-position: calc(var(--page-grid) / 2) calc(var(--page-grid) / 2);
		font-family: 'Phantom Sans', sans-serif;
		color: white;
	}

	.sidebar {
		width: var(--sidebar-w);
		flex-shrink: 0;
		box-sizing: border-box;
		background: #1d1c23;
		border-right: clamp(0.15rem, 0.22vw, 0.35rem) solid #37373c;
		padding: clamp(1.5rem, 2.2vw, 2.2rem) clamp(1.2rem, 1.6vw, 1.6rem);
		display: flex;
		flex-direction: column;
		gap: clamp(1.2rem, 1.8vw, 1.8rem);
		overflow-y: auto;
		z-index: 5;
	}

	.brand {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding-bottom: clamp(0.8rem, 1.2vw, 1.2rem);
		border-bottom: 1px solid #37373c;
		text-decoration: none;
		color: inherit;
		transition: opacity 0.12s ease;
	}

	.brand:hover {
		opacity: 0.78;
		text-decoration: none;
	}

	.brand-tag {
		font-size: clamp(1.4rem, 1.8vw, 1.8rem);
		font-weight: bold;
		font-style: italic;
		color: white;
		-webkit-text-stroke: black clamp(0.12rem, 0.2vw, 0.3rem);
		paint-order: stroke fill;
	}

	.brand-email {
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		color: #56565d;
		word-break: break-all;
	}

	nav ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	nav a {
		display: block;
		padding: 0.55rem 0.95rem;
		border-radius: 0.6rem;
		color: white;
		text-decoration: none;
		font-size: clamp(1rem, 1.1vw, 1.15rem);
		font-weight: bold;
		font-style: italic;
		background: #2a2a32;
		border: 0.16rem solid black;
		box-shadow: 0 4px 0 black;
		-webkit-text-stroke: black 0.1rem;
		paint-order: stroke fill;
		transition:
			transform 0.1s ease,
			filter 0.1s ease,
			box-shadow 0.1s ease;
	}

	nav a:hover {
		text-decoration: none;
		filter: brightness(1.18);
		transform: translateY(-2px);
		box-shadow: 0 6px 0 black;
	}

	nav a:active {
		transform: translateY(2px);
		box-shadow: 0 1px 0 black;
	}

	nav a.active {
		font-weight: bold;
		-webkit-text-stroke: black 0.14rem;
	}

	nav li:nth-child(4n + 1) a.active {
		background: #ed344f;
	}

	nav li:nth-child(4n + 2) a.active {
		background: #fff959;
	}

	nav li:nth-child(4n + 3) a.active {
		background: #239640;
	}

	nav li:nth-child(4n) a.active {
		background: #3758c4;
	}

	.admin-link {
		margin-top: auto;
		font-size: 0.85rem;
		color: #56565d;
		text-decoration: none;
		padding: 0.4rem 0;
		border-top: 1px dotted #37373c;
	}

	.admin-link:hover {
		color: white;
		text-decoration: none;
	}

	.content {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
		position: relative;
	}

	@media (max-width: 720px) {
		.app-shell {
			flex-direction: column;
			--sidebar-w: 100%;
		}

		.sidebar {
			width: 100%;
			border-right: none;
			border-bottom: clamp(0.15rem, 0.22vw, 0.35rem) solid #37373c;
			padding: 1rem;
			gap: 0.8rem;
		}

		nav ul {
			flex-direction: row;
			flex-wrap: wrap;
		}

		nav a {
			padding: 0.45rem 0.8rem;
			font-size: 0.95rem;
		}
	}
</style>
