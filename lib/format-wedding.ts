import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

export function formatWeddingDateVi(iso: string): string {
  try {
    return format(parseISO(iso), "EEEE, d 'tháng' M 'năm' yyyy", { locale: vi });
  } catch {
    return iso;
  }
}

export function daysSinceWedding(iso: string): number {
  try {
    const d = parseISO(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}
