import { createTRPCRouter } from "./trpc";
import { adminsRouter } from "./router/admins";
import { attachmentsRouter } from "./router/attachments";
import { authRouter } from "./router/auth";
import { bannersRouter } from "./router/banners";
import { blogRouter } from "./router/blog";
import { 
  brandsRouter,
  categoriesRouter,
  customersRouter,
  dashboardRouter,
  deliverySettingsRouter,
  ordersRouter,
  productTypesRouter,
  productTypeAttributesRouter,
  productAttributeValuesRouter,
  productsRouter,
  productVariantsRouter,
} from "./router/placeholder-routers";

export const appRouter = createTRPCRouter({
  admins: adminsRouter,
  attachments: attachmentsRouter,
  auth: authRouter,
  banners: bannersRouter,
  blog: blogRouter,
  brands: brandsRouter,
  categories: categoriesRouter,
  customers: customersRouter,
  dashboard: dashboardRouter,
  deliverySettings: deliverySettingsRouter,
  orders: ordersRouter,
  productTypes: productTypesRouter,
  productTypeAttributes: productTypeAttributesRouter,
  productAttributeValues: productAttributeValuesRouter,
  products: productsRouter,
  productVariants: productVariantsRouter,
});

export type AppRouter = typeof appRouter;
