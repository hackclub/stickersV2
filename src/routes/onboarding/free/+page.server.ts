import { fail, redirect } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { loadStoredUser } from '$lib/server/session';
import { fetchAddresses, type HcAddress } from '$lib/server/hcAuth';
import { db } from '$lib/server/db';
import { stickers, orders, orderItems } from '$lib/server/db/schema';
import { encryptAddress } from '$lib/server/crypto';
import { FREE_PACK_COUNT, pickFreePackIds } from '$lib/server/freePack';
import { buildRecipientName } from '$lib/server/orderAddress';

async function pickFreePackForUser(userId: string) {
	const allIds = (await db.select({ id: stickers.id }).from(stickers)).map((r) => r.id);
	const ids = pickFreePackIds(userId, allIds, FREE_PACK_COUNT);
	if (ids.length === 0) return [];
	const rows = await db
		.select({ id: stickers.id, name: stickers.name, cdn_url: stickers.cdn_url })
		.from(stickers)
		.where(inArray(stickers.id, ids));
	const byId = new Map(rows.map((r) => [r.id, r]));
	return ids.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => r != null);
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');

	const [existingFree] = await db
		.select({ id: orders.id })
		.from(orders)
		.where(and(eq(orders.user_id, locals.user.id), eq(orders.kind, 'free')))
		.limit(1);
	if (existingFree) throw redirect(302, '/onboarding/connect');

	const stored = await loadStoredUser(locals.user.id);
	if (!stored) throw redirect(302, '/');

	let address: HcAddress | null = null;
	try {
		const addresses = await fetchAddresses(stored);
		address = addresses[0] ?? null;
	} catch {
		address = null;
	}

	const freeStickers = await pickFreePackForUser(locals.user.id);

	return { address, freeStickers };
};

export const actions: Actions = {
	claim: async ({ locals }) => {
		if (!locals.user) throw redirect(303, '/');

		const [existingFree] = await db
			.select({ id: orders.id })
			.from(orders)
			.where(and(eq(orders.user_id, locals.user.id), eq(orders.kind, 'free')))
			.limit(1);
		if (existingFree) {
			return fail(409, { error: 'free pack already claimed' });
		}

		const stored = await loadStoredUser(locals.user.id);
		if (!stored) throw redirect(303, '/');

		let address: HcAddress | null = null;
		try {
			const addresses = await fetchAddresses(stored);
			address = addresses[0] ?? null;
		} catch {
			address = null;
		}
		if (!address) throw redirect(303, '/onboarding/setup');

		const picks = await pickFreePackForUser(locals.user.id);
		if (picks.length === 0) {
			return fail(500, { error: 'no stickers available' });
		}

		const enc = encryptAddress({
			recipient_name: buildRecipientName(stored, address),
			line_1: address.line_1 ?? null,
			line_2: address.line_2 ?? null,
			city: address.city ?? null,
			state: address.state ?? null,
			postal_code: address.postal_code ?? null,
			country: address.country ?? null
		});

		const result = await db.transaction(async (tx) => {
			const [dup] = await tx
				.select({ id: orders.id })
				.from(orders)
				.where(and(eq(orders.user_id, locals.user!.id), eq(orders.kind, 'free')))
				.limit(1);
			if (dup) return { conflict: true as const };

			const [order] = await tx
				.insert(orders)
				.values({
					user_id: locals.user!.id,
					status: 'received',
					kind: 'free',
					address_ct: enc.ct,
					address_iv: enc.iv,
					address_tag: enc.tag
				})
				.returning({ id: orders.id });

			await tx.insert(orderItems).values(
				picks.map((m) => ({
					order_id: order.id,
					sticker_id: m.id,
					sticker_name: m.name,
					sticker_cdn_url: m.cdn_url,
					count: 1
				}))
			);

			return { conflict: false as const, order_id: order.id };
		});

		if (result.conflict) {
			return fail(409, { error: 'free pack already claimed' });
		}

		return { ok: true, order_id: result.order_id };
	}
};
