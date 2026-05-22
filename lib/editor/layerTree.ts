type CraftQuery = {
  node: (id: string) => {
    get: () => {
      data: {
        nodes?: string[];
        linkedNodes?: Record<string, string>;
        name?: string;
        displayName?: string;
        type?: unknown;
        props?: Record<string, unknown>;
      };
    };
    isRoot: () => boolean;
  };
};

export type LayerTreeChild = {
  id: string;
  name: string;
  index: number;
};

export type LayerTreeSection = {
  id: string;
  name: string;
  index: number;
  parentId: string;
  children: LayerTreeChild[];
};

export type LayerTree = {
  canvasParentId: string | null;
  /** Parent node that owns the section list (RootCanvas or ROOT). */
  sectionsParentId: string | null;
  sections: LayerTreeSection[];
};

export { orderedChildIds };

function resolvedTypeName(data: {
  name?: string;
  displayName?: string;
  type?: unknown;
}): string | undefined {
  const t = data.type;
  if (t && typeof t === "object" && "resolvedName" in t) {
    const rn = (t as { resolvedName?: string }).resolvedName;
    if (rn) return rn;
  }
  if (typeof t === "string") return t;
  if (typeof t === "function" && t.name) return t.name;
  return data.name;
}

function isCanvasNode(query: CraftQuery, nodeId: string): boolean {
  try {
    const node = query.node(nodeId).get();
    const resolved = resolvedTypeName(node.data);
    const display = node.data.displayName as string | undefined;
    return resolved === "RootCanvas" || display === "Canvas";
  } catch {
    return false;
  }
}

function isSectionNode(query: CraftQuery, nodeId: string): boolean {
  try {
    const node = query.node(nodeId).get();
    const resolved = resolvedTypeName(node.data);
    const display = node.data.displayName as string | undefined;
    return resolved === "SectionBlock" || display === "Section";
  } catch {
    return false;
  }
}

/** Child ids in document order: regular nodes then linked nodes. */
function orderedChildIds(data: {
  nodes?: string[];
  linkedNodes?: Record<string, string>;
}): string[] {
  const ids = [...(data.nodes ?? [])];
  for (const id of Object.values(data.linkedNodes ?? {})) {
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

function buildSectionEntry(
  query: CraftQuery,
  sectionId: string,
  sectionIndex: number,
  parentId: string
): LayerTreeSection | null {
  try {
    if (!isSectionNode(query, sectionId)) return null;
    const section = query.node(sectionId).get();
    const childIds = orderedChildIds(section.data);
    const children: LayerTreeChild[] = childIds
      .map((blockId, blockIndex) => {
        try {
          const block = query.node(blockId).get();
          if (isSectionNode(query, blockId)) return null;
          return {
            id: blockId,
            name: (block.data.displayName ??
              resolvedTypeName(block.data) ??
              "Phần tử") as string,
            index: blockIndex,
          };
        } catch {
          return null;
        }
      })
      .filter((c): c is LayerTreeChild => c !== null);

    const props = section.data.props as { elementId?: string } | undefined;
    const label = (section.data.displayName as string) ?? "Section";
    const suffix = props?.elementId ? ` · ${props.elementId.slice(-6)}` : "";

    return {
      id: sectionId,
      name: `${label}${suffix}`,
      index: sectionIndex,
      parentId,
      children,
    };
  } catch {
    return null;
  }
}

/** Build section → children tree from Craft document (document order, top to bottom). */
export function buildLayerTree(query: CraftQuery, nodeIds: string[]): LayerTree {
  let canvasParentId: string | null = null;
  let sectionsParentId: string | null = null;
  const sectionOrder: string[] = [];
  const seen = new Set<string>();

  const pushSection = (id: string) => {
    if (seen.has(id) || !isSectionNode(query, id)) return;
    seen.add(id);
    sectionOrder.push(id);
  };

  for (const nodeId of nodeIds) {
    if (isCanvasNode(query, nodeId)) {
      canvasParentId = nodeId;
    }
  }

  if (canvasParentId) {
    try {
      const canvas = query.node(canvasParentId).get();
      const ids = orderedChildIds(canvas.data).filter((id) => isSectionNode(query, id));
      if (ids.length > 0) {
        sectionsParentId = canvasParentId;
        for (const childId of ids) pushSection(childId);
      }
    } catch {
      /* ignore */
    }
  }

  if (sectionOrder.length === 0) {
    for (const nodeId of nodeIds) {
      try {
        if (!query.node(nodeId).isRoot()) continue;
        const root = query.node(nodeId).get();
        sectionsParentId = nodeId;
        for (const childId of orderedChildIds(root.data)) {
          if (!isCanvasNode(query, childId)) {
            pushSection(childId);
          }
        }
        break;
      } catch {
        /* ignore */
      }
    }
  }

  if (sectionOrder.length === 0) {
    for (const nodeId of nodeIds) {
      if (isSectionNode(query, nodeId)) pushSection(nodeId);
    }
    sectionOrder.sort((a, b) => {
      try {
        const pa = query.node(a).get().data;
        const pb = query.node(b).get().data;
        const parentA = (pa as { parent?: string }).parent ?? "";
        const parentB = (pb as { parent?: string }).parent ?? "";
        if (parentA !== parentB) return parentA.localeCompare(parentB);
        return 0;
      } catch {
        return 0;
      }
    });
  }

  const sections = sectionOrder
    .map((id, index) =>
      buildSectionEntry(query, id, index, sectionsParentId ?? canvasParentId ?? "")
    )
    .filter((s): s is LayerTreeSection => s !== null);

  return { canvasParentId, sectionsParentId, sections };
}
