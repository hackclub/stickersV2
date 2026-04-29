<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Home - Stickers</title>
</svelte:head>

<h1>welcome{data.user.email ? `, ${data.user.email}` : ''}!</h1>
