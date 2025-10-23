import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TacticPro - Plataforma de Desenho Tático",
  description: "Crie e visualize táticas de futebol com animações interativas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="h-full">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}

