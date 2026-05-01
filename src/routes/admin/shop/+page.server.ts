import { fail, redirect, type Actions } from '@sveltejs/kit';
import { asc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { shopItems } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { cleanUrl } from '$lib/server/sanitize';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const items = await db.select().from(shopItems).orderBy(asc(shopItems.sort_order), asc(shopItems.id));
	return { items };
};

function parsePrice(raw: FormDataEntryValue | null): number | null {
	const n = Number(raw);
	if (!Number.isFinite(n) || n < 0) return null;
	return Math.round(n);
}

function parseDiscount(raw: FormDataEntryValue | null): number | null {
	if (raw === null || raw === '') return null;
	const n = Number(raw);
	if (!Number.isFinite(n) || n < 0 || n > 99) return null;
	return Math.round(n);
}

export const actions: Actions = {
	create: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const name = String(f.get('name') ?? '').trim();
		const description = String(f.get('description') ?? '').trim() || null;
		const price = parsePrice(f.get('price'));
		const discount = parseDiscount(f.get('discount'));
		const image_url = cleanUrl(f.get('image_url'));

		if (!name) return fail(400, { error: 'name is required' });
		if (price === null) return fail(400, { error: 'price must be a non-negative integer' });
		if (!image_url) return fail(400, { error: 'image url must be a valid http(s) url' });

		const [maxRow] = await db
			.select({ max: sql<number>`coalesce(max(${shopItems.sort_order}), 0)::int` })
			.from(shopItems);
		const next = (maxRow?.max ?? 0) + 1;

		await db.insert(shopItems).values({
			name,
			description,
			price,
			discount,
			image_url,
			sort_order: next
		});
		throw redirect(303, '/admin/shop');
	},

	update: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const id = Number(f.get('id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'invalid id' });
		const name = String(f.get('name') ?? '').trim();
		const description = String(f.get('description') ?? '').trim() || null;
		const price = parsePrice(f.get('price'));
		const discount = parseDiscount(f.get('discount'));
		const image_url = cleanUrl(f.get('image_url'));

		if (!name) return fail(400, { error: 'name is required' });
		if (price === null) return fail(400, { error: 'price must be a non-negative integer' });
		if (!image_url) return fail(400, { error: 'image url must be a valid http(s) url' });

		await db
			.update(shopItems)
			.set({ name, description, price, discount, image_url, updated_at: new Date() })
			.where(eq(shopItems.id, id));
		throw redirect(303, '/admin/shop');
	},

	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const id = Number(f.get('id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'invalid id' });
		await db.delete(shopItems).where(eq(shopItems.id, id));
		throw redirect(303, '/admin/shop');
	},

	reorder: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const raw = String(f.get('ids') ?? '');
		const ids = raw
			.split(',')
			.map((s) => Number(s.trim()))
			.filter((n) => Number.isInteger(n) && n > 0);
		if (ids.length === 0) return fail(400, { error: 'invalid order' });

		const existing = await db.select({ id: shopItems.id }).from(shopItems);
		const existingSet = new Set(existing.map((r) => r.id));
		if (ids.length !== existingSet.size || !ids.every((id) => existingSet.has(id))) {
			return fail(400, { error: 'reorder list does not match current items' });
		}

		for (let i = 0; i < ids.length; i++) {
			await db
				.update(shopItems)
				.set({ sort_order: i + 1, updated_at: new Date() })
				.where(eq(shopItems.id, ids[i]));
		}
		throw redirect(303, '/admin/shop');
	}
};
