import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EmptyState from '../assets/illustrations/EmptyState';
import PageWrapper from '../components/layout/PageWrapper';

export default function NotFound() {
  return (
    <PageWrapper maxWidth="sm">
      <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: 6 }}>
        <EmptyState type="not found" />
        <Typography variant="h3">Page not found</Typography>
        <Typography color="text.secondary">
          The page you are looking for has moved or does not exist.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Go home
        </Button>
      </Stack>
    </PageWrapper>
  );
}
