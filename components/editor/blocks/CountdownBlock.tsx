"use client";

import React, { useEffect, useState, CSSProperties } from "react";
import { useNode } from "@craftjs/core";
import { useBlockConnect } from "../hooks/useBlockConnect";
import { blockLayout } from "@/lib/editor/viewerLayout";
import { useEditorCard } from "../EditorContext";
import { useCraftViewerMode } from "../hooks/useCraftViewerMode";
import {
  SharedProps,
  SHARED_DEFAULTS,
  buildSharedStyle,
  buildAnimationAttrs,
  buildEventsAttr,
  buildExtraAttrs,
} from "../utils/styleHelpers";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export interface CountdownBlockProps extends SharedProps {
  primaryColor?: string;
  textColor?: string;
  labelColor?: string;
  digitFontSize?: number;
  top?: number;
  left?: number;
  width?: number;
}

export function CountdownBlock({
  primaryColor = "#ea6c88",
  textColor = "#ffffff",
  labelColor = "#666666",
  digitFontSize = 30,
  top = 0,
  left = 0,
  width = 360,
  ...sharedProps
}: CountdownBlockProps) {
  const { id, selected } = useNode((state) => ({
    id: state.id,
    selected: state.events.selected,
  }));
  const connectRef = useBlockConnect();
  const domId = sharedProps.elementId || undefined;
  const isViewer = useCraftViewerMode();


  const card = useEditorCard();
  // Placeholder until mount — avoids SSR/client mismatch (Date.now() differs by seconds).
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const tick = () => setTimeLeft(calcTimeLeft(card.wedding_date));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [card.wedding_date]);

  const animAttrs = buildAnimationAttrs(sharedProps);
  const extraAttrs = buildExtraAttrs(sharedProps);
  const eventsAttr = buildEventsAttr(sharedProps);

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    top,
    ...blockLayout(isViewer, left, width),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
    gap: 8,
    boxSizing: "border-box",
    outline: selected ? "2px solid #6366f1" : "none",
    cursor: selected ? "move" : "default",
    ...buildSharedStyle(sharedProps),
  };

  const digitBoxStyle: CSSProperties = {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: "1 1 0",
    minWidth: 0,
    padding: "4px 8px",
    background: primaryColor,
    borderRadius: 6,
    boxSizing: "border-box",
  };

  const digitStyle: CSSProperties = {
    fontSize: digitFontSize,
    color: textColor,
    WebkitTextFillColor: textColor,
    fontWeight: "bold",
    lineHeight: 1,
  };

  const labelStyle: CSSProperties = {
    fontSize: 13,
    color: labelColor,
    WebkitTextFillColor: labelColor,
    marginTop: 2,
  };

  const items = [
    { value: timeLeft.days, label: "Ngày" },
    { value: timeLeft.hours, label: "Giờ" },
    { value: timeLeft.minutes, label: "Phút" },
    { value: timeLeft.seconds, label: "Giây" },
  ];

  return (
    <div
      ref={connectRef}
      id={domId}
      data-node-id={id}
      style={wrapperStyle}
      data-block="countdown"
      data-events={eventsAttr}
      {...animAttrs}
      {...extraAttrs}
    >
      {items.map(({ value, label }) => (
        <div key={label} style={digitBoxStyle}>
          <span style={digitStyle}>{String(value).padStart(2, "0")}</span>
          <span style={labelStyle}>{label}</span>
        </div>
      ))}
    </div>
  );
}

CountdownBlock.craft = {
  displayName: "Đếm ngược",
  props: {
    primaryColor: "#ea6c88",
    textColor: "#ffffff",
    labelColor: "#666666",
    digitFontSize: 30,
    top: 0,
    left: 0,
    width: 360,
    ...SHARED_DEFAULTS,
  },
  rules: {
    canDrag: () => false,
  },
};
