"use client";

import { useState } from "react";
import { Button } from "@diana-mile/shared/ui/Button";
import { Input, Textarea } from "@diana-mile/shared/ui/Input";
import type {
  LandingBenefit,
  LandingBenefitIcon,
  LandingFaq,
  LandingFreeGuideSection,
  LandingStep,
  LandingTestimonial,
  LandingTimelineStage,
  LandingSkinTypeOption,
  LandingUGCPost,
  ProductLandingContent,
} from "@diana-mile/shared/types";
import type { VarianteResumen } from "@/lib/shopify-catalogo";
import ArrayEditor from "./ArrayEditor";
import StringListEditor from "./StringListEditor";
import Seccion from "./Seccion";
import LandingPreview from "./LandingPreview";
import VariantColorsEditor from "./VariantColorsEditor";

const ICONOS: LandingBenefitIcon[] = [
  "gota",
  "mineral",
  "hoja",
  "sol",
  "escudo",
  "planeta",
];

type ConstructorLandingFormProps = {
  handle: string;
  productoTitulo: string;
  productoImagenUrl: string | null;
  contenidoInicial: ProductLandingContent | null;
  variantes: VarianteResumen[];
};

type Enabled = {
  ingredientStory: boolean;
  ingredients: boolean;
  skinType: boolean;
  withoutRitual: boolean;
  comparison: boolean;
  freeGuide: boolean;
};

