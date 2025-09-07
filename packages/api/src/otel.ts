import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { Langfuse } from "langfuse";
import { LangfuseExporter } from "langfuse-vercel";

import { initializePromptService } from "@synoro/prompts";

let sdk: NodeSDK | null = null;

export async function startTracing(serviceName = "synoro-api"): Promise<void> {
  if (sdk) return;
  const haveLangfuse =
    !!process.env.LANGFUSE_PUBLIC_KEY &&
    !!process.env.LANGFUSE_SECRET_KEY &&
    !!process.env.LANGFUSE_BASEURL;

  // Инициализируем Langfuse клиент для промптов
  if (haveLangfuse) {
    const langfuseClient = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY!,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
      baseUrl: process.env.LANGFUSE_BASEURL!,
    });

    initializePromptService({
      createPrompt: (args) => langfuseClient.createPrompt(args as any),
      getPrompt: (args) => langfuseClient.getPrompt(args as any),
    });
  }

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
