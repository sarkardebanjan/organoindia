import { motion } from 'framer-motion';
import { Container } from '@mui/material';

export default function PageWrapper({ children, maxWidth = 'lg', sx }) {
  return (
    <Container
      component={motion.main}
      maxWidth={maxWidth}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.25 }}
      sx={{
        py: { xs: 2, md: 4 },
        pb: { xs: 10, md: 5 },
        minHeight: '70vh',
        ...sx,
      }}
    >
      {children}
    </Container>
  );
}
