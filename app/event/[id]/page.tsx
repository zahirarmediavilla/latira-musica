import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventById } from "@/lib/events";
import { EventDetail } from "@/components/EventDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ev = await getEventById(id);
  return { title: ev ? `${ev.name} — LaTira` : "LaTira" };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ev = await getEventById(id);
  if (!ev) notFound();

  return (
    <div className="min-h-dvh pb-44">
      <EventDetail event={ev} />
    </div>
  );
}
