import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import NeuralBackground from "@/components/NeuralBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaskFlow - Gestão Inteligente de Tarefas",
  description: "Sistema de gestão de tarefas por departamento com IA",
  icons: {
    icon: "/taskflow.png",
    apple: "/taskflow.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)] transition-colors duration-300">
        <NeuralBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
