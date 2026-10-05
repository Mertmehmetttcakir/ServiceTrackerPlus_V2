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
    VStack
} from '@chakra-ui/react';
import React from 'react';
import { Customer } from '../../../types/customer';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Customer>) => Promise<void>;
  initialData?: Customer;
  isSubmitting?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = React.useState<Partial<Customer>>({
    full_name: '',
    phone: '',
    email: '',
    ...initialData,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name,
        phone: initialData.phone,
        email: initialData.email,
      });
    } else {
      setFormData({
        full_name: '',
        phone: '',
        email: '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {initialData ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Ad Soyad</FormLabel>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Ahmet Yılmaz"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Telefon</FormLabel>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="5XX XXX XX XX"
                />
              </FormControl>

              <FormControl>
                <FormLabel>E-posta</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                />
              </FormControl>


            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              İptal
            </Button>
            <Button 
              colorScheme="blue" 
              type="submit"
              isLoading={isSubmitting}
            >
              {initialData ? 'Güncelle' : 'Ekle'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}; 