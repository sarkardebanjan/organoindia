import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ordersApi } from '../../api/ordersApi';
import PageWrapper from '../../components/layout/PageWrapper';
import { formatCurrency } from '../../utils/formatters';

export default function AdminDashboard() {
  const revenueQuery = useQuery({ queryKey: ['admin-revenue'], queryFn: ordersApi.revenue });
  const stats = revenueQuery.data?.stats ?? {};
  const chart = revenueQuery.data?.series ?? [];

  return (
    <PageWrapper maxWidth="xl">
      <Stack spacing={3}>
        <Typography variant="h4">Admin dashboard</Typography>
        <Grid container spacing={2}>
          {[
            ['Revenue today', formatCurrency(stats.revenueToday)],
            ['Orders today', stats.ordersToday ?? 0],
            ['Low stock alerts', stats.lowStock ?? 0],
          ].map(([label, value]) => (
            <Grid item xs={12} md={4} key={label}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography variant="h4">{value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Revenue trend
            </Typography>
            {revenueQuery.isLoading ? (
              <Skeleton height={320} />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area dataKey="revenue" stroke="#2E7D32" fill="#A5D6A7" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Stack>
    </PageWrapper>
  );
}
