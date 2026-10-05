import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

// Lazy load pages
const AppointmentCalendar = React.lazy(() => import('../../pages/appointments/AppointmentCalendar'));
const CustomerList = React.lazy(() => import('../../pages/customers/CustomerList'));
const TechnicianList = React.lazy(() => import('../../pages/technicians/TechnicianList'));
const ServiceHistory = React.lazy(() => import('../../pages/services/ServiceHistory'));
const Reports = React.lazy(() => import('../../pages/reports/Reports'));

export const DashboardLayout: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Flex h="100vh" bg={bgColor}>
      <Sidebar />
      <Box flex="1" overflow="auto" ml="64">
        <Header />
        <Box p="4">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/dashboard" element={<AppointmentCalendar />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/technicians" element={<TechnicianList />} />
              <Route path="/services" element={<ServiceHistory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Box>
      </Box>
    </Flex>
  );
}; 