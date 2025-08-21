import type { TRPCRouterRecord } from "@trpc/server";
import { createPresignedUrlRouter } from "./create-presigned-url";

export const attachmentsRouter: TRPCRouterRecord = {
  ...createPresignedUrlRouter,
};
