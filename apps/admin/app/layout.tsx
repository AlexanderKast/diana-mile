import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Milito Life Shop — Admin",
  description: "Panel administrativo Milito Life Shop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-crema text-carbon">{children}</body>
    </html>
  );
}
