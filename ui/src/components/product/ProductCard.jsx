import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import { AddShoppingCart } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));

  const handleAdd = () => {
    const detailPath = `/products/${product.id}`;
    if (!authenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent(detailPath)}`);
      return;
    }
    addItem({ productId: product.id, quantity: 1 });
  };

  return (
    <Card
      component={motion.article}
      whileHover={{ scale: 1.02 }}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <Box
        component={RouterLink}
        to={`/products/${product.id}`}
        sx={{
          display: 'block',
          aspectRatio: '4 / 3',
          bgcolor: 'primary.50',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={product.imageUrl ?? product.images?.[0] ?? '/vite.svg'}
          alt={product.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      <CardContent sx={{ flex: 1 }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" gap={1}>
            <Typography
              component={RouterLink}
              to={`/products/${product.id}`}
              variant="h6"
              sx={{
                color: 'text.primary',
                textDecoration: 'none',
                fontSize: { xs: '0.98rem', md: '1.1rem' },
                lineHeight: 1.2,
              }}
            >
              {product.name}
            </Typography>
            {product.certifiedOrganic ? (
              <Chip size="small" color="primary" label="Organic" />
            ) : null}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Rating value={product.rating ?? 4.5} precision={0.5} size="small" readOnly />
            <Typography variant="body2" color="text.secondary">
              {product.rating ?? 4.5}
            </Typography>
          </Stack>
          <Typography color="text.secondary" variant="body2">
            {product.unit ? `per ${product.unit}` : 'fresh harvest'}
          </Typography>
          <Typography variant="h6" color="primary.main">
            {formatCurrency(product.price)}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCart />}
          onClick={handleAdd}
          disabled={product.stockStatus === 'OUT_OF_STOCK' || product.stock === 0}
        >
          Add
        </Button>
      </CardActions>
    </Card>
  );
}
