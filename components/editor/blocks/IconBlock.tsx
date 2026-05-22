"use client";

import React, { CSSProperties } from "react";
import { useNode } from "@craftjs/core";
import { useBlockConnect } from "../hooks/useBlockConnect";
import { blockLayout } from "@/lib/editor/viewerLayout";
import {
  SharedProps,
  SHARED_DEFAULTS,
  buildSharedStyle,
  buildAnimationAttrs,
  buildEventsAttr,
  buildExtraAttrs,
} from "../utils/styleHelpers";
import { useCraftViewerMode } from "../hooks/useCraftViewerMode";

export type IconType = "heart" | "ring" | "flower" | "dove" | "star" | "music";

const ICONS: Record<IconType, React.ReactNode> = {
  heart: (
    <svg viewBox="0 0 512 512" fill="currentColor" style={{ width: "100%", height: "100%" }}>
      <path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z" />
    </svg>
  ),
  ring: (
    <svg viewBox="0 0 100 100" fill="currentColor" style={{ width: "100%", height: "100%" }}>
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="none" />
      <circle cx="50" cy="20" r="8" />
    </svg>
  ),
  flower: (
    <svg viewBox="0 0 100 100" fill="currentColor" style={{ width: "100%", height: "100%" }}>
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="30"
          rx="8"
          ry="18"
          transform={`rotate(${angle} 50 50)`}
          opacity="0.8"
        />
      ))}
      <circle cx="50" cy="50" r="10" />
    </svg>
  ),
  dove: (
    <svg viewBox="0 0 100 100" fill="currentColor" style={{ width: "100%", height: "100%" }}>
      <path d="M20,50 Q35,30 55,35 L80,25 L65,45 Q75,55 60,60 L35,70 Q25,65 20,50z" />
      <circle cx="68" cy="28" r="5" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 100 100" fill="currentColor" style={{ width: "100%", height: "100%" }}>
      <polygon points="50,10 61,35 90,35 68,57 76,85 50,70 24,85 32,57 10,35 39,35" />
    </svg>
  ),
  music: (
    <svg viewBox="0 0 512 512" fill="currentColor" style={{ width: "100%", height: "100%" }}>
      <path d="M470.38 1.51L168.4 96A32 32 0 0 0 160 128v51.93A48.66 48.66 0 0 0 128 176c-44.18 0-80 35.82-80 80s35.82 80 80 80 80-35.82 80-80V214.84l270.38-88.17A32 32 0 0 0 512 96V32c0-20.26-19.92-35.15-41.62-30.49z" />
    </svg>
  ),
};

function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

export interface IconBlockProps extends SharedProps {
  icon?: IconType;
  customSvg?: string;
  size?: number;
  /** Legacy preset JSON uses width/height instead of size. */
  width?: number;
  height?: number;
  color?: string;
  top?: number;
  left?: number;
  rotate?: number;
  opacity?: number;
}

export function IconBlock({
  icon = "heart",
  customSvg = "",
  size,
  width,
  height,
  color = "#ea6c88",
  top = 0,
  left = 0,
  rotate = 0,
  opacity = 100,
  ...sharedProps
}: IconBlockProps) {
  const resolvedSize = size ?? width ?? height ?? 40;
  const { id, selected } = useNode((state) => ({
    id: state.id,
    selected: state.events.selected,
  }));
  const connectRef = useBlockConnect();
  const domId = sharedProps.elementId || undefined;
  const isViewer = useCraftViewerMode();
  const layout = blockLayout(isViewer, left, resolvedSize);

  const animAttrs = buildAnimationAttrs(sharedProps);
  const extraAttrs = buildExtraAttrs(sharedProps);
  const eventsAttr = buildEventsAttr(sharedProps);

  const sharedStyle = buildSharedStyle(sharedProps);
  const existingTransform = sharedStyle.transform;
  const iconTransform = rotate !== 0 ? `rotate(${rotate}deg)` : undefined;
  const combinedTransform =
    [existingTransform, iconTransform].filter(Boolean).join(" ") || undefined;

  const style: CSSProperties = {
    position: "absolute",
    top,
    left: layout.left,
    width: layout.width,
    height: layout.width,
    maxWidth: layout.maxWidth,
    color,
    opacity: opacity / 100,
    outline: selected ? "1px dashed #6366f1" : "none",
    cursor: selected ? "move" : "default",
    ...sharedStyle,
    transform: combinedTransform,
  };

  const trimmedSvg = customSvg?.trim();
  const useCustom = trimmedSvg && trimmedSvg.includes("<svg");

  return (
    <div
      ref={connectRef}
      id={domId}
      style={style}
      data-block="icon"
      data-node-id={id}
      data-events={eventsAttr}
      {...animAttrs}
      {...extraAttrs}
      data-custom-class={sharedProps.customClass || undefined}
    >
      {useCustom ? (
        <div
          style={{ width: "100%", height: "100%" }}
          dangerouslySetInnerHTML={{ __html: sanitizeSvg(trimmedSvg) }}
        />
      ) : (
        ICONS[icon]
      )}
    </div>
  );
}

IconBlock.craft = {
  displayName: "Icon",
  props: {
    icon: "heart",
    customSvg: "",
    size: 40,
    color: "#ea6c88",
    top: 0,
    left: 0,
    rotate: 0,
    opacity: 100,
    ...SHARED_DEFAULTS,
  },
  rules: {
    canDrag: () => false,
  },
};
