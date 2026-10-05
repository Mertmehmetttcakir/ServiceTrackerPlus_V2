import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  IconButton,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import React from 'react';
import {
  useCustomerVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from '../../../hooks/useVehicles';
import { Vehicle, VehicleCreate, VehicleUpdate } from '../../../types/vehicle';
import { VehicleForm } from './VehicleForm';

interface CustomerVehiclesProps {
  customerId: string;
}

export const CustomerVehicles: React.FC<CustomerVehiclesProps> = ({ customerId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: vehicles, isLoading } = useCustomerVehicles(customerId);
  const createVehicle = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);

  const handleAdd = () => {
    setSelectedVehicle(null);
    onOpen();
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    onOpen();
  };

  const handleSubmit = async (data: Partial<Vehicle>) => {
    if (selectedVehicle) {
      await updateVehicleMutation.mutateAsync({
        id: selectedVehicle.id,
        data: data as VehicleUpdate,
      });
    } else {
      await createVehicle.mutateAsync({
        ...(data as Omit<VehicleCreate, 'customer_id'>),
        customer_id: customerId,
      });
    }
    onClose();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return (
    <Box>
      <Button
        leftIcon={<AddIcon />}
        colorScheme="blue"
        mb={4}
        onClick={handleAdd}
      >
        Yeni Araç Ekle
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Plaka</Th>
            <Th>Marka</Th>
            <Th>Model</Th>
            <Th>Yıl</Th>
            <Th>İşlemler</Th>
          </Tr>
        </Thead>
        <Tbody>
          {vehicles?.map((vehicle: Vehicle) => (
            <Tr key={vehicle.id}>
              <Td>{vehicle.plate}</Td>
              <Td>{vehicle.brand}</Td>
              <Td>{vehicle.model}</Td>
              <Td>{vehicle.year}</Td>
              <Td>
                <IconButton
                  aria-label="Düzenle"
                  icon={<EditIcon />}
                  size="sm"
                  mr={2}
                  onClick={() => handleEdit(vehicle)}
                />
                <IconButton
                  aria-label="Sil"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() =>
                    deleteVehicleMutation.mutateAsync({
                      vehicleId: vehicle.id,
                      customerId,
                    })
                  }
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <VehicleForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        initialData={selectedVehicle}
      />
    </Box>
  );
}; 