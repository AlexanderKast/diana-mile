import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const TITULO = "Diana Mile | Milito Life";
const DESCRIPCION =
  "Entrenamientos personalizados 1:1, Milito Life Store y contenido UGC para marcas. Te cuidas porque lo mereces ✨";
// TODO: reemplazar por foto real de Diana 1200x630
const OG_IMAGE = "/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://link.militolife.com"),
  title: TITULO,
  description: DESCRIPCION,
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    url: "https://link.militolife.com",
    siteName: "Milito Life",
    type: "website",
    locale: "es_CO",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Diana Mile — Milito Life",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRIPCION,
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F2EDE6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-crema text-morado-oscuro">
        {children}
      </body>
    </html>
  );
}
