import { Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PathCard } from './PathCard';
import { SectionTitle } from './SectionTitle';

export function ChoosePath() {
  const navigate = useNavigate();

  return (
    <Box>
      <SectionTitle
        kicker="Choose your path"
        title="Built for customers and for salons"
        desc="Fast discovery and booking for people — control, rules, and schedule optimization for partners."
        align="center"
      />
      <Grid container spacing={2.2} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          {/* Customers uses your 2.png */}
          <PathCard
            title="For customers"
            desc="Find barbers in a new city, compare services & prices, and book instantly."
            chips={['Search by city', 'Live slots', 'Guest booking']}
            cta="Explore salons"
            onClick={() => navigate('/places')}
            imageLabel="Customer marketplace"
            imageSrc="/landing/2.png"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Partners uses your 4.png */}
          <PathCard
            title="For partners"
            desc="A clean calendar + booking rules + fewer empty gaps. Get discovered through reviews."
            chips={['Calendar control', 'Rules & policies', 'Analytics']}
            cta="Become a partner"
            onClick={() => navigate('/partner')}
            imageLabel="Partner calendar & dashboard"
            imageSrc="/landing/4.png"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
