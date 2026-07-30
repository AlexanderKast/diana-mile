"use client";

import { useEffect, useState } from "react";
import CampoArchivo from "@/components/admin/editor/CampoArchivo";

const TIPOS: { tipo: string; label: string; guia: string }[] = [
  { tipo: "hero", label: "Hero / gancho", guia: "Dolor + producto protagonista" },
  { tipo: "oferta", label: "Oferta / precio", guia: "Precio real y packs" },
  { tipo: "beneficios", label: "Beneficios", guia: "3-5 bullets con iconos" },
  { tipo: "comparativa", label: "Tabla comparativa", guia: "Nosotros vs alternativas" },
  { tipo: "autoridad", label: "Autoridad Nu Skin", guia: "Respaldo real del fabricante" },
  { tipo: "uso", label: "Cómo se usa", guia: "Pasos numerados" },
  { tipo: "sensorial", label: "Experiencia sensorial", guia: "Textura, ritual — sin promesas" },
  { tipo: "logistica", label: "Logística + garantía", guia: "Contraentrega, envío, reposición" },
  { tipo: "faq", label: "Preguntas frecuentes", guia: "4-5 preguntas cortas" },
];

type Plantilla = {
  id: string;
  tipo_seccion: string;
  nombre: string;
  url_imagen: string;
  activa: boolean;
};

/**
 * Plantillas de referencia de "Landing magica": Alexander sube una captura
 * de layout por tipo de seccion; el generador la adjunta como referencia de
 * composicion. Sin plantilla, el prompt describe el layout en texto.
 */
export default function PlantillasSecciones() {
  const [activas, setActivas] = useState<Record<string, Plantilla>>({});
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    try {
      const res = await fetch("/api/admin/plantillas-secciones");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo cargar.");
      const mapa: Record<string, Plantilla> = {};
      for (const p of data.plantillas as Plantilla[]) {
        if (p.activa && !mapa[p.tipo_seccion]) mapa[p.tipo_seccion] = p;
      }
      setActivas(mapa);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function guardar(tipo: string, url: string) {
    setError(null);
    try {
      const res = await fetch("/api/admin/plantillas-secciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo_seccion: tipo, nombre: tipo, url_imagen: url }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar.");
      }
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-error">{error}</p>}
      {TIPOS.map(({ tipo, label, guia }) => (
        <div
          key={tipo}
          className="flex flex-wrap items-start gap-4 rounded-[4px] border border-arena bg-blanco p-4"
        >
          <div className="w-44">
            <p className="text-sm font-medium text-carbon">{label}</p>
            <p className="text-xs text-ceniza mt-0.5">{guia}</p>
          </div>
          <div className="flex-1 min-w-[260px]">
            <CampoArchivo
              value={activas[tipo]?.url_imagen ?? ""}
              onChange={(url) => {
                if (url) guardar(tipo, url);
              }}
              tipo="imagen"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
