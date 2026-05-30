import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ordersApi } from '../../api/ordersApi';
import PageWrapper from '../../components/layout/PageWrapper';
import { CITIES, ORDER_STATUSES } from '../../utils/constants';

export default function AdminOrders() {
  const [filters, setFilters] = useState({ status: '', city: '', date: '' });
  const queryClient = useQueryClient();
  const ordersQuery = useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: () => ordersApi.adminList(filters),
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });
  const rows = ordersQuery.data?.items ?? ordersQuery.data ?? [];
  const columns = [
    { field: 'id', headerName: 'Order', width: 100 },
    { field: 'customerName', headerName: 'Customer', flex: 1, minWidth: 160 },
    { field: 'city', headerName: 'City', width: 140 },
    { field: 'status', headerName: 'Status', width: 170 },
    { field: 'total', headerName: 'Total', width: 120 },
    {
      field: 'actions',
      headerName: 'Update',
      width: 210,
      renderCell: ({ row }) => (
        <TextField
          select
          value={row.status ?? 'PLACED'}
          onChange={(event) => updateStatus.mutate({ id: row.id, status: event.target.value })}
          sx={{ width: 190 }}
        >
          {ORDER_STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status.replaceAll('_', ' ')}
            </MenuItem>
          ))}
        </TextField>
      ),
    },
  ];

  return (
    <PageWrapper maxWidth="xl">
      <Stack spacing={3}>
        <Typography variant="h4">Order management</Typography>
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Status"
                value={filters.status}
                onChange={(event) => setFilters({ ...filters, status: event.target.value })}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">All statuses</MenuItem>
                {ORDER_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replaceAll('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="City"
                value={filters.city}
                onChange={(event) => setFilters({ ...filters, city: event.target.value })}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">All cities</MenuItem>
                {CITIES.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Date"
                type="date"
                value={filters.date}
                onChange={(event) => setFilters({ ...filters, date: event.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <Button onClick={() => setFilters({ status: '', city: '', date: '' })}>
                Reset
              </Button>
            </Stack>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ height: 600 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={ordersQuery.isLoading}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
            />
          </CardContent>
        </Card>
      </Stack>
    </PageWrapper>
  );
}
