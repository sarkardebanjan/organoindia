import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowForward, LocationOn } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import ProductGrid from '../components/product/ProductGrid';
import ProductSkeleton from '../components/product/ProductSkeleton';
import PageWrapper from '../components/layout/PageWrapper';
import { CATEGORIES, CITIES } from '../utils/constants';
import { useUiStore } from '../store/uiStore';

export default function Home() {
  const { city, setCity } = useUiStore();
  const featuredQuery = useQuery({
    queryKey: ['featured-products', city],
    queryFn: () => productsApi.list({ city, featured: true, size: 6 }),
  });
  const products = featuredQuery.data?.items ?? featuredQuery.data?.content ?? [];

  return (
    <PageWrapper sx={{ pt: { xs: 2, md: 3 } }}>
      <Stack spacing={4}>
        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 420, md: 480 },
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            bgcolor: 'primary.main',
            backgroundImage:
              'linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.66)), url(https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Stack
            spacing={2}
            sx={{
              color: 'white',
              p: { xs: 3, md: 5 },
              maxWidth: 640,
            }}
          >
            <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.8rem' } }}>
              Organo India
            </Typography>
            <Typography variant="h6">
              Certified organic vegetables, harvested fresh and delivered across your city.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                aria-label="Select city"
                InputProps={{ startAdornment: <LocationOn sx={{ mr: 1 }} /> }}
                sx={{ minWidth: 220, bgcolor: 'background.paper', borderRadius: 1 }}
              >
                {CITIES.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                component={RouterLink}
                to="/products"
                variant="contained"
                color="secondary"
                endIcon={<ArrowForward />}
              >
                Shop now
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Grid container spacing={2}>
          {CATEGORIES.slice(0, 4).map((category) => (
            <Grid item xs={6} md={3} key={category}>
              <Card component={RouterLink} to={`/products?category=${encodeURIComponent(category)}`} sx={{ textDecoration: 'none' }}>
                <CardContent>
                  <Typography variant="h6" color="text.primary">
                    {category}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Farm-direct picks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h4">Featured this week</Typography>
            <Button component={RouterLink} to="/products" endIcon={<ArrowForward />}>
              View all
            </Button>
          </Stack>
          {featuredQuery.isLoading ? <ProductSkeleton /> : <ProductGrid products={products} />}
          {!featuredQuery.isLoading && !products.length ? <Skeleton height={160} /> : null}
        </Box>

        <Grid container spacing={2}>
          {['Free delivery above ₹499', 'Morning, afternoon, evening slots'].map((text) => (
            <Grid item xs={12} md={6} key={text}>
              <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5">{text}</Typography>
                  <Typography sx={{ opacity: 0.9 }}>
                    Thoughtful service for everyday Indian grocery routines.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </PageWrapper>
  );
}
