"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** true only on the client after hydration — portals must wait for it. */
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}
