import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import { InstallBanner } from "@/components/site/InstallBanner";
import { getPricingConfig } from "@/lib/pricing-server";
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
  const pricing = await getPricingConfig();

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-blanco text-carbon overflow-x-hidden">
        <div className="min-h-screen flex flex-col">
          <SiteHeader />
          <InstallBanner activo={pricing.pwaBannerActivo} />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <MobileTabBar />
        </div>
      </body>
    </html>
  );
}
