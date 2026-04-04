import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Rating,
  Stack,
  Typography,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import {
  HistoryRounded,
  LocationOnRounded,
  PersonRounded,
  ContentCutRounded,
  RateReviewRounded,
  StarRounded,
  AddPhotoAlternateRounded,
  DeleteRounded,
} from '@mui/icons-material';
import { useState } from 'react';
import { type CustomerReservation, addReservationReview } from '@barber/shared';

interface Props {
  reservations: CustomerReservation[];
  onReviewAdded: () => void;
}

export default function BookingHistory({ reservations, onReviewAdded }: Props) {
  const [selectedRes, setSelectedRes] = useState<CustomerReservation | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [pictures, setPictures] = useState<string[]>([]);
  const [newPicUrl, setNewPicUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenReview = (res: CustomerReservation) => {
    setSelectedRes(res);
    setRating(res.review?.rating || 5);
    setComment(res.review?.comment || '');
    setPictures(res.review?.pictures || []);
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
      setPictures((prev) => [...prev, newPicUrl.trim()]);
      setNewPicUrl('');
    }
  };

  const handleRemovePicture = (index: number) => {
    setPictures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!selectedRes) return;
    try {
      setSubmitting(true);
      await addReservationReview(selectedRes._id, {
        rating,
        comment,
        pictures,
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
      {reservations.map((res) => (
        <Card
          key={res._id}
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid rgba(15,23,42,0.08)',
            opacity: res.status === 'cancelled' || res.status === 'no-show' ? 0.7 : 1,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha('#64748B', 0.1),
                        color: '#64748B',
                      }}
                    >
                      <HistoryRounded />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                        {new Date(res.startTime).toLocaleDateString([], {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {res.serviceName} • €{res.priceEUR}
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                        Salon
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{res.tenantId.name}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                        Staff
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{res.staffId.displayName}</Typography>
                    </Grid>
                  </Grid>

                  {res.review && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: alpha('#F59E0B', 0.05),
                        border: '1px solid rgba(245,158,11,0.1)',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Rating value={res.review.rating} readOnly size="small" />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                          Your Review
                        </Typography>
                      </Stack>
                      {res.review.comment && (
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 1 }}>
                          "{res.review.comment}"
                        </Typography>
                      )}
                      {res.review.pictures && res.review.pictures.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1, overflowX: 'auto', pb: 1 }}>
                          {res.review.pictures.map((pic, i) => (
                            <Box
                              key={i}
                              component="img"
                              src={pic}
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: 1,
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

              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: { md: 'flex-end' } }}>
                <Stack spacing={1} sx={{ width: '100%', maxWidth: 200 }}>
                  <Chip
                    label={res.status.toUpperCase()}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 800,
                      fontSize: 10,
                      borderRadius: 1,
                      mb: 1,
                    }}
                  />
                  {res.status === 'completed' && !res.review && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<RateReviewRounded />}
                      onClick={() => handleOpenReview(res)}
                      sx={{
                        bgcolor: '#7C6CFF',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#6B5CFA' },
                      }}
                    >
                      Add Review
                    </Button>
                  )}
                  {res.review && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RateReviewRounded />}
                      onClick={() => handleOpenReview(res)}
                      sx={{
                        color: '#7C6CFF',
                        borderColor: alpha('#7C6CFF', 0.3),
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        '&:hover': { borderColor: '#7C6CFF', bgcolor: alpha('#7C6CFF', 0.05) },
                      }}
                    >
                      Edit Review
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
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
                {pictures.map((url, i) => (
                  <Box key={i} sx={{ position: 'relative', flexShrink: 0 }}>
                    <Box
                      component="img"
                      src={url}
                      sx={{ width: 80, height: 80, borderRadius: 2, objectFit: 'cover' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemovePicture(i)}
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
                <Button variant="outlined" onClick={handleAddPicture} sx={{ fontWeight: 700 }}>Add</Button>
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
