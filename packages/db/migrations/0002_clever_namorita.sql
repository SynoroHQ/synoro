ALTER TABLE "households" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "household_deleted_at_idx" ON "households" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "event_deleted_at_idx" ON "events" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "conversation_deleted_at_idx" ON "conversations" USING btree ("deleted_at");