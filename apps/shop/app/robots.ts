import type { MetadataRoute } from "next";

/**
 * /l/ y /go/ son las rutas del rotador de landings de pauta: paginas reales
 * pero fuera del indice para no competir con la PDP publica del producto.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/l/", "/go/", "/api/"],
    },
  };
}
