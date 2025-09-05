ALTER TABLE "users" ADD COLUMN "username" text;--> statement-breakpoint
CREATE INDEX "user_username_idx" ON "users" USING btree ("username");