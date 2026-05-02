<script lang="ts">
	import { page } from '$app/state';
	import '../page.css';

	let { children, data } = $props();

	const links = [
		{
			href: '/home',
			label: 'home',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M16,5c-0.358,0 -0.736,0.149 -0.997,0.264c-0.297,0.13 -0.676,0.326 -1.077,0.555c-0.789,0.451 -1.798,1.102 -2.878,1.864c-2.149,1.518 -4.715,3.572 -6.755,5.61c-0.391,0.39 -0.391,1.024 0,1.414c0.39,0.391 1.024,0.391 1.414,0c1.96,-1.962 4.394,-3.908 6.495,-5.39c1.045,-0.738 1.974,-1.337 2.716,-1.761c0.365,-0.209 0.649,-0.357 0.887,-0.46c0.091,-0.04 0.154,-0.064 0.195,-0.078c0.041,0.014 0.104,0.038 0.194,0.078c0.239,0.103 0.523,0.251 0.888,0.46c0.742,0.424 1.671,1.023 2.716,1.761c2.101,1.482 4.535,3.428 6.495,5.39c0.39,0.391 1.024,0.391 1.414,0c0.391,-0.39 0.391,-1.024 0,-1.414c-2.04,-2.038 -4.606,-4.092 -6.755,-5.61c-1.08,-0.762 -2.089,-1.413 -2.878,-1.864c-0.401,-0.229 -0.78,-0.425 -1.077,-0.555c-0.262,-0.115 -0.639,-0.264 -0.997,-0.264Zm3.934,19.816c0.184,-0.028 0.358,-0.061 0.524,-0.098l0.014,-0.003c0.923,-0.2 1.291,-0.482 1.522,-0.79c0.292,-0.39 0.589,-1.123 0.774,-2.649l0.001,-0.003c0.165,-1.347 0.218,-3.047 0.229,-5.273c0.002,-0.552 0.45,-1 1.002,-1c0.552,0 1,0.448 0.998,1c-0.052,10.061 -1.005,11 -8.998,11c-7.993,0 -8.946,-0.939 -8.998,-11c-0.002,-0.552 0.446,-1 0.998,-1c0.552,0 1,0.448 1.002,1c0.011,2.226 0.064,3.926 0.229,5.273l0.001,0.003c0.185,1.526 0.482,2.259 0.774,2.649c0.231,0.308 0.599,0.59 1.523,0.79l0.013,0.003c0.166,0.037 0.34,0.07 0.524,0.098c-0.049,-0.788 -0.066,-1.718 -0.066,-2.816c0,-5.133 0.4,-6 4,-6c3.6,0 4,0.867 4,6c0,1.098 -0.017,2.028 -0.066,2.816Zm-2.015,0.16c0.062,-0.782 0.081,-1.74 0.081,-2.976c0,-1.258 -0.02,-2.159 -0.105,-2.87l0,-0.002c-0.081,-0.688 -0.196,-0.921 -0.228,-0.973c-0.001,-0.001 -0.001,-0.002 -0.001,-0.003c-0.002,-0.005 -0.007,-0.009 -0.012,-0.009c-0.019,-0.001 -0.042,-0.003 -0.073,-0.009c-0.004,-0.001 -0.009,-0.002 -0.012,-0.003c-0.338,-0.11 -0.751,-0.133 -1.568,-0.131l-0.002,0c-0.817,-0.002 -1.23,0.021 -1.568,0.131c-0.004,0.001 -0.008,0.002 -0.012,0.003c-0.031,0.006 -0.055,0.008 -0.073,0.009c-0.005,0 -0.01,0.004 -0.012,0.009c0,0.002 0,0.002 -0.001,0.003c-0.032,0.052 -0.147,0.285 -0.228,0.973l0,0.002c-0.085,0.711 -0.105,1.612 -0.105,2.87c0,1.236 0.019,2.194 0.08,2.976c0.569,0.018 1.204,0.024 1.92,0.024l0,0c0.715,0 1.35,-0.006 1.919,-0.024Z"/></svg>`
		},
		{
			href: '/shop',
			label: 'shop',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M16 11.5c-.711 0-1.377.007-2 .024-8.208.213-9 1.935-9 7.976s.792 7.764 9 7.976c.623.017 1.289.024 2 .024 10.083 0 11-1.5 11-8s-.917-8-11-8zm-.018 5.88c1.299-1.28 2.597-.96 3.247-.32 2.597 2.56-2.45 5.94-3.247 5.94-.796 0-5.843-3.38-3.246-5.94.65-.64 1.948-.96 3.246.32z"/><path d="M16 4.5a5 5 0 0 0-5 5v2a1 1 0 1 0 2 0v-2a3 3 0 0 1 6 0v2a1 1 0 1 0 2 0v-2a5 5 0 0 0-5-5z"/></svg>`
		},
		{
			href: '/projects',
			label: 'projects',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M14.293 14.293C14.725 13.861 15 13.007 15 11C15 8.993 14.725 8.139 14.293 7.707C13.861 7.275 13.007 7 11 7C8.993 7 8.139 7.275 7.707 7.707C7.275 8.139 7 8.993 7 11C7 13.007 7.275 13.861 7.707 14.293C8.139 14.725 8.993 15 11 15C13.007 15 13.861 14.725 14.293 14.293ZM24.293 14.293C24.725 13.861 25 13.007 25 11C25 8.993 24.725 8.139 24.293 7.707C23.861 7.275 23.007 7 21 7C18.993 7 18.139 7.275 17.707 7.707C17.275 8.139 17 8.993 17 11C17 13.007 17.275 13.861 17.707 14.293C18.139 14.725 18.993 15 21 15C23.007 15 23.861 14.725 24.293 14.293ZM15 21C15 23.007 14.725 23.861 14.293 24.293C13.861 24.725 13.007 25 11 25C8.993 25 8.139 24.725 7.707 24.293C7.275 23.861 7 23.007 7 21C7 18.993 7.275 18.139 7.707 17.707C8.139 17.275 8.993 17 11 17C13.007 17 13.861 17.275 14.293 17.707C14.725 18.139 15 18.993 15 21ZM24.293 24.293C24.725 23.861 25 23.007 25 21C25 18.993 24.725 18.139 24.293 17.707C23.861 17.275 23.007 17 21 17C18.993 17 18.139 17.275 17.707 17.707C17.275 18.139 17 18.993 17 21C17 23.007 17.275 23.861 17.707 24.293C18.139 24.725 18.993 25 21 25C23.007 25 23.861 24.725 24.293 24.293Z"/></svg>`
		},
		{
			href: '/library',
			label: 'catalog',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M26 16c0-11-.833-12-10-12S6 5 6 16s.833 12 10 12 10-1 10-12zm-15.5-6a1 1 0 0 0 0 2h11a1 1 0 0 0 0-2h-11zm-1 6a1 1 0 0 1 1-1h11a1 1 0 0 1 0 2h-11a1 1 0 0 1-1-1zm1 4a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-8z"/></svg>`
		},
		{
			href: '/voting',
			label: 'voting',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor"><g transform="translate(7.21309 7.32291)"><path d="M5.78691 5.67708C4.72724 5.67708 4.00271 5.84685 3.45685 6.02702C0.249474 7.08571 -0.496537 7.89903 0.286926 12.5998C1.07001 17.2984 2.5186 18.0308 6.78691 17.1771C9.28691 16.6771 12.7869 16.5998 12.7869 12.5998C12.7869 10.9564 12.703 9.11985 12.4029 8.0998C11.7731 5.95897 6.90882 4.14298 8.28691 1.59981C8.78691 0.677094 7.78691 -0.322918 6.78691 0.0998077C5.78691 0.522533 5.03691 1.69109 5.03691 3.09981C5.03691 4.20943 5.28691 4.67708 5.78691 5.67708Z"/><path d="M16.2869 16.0998C17.6619 16.0998 18.7869 15.6831 18.7869 11.0998C18.7869 6.51647 17.6619 6.09981 16.2869 6.09981C14.9119 6.09981 13.7869 6.51647 13.7869 11.0998C13.7869 15.6831 14.9119 16.0998 16.2869 16.0998Z"/></g></svg>`
		},
		{
			href: '/leaderboard',
			label: 'leaderboard',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M7.11488 9.1449L7.11491 9.13688C7.11293 8.89341 7.20226 8.67307 7.34872 8.50223C7.36738 8.47999 7.38708 8.45848 7.40777 8.43779C7.59531 8.25025 7.84966 8.1449 8.11488 8.1449H23.6149C23.638 8.1449 23.6611 8.1457 23.684 8.14729C24.2675 8.10705 24.7928 8.58025 24.7603 9.1819C23.9523 23.8959 23.4893 23.8929 17.0793 23.8509L17 23.8504V26.8551H20.8649C21.4169 26.8551 21.8649 27.3031 21.8649 27.8551C21.8649 28.4071 21.4169 28.8551 20.8649 28.8551H10.8649C10.3129 28.8551 9.86493 28.4071 9.86493 27.8551C9.86493 27.3031 10.3129 26.8551 10.8649 26.8551H15V23.8497L14.7973 23.8509C8.39609 23.8928 7.92559 23.8959 7.11963 9.2423C7.11647 9.21007 7.11488 9.17756 7.11488 9.1449ZM7.76177 22H7.23822C6.42822 22 5.71322 21.814 5.11722 21.424C4.58122 21.058 4.11122 20.461 3.84622 19.899C3.32522 18.76 3.23822 17.313 3.23822 16C3.23822 14.687 3.32522 13.24 3.84622 12.101C4.11122 11.539 4.58122 10.943 5.11722 10.576C5.44608 10.3608 5.81118 10.2077 6.20848 10.1137C6.24937 10.8388 6.28977 11.5274 6.33054 12.1813C6.28742 12.2031 6.24779 12.2262 6.21122 12.25C5.93922 12.411 5.82322 12.574 5.66522 12.934C5.34122 13.64 5.23822 14.694 5.23822 16C5.23822 17.306 5.34122 18.36 5.66522 19.066C5.82322 19.426 5.93922 19.589 6.21122 19.75C6.41169 19.8805 6.70426 19.9877 7.15826 19.999C7.32113 20.7689 7.51689 21.433 7.76177 22ZM24.2382 22H24.7618C25.5718 22 26.2868 21.814 26.8828 21.424C27.4188 21.058 27.8888 20.461 28.1538 19.899C28.6748 18.76 28.7618 17.313 28.7618 16C28.7618 14.687 28.6748 13.24 28.1538 12.101C27.8888 11.539 27.4188 10.943 26.8828 10.576C26.5539 10.3608 26.1888 10.2077 25.7915 10.1137C25.7506 10.8388 25.7102 11.5274 25.6694 12.1813C25.7126 12.2032 25.7522 12.2262 25.7888 12.25C26.0608 12.411 26.1768 12.574 26.3348 12.934C26.6588 13.64 26.7618 14.694 26.7618 16C26.7618 17.306 26.6588 18.36 26.3348 19.066C26.1768 19.426 26.0608 19.589 25.7888 19.75C25.5883 19.8805 25.2957 19.9877 24.8417 19.999C24.6788 20.7689 24.4831 21.433 24.2382 22Z"/></svg>`
		},
		{
			href: '/orders',
			label: 'orders',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M16,26c11,0 12,-0.833 12,-10c0,-9.167 -1,-10 -12,-10c-11,0 -12,0.833 -12,10c0,9.167 1,10 12,10Zm-8.651,-14.774c0.411,-0.344 1.023,-0.289 1.366,0.124c1.335,1.601 5.617,5.318 7.285,6.592c1.696,-1.296 5.931,-4.963 7.285,-6.592c0.343,-0.413 0.955,-0.468 1.366,-0.124c0.412,0.344 0.467,0.957 0.124,1.37c-0.695,0.838 -2.02,2.129 -3.429,3.404c1.409,1.275 2.734,2.566 3.429,3.404c0.343,0.412 0.288,1.026 -0.124,1.37c-0.411,0.344 -1.023,0.289 -1.366,-0.124c-0.662,-0.798 -2.015,-2.083 -3.422,-3.339c-1.102,0.95 -2.137,1.789 -2.841,2.291c-0.302,0.213 -0.644,0.398 -1.022,0.398c-0.378,0 -0.72,-0.185 -1.021,-0.398c-0.691,-0.492 -1.728,-1.335 -2.835,-2.292c-1.414,1.264 -2.775,2.556 -3.429,3.34c-0.343,0.413 -0.955,0.468 -1.366,0.124c-0.411,-0.344 -0.467,-0.957 -0.124,-1.37l0.001,-0.001c0.683,-0.822 2.018,-2.119 3.436,-3.403c-1.418,-1.284 -2.753,-2.582 -3.436,-3.403l-0.001,-0.001c-0.343,-0.413 -0.287,-1.026 0.124,-1.37Z"/></svg>`
		},
		{
			href: '/artist',
			label: 'artist',
			icon: `<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M23.6092 6.13958C23.4536 5.82987 23.3348 5.45086 23.2301 4.97851C23.2273 4.96719 23.2248 4.95587 23.2224 4.94455C23.2199 4.93324 23.2174 4.92194 23.2146 4.91063C23.2082 4.88023 23.2019 4.84982 23.1955 4.818C23.1163 4.43475 22.5273 4.43404 22.4495 4.81588C22.4382 4.87103 22.4269 4.92477 22.4156 4.9771C22.3116 5.4544 22.1928 5.83765 22.0365 6.14948C21.9538 6.31565 21.8591 6.46132 21.7502 6.59142C21.6802 6.67557 21.6038 6.75194 21.5204 6.82265C21.3917 6.93296 21.2467 7.02842 21.0812 7.11327C20.7708 7.27237 20.3897 7.3947 19.9124 7.5043C19.8728 7.51393 19.8324 7.52276 19.7915 7.53169C19.7783 7.53456 19.7651 7.53744 19.7519 7.54036C19.37 7.62238 19.3785 8.2107 19.7625 8.28636C19.7763 8.28904 19.79 8.29169 19.8037 8.29431C19.8441 8.30207 19.8839 8.30973 19.923 8.31818C20.3911 8.41717 20.7673 8.53031 21.0742 8.68022C21.2396 8.76083 21.3846 8.85204 21.5133 8.9567C21.6087 9.03518 21.6943 9.12074 21.7735 9.2155C21.8796 9.34278 21.9715 9.48703 22.0535 9.65108C22.207 9.95725 22.3236 10.3327 22.4276 10.7987C22.4343 10.8283 22.4406 10.858 22.4469 10.8879C22.4519 10.9115 22.4569 10.9352 22.4622 10.9592C22.5414 11.3425 23.1297 11.3439 23.2082 10.9613C23.2188 10.9069 23.2301 10.8532 23.2415 10.8008C23.3447 10.3285 23.4621 9.94947 23.6162 9.64117C23.6982 9.47571 23.7916 9.33146 23.8984 9.20348C23.9726 9.11367 24.0539 9.03236 24.143 8.95882C24.271 8.85204 24.4153 8.75871 24.5807 8.67668C24.889 8.52253 25.268 8.40515 25.7404 8.30191C25.7927 8.2906 25.8464 8.27929 25.9016 8.26797C26.2834 8.19019 26.2827 7.60117 25.8995 7.52198C25.8451 7.51138 25.7921 7.49937 25.7391 7.48736L25.739 7.48733C25.2666 7.38268 24.8883 7.26459 24.5793 7.10973C24.4131 7.02559 24.2675 6.93225 24.1388 6.82477C24.049 6.75052 23.9669 6.6685 23.8927 6.5787C23.7852 6.45 23.6912 6.30505 23.6092 6.13958ZM24.9529 21.2251C25.8563 21.0399 26.6747 21.9485 26.1197 22.6849C23.9298 25.591 20.4494 27.4697 16.5303 27.4697C9.90286 27.4697 4.53027 22.0972 4.53027 15.4697C4.53027 11.5506 6.40906 8.07026 9.3151 5.88028C10.0515 5.32532 10.9601 6.14376 10.7749 7.04709C10.6145 7.82957 10.5303 8.63981 10.5303 9.46974C10.5303 16.0972 15.9029 21.4697 22.5303 21.4697C23.3602 21.4697 24.1704 21.3855 24.9529 21.2251Z"/></svg>`
		}
	];
