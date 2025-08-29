DROP INDEX "reminder_executions_reminder_status_time_idx";--> statement-breakpoint
DROP INDEX "reminders_user_type_idx";--> statement-breakpoint
DROP INDEX "reminders_user_priority_idx";--> statement-breakpoint
DROP INDEX "reminders_user_time_idx";--> statement-breakpoint
CREATE INDEX "reminder_executions_reminder_status_idx" ON "reminder_executions" USING btree ("reminder_id","status");--> statement-breakpoint
CREATE INDEX "reminder_executions_reminder_executed_at_idx" ON "reminder_executions" USING btree ("reminder_id","executed_at");--> statement-breakpoint
CREATE INDEX "reminder_executions_status_executed_at_idx" ON "reminder_executions" USING btree ("status","executed_at");--> statement-breakpoint
CREATE INDEX "reminder_executions_channel_status_idx" ON "reminder_executions" USING btree ("channel","status");--> statement-breakpoint
CREATE INDEX "reminder_executions_metadata_gin_idx" ON "reminder_executions" USING btree ("metadata");--> statement-breakpoint
CREATE INDEX "reminders_user_type_status_idx" ON "reminders" USING btree ("user_id","type","status");--> statement-breakpoint
CREATE INDEX "reminders_user_priority_time_idx" ON "reminders" USING btree ("user_id","priority","reminder_time");--> statement-breakpoint
CREATE INDEX "reminders_user_time_status_idx" ON "reminders" USING btree ("user_id","reminder_time","status");--> statement-breakpoint
CREATE INDEX "reminders_recurrence_idx" ON "reminders" USING btree ("recurrence");--> statement-breakpoint
CREATE INDEX "reminders_recurrence_end_date_idx" ON "reminders" USING btree ("recurrence_end_date");--> statement-breakpoint
CREATE INDEX "reminders_recurrence_pattern_gin_idx" ON "reminders" USING btree ("recurrence_pattern");--> statement-breakpoint
CREATE INDEX "reminders_created_at_idx" ON "reminders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reminders_updated_at_idx" ON "reminders" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "reminders_completed_at_idx" ON "reminders" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "reminders_snooze_until_idx" ON "reminders" USING btree ("snooze_until");