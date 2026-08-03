import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { QuizRunner } from "../../_components/quiz/QuizRunner";
import { esPuertaValida } from "@/lib/quiz/puertas";
import { COOKIE_VISITANTE, obtenerRespuestasPrevias } from "@/lib/quiz/previas";

export default async function TestPuertaPage({
  params,
}: {
  // Next 16: params siempre es una Promise, hay que await-earla.
  params: Promise<{ puerta: string }>;
}) {
  const { puerta } = await params;

  if (!esPuertaValida(puerta)) {
    notFound();
  }

  // Respuestas reutilizables de otros tests del mismo visitante (cookie
  // ml_visitante, emitida por proxy.ts) — QuizRunner las siembra y salta
  // esas preguntas. Best-effort: {} si no hay cookie o falla la consulta.
  const almacenCookies = await cookies();
  const visitanteId = almacenCookies.get(COOKIE_VISITANTE)?.value;
  const respuestasPrevias = await obtenerRespuestasPrevias(visitanteId);

  return <QuizRunner puertaId={puerta} respuestasPrevias={respuestasPrevias} />;
}
