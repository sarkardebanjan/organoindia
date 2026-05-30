import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Rating,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Add, AddShoppingCart, Remove } from '@mui/icons-material';
import { productsApi } from '../../api/productsApi';
import PageWrapper from '../../components/layout/PageWrapper';
import ProductGrid from '../../components/product/ProductGrid';
import ProductSkeleton from '../../components/product/ProductSkeleton';
import { useCart } from '../../hooks/useCart';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/formatters';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  const { addItem } = useCart();
  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.detail(id),
  });
  const relatedQuery = useQuery({
    queryKey: ['related-products', id],
    queryFn: () => productsApi.related(id),
  });

  const product = productQuery.data;
  const images = product?.images?.length ? product.images : [product?.imageUrl].filter(Boolean);
  const [activeImage, setActiveImage] = useState(null);
  const heroImage = activeImage ?? images[0];

  const handleAdd = () => {
    if (!authenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent(`/products/${id}`)}`);
      return;
    }
    addItem({ productId: id, quantity });
  };

  return (
    <PageWrapper>
      {productQuery.isLoading ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 3', borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton height={48} />
            <Skeleton height={28} width="60%" />
            <Skeleton height={120} />
          </Grid>
        </Grid>
      ) : (
        <Stack spacing={4}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={heroImage ?? '/vite.svg'}
                alt={product.name}
                sx={{
                  width: '100%',
                  aspectRatio: '4 / 3',
                  objectFit: 'cover',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1, overflowX: 'auto' }}>
                {images.map((image) => (
                  <Box
                    component="button"
                    key={image}
                    onClick={() => setActiveImage(image)}
                    sx={{
                      border: 0,
                      p: 0,
                      bgcolor: 'transparent',
                      width: 72,
                      height: 72,
                      flex: '0 0 auto',
                      cursor: 'pointer',
                    }}
                    aria-label={`View ${product.name} image`}
                  >
                    <Box
                      component="img"
                      src={image}
                      alt=""
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Chip
                  label={product.stockStatus === 'OUT_OF_STOCK' ? 'Out of stock' : 'In stock'}
                  color={product.stockStatus === 'OUT_OF_STOCK' ? 'error' : 'success'}
                  sx={{ alignSelf: 'flex-start' }}
                />
                <Typography variant="h3">{product.name}</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Rating value={product.rating ?? 4.5} precision={0.5} readOnly />
                  <Typography color="text.secondary">{product.rating ?? 4.5}</Typography>
                </Stack>
                <Typography variant="h4" color="primary.main">
                  {formatCurrency(product.price)}
                  <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                    per {product.unit}
                  </Typography>
                </Typography>
                <Typography color="text.secondary">{product.description}</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  >
                    <Remove />
                  </IconButton>
                  <Typography variant="h6" sx={{ minWidth: 44, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((value) => value + 1)}
                  >
                    <Add />
                  </IconButton>
                </Stack>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddShoppingCart />}
                  onClick={handleAdd}
                  disabled={product.stockStatus === 'OUT_OF_STOCK'}
                >
                  Add to Cart
                </Button>
              </Stack>
            </Grid>
          </Grid>
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Related products
            </Typography>
            {relatedQuery.isLoading ? (
              <ProductSkeleton count={3} />
            ) : (
              <ProductGrid products={relatedQuery.data?.items ?? relatedQuery.data ?? []} />
            )}
          </Box>
        </Stack>
      )}
    </PageWrapper>
  );
}
