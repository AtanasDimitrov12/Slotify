import { ChoosePath } from '../components/landing/ChoosePath';
import { Features } from '../components/landing/Features';
import { FinalCTA } from '../components/landing/FinalCTA';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Showcase } from '../components/landing/Showcase';
import { SmartSpotlight } from '../components/landing/SmartSpotlight';
import { Testimonials } from '../components/landing/Testimonials';
import { TrustStrip } from '../components/landing/TrustStrip';
import { Page } from '../layout/Page';

export default function LandingPage() {
  return (
    <Page hero={<Hero />} showFooter>
      {/* TRUST STRIP */}
      <TrustStrip />

      {/* CHOOSE PATH */}
      <ChoosePath />

      {/* WIDE SHOWCASE BAND */}
      <Showcase />

      {/* HOW IT WORKS */}
      <HowItWorks />

      {/* FEATURES */}
      <Features />

      {/* SMART SPOTLIGHT */}
      <SmartSpotlight />

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* FINAL CTA */}
      <FinalCTA />
    </Page>
  );
}
