"use client";

import { useEditor } from "@craftjs/core";

/** Short hint when a draggable block is selected on the phone canvas. */
export function EditorCanvasHint() {
  const { hint } = useEditor((state, query) => {
    const selected = state.events.selected;
    const id = selected.size === 1 ? Array.from(selected)[0] : null;
    if (!id) return { hint: null as string | null };
    try {
      const node = query.node(id).get();
      const dom = node.dom as HTMLElement | undefined;
      const block = dom?.getAttribute("data-block") ?? "";
      if (block === "section") {
        return {
          hint: "Section: đổi thứ tự ở tab Lớp · kéo viền dưới để đổi chiều cao",
        };
      }
      if (block) {
        return {
          hint: "Kéo trực tiếp trên thiệp để di chuyển · kéo ô vuông để đổi kích thước",
        };
      }
    } catch {
      /* ignore */
    }
    return { hint: null as string | null };
  });

  if (!hint) return null;

  return (
    <div
      className="pointer-events-none absolute bottom-2 left-2 right-2 z-[120] flex justify-center"
      aria-live="polite"
    >
      <p className="rounded-lg bg-gray-900/85 text-white text-xs px-3 py-2 text-center shadow-lg max-w-[340px] leading-snug">
        {hint}
      </p>
    </div>
  );
}
