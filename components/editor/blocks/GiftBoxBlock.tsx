"use client";

import React, { CSSProperties } from "react";
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

export interface GiftBoxBlockProps extends SharedProps {
  bgColor?: string;
  titleColor?: string;
  textColor?: string;
  titleText?: string;
  subtitleText?: string;
  showQr?: boolean;
  top?: number;
  left?: number;
  width?: number;
  height?: number;
}

export function GiftBoxBlock({
  bgColor = "#1a1a2e",
  titleColor = "#ffffff",
  textColor = "#cccccc",
  titleText = "Hộp Mừng Cưới",
  subtitleText = "Cảm ơn tình cảm của mọi người ♥",
  showQr = true,
  top = 0,
  left = 0,
  width = 380,
  height = 300,
  ...sharedProps
}: GiftBoxBlockProps) {
  const { id, selected } = useNode((state) => ({
    id: state.id,
    selected: state.events.selected,
  }));
  const connectRef = useBlockConnect();
  const domId = sharedProps.elementId || undefined;
  const isViewer = useCraftViewerMode();


  const card = useEditorCard();
  const animAttrs = buildAnimationAttrs(sharedProps);
  const extraAttrs = buildExtraAttrs(sharedProps);
  const eventsAttr = buildEventsAttr(sharedProps);

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    top,
    ...blockLayout(isViewer, left, width),
    height,
    backgroundColor: bgColor,
    borderRadius: 12,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    outline: selected ? "2px solid #6366f1" : "none",
    cursor: selected ? "move" : "default",
    boxSizing: "border-box",
    ...buildSharedStyle(sharedProps),
  };

  const titleStyle: CSSProperties = {
    fontSize: 24,
    color: titleColor,
    fontFamily: "serif",
    textAlign: "center",
    margin: 0,
  };

  const textStyle: CSSProperties = {
    fontSize: 14,
    color: textColor,
    textAlign: "center",
    margin: 0,
  };

  const infoStyle: CSSProperties = {
    fontSize: 13,
    color: textColor,
    textAlign: "center",
    lineHeight: 1.6,
  };

  return (
    <div
      ref={connectRef}
      id={domId}
      data-node-id={id}
      style={wrapperStyle}
      data-block="giftbox"
      data-events={eventsAttr}
      {...animAttrs}
      {...extraAttrs}
    >
      <p style={titleStyle}>{titleText}</p>
      <p style={textStyle}>{subtitleText}</p>
      {(card.gift_bank_name || card.gift_account_number) && (
        <div style={infoStyle}>
          {card.gift_bank_name && <div>Ngân hàng: {card.gift_bank_name}</div>}
          {card.gift_account_number && (
            <div>Số TK: {card.gift_account_number}</div>
          )}
          {card.gift_account_name && (
            <div>Chủ TK: {card.gift_account_name}</div>
          )}
        </div>
      )}
      {showQr && card.gift_qr_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.gift_qr_url}
          alt="QR mừng cưới"
          style={{ width: 100, height: 100, borderRadius: 8, objectFit: "contain" }}
        />
      )}
    </div>
  );
}

GiftBoxBlock.craft = {
  displayName: "Hộp mừng cưới",
  props: {
    bgColor: "#1a1a2e",
    titleColor: "#ffffff",
    textColor: "#cccccc",
    titleText: "Hộp Mừng Cưới",
    subtitleText: "Cảm ơn tình cảm của mọi người ♥",
    showQr: true,
    top: 0,
    left: 0,
    width: 380,
    height: 300,
    ...SHARED_DEFAULTS,
  },
  rules: {
    canDrag: () => false,
  },
};
