import { createSession, createUser, getUserByEmail } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
};

const registerSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters')
});

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		const result = registerSchema.safeParse({ email, password });
		if (!result.success) {
			return fail(400, {
				email,
				error: result.error.issues[0].message
			});
		}

		const existingUser = await getUserByEmail(email);
		if (existingUser) {
			return fail(400, {
				email,
				error: 'Email already registered'
			});
		}

		try {
			const user = await createUser(email, password);
			const session = await createSession(user.id);

			cookies.set('session', session.id, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				expires: session.expiresAt
			});
		} catch {
			return fail(500, {
				email,
				error: 'Failed to create account'
			});
		}

		redirect(302, '/');
	}
};
