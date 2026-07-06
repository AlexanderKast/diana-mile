import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const TITULO = "Diana Mile | Wellness & Antiaging";
const DESCRIPCION =
  "Entrenadora deportiva, creadora de contenido UGC y la cara detrás de Diana Mile Wellness & Antiaging. Agenda tu entrenamiento, visita la tienda y conoce mis redes.";

export const metadata: Metadata = {
  metadataBase: new URL("https://link.militolife.com"),
  title: TITULO,
  description: DESCRIPCION,
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    images: ["/images/diana-profile.jpg"],
    locale: "es_CO",
    type: "website",
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
