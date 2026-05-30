import { Box, Container, Grid, Link, Stack, Typography } from '@mui/material';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { CATEGORIES, CITIES } from '../../utils/constants';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', mt: 4 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 }, pb: { xs: 10, md: 5 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h5">Organo India</Typography>
            <Typography sx={{ mt: 1, opacity: 0.86 }}>
              Certified organic vegetables delivered fresh across Indian cities.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Cities</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
              {CITIES.map((city) => (
                <Typography key={city} variant="body2" sx={{ width: { xs: '45%', sm: '40%' } }}>
                  {city}
                </Typography>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Categories</Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {CATEGORIES.slice(0, 5).map((category) => (
                <Link key={category} href="/products" color="inherit" underline="hover">
                  {category}
                </Link>
              ))}
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 2, fontSize: 24 }}>
              <FaInstagram aria-label="Instagram" />
              <FaFacebook aria-label="Facebook" />
              <FaWhatsapp aria-label="WhatsApp" />
            </Stack>
          </Grid>
        </Grid>
        <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
          Copyright {new Date().getFullYear()} Organo India. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
