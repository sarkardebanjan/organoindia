import { useQuery } from '@tanstack/react-query';
import { Skeleton, Stack, Typography } from '@mui/material';
import { ordersApi } from '../../api/ordersApi';
import EmptyPanel from '../../components/common/EmptyPanel';
import PageWrapper from '../../components/layout/PageWrapper';
import OrderCard from '../../components/order/OrderCard';

export default function OrdersList() {
  const ordersQuery = useQuery({ queryKey: ['orders'], queryFn: ordersApi.list });
  const orders = ordersQuery.data?.items ?? ordersQuery.data ?? [];
  return (
    <PageWrapper>
      <Stack spacing={2}>
        <Typography variant="h4">Your orders</Typography>
        {ordersQuery.isLoading ? (
          <>
            <Skeleton height={132} />
            <Skeleton height={132} />
          </>
        ) : null}
        {!ordersQuery.isLoading && !orders.length ? (
          <EmptyPanel
            title="No orders yet"
            message="Your delivered goodness will show up here."
            actionLabel="Start shopping"
            actionTo="/products"
          />
        ) : null}
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </Stack>
    </PageWrapper>
  );
}
