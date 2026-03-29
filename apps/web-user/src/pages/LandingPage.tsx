import {
  ChoosePath,
  Features,
  FinalCTA,
  Footer,
  Hero,
  Page,
  Showcase,
  SmartSpotlight,
  TrustStrip,
} from '@barber/shared';
import { Box } from '@mui/material';

export default function LandingPage() {
  return (
    <Page
      hero={
        <Hero
          eyebrow="Customer App"
          title="SLOTIFY"
          subtitle1="BOOK YOUR SALON IN SECONDS"
          subtitle2="LIVE SLOTS. INSTANT BOOKING."
          description="Find the best barbershops and salons, check their real-time availability, and secure your spot without making a single call."
          primaryCtaText="Explore and Book"
          primaryCtaLink="/salons"
          secondaryCtaText="For partners"
          secondaryCtaLink="/partner"
          chipLabel="Slotify — book your next appointment"
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
          title="Your next sharp look is just a few clicks away."
          description="Join thousands of customers who book their grooming appointments the modern way."
          ctaText="Explore salons"
          ctaLink="/salons"
        />
        <Footer />
      </Box>
    </Page>
  );
}
