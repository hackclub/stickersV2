ALTER TABLE "users" ADD COLUMN "slack_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "slack_avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "slack_display_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "favorite_sticker_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_favorite_sticker_id_stickers_id_fk" FOREIGN KEY ("favorite_sticker_id") REFERENCES "public"."stickers"("id") ON DELETE set null ON UPDATE no action;