import { pathToFileURL } from "url";
import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";

import { startTracing, stopTracing } from "./otel";
import { appRouter } from "./root";
import { createHonoContext } from "./trpc";

async function main() {
  try {
    // Initialize OpenTelemetry tracing
    console.log("Starting OpenTelemetry tracing...");
    await startTracing("synoro-api");
    console.log("OpenTelemetry tracing started successfully");

    // Initialize Hono app
    const app = new Hono();

    // Health check endpoint
    app.get("/health", (c) => {
      return c.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // Add tRPC middleware
    app.use(
      "/api/trpc/*",
      trpcServer({
        router: appRouter,
        createContext: createHonoContext,
      }),
    );

    // Start the server
    const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 4000;
    const server = {
      close: (callback?: () => void) => {
        // Hono doesn't have a built-in close method, so we'll simulate it
        if (callback) callback();
      }
    };
    
    // Start the server using Bun's serve
    Bun.serve({
      port,
      fetch: app.fetch,
    });
    
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📡 tRPC API available at http://localhost:${port}/api/trpc`);

    console.log("Server started successfully");

    // Graceful shutdown handlers
    type ShutdownSignal =
      | NodeJS.Signals
      | "uncaughtException"
      | "unhandledRejection";
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

        // Close Express server
        if (server) {
          console.log("Closing Express server...");
          await new Promise<void>((resolve) => {
            server.close(() => {
              console.log("Express server closed");
              resolve();
            });
          });
        }

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
