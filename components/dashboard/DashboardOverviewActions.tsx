"use client";

import { useState } from "react";
import { toast } from "sonner";
import { QRShareModal } from "@/components/ui/QRShareModal";

export function DashboardOverviewActions({ inviteUrl, slug }: { inviteUrl: string; slug: string }) {
  const [qrOpen, setQrOpen] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Đã copy link thiệp");
    } catch {
      toast.error("Không copy được");
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Thiệp cưới", url: inviteUrl });
      } catch {
        /* user cancelled */
      }
    } else {
      void copy();
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={share}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        Chia sẻ thiệp
      </button>
      <button
        type="button"
        onClick={copy}
        className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium"
      >
        Copy link
      </button>
      <button
        type="button"
        onClick={() => setQrOpen(true)}
        className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium"
      >
        QR
      </button>
      <QRShareModal open={qrOpen} onOpenChange={setQrOpen} url={inviteUrl} title={`Thiệp /${slug}`} />
    </div>
  );
}
