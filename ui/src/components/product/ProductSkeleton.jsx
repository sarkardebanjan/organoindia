import { Card, CardContent, Grid, Skeleton, Stack } from '@mui/material';

export default function ProductSkeleton({ count = 6 }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={6} md={6} lg={4} key={index}>
          <Card>
            <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 3' }} />
            <CardContent>
              <Stack spacing={1}>
                <Skeleton height={26} />
                <Skeleton width="60%" />
                <Skeleton width="42%" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
