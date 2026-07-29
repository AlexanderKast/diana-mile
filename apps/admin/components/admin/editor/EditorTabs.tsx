"use client";

import { useState } from "react";
import type { ProductLandingContent } from "@diana-mile/shared/types";
import type { VarianteResumen } from "@/lib/shopify-catalogo";
import ConstructorLandingForm from "@/components/admin/constructor/ConstructorLandingForm";
import EditorVisual from "./EditorVisual";

type EditorTabsProps = {
  handle: string;
  productoTitulo: string;
  productoImagenUrl: string | null;
  contenidoInicial: ProductLandingContent | null;
  variantes: VarianteResumen[];
  saveEndpoint?: string;
  modoVariante?: boolean;
};

/**
 * Editor de landing con dos vistas durante el rollout del constructor
 * visual: "Visual" (Puck, default) y "Clasico" (formulario por secciones).
 * Ambas guardan en el mismo endpoint; el clasico se elimina cuando todas
 * las landings esten migradas.
 */
export default function EditorTabs({
  handle,
  productoTitulo,
  productoImagenUrl,
  contenidoInicial,
  variantes,
  saveEndpoint,
  modoVariante = false,
}: EditorTabsProps) {
  const [vista, setVista] = useState<"visual" | "clasico">("visual");
  const endpoint = saveEndpoint ?? `/api/admin/productos/${handle}`;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(
          [
            { id: "visual", label: "🎨 Diseño visual" },
            { id: "clasico", label: "Constructor clásico" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setVista(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-[4px] border ${
              vista === tab.id
                ? "bg-carbon text-blanco border-carbon"
                : "bg-blanco text-carbon border-arena"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {vista === "visual" ? (
        <EditorVisual
          contenidoInicial={contenidoInicial ?? {}}
          saveEndpoint={endpoint}
          envolverEnContenido={modoVariante}
          productoTitulo={productoTitulo}
          productoImagenUrl={productoImagenUrl}
        />
      ) : (
        <ConstructorLandingForm
          handle={handle}
          productoTitulo={productoTitulo}
          productoImagenUrl={productoImagenUrl}
          contenidoInicial={contenidoInicial}
          variantes={variantes}
          saveEndpoint={endpoint}
          modoVariante={modoVariante}
        />
      )}
    </div>
  );
}
