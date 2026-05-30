import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EmptyState from '../../assets/illustrations/EmptyState';

export default function EmptyPanel({ title, message, actionLabel, actionTo }) {
  return (
    <Stack alignItems="center" spacing={2} sx={{ py: { xs: 5, md: 8 }, textAlign: 'center' }}>
      <EmptyState />
      <Typography variant="h5">{title}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        {message}
      </Typography>
      {actionLabel && actionTo ? (
        <Button component={RouterLink} to={actionTo} variant="contained">
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
