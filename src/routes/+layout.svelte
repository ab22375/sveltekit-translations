<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { enhance } from '$app/forms';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<div class="flex items-center">
					<a href="/" class="text-xl font-bold text-gray-900">Lang Study</a>
					{#if data.user}
						<a href="/translations" class="ml-8 text-gray-600 hover:text-gray-900">Translations</a>
					{/if}
				</div>
				<div class="flex items-center">
					{#if data.user}
						<span class="mr-4 text-sm text-gray-600">{data.user.email}</span>
						<form method="POST" action="/auth/logout" use:enhance>
							<button
								type="submit"
								class="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
							>
								Logout
							</button>
						</form>
					{:else}
						<a
							href="/auth/login"
							class="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
						>
							Login
						</a>
					{/if}
				</div>
			</div>
		</div>
	</nav>

	<main>
		{@render children()}
	</main>
</div>
