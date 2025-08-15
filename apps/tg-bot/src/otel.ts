import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { LangfuseExporter } from "langfuse-vercel";

let sdk: NodeSDK | null = null;

export async function startTracing(serviceName = "synoro-tg-bot"): Promise<void> {
  if (sdk) return;
  sdk = new NodeSDK({
    traceExporter: new LangfuseExporter(),
    instrumentations: [getNodeAutoInstrumentations()],
    serviceName,
  } as any);
  await sdk.start();
}

export async function stopTracing(): Promise<void> {
  if (!sdk) return;
  await sdk.shutdown();
  sdk = null;
}
