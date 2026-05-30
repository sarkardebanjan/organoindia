import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EmptyState from '../assets/illustrations/EmptyState';
import PageWrapper from '../components/layout/PageWrapper';

export default function Unauthorized() {
  return (
    <PageWrapper maxWidth="sm">
      <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: 6 }}>
        <EmptyState type="unauthorized" />
        <Typography variant="h3">Access denied</Typography>
        <Typography color="text.secondary">
          Your account does not have permission to view this area.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Back to home
        </Button>
      </Stack>
    </PageWrapper>
  );
}
