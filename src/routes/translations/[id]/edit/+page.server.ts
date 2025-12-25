import { db } from '$lib/server/db';
import { translations } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
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

const translationSchema = z.object({
	originalLang: z.string().min(1, 'Original language is required'),
	originalText: z.string().min(1, 'Original text is required'),
	originalReading: z.string().optional(),
	translationLang: z.string().min(1, 'Translation language is required'),
	translationText: z.string().min(1, 'Translation text is required'),
	notes: z.string().optional()
});

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.user) {
			redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const data = {
			originalLang: formData.get('originalLang')?.toString() ?? '',
			originalText: formData.get('originalText')?.toString() ?? '',
			originalReading: formData.get('originalReading')?.toString() || undefined,
			translationLang: formData.get('translationLang')?.toString() ?? '',
			translationText: formData.get('translationText')?.toString() ?? '',
			notes: formData.get('notes')?.toString() || undefined
		};

		const result = translationSchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				...data,
				error: result.error.issues[0].message
			});
		}

		await db
			.update(translations)
			.set({
				originalLang: result.data.originalLang,
				originalText: result.data.originalText,
				originalReading: result.data.originalReading ?? null,
				translationLang: result.data.translationLang,
				translationText: result.data.translationText,
				notes: result.data.notes ?? null,
				updatedAt: new Date()
			})
			.where(and(eq(translations.id, params.id), eq(translations.userId, locals.user.id)));

		redirect(302, `/translations/${params.id}`);
	}
};
