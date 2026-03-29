import { Box, Chip, Stack, TextField, Typography } from '@mui/material';
import * as React from 'react';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  placeholder?: string;
};

export default function ExpertiseChipsInput({
  value,
  onChange,
  label = 'Expertise',
  placeholder = 'Type and press Enter (e.g., Fade, Beard, Color)',
}: Props) {
  const [input, setInput] = React.useState('');

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  }

  return (
    <Box>
      <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
        {label}
      </Typography>

      <TextField
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTag(input);
            setInput('');
          }
        }}
      />

      <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
        {value.map((t) => (
          <Chip
            key={t}
            label={t}
            onDelete={() => onChange(value.filter((x) => x !== t))}
            sx={{ mb: 1 }}
          />
        ))}
      </Stack>
    </Box>
  );
}