</script>

<div class="app-shell">
	<aside class="sidebar">
		<a href="/" class="brand" aria-label="back to root">
			<img class="brand-favicon" src="/favicon.ico" alt="" />
			<span class="brand-tag">stickers</span>
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
							<span class="nav-icon">{@html link.icon}</span>
							<span class="nav-label">{link.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<div class="profile-section">
			{#if data.isAdmin}
				<a class="admin-link" href="/admin">admin →</a>
			{/if}
			<div class="profile-row">
				<a href="/profile" class="profile-info">
					{#if data.user.slack_avatar_url}
						<img class="profile-avatar" src={data.user.slack_avatar_url} alt="avatar" />
					{/if}
					<div class="profile-text">
						<span class="profile-name">{data.user.nickname ?? data.user.first_name ?? 'profile'}</span>
						{#if data.user.slack_display_name}
							<span class="profile-slack">@{data.user.slack_display_name}</span>
						{/if}
					</div>
				</a>
				<form method="POST" action="/profile?/logout">
					<button type="submit" class="logout-btn" aria-label="logout">
						<svg fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414" xmlns="http://www.w3.org/2000/svg" aria-label="door-leave" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M27.708,15.293c0.39,0.39 0.39,1.024 0,1.414l-4,4c-0.391,0.391 -1.024,0.391 -1.415,0c-0.39,-0.39 -0.39,-1.024 0,-1.414l2.293,-2.293l-11.586,0c-0.552,0 -1,-0.448 -1,-1c0,-0.552 0.448,-1 1,-1l11.586,0l-2.293,-2.293c-0.39,-0.39 -0.39,-1.024 0,-1.414c0.391,-0.391 1.024,-0.391 1.415,0l4,4Z"/><path d="M11.999,8c0.001,0 0.001,0 0.002,0c1.699,-0.001 2.859,0.045 3.77,0.25c0.005,0.001 0.01,0.002 0.015,0.003c0.789,0.173 1.103,0.409 1.291,0.638c0,0 0,0.001 0,0.001c0.231,0.282 0.498,0.834 0.679,2.043c0,0.001 0,0.002 0.001,0.003c0.007,0.048 0.014,0.097 0.021,0.147c0.072,0.516 0.501,0.915 1.022,0.915c0.584,0 1.049,-0.501 0.973,-1.08c-0.566,-4.332 -2.405,-4.92 -7.773,-4.92c-7,0 -8,1 -8,10c0,9 1,10 8,10c5.368,0 7.207,-0.588 7.773,-4.92c0.076,-0.579 -0.389,-1.08 -0.973,-1.08c-0.521,0 -0.95,0.399 -1.022,0.915c-0.007,0.05 -0.014,0.099 -0.021,0.147c-0.001,0.001 -0.001,0.002 -0.001,0.003c-0.181,1.209 -0.448,1.762 -0.679,2.044l0,0c-0.188,0.229 -0.502,0.465 -1.291,0.638c-0.005,0.001 -0.01,0.002 -0.015,0.003c-0.911,0.204 -2.071,0.25 -3.77,0.25c-0.001,0 -0.001,0 -0.002,0c-1.699,0 -2.859,-0.046 -3.77,-0.25c-0.005,-0.001 -0.01,-0.002 -0.015,-0.003c-0.789,-0.173 -1.103,-0.409 -1.291,-0.638l0,0c-0.231,-0.282 -0.498,-0.835 -0.679,-2.043c0,-0.001 0,-0.003 -0.001,-0.005c-0.189,-1.247 -0.243,-2.848 -0.243,-5.061c0,0 0,0 0,0c0,-2.213 0.054,-3.814 0.243,-5.061c0.001,-0.002 0.001,-0.004 0.001,-0.005c0.181,-1.208 0.448,-1.76 0.679,-2.042c0,0 0,-0.001 0,-0.001c0.188,-0.229 0.502,-0.465 1.291,-0.638c0.005,-0.001 0.01,-0.002 0.015,-0.003c0.911,-0.205 2.071,-0.251 3.77,-0.25Z"/></svg>
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
		background: #0c0b10;
		padding: clamp(1.5rem, 2.2vw, 2.2rem) clamp(1.2rem, 1.6vw, 1.6rem) 0;
		display: flex;
		flex-direction: column;
		gap: clamp(1.2rem, 1.8vw, 1.8rem);
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
		gap: clamp(0.7rem, 1vw, 1.1rem);
		width: auto;
		margin-left: calc(-1 * (clamp(1.2rem, 1.6vw, 1.6rem) - 1.2rem));
		margin-right: calc(-1 * (clamp(1.2rem, 1.6vw, 1.6rem) - 1.2rem));
		padding-bottom: clamp(0.8rem, 1.2vw, 1.2rem);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		text-decoration: none;
		color: inherit;
		transition: opacity 0.12s ease;
	}

	.brand:hover {
		opacity: 0.78;
		text-decoration: none;
	}

	.brand-favicon {
		width: clamp(2.6rem, 3.6vw, 3.8rem);
		height: clamp(2.6rem, 3.6vw, 3.8rem);
		flex-shrink: 0;
		transform: rotate(-8deg);
		transform-origin: center;
	}

	.brand-tag {
		font-size: clamp(2.1rem, 3.2vw, 3.5rem);
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
		gap: 0.6rem;
	}

	nav a {
		display: flex;
		align-items: center;
		overflow: hidden;
		padding: 0.9rem 0.75rem 0.9rem 1.35rem;
		border-radius: 0.9rem;
		color: white;
		text-decoration: none;
		font-size: clamp(1.3rem, 1.8vw, 1.9rem);
		font-weight: bold;
		font-style: italic;
		background: transparent;
		-webkit-text-stroke: black 0.18rem;
		paint-order: stroke fill;
		transition:
			background 0.3s ease,
			color 0.2s ease,
			-webkit-text-stroke 0.2s ease;
	}

	nav a:hover {
		text-decoration: none;
	}

	nav a:active {
		filter: brightness(0.85);
	}

	.nav-icon {
		flex-shrink: 0;
		width: 1.8rem;
		height: 1.8rem;
		margin-left: calc(-1.8rem - 0.72rem);
		margin-right: 0.72rem;
		opacity: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			margin-left 0.2s ease,
			opacity 0.15s ease,
			color 0.2s ease;
	}

	nav li:nth-child(4n + 1) .nav-icon { color: #ed344f; }
	nav li:nth-child(4n + 2) .nav-icon { color: #fff959; }
	nav li:nth-child(4n + 3) .nav-icon { color: #239640; }
	nav li:nth-child(4n)     .nav-icon { color: #3758c4; }

	nav a.active .nav-icon {
		color: #0c0b10;
	}

	.nav-icon :global(svg) {
		width: 1.8rem;
		height: 1.8rem;
		flex-shrink: 0;
		stroke: none;
	}

	nav a:hover .nav-icon,
	nav a.active .nav-icon {
		margin-left: 0;
		opacity: 1;
	}

	.nav-label {
		white-space: nowrap;
	}

	nav li:nth-child(5) .nav-icon :global(svg) {
		width: 2.4rem;
		height: 2.4rem;
	}

	nav a.active {
		font-weight: bold;
		color: #0c0b10;
		-webkit-text-stroke: 0;
	}

	nav li:nth-child(4n + 1) a:not(.active):hover { background: rgba(237, 52, 79, 0.18); }
	nav li:nth-child(4n + 2) a:not(.active):hover { background: rgba(255, 249, 89, 0.12); }
	nav li:nth-child(4n + 3) a:not(.active):hover { background: rgba(35, 150, 64, 0.18); }
	nav li:nth-child(4n)     a:not(.active):hover { background: rgba(55, 88, 196, 0.22); }

	nav li:nth-child(4n + 1) a.active { background: #ed344f; }
	nav li:nth-child(4n + 2) a.active { background: #fff959; }
	nav li:nth-child(4n + 3) a.active { background: #239640; }
	nav li:nth-child(4n)     a.active { background: #3758c4; }

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
		background: #1b1a21;
		border-radius: 0.9rem;
		padding: 0.8rem 1rem 0.8rem 1.05rem;
		transition: background 0.15s ease;
	}

	.profile-row:has(.profile-info:hover) {
		background: #25242c;
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
		border: none;
		border-radius: 0.5rem;
		color: #0c0b10;
		cursor: pointer;
		flex-shrink: 0;
		transition: filter 0.1s ease;
	}

	.logout-btn svg {
		width: 1.4rem;
		height: 1.4rem;
	}

	.logout-btn:hover {
		filter: brightness(1.15);
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
