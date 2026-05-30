import { Box } from '@mui/material';

const colors = {
  leaf: '#2E7D32',
  amber: '#FF6F00',
  soil: '#8D6E63',
  pale: '#EAF4EA',
};

export default function EmptyState({ type = 'basket', sx }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 240 180"
      role="img"
      aria-label={`${type} empty state`}
      sx={{ width: 180, maxWidth: '100%', ...sx }}
    >
      <rect x="24" y="126" width="192" height="18" rx="9" fill={colors.pale} />
      <path
        d="M70 72h100l-13 70H83L70 72Z"
        fill="#fff"
        stroke={colors.soil}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M88 72c4-28 22-42 42-42s38 14 42 42"
        fill="none"
        stroke={colors.soil}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="108" cy="100" r="8" fill={colors.amber} />
      <path
        d="M130 112c26-17 32-45 12-70-26 11-35 34-12 70Z"
        fill={colors.leaf}
      />
      <path
        d="M128 110c-5-28-24-45-50-42-5 29 13 48 50 42Z"
        fill="#81C784"
      />
    </Box>
  );
}
