import { createSession, getUserByEmail, verifyPassword } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
};

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		const result = loginSchema.safeParse({ email, password });
		if (!result.success) {
			return fail(400, {
				email,
				error: result.error.issues[0].message
			});
		}

		const user = await getUserByEmail(email);
		if (!user) {
			return fail(400, {
				email,
				error: 'Invalid email or password'
			});
		}

		const validPassword = await verifyPassword(user.passwordHash, password);
		if (!validPassword) {
			return fail(400, {
				email,
				error: 'Invalid email or password'
			});
		}

		const session = await createSession(user.id);

		cookies.set('session', session.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			expires: session.expiresAt
		});

		redirect(302, '/');
	}
};
