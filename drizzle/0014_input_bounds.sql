ALTER TABLE "users" ADD CONSTRAINT "users_tickets_non_negative" CHECK ("tickets" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_tickets_cost_non_negative" CHECK ("tickets_cost" >= 0);--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_count_positive" CHECK ("count" > 0);--> statement-breakpoint
ALTER TABLE "user_stickers" ADD CONSTRAINT "user_stickers_count_positive" CHECK ("count" > 0);--> statement-breakpoint
ALTER TABLE "shop_items" ADD CONSTRAINT "shop_items_price_non_negative" CHECK ("price" >= 0);--> statement-breakpoint
ALTER TABLE "shop_items" ADD CONSTRAINT "shop_items_discount_range" CHECK ("discount" IS NULL OR ("discount" >= 0 AND "discount" <= 99));
