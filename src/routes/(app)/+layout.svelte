<script lang="ts">
	import { page } from '$app/state';
	import '../page.css';
	import { resolve } from '$app/paths';

	let { children, data } = $props();

	const links = [
		{
			href: '/home',
			label: 'home',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M16,5c-0.358,0 -0.736,0.149 -0.997,0.264c-0.297,0.13 -0.676,0.326 -1.077,0.555c-0.789,0.451 -1.798,1.102 -2.878,1.864c-2.149,1.518 -4.715,3.572 -6.755,5.61c-0.391,0.39 -0.391,1.024 0,1.414c0.39,0.391 1.024,0.391 1.414,0c1.96,-1.962 4.394,-3.908 6.495,-5.39c1.045,-0.738 1.974,-1.337 2.716,-1.761c0.365,-0.209 0.649,-0.357 0.887,-0.46c0.091,-0.04 0.154,-0.064 0.195,-0.078c0.041,0.014 0.104,0.038 0.194,0.078c0.239,0.103 0.523,0.251 0.888,0.46c0.742,0.424 1.671,1.023 2.716,1.761c2.101,1.482 4.535,3.428 6.495,5.39c0.39,0.391 1.024,0.391 1.414,0c0.391,-0.39 0.391,-1.024 0,-1.414c-2.04,-2.038 -4.606,-4.092 -6.755,-5.61c-1.08,-0.762 -2.089,-1.413 -2.878,-1.864c-0.401,-0.229 -0.78,-0.425 -1.077,-0.555c-0.262,-0.115 -0.639,-0.264 -0.997,-0.264Zm3.934,19.816c0.184,-0.028 0.358,-0.061 0.524,-0.098l0.014,-0.003c0.923,-0.2 1.291,-0.482 1.522,-0.79c0.292,-0.39 0.589,-1.123 0.774,-2.649l0.001,-0.003c0.165,-1.347 0.218,-3.047 0.229,-5.273c0.002,-0.552 0.45,-1 1.002,-1c0.552,0 1,0.448 0.998,1c-0.052,10.061 -1.005,11 -8.998,11c-7.993,0 -8.946,-0.939 -8.998,-11c-0.002,-0.552 0.446,-1 0.998,-1c0.552,0 1,0.448 1.002,1c0.011,2.226 0.064,3.926 0.229,5.273l0.001,0.003c0.185,1.526 0.482,2.259 0.774,2.649c0.231,0.308 0.599,0.59 1.523,0.79l0.013,0.003c0.166,0.037 0.34,0.07 0.524,0.098c-0.049,-0.788 -0.066,-1.718 -0.066,-2.816c0,-5.133 0.4,-6 4,-6c3.6,0 4,0.867 4,6c0,1.098 -0.017,2.028 -0.066,2.816Zm-2.015,0.16c0.062,-0.782 0.081,-1.74 0.081,-2.976c0,-1.258 -0.02,-2.159 -0.105,-2.87l0,-0.002c-0.081,-0.688 -0.196,-0.921 -0.228,-0.973c-0.001,-0.001 -0.001,-0.002 -0.001,-0.003c-0.002,-0.005 -0.007,-0.009 -0.012,-0.009c-0.019,-0.001 -0.042,-0.003 -0.073,-0.009c-0.004,-0.001 -0.009,-0.002 -0.012,-0.003c-0.338,-0.11 -0.751,-0.133 -1.568,-0.131l-0.002,0c-0.817,-0.002 -1.23,0.021 -1.568,0.131c-0.004,0.001 -0.008,0.002 -0.012,0.003c-0.031,0.006 -0.055,0.008 -0.073,0.009c-0.005,0 -0.01,0.004 -0.012,0.009c0,0.002 0,0.002 -0.001,0.003c-0.032,0.052 -0.147,0.285 -0.228,0.973l0,0.002c-0.085,0.711 -0.105,1.612 -0.105,2.87c0,1.236 0.019,2.194 0.08,2.976c0.569,0.018 1.204,0.024 1.92,0.024l0,0c0.715,0 1.35,-0.006 1.919,-0.024Z"/></svg>`
		},
		{
			href: '/projects',
			label: 'projects',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="grid" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="256" height="256"><path d="M12.862 12.776c.072-.302.138-.842.138-1.776s-.066-1.474-.138-1.776a2.012 2.012 0 0 0-.017-.069 2.103 2.103 0 0 0-.069-.017C12.474 9.066 11.934 9 11 9s-1.474.066-1.776.138a2.08 2.08 0 0 0-.069.017 2.08 2.08 0 0 0-.017.069C9.066 9.526 9 10.066 9 11s.066 1.474.138 1.776l.017.069.069.017c.302.072.842.138 1.776.138s1.474-.066 1.776-.138l.069-.017.017-.069zm10 0c.072-.302.138-.842.138-1.776s-.066-1.474-.138-1.776a2.012 2.012 0 0 0-.017-.069 2.103 2.103 0 0 0-.069-.017C22.474 9.066 21.934 9 21 9s-1.474.066-1.776.138a2.103 2.103 0 0 0-.069.017l-.017.069C19.066 9.526 19 10.066 19 11s.066 1.474.138 1.776l.017.069.069.017c.302.072.842.138 1.776.138s1.474-.066 1.776-.138l.069-.017.017-.069zm-10 10c.072-.302.138-.842.138-1.776s-.066-1.474-.138-1.776a2.034 2.034 0 0 0-.017-.069 2.034 2.034 0 0 0-.069-.017C12.474 19.066 11.934 19 11 19s-1.474.066-1.776.138a2.012 2.012 0 0 0-.069.017l-.017.069C9.066 19.526 9 20.066 9 21s.066 1.474.138 1.776l.017.069.069.017c.302.072.842.138 1.776.138s1.474-.066 1.776-.138l.069-.017.017-.069zm10 0c.072-.302.138-.842.138-1.776s-.066-1.474-.138-1.776a2.034 2.034 0 0 0-.017-.069 2.034 2.034 0 0 0-.069-.017C22.474 19.066 21.934 19 21 19s-1.474.066-1.776.138a2.034 2.034 0 0 0-.069.017l-.017.069c-.072.302-.138.842-.138 1.776s.066 1.474.138 1.776l.017.069.069.017c.302.072.842.138 1.776.138s1.474-.066 1.776-.138l.069-.017.017-.069zM15 11c0 2.007-.275 2.861-.707 3.293-.432.432-1.286.707-3.293.707s-2.861-.275-3.293-.707C7.275 13.861 7 13.007 7 11s.275-2.861.707-3.293C8.139 7.275 8.993 7 11 7s2.861.275 3.293.707C14.725 8.139 15 8.993 15 11zm10 0c0 2.007-.275 2.861-.707 3.293-.432.432-1.286.707-3.293.707s-2.861-.275-3.293-.707C17.275 13.861 17 13.007 17 11s.275-2.861.707-3.293C18.139 7.275 18.993 7 21 7s2.861.275 3.293.707C24.725 8.139 25 8.993 25 11zM14.293 24.293c.432-.432.707-1.286.707-3.293s-.275-2.861-.707-3.293C13.861 17.275 13.007 17 11 17s-2.861.275-3.293.707C7.275 18.139 7 18.993 7 21s.275 2.861.707 3.293C8.139 24.725 8.993 25 11 25s2.861-.275 3.293-.707zM25 21c0 2.007-.275 2.861-.707 3.293-.432.432-1.286.707-3.293.707s-2.861-.275-3.293-.707C17.275 23.861 17 23.007 17 21s.275-2.861.707-3.293C18.139 17.275 18.993 17 21 17s2.861.275 3.293.707c.432.432.707 1.286.707 3.293z"/></svg>`
		},
		{
			href: '/shop',
			label: 'shop',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="bag" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="256" height="256"><path d="M19.229 17.06c-.65-.64-1.948-.96-3.247.32-1.298-1.28-2.597-.96-3.246-.32-2.597 2.56 2.45 5.94 3.246 5.94.797 0 5.844-3.38 3.247-5.94z"/><path d="M14 11.524a77.266 77.266 0 0 1 2-.024c10.083 0 11 1.5 11 8s-.917 8-11 8c-.711 0-1.377-.007-2-.024-8.208-.212-9-1.935-9-7.976s.792-7.764 9-7.976zM7 19.5c0 1.581.039 2.668.25 3.542.166.799.259 1.02.715 1.332.359.285 1.028.598 2.38.816 1.384.226 3.158.31 5.604.31H16c2.473 0 4.261-.083 5.655-.31 1.352-.218 2.021-.53 2.38-.816.456-.313.55-.533.715-1.332.211-.874.25-1.96.25-3.542 0-1.581-.039-2.668-.25-3.542-.166-.799-.259-1.02-.715-1.332-.359-.285-1.028-.598-2.38-.816-1.394-.227-3.182-.31-5.655-.31h-.05c-2.447 0-4.22.085-5.605.31-1.352.218-2.021.53-2.38.816-.456.313-.55.533-.715 1.332-.211.874-.25 1.96-.25 3.542z"/><path d="M16 4.5a5 5 0 0 0-5 5v2a1 1 0 1 0 2 0v-2a3 3 0 0 1 6 0v2a1 1 0 1 0 2 0v-2a5 5 0 0 0-5-5z"/></svg>`
		},
		{
			href: '/library',
			label: 'catalog',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="docs" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="256" height="256"><path d="M21.048 6.291C19.836 6.05 18.256 6 16 6c-2.256 0-3.836.05-5.048.291-1.11.216-1.577.533-1.853.864-.32.384-.641 1.094-.844 2.597C8.046 11.283 8 13.274 8 16c0 2.725.046 4.717.255 6.248.203 1.503.524 2.213.844 2.597.276.331.743.648 1.853.864C12.164 25.95 13.744 26 16 26c2.256 0 3.836-.05 5.048-.291 1.11-.216 1.577-.533 1.853-.864.32-.384.641-1.094.843-2.597.21-1.531.256-3.523.256-6.248 0-2.726-.046-4.717-.256-6.248-.202-1.503-.523-2.213-.843-2.597-.276-.331-.743-.648-1.853-.864zM26 16c0-11-.833-12-10-12S6 5 6 16s.833 12 10 12 10-1 10-12z"/><path d="M9.5 11a1 1 0 0 1 1-1h11a1 1 0 0 1 0 2h-11a1 1 0 0 1-1-1zM9.5 16a1 1 0 0 1 1-1h11a1 1 0 0 1 0 2h-11a1 1 0 0 1-1-1zM9.5 21a1 1 0 0 1 1-1h8a1 1 0 0 1 0 2h-8a1 1 0 0 1-1-1z"/></svg>`
		},
		{
			href: '/orders',
			label: 'orders',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="package-seam" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="256" height="256"><path d="M14.398 4.57901C15.3766 3.96097 16.6234 3.96097 17.602 4.57901L25.102 9.31586C25.9723 9.86551 26.5 10.823 26.5 11.8523V20.5969C26.5 21.6674 25.9296 22.6568 25.0031 23.1932L17.5031 27.5353C16.5733 28.0736 15.4267 28.0736 14.4969 27.5353L6.99686 23.1932C6.07041 22.6568 5.49997 21.6674 5.49997 20.5969V11.8523C5.49997 10.823 6.0277 9.86551 6.89799 9.31585L14.398 4.57901ZM16.534 6.26999C16.2078 6.06398 15.7922 6.06397 15.466 6.26999L8.46355 10.6926L11.2329 12.223L18.8338 7.72248L16.534 6.26999ZM20.7332 8.92211L13.2633 13.3451L16 14.8575L23.5364 10.6926L20.7332 8.92211ZM7.49997 20.5969V12.4452L15 16.5899V25.5155L7.99894 21.4623C7.69012 21.2835 7.49997 20.9537 7.49997 20.5969ZM24.001 21.4623L17 25.5155V16.5899L24.5 12.4452V20.5969C24.5 20.9537 24.3098 21.2835 24.001 21.4623Z"/></svg>`
		},
		{
			href: '/artist',
			label: 'artist',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="moon-star" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor" width="256" height="256"><path d="M23.6092 6.13958C23.4536 5.82987 23.3348 5.45086 23.2301 4.97851C23.2273 4.96719 23.2248 4.95587 23.2224 4.94455C23.2199 4.93324 23.2174 4.92194 23.2146 4.91063C23.2082 4.88023 23.2019 4.84982 23.1955 4.818C23.1163 4.43475 22.5273 4.43404 22.4495 4.81588C22.4382 4.87103 22.4269 4.92477 22.4156 4.9771C22.3116 5.4544 22.1928 5.83765 22.0365 6.14948C21.9538 6.31565 21.8591 6.46132 21.7502 6.59142C21.6802 6.67557 21.6038 6.75194 21.5204 6.82265C21.3917 6.93296 21.2467 7.02842 21.0812 7.11327C20.7708 7.27237 20.3897 7.3947 19.9124 7.5043C19.8728 7.51393 19.8324 7.52276 19.7915 7.53169C19.7783 7.53456 19.7651 7.53744 19.7519 7.54036C19.37 7.62238 19.3785 8.2107 19.7625 8.28636C19.7763 8.28904 19.79 8.29169 19.8037 8.29431C19.8441 8.30207 19.8839 8.30973 19.923 8.31818C20.3911 8.41717 20.7673 8.53031 21.0742 8.68022C21.2396 8.76083 21.3846 8.85204 21.5133 8.9567C21.6087 9.03518 21.6943 9.12074 21.7735 9.2155C21.8796 9.34278 21.9715 9.48703 22.0535 9.65108C22.207 9.95725 22.3236 10.3327 22.4276 10.7987C22.4343 10.8283 22.4406 10.858 22.4469 10.8879C22.4519 10.9115 22.4569 10.9352 22.4622 10.9592C22.5414 11.3425 23.1297 11.3439 23.2082 10.9613C23.2188 10.9069 23.2301 10.8532 23.2415 10.8008C23.3447 10.3285 23.4621 9.94947 23.6162 9.64117C23.6982 9.47571 23.7916 9.33146 23.8984 9.20348C23.9726 9.11367 24.0539 9.03236 24.143 8.95882C24.271 8.85204 24.4153 8.75871 24.5807 8.67668C24.889 8.52253 25.268 8.40515 25.7404 8.30191C25.7927 8.2906 25.8464 8.27929 25.9016 8.26797C26.2834 8.19019 26.2827 7.60117 25.8995 7.52198C25.8451 7.51138 25.7921 7.49937 25.7391 7.48736L25.739 7.48733C25.2666 7.38268 24.8883 7.26459 24.5793 7.10973C24.4131 7.02559 24.2675 6.93225 24.1388 6.82477C24.049 6.75052 23.9669 6.6685 23.8927 6.5787C23.7852 6.45 23.6912 6.30505 23.6092 6.13958ZM22.5303 23.4697H22.5317C20.8593 24.7267 18.7817 25.4697 16.5303 25.4697C11.0074 25.4697 6.53027 20.9926 6.53027 15.4697C6.53027 13.2183 7.2733 11.1407 8.53027 9.46827V9.46974C8.53027 17.2017 14.7983 23.4697 22.5303 23.4697ZM26.1197 22.6849C26.6747 21.9485 25.8563 21.0399 24.9529 21.2251C24.1704 21.3855 23.3602 21.4697 22.5303 21.4697C15.9029 21.4697 10.5303 16.0972 10.5303 9.46974C10.5303 8.63981 10.6145 7.82957 10.7749 7.04709C10.9601 6.14376 10.0515 5.32532 9.3151 5.88028C6.40906 8.07026 4.53027 11.5506 4.53027 15.4697C4.53027 22.0972 9.90286 27.4697 16.5303 27.4697C20.4494 27.4697 23.9298 25.591 26.1197 22.6849Z"/></svg>`
		}
	];

	const ACCENT = ['#ed344f', '#f5ee49', '#239640', '#3758c4'];

	const activeIndex = $derived(
		links.findIndex(
			(l) => page.url.pathname === l.href || page.url.pathname.startsWith(l.href + '/')
		)
	);

	const activeColor = $derived(activeIndex >= 0 ? ACCENT[activeIndex % 4] : ACCENT[0]);

	const profileActive = $derived(
		page.url.pathname === '/profile' || page.url.pathname.startsWith('/profile/')
	);

	let navListEl = $state<HTMLUListElement | null>(null);
	let indicatorTop = $state(0);
	let indicatorHeight = $state(44);

	$effect(() => {
		if (!navListEl || activeIndex < 0) return;
		const li = navListEl.querySelectorAll<HTMLLIElement>(':scope > li')[activeIndex];
		if (!li) return;
		indicatorTop = li.offsetTop;
		indicatorHeight = li.offsetHeight;
	});
