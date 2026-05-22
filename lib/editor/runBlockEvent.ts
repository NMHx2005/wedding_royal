import type { SharedEventItem } from "@/components/editor/utils/styleHelpers";

/** Run a block event action (shared by viewer and editor test). */
export function runBlockEvent(
  ev: SharedEventItem,
  options?: { onLightbox?: (src: string | null) => void }
) {
  const { action, params } = ev;
  switch (action) {
    case "link":
      if (params.url) window.open(params.url, "_blank", "noopener,noreferrer");
      break;
    case "call":
      if (params.phone) window.location.href = `tel:${params.phone}`;
      break;
    case "email":
      if (params.email) window.location.href = `mailto:${params.email}`;
      break;
    case "navigate-section":
      if (params.sectionId) {
        document.getElementById(params.sectionId)?.scrollIntoView({ behavior: "smooth" });
      }
      break;
    case "toggle-element":
      if (params.targetId) {
        const target = document.getElementById(params.targetId);
        if (target) {
          target.style.display = target.style.display === "none" ? "" : "none";
        }
      }
      break;
    case "copy-clipboard":
      if (params.text) void navigator.clipboard.writeText(params.text);
      break;
    case "open-lightbox":
      if (params.imageUrl) options?.onLightbox?.(params.imageUrl);
      break;
    case "open-popup": {
      const popup = params.popupId ? document.getElementById(params.popupId) : null;
      if (popup) popup.style.display = popup.style.display === "none" ? "" : "block";
      break;
    }
    case "add-to-calendar": {
      const { title, start, end, location } = params;
      if (!start) break;
      const startDate = new Date(start).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const endDate = end
        ? new Date(end).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
        : startDate;
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title ?? "Sự kiện")}&dates=${startDate}/${endDate}&location=${encodeURIComponent(location ?? "")}`;
      window.open(url, "_blank", "noopener,noreferrer");
      break;
    }
    default:
      break;
  }
}
