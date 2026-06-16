import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Vremena Grotesk (the display font) is self-hosted via @font-face in globals.css.

export const metadata: Metadata = {
  title: "LaTira — Música en directo en Asturias",
  description:
    "Agenda de conciertos y música en directo en Asturias. Todos los eventos en un único lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-dvh bg-bg text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
