import type { ReactNode } from "react";

/**
 * Public /thiep: card max 390px, centered horizontally on wide screens.
 */
export function InvitationPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="invitation-shell">
      <div className="invitation-shell__frame">{children}</div>
    </div>
  );
}
