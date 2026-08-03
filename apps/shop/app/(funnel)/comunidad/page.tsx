import { obtenerUsuarioPlanPorSesion } from "@/lib/mi-plan";
import { getComunidadWhatsappLink } from "@/lib/community";
import { createAdminSupabaseClient } from "@diana-mile/shared/supabase/server";

/**
 * Landing publica de la comunidad gratuita de WhatsApp — mismo grupo (mismo
 * link, misma clave `comunidad_whatsapp_link` en `config`) que ya usa
 * /cuenta/(protegido)/comunidad para clientas con pedido entregado. Aca NO
 * hay gate: quien termino el quiz entra directo por aca, y quien llega sin
 * haber hecho nada tambien puede unirse — el grupo es gratis y publico, el
 * gate de esa otra pagina es solo el "bienvenida" post-entrega, no una
 * condicion para pertenecer a la comunidad.
 *
 * La personalizacion es opcional a proposito: si hay sesion de /mi-plan
 * activa (mismo patron de sesion por email que el resto del funnel, ver
 * lib/mi-plan.ts) saludamos por nombre; si no hay sesion la pagina funciona
 * exactamente igual, solo con un saludo generico.
 */
export default async function ComunidadPage() {
  const [usuario, link, coachingVisible] = await Promise.all([
    obtenerUsuarioPlanPorSesion(),
    getComunidadWhatsappLink(),
    esCoachingVisible(),
  ]);

  const primerNombre = usuario?.nombre?.trim().split(/\s+/)[0] ?? null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 pb-16 pt-4">
      <section className="flex flex-col gap-1">
        <h1 className="font-display text-2xl text-carbon">
          {primerNombre ? `${primerNombre}, esta es tu comunidad` : "La comunidad Milito Life"}
        </h1>
        <p className="text-sm text-carbon-suave">
          Un grupo gratuito de WhatsApp para acompañarte en tu rutina, no un canal de ventas.
        </p>
      </section>

      {/* 1. Que es */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-carbon">¿Qué es?</h2>
        <div className="rounded-2xl border border-arena bg-crema p-4">
          <p className="text-sm text-carbon">
            Un grupo de WhatsApp donde Milito y otras mujeres que están en su rutina de piel se
            acompañan. Es gratis, es para siempre, y no hace falta haber comprado nada para
            entrar.
          </p>
        </div>
      </section>

      {/* 2. Que pasa adentro */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-carbon">¿Qué pasa adentro?</h2>
        <ul className="flex flex-col gap-2.5">
          {CANALES.map((canal) => (
            <li
              key={canal.titulo}
              className="flex items-start gap-3 rounded-xl border border-arena p-3.5"
            >
              <span
                aria-hidden
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lila-suave text-base"
              >
                {canal.icono}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-carbon">{canal.titulo}</span>
                <span className="text-sm text-carbon-suave">{canal.descripcion}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Reglas de convivencia */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-carbon">Reglas del grupo</h2>
        <div className="rounded-2xl border border-arena p-4">
          <ul className="flex flex-col gap-2.5">
            {REGLAS.map((regla) => (
              <li key={regla} className="flex items-start gap-2 text-sm text-carbon">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dorado-oscuro"
                />
                {regla}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {coachingVisible && (
        // PENDIENTE (decision de negocio de Alexander, no tecnica): cuando
        // la comunidad tenga masa critica, reemplazar este `null` por la
        // seccion real que presenta el coaching pago (hoy "Circulo Milito"
        // solo existe en apps/shop/app/(funnel)/coach, nunca nombrado en
        // esta pagina publica). El interruptor es la clave `booleano`
        // `funnel_coaching_visible` en `config` (default 'false', ver
        // migracion 20260753000000_funnel_coaching_visible.sql) — activarla
        // es editar el valor desde /dashboard, no un deploy.
        null
      )}

      {/* 4. CTA de entrada */}
      <section className="sticky bottom-0 -mx-5 mt-2 flex flex-col gap-3 border-t border-arena bg-crema/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-sm">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-shine flex min-h-[44px] w-full items-center justify-center rounded-lg bg-dorado-oscuro px-6 py-3.5 text-center text-base font-semibold text-blanco shadow-[0_4px_14px_rgba(168,136,94,0.35)] transition-all hover:bg-dorado active:scale-[0.97]"
        >
          Unirme al grupo de WhatsApp →
        </a>
        <p className="text-center text-xs text-ceniza">
          Es gratis. Puedes salir del grupo cuando quieras.
        </p>
      </section>
    </div>
  );
}

const CANALES = [
  {
    icono: "📣",
    titulo: "Anuncios",
    descripcion: "Novedades y avisos importantes de Milito, sin spam.",
  },
  {
    icono: "🔥",
    titulo: "Reto activo",
    descripcion: "El reto de la semana y quienes están haciéndolo contigo.",
  },
  {
    icono: "💬",
    titulo: "Conversación",
    descripcion: "Dudas de rutina, consejos y acompañamiento entre todas.",
  },
  {
    icono: "✨",
    titulo: "Resultados",
    descripcion: "Lo que cada quien comparte de su propio proceso, cuando quiere.",
  },
] as const;

const REGLAS = [
  "Respeto siempre — cero comentarios sobre el cuerpo o la piel de otra persona.",
  "Nada de venta ni promoción de otras marcas o negocios dentro del grupo.",
  "Las dudas de salud se consultan con un profesional, no se resuelven aquí.",
  "Milito y su equipo pueden retirar a quien no respete estas reglas.",
] as const;

/**
 * Lee la clave booleana `funnel_coaching_visible` de `config` (mismo patron
 * de lectura clave/valor que `getComunidadWhatsappLink` en lib/community.ts,
 * ver esa funcion). Vive aca y no en lib/community.ts porque es exclusiva de
 * esta pagina: no hay otro caller todavia. Default `false` si la clave no
 * existe o Supabase no responde — el gancho apagado nunca puede reventar la
 * pagina.
 */
async function esCoachingVisible(): Promise<boolean> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("config")
      .select("valor")
      .eq("clave", "funnel_coaching_visible")
      .maybeSingle();

    return data?.valor === "true";
  } catch {
    return false;
  }
}
