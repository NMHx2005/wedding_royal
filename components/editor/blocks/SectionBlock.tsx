"use client";

import React, { CSSProperties, useCallback, useRef, useState } from "react";
import { useEditor, useNode } from "@craftjs/core";
import { useBlockConnect } from "../hooks/useBlockConnect";
import {
  SharedProps,
  SHARED_DEFAULTS,
  buildSharedStyle,
  buildAnimationAttrs,
  buildEventsAttr,
  buildExtraAttrs,
} from "../utils/styleHelpers";
import { buildFilterString } from "@/lib/cssFilter";

export interface SectionBlockProps extends SharedProps {
  height?: number;
  bgType?: "color" | "image" | "gradient" | "video";
  bgColor?: string;
  bgUrl?: string;
  bgSize?: "cover" | "contain" | "auto";
  bgPosition?: string;
  bgRepeat?: string;
  bgAttachment?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  videoUrl?: string;
  videoPoster?: string;
  // Overlay
  overlayType?: "none" | "color" | "gradient" | "image";
  overlayColor?: string;
  overlayOpacity?: number;
  overlayGradientFrom?: string;
  overlayGradientTo?: string;
  overlayGradientAngle?: number;
  overlayImageUrl?: string;
  overlayImageRepeat?: string;
  // Section separator
  separatorType?: "none" | "wave" | "slant" | "curve";
  separatorColor?: string;
  // Background filter (applies only to background layer, not content)
  bgBlendMode?: string;
  bgFilterContrast?: number;
  bgFilterBrightness?: number;
  bgFilterSaturate?: number;
  bgFilterGrayscale?: number;
  bgFilterOpacity?: number;
  bgFilterInvert?: number;
  bgFilterSepia?: number;
  bgFilterHueRotate?: number;
  children?: React.ReactNode;
}

const SEPARATOR_SVGS: Record<string, (color: string) => string> = {
  wave: (c) =>
    `<svg viewBox="0 0 1200 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,30 C300,60 900,0 1200,30 L1200,60 L0,60 Z" fill="${c}"/></svg>`,
  slant: (c) =>
    `<svg viewBox="0 0 1200 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><polygon points="0,60 1200,0 1200,60" fill="${c}"/></svg>`,
  curve: (c) =>
    `<svg viewBox="0 0 1200 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,60 Q600,0 1200,60 Z" fill="${c}"/></svg>`,
};

