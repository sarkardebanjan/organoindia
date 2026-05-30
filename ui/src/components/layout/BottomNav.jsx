import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home, LocalMall, Person, ReceiptLong, ShoppingCart } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { label: 'Home', value: '/', icon: <Home /> },
  { label: 'Shop', value: '/products', icon: <LocalMall /> },
  { label: 'Cart', value: '/cart', icon: <ShoppingCart />, protected: true },
  { label: 'Orders', value: '/orders', icon: <ReceiptLong />, protected: true },
  { label: 'Profile', value: '/profile', icon: <Person />, protected: true },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        display: { xs: 'block', md: 'none' },
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <BottomNavigation
        showLabels
        value={navItems.find((item) => location.pathname === item.value)?.value ?? false}
        onChange={(_event, value) => {
          const item = navItems.find((entry) => entry.value === value);
          if (item?.protected && !authenticated) {
            navigate(`/login?returnUrl=${encodeURIComponent(value)}`);
            return;
          }
          navigate(value);
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
            sx={{ minWidth: 44 }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
