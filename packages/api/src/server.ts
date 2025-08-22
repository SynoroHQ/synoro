import { pathToFileURL } from "url";

import { startTracing, stopTracing } from "./otel";

async function main() {
  try {
    // Initialize OpenTelemetry tracing
    console.log("Starting OpenTelemetry tracing...");
    await startTracing("synoro-api");
    console.log("OpenTelemetry tracing started successfully");

    // TODO: Add your HTTP server initialization here
    // For example:
    // const app = express();
    // const server = app.listen(process.env.PORT || 3000);

    console.log("Server started successfully");

    // Graceful shutdown handlers
    type ShutdownSignal = NodeJS.Signals | "uncaughtException" | "unhandledRejection";
    let isShuttingDown = false;
    const gracefulShutdown = async (signal: ShutdownSignal) => {
      if (isShuttingDown) {
        console.log(`Shutdown already in progress (signal: ${signal})`);
        return;
      }
      isShuttingDown = true;
      console.log(`Received ${signal}, starting graceful shutdown...`);

      try {
        // Stop OpenTelemetry tracing
        console.log("Stopping OpenTelemetry tracing...");
        await stopTracing();
        console.log("OpenTelemetry tracing stopped successfully");

        // TODO: Add your server cleanup here
        // For example:
        // if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));

        console.log("Graceful shutdown completed");
        process.exit(0);
      } catch (error) {
        console.error("Error during graceful shutdown:", error);
        process.exit(1);
      }
    };

    // Handle SIGINT and SIGTERM signals
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    // Handle uncaught exceptions and unhandled rejections
    process.on("uncaughtException", async (error) => {
      console.error("Uncaught Exception:", error);
      await gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", async (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      await gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { main };
