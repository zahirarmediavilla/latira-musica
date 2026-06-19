import { getEvents } from "@/lib/events";
import { HomeView } from "@/components/HomeView";

// Render on each request so newly scraped events appear without waiting for a
// redeploy. The Supabase read is still cached ~5 min (lib/supabase.ts), so this
// stays cheap; it just stops the homepage from freezing at build-time data.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getEvents();
  return <HomeView events={events} />;
}
