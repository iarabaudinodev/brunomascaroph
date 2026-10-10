import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bodoni_Moda, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeSync } from "@/components/ThemeSync";
import { themeToStyle } from "@/content/theme";
import { getSiteContent } from "@/lib/site-content";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return {
    title: content.seo.title || "Portfolio",
    description: content.seo.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const content = await getSiteContent();

  return (
    <html lang="es" className="dark" style={themeToStyle(content.theme)}>
      <body
        className={`${bodoni.variable} ${inter.variable} ${jetbrains.variable} bg-surface text-on-surface antialiased selection:bg-secondary-container selection:text-primary`}
      >
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
