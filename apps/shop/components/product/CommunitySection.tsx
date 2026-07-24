const PERKS = [
  { label: "Contenido exclusivo", desc: "Tips y rutinas que no publicamos en redes." },
  { label: "Descuentos VIP", desc: "Acceso anticipado a promos y lanzamientos." },
  { label: "Soporte directo", desc: "Resuelve tus dudas con acompañamiento real." },
  { label: "Comunidad real", desc: "Retos, resultados y experiencias de otras clientas." },
];

export function CommunitySection() {
  return (
    <section className="flex flex-col items-center gap-6 bg-lila-suave px-6 py-12 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="rounded-full bg-morado px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-blanco">
          Al recibir tu pedido
        </span>
        <h2 className="font-display text-2xl text-carbon">
          Entras gratis a la Comunidad Milito Life
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-carbon-suave">
          No es solo el producto. Cuando tu pedido llegue, te unes a un grupo de WhatsApp con
          acompañamiento real.
        </p>
      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-3 text-left">
        {PERKS.map((perk) => (
          <div key={perk.label} className="rounded-xl border border-morado/20 bg-blanco p-3">
            <p className="text-xs font-bold text-morado-oscuro">{perk.label}</p>
            <p className="mt-1 text-[11px] leading-snug text-carbon-suave">{perk.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
