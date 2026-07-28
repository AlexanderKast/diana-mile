import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Milito Life — App",
  description: "Milito Life.",
};

import { RegistroVisita } from "@diana-mile/shared/ui/RegistroVisita";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <RegistroVisita
          sitio="app"
          endpoint="https://shop.militolife.com/api/visitas"
        />{children}</body>
    </html>
  );
}
