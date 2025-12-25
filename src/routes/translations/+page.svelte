<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let searchInput = $state('');
	let showHelp = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		searchInput = data.search;
	});

	function handleSearch(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const url = new URL($page.url);
			if (value.trim()) {
				url.searchParams.set('q', value.trim());
			} else {
				url.searchParams.delete('q');
			}
			goto(url.toString(), { replaceState: true, keepFocus: true });
		}, 300);
	}

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

	function truncate(text: string, length: number = 100): string {
		if (text.length <= length) return text;
		return text.slice(0, length) + '...';
	}
</script>

<svelte:head>
	<title>Translations</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">Translations</h1>
		<a
			href="/translations/new"
			class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
		>
			New Translation
		</a>
	</div>

	<div class="mt-4">
		<div class="relative">
			<input
				type="search"
				placeholder="Search translations... (? for help)"
				value={searchInput}
				oninput={handleSearch}
				class="w-full rounded-md border border-gray-300 px-4 py-2 pr-10 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			/>
			<button
				type="button"
				onclick={() => showHelp = !showHelp}
				class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
				title="Search help"
			>
				?
			</button>
		</div>
		{#if showHelp}
			<div class="mt-2 rounded-md border border-gray-200 bg-white p-4 text-sm shadow-lg">
				<h3 class="font-medium text-gray-900">Search Syntax</h3>
				<div class="mt-2 space-y-2 text-gray-600">
					<p><code class="bg-gray-100 px-1">AA BB</code> — finds AA OR BB in any field</p>
					<p class="font-medium mt-3">Field prefixes:</p>
					<ul class="ml-4 list-disc">
						<li><code class="bg-gray-100 px-1">o:</code> — original text</li>
						<li><code class="bg-gray-100 px-1">r:</code> — reading</li>
						<li><code class="bg-gray-100 px-1">t:</code> — translation</li>
						<li><code class="bg-gray-100 px-1">n:</code> — notes</li>
						<li><code class="bg-gray-100 px-1">c:</code> — created date</li>
					</ul>
					<p class="font-medium mt-3">Operators:</p>
					<ul class="ml-4 list-disc">
						<li><code class="bg-gray-100 px-1">&</code> — AND</li>
						<li><code class="bg-gray-100 px-1">|</code> — OR</li>
						<li><code class="bg-gray-100 px-1">!</code> — NOT</li>
						<li><code class="bg-gray-100 px-1">( )</code> — grouping</li>
					</ul>
					<p class="font-medium mt-3">Examples:</p>
					<ul class="ml-4 list-disc">
						<li><code class="bg-gray-100 px-1">o:hello|world</code> — original contains "hello" OR "world"</li>
						<li><code class="bg-gray-100 px-1">t:AA&BB</code> — translation contains both "AA" AND "BB"</li>
						<li><code class="bg-gray-100 px-1">t:!error</code> — translation does NOT contain "error"</li>
						<li><code class="bg-gray-100 px-1">o:(!AA&BB)|CC</code> — (NOT AA AND BB) OR CC</li>
					</ul>
				</div>
			</div>
		{/if}
	</div>

	{#if data.translations.length === 0}
		<div class="mt-12 text-center">
			{#if data.search}
				<p class="text-gray-500">No translations found for "{data.search}"</p>
				<button
					onclick={() => { searchInput = ''; goto('/translations'); }}
					class="mt-2 text-blue-600 hover:underline"
				>
					Clear search
				</button>
			{:else}
				<p class="text-gray-500">No translations yet.</p>
				<a href="/translations/new" class="mt-2 inline-block text-blue-600 hover:underline">
					Create your first translation
				</a>
			{/if}
		</div>
	{:else}
		<div class="mt-6 grid gap-4">
			{#each data.translations as translation}
				<a
					href="/translations/{translation.id}"
					class="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
				>
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="flex items-center gap-2 text-sm text-gray-500">
								<span class="rounded bg-gray-100 px-2 py-0.5">{getLangName(translation.originalLang)}</span>
								<span>→</span>
								<span class="rounded bg-gray-100 px-2 py-0.5">{getLangName(translation.translationLang)}</span>
							</div>
							<p class="mt-2 font-medium text-gray-900">{truncate(translation.originalText)}</p>
							{#if translation.originalReading}
								<p class="mt-1 text-sm text-gray-500">{truncate(translation.originalReading, 50)}</p>
							{/if}
							<p class="mt-2 text-gray-600">{truncate(translation.translationText)}</p>
						</div>
						<time class="text-xs text-gray-400">
							{new Date(translation.createdAt).toLocaleDateString()}
						</time>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
