CREATE TYPE "public"."asset_status" AS ENUM('active', 'inactive', 'maintenance', 'sold', 'disposed');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('vehicle', 'building', 'appliance', 'electronics', 'furniture', 'tool', 'other');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"household_id" text NOT NULL,
	"type" "asset_type" NOT NULL,
	"status" "asset_status" DEFAULT 'active' NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "event_assets" (
	"event_id" text NOT NULL,
	"asset_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_assets_event_id_asset_id_pk" PRIMARY KEY("event_id","asset_id")
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_assets" ADD CONSTRAINT "event_assets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_assets" ADD CONSTRAINT "event_assets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_household_idx" ON "assets" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "asset_type_idx" ON "assets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "asset_status_idx" ON "assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "asset_household_type_idx" ON "assets" USING btree ("household_id","type");--> statement-breakpoint
CREATE INDEX "event_asset_event_idx" ON "event_assets" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_asset_asset_idx" ON "event_assets" USING btree ("asset_id");