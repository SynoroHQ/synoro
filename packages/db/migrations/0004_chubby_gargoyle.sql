ALTER TABLE "messages" DROP CONSTRAINT "message_id_conversation_unique";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "message_parent_conversation_fk";
