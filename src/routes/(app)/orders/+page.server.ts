import { fail, redirect, type Actions } from '@sveltejs/kit';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { stickers, userStickers, orders, orderItems } from '$lib/server/db/schema';
import { decryptAddress } from '$lib/server/crypto';
import { loadStoredUser } from '$lib/server/session';
import { refreshStage1OrderAddresses } from '$lib/server/orderAddress';
import type { PageServerLoad } from './$types';

type OrderItem = { sticker_name: string; sticker_cdn_url: string; count: number };
type OrderShape = {
	id: string;
	status: 'received' | 'packed' | 'courier' | 'delivered' | 'cancelled';
	kind: 'free' | 'shop';
	created_at: Date;
	recipient_name: string | null;
	line_1: string | null;
	line_2: string | null;
	city: string | null;
	state: string | null;
	postal_code: string | null;
	country: string | null;
	items: OrderItem[];
};

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

	let wishlist: typeof allStickers = [];
	let owned: { sticker: (typeof allStickers)[number]; count: number }[] = [];
	let activeOrders: OrderShape[] = [];
	let pastOrders: OrderShape[] = [];

	if (locals.user) {
		const stored = await loadStoredUser(locals.user.id);
		if (stored) await refreshStage1OrderAddresses(stored);

		const rows = await db
			.select({
				sticker_id: userStickers.sticker_id,
				status: userStickers.status,
				count: userStickers.count
			})
			.from(userStickers)
			.where(eq(userStickers.user_id, locals.user.id));

		const byId = new Map(allStickers.map((s) => [s.id, s]));
		for (const r of rows) {
			const s = byId.get(r.sticker_id);
			if (!s) continue;
			if (r.status === 'wishlist') wishlist.push(s);
			else if (r.status === 'owned') owned.push({ sticker: s, count: r.count });
		}

		const userOrders = await db
			.select({
				id: orders.id,
				status: orders.status,
				kind: orders.kind,
				created_at: orders.created_at,
				address_ct: orders.address_ct,
				address_iv: orders.address_iv,
				address_tag: orders.address_tag
			})
			.from(orders)
			.where(eq(orders.user_id, locals.user.id))
			.orderBy(desc(orders.created_at));

		const orderIds = userOrders.map((o) => o.id);
		const items = orderIds.length
			? await db
					.select({
						order_id: orderItems.order_id,
						sticker_name: orderItems.sticker_name,
						sticker_cdn_url: orderItems.sticker_cdn_url,
						count: orderItems.count
					})
					.from(orderItems)
					.where(inArray(orderItems.order_id, orderIds))
			: [];

		const itemsByOrder = new Map<string, OrderItem[]>();
		for (const it of items) {
			const list = itemsByOrder.get(it.order_id) ?? [];
			list.push({
				sticker_name: it.sticker_name,
				sticker_cdn_url: it.sticker_cdn_url,
				count: it.count
			});
			itemsByOrder.set(it.order_id, list);
		}

		for (const o of userOrders) {
			const addr = decryptAddress({ ct: o.address_ct, iv: o.address_iv, tag: o.address_tag });
			const shape: OrderShape = {
				id: o.id,
				status: o.status,
				kind: o.kind,
				created_at: o.created_at,
				recipient_name: addr?.recipient_name ?? null,
				line_1: addr?.line_1 ?? null,
				line_2: addr?.line_2 ?? null,
				city: addr?.city ?? null,
				state: addr?.state ?? null,
				postal_code: addr?.postal_code ?? null,
				country: addr?.country ?? null,
				items: itemsByOrder.get(o.id) ?? []
			};
			if (o.status === 'delivered' || o.status === 'cancelled') pastOrders.push(shape);
			else activeOrders.push(shape);
		}
	}

	return { stickers: allStickers, wishlist, owned, activeOrders, pastOrders };
};

export const actions: Actions = {
	removeWishlist: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/');
		const form = await request.formData();
		const id = Number(form.get('sticker_id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'invalid sticker id' });

		await db
			.delete(userStickers)
			.where(and(eq(userStickers.user_id, locals.user.id), eq(userStickers.sticker_id, id)));

		return { ok: true };
	}
};
