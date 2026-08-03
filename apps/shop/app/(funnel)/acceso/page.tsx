import { AccesoForm } from "./AccesoForm";

/**
 * Puerta de entrada al panel pre-venta. Llega con `?id={quiz_respuesta_id}`
 * desde el CTA de /resultado/[id] ("Accede a tu plan completo"), pero
 * tambien puede llegar SIN id (ej. si proxy.ts redirige aca a alguien sin
 * sesion que intento entrar directo a /mi-plan) — en ese caso el formulario
 * igual funciona, solo que la cuenta nueva no queda vinculada a ningun
 * diagnostico.
 */
export default async function AccesoPage({
  searchParams,
}: {
  // Next 16: searchParams siempre es una Promise, hay que await-earla.
  searchParams: Promise<{ id?: string; error?: string }>;
}) {
  const { id, error } = await searchParams;

  return (
    <AccesoForm
      quizRespuestaId={id ?? null}
      errorInicial={error === "link_invalido" ? "Ese link ya vencio o no es valido. Volve a intentar." : null}
    />
  );
}
