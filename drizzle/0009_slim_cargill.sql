CREATE TABLE "user_stickers" (
	"user_id" uuid NOT NULL,
	"sticker_id" integer NOT NULL,
	"status" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_stickers_user_id_sticker_id_pk" PRIMARY KEY("user_id","sticker_id")
);
--> statement-breakpoint
ALTER TABLE "user_stickers" ADD CONSTRAINT "user_stickers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stickers" ADD CONSTRAINT "user_stickers_sticker_id_stickers_id_fk" FOREIGN KEY ("sticker_id") REFERENCES "public"."stickers"("id") ON DELETE cascade ON UPDATE no action;