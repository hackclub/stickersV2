import { fail, type Actions } from '@sveltejs/kit';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders, orderItems, users, ORDER_STATUSES, type OrderStatus } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { decryptAddress, type StoredAddress } from '$lib/server/crypto';
import type { PageServerLoad } from './$types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function addressKey(a: StoredAddress | null): string | null {
	if (!a) return null;
	const parts = [a.line_1, a.line_2, a.city, a.state, a.postal_code, a.country]
		.map((p) => (p ?? '').trim().toLowerCase())
		.filter((p) => p.length > 0);
	return parts.length === 0 ? null : parts.join('|');
}

export const load: PageServerLoad = async () => {
	const rows = await db
		.select({
			id: orders.id,
			status: orders.status,
			kind: orders.kind,
			address_ct: orders.address_ct,
			address_iv: orders.address_iv,
			address_tag: orders.address_tag,
			notes: orders.notes,
			created_at: orders.created_at,
			updated_at: orders.updated_at,
			user_id: users.id,
			user_email: users.email,
			user_first_name: users.first_name,
			user_slack_display_name: users.slack_display_name,
			user_slack_avatar_url: users.slack_avatar_url
		})
		.from(orders)
		.leftJoin(users, eq(orders.user_id, users.id))
		.orderBy(desc(orders.created_at));

	const addressByOrder = new Map<string, StoredAddress | null>();
	for (const r of rows) {
		addressByOrder.set(
			r.id,
			decryptAddress({ ct: r.address_ct, iv: r.address_iv, tag: r.address_tag })
		);
	}

	const addressCounts = new Map<string, number>();
	for (const r of rows) {
		const k = addressKey(addressByOrder.get(r.id) ?? null);
		if (k) addressCounts.set(k, (addressCounts.get(k) ?? 0) + 1);
	}

	const orderIds = rows.map((r) => r.id);
	const items = orderIds.length
		? await db
				.select({
					id: orderItems.id,
					order_id: orderItems.order_id,
					sticker_id: orderItems.sticker_id,
					sticker_name: orderItems.sticker_name,
					sticker_cdn_url: orderItems.sticker_cdn_url,
					count: orderItems.count
				})
				.from(orderItems)
				.where(inArray(orderItems.order_id, orderIds))
		: [];

	const itemsByOrder = new Map<string, typeof items>();
	for (const item of items) {
		const list = itemsByOrder.get(item.order_id) ?? [];
		list.push(item);
		itemsByOrder.set(item.order_id, list);
	}

	const shaped = rows.map((r) => {
		const addr = addressByOrder.get(r.id) ?? null;
		const k = addressKey(addr);
		const duplicate_address = k ? (addressCounts.get(k) ?? 0) > 1 : false;
		return {
		id: r.id,
		status: r.status,
		kind: r.kind,
		created_at: r.created_at,
		updated_at: r.updated_at,
		recipient_name: addr?.recipient_name ?? null,
		line_1: addr?.line_1 ?? null,
		line_2: addr?.line_2 ?? null,
		city: addr?.city ?? null,
		state: addr?.state ?? null,
		postal_code: addr?.postal_code ?? null,
		country: addr?.country ?? null,
		notes: r.notes,
		duplicate_address,
		user: {
			id: r.user_id,
			email: r.user_email,
			first_name: r.user_first_name,
			slack_display_name: r.user_slack_display_name,
			slack_avatar_url: r.user_slack_avatar_url
		},
		items: (itemsByOrder.get(r.id) ?? []).map((i) => ({
			id: i.id,
			sticker_name: i.sticker_name,
			sticker_cdn_url: i.sticker_cdn_url,
			count: i.count,
			sticker_id: i.sticker_id
		}))
		};
	});

	return { orders: shaped };
};

export const actions: Actions = {
	setStatus: async ({ request, locals }) => {
		requireAdmin(locals);

		const f = await request.formData();
		const order_id = String(f.get('order_id') ?? '').trim();
		const status = String(f.get('status') ?? '').trim() as OrderStatus;

		if (!UUID_RE.test(order_id)) return fail(400, { error: 'invalid order id' });
		if (!ORDER_STATUSES.includes(status)) return fail(400, { error: 'invalid status' });

		let notFound = false;
		let refunded = 0;

		await db.transaction(async (tx) => {
			const [existing] = await tx
				.select({
					id: orders.id,
					user_id: orders.user_id,
					status: orders.status,
					tickets_cost: orders.tickets_cost
				})
				.from(orders)
				.where(eq(orders.id, order_id))
				.for('update')
				.limit(1);

			if (!existing) {
				notFound = true;
				return;
			}

			if (existing.status === status) return;

			await tx
				.update(orders)
				.set({ status, updated_at: new Date() })
				.where(eq(orders.id, order_id));

			const becameCancelled = status === 'cancelled' && existing.status !== 'cancelled';
			if (becameCancelled && existing.tickets_cost > 0) {
				await tx
					.update(users)
					.set({
						tickets: sql`${users.tickets} + ${existing.tickets_cost}`,
						updated_at: new Date()
					})
					.where(eq(users.id, existing.user_id));
				refunded = existing.tickets_cost;
			}
		});

		if (notFound) return fail(404, { error: 'order not found' });
		return { ok: true, refunded };
	},

	setNotes: async ({ request, locals }) => {
		requireAdmin(locals);

		const f = await request.formData();
		const order_id = String(f.get('order_id') ?? '').trim();
		const raw = String(f.get('notes') ?? '');
		const notes = raw.trim() === '' ? null : raw;

		if (!UUID_RE.test(order_id)) return fail(400, { error: 'invalid order id' });

		const updated = await db
			.update(orders)
			.set({ notes, updated_at: new Date() })
			.where(eq(orders.id, order_id))
			.returning({ id: orders.id });

		if (updated.length === 0) return fail(404, { error: 'order not found' });
		return { ok: true };
	}
};
