import { setRequestLocale } from "next-intl/server";

import { CoreFeatures } from "@/components/features/landing/core-features";
import { FAQ } from "@/components/features/landing/faq";
import { FinalCTA } from "@/components/features/landing/final-cta";
import { Hero } from "@/components/features/landing/hero";
import { HowItWorks } from "@/components/features/landing/how-it-works";
import { LivePreview } from "@/components/features/landing/live-preview";
import { ProblemStatement } from "@/components/features/landing/problem-statement";
import { SupportedTracks } from "@/components/features/landing/supported-tracks";
import { UseCases } from "@/components/features/landing/use-cases";
import { Footer } from "@/components/layout/footer";
import Header from "@/components/layout/header";

type Props = {
  params: Promise<{ locale: string }>;
};

function SectionDivider() {
  return (
    <div
      aria-hidden
      className="mx-auto max-w-7xl px-4 lg:px-8"
    >
      <div className="h-px w-full bg-white/8" />
    </div>
  );
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <Hero />
        <SectionDivider />
        <ProblemStatement />
        <SectionDivider />
        <HowItWorks />
        <SectionDivider />
        <CoreFeatures />
        <SectionDivider />
        <SupportedTracks />
        <SectionDivider />
        <UseCases />
        <SectionDivider />
        <LivePreview />
        <SectionDivider />
        <FAQ />
        <SectionDivider />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
