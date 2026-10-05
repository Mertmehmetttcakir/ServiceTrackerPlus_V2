import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    VStack,
} from '@chakra-ui/react';
import React from 'react';
import { Vehicle } from '../../../types/vehicle';

interface VehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Vehicle>) => Promise<void>;
  initialData?: Vehicle | null;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = React.useState<Partial<Vehicle>>({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'active',
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {initialData ? 'Araç Düzenle' : 'Yeni Araç Ekle'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Plaka</FormLabel>
                <Input
                  name="plate"
                  value={formData.plate}
                  onChange={handleChange}
                  placeholder="34ABC123"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Marka</FormLabel>
                <Input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Toyota"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Model</FormLabel>
                <Input
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Corolla"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Yıl</FormLabel>
                <Input
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  min={1900}
                  max={new Date().getFullYear() + 1}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Durum</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              İptal
            </Button>
            <Button colorScheme="blue" type="submit">
              {initialData ? 'Güncelle' : 'Ekle'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}; 