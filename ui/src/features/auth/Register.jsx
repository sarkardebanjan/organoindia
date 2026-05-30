import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { z } from 'zod';
import { authApi } from '../../api/authApi';
import PageWrapper from '../../components/layout/PageWrapper';
import { CITIES } from '../../utils/constants';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number'),
  password: z.string().min(8, 'Use at least 8 characters'),
  city: z.string().min(1, 'Choose a city'),
});

export default function Register() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', mobile: '', password: '', city: CITIES[0] },
  });

  const onSubmit = async (values) => {
    try {
      await authApi.register(values);
      enqueueSnackbar('Account created. Please sign in.', { variant: 'success' });
      navigate('/login');
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message ?? 'Could not create account', {
        variant: 'error',
      });
    }
  };

  return (
    <PageWrapper maxWidth="sm">
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Typography variant="h4">Create your account</Typography>
            <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
              {[
                ['name', 'Full name'],
                ['email', 'Email'],
                ['mobile', 'Mobile'],
                ['password', 'Password'],
              ].map(([name, label]) => (
                <Controller
                  key={name}
                  name={name}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={label}
                      type={name === 'password' ? 'password' : 'text'}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              ))}
              <Controller
                name="city"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label="City"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  >
                    {CITIES.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Button type="submit" variant="contained" disabled={formState.isSubmitting}>
                Register
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
