import { fail, redirect, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');

	const [row] = await db
		.select({
			uid: users.hackatime_user_id,
			onboarded_at: users.onboarded_at,
			terms_agreed_at: users.terms_agreed_at
		})
		.from(users)
		.where(eq(users.id, locals.user.id))
		.limit(1);

	if (!row?.onboarded_at) {
		await db
			.update(users)
			.set({ onboarded_at: new Date(), updated_at: new Date() })
			.where(eq(users.id, locals.user.id));
	}

	return {
		hackatimeLinked: !!row?.uid,
		termsAgreed: !!row?.terms_agreed_at
	};
};

export const actions: Actions = {
	agree: async ({ locals }) => {
		if (!locals.user) return fail(401, { error: 'unauthorized' });

		const [row] = await db
			.select({ terms_agreed_at: users.terms_agreed_at })
			.from(users)
			.where(eq(users.id, locals.user.id))
			.limit(1);

		if (!row?.terms_agreed_at) {
			await db
				.update(users)
				.set({ terms_agreed_at: new Date(), updated_at: new Date() })
				.where(eq(users.id, locals.user.id));
		}

		throw redirect(303, '/home');
	}
};
