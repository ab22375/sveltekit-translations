import { db } from '$lib/server/db';
import { translations } from '$lib/server/db/schema';
import { buildSearchQuery } from '$lib/server/search';
import { redirect } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	const search = url.searchParams.get('q')?.trim() || '';

	let whereClause = eq(translations.userId, locals.user.id);

	if (search) {
		const searchCondition = buildSearchQuery(search);
		if (searchCondition) {
			whereClause = and(whereClause, searchCondition)!;
		}
	}

	const userTranslations = await db
		.select()
		.from(translations)
		.where(whereClause)
		.orderBy(desc(translations.createdAt));

	return {
		translations: userTranslations,
		search
	};
};
