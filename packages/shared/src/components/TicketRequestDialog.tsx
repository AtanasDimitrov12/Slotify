import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: 20, pt: 3, pb: 1 }}>
        {requestType === 'owner' ? 'Request Feature' : 'Submit Feedback'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 1 }}>
            Help us improve the platform. Provide details about your request below.
          </Typography>

          <TextField
            fullWidth
            label="Title"
            size="small"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="What would you like to see?"
            InputLabelProps={{ shrink: true }}
          />

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel shrink>Type</InputLabel>
              <Select
                notched
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TicketType })}
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

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            size="small"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the feature or issue..."
            InputLabelProps={{ shrink: true }}
          />

          {requestType === 'owner' && (
            <>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="User Stories"
                size="small"
                value={formData.userStories}
                onChange={(e) => setFormData({ ...formData, userStories: e.target.value })}
                placeholder="As a..., I want..., so that..."
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Acceptance Criteria"
                size="small"
                value={formData.acceptanceCriteria}
                onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Business Value"
                size="small"
                value={formData.nonTechnicalAcceptanceCriteria}
                onChange={(e) =>
                  setFormData({ ...formData, nonTechnicalAcceptanceCriteria: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
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