</script>

<div class="app-shell">
	<aside class="sidebar">
		<a href={resolve('/')} class="brand" aria-label="back to root">
			<img class="brand-favicon" src="/images/alt-logo.png" alt="" />
			<span class="brand-tag">stickers</span>
		</a>
		<nav>
			<div class="nav-rail">
				{#if activeIndex >= 0}
					<div
						class="indicator-pill"
						style="top:{indicatorTop}px;height:{indicatorHeight}px;background:{activeColor};"
					></div>
				{/if}
				<ul bind:this={navListEl}>
					{#each links as link (link.href)}
						<li>
							<a
								href={link.href}
								class:active={page.url.pathname === link.href ||
									page.url.pathname.startsWith(link.href + '/')}
							>
								<span class="nav-icon">{@html link.icon}</span>
								<span class="nav-label">{link.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</nav>
		<div class="profile-section">
			{#if data.isAdmin}
				<a class="admin-link" href={resolve('/admin')}>admin →</a>
			{/if}
			<div class="profile-row" class:active={profileActive}>
				<a href={resolve('/profile')} class="profile-info">
					{#if data.user.slack_avatar_url}
						<img class="profile-avatar" src={data.user.slack_avatar_url} alt="avatar" />
					{/if}
					<div class="profile-text">
						<span class="profile-name"
							>{data.user.nickname ?? data.user.first_name ?? 'profile'}</span
						>
						{#if data.user.slack_display_name}
							<span class="profile-slack">@{data.user.slack_display_name}</span>
						{/if}
					</div>
				</a>
				<form method="POST" action="/profile?/logout">
					<button type="submit" class="logout-btn" aria-label="logout">
						<svg
							fill-rule="evenodd"
							clip-rule="evenodd"
							stroke-linejoin="round"
							stroke-miterlimit="1.414"
							xmlns="http://www.w3.org/2000/svg"
							aria-label="door-leave"
							viewBox="0 0 32 32"
							preserveAspectRatio="xMidYMid meet"
							fill="currentColor"
							><path
								d="M27.708,15.293c0.39,0.39 0.39,1.024 0,1.414l-4,4c-0.391,0.391 -1.024,0.391 -1.415,0c-0.39,-0.39 -0.39,-1.024 0,-1.414l2.293,-2.293l-11.586,0c-0.552,0 -1,-0.448 -1,-1c0,-0.552 0.448,-1 1,-1l11.586,0l-2.293,-2.293c-0.39,-0.39 -0.39,-1.024 0,-1.414c0.391,-0.391 1.024,-0.391 1.415,0l4,4Z"
							/><path
								d="M11.999,8c0.001,0 0.001,0 0.002,0c1.699,-0.001 2.859,0.045 3.77,0.25c0.005,0.001 0.01,0.002 0.015,0.003c0.789,0.173 1.103,0.409 1.291,0.638c0,0 0,0.001 0,0.001c0.231,0.282 0.498,0.834 0.679,2.043c0,0.001 0,0.002 0.001,0.003c0.007,0.048 0.014,0.097 0.021,0.147c0.072,0.516 0.501,0.915 1.022,0.915c0.584,0 1.049,-0.501 0.973,-1.08c-0.566,-4.332 -2.405,-4.92 -7.773,-4.92c-7,0 -8,1 -8,10c0,9 1,10 8,10c5.368,0 7.207,-0.588 7.773,-4.92c0.076,-0.579 -0.389,-1.08 -0.973,-1.08c-0.521,0 -0.95,0.399 -1.022,0.915c-0.007,0.05 -0.014,0.099 -0.021,0.147c-0.001,0.001 -0.001,0.002 -0.001,0.003c-0.181,1.209 -0.448,1.762 -0.679,2.044l0,0c-0.188,0.229 -0.502,0.465 -1.291,0.638c-0.005,0.001 -0.01,0.002 -0.015,0.003c-0.911,0.204 -2.071,0.25 -3.77,0.25c-0.001,0 -0.001,0 -0.002,0c-1.699,0 -2.859,-0.046 -3.77,-0.25c-0.005,-0.001 -0.01,-0.002 -0.015,-0.003c-0.789,-0.173 -1.103,-0.409 -1.291,-0.638l0,0c-0.231,-0.282 -0.498,-0.835 -0.679,-2.043c0,-0.001 0,-0.003 -0.001,-0.005c-0.189,-1.247 -0.243,-2.848 -0.243,-5.061c0,0 0,0 0,0c0,-2.213 0.054,-3.814 0.243,-5.061c0.001,-0.002 0.001,-0.004 0.001,-0.005c0.181,-1.208 0.448,-1.76 0.679,-2.042c0,0 0,-0.001 0,-0.001c0.188,-0.229 0.502,-0.465 1.291,-0.638c0.005,-0.001 0.01,-0.002 0.015,-0.003c0.911,-0.205 2.071,-0.251 3.77,-0.25Z"
							/></svg
						>
					</button>
				</form>
			</div>
		</div>
	</aside>
	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	.app-shell {
		--sidebar-w: clamp(223px, 23vw, 323px);
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
		background: #0f0e13;
		padding: clamp(1.5rem, 2.2vw, 2.2rem) clamp(1.2rem, 1.6vw, 1.6rem) 0;
		display: flex;
		flex-direction: column;
		gap: clamp(1.1rem, 1.6vw, 1.6rem);
		overflow-y: auto;
		scrollbar-width: none;
		z-index: 5;
	}

	.sidebar::-webkit-scrollbar {
		display: none;
	}

	.brand {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: clamp(0.9rem, 1.1vw, 1.2rem);
		width: auto;
		margin-left: calc(-1 * (clamp(1.2rem, 1.6vw, 1.6rem) - 1.2rem));
		margin-right: calc(-1 * (clamp(1.2rem, 1.6vw, 1.6rem) - 1.2rem));
		padding-bottom: clamp(1.5rem, 2.2vw, 2.2rem);
		border-bottom: 2px solid #1e1c24;
		text-decoration: none;
		color: inherit;
		transition: opacity 0.12s ease;
	}

	.brand:hover {
		opacity: 0.78;
		text-decoration: none;
	}

	.brand-favicon {
		width: clamp(1.9rem, 2.7vw, 2.8rem);
		height: clamp(1.9rem, 2.7vw, 2.8rem);
		flex-shrink: 0;
		transform: rotate(-8deg);
		transform-origin: center;
	}

	.brand-tag {
		font-size: clamp(1.6rem, 2.4vw, 2.6rem);
		font-weight: bold;
		font-style: italic;
		color: white;
		-webkit-text-stroke: black clamp(0.15rem, 0.24vw, 0.36rem);
		paint-order: stroke fill;
	}

	nav {
		margin-left: calc(-1 * (clamp(1.2rem, 1.6vw, 1.6rem) - 1.2rem));
		margin-right: calc(-1 * (clamp(1.2rem, 1.6vw, 1.6rem) - 1.2rem));
	}

	nav ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	nav a {
		display: flex;
		align-items: center;
		padding: 1.1rem 0.75rem 1.1rem 1.3rem;
		border-radius: 9999px;
		color: white;
		text-decoration: none;
		font-size: clamp(1.25rem, 1.45vw, 1.55rem);
		font-weight: bold;
		font-style: italic;
		background: transparent;
		position: relative;
		isolation: isolate;
		transition:
			color 240ms ease,
			transform 240ms ease,
			background 240ms ease;
	}

	nav a::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 9999px;
		border: 0.18rem solid transparent;
		box-shadow: 0 4px 0 transparent;
		pointer-events: none;
		z-index: -1;
		transition:
			box-shadow 100ms ease,
			border-color 100ms ease;
	}

	nav a:hover {
		text-decoration: none;
	}

	nav a:not(.active):hover {
		background: #131218;
		transform: translateY(-2px);
	}

	nav a:not(.active):hover::before {
		box-shadow: 0 6px 0 black;
		border-color: black;
	}

	nav a:not(.active):active {
		background: #131218;
		transform: translateY(2px);
	}

	nav a:not(.active):active::before {
		box-shadow: 0 2px 0 black;
		border-color: black;
	}

	.nav-icon {
		flex-shrink: 0;
		width: 1.8rem;
		height: 1.8rem;
		margin-right: 1.1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-icon :global(svg) {
		width: 1.8rem;
		height: 1.8rem;
		flex-shrink: 0;
		stroke: none;
	}

	.nav-label {
		white-space: nowrap;
	}

	nav li:nth-child(5) .nav-icon :global(svg) {
		width: 2.2rem;
		height: 2.2rem;
	}

	nav a.active {
		font-weight: bold;
		-webkit-text-stroke: 0;
		background: transparent;
		transform: translateY(2px);
	}

	nav li:nth-child(4n + 1) a:not(.active):hover {
		color: #ed344f;
	}
	nav li:nth-child(4n + 2) a:not(.active):hover {
		color: #f5ee49;
	}
	nav li:nth-child(4n + 3) a:not(.active):hover {
		color: #239640;
	}
	nav li:nth-child(4n) a:not(.active):hover {
		color: #3758c4;
	}
	nav a.active {
		color: #0f0e13;
	}

	.profile-section {
		margin-top: auto;
		margin-left: calc(-1 * (clamp(1.2rem, 1.6vw, 1.6rem) - 1.2rem));
		margin-right: calc(-1 * (clamp(1.2rem, 1.6vw, 1.6rem) - 1.2rem));
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding-bottom: 1.2rem;
	}

	.admin-link {
		padding: 0.4rem 0.5rem;
		font-size: 0.85rem;
		color: #56565d;
		text-decoration: none;
		display: inline-block;
		align-self: flex-start;
	}

	.admin-link:hover {
		color: white;
		text-decoration: none;
	}

	.profile-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		background: #131218;
		border-radius: 9999px;
		padding: 0.8rem 1rem 0.8rem 1.05rem;
		border: 0.18rem solid black;
		box-shadow: 0 4px 0 black;
		transition:
			background 0.15s ease,
			transform 240ms ease,
			box-shadow 100ms ease;
	}

	.profile-row:hover:not(.active) {
		background: #1a1920;
		transform: translateY(-2px);
		box-shadow: 0 6px 0 black;
	}

	.profile-row:active:not(.active),
	.profile-row.active {
		transform: translateY(2px);
		background: #1a1920;
		box-shadow: 0 2px 0 black;
	}


	.profile-row form {
		display: contents;
	}

	.profile-info {
		flex: 1;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.9rem;
		text-decoration: none;
		color: inherit;
		min-width: 0;
	}

	.profile-info:hover {
		text-decoration: none;
	}

	.profile-avatar {
		width: clamp(2.8rem, 3.4vw, 3.5rem);
		height: clamp(2.8rem, 3.4vw, 3.5rem);
		border-radius: 50%;
		flex-shrink: 0;
		object-fit: cover;
		outline: 2px solid black;
	}

	.profile-text {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.profile-name {
		font-size: clamp(1.05rem, 1.35vw, 1.4rem);
		font-weight: bold;
		font-style: italic;
		color: white;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.profile-slack {
		font-size: clamp(0.85rem, 1.05vw, 1.1rem);
		color: #888;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.logout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: clamp(1.9rem, 2.3vw, 2.4rem);
		height: clamp(1.9rem, 2.3vw, 2.4rem);
		padding: 0;
		background: #ed344f;
		border: 0.18rem solid black;
		border-radius: 9999px;
		color: #0c0b10;
		cursor: pointer;
		flex-shrink: 0;
		box-shadow: 0 3px 0 black;
		transition:
			transform 240ms ease,
			box-shadow 100ms ease,
			filter 0.1s ease;
	}

	.logout-btn svg {
		width: 1.4rem;
		height: 1.4rem;
	}

	.logout-btn:hover {
		filter: brightness(1.15);
		transform: translateY(-2px);
		box-shadow: 0 5px 0 black;
	}

	.logout-btn:active {
		transform: translateY(2px);
		box-shadow: 0 1px 0 black;
	}

	.content {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
		position: relative;
	}

	.nav-rail {
		position: relative;
		isolation: isolate;
	}

	.indicator-pill {
		position: absolute;
		z-index: -1;
		pointer-events: none;
		left: 0px;
		right: 0px;
		border-radius: 9999px;
		border: 0.18rem solid black;
		box-shadow: 0 2px 0 black;
		transition:
			top 380ms cubic-bezier(0.5, 1.35, 0.5, 1),
			background 280ms ease;
	}

	@media (max-width: 720px) {
		.app-shell {
			flex-direction: column;
			--sidebar-w: 100%;
		}

		.sidebar {
			width: 100%;
			padding: 1rem 1rem 0;
			gap: 0.8rem;
		}

		nav ul {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 0.3rem;
		}

		nav a {
			padding: 0.6rem 1rem 0.6rem 1.2rem;
			font-size: 1.05rem;
		}

		.profile-section {
			padding-bottom: 0.8rem;
		}
	}
</style>
