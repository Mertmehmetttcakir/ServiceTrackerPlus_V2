import { Box } from '@chakra-ui/react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { ServiceDetail } from '../../components/features/ServiceDetails/ServiceDetail';

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Box>Servis kaydı bulunamadı</Box>;
  }

  return (
    <Box p={4}>
      <ServiceDetail serviceId={id} />
    </Box>
  );
};

export default ServiceDetailPage; 