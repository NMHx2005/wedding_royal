type BlockType =
  | "text"
  | "image"
  | "icon"
  | "button"
  | "countdown"
  | "divider"
  | "giftbox"
  | "section"
  | string;

type CraftQuery = {
  node: (id: string) => { get: () => { data: { props: Record<string, unknown> } } };
};

type CraftActions = {
  setProp: (id: string, cb: (props: Record<string, unknown>) => void) => void;
};

function parseBlockType(el: HTMLElement): BlockType {
  return el?.getAttribute("data-block") ?? "";
}

function dimensionUpdates(
  blockType: BlockType,
  w: number,
  h: number
): Record<string, number> {
  switch (blockType) {
    case "icon":
      return { size: Math.round(Math.max(w, h, 16)) };
    case "text":
    case "button":
    case "countdown":
      return { width: Math.round(Math.max(w, 40)) };
    default:
      return {
        width: Math.round(Math.max(w, 20)),
        height: Math.round(Math.max(h, 20)),
      };
  }
}

export function readBlockPositionFromDom(
  target: HTMLElement,
  lastEvent?: { left?: number; top?: number }
): { left: number; top: number } | null {
  let left = Math.round(
    lastEvent?.left ?? (parseFloat(target.style.left) || Number.NaN)
  );
  let top = Math.round(
    lastEvent?.top ?? (parseFloat(target.style.top) || Number.NaN)
  );
  if (!Number.isFinite(left) || !Number.isFinite(top)) {
    const parent = target.offsetParent as HTMLElement | null;
    if (parent) {
      const tr = target.getBoundingClientRect();
      const pr = parent.getBoundingClientRect();
      left = Math.round(tr.left - pr.left);
      top = Math.round(tr.top - pr.top);
    }
  }
  if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
  return { left, top };
}

/** Sync live DOM geometry into Craft props before serialize. */
export function flushBlockPositionsFromDom(
  rootContainer: HTMLElement | null | undefined,
  query: CraftQuery,
  actions: CraftActions
): void {
  if (!rootContainer) return;

  const nodes = rootContainer.querySelectorAll<HTMLElement>(
    "[data-block]:not([data-block='section'])[data-node-id]"
  );

  nodes.forEach((el) => {
    const nodeId = el.getAttribute("data-node-id");
    if (!nodeId) return;

    let props: Record<string, unknown>;
    try {
      props = query.node(nodeId).get().data.props as Record<string, unknown>;
    } catch {
      return;
    }

    const blockType = parseBlockType(el);
    const pos = readBlockPositionFromDom(el);
    const dims = dimensionUpdates(blockType, el.offsetWidth, el.offsetHeight);

    const updates: Record<string, number> = {};
    if (pos) {
      const curLeft = Math.round(Number(props.left) || 0);
      const curTop = Math.round(Number(props.top) || 0);
      if (curLeft !== pos.left) updates.left = pos.left;
      if (curTop !== pos.top) updates.top = pos.top;
    }

    for (const [key, value] of Object.entries(dims)) {
      const cur = Number(props[key]);
      if (!Number.isFinite(cur) || Math.round(cur) !== value) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) return;

    actions.setProp(nodeId, (p: Record<string, unknown>) => {
      Object.assign(p, updates);
    });
  });
}
