import { generateElementId } from "@/components/editor/utils/elementId";

type CraftNode = {
  type?: unknown;
  isCanvas?: boolean;
  props?: Record<string, unknown>;
  displayName?: string;
  custom?: Record<string, unknown>;
  hidden?: boolean;
  nodes?: string[];
  linkedNodes?: Record<string, string>;
  parent?: string;
};

/** Clone a Craft subtree with fresh node ids (for inserting saved templates). */
export function cloneSubtreeFromContent(
  content: Record<string, unknown>,
  rootNodeId: string,
  parentId: string
): { rootNodeId: string; nodes: Record<string, CraftNode> } {
  const idMap = new Map<string, string>();
  const nodes: Record<string, CraftNode> = {};

  const walk = (oldId: string, newId: string, newParent: string) => {
    const raw = content[oldId] as CraftNode | undefined;
    if (!raw) return;

    const node: CraftNode = JSON.parse(JSON.stringify(raw)) as CraftNode;
    node.parent = newParent;

    if (node.props && "elementId" in node.props) {
      node.props = { ...node.props, elementId: generateElementId() };
    }

    if (node.nodes?.length) {
      const newChildren: string[] = [];
      for (const childId of node.nodes) {
        const newChildId = generateElementId();
        idMap.set(childId, newChildId);
        newChildren.push(newChildId);
        walk(childId, newChildId, newId);
      }
      node.nodes = newChildren;
    }

    if (node.linkedNodes) {
      const linked: Record<string, string> = {};
      for (const [key, linkedOldId] of Object.entries(node.linkedNodes)) {
        let newLinkedId = idMap.get(linkedOldId);
        if (!newLinkedId) {
          newLinkedId = generateElementId();
          idMap.set(linkedOldId, newLinkedId);
          walk(linkedOldId, newLinkedId, newId);
        }
        linked[key] = newLinkedId;
      }
      node.linkedNodes = linked;
    }

    nodes[newId] = node;
  };

  const newRootId = generateElementId();
  idMap.set(rootNodeId, newRootId);
  walk(rootNodeId, newRootId, parentId);

  return { rootNodeId: newRootId, nodes };
}

export function getRootSectionIds(content: Record<string, unknown>): string[] {
  const root = content.ROOT as CraftNode | undefined;
  return root?.nodes ?? [];
}
