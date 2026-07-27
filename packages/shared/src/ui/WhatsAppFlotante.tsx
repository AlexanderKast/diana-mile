"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { cx } from "../utils";
import {
  enlaceWhatsApp,
  mensajeWhatsApp,
  type OrigenApp,
} from "../whatsapp/mensajes";

/**
 * Boton flotante de WhatsApp, con el mensaje ya escrito segun la pagina.
 *
 * El clic queda registrado antes de salir del sitio. Es la unica
 * oportunidad de guardar los cookies del pixel: una vez la persona esta en
 * WhatsApp, ese contexto no vuelve, y sin el la venta se cierra sin que
 * Meta sepa que anuncio la trajo.
 */

// ── Titulo de la pagina actual ──────────────────────────────────────────
//
// El slug no sirve para hablarle a una clienta ("epoch-polishing-bar"), y
// el nombre real solo lo conoce la pagina, no el layout donde vive el
// boton. Esto lo comunica sin tener que subir el boton a cada pagina.

const ContextoTitulo = createContext<{
  titulo: string | null;
  fijar: (t: string | null) => void;
}>({ titulo: null, fijar: () => {} });

export function ProveedorWhatsApp({ children }: { children: ReactNode }) {
  const [titulo, fijar] = useState<string | null>(null);
  const valor = useMemo(() => ({ titulo, fijar }), [titulo]);
  return (
    <ContextoTitulo.Provider value={valor}>{children}</ContextoTitulo.Provider>
  );
}

/**
 * Lo renderiza la pagina que sabe de que esta hablando. Al salir de ella
 * se limpia solo, para que el boton no siga nombrando un producto que ya
 * no se esta viendo.
 */
export function TituloWhatsApp({ valor }: { valor: string | null }) {
  const { fijar } = useContext(ContextoTitulo);
  useEffect(() => {
    fijar(valor);
    return () => fijar(null);
  }, [valor, fijar]);
  return null;
}

/**
 * El enlace contextual para los otros accesos a WhatsApp del sitio —el del
 * header, el de la barra movil—. Sin esto cada uno manda su propio "hola"
 * generico y se pierde de que pagina salio la persona, que es justo lo que
 * este modulo existe para saber.
 */
export function useEnlaceWhatsApp(
  numero: string | null | undefined,
  origen: OrigenApp = "shop",
): { href: string | null; mensaje: string; alHacerClic: () => void } {
  const pathname = usePathname() ?? "/";
  const { titulo } = useContext(ContextoTitulo);
  const ctx = { ruta: pathname, titulo, origen };
  const mensaje = mensajeWhatsApp(ctx);

  return {
    href: enlaceWhatsApp(numero, ctx),
    mensaje,
    alHacerClic: () => anotarClic({ mensaje, ruta: pathname, titulo, origen }),
  };
}

// ── Registro del clic ───────────────────────────────────────────────────

function leerCookie(nombre: string): string | null {
  if (typeof document === "undefined") return null;
  const par = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${nombre}=`));
  return par ? decodeURIComponent(par.slice(nombre.length + 1)) : null;
}

/**
 * Guarda el clic y avisa al pixel del navegador. Se llama desde cualquier
 * acceso a WhatsApp del sitio, no solo desde el flotante.
 */
function anotarClic(datos: {
  mensaje: string;
  ruta: string;
  titulo: string | null;
  origen: OrigenApp;
}) {
  const cuerpo = JSON.stringify({
    ...datos,
    fbp: leerCookie("_fbp"),
    fbc: leerCookie("_fbc"),
    busqueda: typeof window !== "undefined" ? window.location.search : null,
    referrer: typeof document !== "undefined" ? document.referrer : null,
  });

  // El pixel del navegador tambien registra el contacto, para que la
  // campana lo vea aunque el emparejamiento del lado servidor falle.
  const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
  if (typeof fbq === "function") fbq("track", "Contact");

  // sendBeacon esta hecho justo para esto: sobrevive a que la pestana se
  // vaya a WhatsApp. Un fetch normal se cancela a mitad y el clic se
  // pierde, que es el unico dato que no se puede recuperar despues.
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const ok = navigator.sendBeacon(
        "/api/whatsapp/clic",
        new Blob([cuerpo], { type: "application/json" }),
      );
      if (ok) return;
    }
    void fetch("/api/whatsapp/clic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: cuerpo,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Que no se registre el clic no puede impedirle escribir.
  }
}

function IconoWhatsApp() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35a10 10 0 0 0 4.9 1.25h.01c5.52 0 10-4.48 10-10s-4.48-9.9-10.01-9.9Zm0 18.1h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.05.8.82-2.97-.2-.3a8.26 8.26 0 0 1-1.27-4.4c0-4.58 3.73-8.3 8.31-8.3 2.22 0 4.3.87 5.87 2.44a8.24 8.24 0 0 1 2.43 5.87c0 4.58-3.73 8.3-8.3 8.3Zm4.55-6.22c-.25-.13-1.47-.72-1.7-.8-.23-.08-.4-.13-.56.13-.17.25-.65.8-.8.97-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.38-.43.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.42 1.02 2.58.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export type BotonWhatsAppProps = {
  /** Numero en formato internacional sin signos. Sin el, no se pinta nada. */
  numero: string | null | undefined;
  origen?: OrigenApp;
  /** Para mover el boton donde cada sitio lo necesite. */
  className?: string;
  /** Texto del globo que aparece al lado en pantallas grandes. */
  etiqueta?: string;
};

export function BotonWhatsAppFlotante({
  numero,
  origen = "shop",
  className,
  etiqueta = "Escríbenos",
}: BotonWhatsAppProps) {
  const { href, mensaje, alHacerClic } = useEnlaceWhatsApp(numero, origen);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Escribir por WhatsApp: ${mensaje}`}
      onClick={alHacerClic}
      className={cx(
        "group fixed z-40 flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-3 text-white shadow-lg shadow-black/20 transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] motion-safe:hover:scale-105",
        className,
      )}
    >
      <IconoWhatsApp />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 md:inline-block md:group-hover:max-w-[9rem] md:group-hover:pr-1">
        {etiqueta}
      </span>
    </a>
  );
}
