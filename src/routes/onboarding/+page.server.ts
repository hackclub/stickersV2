import { fail, redirect, type Actions } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { stickers, users } from '$lib/server/db/schema';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const rows = await db
		.select({
			id: stickers.id,
			name: stickers.name,
			cdn_url: stickers.cdn_url,
			artist: stickers.artist
		})
		.from(stickers)
		.orderBy(asc(stickers.id))
		.limit(3);

	const ids = rows.map((r) => r.id);
	let counts = new Map<number, number>();
	if (ids.length > 0) {
		const tally = await db
			.select({
				sticker_id: users.voted_sticker_id,
				count: sql<number>`count(*)::int`
			})
			.from(users)
			.where(inArray(users.voted_sticker_id, ids))
			.groupBy(users.voted_sticker_id);
		counts = new Map(tally.map((r) => [r.sticker_id as number, r.count]));
	}

	const candidates = rows.map((r) => ({ ...r, votes: counts.get(r.id) ?? 0 }));

	return {
		stickers: candidates,
		votedStickerId: locals.user?.voted_sticker_id ?? null
	};
};

export const actions: Actions = {
	vote: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/');

		const f = await request.formData();
		const id = Number(f.get('sticker_id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'invalid sticker id' });

		const candidates = await db
			.select({ id: stickers.id })
			.from(stickers)
			.orderBy(asc(stickers.id))
			.limit(3);
		if (!candidates.some((c) => c.id === id)) {
			return fail(400, { error: 'sticker is not a vote candidate' });
		}

		try {
			const updated = await db
				.update(users)
				.set({ voted_sticker_id: id, updated_at: new Date() })
				.where(and(eq(users.id, locals.user.id), sql`${users.voted_sticker_id} IS NULL`))
				.returning({ id: users.id });
			if (updated.length === 0) return fail(409, { error: 'you have already voted' });
		} catch {
			return fail(500, { error: 'failed to save vote' });
		}

		throw redirect(303, '/onboarding/free');
	}
};
