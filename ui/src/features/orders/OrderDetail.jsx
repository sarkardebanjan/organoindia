import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { ordersApi } from '../../api/ordersApi';
import PageWrapper from '../../components/layout/PageWrapper';
import OrderTimeline from '../../components/order/OrderTimeline';
import StatusChip from '../../components/order/StatusChip';
import { formatCurrency } from '../../utils/formatters';

export default function OrderDetail() {
  const { id } = useParams();
  const orderQuery = useQuery({ queryKey: ['order', id], queryFn: () => ordersApi.detail(id) });
  const order = orderQuery.data;

  return (
    <PageWrapper>
      {orderQuery.isLoading ? (
        <Skeleton height={360} />
      ) : (
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Order #{order.id}</Typography>
            <StatusChip status={order.status} />
          </Stack>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Items
                </Typography>
                {(order.items ?? []).map((item) => {
                  const product = item.product ?? item;
                  return (
                    <Stack
                      key={item.id ?? product.id}
                      direction="row"
                      justifyContent="space-between"
                      sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}
                    >
                      <Typography>
                        {product.name} x {item.quantity}
                      </Typography>
                      <Typography>{formatCurrency(item.lineTotal ?? product.price)}</Typography>
                    </Stack>
                  );
                })}
                <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
                  {formatCurrency(order.total)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Delivery timeline
                </Typography>
                <OrderTimeline status={order.status} />
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      )}
    </PageWrapper>
  );
}
