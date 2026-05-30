import { Grid, Skeleton, Stack, Typography } from '@mui/material';
import EmptyPanel from '../../components/common/EmptyPanel';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import PageWrapper from '../../components/layout/PageWrapper';
import { useCart } from '../../hooks/useCart';

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem } = useCart();
  const items = cart?.items ?? [];

  return (
    <PageWrapper>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Your cart
      </Typography>
      {isLoading ? (
        <Stack spacing={1}>
          <Skeleton height={88} />
          <Skeleton height={88} />
          <Skeleton height={88} />
        </Stack>
      ) : null}
      {!isLoading && !items.length ? (
        <EmptyPanel
          title="Your cart is empty"
          message="Add fresh organic vegetables to start your order."
          actionLabel="Shop products"
          actionTo="/products"
        />
      ) : null}
      {!isLoading && items.length ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdate={(itemId, quantity) => updateItem({ itemId, quantity })}
                onRemove={removeItem}
              />
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <CartSummary cart={cart} />
          </Grid>
        </Grid>
      ) : null}
    </PageWrapper>
  );
}
