import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../trpc";

// Brands Router
export const brandsRouter = {
  getBrands: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          logo: z.string(),
        }),
      ),
    )
    .query(async () => {
      return [];
    }),
} satisfies TRPCRouterRecord;

// Categories Router
export const categoriesRouter = {
  getCategories: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
        }),
      ),
    )
    .query(async () => {
      return [];
    }),
} satisfies TRPCRouterRecord;

// Customers Router
export const customersRouter = {
  getCustomers: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
        }),
      ),
    )
    .query(async () => {
      return [];
    }),
} satisfies TRPCRouterRecord;

// Dashboard Router
export const dashboardRouter = {
  getStats: protectedProcedure
    .output(
      z.object({
        totalUsers: z.number(),
        totalProducts: z.number(),
      }),
    )
    .query(async () => {
      return { totalUsers: 0, totalProducts: 0 };
    }),
} satisfies TRPCRouterRecord;

// Delivery Settings Router
export const deliverySettingsRouter = {
  getSettings: protectedProcedure
    .output(
      z.object({
        enabled: z.boolean(),
        cost: z.number(),
      }),
    )
    .query(async () => {
      return { enabled: false, cost: 0 };
    }),
} satisfies TRPCRouterRecord;

// Orders Router
export const ordersRouter = {
  getOrders: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          status: z.string(),
          total: z.number(),
        }),
      ),
    )
    .query(async () => {
      return [];
    }),
} satisfies TRPCRouterRecord;

// Product Types Router
export const productTypesRouter = {
  getProductTypes: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
        }),
      ),
    )
    .query(async () => {
      return [];
    }),
} satisfies TRPCRouterRecord;

// Product Type Attributes Router
export const productTypeAttributesRouter = {
  getAttributes: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          type: z.string(),
        }),
      ),
    )
    .query(async () => {
      return [];
    }),
} satisfies TRPCRouterRecord;

// Product Attribute Values Router
export const productAttributeValuesRouter = {
  getValues: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          value: z.string(),
          attributeId: z.string(),
        }),
      ),
    )
    .query(async () => {
      return [];
    }),
} satisfies TRPCRouterRecord;

// Products Router
export const productsRouter = {
  getProducts: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          price: z.number(),
        }),
      ),
    )
    .query(async () => {
      return [];
    }),
} satisfies TRPCRouterRecord;

// Product Variants Router
export const productVariantsRouter = {
  getVariants: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          productId: z.string(),
        }),
      ),
    )
    .query(async () => {
      return [];
    }),
} satisfies TRPCRouterRecord;
