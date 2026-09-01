// Reloj externo del VIGILANTE del repaso diario. Igual que /api/cron/agenda-diaria,
// pero unas horas más tarde: despierta el workflow "vigilar-agenda.yml", que es la
// red de seguridad del envío. Antes ese vigilante colgaba del `schedule` de GitHub
// Actions — justo el mecanismo que resultó poco fiable (saltaba días enteros; ver
// agenda-diaria/route.ts). Con eso, el respaldo compartía el fallo que debía tapar:
// el día que GitHub se saltaba el cron, el vigilante ni se despertaba a mirar. Ahora
// el reloj lo pone Vercel Cron (ver vercel.json), que es puntual, y el vigilante solo
// se ejecuta si hoy NO hubo un "Agenda diaria" con éxito — así que no duplica correos.
//
// Esta ruta solo pide a GitHub que lance el vigilante; la lógica de "¿corrió hoy? si
// no, disparar" sigue viviendo dentro de vigilar-agenda.yml y no se toca aquí.
//
// Seguridad: Vercel añade `Authorization: Bearer $CRON_SECRET` a las llamadas de cron
// cuando existe la env var CRON_SECRET. Comprobamos ese header para que nadie de fuera
// pueda disparar el vigilante.

export const dynamic = "force-dynamic";

const REPO = "zahirarmediavilla/agendina-scraper";
const WORKFLOW = "vigilar-agenda.yml";
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
