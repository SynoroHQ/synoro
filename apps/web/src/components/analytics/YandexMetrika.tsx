"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const YM_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

export default function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!YM_ID) return;
    if (typeof window === "undefined") return;
    const ym = (window as any).ym as
      | ((id: number, method: string, ...args: any[]) => void)
      | undefined;
    if (typeof ym !== "function") return;

    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    ym(Number(YM_ID), "hit", url);
  }, [pathname, searchParams]);

  return null;
}
