import { orderedChildIds } from "./layerTree";

type SerializedNode = {
  nodes?: string[];
  linkedNodes?: Record<string, string>;
};

type CraftQuery = {
  serialize: () => string;
  node: (id: string) => {
    get: () => { data: SerializedNode };
  };
};

type CraftActions = {
  deserialize: (json: string) => void;
  move: (id: string, parentId: string, index: number) => void;
};

/** Reorder children under a parent (works for nodes + linkedNodes). */
export function reorderParentChildren(
  actions: CraftActions,
  query: CraftQuery,
  parentId: string,
  newOrder: string[]
): boolean {
  if (!parentId || newOrder.length === 0) return false;

  try {
    const parentData = query.node(parentId).get().data;
    const current = orderedChildIds(parentData);
    if (current.join("|") === newOrder.join("|")) return true;

    const oldNodes = parentData.nodes ?? [];
    const oldLinked = { ...(parentData.linkedNodes ?? {}) };
    const linkedKeyById = new Map<string, string>();
    for (const [key, id] of Object.entries(oldLinked)) {
      linkedKeyById.set(id, key);
    }

    const allLinked = newOrder.every((id) => !oldNodes.includes(id));
    const allNodes =
      newOrder.every((id) => oldNodes.includes(id)) &&
      Object.keys(oldLinked).length === 0;

    if (allNodes) {
      const movingId = newOrder.find((id, i) => current[i] !== id);
      if (movingId) {
        const newIndex = newOrder.indexOf(movingId);
        actions.move(movingId, parentId, newIndex);
        return true;
      }
    }

    if (allLinked && Object.keys(oldLinked).length === newOrder.length) {
      const state = JSON.parse(query.serialize()) as Record<string, SerializedNode>;
      const parent = state[parentId];
      if (!parent) return false;
      const newLinked: Record<string, string> = {};
      for (const id of newOrder) {
        const key = linkedKeyById.get(id) ?? id;
        newLinked[key] = id;
      }
      parent.linkedNodes = newLinked;
      parent.nodes = [];
      actions.deserialize(JSON.stringify(state));
      return true;
    }

    const state = JSON.parse(query.serialize()) as Record<string, SerializedNode>;
    const parent = state[parentId];
    if (!parent) return false;

    const newNodes: string[] = [];
    const newLinked: Record<string, string> = {};
    let fallback = 0;

    for (const id of newOrder) {
      if (oldNodes.includes(id)) {
        newNodes.push(id);
      } else {
        const key = linkedKeyById.get(id) ?? `linked-${fallback++}`;
        newLinked[key] = id;
      }
    }

    parent.nodes = newNodes;
    parent.linkedNodes = newLinked;
    actions.deserialize(JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
