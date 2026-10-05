import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, Flex, HStack, IconButton, Spacer, Text } from '@chakra-ui/react';
import React from 'react';
import { Vehicle } from '../../../types/vehicle';

interface VehicleListProps {
  vehicles: Vehicle[];
  customerId: string; // Gelecekte araç ekleme/düzenleme işlemleri için gerekebilir
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({ vehicles, customerId, onEditVehicle, onDeleteVehicle }) => {
  if (vehicles.length === 0) {
    return <Text>Bu müşteriye ait kayıtlı araç bulunmamaktadır.</Text>;
  }

  return (
    <Box>
      {vehicles.map((vehicle) => (
        <Box 
          key={vehicle.id} 
          p={4} 
          borderWidth={1} 
          borderRadius="md" 
          mb={3} 
          shadow="sm"
          _hover={{ shadow: 'md' }}
        >
          <Flex align="center" justify="space-between">
            <Box>
              <Text fontSize="lg" fontWeight="bold">{vehicle.plate}</Text>
              <Text color="gray.600">{vehicle.brand} {vehicle.model} ({vehicle.year})</Text>
            </Box>
            <Spacer />
            <HStack spacing={2}>
              <IconButton 
                aria-label="Aracı Düzenle" 
                icon={<EditIcon />} 
                size="sm"
                onClick={() => onEditVehicle(vehicle)}
                variant="ghost"
              />
              <IconButton 
                aria-label="Aracı Sil" 
                icon={<DeleteIcon />} 
                colorScheme="red"
                size="sm"
                onClick={() => onDeleteVehicle(vehicle.id)}
                variant="ghost"
              />
            </HStack>
          </Flex>
          {vehicle.vin && <Text fontSize="sm" color="gray.500" mt={2}>VIN: {vehicle.vin}</Text>}
          {vehicle.notes && <Text fontSize="sm" mt={2}>Notlar: {vehicle.notes}</Text>}
        </Box>
      ))}
    </Box>
  );
}; 