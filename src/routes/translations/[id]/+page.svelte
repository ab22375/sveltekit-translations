<script lang="ts">
	import { enhance } from '$app/forms';
	import { marked } from 'marked';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const langNames: Record<string, string> = {
		ja: 'Japanese',
		en: 'English',
		it: 'Italian',
		de: 'German',
		fr: 'French',
		es: 'Spanish',
		zh: 'Chinese',
		ko: 'Korean'
	};

	function getLangName(code: string): string {
		return langNames[code] || code.toUpperCase();
	}

	function renderMarkdown(text: string | null): string {
		if (!text) return '';
		return marked.parse(text, { async: false }) as string;
	}

	let showDeleteConfirm = $state(false);
</script>

<svelte:head>
	<title>View Translation</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6 flex items-center justify-between">
		<a href="/translations" class="text-sm text-gray-500 hover:text-gray-700">← Back to translations</a>
		<div class="flex gap-2">
			<a
				href="/translations/new"
				class="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
			>
				+ New
			</a>
			<a
				href="/translations/{data.translation.id}/edit"
				class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
			>
				Edit
			</a>
			<button
				onclick={() => (showDeleteConfirm = true)}
				class="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
			>
				Delete
			</button>
		</div>
	</div>

	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<div class="flex items-center gap-2 text-sm text-gray-500">
			<span class="rounded bg-gray-100 px-2 py-0.5">{getLangName(data.translation.originalLang)}</span>
			<span>→</span>
			<span class="rounded bg-gray-100 px-2 py-0.5">{getLangName(data.translation.translationLang)}</span>
			<span class="ml-auto text-xs">
				{new Date(data.translation.createdAt).toLocaleDateString()}
			</span>
		</div>

		<div class="mt-6">
			<h2 class="text-sm font-medium text-gray-500">Original</h2>
			<div class="prose prose-gray mt-2">
				{@html renderMarkdown(data.translation.originalText)}
			</div>
		</div>

		{#if data.translation.originalReading}
			<div class="mt-4">
				<h2 class="text-sm font-medium text-gray-500">Reading</h2>
				<div class="prose prose-gray mt-2 text-gray-600">
					{@html renderMarkdown(data.translation.originalReading)}
				</div>
			</div>
		{/if}

		<div class="mt-6 border-t border-gray-200 pt-6">
			<h2 class="text-sm font-medium text-gray-500">Translation</h2>
			<div class="prose prose-gray mt-2">
				{@html renderMarkdown(data.translation.translationText)}
			</div>
		</div>

		{#if data.translation.notes}
			<div class="mt-6 border-t border-gray-200 pt-6">
				<h2 class="text-sm font-medium text-gray-500">Notes</h2>
				<div class="prose prose-gray mt-2 text-gray-600">
					{@html renderMarkdown(data.translation.notes)}
				</div>
			</div>
		{/if}
	</div>
</div>

{#if showDeleteConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="rounded-lg bg-white p-6 shadow-xl">
			<h3 class="text-lg font-medium text-gray-900">Delete Translation?</h3>
			<p class="mt-2 text-sm text-gray-500">This action cannot be undone.</p>
			<div class="mt-4 flex justify-end gap-3">
				<button
					onclick={() => (showDeleteConfirm = false)}
					class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
				>
					Cancel
				</button>
				<form method="POST" action="?/delete" use:enhance>
					<button
						type="submit"
						class="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
					>
						Delete
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
