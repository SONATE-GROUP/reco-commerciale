import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Générateur de reco commerciale — Sonate",
  description: "Génère une proposition commerciale à partir d'un transcript d'appel ou d'un email.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">{children}</body>
    </html>
  );
}
