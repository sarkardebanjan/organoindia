import { Grid } from '@mui/material';
import ProductCard from './ProductCard';

export default function ProductGrid({ products = [] }) {
  return (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid item xs={products.length === 1 ? 12 : 6} md={6} lg={4} key={product.id}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
}
