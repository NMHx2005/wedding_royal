"use client";

import type { ReactNode } from "react";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <ConfirmProvider>{children}</ConfirmProvider>;
}
