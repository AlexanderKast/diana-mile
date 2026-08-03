import { MarcaGota } from "@/lib/logo-milito";

/**
 * Layout anidado del funnel pre-venta (mi-plan, test, comunidad). NO es un
 * root layout: vive dentro del arbol de apps/shop/app/layout.tsx, que sigue
 * montando SiteHeader/SiteFooter/TrackingScripts/etc. exactamente igual que
 * hoy — este archivo no los reemplaza, los oculta con CSS.
 *
 * Los <span data-ocultar-header hidden /> y data-ocultar-footer son el
 * mecanismo YA EXISTENTE (apps/shop/app/globals.css, usado hoy por el editor
 * visual Puck) para pantallas full-bleed: `body:has([data-ocultar-header])`
 * apaga header + tabbar por CSS sin que React necesite desmontar nada ni
 * que exista un segundo root layout.
 *
 * El funnel no lleva chrome de marca (nav, footer, ofertas) porque la
 * persona esta en medio de un test — cualquier distraccion es una salida.
 * Solo un logo discreto para orientacion, nada que invite a navegar fuera.
 */
export default function FunnelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-crema">
      <span data-ocultar-header hidden />
      <span data-ocultar-footer hidden />

      <header className="flex shrink-0 items-center justify-center pt-[max(1rem,env(safe-area-inset-top))]">
        <MarcaGota size={28} />
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
