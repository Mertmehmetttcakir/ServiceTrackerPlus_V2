import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
    Badge,
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
import { Technician } from '../../../types';

interface TechnicianListProps {
  technicians: Technician[];
  onEdit?: (technician: Technician) => void;
  onDelete?: (technicianId: string) => void;
}

const getAvailabilityColor = (isAvailable: boolean) => {
  return isAvailable ? 'green' : 'red';
};

const getAvailabilityText = (isAvailable: boolean) => {
  return isAvailable ? 'Müsait' : 'Meşgul';
};

export const TechnicianList: React.FC<TechnicianListProps> = ({
  technicians,
  onEdit,
  onDelete,
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleDelete = async (technicianId: string) => {
    try {
      if (onDelete) {
        await onDelete(technicianId);
        toast({
          title: 'Teknisyen silindi',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Teknisyen silinirken bir hata oluştu',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Teknisyenler</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm">
          Yeni Teknisyen
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
              <Th>Ad Soyad</Th>
              <Th>Uzmanlık</Th>
              <Th>Telefon</Th>
              <Th>E-posta</Th>
              <Th>Durum</Th>
              <Th>İşlemler</Th>
            </Tr>
          </Thead>
          <Tbody>
            {technicians.map((technician) => (
              <Tr key={technician.id}>
                <Td>{technician.name}</Td>
                <Td>{technician.specialization}</Td>
                <Td>{technician.phone}</Td>
                <Td>{technician.email}</Td>
                <Td>
                  <Badge colorScheme={getAvailabilityColor(technician.isAvailable)}>
                    {getAvailabilityText(technician.isAvailable)}
                  </Badge>
                </Td>
                <Td>
                  <IconButton
                    aria-label="Düzenle"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    colorScheme="blue"
                    variant="ghost"
                    onClick={() => onEdit?.(technician)}
                  />
                  <IconButton
                    aria-label="Sil"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDelete(technician.id)}
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