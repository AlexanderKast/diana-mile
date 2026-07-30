/**
 * Pantalla de carga de la app, dentro del layout (header/footer siguen
 * montados): se ve al cambiar de pagina mientras el servidor arma la
 * siguiente. Mismo monograma del icono de instalacion, para que el arranque
 * en frio (splash del sistema operativo) y esto se sientan como una sola
 * transicion, no dos pantallas distintas.
 */
export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div
        aria-hidden
        className="motion-safe:animate-pulse font-display text-6xl italic text-dorado-oscuro"
      >
        M
      </div>
      <div className="h-[2px] w-10 bg-dorado motion-safe:animate-pulse" aria-hidden />
      <span className="sr-only">Cargando Milito Life Shop…</span>
    </div>
  );
}
