import { validateSession } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session');

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const result = await validateSession(sessionId);

	if (result) {
		event.locals.user = result.user;
		event.locals.session = result.session;

		// Refresh cookie if session was extended
		event.cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			expires: result.session.expiresAt
		});
	} else {
		event.locals.user = null;
		event.locals.session = null;
		event.cookies.delete('session', { path: '/' });
	}

	return resolve(event);
};
