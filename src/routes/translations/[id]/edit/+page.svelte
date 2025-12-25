<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const languages = [
		{ code: 'ja', name: 'Japanese' },
		{ code: 'en', name: 'English' },
		{ code: 'it', name: 'Italian' },
		{ code: 'de', name: 'German' },
		{ code: 'fr', name: 'French' },
		{ code: 'es', name: 'Spanish' },
		{ code: 'zh', name: 'Chinese' },
		{ code: 'ko', name: 'Korean' }
	];

	const translation = $derived(data.translation);

	let expandedFields = $state<Record<string, boolean>>({
		originalText: false,
		originalReading: false,
		translationText: false,
		notes: false
	});

	function toggleExpand(field: string) {
		expandedFields[field] = !expandedFields[field];
	}
</script>

<svelte:head>
	<title>Edit Translation</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6">
		<a href="/translations/{translation.id}" class="text-sm text-gray-500 hover:text-gray-700">← Back to translation</a>
	</div>

	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">Edit Translation</h1>
		<button
			type="submit"
			form="translation-form"
			class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
		>
			Save Changes
		</button>
	</div>

	<form id="translation-form" method="POST" use:enhance class="mt-6 space-y-6">
		{#if form?.error}
			<div class="rounded-md bg-red-50 p-3 text-sm text-red-600">
				{form.error}
			</div>
		{/if}

		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<label for="originalLang" class="block text-sm font-medium text-gray-700">Original Language</label>
				<select
					id="originalLang"
					name="originalLang"
					required
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					{#each languages as lang}
						<option value={lang.code} selected={(form?.originalLang ?? translation.originalLang) === lang.code}>
							{lang.name}
						</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="translationLang" class="block text-sm font-medium text-gray-700">Translation Language</label>
				<select
					id="translationLang"
					name="translationLang"
					required
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					{#each languages as lang}
						<option value={lang.code} selected={(form?.translationLang ?? translation.translationLang) === lang.code}>
							{lang.name}
						</option>
					{/each}
				</select>
			</div>
		</div>

		<div>
			<div class="flex items-center justify-between">
				<label for="originalText" class="block text-sm font-medium text-gray-700">Original Text</label>
				<button
					type="button"
					onclick={() => toggleExpand('originalText')}
					class="text-xs text-gray-500 hover:text-gray-700"
				>
					{expandedFields.originalText ? '↑ Shrink' : '↓ Expand'}
				</button>
			</div>
			<textarea
				id="originalText"
				name="originalText"
				required
				rows={expandedFields.originalText ? 10 : 3}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
			>{form?.originalText ?? translation.originalText}</textarea>
			<p class="mt-1 text-xs text-gray-500">Supports markdown</p>
		</div>

		<div>
			<div class="flex items-center justify-between">
				<label for="originalReading" class="block text-sm font-medium text-gray-700">Reading (optional)</label>
				<button
					type="button"
					onclick={() => toggleExpand('originalReading')}
					class="text-xs text-gray-500 hover:text-gray-700"
				>
					{expandedFields.originalReading ? '↑ Shrink' : '↓ Expand'}
				</button>
			</div>
			<textarea
				id="originalReading"
				name="originalReading"
				rows={expandedFields.originalReading ? 8 : 2}
				placeholder="e.g., furigana for Japanese"
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
			>{form?.originalReading ?? translation.originalReading ?? ''}</textarea>
		</div>

		<div>
			<div class="flex items-center justify-between">
				<label for="translationText" class="block text-sm font-medium text-gray-700">Translation</label>
				<button
					type="button"
					onclick={() => toggleExpand('translationText')}
					class="text-xs text-gray-500 hover:text-gray-700"
				>
					{expandedFields.translationText ? '↑ Shrink' : '↓ Expand'}
				</button>
			</div>
			<textarea
				id="translationText"
				name="translationText"
				required
				rows={expandedFields.translationText ? 10 : 3}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
			>{form?.translationText ?? translation.translationText}</textarea>
			<p class="mt-1 text-xs text-gray-500">Supports markdown</p>
		</div>

		<div>
			<div class="flex items-center justify-between">
				<label for="notes" class="block text-sm font-medium text-gray-700">Notes (optional)</label>
				<button
					type="button"
					onclick={() => toggleExpand('notes')}
					class="text-xs text-gray-500 hover:text-gray-700"
				>
					{expandedFields.notes ? '↑ Shrink' : '↓ Expand'}
				</button>
			</div>
			<textarea
				id="notes"
				name="notes"
				rows={expandedFields.notes ? 10 : 3}
				placeholder="Grammar notes, context, examples..."
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
			>{form?.notes ?? translation.notes ?? ''}</textarea>
		</div>

		<div class="flex justify-end gap-3">
			<a
				href="/translations/{translation.id}"
				class="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
			>
				Cancel
			</a>
			<button
				type="submit"
				class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
			>
				Save Changes
			</button>
		</div>
	</form>
</div>
