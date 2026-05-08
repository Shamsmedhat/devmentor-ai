import { setRequestLocale } from "next-intl/server";

import { CoreFeatures } from "@/components/features/landing/core-features";
import { FAQ } from "@/components/features/landing/faq";
import { FinalCTA } from "@/components/features/landing/final-cta";
import { Footer } from "@/components/features/landing/footer";
import { Hero } from "@/components/features/landing/hero";
import { HowItWorks } from "@/components/features/landing/how-it-works";
import { LivePreview } from "@/components/features/landing/live-preview";
import { ProblemStatement } from "@/components/features/landing/problem-statement";
import { SupportedTracks } from "@/components/features/landing/supported-tracks";
import { UseCases } from "@/components/features/landing/use-cases";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <main className="min-h-screen bg-background">
        <Hero />
        <ProblemStatement />
        <HowItWorks />
        <CoreFeatures />
        <SupportedTracks />
        <UseCases />
        <LivePreview />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
