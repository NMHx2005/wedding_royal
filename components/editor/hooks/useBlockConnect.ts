"use client";

import { useCallback } from "react";
import { useNode } from "@craftjs/core";

/** Connect node for selection only — drag is handled by EditorMoveable. */
export function useBlockConnect() {
  const {
    connectors: { connect },
  } = useNode();

  return useCallback(
    (ref: HTMLElement | null) => {
      if (ref) connect(ref);
    },
    [connect]
  );
}
