import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    useToast,
} from '@chakra-ui/react';
import React from 'react';
import { Vehicle } from '../../../types';

interface VehicleListProps {
  vehicles: Vehicle[];
  customerId: string;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  customerId,
  onEdit,
  onDelete,
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleDelete = async (vehicleId: string) => {
    try {
      if (onDelete) {
        await onDelete(vehicleId);
        toast({
          title: 'Araç silindi',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Araç silinirken bir hata oluştu',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Araçlar</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm">
          Yeni Araç Ekle
        </Button>
      </Flex>

      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
      >
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Marka</Th>
              <Th>Model</Th>
              <Th>Yıl</Th>
              <Th>Plaka</Th>
              <Th>Son Servis</Th>
              <Th>İşlemler</Th>
            </Tr>
          </Thead>
          <Tbody>
            {vehicles.map((vehicle) => (
              <Tr key={vehicle.id}>
                <Td>{vehicle.brand}</Td>
                <Td>{vehicle.model}</Td>
                <Td>{vehicle.year}</Td>
                <Td>{vehicle.licensePlate}</Td>
                <Td>{new Date(vehicle.lastService).toLocaleDateString('tr-TR')}</Td>
                <Td>
                  <IconButton
                    aria-label="Düzenle"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    colorScheme="blue"
                    variant="ghost"
                    onClick={() => onEdit?.(vehicle)}
                  />
                  <IconButton
                    aria-label="Sil"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDelete(vehicle.id)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}; 