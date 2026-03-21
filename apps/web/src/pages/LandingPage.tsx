import { Box } from '@mui/material';
import { ChoosePath } from '../components/landing/ChoosePath';
import { Features } from '../components/landing/Features';
import { FinalCTA } from '../components/landing/FinalCTA';
import { Footer } from '../components/landing/Footer';
import { Hero } from '../components/landing/Hero';
import { Showcase } from '../components/landing/Showcase';
import { SmartSpotlight } from '../components/landing/SmartSpotlight';
import { TrustStrip } from '../components/landing/TrustStrip';
import { Page } from '../layout/Page';

export default function LandingPage() {
  return (
    <Page hero={<Hero />} showFooter={false}>
      <Box sx={{ width: '100%' }}>
        <TrustStrip />
        <Showcase />
        <Features />
        <ChoosePath />
        <SmartSpotlight />
        <FinalCTA />
        <Footer />
      </Box>
    </Page>
  );
}