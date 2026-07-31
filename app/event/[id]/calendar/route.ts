import { getEventById } from "@/lib/events";
import { eventPlaceLabel } from "@/lib/seo";
import { buildIcs } from "@/lib/ics";

// Serves the event as a text/calendar document. iOS Safari opens the native
// "Add to Calendar" sheet when it fetches this URL (it recognises the MIME
// type); Android/desktop download the .ics and hand it to the default calendar.
// This is what the "Añadir a calendario" link points at — see DetailActions.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const ev = await getEventById(id);
  if (!ev) return new Response("Not found", { status: 404 });

  const ics = buildIcs({
    name: ev.name,
    date: ev.date,
    hour: ev.hour,
    place: eventPlaceLabel(ev),
    description: ev.description,
  });

  const filename = `${ev.name.slice(0, 40).replace(/[^\w\s-]/g, "").trim() || "evento"}.ics`;

  return new Response(ics, {
    headers: {
      // charset + inline: iOS shows the add-event sheet instead of downloading.
      "Content-Type": "text/calendar; charset=utf-8; method=PUBLISH",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
