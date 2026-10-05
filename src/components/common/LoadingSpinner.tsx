import { Center, Spinner } from '@chakra-ui/react';
import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <Center h="200px">
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="blue.500"
      size="xl"
    />
  </Center>
); 