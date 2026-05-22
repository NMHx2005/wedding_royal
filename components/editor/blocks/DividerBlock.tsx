"use client";

import React, { CSSProperties } from "react";
import { useNode } from "@craftjs/core";
import { useBlockConnect } from "../hooks/useBlockConnect";
import {
  SharedProps,
  SHARED_DEFAULTS,
  buildSharedStyle,
  buildAnimationAttrs,
  buildEventsAttr,
  buildExtraAttrs,
} from "../utils/styleHelpers";

export interface DividerBlockProps extends SharedProps {
  type?: "line" | "dots" | "wave" | "flowers";
  color?: string;
  height?: number;
  width?: number;
  top?: number;
  left?: number;
  opacity?: number;
}

function WaveSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <path
        d="M0,10 C30,0 50,20 80,10 C110,0 130,20 160,10 C180,3 195,15 200,10"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function FlowerSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 30" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <line x1="0" y1="15" x2="75" y2="15" stroke={color} strokeWidth="1" />
      <circle cx="100" cy="15" r="8" fill={color} opacity="0.3" />
      <circle cx="100" cy="15" r="5" fill={color} opacity="0.5" />
      <circle cx="100" cy="15" r="2" fill={color} />
      <line x1="125" y1="15" x2="200" y2="15" stroke={color} strokeWidth="1" />
      <circle cx="85" cy="15" r="4" fill={color} opacity="0.3" />
      <circle cx="115" cy="15" r="4" fill={color} opacity="0.3" />
    </svg>
  );
}

export function DividerBlock({
  type = "line",
  color = "#d4a8b3",
  height = 20,
  width = 300,
  top = 0,
  left = 0,
  opacity = 100,
  ...sharedProps
}: DividerBlockProps) {
  const { id, selected } = useNode((state) => ({
    id: state.id,
    selected: state.events.selected,
  }));
  const connectRef = useBlockConnect();
  const domId = sharedProps.elementId || undefined;


  const animAttrs = buildAnimationAttrs(sharedProps);
  const extraAttrs = buildExtraAttrs(sharedProps);
  const eventsAttr = buildEventsAttr(sharedProps);

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    top,
    left,
    width,
    height,
    opacity: opacity / 100,
    outline: selected ? "1px dashed #6366f1" : "none",
    cursor: selected ? "move" : "default",
    display: "flex",
    alignItems: "center",
    ...buildSharedStyle(sharedProps),
  };

  const lineStyle: CSSProperties = {
    width: "100%",
    height: 1,
    backgroundColor: color,
  };

  const dotsStyle: CSSProperties = {
    width: "100%",
    borderTop: `2px dotted ${color}`,
  };

  return (
    <div
      ref={connectRef}
      id={domId}
      data-node-id={id}
      style={wrapperStyle}
      data-block="divider"
      data-events={eventsAttr}
      {...animAttrs}
      {...extraAttrs}
    >
      {type === "line" && <div style={lineStyle} />}
      {type === "dots" && <div style={dotsStyle} />}
      {type === "wave" && <WaveSvg color={color} />}
      {type === "flowers" && <FlowerSvg color={color} />}
    </div>
  );
}

DividerBlock.craft = {
  displayName: "Đường kẻ",
  props: {
    type: "line",
    color: "#d4a8b3",
    height: 20,
    width: 300,
    top: 0,
    left: 0,
    opacity: 100,
    ...SHARED_DEFAULTS,
  },
  rules: {
    canDrag: () => false,
  },
};