export default function ConstructorLandingForm({
  handle,
  productoTitulo,
  productoImagenUrl,
  contenidoInicial,
  variantes,
}: ConstructorLandingFormProps) {
  const [mostrarPreview, setMostrarPreview] = useState(true);
  const [content, setContent] = useState<ProductLandingContent>(
    contenidoInicial ?? {},
  );
  const [enabled, setEnabled] = useState<Enabled>({
    ingredientStory: Boolean(contenidoInicial?.ingredientStory),
    ingredients: Boolean(contenidoInicial?.ingredients),
    skinType: Boolean(contenidoInicial?.skinType),
    withoutRitual: Boolean(contenidoInicial?.withoutRitual),
    comparison: Boolean(contenidoInicial?.comparison),
    freeGuide: Boolean(contenidoInicial?.freeGuide),
  });
  const [vista, setVista] = useState<"formulario" | "json">("formulario");
  const [jsonTexto, setJsonTexto] = useState(() =>
    JSON.stringify(contenidoInicial ?? {}, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [mostrarIA, setMostrarIA] = useState(false);
  const [brief, setBrief] = useState("");
  const [generando, setGenerando] = useState(false);
  const [iaError, setIaError] = useState<string | null>(null);

  function setField<K extends keyof ProductLandingContent>(
    key: K,
    value: ProductLandingContent[K],
  ) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  function aplicarContenidoGenerado(generado: ProductLandingContent) {
    setContent(generado);
    setEnabled({
      ingredientStory: Boolean(generado.ingredientStory),
      ingredients: Boolean(generado.ingredients),
      skinType: Boolean(generado.skinType),
      withoutRitual: Boolean(generado.withoutRitual),
      comparison: Boolean(generado.comparison),
      freeGuide: Boolean(generado.freeGuide),
    });
    setJsonTexto(JSON.stringify(generado, null, 2));
  }

  async function generarConIA() {
    setGenerando(true);
    setIaError(null);
    try {
      const res = await fetch(`/api/admin/productos/${handle}/generar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: brief.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo generar la landing con IA.");
      }
      aplicarContenidoGenerado(data.content as ProductLandingContent);
      setMostrarIA(false);
    } catch (err) {
      setIaError(err instanceof Error ? err.message : "Error al generar.");
    } finally {
      setGenerando(false);
    }
  }

  function irAJson() {
    setJsonTexto(JSON.stringify(content, null, 2));
    setJsonError(null);
    setVista("json");
  }

  function aplicarJson() {
    try {
      const parsed = JSON.parse(jsonTexto);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("El JSON debe ser un objeto.");
      }
      setContent(parsed as ProductLandingContent);
      setEnabled({
        ingredientStory: Boolean(parsed.ingredientStory),
        ingredients: Boolean(parsed.ingredients),
        skinType: Boolean(parsed.skinType),
        withoutRitual: Boolean(parsed.withoutRitual),
        comparison: Boolean(parsed.comparison),
        freeGuide: Boolean(parsed.freeGuide),
      });
      setJsonError(null);
      setVista("formulario");
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "JSON inválido.");
    }
  }

  async function guardar() {
    setGuardando(true);
    setError(null);
    try {
      const payload: ProductLandingContent = { ...content };
      if (!enabled.ingredientStory) delete payload.ingredientStory;
      if (!enabled.ingredients) delete payload.ingredients;
      if (!enabled.skinType) delete payload.skinType;
      if (!enabled.withoutRitual) delete payload.withoutRitual;
      if (!enabled.comparison) delete payload.comparison;
      if (!enabled.freeGuide) delete payload.freeGuide;

      const res = await fetch(`/api/admin/productos/${handle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar la landing.");
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setGuardando(false);
    }
  }

  const ingredientStory = content.ingredientStory ?? { title: "", body: "" };
  const ingredients = content.ingredients ?? { inci: "", freeFrom: "" };
  const skinType = content.skinType ?? { question: "", options: [] };
  const withoutRitual = content.withoutRitual ?? {
    title: "",
    conLabel: `Con el ${productoTitulo}`,
    sin: [],
    con: [],
  };
  const comparison = content.comparison ?? { title: "", rows: [] };
  const freeGuide = content.freeGuide ?? {
    title: "",
    description: "",
    sections: [],
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVista("formulario")}
            className={`px-4 py-2 text-sm font-medium rounded-[4px] border ${
              vista === "formulario"
                ? "bg-carbon text-blanco border-carbon"
                : "bg-blanco text-carbon border-arena"
            }`}
          >
            Formulario
          </button>
          <button
            type="button"
            onClick={irAJson}
            className={`px-4 py-2 text-sm font-medium rounded-[4px] border ${
              vista === "json"
                ? "bg-carbon text-blanco border-carbon"
                : "bg-blanco text-carbon border-arena"
            }`}
          >
            JSON avanzado
          </button>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setMostrarPreview((v) => !v)}
            className="hidden lg:inline-flex"
          >
            {mostrarPreview ? "Ocultar preview" : "👁 Ver preview"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setMostrarIA((v) => !v)}
          >
            ✨ Generar con IA
          </Button>
          <Button onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar landing"}
          </Button>
        </div>
      </div>

      {mostrarIA && (
        <div className="border border-arena rounded-[4px] bg-crema/40 p-4 mb-4 flex flex-col gap-3">
          <p className="text-xs text-ceniza">
            Genera el contenido inicial de la landing con IA. Puedes revisarlo y
            editarlo antes de guardar — no se escribe en Shopify
            automáticamente.
          </p>
          <Textarea
            label="Brief de investigación (opcional)"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={4}
            placeholder="Lenguaje de audiencia, dolores, ángulos, competencia..."
          />
          {iaError && <p className="text-sm text-error">{iaError}</p>}
          <Button
            type="button"
            onClick={generarConIA}
            disabled={generando}
            className="self-start"
          >
            {generando ? "Generando..." : "Generar contenido"}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-error mb-4">{error}</p>}
      {showToast && (
        <p className="text-sm text-dorado-oscuro mb-4">
          Landing guardada en Shopify.
        </p>
      )}

      <div
        className={`grid grid-cols-1 gap-6 items-start ${
          mostrarPreview ? "lg:grid-cols-[minmax(0,1fr)_380px]" : ""
        }`}
      >
        {vista === "json" ? (
          <div className="flex flex-col gap-3">
            <textarea
              value={jsonTexto}
              onChange={(e) => setJsonTexto(e.target.value)}
              rows={24}
              spellCheck={false}
              className="w-full font-mono text-xs rounded-[4px] border border-arena bg-blanco px-3 py-2 text-carbon focus:outline-none focus:border-dorado"
            />
            {jsonError && <p className="text-sm text-error">{jsonError}</p>}
            <Button
              type="button"
              variant="secondary"
              onClick={aplicarJson}
              className="self-start"
            >
              Aplicar al formulario
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Seccion
              titulo="Colores de variantes"
              descripcion="Color propio por variante, editable a gusto (independiente del swatch de Shopify)."
            >
              <VariantColorsEditor handle={handle} variantes={variantes} />
            </Seccion>

            <Seccion titulo="Encabezados generales" defaultOpen>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Eyebrow"
                  value={content.eyebrow ?? ""}
                  onChange={(e) => setField("eyebrow", e.target.value)}
                  placeholder="ej. Colección Epoch® · Nu Skin"
                />
                <Input
                  label="Tagline"
                  value={content.tagline ?? ""}
                  onChange={(e) => setField("tagline", e.target.value)}
                  placeholder="Promesa/subtítulo de una línea"
                />
                <Input
                  label="Título del cierre final"
                  value={content.closingHeading ?? ""}
                  onChange={(e) => setField("closingHeading", e.target.value)}
                />
                <label className="flex items-center gap-2 text-sm text-carbon mt-6">
                  <input
                    type="checkbox"
                    checked={content.authenticity ?? false}
                    onChange={(e) => setField("authenticity", e.target.checked)}
                  />
                  Mostrar badge &quot;100% original&quot; (marcas revendidas)
                </label>
              </div>
            </Seccion>

            <Seccion titulo="Beneficios">
              <Input
                label="Título de la sección"
                value={content.benefitsHeading ?? ""}
                onChange={(e) => setField("benefitsHeading", e.target.value)}
                className="mb-4"
              />
              <ArrayEditor<LandingBenefit>
                items={content.benefits ?? []}
                onChange={(items) => setField("benefits", items)}
                emptyItem={() => ({
                  icon: "gota",
                  title: "",
                  description: "",
                })}
                itemLabel={(item, i) => item.title || `Beneficio #${i + 1}`}
                addLabel="Añadir beneficio"
                renderItem={(item, _i, update) => (
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-ceniza font-medium">
                        Icono
                      </label>
                      <select
                        value={item.icon}
                        onChange={(e) =>
                          update({ icon: e.target.value as LandingBenefitIcon })
                        }
                        className="min-h-[44px] rounded-lg border border-arena bg-blanco px-4 py-2.5 text-base text-carbon focus:outline-none focus:border-dorado"
                      >
                        {ICONOS.map((icono) => (
                          <option key={icono} value={icono}>
                            {icono}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Título"
                      value={item.title}
                      onChange={(e) => update({ title: e.target.value })}
                    />
                    <Textarea
                      label="Descripción"
                      value={item.description}
                      onChange={(e) => update({ description: e.target.value })}
                      rows={2}
                      className="md:col-span-2"
                    />
                    <Textarea
                      label="Ciencia (opcional)"
                      value={item.ciencia ?? ""}
                      onChange={(e) => update({ ciencia: e.target.value })}
                      rows={2}
                      className="md:col-span-2"
                    />
                  </div>
                )}
              />
            </Seccion>

            <Seccion
              titulo="Historia del ingrediente"
              toggle={{
                activo: enabled.ingredientStory,
                onChange: (activo) =>
                  setEnabled((e) => ({ ...e, ingredientStory: activo })),
              }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Título"
                  value={ingredientStory.title}
                  onChange={(e) =>
                    setField("ingredientStory", {
                      ...ingredientStory,
                      title: e.target.value,
                    })
                  }
                />
                <Textarea
                  label="Historia (2-4 frases)"
                  value={ingredientStory.body}
                  onChange={(e) =>
                    setField("ingredientStory", {
                      ...ingredientStory,
                      body: e.target.value,
                    })
                  }
                  rows={3}
                  className="md:col-span-2"
                />
              </div>
            </Seccion>

            <Seccion
              titulo="Ingredientes"
              toggle={{
                activo: enabled.ingredients,
                onChange: (activo) =>
                  setEnabled((e) => ({ ...e, ingredients: activo })),
              }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <Textarea
                  label="Lista INCI"
                  value={ingredients.inci}
                  onChange={(e) =>
                    setField("ingredients", {
                      ...ingredients,
                      inci: e.target.value,
                    })
                  }
                  rows={2}
                />
                <Input
                  label='Línea "libre de"'
                  value={ingredients.freeFrom}
                  onChange={(e) =>
                    setField("ingredients", {
                      ...ingredients,
                      freeFrom: e.target.value,
                    })
                  }
                  placeholder="Sin parabenos · Sin sulfatos"
                />
              </div>
            </Seccion>

            <Seccion
              titulo="Tipo de piel"
              toggle={{
                activo: enabled.skinType,
                onChange: (activo) =>
                  setEnabled((e) => ({ ...e, skinType: activo })),
              }}
            >
              <Input
                label="Pregunta"
                value={skinType.question}
                onChange={(e) =>
                  setField("skinType", {
                    ...skinType,
                    question: e.target.value,
                  })
                }
                className="mb-4"
              />
              <ArrayEditor<LandingSkinTypeOption>
                items={skinType.options}
                onChange={(options) =>
                  setField("skinType", { ...skinType, options })
                }
                emptyItem={() => ({ id: "", label: "", message: "" })}
                itemLabel={(item, i) => item.label || `Opción #${i + 1}`}
                addLabel="Añadir opción"
                renderItem={(item, _i, update) => (
                  <div className="grid md:grid-cols-3 gap-3">
                    <Input
                      label="ID"
                      value={item.id}
                      onChange={(e) => update({ id: e.target.value })}
                    />
                    <Input
                      label="Etiqueta"
                      value={item.label}
                      onChange={(e) => update({ label: e.target.value })}
                    />
                    <Input
                      label="Mensaje de confirmación"
                      value={item.message}
                      onChange={(e) => update({ message: e.target.value })}
                    />
                  </div>
                )}
              />
            </Seccion>

            <Seccion titulo="Pasos de uso">
              <Input
                label="Título de la sección"
                value={content.usageHeading ?? ""}
                onChange={(e) => setField("usageHeading", e.target.value)}
                className="mb-4"
              />
              <ArrayEditor<LandingStep>
                items={content.usageSteps ?? []}
                onChange={(items) => setField("usageSteps", items)}
                emptyItem={() => ({
                  numero: String((content.usageSteps?.length ?? 0) + 1),
                  titulo: "",
                  descripcion: "",
                })}
                itemLabel={(item, i) => item.titulo || `Paso #${i + 1}`}
                addLabel="Añadir paso"
                renderItem={(item, _i, update) => (
                  <div className="grid md:grid-cols-4 gap-3">
                    <Input
                      label="Número"
                      value={item.numero}
                      onChange={(e) => update({ numero: e.target.value })}
                    />
                    <Input
                      label="Título"
                      value={item.titulo}
                      onChange={(e) => update({ titulo: e.target.value })}
                      className="md:col-span-3"
                    />
                    <Textarea
                      label="Descripción"
                      value={item.descripcion}
                      onChange={(e) => update({ descripcion: e.target.value })}
                      rows={2}
                      className="md:col-span-4"
                    />
                  </div>
                )}
              />
            </Seccion>

            <Seccion
              titulo="Sin ritual / Con ritual"
              descripcion="Columna de aversión a la pérdida (antes/después)."
              toggle={{
                activo: enabled.withoutRitual,
                onChange: (activo) =>
                  setEnabled((e) => ({ ...e, withoutRitual: activo })),
              }}
            >
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Título"
                  value={withoutRitual.title}
                  onChange={(e) =>
                    setField("withoutRitual", {
                      ...withoutRitual,
                      title: e.target.value,
                    })
                  }
                />
                <Input
                  label="Etiqueta columna positiva"
                  value={withoutRitual.conLabel}
                  onChange={(e) =>
                    setField("withoutRitual", {
                      ...withoutRitual,
                      conLabel: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-ceniza font-medium mb-2">
                    Sin el ritual
                  </p>
                  <StringListEditor
                    items={withoutRitual.sin}
                    onChange={(sin) =>
                      setField("withoutRitual", { ...withoutRitual, sin })
                    }
                    addLabel="Añadir línea"
                  />
                </div>
                <div>
                  <p className="text-xs text-ceniza font-medium mb-2">
                    Con el ritual
                  </p>
                  <StringListEditor
                    items={withoutRitual.con}
                    onChange={(con) =>
                      setField("withoutRitual", { ...withoutRitual, con })
                    }
                    addLabel="Añadir línea"
                  />
                </div>
              </div>
            </Seccion>

            <Seccion titulo="Resultados / línea de tiempo">
              <Input
                label="Título de la sección"
                value={content.resultsHeading ?? ""}
                onChange={(e) => setField("resultsHeading", e.target.value)}
                className="mb-4"
              />
              <ArrayEditor<LandingTimelineStage>
                items={content.resultsTimeline ?? []}
                onChange={(items) => setField("resultsTimeline", items)}
                emptyItem={() => ({ momento: "", titulo: "", descripcion: "" })}
                itemLabel={(item, i) => item.momento || `Etapa #${i + 1}`}
                addLabel="Añadir etapa"
                renderItem={(item, _i, update) => (
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      label="Momento"
                      value={item.momento}
                      onChange={(e) => update({ momento: e.target.value })}
                      placeholder="ej. Semana 1"
                    />
                    <Input
                      label="Título"
                      value={item.titulo}
                      onChange={(e) => update({ titulo: e.target.value })}
                    />
                    <Textarea
                      label="Descripción"
                      value={item.descripcion}
                      onChange={(e) => update({ descripcion: e.target.value })}
                      rows={2}
                      className="md:col-span-2"
                    />
                  </div>
                )}
              />
            </Seccion>

            <Seccion titulo="Testimonios / experiencias">
              <Input
                label="Título de la sección"
                value={content.testimonialsHeading ?? ""}
                onChange={(e) =>
                  setField("testimonialsHeading", e.target.value)
                }
                className="mb-4"
              />
              <ArrayEditor<LandingTestimonial>
                items={content.testimonials ?? []}
                onChange={(items) => setField("testimonials", items)}
                emptyItem={() => ({ title: "", text: "" })}
                itemLabel={(item, i) => item.title || `Testimonio #${i + 1}`}
                addLabel="Añadir testimonio"
                renderItem={(item, _i, update) => (
                  <div className="grid gap-3">
                    <Input
                      label="Título"
                      value={item.title}
                      onChange={(e) => update({ title: e.target.value })}
                    />
                    <Textarea
                      label="Texto"
                      value={item.text}
                      onChange={(e) => update({ text: e.target.value })}
                      rows={2}
                    />
                  </div>
                )}
              />
            </Seccion>

            <Seccion
              titulo="Comparación"
              descripcion="Nosotros vs. la alternativa genérica."
              toggle={{
                activo: enabled.comparison,
                onChange: (activo) =>
                  setEnabled((e) => ({ ...e, comparison: activo })),
              }}
            >
              <Input
                label="Título"
                value={comparison.title}
                onChange={(e) =>
                  setField("comparison", {
                    ...comparison,
                    title: e.target.value,
                  })
                }
                className="mb-4"
              />
              <StringListEditor
                items={comparison.rows}
                onChange={(rows) =>
                  setField("comparison", { ...comparison, rows })
                }
                addLabel="Añadir fila"
              />
            </Seccion>

            <Seccion titulo="Preguntas frecuentes (FAQs)">
              <ArrayEditor<LandingFaq>
                items={content.faqs ?? []}
                onChange={(items) => setField("faqs", items)}
                emptyItem={() => ({ question: "", answer: "" })}
                itemLabel={(item, i) => item.question || `FAQ #${i + 1}`}
                addLabel="Añadir pregunta"
                renderItem={(item, _i, update) => (
                  <div className="grid gap-3">
                    <Input
                      label="Pregunta"
                      value={item.question}
                      onChange={(e) => update({ question: e.target.value })}
                    />
                    <Textarea
                      label="Respuesta"
                      value={item.answer}
                      onChange={(e) => update({ answer: e.target.value })}
                      rows={2}
                    />
                  </div>
                )}
              />
            </Seccion>

            <Seccion titulo="Contenido UGC">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Título de la sección"
                  value={content.ugcHeading ?? ""}
                  onChange={(e) => setField("ugcHeading", e.target.value)}
                />
                <Input
                  label="Subtítulo"
                  value={content.ugcSubheading ?? ""}
                  onChange={(e) => setField("ugcSubheading", e.target.value)}
                />
              </div>
              <ArrayEditor<LandingUGCPost>
                items={content.ugc ?? []}
                onChange={(items) => setField("ugc", items)}
                emptyItem={() => ({ emoji: "🌙", title: "", text: "" })}
                itemLabel={(item, i) => item.title || `Post #${i + 1}`}
                addLabel="Añadir post"
                renderItem={(item, _i, update) => (
                  <div className="grid md:grid-cols-4 gap-3">
                    <Input
                      label="Emoji"
                      value={item.emoji}
                      onChange={(e) => update({ emoji: e.target.value })}
                    />
                    <Input
                      label="Título"
                      value={item.title}
                      onChange={(e) => update({ title: e.target.value })}
                      className="md:col-span-3"
                    />
                    <Textarea
                      label="Texto"
                      value={item.text}
                      onChange={(e) => update({ text: e.target.value })}
                      rows={2}
                      className="md:col-span-4"
                    />
                  </div>
                )}
              />
            </Seccion>

            <Seccion
              titulo="Guía gratis"
              toggle={{
                activo: enabled.freeGuide,
                onChange: (activo) =>
                  setEnabled((e) => ({ ...e, freeGuide: activo })),
              }}
            >
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Título"
                  value={freeGuide.title}
                  onChange={(e) =>
                    setField("freeGuide", {
                      ...freeGuide,
                      title: e.target.value,
                    })
                  }
                />
                <Input
                  label="Descripción"
                  value={freeGuide.description}
                  onChange={(e) =>
                    setField("freeGuide", {
                      ...freeGuide,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <ArrayEditor<LandingFreeGuideSection>
                items={freeGuide.sections}
                onChange={(sections) =>
                  setField("freeGuide", { ...freeGuide, sections })
                }
                emptyItem={() => ({ title: "", body: "" })}
                itemLabel={(item, i) => item.title || `Sección #${i + 1}`}
                addLabel="Añadir sección"
                renderItem={(item, _i, update) => (
                  <div className="grid gap-3">
                    <Input
                      label="Título"
                      value={item.title}
                      onChange={(e) => update({ title: e.target.value })}
                    />
                    <Textarea
                      label="Contenido"
                      value={item.body}
                      onChange={(e) => update({ body: e.target.value })}
                      rows={2}
                    />
                  </div>
                )}
              />
            </Seccion>
          </div>
        )}

        {mostrarPreview && (
          <div className="hidden lg:block lg:sticky lg:top-6">
            <div className="rounded-2xl border border-arena bg-crema shadow-[0_1px_3px_rgba(26,23,20,0.08)] overflow-hidden">
              <div className="flex items-center justify-between bg-carbon px-4 py-2.5 text-blanco">
                <span className="text-xs font-medium">
                  Vista previa · como se verá en la tienda
                </span>
                <button
                  type="button"
                  onClick={() => setMostrarPreview(false)}
                  className="text-xs text-blanco/70 hover:text-blanco"
                >
                  Ocultar
                </button>
              </div>
              <div className="max-h-[calc(100vh-9rem)] overflow-y-auto">
                <LandingPreview
                  productTitle={productoTitulo}
                  productImageUrl={productoImagenUrl}
                  content={content}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
