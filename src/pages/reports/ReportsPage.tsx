import { Box, Container } from '@chakra-ui/react';
import React from 'react';
import { ReportsDashboard } from '../../components/features/Reports/ReportsDashboard';

export const ReportsPage: React.FC = () => {
  return (
    <Container maxW="full" p={0}>
      <Box bg="gray.50" minH="100vh">
        <ReportsDashboard />
      </Box>
    </Container>
  );
}; 