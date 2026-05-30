import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  AccountCircle,
  AdminPanelSettings,
  Login,
  Logout,
  Search,
  ShoppingCart,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { CITIES } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [term, setTerm] = useState('');
  const { city, setCity } = useUiStore();
  const { logout, user } = useAuth();
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  const isAdmin = useAuthStore((state) => state.hasRole('ROLE_ADMIN'));
  const { count } = useCart();

  const runSearch = (event) => {
    event.preventDefault();
    navigate(`/products?search=${encodeURIComponent(term.trim())}`);
  };

  const goCart = () => {
    if (!authenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent('/cart')}`);
      return;
    }
    navigate('/cart');
  };

  return (
    <AppBar position="sticky" color="inherit" elevation={2}>
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64, md: 76 } }}>
        <Typography
          component={RouterLink}
          to="/"
          variant="h5"
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            fontSize: { xs: '1.1rem', sm: '1.4rem', md: '1.6rem' },
          }}
        >
          Organo India
        </Typography>

        <Select
          size="small"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          aria-label="Select delivery city"
          sx={{ minWidth: { xs: 120, md: 150 }, display: { xs: 'none', sm: 'flex' } }}
        >
          {CITIES.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>

        <Box
          component="form"
          onSubmit={runSearch}
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <TextField
            fullWidth
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search organic vegetables"
            aria-label="Search products"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', lg: 'flex' } }}>
          <Button component={RouterLink} to="/products">
            Products
          </Button>
          {authenticated ? (
            <Button component={RouterLink} to="/orders">
              Orders
            </Button>
          ) : null}
          {isAdmin ? (
            <Button component={RouterLink} to="/admin" startIcon={<AdminPanelSettings />}>
              Admin
            </Button>
          ) : null}
        </Stack>

        {isMobile ? (
          <IconButton aria-label="Search products" onClick={() => navigate('/products')}>
            <Search />
          </IconButton>
        ) : null}

        <IconButton aria-label="Open cart" onClick={goCart}>
          <Badge badgeContent={authenticated ? count : 0} color="secondary">
            <ShoppingCart />
          </Badge>
        </IconButton>

        <IconButton
          aria-label="Open account menu"
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}>
            {user?.name?.[0]?.toUpperCase() ?? <AccountCircle />}
          </Avatar>
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {authenticated ? (
            [
              <MenuItem
                key="profile"
                component={RouterLink}
                to="/profile"
                onClick={() => setAnchorEl(null)}
              >
                Profile
              </MenuItem>,
              <MenuItem
                key="orders"
                component={RouterLink}
                to="/orders"
                onClick={() => setAnchorEl(null)}
              >
                Orders
              </MenuItem>,
              <MenuItem
                key="logout"
                onClick={() => {
                  setAnchorEl(null);
                  logout();
                }}
              >
                <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>,
            ]
          ) : (
            <MenuItem
              component={RouterLink}
              to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`}
              onClick={() => setAnchorEl(null)}
            >
              <Login fontSize="small" sx={{ mr: 1 }} /> Login
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
