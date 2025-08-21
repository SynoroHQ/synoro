import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { LangfuseExporter } from "langfuse-vercel";

let sdk: NodeSDK | null = null;

export async function startTracing(serviceName = "synoro-api"): Promise<void> {
  if (sdk) return;
  sdk = new NodeSDK({
    traceExporter: new LangfuseExporter(),
    instrumentations: [getNodeAutoInstrumentations()],
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
  });
  await sdk.start();
}

export async function stopTracing(): Promise<void> {
  if (!sdk) return;
  await sdk.shutdown();
  sdk = null;
}
