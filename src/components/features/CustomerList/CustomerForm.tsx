import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Customer, CustomerFormData } from '../../../types/customer';
import { logger } from '../../../utils/logger';
import { customerSchema } from '../../../utils/validation';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
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
  const [formData, setFormData] = useState<CustomerFormData>(() => {
    if (initialData) {
      const { full_name, email, phone, address } = initialData;
      return {
        full_name: full_name || '',
        email: email || '',
        phone: phone || '',
        address: address || '',
      };
    }
    return {
      full_name: '',
      email: '',
      phone: '',
      address: '',
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
    if (initialData) {
      const { full_name, email, phone, address } = initialData;
      setFormData({
        full_name: full_name || '',
        email: email || '',
        phone: phone || '',
        address: address || '',
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        address: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Hata varsa temizle
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Zod Validation
    const result = customerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      logger.warn('Müşteri formu validasyon hatası', { errors: fieldErrors });
      return;
    }

    // Validasyon başarılı ise sanitize edilmiş veriyi kullan
    await onSubmit(result.data as CustomerFormData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {initialData ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.full_name}>
                <FormLabel>Ad Soyad</FormLabel>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Ad Soyad giriniz"
                />
                <FormErrorMessage>{errors.full_name}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.email}>
                <FormLabel>E-posta</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  placeholder="E-posta giriniz"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.phone}>
                <FormLabel>Telefon</FormLabel>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Telefon numarası giriniz (10 hane)"
                />
                <FormErrorMessage>{errors.phone}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.address}>
                <FormLabel>Adres</FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Adres giriniz"
                />
                <FormErrorMessage>{errors.address}</FormErrorMessage>
              </FormControl>
              {/* TODO: Araç ekleme bölümü eklenecek */}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              İptal
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmitting}
            >
              {initialData ? 'Güncelle' : 'Kaydet'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};