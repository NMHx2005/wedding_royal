import { InvitationPageShell } from "@/components/invitation/InvitationPageShell";

export default function ThiepLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="invitation-page mx-auto min-h-screen w-full max-w-[100vw] overflow-x-clip">
      <InvitationPageShell>{children}</InvitationPageShell>
    </div>
  );
}
