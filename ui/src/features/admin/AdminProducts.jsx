import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { productsApi } from '../../api/productsApi';
import PageWrapper from '../../components/layout/PageWrapper';
import { CATEGORIES, PRODUCT_UNITS } from '../../utils/constants';

const emptyProduct = {
  name: '',
  category: CATEGORIES[0],
  price: '',
  unit: PRODUCT_UNITS[0],
  stock: '',
  imageUrl: '',
  description: '',
};

export default function AdminProducts() {
  const [product, setProduct] = useState(emptyProduct);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.list({ size: 100 }),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  const saveProduct = useMutation({
    mutationFn: (payload) =>
      payload.id ? productsApi.update(payload.id, payload) : productsApi.create(payload),
    onSuccess: () => {
      invalidate();
      setProduct(emptyProduct);
      enqueueSnackbar('Product saved', { variant: 'success' });
    },
  });
  const deleteProduct = useMutation({ mutationFn: productsApi.remove, onSuccess: invalidate });
  const rows = productsQuery.data?.items ?? productsQuery.data?.content ?? [];
  const columns = useMemo(
    () => [
      { field: 'name', headerName: 'Product', flex: 1, minWidth: 180 },
      { field: 'category', headerName: 'Category', width: 150 },
      { field: 'price', headerName: 'Price', width: 110 },
      { field: 'stock', headerName: 'Stock', width: 100 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 180,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => setProduct(row)}>
              Edit
            </Button>
            <Button size="small" color="error" onClick={() => deleteProduct.mutate(row.id)}>
              Delete
            </Button>
          </Stack>
        ),
      },
    ],
    [deleteProduct],
  );

  const updateField = (field) => (event) => setProduct({ ...product, [field]: event.target.value });

  return (
    <PageWrapper maxWidth="xl">
      <Stack spacing={3}>
        <Typography variant="h4">Product management</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">{product.id ? 'Edit product' : 'Add product'}</Typography>
                  <TextField label="Name" value={product.name} onChange={updateField('name')} />
                  <TextField
                    select
                    label="Category"
                    value={product.category}
                    onChange={updateField('category')}
                  >
                    {CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField label="Price" value={product.price} onChange={updateField('price')} />
                  <TextField select label="Unit" value={product.unit} onChange={updateField('unit')}>
                    {PRODUCT_UNITS.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField label="Stock" value={product.stock} onChange={updateField('stock')} />
                  <TextField
                    label="Image URL"
                    value={product.imageUrl}
                    onChange={updateField('imageUrl')}
                  />
                  <TextField
                    label="Description"
                    multiline
                    minRows={3}
                    value={product.description}
                    onChange={updateField('description')}
                  />
                  <Button variant="contained" onClick={() => saveProduct.mutate(product)}>
                    Save product
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ height: 560 }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  loading={productsQuery.isLoading}
                  pageSizeOptions={[10, 25, 50]}
                  disableRowSelectionOnClick
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </PageWrapper>
  );
}
