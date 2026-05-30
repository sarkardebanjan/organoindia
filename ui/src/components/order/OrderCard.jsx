import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import StatusChip from './StatusChip';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function OrderCard({ order }) {
  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="h6">Order #{order.id}</Typography>
            <Typography color="text.secondary">{formatDate(order.createdAt)}</Typography>
            <StatusChip status={order.status} />
          </Stack>
          <Stack spacing={1} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
            <Typography variant="h6">{formatCurrency(order.total)}</Typography>
            <Button component={RouterLink} to={`/orders/${order.id}`} variant="outlined">
              View details
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
