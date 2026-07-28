import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import { InstallBanner } from "@/components/site/InstallBanner";
import { TrackingScripts } from "@/components/tracking/TrackingScripts";
import { RegistroVisita } from "@diana-mile/shared/ui/RegistroVisita";
import { BotonWhatsApp } from "@/components/site/BotonWhatsApp";
import { ProveedorWhatsApp } from "@diana-mile/shared/ui/WhatsAppFlotante";
import { getPricingConfig } from "@/lib/pricing-server";
import { getWhatsappNumero } from "@/lib/whatsapp-server";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Milito Life Shop",
  description: "Bienestar · Anti-edad · Rituales de piel",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#FAFAF8",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [pricing, whatsappNumero] = await Promise.all([
    getPricingConfig(),
    getWhatsappNumero(),
  ]);

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-blanco text-carbon overflow-x-hidden">
        <TrackingScripts />
        <RegistroVisita sitio="shop" />
        <ProveedorWhatsApp numero={whatsappNumero}>
          <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <InstallBanner activo={pricing.pwaBannerActivo} />
            <div className="flex-1">{children}</div>
            <SiteFooter />
            <MobileTabBar />
          </div>
          <BotonWhatsApp />
        </ProveedorWhatsApp>
      </body>
    </html>
  );
}
