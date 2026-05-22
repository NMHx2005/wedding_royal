"use client";

import React, { createContext, useContext } from "react";
import type { WeddingCard } from "@/types";

type CardLivePatch = Partial<
  Pick<WeddingCard, "wedding_date" | "bride_name" | "groom_name" | "venue_name" | "venue_address" | "updated_at">
>;

interface EditorCardContext {
  card: WeddingCard;
  /** Storage path prefix for uploads, e.g. card UUID or `templates/{id}` */
  uploadScopeId?: string;
  /** Editor only: keep Countdown / bound fields in sync while editing. */
  patchCard?: (patch: CardLivePatch) => void;
}

const EditorCardCtx = createContext<EditorCardContext | null>(null);

export function EditorCardProvider({
  card,
  uploadScopeId,
  patchCard,
  children,
}: {
  card: WeddingCard;
  uploadScopeId?: string;
  patchCard?: (patch: CardLivePatch) => void;
  children: React.ReactNode;
}) {
  return (
    <EditorCardCtx.Provider value={{ card, uploadScopeId, patchCard }}>
      {children}
    </EditorCardCtx.Provider>
  );
}

export function useEditorCardPatch(): ((patch: CardLivePatch) => void) | undefined {
  return useContext(EditorCardCtx)?.patchCard;
}

export function useEditorCard(): WeddingCard {
  const ctx = useContext(EditorCardCtx);
  if (!ctx) throw new Error("useEditorCard must be inside EditorCardProvider");
  return ctx.card;
}

export function useOptionalEditorCard(): WeddingCard | null {
  const ctx = useContext(EditorCardCtx);
  return ctx?.card ?? null;
}

/** Prefix for Supabase Storage uploads (`wedding-photos` bucket). */
export function useEditorUploadScope(): string | null {
  const ctx = useContext(EditorCardCtx);
  if (!ctx) return null;
  if (ctx.uploadScopeId) return ctx.uploadScopeId;
  const id = ctx.card.id;
  if (id && id !== "preview") return id;
  return null;
}
