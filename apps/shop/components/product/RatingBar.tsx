function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M10 2l6.5 2.5v5c0 4.5-2.9 7.4-6.5 8.5-3.6-1.1-6.5-4-6.5-8.5v-5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10l2 2 4-4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5 7h10l-.7 9.3a1 1 0 0 1-1 .7H6.7a1 1 0 0 1-1-.7L5 7z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 7V5.5a2.5 2.5 0 0 1 5 0V7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Cifra real de pedidos.entregados+, tal cual sale de Supabase (ver
 * lib/social-proof.ts) — nunca inventada. Se redondea hacia abajo a la
 * decena para no leerse como un contador sospechosamente exacto, salvo
 * cuando es menor a 10 (redondear daria "0+", peor que mostrar el numero
 * real).
 */
function formatPedidosCount(count: number): string {
  if (count < 10) return String(count);
  return `${Math.floor(count / 10) * 10}+`;
}

export function RatingBar({ pedidosCount = 0 }: { pedidosCount?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[13px]">
      {pedidosCount > 0 && (
        <>
          <span className="flex items-center gap-1.5 font-medium text-carbon">
            <BagIcon />
            {formatPedidosCount(pedidosCount)}{" "}
            {pedidosCount === 1 ? "pedido" : "pedidos"} de este producto
          </span>
          <span className="text-ceniza">·</span>
        </>
      )}
      <span className="flex items-center gap-1.5 font-medium text-carbon">
        <ShieldIcon />
        Compra contraentrega
      </span>
      <span className="text-ceniza">·</span>
      <span className="text-ceniza">Soporte por WhatsApp</span>
    </div>
  );
}
