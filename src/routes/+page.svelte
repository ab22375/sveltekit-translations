<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Lang Study</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
	{#if data.user}
		<div class="text-center">
			<h1 class="text-3xl font-bold text-gray-900">Welcome back!</h1>
			<p class="mt-4 text-gray-600">Manage your translations and language study materials.</p>
			<a
				href="/translations"
				class="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
			>
				View Translations
			</a>
		</div>
	{:else}
		<div class="text-center">
			<h1 class="text-3xl font-bold text-gray-900">Language Study App</h1>
			<p class="mt-4 text-gray-600">
				Manage your translations and Japanese language study materials.
			</p>
			<a
				href="/auth/login"
				class="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
			>
				Login
			</a>
		</div>
	{/if}
</div>
