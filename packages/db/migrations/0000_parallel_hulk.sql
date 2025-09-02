CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'moderator');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended', 'pending');--> statement-breakpoint
CREATE TYPE "public"."verification_type" AS ENUM('email', 'phone', 'password_reset', 'otp');--> statement-breakpoint
CREATE TYPE "public"."household_status" AS ENUM('active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'member', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('active', 'invited', 'suspended', 'left');--> statement-breakpoint
CREATE TYPE "public"."notification_level" AS ENUM('all', 'important', 'none');--> statement-breakpoint
CREATE TYPE "public"."theme_mode" AS ENUM('light', 'dark', 'system');--> statement-breakpoint
CREATE TYPE "public"."file_status" AS ENUM('uploading', 'processing', 'ready', 'failed', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."file_type" AS ENUM('image', 'audio', 'video', 'document', 'pdf', 'archive', 'raw', 'avatar', 'receipt', 'invoice', 'contract', 'template');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('event', 'message', 'user_profile', 'household', 'task', 'receipt', 'document', 'template', 'report');--> statement-breakpoint
CREATE TYPE "public"."log_status" AS ENUM('pending', 'processing', 'processed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."log_type" AS ENUM('text', 'audio', 'image', 'video', 'file');--> statement-breakpoint
CREATE TYPE "public"."event_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."event_source" AS ENUM('telegram', 'web', 'mobile', 'api');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('active', 'archived', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('expense', 'task', 'maintenance', 'other');--> statement-breakpoint
CREATE TYPE "public"."attachment_type" AS ENUM('image', 'audio', 'video', 'pdf', 'document', 'receipt', 'raw');--> statement-breakpoint
CREATE TYPE "public"."chat_channel" AS ENUM('telegram', 'web', 'mobile');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('system', 'user', 'assistant', 'tool');--> statement-breakpoint
CREATE TYPE "public"."reminder_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."reminder_recurrence" AS ENUM('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('pending', 'active', 'completed', 'cancelled', 'snoozed');--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('task', 'event', 'deadline', 'meeting', 'call', 'follow_up', 'custom');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"type" "verification_type" DEFAULT 'email' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "household_status" DEFAULT 'active' NOT NULL,
	"settings" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "household_members" (
	"household_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"status" "member_status" DEFAULT 'active' NOT NULL,
	"settings" jsonb,
	"invited_at" timestamp with time zone,
	"joined_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "household_members_household_id_user_id_pk" PRIMARY KEY("household_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"locale" text DEFAULT 'ru-RU' NOT NULL,
	"currency" text DEFAULT 'RUB' NOT NULL,
	"theme" "theme_mode" DEFAULT 'system' NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"bio" text,
	"website" text,
	"email_notifications" "notification_level" DEFAULT 'all' NOT NULL,
	"push_notifications" "notification_level" DEFAULT 'all' NOT NULL,
	"preferences" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "file_type" NOT NULL,
	"status" "file_status" DEFAULT 'ready' NOT NULL,
	"mime" text,
	"size" bigint,
	"extension" text,
	"storage_key" text NOT NULL,
	"storage_url" text,
	"thumbnail_key" text,
	"thumbnail_url" text,
	"uploaded_by" text NOT NULL,
	"household_id" text,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "file_storage_key_uidx" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "file_relations" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" text NOT NULL,
	"role" text,
	"order" integer,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "file_relation_file_entity_role_uidx" UNIQUE("file_id","entity_type","entity_id","role")
);
--> statement-breakpoint
CREATE TABLE "event_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"chat_id" text NOT NULL,
	"type" "log_type" NOT NULL,
	"status" "log_status" DEFAULT 'pending' NOT NULL,
	"text" text,
	"original_text" text,
	"processed_at" timestamp with time zone,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"household_id" text NOT NULL,
	"user_id" text,
	"source" "event_source" NOT NULL,
	"type" "event_type" NOT NULL,
	"status" "event_status" DEFAULT 'active' NOT NULL,
	"priority" "event_priority" DEFAULT 'medium' NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text,
	"notes" text,
	"amount" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'RUB' NOT NULL,
	"data" jsonb,
	CONSTRAINT "amount_non_negative" CHECK ("events"."amount" >= 0),
	CONSTRAINT "currency_iso_format" CHECK ("events"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "event_properties" (
	"event_id" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_properties_event_id_key_pk" PRIMARY KEY("event_id","key")
);
--> statement-breakpoint
CREATE TABLE "event_tags" (
	"event_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_tags_event_id_tag_id_pk" PRIMARY KEY("event_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"household_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text,
	"parent_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text,
	"household_id" text NOT NULL,
	"event_id" text,
	"type" "attachment_type" NOT NULL,
	"mime" text,
	"filename" text,
	"size" bigint,
	"storage_url" text NOT NULL,
	"thumbnail_url" text,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"channel" "chat_channel" NOT NULL,
	"title" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_message_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "identity_links" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "identity_links_provider_provider_user_id_unique" UNIQUE("provider","provider_user_id"),
	CONSTRAINT "identity_links_user_id_provider_unique" UNIQUE("user_id","provider")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"role" "message_role" NOT NULL,
	"content" jsonb NOT NULL,
	"model" text,
	"status" text DEFAULT 'completed' NOT NULL,
	"parent_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminder_executions" (
	"id" text PRIMARY KEY NOT NULL,
	"reminder_id" text NOT NULL,
	"executed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"channel" text,
	"error_message" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "reminder_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
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
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
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
	"chat_id" text,
	"parent_reminder_id" text,
	"tags" jsonb,
	"notification_sent" boolean DEFAULT false,
	"snooze_count" integer DEFAULT 0,
	"snooze_until" timestamp with time zone,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_relations" ADD CONSTRAINT "file_relations_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_properties" ADD CONSTRAINT "event_properties_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tags" ADD CONSTRAINT "event_tags_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tags" ADD CONSTRAINT "event_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_links" ADD CONSTRAINT "identity_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder_executions" ADD CONSTRAINT "reminder_executions_reminder_id_reminders_id_fk" FOREIGN KEY ("reminder_id") REFERENCES "public"."reminders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder_templates" ADD CONSTRAINT "reminder_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_provider_idx" ON "accounts" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "account_created_at_idx" ON "accounts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "session_active_idx" ON "sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_type_idx" ON "verifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "verification_expires_idx" ON "verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "verification_used_idx" ON "verifications" USING btree ("is_used");--> statement-breakpoint
CREATE INDEX "household_name_idx" ON "households" USING btree ("name");--> statement-breakpoint
CREATE INDEX "household_status_idx" ON "households" USING btree ("status");--> statement-breakpoint
CREATE INDEX "household_created_at_idx" ON "households" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "household_member_household_idx" ON "household_members" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "household_member_user_idx" ON "household_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "household_member_role_idx" ON "household_members" USING btree ("role");--> statement-breakpoint
CREATE INDEX "household_member_status_idx" ON "household_members" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "household_one_active_owner_idx" ON "household_members" USING btree ("household_id") WHERE "household_members"."role" = 'owner' AND "household_members"."status" = 'active';--> statement-breakpoint
CREATE INDEX "user_profile_timezone_idx" ON "user_profiles" USING btree ("timezone");--> statement-breakpoint
CREATE INDEX "user_profile_locale_idx" ON "user_profiles" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "user_profile_phone_idx" ON "user_profiles" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "file_type_idx" ON "files" USING btree ("type");--> statement-breakpoint
CREATE INDEX "file_status_idx" ON "files" USING btree ("status");--> statement-breakpoint
CREATE INDEX "file_uploaded_by_idx" ON "files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "file_household_idx" ON "files" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "file_created_at_idx" ON "files" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "file_type_status_idx" ON "files" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "file_household_type_idx" ON "files" USING btree ("household_id","type");--> statement-breakpoint
CREATE INDEX "file_relation_file_idx" ON "file_relations" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "file_relation_entity_type_idx" ON "file_relations" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "file_relation_entity_id_idx" ON "file_relations" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "file_relation_role_idx" ON "file_relations" USING btree ("role");--> statement-breakpoint
CREATE INDEX "file_relation_created_at_idx" ON "file_relations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "file_relation_entity_idx" ON "file_relations" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "file_relation_file_entity_idx" ON "file_relations" USING btree ("file_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "event_log_source_idx" ON "event_logs" USING btree ("source");--> statement-breakpoint
CREATE INDEX "event_log_chat_idx" ON "event_logs" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "event_log_type_idx" ON "event_logs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "event_log_status_idx" ON "event_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "event_log_created_at_idx" ON "event_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "event_log_source_chat_idx" ON "event_logs" USING btree ("source","chat_id");--> statement-breakpoint
CREATE INDEX "event_household_occurred_idx" ON "events" USING btree ("household_id","occurred_at");--> statement-breakpoint
CREATE INDEX "event_household_type_occurred_idx" ON "events" USING btree ("household_id","type","occurred_at");--> statement-breakpoint
CREATE INDEX "event_user_occurred_idx" ON "events" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "event_status_type_idx" ON "events" USING btree ("status","type");--> statement-breakpoint
CREATE INDEX "event_priority_idx" ON "events" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "event_amount_idx" ON "events" USING btree ("amount");--> statement-breakpoint
CREATE INDEX "event_source_idx" ON "events" USING btree ("source");--> statement-breakpoint
CREATE INDEX "event_property_key_idx" ON "event_properties" USING btree ("key");--> statement-breakpoint
CREATE INDEX "event_tag_event_idx" ON "event_tags" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_tag_tag_idx" ON "event_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_household_name_uidx" ON "tags" USING btree ("household_id","name");--> statement-breakpoint
CREATE INDEX "tag_household_idx" ON "tags" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "tag_parent_idx" ON "tags" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "tag_name_idx" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "attachment_household_idx" ON "attachments" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "attachment_event_idx" ON "attachments" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "attachment_type_idx" ON "attachments" USING btree ("type");--> statement-breakpoint
CREATE INDEX "attachment_created_at_idx" ON "attachments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "attachment_file_idx" ON "attachments" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "conversation_owner_user_idx" ON "conversations" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "conversation_channel_idx" ON "conversations" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "conversation_status_idx" ON "conversations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversation_last_message_idx" ON "conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "identity_link_user_idx" ON "identity_links" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "identity_link_provider_idx" ON "identity_links" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "message_conversation_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_role_idx" ON "messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "message_status_idx" ON "messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "message_parent_idx" ON "messages" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "message_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "message_conversation_created_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "reminder_executions_reminder_id_idx" ON "reminder_executions" USING btree ("reminder_id");--> statement-breakpoint
CREATE INDEX "reminder_executions_executed_at_idx" ON "reminder_executions" USING btree ("executed_at");--> statement-breakpoint
CREATE INDEX "reminder_executions_status_idx" ON "reminder_executions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reminder_executions_channel_idx" ON "reminder_executions" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "reminder_executions_reminder_status_idx" ON "reminder_executions" USING btree ("reminder_id","status");--> statement-breakpoint
CREATE INDEX "reminder_executions_reminder_executed_at_idx" ON "reminder_executions" USING btree ("reminder_id","executed_at");--> statement-breakpoint
CREATE INDEX "reminder_executions_status_executed_at_idx" ON "reminder_executions" USING btree ("status","executed_at");--> statement-breakpoint
CREATE INDEX "reminder_executions_channel_status_idx" ON "reminder_executions" USING btree ("channel","status");--> statement-breakpoint
CREATE INDEX "reminder_executions_failed_idx" ON "reminder_executions" USING btree ("executed_at","channel") WHERE "reminder_executions"."status" = 'failed';--> statement-breakpoint
CREATE INDEX "reminder_executions_success_idx" ON "reminder_executions" USING btree ("reminder_id","executed_at") WHERE "reminder_executions"."status" = 'sent';--> statement-breakpoint
CREATE INDEX "reminder_executions_metadata_gin_idx" ON "reminder_executions" USING gin ("metadata");--> statement-breakpoint
CREATE INDEX "reminder_templates_user_id_idx" ON "reminder_templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reminder_templates_is_public_idx" ON "reminder_templates" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "reminder_templates_name_idx" ON "reminder_templates" USING btree ("name");--> statement-breakpoint
CREATE INDEX "reminder_templates_usage_count_idx" ON "reminder_templates" USING btree ("usage_count");--> statement-breakpoint
CREATE INDEX "reminder_templates_public_name_idx" ON "reminder_templates" USING btree ("is_public","name");--> statement-breakpoint
CREATE INDEX "reminder_templates_user_name_idx" ON "reminder_templates" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "reminder_templates_popular_public_idx" ON "reminder_templates" USING btree ("is_public","usage_count");--> statement-breakpoint
CREATE UNIQUE INDEX "reminder_templates_user_name_unique_idx" ON "reminder_templates" USING btree ("user_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "reminder_templates_public_name_unique_idx" ON "reminder_templates" USING btree ("name") WHERE "reminder_templates"."is_public" = true;--> statement-breakpoint
CREATE INDEX "reminders_user_id_idx" ON "reminders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reminders_reminder_time_idx" ON "reminders" USING btree ("reminder_time");--> statement-breakpoint
CREATE INDEX "reminders_status_idx" ON "reminders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reminders_type_idx" ON "reminders" USING btree ("type");--> statement-breakpoint
CREATE INDEX "reminders_priority_idx" ON "reminders" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "reminders_user_status_idx" ON "reminders" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "reminders_user_type_status_idx" ON "reminders" USING btree ("user_id","type","status");--> statement-breakpoint
CREATE INDEX "reminders_user_time_status_idx" ON "reminders" USING btree ("user_id","reminder_time","status");--> statement-breakpoint
CREATE INDEX "reminders_user_priority_time_idx" ON "reminders" USING btree ("user_id","priority","reminder_time");--> statement-breakpoint
CREATE INDEX "reminders_active_time_idx" ON "reminders" USING btree ("reminder_time") WHERE "reminders"."status" = 'active';--> statement-breakpoint
CREATE INDEX "reminders_user_pending_idx" ON "reminders" USING btree ("user_id","reminder_time") WHERE "reminders"."status" IN ('pending', 'active');--> statement-breakpoint
CREATE INDEX "reminders_ai_generated_idx" ON "reminders" USING btree ("ai_generated");--> statement-breakpoint
CREATE INDEX "reminders_parent_reminder_idx" ON "reminders" USING btree ("parent_reminder_id");--> statement-breakpoint
CREATE INDEX "reminders_chat_id_idx" ON "reminders" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "reminders_recurrence_idx" ON "reminders" USING btree ("recurrence");--> statement-breakpoint
CREATE INDEX "reminders_recurrence_end_date_idx" ON "reminders" USING btree ("recurrence_end_date");--> statement-breakpoint
CREATE INDEX "reminders_tags_gin_idx" ON "reminders" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "reminders_metadata_gin_idx" ON "reminders" USING gin ("metadata");--> statement-breakpoint
CREATE INDEX "reminders_recurrence_pattern_gin_idx" ON "reminders" USING gin ("recurrence_pattern");--> statement-breakpoint
CREATE INDEX "reminders_ai_context_gin_idx" ON "reminders" USING gin ("ai_context");--> statement-breakpoint
CREATE INDEX "reminders_smart_suggestions_gin_idx" ON "reminders" USING gin ("smart_suggestions");--> statement-breakpoint
CREATE INDEX "reminders_created_at_idx" ON "reminders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reminders_updated_at_idx" ON "reminders" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "reminders_completed_at_idx" ON "reminders" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "reminders_snooze_until_idx" ON "reminders" USING btree ("snooze_until");--> statement-breakpoint
CREATE UNIQUE INDEX "reminders_user_time_unique_idx" ON "reminders" USING btree ("user_id","reminder_time","title") WHERE "reminders"."status" IN ('pending', 'active');