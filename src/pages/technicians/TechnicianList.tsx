import { Alert, AlertIcon, Box, Heading, Text } from '@chakra-ui/react';
import React from 'react';

const TechnicianList: React.FC = () => {
  return (
    <Box>
      <Heading mb={4}>Teknisyen Listesi</Heading>
      <Alert status="info" borderRadius="md" mb={4}>
        <AlertIcon />
        <Text>Bu kısım şu anda geliştirme aşamasındadır.</Text>
      </Alert>
      {/* İleride teknisyen listesi bileşeni buraya eklenecek */}
    </Box>
  );
};

export default TechnicianList; 