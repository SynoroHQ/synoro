import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createPresignedUrl, generateS3Key } from "@synoro/lib";
import { CreatePresignedUrlSchema } from "@synoro/validators";

import { protectedProcedure } from "../trpc";

export const attachmentsRouter = {
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
        console.error("Error creating presigned URL:", e);
        if (e instanceof Error && e.name === "S3ServiceException") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `S3 service error: ${e.message}`,
          });
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            e instanceof Error ? e.message : "Error creating S3 presigned url",
        });
      }
    }),
} satisfies TRPCRouterRecord;
