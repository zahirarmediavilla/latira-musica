import { getEvents } from "@/lib/events";
import { HomeView } from "@/components/HomeView";

export default async function HomePage() {
  const events = await getEvents();
  return <HomeView events={events} />;
}
