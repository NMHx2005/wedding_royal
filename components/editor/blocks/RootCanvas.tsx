"use client";

import React, { CSSProperties } from "react";
import { useNode } from "@craftjs/core";

export interface RootCanvasProps {
  children?: React.ReactNode;
}

export function RootCanvas({ children }: RootCanvasProps) {
  const {
    connectors: { connect },
  } = useNode();
  const style: CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    position: "relative",
  };

  return (
    <div ref={(ref) => { if (ref) connect(ref); }} style={style}>
      {children}
    </div>
  );
}

RootCanvas.craft = {
  displayName: "Canvas",
  rules: {
    canDrag: () => false,
    canDrop: () => true,
    canMoveIn: (incoming: { data: { name?: string } }[]) =>
      incoming.length > 0 &&
      incoming.every((node) => node.data.name === "SectionBlock"),
  },
};
