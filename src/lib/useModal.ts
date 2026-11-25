"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Pop-up state lives in the URL (`?modal=edit-contact`) so every Figma
 * pop-up frame is deep-linkable, survives refresh and works with Back.
 */
export function useModal<T extends string>() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = (params.get("modal") as T | null) ?? null;
  const target = params.get("id");

  const open = useCallback(
    (name: T, id?: string) => {
      const sp = new URLSearchParams();
      sp.set("modal", name);
      if (id) sp.set("id", id);
      router.push(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [pathname, router],
  );
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  return { current, target, open, close, is: (name: T) => current === name };
}
