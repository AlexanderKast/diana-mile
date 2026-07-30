"use client";

import { useEffect, useRef, useState } from "react";

type ArchivoLista = { url: string; alt: string; miniatura: string };

/** Galeria de la biblioteca de Shopify (Contenido > Archivos). */
function GaleriaShopify({
  tipo,
  onElegir,
  onCerrar,
}: {
  tipo: "imagen" | "video";
  onElegir: (url: string) => void;
  onCerrar: () => void;
}) {
  const [archivos, setArchivos] = useState<ArchivoLista[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargar(reiniciar: boolean, texto: string, desde?: string | null) {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({ tipo });
      if (texto.trim()) params.set("buscar", texto.trim());
      if (!reiniciar && desde) params.set("cursor", desde);
      const res = await fetch(`/api/admin/archivos?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo cargar.");
      setArchivos((previos) =>
        reiniciar ? data.archivos : [...previos, ...data.archivos],
      );
      setCursor(data.cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar(true, "");
    // Solo al abrir: la busqueda se dispara con el boton/Enter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-2 border border-arena rounded-[4px] bg-blanco p-3">
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              cargar(true, buscar);
            }
          }}
          placeholder="Buscar por nombre..."
          className="flex-1 text-xs rounded-[4px] border border-arena bg-blanco px-2 py-1.5 text-carbon focus:outline-none focus:border-dorado"
        />
        <button
          type="button"
          onClick={() => cargar(true, buscar)}
          className="px-2 py-1.5 text-xs rounded-[4px] border border-arena text-carbon hover:border-dorado"
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={onCerrar}
          className="px-2 py-1.5 text-xs text-ceniza hover:text-carbon"
        >
          Cerrar
        </button>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}
      {!error && archivos.length === 0 && !cargando && (
        <p className="text-xs text-ceniza py-2">Sin resultados en la biblioteca.</p>
      )}

      <div className="grid grid-cols-3 gap-1.5 max-h-64 overflow-y-auto">
        {archivos.map((archivo) => (
          <button
            key={archivo.url}
            type="button"
            onClick={() => onElegir(archivo.url)}
            title={archivo.alt}
            className="relative aspect-square rounded-md overflow-hidden border border-arena hover:border-dorado focus:outline-none focus:border-dorado bg-crema"
          >
            {archivo.miniatura ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={archivo.miniatura}
                alt={archivo.alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-ceniza">
                video
              </span>
            )}
          </button>
        ))}
      </div>

      {(cargando || cursor) && (
        <button
          type="button"
          onClick={() => cargar(false, buscar, cursor)}
          disabled={cargando}
          className="self-center px-3 py-1.5 text-xs rounded-[4px] border border-arena text-carbon hover:border-dorado disabled:opacity-60"
        >
          {cargando ? "Cargando..." : "Cargar más"}
        </button>
      )}
    </div>
  );
}

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
  const [galeriaAbierta, setGaleriaAbierta] = useState(false);

  /**
   * Redimensiona imagenes grandes en el navegador antes de subirlas (max
   * 1600px de lado, WebP). Una foto de celular de 4MB queda en ~200KB sin
   * perdida visible; el CDN y next/image hacen el resto al servir.
   */
  async function optimizarImagen(archivo: File): Promise<File> {
    if (!archivo.type.startsWith("image/") || archivo.type === "image/gif") {
      return archivo;
    }
    if (archivo.size < 400 * 1024) return archivo;
    try {
      const bitmap = await createImageBitmap(archivo);
      const MAX = 1600;
      const escala = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
      if (escala === 1 && archivo.size < 1024 * 1024) return archivo;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * escala);
      canvas.height = Math.round(bitmap.height * escala);
      const ctx = canvas.getContext("2d");
      if (!ctx) return archivo;
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.85),
      );
      if (!blob || blob.size >= archivo.size) return archivo;
      return new File(
        [blob],
        archivo.name.replace(/\.[^.]+$/, "") + ".webp",
        { type: "image/webp" },
      );
    } catch {
      return archivo;
    }
  }

  async function subir(archivoOriginal: File) {
    setError(null);
    setEstado("subiendo");
    try {
      const archivo = await optimizarImagen(archivoOriginal);
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
        <button
          type="button"
          onClick={() => setGaleriaAbierta((v) => !v)}
          className="px-3 py-2 text-xs font-medium rounded-[4px] border border-arena bg-blanco text-carbon hover:border-dorado"
        >
          {galeriaAbierta ? "Ocultar biblioteca" : "Elegir de Shopify"}
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
      {galeriaAbierta && (
        <GaleriaShopify
          tipo={tipo}
          onElegir={(url) => {
            onChange(url);
            setGaleriaAbierta(false);
          }}
          onCerrar={() => setGaleriaAbierta(false)}
        />
      )}
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
