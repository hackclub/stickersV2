<script lang="ts">
	import { page } from '$app/state';
	import '../page.css';

	let { children, data } = $props();

	const links = [
		{ href: '/admin', label: 'overview' },
		{ href: '/admin/shop', label: 'shop' },
		{ href: '/admin/deals', label: 'deals' },
		{ href: '/admin/users', label: 'users' },
		{ href: '/admin/orders', label: 'orders' }
	];
</script>

<div class="admin-shell">
	<aside class="sidebar">
		<a href="/home" class="brand" aria-label="back to app">
			<span class="brand-tag">admin</span>
			{#if data.user?.email}
				<span class="brand-email">{data.user.email}</span>
			{/if}
		</a>
		<nav>
			<ul>
				{#each links as link (link.href)}
					{@const active =
						link.href === '/admin'
							? page.url.pathname === '/admin'
							: page.url.pathname === link.href || page.url.pathname.startsWith(link.href + '/')}
					<li>
						<a href={link.href} class:active>{link.label}</a>
					</li>
				{/each}
			</ul>
		</nav>
		<a class="exit" href="/home">← back to app</a>
	</aside>
	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	.admin-shell {
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
		gap: clamp(1rem, 1.4vw, 1.4rem);
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
		gap: 0.25rem;
	}

	nav a {
		display: block;
		padding: 0.6rem 0.85rem;
		border-radius: 0.55rem;
		color: #c8c8d0;
		text-decoration: none;
		font-size: clamp(1rem, 1.1vw, 1.15rem);
		font-weight: 500;
		transition:
			background 0.12s ease,
			color 0.12s ease;
	}

	nav a:hover {
		background: #2a2a32;
		color: white;
		text-decoration: none;
	}

	nav a.active {
		background: #3758c4;
		color: white;
		font-weight: bold;
	}

	.exit {
		margin-top: auto;
		font-size: 0.85rem;
		color: #56565d;
		text-decoration: none;
		padding: 0.4rem 0;
	}

	.exit:hover {
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
		.admin-shell {
			flex-direction: column;
		}

		.sidebar {
			width: 100%;
			border-right: none;
			border-bottom: clamp(0.15rem, 0.22vw, 0.35rem) solid #37373c;
			padding: 1rem;
		}

		nav ul {
			flex-direction: row;
			flex-wrap: wrap;
		}

		nav a {
			padding: 0.45rem 0.8rem;
			font-size: 0.95rem;
		}

		.exit {
			display: none;
		}
	}
</style>
