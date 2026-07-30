import Link from "next/link";
import PlantillasSecciones from "@/components/admin/editor/PlantillasSecciones";

export const metadata = {
  title: "Plantillas de secciones | Milito Life Shop Admin",
};

export const dynamic = "force-dynamic";

export default function PlantillasSeccionesPage() {
  return (
    <div>
      <Link
        href="/dashboard/landings"
        className="text-sm text-ceniza hover:text-carbon mb-4 inline-block"
      >
        ← Volver al rotador
      </Link>
      <h1 className="font-display text-2xl text-carbon mb-1">
        Plantillas de secciones
      </h1>
      <p className="text-sm text-carbon-suave mb-6 max-w-2xl">
        Sube una imagen de referencia por tipo de sección (capturas de layouts
        que te gusten). "Landing mágica" copia su composición y jerarquía — la
        marca, colores y textos siempre serán de Milito. Sin plantilla, el
        generador describe el layout por su cuenta.
      </p>
      <PlantillasSecciones />
    </div>
  );
}
