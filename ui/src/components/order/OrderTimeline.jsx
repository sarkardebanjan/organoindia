import { CheckCircle } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';
import { ORDER_STATUSES } from '../../utils/constants';

export default function OrderTimeline({ status }) {
  const activeIndex = ORDER_STATUSES.indexOf(status);
  return (
    <Stack spacing={1.2}>
      {ORDER_STATUSES.filter((entry) => entry !== 'CANCELLED').map((entry, index) => (
        <Stack key={entry} direction="row" spacing={1.2} alignItems="center">
          <CheckCircle color={index <= activeIndex ? 'primary' : 'disabled'} />
          <Typography color={index <= activeIndex ? 'text.primary' : 'text.secondary'}>
            {entry.replaceAll('_', ' ')}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
