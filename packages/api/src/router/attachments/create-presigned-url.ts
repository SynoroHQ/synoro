import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createPresignedUrl, generateS3Key } from "@synoro/lib";
import { CreatePresignedUrlSchema } from "@synoro/validators";

import { protectedProcedure } from "../../trpc";

export const createPresignedUrlRouter: TRPCRouterRecord = {
  createPresignedUrl: protectedProcedure
    .input(CreatePresignedUrlSchema)
    .output(
      z.object({
        url: z.string(),
        key: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { key, temporary } = input;
      try {
        const newKey = generateS3Key(key, temporary);
        const url = await createPresignedUrl(newKey);
        return { url, key: newKey };
      } catch (e) {
        // Server-side logging: keep full error details in logs
        console.error("Error creating presigned URL:", e);

        // Client-facing error should be generic and use a 5xx code for service/internal failures
        const genericMessage = "Failed to create presigned URL";

        if (e instanceof Error && e.name === "S3ServiceException") {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: genericMessage,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: genericMessage,
        });
      }
    }),
};
