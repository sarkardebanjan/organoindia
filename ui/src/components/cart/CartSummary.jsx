import { Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

export default function CartSummary({ cart }) {
  const subtotal = cart?.subtotal ?? cart?.items?.reduce((sum, item) => {
    const product = item.product ?? item;
    return sum + product.price * item.quantity;
  }, 0) ?? 0;
  const deliveryFee = cart?.deliveryFee ?? (subtotal > 499 ? 0 : 40);
  const total = cart?.total ?? subtotal + deliveryFee;

  return (
    <Paper sx={{ p: 2, position: { md: 'sticky' }, top: { md: 96 } }}>
      <Stack spacing={1.5}>
        <Typography variant="h6">Order summary</Typography>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Subtotal</Typography>
          <Typography>{formatCurrency(subtotal)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Delivery</Typography>
          <Typography>{deliveryFee ? formatCurrency(deliveryFee) : 'Free'}</Typography>
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6">{formatCurrency(total)}</Typography>
        </Stack>
        <Button
          component={RouterLink}
          to="/checkout"
          variant="contained"
          disabled={!cart?.items?.length}
        >
          Checkout
        </Button>
      </Stack>
    </Paper>
  );
}
