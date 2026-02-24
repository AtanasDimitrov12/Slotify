import { Grid } from '@mui/material';

import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { FeatureCard } from './FeatureCard';
import { SectionTitle } from './SectionTitle';

export function Features() {
  return (
    <>
      <SectionTitle
        kicker="Core MVP features"
        title="Modern booking engine — not just a calendar"
        desc="Slots are generated from schedule + rules + existing reservations. Then we recommend times that reduce empty gaps."
        align="center"
      />
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<CalendarMonthRoundedIcon />}
            title="Dynamic slot generation"
            desc="Opening hours + duration → consistent slots that make sense."
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard icon={<BoltRoundedIcon />} title="No overlaps" desc="Conflict checks prevent double bookings automatically." />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard icon={<GroupsRoundedIcon />} title="Waitlist" desc="If a day is full, customers can queue for the next opening." />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<AutoAwesomeRoundedIcon />}
            title="Recommended slots"
            desc="Prioritizes times next to existing bookings to minimize gaps."
          />
        </Grid>
      </Grid>
    </>
  );
}
