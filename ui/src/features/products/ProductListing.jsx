import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Drawer,
  FormControlLabel,
  Grid,
  MenuItem,
  Pagination,
  Paper,
  Rating,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FilterList, GridView, ViewList } from '@mui/icons-material';
import { productsApi } from '../../api/productsApi';
import EmptyPanel from '../../components/common/EmptyPanel';
import PageWrapper from '../../components/layout/PageWrapper';
import ProductGrid from '../../components/product/ProductGrid';
import ProductSkeleton from '../../components/product/ProductSkeleton';
import { CATEGORIES, CITIES } from '../../utils/constants';
import { useDebounce } from '../../hooks/useDebounce';

const defaultFilters = {
  category: '',
  city: '',
  price: [0, 1000],
  organic: false,
  rating: 0,
};

function Filters({ filters, setFilters }) {
  return (
    <Stack spacing={2} sx={{ p: { xs: 2, md: 0 } }}>
      <Typography variant="h6">Filters</Typography>
      <TextField
        select
        label="Category"
        value={filters.category}
        onChange={(event) => setFilters({ ...filters, category: event.target.value })}
      >
        <MenuItem value="">All categories</MenuItem>
        {CATEGORIES.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="City"
        value={filters.city}
        onChange={(event) => setFilters({ ...filters, city: event.target.value })}
      >
        <MenuItem value="">All cities</MenuItem>
        {CITIES.map((city) => (
          <MenuItem key={city} value={city}>
            {city}
          </MenuItem>
        ))}
      </TextField>
      <Box>
        <Typography gutterBottom>Price range</Typography>
        <Slider
          value={filters.price}
          min={0}
          max={1000}
          step={25}
          valueLabelDisplay="auto"
          onChange={(_event, value) => setFilters({ ...filters, price: value })}
        />
      </Box>
      <FormControlLabel
        control={
          <Switch
            checked={filters.organic}
            onChange={(event) => setFilters({ ...filters, organic: event.target.checked })}
          />
        }
        label="Certified organic"
      />
      <Stack spacing={1}>
        <Typography>Minimum rating</Typography>
        <Rating
          value={filters.rating}
          onChange={(_event, value) => setFilters({ ...filters, rating: value ?? 0 })}
        />
      </Stack>
    </Stack>
  );
}

export default function ProductListing() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [sort, setSort] = useState('popularity');
  const [page, setPage] = useState(1);
  const [view, setView] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const debouncedSearch = useDebounce(search, 300);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      sort,
      page,
      category: filters.category || undefined,
      city: filters.city || undefined,
      minPrice: filters.price[0],
      maxPrice: filters.price[1],
      organic: filters.organic || undefined,
      rating: filters.rating || undefined,
    }),
    [debouncedSearch, sort, page, filters],
  );

  const productsQuery = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsApi.list(queryParams),
  });

  const products = productsQuery.data?.items ?? productsQuery.data?.content ?? [];
  const totalPages = productsQuery.data?.totalPages ?? 1;

  return (
    <PageWrapper>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h4">Organic vegetables</Typography>
            <Typography color="text.secondary">Freshly sourced for your city.</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              sx={{ minWidth: { xs: '100%', sm: 280 } }}
            />
            <TextField
              select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              label="Sort"
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="popularity">Popularity</MenuItem>
              <MenuItem value="price_asc">Price low to high</MenuItem>
              <MenuItem value="price_desc">Price high to low</MenuItem>
              <MenuItem value="newest">Newest</MenuItem>
            </TextField>
            <ToggleButtonGroup
              exclusive
              value={view}
              onChange={(_event, value) => value && setView(value)}
              aria-label="Product view"
            >
              <ToggleButton value="grid" aria-label="Grid view">
                <GridView />
              </ToggleButton>
              <ToggleButton value="list" aria-label="List view">
                <ViewList />
              </ToggleButton>
            </ToggleButtonGroup>
            {isMobile ? (
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFiltersOpen(true)}
              >
                Filters
              </Button>
            ) : null}
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {!isMobile ? (
            <Grid item md={3}>
              <Paper sx={{ p: 2, position: 'sticky', top: 96 }}>
                <Filters filters={filters} setFilters={setFilters} />
              </Paper>
            </Grid>
          ) : null}
          <Grid item xs={12} md={9}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {filters.category ? <Chip label={filters.category} /> : null}
                {filters.city ? <Chip label={filters.city} /> : null}
                {filters.organic ? <Chip color="primary" label="Certified organic" /> : null}
              </Stack>
              {productsQuery.isLoading ? <ProductSkeleton /> : null}
              {!productsQuery.isLoading && products.length ? (
                <ProductGrid products={products} compact={view === 'list'} />
              ) : null}
              {!productsQuery.isLoading && !products.length ? (
                <EmptyPanel
                  title="No vegetables found"
                  message="Try a different search, city, or price range."
                />
              ) : null}
              {totalPages > 1 ? (
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_event, value) => setPage(value)}
                  color="primary"
                  sx={{ alignSelf: 'center' }}
                />
              ) : null}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
      <Drawer
        anchor="bottom"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{ sx: { borderTopLeftRadius: 8, borderTopRightRadius: 8 } }}
      >
        <Filters filters={filters} setFilters={setFilters} />
        <Button variant="contained" sx={{ m: 2 }} onClick={() => setFiltersOpen(false)}>
          Apply filters
        </Button>
      </Drawer>
    </PageWrapper>
  );
}
