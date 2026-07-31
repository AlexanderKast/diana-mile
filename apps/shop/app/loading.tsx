import { MarcaGota } from "@/lib/logo-milito";

/**
 * Pantalla de carga de la app, dentro del layout (header/footer siguen
 * montados): se ve al cambiar de pagina mientras el servidor arma la
 * siguiente. Misma marca del icono de instalacion (MarcaGota, no una
 * version aparte), para que el arranque en frio (splash del sistema
 * operativo) y esto se sientan como una sola transicion.
 */
export default function RootLoading() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center gap-4">
      <MarcaGota
        size={200}
        colores={{ fondo: "#FAFAF8" }}
        className="h-[42vw] w-[42vw] max-h-60 max-w-60 motion-safe:animate-pulse"
      />
      <span className="sr-only">Cargando Milito Life Shop…</span>
    </div>
  );
}
