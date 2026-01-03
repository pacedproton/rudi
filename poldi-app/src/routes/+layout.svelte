<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { animationsEnabled } from '$lib/stores/settings';
	import { get } from 'svelte/store';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Skip animations for exercise pages (full-screen canvas) -->
{#if $animationsEnabled && !$page.url.pathname.includes('/exercises')}
	{#key $page.url.pathname}
		<div 
			class="page-transition"
			in:fly={{ y: 30, duration: 300, delay: 150, easing: cubicOut }}
			out:fade={{ duration: 150 }}
		>
			{@render children()}
		</div>
	{/key}
{:else}
	{@render children()}
{/if}

<style>
	.page-transition {
		width: 100%;
		min-height: 100vh;
	}
</style>

