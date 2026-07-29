/**
 * Separador sutil entre secciones que comparten el mismo fondo (o ninguno) y
 * por eso se sienten pegadas. Las secciones que ya cambian de color de fondo
 * no lo necesitan — el cambio de tono ya separa visualmente.
 */
export function SectionDivider({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "flex justify-center py-1" : "flex justify-center py-3"}>
      <div className="h-px w-16 bg-arena" />
    </div>
  );
}
