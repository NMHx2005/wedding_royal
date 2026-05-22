import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Template Editor | Admin",
};

export default function TemplateEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      {children}
    </div>
  );
}
