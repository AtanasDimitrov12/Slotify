import { addReservationReview, type CustomerReservation } from '@barber/shared';
import {
  AddPhotoAlternateRounded,
  DeleteRounded,
  HistoryRounded,
  LocationOnRounded,
  PersonRounded,
  RateReviewRounded,
  SearchRounded,
  StarRounded,
} from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

interface Props {
  reservations: CustomerReservation[];
  onReviewAdded: () => void;
}

type ReviewPicture = {
  id: string;
  url: string;
};

export default function BookingHistory({ reservations, onReviewAdded }: Props) {
  const [searchDate, setSearchDate] = useState('');
  const [selectedRes, setSelectedRes] = useState<CustomerReservation | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [pictures, setPictures] = useState<ReviewPicture[]>([]);
  const [newPicUrl, setNewPicUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredReservations = useMemo(() => {
    if (!searchDate) return reservations;
    return reservations.filter((res) => res.startTime.startsWith(searchDate));
  }, [reservations, searchDate]);

  const handleOpenReview = (res: CustomerReservation) => {
    setSelectedRes(res);
    setRating(res.review?.rating || 5);
    setComment(res.review?.comment || '');
    setPictures(
      (res.review?.pictures || []).map((url) => ({
        id: crypto.randomUUID(),
        url,
      })),
    );
  };

  const handleCloseReview = () => {
    setSelectedRes(null);
    setRating(5);
    setComment('');
    setPictures([]);
    setNewPicUrl('');
  };

  const handleAddPicture = () => {
    if (newPicUrl.trim()) {
      setPictures((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          url: newPicUrl.trim(),
        },
      ]);
      setNewPicUrl('');
    }
  };

  const handleRemovePicture = (id: string) => {
    setPictures((prev) => prev.filter((pic) => pic.id !== id));
  };

  const handleSubmitReview = async () => {
    if (!selectedRes) return;
    try {
      setSubmitting(true);
      await addReservationReview(selectedRes._id, {
        rating,
        comment,
        pictures: pictures.map((pic) => pic.url),
      });
      onReviewAdded();
      handleCloseReview();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (reservations.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
          No past bookings
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Your completed appointments will appear here.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box sx={{ mb: 1 }}>
        <TextField
          fullWidth
          type="date"
          label="Filter by Date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 300 }}
        />
      </Box>

      {filteredReservations.map((res) => (
        <Card
          key={res._id}
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid rgba(15,23,42,0.08)',
            opacity: res.status === 'cancelled' || res.status === 'no-show' ? 0.7 : 1,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                px: 3,
                py: 1.5,
                bgcolor: alpha('#64748B', 0.03),
                borderBottom: '1px solid rgba(15,23,42,0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={res.status.toUpperCase()}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 800, fontSize: 10, borderRadius: 1 }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  REF: {res._id.slice(-6).toUpperCase()}
                </Typography>
              </Stack>

              {res.status === 'completed' && (
                <Button
                  size="small"
                  startIcon={<RateReviewRounded />}
                  onClick={() => handleOpenReview(res)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    color: '#7C6CFF',
                    '&:hover': { bgcolor: alpha('#7C6CFF', 0.05) },
                  }}
                >
                  {res.review ? 'Edit Review' : 'Add Review'}
                </Button>
              )}
            </Box>

            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.5,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: alpha('#7C6CFF', 0.1),
                          color: '#7C6CFF',
                        }}
                      >
                        <HistoryRounded />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 900, fontSize: 17, color: '#0F172A' }}>
                          {new Date(res.startTime).toLocaleDateString([], {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary', fontWeight: 600 }}
                        >
                          {res.serviceName} • {res.durationMin} min • €{res.priceEUR}
                        </Typography>
                      </Box>
                    </Stack>

                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: '#94A3B8',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            display: 'block',
                            mb: 0.5,
                          }}
                        >
                          Salon
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOnRounded sx={{ fontSize: 16, color: '#64748B' }} />
                          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                            {res.tenantId.name}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: '#94A3B8',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            display: 'block',
                            mb: 0.5,
                          }}
                        >
                          Staff
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PersonRounded sx={{ fontSize: 16, color: '#64748B' }} />
                          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                            {res.staffName}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>

                    {res.review && (
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 4,
                          bgcolor: alpha('#F59E0B', 0.04),
                          border: '1px solid rgba(245,158,11,0.1)',
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                          <Rating value={res.review.rating} readOnly size="small" />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: '#F59E0B', letterSpacing: 0.5 }}
                          >
                            YOUR EXPERIENCE
                          </Typography>
                        </Stack>
                        {res.review.comment && (
                          <Typography
                            variant="body2"
                            sx={{ fontStyle: 'italic', color: '#475569', lineHeight: 1.6, mb: 1.5 }}
                          >
                            "{res.review.comment}"
                          </Typography>
                        )}
                        {(res.review?.pictures ?? []).length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
                            {(res.review?.pictures ?? []).map((pic) => (
                              <Box
                                key={pic}
                                component="img"
                                src={pic}
                                sx={{
                                  width: 70,
                                  height: 70,
                                  borderRadius: 2,
                                  objectFit: 'cover',
                                  border: '1px solid rgba(0,0,0,0.05)',
                                }}
                              />
                            ))}
                          </Stack>
                        )}
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Review Dialog */}
      <Dialog open={!!selectedRes} onClose={handleCloseReview} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>
          {selectedRes?.review ? 'Edit your review' : 'Add a review'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                How was your experience?
              </Typography>
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue || 5)}
                size="large"
                emptyIcon={<StarRounded style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
            </Box>
            <TextField
              label="Description (optional)"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or what could be better..."
              fullWidth
            />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Pictures
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 1 }}>
                {pictures.map((pic) => (
                  <Box key={pic.id} sx={{ position: 'relative', flexShrink: 0 }}>
                    <Box
                      component="img"
                      src={pic.url}
                      sx={{ width: 80, height: 80, borderRadius: 2, objectFit: 'cover' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemovePicture(pic.id)}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: '#EF4444',
                        color: 'white',
                        '&:hover': { bgcolor: '#DC2626' },
                      }}
                    >
                      <DeleteRounded fontSize="inherit" />
                    </IconButton>
                  </Box>
                ))}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    border: '2px dashed rgba(0,0,0,0.1)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'text.secondary',
                    flexShrink: 0,
                  }}
                >
                  <AddPhotoAlternateRounded />
                </Box>
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  label="Add picture URL"
                  value={newPicUrl}
                  onChange={(e) => setNewPicUrl(e.target.value)}
                  fullWidth
                />
                <Button variant="outlined" onClick={handleAddPicture} sx={{ fontWeight: 700 }}>
                  Add
                </Button>
              </Stack>
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Note: Reviews help our professionals and other customers. Thank you!
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseReview} sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitting}
            onClick={handleSubmitReview}
            sx={{
              bgcolor: '#7C6CFF',
              fontWeight: 800,
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#6B5CFA' },
            }}
          >
            {submitting ? 'Saving...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
