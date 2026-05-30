import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material';
import { Add, Delete, Remove } from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';

export default function CartItem({ item, onUpdate, onRemove }) {
  const product = item.product ?? item;
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}
    >
      <Avatar
        src={product.imageUrl ?? product.images?.[0]}
        alt={product.name}
        variant="rounded"
        sx={{ width: 64, height: 64 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" noWrap>
          {product.name}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {formatCurrency(product.price)} per {product.unit}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
          <IconButton
            aria-label={`Decrease ${product.name}`}
            onClick={() => onUpdate(item.id, Math.max(1, item.quantity - 1))}
          >
            <Remove fontSize="small" />
          </IconButton>
          <Typography sx={{ minWidth: 32, textAlign: 'center' }}>{item.quantity}</Typography>
          <IconButton
            aria-label={`Increase ${product.name}`}
            onClick={() => onUpdate(item.id, item.quantity + 1)}
          >
            <Add fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
      <Stack alignItems="flex-end" spacing={1}>
        <Typography variant="subtitle1">
          {formatCurrency(item.lineTotal ?? product.price * item.quantity)}
        </Typography>
        <IconButton aria-label={`Remove ${product.name}`} onClick={() => onRemove(item.id)}>
          <Delete />
        </IconButton>
      </Stack>
    </Stack>
  );
}
