"use client";

import { useRef, useState } from "react";

/**
 * Campo de subida del constructor visual: sube el archivo DIRECTO al CDN de
 * Shopify (URL firmada, sin pasar el binario por nuestra API) y deja la URL
 * publica en la prop del bloque. La conversion a WebP/AVIF y los tamanos
 * responsive los hace next/image al servir la pagina.
 */
export default function CampoArchivo({
  value,
  onChange,
  tipo,
}: {
  value: string;
  onChange: (url: string) => void;
  tipo: "imagen" | "video";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<"quieto" | "subiendo" | "procesando">(
    "quieto",
  );
  const [error, setError] = useState<string | null>(null);

  async function subir(archivo: File) {
    setError(null);
    setEstado("subiendo");
    try {
      const prep = await fetch("/api/admin/archivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paso: "preparar",
          filename: archivo.name,
          mimeType: archivo.type,
          tamano: archivo.size,
        }),
      });
      const target = await prep.json();
      if (!prep.ok) throw new Error(target.error ?? "No se pudo preparar la subida.");

      const form = new FormData();
      for (const p of target.parameters as { name: string; value: string }[]) {
        form.append(p.name, p.value);
      }
      form.append("file", archivo);
      const subida = await fetch(target.url, { method: "POST", body: form });
      if (!subida.ok) throw new Error("La subida al CDN fallo. Intenta de nuevo.");

      setEstado("procesando");
      const conf = await fetch("/api/admin/archivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paso: "confirmar",
          resourceUrl: target.resourceUrl,
          mimeType: archivo.type,
          alt: archivo.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        }),
      });
      const listo = await conf.json();
      if (!conf.ok) throw new Error(listo.error ?? "No se pudo confirmar la subida.");

      onChange(listo.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir.");
    } finally {
      setEstado("quieto");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={tipo === "video" ? "video/mp4,video/webm,video/quicktime" : "image/*"}
        className="hidden"
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          if (archivo) subir(archivo);
          e.target.value = "";
        }}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={estado !== "quieto"}
          className="px-3 py-2 text-xs font-medium rounded-[4px] border border-arena bg-blanco text-carbon hover:border-dorado disabled:opacity-60"
        >
          {estado === "subiendo"
            ? "Subiendo..."
            : estado === "procesando"
              ? "Procesando..."
              : value
                ? `Cambiar ${tipo}`
                : `Subir ${tipo}`}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-3 py-2 text-xs rounded-[4px] border border-arena text-ceniza hover:text-error"
          >
            Quitar
          </button>
        )}
      </div>
      {value &&
        (tipo === "imagen" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-20 w-20 object-cover rounded-lg border border-arena" />
        ) : (
          <video src={value} className="h-24 rounded-lg border border-arena" muted />
        ))}
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="o pega una URL"
        className="w-full text-xs rounded-[4px] border border-arena bg-blanco px-2 py-1.5 text-carbon focus:outline-none focus:border-dorado"
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
