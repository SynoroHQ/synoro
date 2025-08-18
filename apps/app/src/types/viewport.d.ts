declare module "next" {
  interface Viewport {
    width?: string | number;
    initialScale?: number;
    minimumScale?: number;
    maximumScale?: number;
    userScalable?: boolean;
    viewportFit?: "auto" | "cover" | "contain";
    themeColor?: string | Array<{ media: string; color: string }>;
    colorScheme?: "light" | "dark" | "light dark";
  }
}
