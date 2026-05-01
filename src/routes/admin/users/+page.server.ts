import { db } from '$lib/server/db';
import { users, stickers } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db
		.select({
			id: users.id,
			email: users.email,
			first_name: users.first_name,
			nickname: users.nickname,
			postal_name: users.postal_name,
			slack_id: users.slack_id,
			slack_avatar_url: users.slack_avatar_url,
			slack_display_name: users.slack_display_name,
			favorite_sticker_id: users.favorite_sticker_id,
			favorite_sticker_name: stickers.name,
			favorite_sticker_url: stickers.cdn_url,
			created_at: users.created_at,
			updated_at: users.updated_at
		})
		.from(users)
		.leftJoin(stickers, eq(users.favorite_sticker_id, stickers.id))
		.orderBy(desc(users.created_at));

	return { users: rows };
};
