"use client";

import React from "react";
import { useEditor, Element, useNode } from "@craftjs/core";
import { SectionBlock } from "../blocks/SectionBlock";
import { generateElementId } from "../utils/elementId";
import { safeDeleteNode } from "@/lib/editor/safeDeleteNode";

export function SectionToolbar() {
  const { id } = useNode();
  const { actions, query } = useEditor();

  const parentId = query.node(id).get().data.parent;

  const siblingIndex = () => {
    if (!parentId) return 0;
    const parent = query.node(parentId).get();
    const nodes = parent.data.nodes ?? [];
    const idx = nodes.indexOf(id);
    return idx >= 0 ? idx + 1 : nodes.length;
  };

  const addSection = () => {
    if (!parentId) return;
    const tree = query
      .parseReactElement(
        <Element
          is={SectionBlock}
          canvas
          height={400}
          bgType="color"
          bgColor="#f9f5f0"
          elementId={generateElementId()}
        />
      )
      .toNodeTree();
    actions.addNodeTree(tree, parentId, siblingIndex());
  };

  const duplicateSection = () => {
    if (!parentId) return;
    try {
      const nodeTree = query.node(id).toNodeTree();
      const root = nodeTree.nodes[nodeTree.rootNodeId];
      const props = root?.data?.props as Record<string, unknown> | undefined;
      if (props && root?.data) {
        root.data.props = { ...props, elementId: generateElementId() };
      }
      actions.addNodeTree(nodeTree, parentId, siblingIndex());
    } catch {
      /* ignore */
    }
  };

  const deleteSection = () => {
    safeDeleteNode(actions, query, id);
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50">
      <button
        type="button"
        onClick={addSection}
        className="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
      >
        + Section
      </button>
      <button
        type="button"
        onClick={duplicateSection}
        className="text-xs px-2 py-1 rounded text-gray-600 hover:bg-gray-100"
      >
        Nhân bản
      </button>
      <button
        type="button"
        onClick={deleteSection}
        className="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-50 ml-auto"
      >
        Xóa section
      </button>
    </div>
  );
}
