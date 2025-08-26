import type { AttributeValue } from "@opentelemetry/api";

export type TelemetryMeta = Record<string, AttributeValue> & {
  langfuseTraceId?: string;
  langfuseUpdateParent?: boolean;
};

export type Telemetry = {
  functionId?: string;
  metadata?: TelemetryMeta;
};

export type RelevanceResult = {
  relevant: boolean;
  score?: number;
  category?: "relevant" | "irrelevant" | "spam";
};

export type MessageTypeResult = {
  type: "question" | "event" | "chat" | "irrelevant";
  subtype?: string | null;
  confidence: number;
  need_logging: boolean;
};

export type ParsedTask = {
  action: string;
  object: string;
  confidence?: number;
};

export type ParsedMessage = {
  id: string;
  role: "user" | "assistant";
  content: { text: string };
  createdAt: Date;
};
