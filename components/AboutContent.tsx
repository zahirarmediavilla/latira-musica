import { BackHeader } from "./BackHeader";
import { AnalyticsEvent } from "@/lib/analytics";

// Shared "about / info" content, rendered both as a full page (direct visit to
// /info) and inside the intercepting-route overlay that slides in over the home.
// Mirrors EventDetail: the close header (✕) sits at the top, the copy below it.
export function AboutContent() {
  return (
    <>
      <BackHeader icon="close" label="Cerrar" />

      <div className="space-y-6 px-5 pb-10 pt-2 text-lg leading-relaxed text-ink">
        <p>
          LaTira quiere ser el lugar donde se puedan ver todos los eventos
          musicales de Asturias, del género que sea. La idea es sencilla: enseñar
          todo lo que se mueve aquí, mucho más de lo que parece.
        </p>
        <p>
          Si quieres saber más, contarnos algo o que incluyamos un evento en la
          lista, escribe a{" "}
          <a
            href="mailto:hola@latira.org"
            className="font-medium underline"
            data-umami-event={AnalyticsEvent.clicContactoEmail}
          >
            hola@latira.org
          </a>
        </p>
        <p>
          Detrás de cada concierto hay mucha gente. Quienes hacen la música y se
          suben a tocarla, que son los primeros a los que hay que dar las gracias.
          Están los bares, las salas, las promotoras y quienes se ponen a
          organizar, liándose la manta a la cabeza para que podamos disfrutar y
          bailar.
        </p>
        <p>
          Cada evento lleva enlazada su fuente, siempre que sea posible. Quien
          difunde también hace un trabajo, y es justo que se vea de dónde viene la
          información.
        </p>
        <p>
          Esto es un proyecto sin ánimo de lucro y con la privacidad por delante.
          Los datos que se registran son anónimos y no se van a vender a nadie.
          Nunca.
        </p>
      </div>
    </>
  );
}
