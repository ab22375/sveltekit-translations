import { db } from '$lib/server/db';
import { translations } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	const [translation] = await db
		.select()
		.from(translations)
		.where(and(eq(translations.id, params.id), eq(translations.userId, locals.user.id)));

	if (!translation) {
		error(404, 'Translation not found');
	}

	return { translation };
};

export const actions: Actions = {
	delete: async ({ locals, params }) => {
		if (!locals.user) {
			redirect(302, '/auth/login');
		}

		await db
			.delete(translations)
			.where(and(eq(translations.id, params.id), eq(translations.userId, locals.user.id)));

		redirect(302, '/translations');
	}
};
