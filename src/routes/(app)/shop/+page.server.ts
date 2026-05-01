import { db } from '$lib/server/db';
import { shopItems } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const items = await db
		.select()
		.from(shopItems)
		.orderBy(asc(shopItems.sort_order), asc(shopItems.id));
	return { items };
};
