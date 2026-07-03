function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  );
}

const FILAS = [
  "Producto 100% original Nu Skin",
  "Pagas al recibir, revisas antes de pagar",
  "Envío a toda Colombia en 24-72h",
  "Atención real por WhatsApp",
  "Garantía de reposición si llega mal",
];

export function ComparisonSection({ productName }: { productName: string }) {
  return (
    <section className="bg-crema py-12 px-6">
      <h2 className="font-display text-2xl text-carbon text-center mb-8">
        Por qué elegir {productName}
      </h2>

      <div className="max-w-md mx-auto rounded-2xl border border-arena bg-blanco overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-arena bg-crema px-4 py-3">
          <span />
          <span className="text-xs font-semibold text-dorado-oscuro text-center w-16">Nosotros</span>
          <span className="text-xs font-semibold text-ceniza text-center w-16">Otros</span>
        </div>

        {FILAS.map((fila, index) => (
          <div
            key={fila}
            className={
              "grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3.5" +
              (index !== FILAS.length - 1 ? " border-b border-arena" : "")
            }
          >
            <span className="text-sm text-carbon-suave leading-snug">{fila}</span>
            <span className="flex w-16 items-center justify-center text-dorado-oscuro">
              <CheckIcon />
            </span>
            <span className="flex w-16 items-center justify-center text-ceniza/60">
              <XIcon />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
