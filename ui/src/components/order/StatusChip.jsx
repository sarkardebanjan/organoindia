import { Chip } from '@mui/material';

const colors = {
  DELIVERED: 'success',
  CANCELLED: 'error',
  OUT_FOR_DELIVERY: 'info',
  PACKED: 'secondary',
};

export default function StatusChip({ status }) {
  return (
    <Chip
      size="small"
      color={colors[status] ?? 'primary'}
      label={String(status ?? 'PLACED').replaceAll('_', ' ')}
    />
  );
}
