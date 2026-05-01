import { desc, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users, userStickers } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const ownedCount = sql<number>`coalesce(sum(case when ${userStickers.status} = 'owned' then ${userStickers.count} else 0 end), 0)`;

	const rows = await db
		.select({
			id: users.id,
			first_name: users.first_name,
			nickname: users.nickname,
			slack_display_name: users.slack_display_name,
			slack_avatar_url: users.slack_avatar_url,
			tickets: users.tickets,
			stickers_owned: ownedCount
		})
		.from(users)
		.leftJoin(userStickers, sql`${userStickers.user_id} = ${users.id}`)
		.groupBy(users.id)
		.orderBy(desc(users.tickets), desc(ownedCount))
		.limit(10);

	return { leaderboard: rows };
};
