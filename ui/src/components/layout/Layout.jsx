import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <BottomNav />
    </Box>
  );
}
