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
			terms_agreed_at: users.terms_agreed_at
		})
		.from(users)
		.where(eq(users.id, locals.user.id))
		.limit(1);

	return {
		hackatimeLinked: !!row?.uid,
		termsAgreed: !!row?.terms_agreed_at
	};
};

export const actions: Actions = {
	agree: async ({ locals }) => {
		if (!locals.user) return fail(401, { error: 'unauthorized' });

		const [row] = await db
			.select({
				uid: users.hackatime_user_id,
				terms_agreed_at: users.terms_agreed_at
			})
			.from(users)
			.where(eq(users.id, locals.user.id))
			.limit(1);

		if (!row?.uid) return fail(400, { error: 'link hackatime first' });

		const now = new Date();
		await db
			.update(users)
			.set({
				terms_agreed_at: row.terms_agreed_at ?? now,
				onboarded_at: now,
				updated_at: now
			})
			.where(eq(users.id, locals.user.id));

		throw redirect(303, '/home');
	}
};
