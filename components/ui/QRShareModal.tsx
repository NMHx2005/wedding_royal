"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title?: string;
};

export function QRShareModal({ open, onOpenChange, url, title = "Thiệp cưới" }: Props) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Đã copy link thiệp");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không copy được");
    }
  };

  const downloadSvg = () => {
    const svg = document.getElementById("qr-share-svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "thiep-qr.svg";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Đã tải QR");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">Chia sẻ thiệp</h3>
          <button
            type="button"
            className="text-sm text-neutral-500 hover:text-neutral-800"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </button>
        </div>
        <p className="mt-2 truncate text-xs text-neutral-500" title={url}>
          {url}
        </p>
        <div className="mt-4 flex justify-center rounded-xl bg-white p-4">
          <QRCodeSVG id="qr-share-svg" value={url} size={200} title={title} />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-mewedding-rose py-2 text-sm font-medium text-white"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Đã copy" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={downloadSvg}
            className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          >
            <Download className="h-4 w-4" />
            QR
          </button>
        </div>
      </div>
    </div>
  );
}
