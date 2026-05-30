import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { usersApi } from '../../api/usersApi';
import PageWrapper from '../../components/layout/PageWrapper';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: usersApi.adminList });
  const deactivate = useMutation({
    mutationFn: usersApi.deactivate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
  const rows = usersQuery.data?.items ?? usersQuery.data ?? [];
  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
    { field: 'mobile', headerName: 'Mobile', width: 150 },
    { field: 'city', headerName: 'City', width: 150 },
    { field: 'active', headerName: 'Active', width: 110, type: 'boolean' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: ({ row }) => (
        <Button color="error" onClick={() => deactivate.mutate(row.id)}>
          Deactivate
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper maxWidth="xl">
      <Stack spacing={3}>
        <Typography variant="h4">User management</Typography>
        <Card>
          <CardContent sx={{ height: 620 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={usersQuery.isLoading}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
            />
          </CardContent>
        </Card>
      </Stack>
    </PageWrapper>
  );
}
