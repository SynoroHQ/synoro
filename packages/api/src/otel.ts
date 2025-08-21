import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { LangfuseExporter } from "langfuse-vercel";

let sdk: NodeSDK | null = null;

export async function startTracing(serviceName = "synoro-api"): Promise<void> {
  if (sdk) return;
  const haveLangfuse =
    !!process.env.LANGFUSE_PUBLIC_KEY &&
    !!process.env.LANGFUSE_SECRET_KEY &&
    !!process.env.LANGFUSE_BASEURL;
  sdk = new NodeSDK({
    // Если кредов нет — не настраиваем экспортёр (трейсы не будут экспориться, но SDK останется валидным)
    traceExporter: haveLangfuse ? new LangfuseExporter() : undefined,
    instrumentations: [getNodeAutoInstrumentations()],
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
  });
  try {
    await sdk.start();
  } catch (e) {
    // не держим невалидный инстанс
    sdk = null;
    throw e;
  }
}

export async function stopTracing(): Promise<void> {
  if (!sdk) return;
  await sdk.shutdown();
  sdk = null;
}
