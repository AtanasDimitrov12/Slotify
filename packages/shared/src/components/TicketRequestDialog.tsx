import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import {
  createTicket,
  type TicketPriority,
  type TicketStage,
  type TicketType,
} from '../api/tickets';
import RichTextSection from './RichTextSection';

interface TicketRequestDialogProps {
  open: boolean;
  onClose: () => void;
  requestType: 'owner' | 'user';
}

export default function TicketRequestDialog({
  open,
  onClose,
  requestType,
}: TicketRequestDialogProps) {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    userStories: '',
    acceptanceCriteria: '',
    nonTechnicalAcceptanceCriteria: '',
    priority: 'medium' as TicketPriority,
    type: 'feature' as TicketType,
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const stage: TicketStage = requestType === 'owner' ? 'owner_requested' : 'user_requested';
      await createTicket({
        ...formData,
        stage,
      });
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        userStories: '',
        acceptanceCriteria: '',
        nonTechnicalAcceptanceCriteria: '',
        priority: 'medium',
        type: 'feature',
      });
    } catch (err) {
      console.error('Failed to create ticket request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          bgcolor: '#F8FAFC',
        },
      }}
    >
      <DialogTitle sx={{ pt: 3, pb: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 24, color: '#0F172A' }}>
          {requestType === 'owner' ? 'Request Feature' : 'Submit Feedback'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pb: 4 }}>
        <Grid container spacing={3}>
          {/* Main Content Column */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                variant="standard"
                placeholder={requestType === 'owner' ? 'Feature name...' : 'Feedback title...'}
                InputProps={{
                  disableUnderline: false,
                  sx: {
                    fontSize: 20,
                    fontWeight: 700,
                    '&:before, &:after': { borderColor: '#E2E8F0' },
                  },
                }}
                InputLabelProps={{ shrink: true, sx: { fontWeight: 700, fontSize: 14 } }}
              />

              <RichTextSection
                label="Description"
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                placeholder="Describe the feature or issue in detail..."
              />

              {requestType === 'owner' && (
                <>
                  <RichTextSection
                    label="User Stories"
                    value={formData.userStories}
                    onChange={(val) => setFormData({ ...formData, userStories: val })}
                    placeholder="As a..., I want..., so that..."
                  />
                  <RichTextSection
                    label="Acceptance Criteria"
                    value={formData.acceptanceCriteria}
                    onChange={(val) => setFormData({ ...formData, acceptanceCriteria: val })}
                    placeholder="What does 'done' look like?"
                  />
                  <RichTextSection
                    label="Business Value"
                    value={formData.nonTechnicalAcceptanceCriteria}
                    onChange={(val) =>
                      setFormData({ ...formData, nonTechnicalAcceptanceCriteria: val })
                    }
                    placeholder="How does this help your business?"
                  />
                </>
              )}
            </Stack>
          </Grid>

          {/* Sidebar Column */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Stack
                spacing={2.5}
                sx={{ bgcolor: '#FFFFFF', p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0' }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#64748B', mb: 1 }}>
                  DETAILS
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Type</InputLabel>
                  <Select
                    notched
                    value={formData.type}
                    label="Type"
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as TicketType })
                    }
                  >
                    <MenuItem value="feature">Feature Request</MenuItem>
                    <MenuItem value="bugfix">Bug Report</MenuItem>
                    <MenuItem value="request">General Request</MenuItem>
                    <MenuItem value="question">Question</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel shrink>Priority</InputLabel>
                  <Select
                    notched
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as TicketPriority })
                    }
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <Button onClick={onClose} sx={{ fontWeight: 600, color: '#64748B', textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disableElevation
          disabled={loading || !formData.title}
          sx={{
            bgcolor: '#0F172A',
            borderRadius: 1.5,
            px: 3,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: '#1E293B' },
          }}
        >
          {loading ? 'Sending...' : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
