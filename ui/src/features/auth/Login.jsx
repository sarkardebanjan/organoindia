import { zodResolver } from '@hookform/resolvers/zod';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { z } from 'zod';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginPending } = useAuth();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <PageWrapper maxWidth="sm">
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4">Welcome back</Typography>
              <Typography color="text.secondary">Sign in to continue your fresh order.</Typography>
            </Box>
            <Stack component="form" spacing={2} onSubmit={handleSubmit(login)}>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Email"
                    autoComplete="email"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="Toggle password visibility"
                            onClick={() => setShowPassword((value) => !value)}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Button type="submit" variant="contained" disabled={loginPending}>
                Login
              </Button>
            </Stack>
            <Typography>
              New here?{' '}
              <Link component={RouterLink} to="/register">
                Create an account
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
