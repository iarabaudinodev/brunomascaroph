import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/Gallery";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SiteProvider } from "@/content/site-context";
import { getSiteContent } from "@/lib/site-content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const image = content.hero.image || content.about.portrait || undefined;
  return {
    title: content.seo.title,
    description: content.seo.description,
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function Home() {
  const content = await getSiteContent();

  return (
    <SiteProvider initial={content}>
      <div id="top" />
      <Header />
      <main className="w-full bg-surface pt-12 md:pt-14">
        <Hero />
        <Gallery />
        <About />
        <Contact />
      </main>
      <Footer />
    </SiteProvider>
  );
}
