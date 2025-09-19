ALTER TABLE "events" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."event_type";--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('purchase', 'maintenance', 'health', 'work', 'personal', 'transport', 'home', 'finance', 'education', 'entertainment', 'travel', 'food', 'other');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "type" SET DATA TYPE "public"."event_type" USING "type"::"public"."event_type";