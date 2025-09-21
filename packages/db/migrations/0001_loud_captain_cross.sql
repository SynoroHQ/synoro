ALTER TABLE "events" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."event_type";--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('purchase', 'maintenance', 'health', 'work', 'personal', 'transport', 'home', 'finance', 'education', 'entertainment', 'travel', 'food', 'other');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "type" SET DATA TYPE "public"."event_type" USING "type"::"public"."event_type";--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "type" SET DEFAULT 'work'::text;--> statement-breakpoint
DROP TYPE "public"."reminder_type";--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('work', 'event', 'deadline', 'meeting', 'call', 'follow_up', 'custom');--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "type" SET DEFAULT 'work'::"public"."reminder_type";--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "type" SET DATA TYPE "public"."reminder_type" USING "type"::"public"."reminder_type";