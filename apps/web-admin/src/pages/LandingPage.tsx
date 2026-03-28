import { Box } from '@mui/material';
import {
  ChoosePath,
  Features,
  FinalCTA,
  Footer,
  Hero,
  Showcase,
  SmartSpotlight,
  TrustStrip,
  Page,
} from '@barber/shared';

export default function LandingPage() {
  return (
    <Page
      hero={
        <Hero
          eyebrow="Partner OS"
          title="PARTNER"
          subtitle1="SMARTER MANAGEMENT FOR SALONS"
          subtitle2="CLEANER SCHEDULES. BETTER FLOW."
          description="Slotify gives salons better control over availability, waitlists, and the flow of the day. Join as a partner to optimize your business."
          primaryCtaText="Partner Login"
          primaryCtaLink="/login"
          chipLabel="Slotify Partner OS — management for salons"
        />
      }
      showFooter={false}
    >
      <Box sx={{ width: '100%' }}>
        <TrustStrip />
        <Showcase />
        <Features />
        <ChoosePath />
        <SmartSpotlight />
        <FinalCTA
          title="Run smarter. Grow faster."
          description="One modern platform for stronger partner control and a better management experience."
          ctaText="Partner portal"
          ctaLink="/login"
        />
        <Footer />
      </Box>
    </Page>
  );
}
