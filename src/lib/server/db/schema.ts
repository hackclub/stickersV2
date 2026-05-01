import {
	pgTable,
	serial,
	boolean,
	integer,
	text,
	timestamp,
	uuid,
	primaryKey,
	check
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const stickers = pgTable('stickers', {
	id: serial('id').primaryKey(),
	name: text('Sticker Name').notNull(),
	cdn_url: text('CDN_URL').notNull(),
	artist: text('Artist'),
	event: text('Event'),
	event_url: text('event_URL'),
	sheet: boolean('Sheet'),
	shiny: boolean('Shiny')
});

export const users = pgTable(
	'users',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		hca_id: text('hca_id').notNull().unique(),
		email: text('email'),
		first_name: text('first_name'),
		nickname: text('nickname'),
		postal_name: text('postal_name'),
		slack_id: text('slack_id'),
		slack_avatar_url: text('slack_avatar_url'),
		slack_display_name: text('slack_display_name'),
		favorite_sticker_id: integer('favorite_sticker_id').references(() => stickers.id, {
			onDelete: 'set null'
		}),
		voted_sticker_id: integer('voted_sticker_id').references(() => stickers.id, {
			onDelete: 'set null'
		}),
		access_token_ct: text('access_token_ct').notNull(),
		access_token_iv: text('access_token_iv').notNull(),
		access_token_tag: text('access_token_tag').notNull(),
		access_token_hash: text('access_token_hash').notNull(),
		refresh_token_ct: text('refresh_token_ct').notNull(),
		refresh_token_iv: text('refresh_token_iv').notNull(),
		refresh_token_tag: text('refresh_token_tag').notNull(),
		scope: text('scope'),
		expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
		hackatime_user_id: text('hackatime_user_id'),
		hackatime_token_ct: text('hackatime_token_ct'),
		hackatime_token_iv: text('hackatime_token_iv'),
		hackatime_token_tag: text('hackatime_token_tag'),
		onboarded_at: timestamp('onboarded_at', { withTimezone: true }),
		terms_agreed_at: timestamp('terms_agreed_at', { withTimezone: true }),
		tickets: integer('tickets').notNull().default(0),
		created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [check('users_tickets_non_negative', sql`${t.tickets} >= 0`)]
);

export const orders = pgTable(
	'orders',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		user_id: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		status: text('status', {
			enum: ['received', 'packed', 'courier', 'delivered', 'cancelled']
		})
			.notNull()
			.default('received'),
		kind: text('kind', { enum: ['free', 'shop'] }).notNull().default('shop'),
		address_ct: text('address_ct'),
		address_iv: text('address_iv'),
		address_tag: text('address_tag'),
		notes: text('notes'),
		tickets_cost: integer('tickets_cost').notNull().default(0),
		created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [check('orders_tickets_cost_non_negative', sql`${t.tickets_cost} >= 0`)]
);

export const orderItems = pgTable(
	'order_items',
	{
		id: serial('id').primaryKey(),
		order_id: uuid('order_id')
			.notNull()
			.references(() => orders.id, { onDelete: 'cascade' }),
		sticker_id: integer('sticker_id').references(() => stickers.id, { onDelete: 'set null' }),
		sticker_name: text('sticker_name').notNull(),
		sticker_cdn_url: text('sticker_cdn_url').notNull(),
		count: integer('count').notNull().default(1)
	},
	(t) => [check('order_items_count_positive', sql`${t.count} > 0`)]
);

export const shopItems = pgTable(
	'shop_items',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		description: text('description'),
		price: integer('price').notNull(),
		discount: integer('discount'),
		image_url: text('image_url').notNull(),
		sort_order: integer('sort_order').notNull().default(0),
		created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [
		check('shop_items_price_non_negative', sql`${t.price} >= 0`),
		check(
			'shop_items_discount_range',
			sql`${t.discount} IS NULL OR (${t.discount} >= 0 AND ${t.discount} <= 99)`
		)
	]
);

export const deals = pgTable('deals', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	color: text('color').notNull().default('#ed344f'),
	href: text('href').notNull().default('/shop'),
	sort_order: integer('sort_order').notNull().default(0),
	created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const userStickers = pgTable(
	'user_stickers',
	{
		user_id: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		sticker_id: integer('sticker_id')
			.notNull()
			.references(() => stickers.id, { onDelete: 'cascade' }),
		status: text('status', { enum: ['wishlist', 'owned'] }).notNull(),
		count: integer('count').notNull().default(1),
		created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [
		primaryKey({ columns: [t.user_id, t.sticker_id] }),
		check('user_stickers_count_positive', sql`${t.count} > 0`)
	]
);

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	user_id: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
	created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export type StoredUser = typeof users.$inferSelect;

export type PublicUser = {
	id: string;
	hca_id: string;
	email: string | null;
	first_name: string | null;
	nickname: string | null;
	postal_name: string | null;
	slack_id: string | null;
	slack_avatar_url: string | null;
	slack_display_name: string | null;
	favorite_sticker_id: number | null;
	voted_sticker_id: number | null;
	onboarded_at: Date | null;
	tickets: number;
};

export function toPublicUser(u: StoredUser): PublicUser {
	return {
		id: u.id,
		hca_id: u.hca_id,
		email: u.email,
		first_name: u.first_name,
		nickname: u.nickname,
		postal_name: u.postal_name,
		slack_id: u.slack_id,
		slack_avatar_url: u.slack_avatar_url,
		slack_display_name: u.slack_display_name,
		favorite_sticker_id: u.favorite_sticker_id,
		voted_sticker_id: u.voted_sticker_id,
		onboarded_at: u.onboarded_at,
		tickets: u.tickets
	};
}

export type OrderStatus = 'received' | 'packed' | 'courier' | 'delivered' | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
	'received',
	'packed',
	'courier',
	'delivered',
	'cancelled'
];
