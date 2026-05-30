import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { usersApi } from '../../api/usersApi';
import EmptyPanel from '../../components/common/EmptyPanel';
import PageWrapper from '../../components/layout/PageWrapper';
import { CITIES } from '../../utils/constants';

const schema = z.object({
  line1: z.string().min(4, 'Enter address line'),
  line2: z.string().optional(),
  city: z.string().min(1, 'Choose city'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a 6 digit pincode'),
});

export default function Addresses() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const addressesQuery = useQuery({ queryKey: ['addresses'], queryFn: usersApi.addresses });
  const { control, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { line1: '', line2: '', city: CITIES[0], pincode: '' },
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });
  const addAddress = useMutation({
    mutationFn: usersApi.addAddress,
    onSuccess: () => {
      invalidate();
      reset();
      enqueueSnackbar('Address added', { variant: 'success' });
    },
  });
  const deleteAddress = useMutation({ mutationFn: usersApi.deleteAddress, onSuccess: invalidate });
  const setDefault = useMutation({
    mutationFn: usersApi.setDefaultAddress,
    onSuccess: invalidate,
  });

  const addresses = addressesQuery.data ?? [];

  return (
    <PageWrapper>
      <Stack spacing={3}>
        <Typography variant="h4">Address book</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Stack component="form" spacing={2} onSubmit={handleSubmit(addAddress.mutate)}>
                  <Typography variant="h6">Add address</Typography>
                  {[
                    ['line1', 'Address line 1'],
                    ['line2', 'Address line 2'],
                    ['pincode', 'Pincode'],
                  ].map(([name, label]) => (
                    <Controller
                      key={name}
                      name={name}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label={label}
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
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={formState.isSubmitting || addAddress.isPending}
                  >
                    Add address
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              {addressesQuery.isLoading ? <Skeleton height={160} /> : null}
              {!addressesQuery.isLoading && !addresses.length ? (
                <EmptyPanel title="No saved addresses" message="Add your first delivery address." />
              ) : null}
              {addresses.map((address) => (
                <Card key={address.id}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" gap={1}>
                        <Typography variant="h6">{address.line1}</Typography>
                        {address.defaultAddress || address.isDefault ? (
                          <Chip color="primary" label="Default" size="small" />
                        ) : null}
                      </Stack>
                      <Typography color="text.secondary">
                        {[address.line2, address.city, address.pincode].filter(Boolean).join(', ')}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" onClick={() => setDefault.mutate(address.id)}>
                          Set default
                        </Button>
                        <Button color="error" onClick={() => deleteAddress.mutate(address.id)}>
                          Delete
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </PageWrapper>
  );
}
