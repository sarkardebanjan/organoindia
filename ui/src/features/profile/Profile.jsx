import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Button, Card, CardContent, Grid, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { usersApi } from '../../api/usersApi';
import PageWrapper from '../../components/layout/PageWrapper';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid mobile number'),
  password: z.string().optional(),
});

export default function Profile() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const profileQuery = useQuery({ queryKey: ['profile'], queryFn: usersApi.profile });
  const { control, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(schema),
    values: profileQuery.data
      ? {
          name: profileQuery.data.name ?? '',
          email: profileQuery.data.email ?? '',
          mobile: profileQuery.data.mobile ?? '',
          password: '',
        }
      : undefined,
    defaultValues: { name: '', email: '', mobile: '', password: '' },
  });

  const updateProfile = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      reset({ ...data, password: '' });
      enqueueSnackbar('Profile updated', { variant: 'success' });
    },
    onError: (error) =>
      enqueueSnackbar(error.response?.data?.message ?? 'Could not update profile', {
        variant: 'error',
      }),
  });

  return (
    <PageWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h4">Profile</Typography>
                {profileQuery.isLoading ? (
                  <Skeleton height={260} />
                ) : (
                  <Stack component="form" spacing={2} onSubmit={handleSubmit(updateProfile.mutate)}>
                    {[
                      ['name', 'Name'],
                      ['email', 'Email'],
                      ['mobile', 'Mobile'],
                      ['password', 'New password'],
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
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={formState.isSubmitting || updateProfile.isPending}
                    >
                      Save changes
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageWrapper>
  );
}