export function SectionBlock({
  height = 500,
  bgType = "color",
  bgColor = "#ffffff",
  bgUrl = "",
  bgSize = "cover",
  bgPosition = "center center",
  bgRepeat = "no-repeat",
  bgAttachment = "scroll",
  gradientFrom = "#ea6c88",
  gradientTo = "#f5a623",
  gradientAngle = 135,
  videoUrl = "",
  videoPoster = "",
  overlayType = "none",
  overlayColor = "#000000",
  overlayOpacity = 0,
  overlayGradientFrom = "#000000",
  overlayGradientTo = "#000000",
  overlayGradientAngle = 135,
  overlayImageUrl = "",
  overlayImageRepeat = "repeat",
  separatorType = "none",
  separatorColor = "#ffffff",
  bgBlendMode = "normal",
  bgFilterContrast = 100,
  bgFilterBrightness = 100,
  bgFilterSaturate = 100,
  bgFilterGrayscale = 0,
  bgFilterOpacity = 100,
  bgFilterInvert = 0,
  bgFilterSepia = 0,
  bgFilterHueRotate = 0,
  children,
  ...sharedProps
}: SectionBlockProps) {
  const isEditorMode = useEditor((state) => state.options.enabled);
  const {
    id,
    actions: { setProp },
    selected,
  } = useNode((state) => ({
    id: state.id,
    selected: state.events.selected,
  }));
  const connectRef = useBlockConnect();
  const resizeStartY = useRef(0);
  const resizeStartH = useRef(height);
  const [resizingHeight, setResizingHeight] = useState<number | null>(null);

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      resizeStartY.current = e.clientY;
      resizeStartH.current = height;

      const onMove = (ev: PointerEvent) => {
        const delta = ev.clientY - resizeStartY.current;
        const snapped = Math.round((resizeStartH.current + delta) / 10) * 10;
        const next = Math.max(120, snapped);
        setResizingHeight(next);
        setProp((p: SectionBlockProps) => {
          p.height = next;
        });
      };
      const onUp = () => {
        setResizingHeight(null);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [height, setProp]
  );

  const animAttrs = buildAnimationAttrs(sharedProps);
  const extraAttrs = buildExtraAttrs(sharedProps);
  const eventsAttr = buildEventsAttr(sharedProps);

  const sectionStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    maxWidth: isEditorMode ? undefined : "100%",
    boxSizing: "border-box",
    minHeight: height,
    overflowX: "clip",
    overflowY: "hidden",
    outline: selected ? "2px solid #6366f1" : "none",
    ...buildSharedStyle(sharedProps),
  };

  const getBgStyle = (): CSSProperties => {
    const base: CSSProperties = { position: "absolute", inset: 0, zIndex: 0 };
    switch (bgType) {
      case "image":
        return {
          ...base,
          backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined,
          backgroundSize: bgSize,
          backgroundPosition: bgPosition,
          backgroundRepeat: bgRepeat,
          backgroundAttachment: bgAttachment,
        };
      case "gradient":
        return {
          ...base,
          backgroundImage: `linear-gradient(${gradientAngle}deg, ${gradientFrom}, ${gradientTo})`,
        };
      default:
        return { ...base, backgroundColor: bgColor };
    }
  };

  // Backward compat: treat old overlayOpacity>0 (no overlayType) as color
  const effectiveOverlayType =
    overlayType === "none" && overlayOpacity > 0 ? "color" : overlayType;

  const getOverlayStyle = (): CSSProperties => {
    const base: CSSProperties = {
      position: "absolute",
      inset: 0,
      zIndex: 1,
      pointerEvents: "none",
    };
    switch (effectiveOverlayType) {
      case "color":
        return { ...base, backgroundColor: overlayColor, opacity: overlayOpacity / 100 };
      case "gradient":
        return {
          ...base,
          background: `linear-gradient(${overlayGradientAngle}deg, ${overlayGradientFrom}, ${overlayGradientTo})`,
        };
      case "image":
        return {
          ...base,
          backgroundImage: overlayImageUrl ? `url("${overlayImageUrl}")` : undefined,
          backgroundRepeat: overlayImageRepeat,
        };
      default:
        return base;
    }
  };

  const domId = sharedProps.elementId || undefined;

  return (
    <div
      ref={connectRef}
      id={domId}
      style={sectionStyle}
      data-block="section"
      data-node-id={id}
      data-events={eventsAttr}
      {...animAttrs}
      {...extraAttrs}
    >
      {/* Background layer */}
      {bgType !== "video" && (
        <div
          style={{
            ...getBgStyle(),
            filter: buildFilterString({
              filterContrast: bgFilterContrast,
              filterBrightness: bgFilterBrightness,
              filterSaturate: bgFilterSaturate,
              filterGrayscale: bgFilterGrayscale,
              filterOpacity: bgFilterOpacity,
              filterInvert: bgFilterInvert,
              filterSepia: bgFilterSepia,
              filterHueRotate: bgFilterHueRotate,
            }),
            mixBlendMode: bgBlendMode as React.CSSProperties["mixBlendMode"],
          }}
        />
      )}
      {bgType === "video" && videoUrl && (
        <video
          src={videoUrl}
          poster={videoPoster || undefined}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
      )}

      {/* Overlay layer */}
      {effectiveOverlayType !== "none" && <div style={getOverlayStyle()} />}

      {/* Content */}
      <div
        className="section-content-layer"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          minHeight: height,
          overflowX: "clip",
          overflowY: "hidden",
        }}
      >
        {children}
      </div>

      {/* Section separator (bottom) */}
      {separatorType !== "none" && SEPARATOR_SVGS[separatorType] && (
        <div
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, zIndex: 10 }}
          dangerouslySetInnerHTML={{
            __html: SEPARATOR_SVGS[separatorType](separatorColor),
          }}
        />
      )}

      {/* Height resize handle */}
      {selected && !sharedProps.locked && (
        <div
          role="separator"
          aria-label="Kéo để đổi chiều cao section"
          onPointerDown={onResizePointerDown}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 12,
            cursor: "ns-resize",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 48,
              height: 4,
              borderRadius: 2,
              background: "#6366f1",
              opacity: 0.8,
            }}
          />
          {resizingHeight !== null && (
            <span
              style={{
                position: "absolute",
                right: 8,
                bottom: 14,
                background: "#6366f1",
                color: "#fff",
                fontSize: 10,
                padding: "1px 5px",
                borderRadius: 4,
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              {resizingHeight}px
            </span>
          )}
        </div>
      )}
    </div>
  );
}

SectionBlock.craft = {
  displayName: "Section",
  props: {
    height: 500,
    bgType: "color",
    bgColor: "#ffffff",
    bgUrl: "",
    bgSize: "cover",
    bgPosition: "center center",
    bgRepeat: "no-repeat",
    bgAttachment: "scroll",
    gradientFrom: "#ea6c88",
    gradientTo: "#f5a623",
    gradientAngle: 135,
    videoUrl: "",
    videoPoster: "",
    overlayType: "none",
    overlayColor: "#000000",
    overlayOpacity: 0,
    overlayGradientFrom: "#000000",
    overlayGradientTo: "#000000",
    overlayGradientAngle: 135,
    overlayImageUrl: "",
    overlayImageRepeat: "repeat",
    separatorType: "none",
    separatorColor: "#ffffff",
    bgBlendMode: "normal",
    bgFilterContrast: 100,
    bgFilterBrightness: 100,
    bgFilterSaturate: 100,
    bgFilterGrayscale: 0,
    bgFilterOpacity: 100,
    bgFilterInvert: 0,
    bgFilterSepia: 0,
    bgFilterHueRotate: 0,
    ...SHARED_DEFAULTS,
  },
  rules: {
    canDrag: () => false,
    canDrop: () => true,
    canMoveIn: (incoming: { data: { name?: string } }[]) =>
      incoming.every((node) => node.data.name !== "SectionBlock"),
  },
  related: {
    toolbar: () =>
      import("../panels/SectionToolbar").then((m) => m.SectionToolbar),
  },
};
