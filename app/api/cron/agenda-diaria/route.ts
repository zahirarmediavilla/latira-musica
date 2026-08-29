// Reloj externo del repaso diario. El scheduler `schedule` de GitHub Actions es
// best-effort y para el repo privado agendina-scraper NUNCA saltó puntual (30 min
// a 3,5 h tarde a diario) y acabó dejando de disparar días enteros (27-29 ago
// 2026). En cambio, disparar el workflow por la API (workflow_dispatch) SÍ es
// fiable. Así que el reloj lo pone Vercel Cron (ver vercel.json), que llama a esta
// ruta cada mañana, y esta ruta solo hace una cosa: pedirle a GitHub que lance
// "Agenda diaria". La ejecución (scraper + correo) sigue corriendo en GitHub.
//
// Seguridad: Vercel añade `Authorization: Bearer $CRON_SECRET` a las llamadas de
// cron cuando existe la env var CRON_SECRET. Comprobamos ese header para que nadie
// de fuera pueda disparar el repaso.

export const dynamic = "force-dynamic";

const REPO = "zahirarmediavilla/agendina-scraper";
const WORKFLOW = "agenda-diaria.yml";
const REF = "main";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = process.env.GH_DISPATCH_TOKEN;
  if (!token) {
    return Response.json(
      { ok: false, error: "GH_DISPATCH_TOKEN sin configurar en Vercel" },
      { status: 500 },
    );
  }

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: REF }),
    },
  );

  // GitHub responde 204 No Content cuando acepta el disparo.
  if (res.status === 204) {
    return Response.json({ ok: true, dispatched: WORKFLOW, ref: REF });
  }

  const detail = await res.text();
  return Response.json(
    { ok: false, status: res.status, detail },
    { status: 502 },
  );
}
