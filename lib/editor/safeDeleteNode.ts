type SerializedNode = {
  parent?: string | null;
  nodes?: string[];
  linkedNodes?: Record<string, string>;
};

type CraftQuery = {
  node: (id: string) => {
    isDeletable: () => boolean;
    isRoot: () => boolean;
    get: () => { data: { parent?: string | null } };
  };
  serialize: () => string;
};

type CraftActions = {
  delete: (id: string) => void;
  deserialize: (json: string) => void;
  selectNode: (id: string) => void;
};

function removeNodeFromSerialized(
  state: Record<string, SerializedNode>,
  nodeId: string
): void {
  const node = state[nodeId];
  if (!node) return;

  for (const childId of [...(node.nodes ?? [])]) {
    removeNodeFromSerialized(state, childId);
  }
  for (const childId of Object.values(node.linkedNodes ?? {})) {
    removeNodeFromSerialized(state, childId);
  }

  const parentId = node.parent;
  if (parentId && state[parentId]) {
    const parent = state[parentId];
    if (parent.nodes) {
      parent.nodes = parent.nodes.filter((id) => id !== nodeId);
    }
    if (parent.linkedNodes) {
      const next: Record<string, string> = { ...parent.linkedNodes };
      for (const [key, val] of Object.entries(next)) {
        if (val === nodeId) delete next[key];
      }
      parent.linkedNodes = next;
    }
  }

  delete state[nodeId];
}

/** Delete a node; falls back to deserialize when Craft blocks linked/top-level nodes. */
export function safeDeleteNode(
  actions: CraftActions,
  query: CraftQuery,
  nodeId: string
): boolean {
  if (!nodeId || nodeId === "ROOT" || nodeId === "canvas-ROOT") return false;

  try {
    if (query.node(nodeId).isRoot()) return false;
  } catch {
    return false;
  }

  try {
    if (query.node(nodeId).isDeletable()) {
      actions.delete(nodeId);
      return true;
    }
  } catch {
    /* use fallback */
  }

  try {
    const state = JSON.parse(query.serialize()) as Record<string, SerializedNode>;
    if (!state[nodeId]) return false;
    removeNodeFromSerialized(state, nodeId);
    actions.deserialize(JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function canDeleteNode(query: CraftQuery, nodeId: string): boolean {
  if (!nodeId || nodeId === "ROOT" || nodeId === "canvas-ROOT") return false;
  try {
    return !query.node(nodeId).isRoot();
  } catch {
    return false;
  }
}
