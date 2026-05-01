import { fail, redirect, type Actions } from '@sveltejs/kit';
import { asc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { deals } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { cleanHref } from '$lib/server/sanitize';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(deals).orderBy(asc(deals.sort_order), asc(deals.id));
	return { deals: rows };
};

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const actions: Actions = {
	create: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const title = String(f.get('title') ?? '').trim();
		const description = String(f.get('description') ?? '').trim() || null;
		const color = String(f.get('color') ?? '').trim() || '#ed344f';
		const hrefRaw = String(f.get('href') ?? '').trim();
		const href = hrefRaw === '' ? '/shop' : cleanHref(hrefRaw);

		if (!title) return fail(400, { error: 'title is required' });
		if (!HEX_RE.test(color)) return fail(400, { error: 'color must be a hex code like #ed344f' });
		if (!href) return fail(400, { error: 'href must be a relative path or http(s) url' });

		const [maxRow] = await db
			.select({ max: sql<number>`coalesce(max(${deals.sort_order}), 0)::int` })
			.from(deals);
		const next = (maxRow?.max ?? 0) + 1;

		await db.insert(deals).values({ title, description, color, href, sort_order: next });
		throw redirect(303, '/admin/deals');
	},

	update: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const id = Number(f.get('id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'invalid id' });
		const title = String(f.get('title') ?? '').trim();
		const description = String(f.get('description') ?? '').trim() || null;
		const color = String(f.get('color') ?? '').trim() || '#ed344f';
		const hrefRaw = String(f.get('href') ?? '').trim();
		const href = hrefRaw === '' ? '/shop' : cleanHref(hrefRaw);

		if (!title) return fail(400, { error: 'title is required' });
		if (!HEX_RE.test(color)) return fail(400, { error: 'color must be a hex code like #ed344f' });
		if (!href) return fail(400, { error: 'href must be a relative path or http(s) url' });

		await db
			.update(deals)
			.set({ title, description, color, href, updated_at: new Date() })
			.where(eq(deals.id, id));
		throw redirect(303, '/admin/deals');
	},

	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const id = Number(f.get('id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'invalid id' });
		await db.delete(deals).where(eq(deals.id, id));
		throw redirect(303, '/admin/deals');
	},

	move: async ({ request, locals }) => {
		requireAdmin(locals);
		const f = await request.formData();
		const id = Number(f.get('id'));
		const direction = String(f.get('direction') ?? '');
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'invalid id' });
		if (direction !== 'up' && direction !== 'down') return fail(400, { error: 'invalid direction' });

		const all = await db.select().from(deals).orderBy(asc(deals.sort_order), asc(deals.id));
		const idx = all.findIndex((r) => r.id === id);
		if (idx === -1) return fail(404, { error: 'not found' });

		const swap = direction === 'up' ? idx - 1 : idx + 1;
		if (swap < 0 || swap >= all.length) throw redirect(303, '/admin/deals');

		const a = all[idx];
		const b = all[swap];
		await db.update(deals).set({ sort_order: b.sort_order }).where(eq(deals.id, a.id));
		await db.update(deals).set({ sort_order: a.sort_order }).where(eq(deals.id, b.id));
		throw redirect(303, '/admin/deals');
	}
};
