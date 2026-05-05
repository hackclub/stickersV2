import { fail, redirect, type Actions } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { stickers, users, userStickers } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const allStickers = await db
		.select({
			id: stickers.id,
			name: stickers.name,
			cdn_url: stickers.cdn_url,
			artist: stickers.artist,
			event: stickers.event,
			event_url: stickers.event_url,
			sheet: stickers.sheet,
			shiny: stickers.shiny
		})
		.from(stickers);

	let wishlist: number[] = [];
	let owned: number[] = [];
	if (locals.user) {
		const rows = await db
			.select({ sticker_id: userStickers.sticker_id, status: userStickers.status })
			.from(userStickers)
			.where(eq(userStickers.user_id, locals.user.id));
		for (const r of rows) {
			if (r.status === 'wishlist') wishlist.push(r.sticker_id);
			else if (r.status === 'owned') owned.push(r.sticker_id);
		}
	}

	return {
		stickers: allStickers,
		favoriteId: locals.user?.favorite_sticker_id ?? null,
		wishlist,
		owned
	};
};

function parseStickerId(raw: FormDataEntryValue | null) {
	const id = Number(raw);
	if (!Number.isInteger(id) || id <= 0) return null;
	return id;
}

async function setStatus(userId: string, stickerId: number, status: 'wishlist' | 'owned' | null) {
	const exists = await db
		.select({ id: stickers.id })
		.from(stickers)
		.where(eq(stickers.id, stickerId))
		.limit(1);
	if (exists.length === 0) return fail(404, { error: 'sticker not found' });

	if (status === null) {
		await db
			.delete(userStickers)
			.where(and(eq(userStickers.user_id, userId), eq(userStickers.sticker_id, stickerId)));
		return { ok: true };
	}

	await db
		.insert(userStickers)
		.values({ user_id: userId, sticker_id: stickerId, status, count: 1 })
		.onConflictDoUpdate({
			target: [userStickers.user_id, userStickers.sticker_id],
			set: { status, updated_at: new Date() }
		});
	return { ok: true };
}

export const actions: Actions = {
	setFavorite: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/');

		const form = await request.formData();
		const id = parseStickerId(form.get('sticker_id'));
		if (!id) return fail(400, { error: 'invalid sticker id' });

		const exists = await db
			.select({ id: stickers.id })
			.from(stickers)
			.where(eq(stickers.id, id))
			.limit(1);
		if (exists.length === 0) return fail(404, { error: 'sticker not found' });

		const newFavoriteId = locals.user.favorite_sticker_id === id ? null : id;

		try {
			await db
				.update(users)
				.set({ favorite_sticker_id: newFavoriteId, updated_at: new Date() })
				.where(eq(users.id, locals.user.id));
		} catch {
			return fail(500, { error: 'failed to save favorite' });
		}

		return { saved: true, favoriteId: newFavoriteId };
	},

	wishlist: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/');
		const form = await request.formData();
		const id = parseStickerId(form.get('sticker_id'));
		if (!id) return fail(400, { error: 'invalid sticker id' });
		return await setStatus(locals.user.id, id, 'wishlist');
	},

	owned: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/');
		const form = await request.formData();
		const id = parseStickerId(form.get('sticker_id'));
		if (!id) return fail(400, { error: 'invalid sticker id' });
		return await setStatus(locals.user.id, id, 'owned');
	},

	clear: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/');
		const form = await request.formData();
		const id = parseStickerId(form.get('sticker_id'));
		if (!id) return fail(400, { error: 'invalid sticker id' });
		return await setStatus(locals.user.id, id, null);
	}
};
