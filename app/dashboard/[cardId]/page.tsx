import { redirect } from "next/navigation";

export default async function CardIndexPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  redirect(`/dashboard/${cardId}/ho-so`);
}
