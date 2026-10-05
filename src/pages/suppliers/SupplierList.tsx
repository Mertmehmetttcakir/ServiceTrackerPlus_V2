import { Box, Button, Card, CardBody, CardHeader, Flex, Heading, Table, Tbody, Td, Th, Thead, Tr, Badge, Spinner, Alert, AlertIcon, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuppliers, useCreateSupplier } from '../../hooks/useSuppliers';
import { SupplierCreate } from '../../types/supplier';
import { FiPlus, FiEye } from 'react-icons/fi';

export const SupplierList: React.FC = () => {
  const { data: suppliers, isLoading, error } = useSuppliers();
  const { mutate: createSupplier, isPending: isCreating } = useCreateSupplier();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SupplierCreate>({
    company_name: '',
    contact_name: '',
    phone: '',
  });

  const handleSubmit = () => {
    if (!formData.company_name) {
      toast({ title: 'Hata', description: 'Firma Adı zorunludur.', status: 'error' });
      return;
    }
    createSupplier(formData, {
      onSuccess: () => {
        toast({ title: 'Başarılı', description: 'Tedarikçi eklendi.', status: 'success' });
        onClose();
        setFormData({ company_name: '', contact_name: '', phone: '' });
      }
    });
  };

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Tedarikçiler ve Giderler</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
          Yeni Tedarikçi Ekle
        </Button>
      </Flex>

      <Card shadow="sm">
        <CardBody overflowX="auto">
          {isLoading ? (
            <Flex justify="center" p={10}><Spinner size="xl" /></Flex>
          ) : error ? (
            <Alert status="error"><AlertIcon />Tedarikçiler yüklenirken hata oluştu.</Alert>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Firma Adı</Th>
                  <Th>Yetkili Kişi</Th>
                  <Th>Telefon</Th>
                  <Th>İşlemler</Th>
                </Tr>
              </Thead>
              <Tbody>
                {suppliers?.map(supplier => (
                  <Tr key={supplier.id}>
                    <Td fontWeight="bold">{supplier.company_name}</Td>
                    <Td>{supplier.contact_name || '-'}</Td>
                    <Td>{supplier.phone || '-'}</Td>
                    <Td>
                      <Button size="sm" leftIcon={<FiEye />} colorScheme="gray" onClick={() => navigate(`/suppliers/${supplier.id}`)}>
                        Detay ve Borçlar
                      </Button>
                    </Td>
                  </Tr>
                ))}
                {(!suppliers || suppliers.length === 0) && (
                  <Tr>
                    <Td colSpan={4} textAlign="center" py={4} color="gray.500">
                      Kayıtlı tedarikçi bulunamadı.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Yeni Tedarikçi Ekle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired mb={4}>
              <FormLabel>Firma Adı (Parçacı)</FormLabel>
              <Input 
                value={formData.company_name} 
                onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
                placeholder="Örn: Mert Oto Yedek Parça"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Yetkili Kişi</FormLabel>
              <Input 
                value={formData.contact_name || ''} 
                onChange={(e) => setFormData({...formData, contact_name: e.target.value})} 
                placeholder="Örn: Ahmet Yılmaz"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Telefon</FormLabel>
              <Input 
                value={formData.phone || ''} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                placeholder="Örn: 0555 555 5555"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>İptal</Button>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={isCreating}>Kaydet</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
