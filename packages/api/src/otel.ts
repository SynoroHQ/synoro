import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { Langfuse } from "langfuse";
import { LangfuseExporter } from "langfuse-vercel";

import { initializePromptService } from "@synoro/prompts";

interface TracingConfig {
  serviceName?: string;
  serviceVersion?: string;
  environment?: string;
  enableAutoInstrumentation?: boolean;
  enableLangfuse?: boolean;
  langfuseConfig?: {
    publicKey: string;
    secretKey: string;
    baseUrl: string;
  };
}

interface TracingState {
  sdk: NodeSDK | null;
  isInitialized: boolean;
  langfuseClient: Langfuse | null;
}

const state: TracingState = {
  sdk: null,
  isInitialized: false,
  langfuseClient: null,
};

/**
 * Validates Langfuse configuration from environment variables
 */
function validateLangfuseConfig(): {
  isValid: boolean;
  config?: TracingConfig["langfuseConfig"];
} {
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const baseUrl = process.env.LANGFUSE_BASEURL;

  if (!publicKey || !secretKey || !baseUrl) {
    return { isValid: false };
  }

  return {
    isValid: true,
    config: {
      publicKey,
      secretKey,
      baseUrl,
    },
  };
}

/**
 * Creates a Langfuse client with proper error handling
 */
function createLangfuseClient(
  config: NonNullable<TracingConfig["langfuseConfig"]>,
): Langfuse {
  try {
    const client = new Langfuse({
      secretKey: config.secretKey,
      publicKey: config.publicKey,
      baseUrl: config.baseUrl,
    });

    console.log(
      `✅ Langfuse client initialized with base URL: ${config.baseUrl}`,
    );
    return client;
  } catch (error) {
    console.error("❌ Failed to initialize Langfuse client:", error);
    throw new Error(
      `Langfuse initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Initializes OpenTelemetry tracing with comprehensive configuration
 */
export async function startTracing(config: TracingConfig = {}): Promise<void> {
  if (state.isInitialized) {
    console.log("⚠️  OpenTelemetry tracing already initialized");
    return;
  }

  const {
    serviceName = "synoro-api",
    serviceVersion = process.env.npm_package_version || "1.0.0",
    environment = process.env.NODE_ENV || "development",
    enableAutoInstrumentation = true,
    enableLangfuse = true,
  } = config;

  console.log(
    `🚀 Starting OpenTelemetry tracing for service: ${serviceName} v${serviceVersion}`,
  );

  try {
    // Initialize Langfuse if enabled and configured
    let traceExporter: LangfuseExporter | undefined;

    if (enableLangfuse) {
      const langfuseValidation = validateLangfuseConfig();

      if (langfuseValidation.isValid && langfuseValidation.config) {
        try {
          state.langfuseClient = createLangfuseClient(
            langfuseValidation.config,
          );
          traceExporter = new LangfuseExporter();

          // Initialize prompt service with Langfuse client
          initializePromptService(state.langfuseClient as any);
          console.log("✅ Langfuse integration enabled");
        } catch (error) {
          console.warn(
            "⚠️  Langfuse initialization failed, continuing without tracing export:",
            error,
          );
        }
      } else {
        console.log(
          "ℹ️  Langfuse credentials not found, tracing will run without export",
        );
      }
    } else {
      console.log("ℹ️  Langfuse disabled by configuration");
    }

    // Create OpenTelemetry SDK
    state.sdk = new NodeSDK({
      traceExporter,
      instrumentations: enableAutoInstrumentation
        ? [
            getNodeAutoInstrumentations({
              // Disable instrumentations that might cause issues
              "@opentelemetry/instrumentation-fs": {
                enabled: false, // Can cause performance issues
              },
            }),
          ]
        : [],
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: serviceName,
        [ATTR_SERVICE_VERSION]: serviceVersion,
        "service.environment": environment,
        "service.instance.id": process.env.HOSTNAME || "unknown",
      }),
    });

    // Start the SDK
    await state.sdk.start();
    state.isInitialized = true;

    console.log(`✅ OpenTelemetry tracing started successfully`);
    console.log(`   Service: ${serviceName} v${serviceVersion}`);
    console.log(`   Environment: ${environment}`);
    console.log(`   Tracing export: ${traceExporter ? "enabled" : "disabled"}`);
    console.log(
      `   Auto-instrumentation: ${enableAutoInstrumentation ? "enabled" : "disabled"}`,
    );
  } catch (error) {
    // Clean up on failure
    state.sdk = null;
    state.langfuseClient = null;
    state.isInitialized = false;

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Failed to start OpenTelemetry tracing: ${errorMessage}`);

    // Don't throw in production to allow the app to continue running
    if (environment === "production") {
      console.warn("⚠️  Continuing without tracing in production mode");
    } else {
      throw new Error(`OpenTelemetry initialization failed: ${errorMessage}`);
    }
  }
}

/**
 * Gracefully stops OpenTelemetry tracing
 */
export async function stopTracing(): Promise<void> {
  if (!state.isInitialized || !state.sdk) {
    console.log("ℹ️  OpenTelemetry tracing not initialized, nothing to stop");
    return;
  }

  console.log("🛑 Stopping OpenTelemetry tracing...");

  try {
    // Shutdown SDK with timeout
    const shutdownPromise = state.sdk.shutdown();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Shutdown timeout")), 5000);
    });

    await Promise.race([shutdownPromise, timeoutPromise]);

    console.log("✅ OpenTelemetry tracing stopped successfully");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error stopping OpenTelemetry tracing: ${errorMessage}`);
  } finally {
    // Clean up state
    state.sdk = null;
    state.langfuseClient = null;
    state.isInitialized = false;
  }
}

/**
 * Gets the current Langfuse client instance
 */
export function getLangfuseClient(): Langfuse | null {
  return state.langfuseClient;
}

/**
 * Checks if tracing is currently initialized
 */
export function isTracingInitialized(): boolean {
  return state.isInitialized;
}

/**
 * Gets tracing status information
 */
export function getTracingStatus() {
  return {
    isInitialized: state.isInitialized,
    hasLangfuse: !!state.langfuseClient,
    hasSDK: !!state.sdk,
  };
}
