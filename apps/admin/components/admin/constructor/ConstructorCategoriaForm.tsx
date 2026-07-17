"use client";

import { useState } from "react";
import { Button } from "@diana-mile/shared/ui/Button";
import { Input, Textarea } from "@diana-mile/shared/ui/Input";
import type { CollectionLandingContent } from "@diana-mile/shared/types";

type ConstructorCategoriaFormProps = {
  handle: string;
  contenidoInicial: CollectionLandingContent | null;
};

export default function ConstructorCategoriaForm({
  handle,
  contenidoInicial,
}: ConstructorCategoriaFormProps) {
  const [content, setContent] = useState<CollectionLandingContent>(
    contenidoInicial ?? {},
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [iaError, setIaError] = useState<string | null>(null);

  function setField<K extends keyof CollectionLandingContent>(
    key: K,
    value: CollectionLandingContent[K],
  ) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  async function generarConIA() {
    setGenerando(true);
    setIaError(null);
    try {
      const res = await fetch(`/api/admin/categorias/${handle}/generar`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error ?? "No se pudo generar el contenido con IA.",
        );
      }
      setContent(data.content as CollectionLandingContent);
    } catch (err) {
      setIaError(err instanceof Error ? err.message : "Error al generar.");
    } finally {
      setGenerando(false);
    }
  }

  async function guardar() {
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categorias/${handle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar la categoría.");
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Eyebrow"
          value={content.eyebrow ?? ""}
          onChange={(e) => setField("eyebrow", e.target.value)}
          placeholder="ej. Línea Epoch® · Nu Skin"
        />
        <Input
          label="Tagline"
          value={content.tagline ?? ""}
          onChange={(e) => setField("tagline", e.target.value)}
          placeholder="Promesa/subtítulo de una línea"
        />
        <Input
          label="Título del storytelling"
          value={content.storyHeading ?? ""}
          onChange={(e) => setField("storyHeading", e.target.value)}
        />
      </div>
      <Textarea
        label="Storytelling (2-4 frases)"
        value={content.storyBody ?? ""}
        onChange={(e) => setField("storyBody", e.target.value)}
        rows={4}
      />

      {iaError && <p className="text-sm text-error">{iaError}</p>}
      {error && <p className="text-sm text-error">{error}</p>}
      {showToast && (
        <p className="text-sm text-dorado-oscuro">
          Landing de categoría guardada en Shopify.
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={generarConIA}
          disabled={generando}
        >
          {generando ? "Generando..." : "✨ Generar con IA"}
        </Button>
        <Button onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar categoría"}
        </Button>
      </div>
    </div>
  );
}
