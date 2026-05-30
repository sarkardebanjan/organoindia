import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Radio,
  Skeleton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { ordersApi } from '../../api/ordersApi';
import { usersApi } from '../../api/usersApi';
import CartSummary from '../../components/cart/CartSummary';
import PageWrapper from '../../components/layout/PageWrapper';
import { useCart } from '../../hooks/useCart';
import { DELIVERY_SLOTS, PAYMENT_METHODS } from '../../utils/constants';

const addressSchema = z.object({
  addressId: z.string().min(1, 'Choose an address'),
  slot: z.string().min(1, 'Choose a delivery slot'),
  paymentMethod: z.string().min(1, 'Choose a payment method'),
  upiId: z.string().optional(),
  cardNumber: z.string().optional(),
});

const steps = ['Address', 'Delivery Slot', 'Payment', 'Review'];

export default function Checkout() {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const compactStepper = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { cart, isLoading } = useCart();
  const addressesQuery = useQuery({ queryKey: ['addresses'], queryFn: usersApi.addresses });
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: { addressId: '', slot: '', paymentMethod: 'COD', upiId: '', cardNumber: '' },
  });

  const createOrder = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: (order) => {
      enqueueSnackbar('Order placed successfully', { variant: 'success' });
      navigate(`/orders/${order.id}`);
    },
    onError: (error) =>
      enqueueSnackbar(error.response?.data?.message ?? 'Could not place order', {
        variant: 'error',
      }),
  });

  const paymentMethod = useWatch({ control, name: 'paymentMethod' });
  const addresses = addressesQuery.data ?? [];

  const submit = (values) => {
    if (activeStep < steps.length - 1) {
      setActiveStep((value) => value + 1);
      return;
    }
    createOrder.mutate(values);
  };

  return (
    <PageWrapper>
      <Stack spacing={3}>
        <Typography variant="h4">Checkout</Typography>
        <Stepper activeStep={activeStep} alternativeLabel={compactStepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stack component="form" spacing={2} onSubmit={handleSubmit(submit)}>
                  {activeStep === 0 ? (
                    addressesQuery.isLoading ? (
                      <Skeleton height={64} />
                    ) : (
                      <Controller
                        name="addressId"
                        control={control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            select
                            label="Delivery address"
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message}
                          >
                            {addresses.map((address) => (
                              <MenuItem key={address.id} value={String(address.id)}>
                                {address.line1}, {address.city} {address.pincode}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    )
                  ) : null}
                  {activeStep === 1 ? (
                    <Controller
                      name="slot"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          select
                          label="Delivery slot"
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                        >
                          {DELIVERY_SLOTS.map((slot) => (
                            <MenuItem key={slot.id} value={slot.id}>
                              {slot.label} ({slot.window})
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  ) : null}
                  {activeStep === 2 ? (
                    <Stack spacing={2}>
                      <Controller
                        name="paymentMethod"
                        control={control}
                        render={({ field }) => (
                          <Stack spacing={1}>
                            {PAYMENT_METHODS.map((method) => (
                              <Button
                                key={method.id}
                                variant={field.value === method.id ? 'contained' : 'outlined'}
                                onClick={() => field.onChange(method.id)}
                                startIcon={<Radio checked={field.value === method.id} />}
                                sx={{ justifyContent: 'flex-start' }}
                              >
                                {method.label}
                              </Button>
                            ))}
                          </Stack>
                        )}
                      />
                      {paymentMethod === 'UPI' ? (
                        <Box>
                          <Box
                            sx={{
                              width: 144,
                              height: 144,
                              bgcolor: 'background.default',
                              border: 1,
                              borderColor: 'divider',
                              display: 'grid',
                              placeItems: 'center',
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2">UPI QR</Typography>
                          </Box>
                          <Controller
                            name="upiId"
                            control={control}
                            render={({ field }) => <TextField {...field} label="UPI ID" />}
                          />
                        </Box>
                      ) : null}
                      {paymentMethod === 'CARD' ? (
                        <Controller
                          name="cardNumber"
                          control={control}
                          render={({ field }) => <TextField {...field} label="Card number" />}
                        />
                      ) : null}
                    </Stack>
                  ) : null}
                  {activeStep === 3 ? (
                    <Typography>
                      Review your order summary, address, delivery slot, and payment method before
                      placing the order.
                    </Typography>
                  ) : null}
                  <Stack direction="row" spacing={1} justifyContent="space-between">
                    <Button
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep((value) => value - 1)}
                    >
                      Back
                    </Button>
                    <Button type="submit" variant="contained" disabled={createOrder.isPending}>
                      {activeStep === steps.length - 1 ? 'Place order' : 'Continue'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            {isLoading ? <Skeleton height={260} /> : <CartSummary cart={cart} />}
          </Grid>
        </Grid>
      </Stack>
    </PageWrapper>
  );
}
