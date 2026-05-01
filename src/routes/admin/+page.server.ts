import { db } from '$lib/server/db';
import { users, shopItems, deals } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [u] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
	const [s] = await db.select({ count: sql<number>`count(*)::int` }).from(shopItems);
	const [d] = await db.select({ count: sql<number>`count(*)::int` }).from(deals);
	return {
		counts: {
			users: u?.count ?? 0,
			shopItems: s?.count ?? 0,
			deals: d?.count ?? 0
		}
	};
};
