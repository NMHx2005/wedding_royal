"use client";

import React, { useCallback } from "react";
import { useEditor, Element } from "@craftjs/core";
import {
  Columns3,
  Type,
  ImageIcon,
  Timer,
  Minus,
  MousePointerClick,
  Heart,
  Gift,
  type LucideIcon,
} from "lucide-react";
import { SectionBlock } from "../blocks/SectionBlock";
import { TextBlock } from "../blocks/TextBlock";
import { ImageBlock } from "../blocks/ImageBlock";
import { CountdownBlock } from "../blocks/CountdownBlock";
import { DividerBlock } from "../blocks/DividerBlock";
import { ButtonBlock } from "../blocks/ButtonBlock";
import { IconBlock } from "../blocks/IconBlock";
import { GiftBoxBlock } from "../blocks/GiftBoxBlock";
import { generateElementId } from "../utils/elementId";

type ElementDef = {
  label: string;
  icon: LucideIcon;
  iconClass?: string;
  create: () => React.ReactElement;
};

const ELEMENTS: ElementDef[] = [
  {
    label: "Section",
    icon: Columns3,
    create: () => (
      <Element
        is={SectionBlock}
        canvas
        height={400}
        bgType="color"
        bgColor="#f9f5f0"
        elementId={generateElementId()}
      />
    ),
  },
  {
    label: "Văn bản",
    icon: Type,
    create: () => (
      <Element
        is={TextBlock}
        content="Văn bản"
        fontSize={24}
        color="#333333"
        elementId={generateElementId()}
      />
    ),
  },
  {
    label: "Hình ảnh",
    icon: ImageIcon,
    create: () => (
      <Element is={ImageBlock} width={300} height={200} elementId={generateElementId()} />
    ),
  },
  {
    label: "Đếm ngược",
    icon: Timer,
    create: () => <Element is={CountdownBlock} elementId={generateElementId()} />,
  },
  {
    label: "Đường kẻ",
    icon: Minus,
    create: () => (
      <Element is={DividerBlock} type="line" width={300} elementId={generateElementId()} />
    ),
  },
  {
    label: "Nút bấm",
    icon: MousePointerClick,
    create: () => (
      <Element is={ButtonBlock} label="Xem chỉ đường" elementId={generateElementId()} />
    ),
  },
  {
    label: "Icon",
    icon: Heart,
    iconClass: "text-rose-500",
    create: () => (
      <Element is={IconBlock} icon="heart" size={40} elementId={generateElementId()} />
    ),
  },
  {
    label: "Hộp quà",
    icon: Gift,
    iconClass: "text-amber-600",
    create: () => <Element is={GiftBoxBlock} elementId={generateElementId()} />,
  },
];

export function ElementLibrary() {
  const { connectors } = useEditor();

  const bindCreate = useCallback(
    (factory: () => React.ReactElement) => (ref: HTMLButtonElement | null) => {
      if (ref && !ref.dataset.craftBound) {
        ref.dataset.craftBound = "1";
        connectors.create(ref, factory());
      }
    },
    [connectors]
  );

  return (
    <div className="p-3 h-full overflow-y-auto">
      <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">
        Phần tử
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ELEMENTS.map((el) => {
          const Icon = el.icon;
          return (
            <button
              key={el.label}
              type="button"
              ref={bindCreate(el.create)}
              className="group flex flex-col items-center justify-center gap-2 p-3 bg-white hover:bg-indigo-50/80 hover:border-indigo-300 border border-gray-200 rounded-xl cursor-grab active:cursor-grabbing active:scale-[0.98] transition-all duration-150 text-center select-none shadow-sm hover:shadow"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-indigo-100 transition-colors">
                <Icon
                  className={`h-[18px] w-[18px] text-gray-500 group-hover:text-indigo-600 transition-colors ${el.iconClass ?? ""}`}
                  strokeWidth={1.75}
                />
              </span>
              <span className="text-[11px] font-medium text-gray-600 group-hover:text-indigo-700 leading-tight">
                {el.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
