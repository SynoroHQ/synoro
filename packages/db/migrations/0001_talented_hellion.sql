CREATE TYPE "public"."reminder_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."reminder_recurrence" AS ENUM('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('pending', 'active', 'completed', 'cancelled', 'snoozed');--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('task', 'event', 'deadline', 'meeting', 'call', 'follow_up', 'custom');--> statement-breakpoint
CREATE TABLE "reminder_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reminder_id" uuid NOT NULL,
	"executed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"channel" text,
	"error_message" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "reminder_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"template" jsonb NOT NULL,
	"is_public" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" "reminder_type" DEFAULT 'task' NOT NULL,
	"priority" "reminder_priority" DEFAULT 'medium' NOT NULL,
	"status" "reminder_status" DEFAULT 'pending' NOT NULL,
	"reminder_time" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"recurrence" "reminder_recurrence" DEFAULT 'none',
	"recurrence_pattern" jsonb,
	"recurrence_end_date" timestamp with time zone,
	"ai_generated" boolean DEFAULT false,
	"ai_context" jsonb,
	"smart_suggestions" jsonb,
	"chat_id" uuid,
	"parent_reminder_id" uuid,
	"tags" jsonb,
	"notification_sent" boolean DEFAULT false,
	"snooze_count" integer DEFAULT 0,
	"snooze_until" timestamp with time zone,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "reminder_executions" ADD CONSTRAINT "reminder_executions_reminder_id_reminders_id_fk" FOREIGN KEY ("reminder_id") REFERENCES "public"."reminders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder_templates" ADD CONSTRAINT "reminder_templates_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reminder_executions_reminder_id_idx" ON "reminder_executions" USING btree ("reminder_id");--> statement-breakpoint
CREATE INDEX "reminder_executions_executed_at_idx" ON "reminder_executions" USING btree ("executed_at");--> statement-breakpoint
CREATE INDEX "reminder_executions_status_idx" ON "reminder_executions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reminder_executions_channel_idx" ON "reminder_executions" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "reminder_executions_reminder_status_time_idx" ON "reminder_executions" USING btree ("reminder_id","status","executed_at");--> statement-breakpoint
CREATE INDEX "reminder_templates_user_id_idx" ON "reminder_templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reminder_templates_is_public_idx" ON "reminder_templates" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "reminder_templates_name_idx" ON "reminder_templates" USING btree ("name");--> statement-breakpoint
CREATE INDEX "reminder_templates_public_name_idx" ON "reminder_templates" USING btree ("is_public","name");--> statement-breakpoint
CREATE INDEX "reminders_user_id_idx" ON "reminders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reminders_reminder_time_idx" ON "reminders" USING btree ("reminder_time");--> statement-breakpoint
CREATE INDEX "reminders_status_idx" ON "reminders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reminders_type_idx" ON "reminders" USING btree ("type");--> statement-breakpoint
CREATE INDEX "reminders_user_status_idx" ON "reminders" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "reminders_user_type_idx" ON "reminders" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "reminders_user_priority_idx" ON "reminders" USING btree ("user_id","priority");--> statement-breakpoint
CREATE INDEX "reminders_user_time_idx" ON "reminders" USING btree ("user_id","reminder_time");--> statement-breakpoint
CREATE INDEX "reminders_ai_generated_idx" ON "reminders" USING btree ("ai_generated");--> statement-breakpoint
CREATE INDEX "reminders_parent_reminder_idx" ON "reminders" USING btree ("parent_reminder_id");--> statement-breakpoint
CREATE INDEX "reminders_chat_id_idx" ON "reminders" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "reminders_tags_gin_idx" ON "reminders" USING btree ("tags");--> statement-breakpoint
CREATE INDEX "reminders_metadata_gin_idx" ON "reminders" USING btree ("metadata");