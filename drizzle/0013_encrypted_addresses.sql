ALTER TABLE "orders" ADD COLUMN "address_ct" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "address_iv" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "address_tag" text;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "recipient_name";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "line_1";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "line_2";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "postal_code";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "country";
