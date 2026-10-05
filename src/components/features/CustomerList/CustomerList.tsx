import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers } from '../../../hooks/useCustomers';
import { useSystemSettings } from '../../../hooks/useSettings';
import { useUserRole } from '../../../hooks/useUserRole';
import { Customer, CustomerFormData, CustomerFilters as ICustomerFilters } from '../../../types/customer';
import { CustomerFilters } from './CustomerFilters';
import { CustomerForm } from './CustomerForm';

export const CustomerList: React.FC = () => {
  const [filters, setFilters] = useState<ICustomerFilters>({
    sortBy: 'full_name',
    sortOrder: 'asc',
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onDeleteDialogOpen = () => setIsDeleteDialogOpen(true);
  const onDeleteDialogClose = () => setIsDeleteDialogOpen(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  const { canManageCustomers, isLoading: roleLoading } = useUserRole();
  const { data: systemSettings } = useSystemSettings();
  
  const {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCustomers(filters);

  // Sayfalama ayarları
  const recordsPerPage = systemSettings?.records_per_page || 25;
  const [currentPage, setCurrentPage] = useState(1);

  const totalCustomers = customers?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalCustomers / recordsPerPage));

  const pagedCustomers = useMemo(() => {
    if (!customers) return [];
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    return customers.slice(start, end);
  }, [customers, currentPage, recordsPerPage]);

  const handleFiltersChange = (newFilters: ICustomerFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string) => {
    setCustomerToDelete(id);
    onDeleteDialogOpen();
  };

  const handleDelete = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete);
      setCustomerToDelete(null);
      onDeleteDialogClose();
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    onOpen();
  };

  const handleAdd = () => {
    setSelectedCustomer(undefined);
    onOpen();
  };

  const handleSubmit = async (data: CustomerFormData) => {
    if (selectedCustomer) {
      await updateCustomer({ id: selectedCustomer.id, data });
    } else {
      await createCustomer(data);
    }
    onClose();
  };

  if (isLoading || roleLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!canManageCustomers) {
    return (
      <Box p={4}>
        <Heading size="lg" color="red.500">Erişim Reddedildi</Heading>
        <Text mt={2}>Bu sayfayı görüntülemek için yeterli yetkiniz bulunmamaktadır.</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Müşteriler</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAdd}
        >
          Yeni Müşteri
        </Button>
      </Flex>

      <CustomerFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Müşteri Adı</Th>
              <Th>E-posta</Th>
              <Th>Telefon</Th>
              <Th>Son Randevu</Th>
              <Th>Bakiye</Th>
              <Th>İşlemler</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pagedCustomers.map((customer: Customer) => (
              <Tr key={customer.id}>
                <Td>
                  <Link to={`/customers/${customer.id}`}>
                    {customer.full_name}
                  </Link>
                </Td>
                <Td>{customer.email || '-'}</Td>
                <Td>{customer.phone || '-'}</Td>
                <Td>{customer.last_appointment_date ? new Date(customer.last_appointment_date).toLocaleDateString() : '-'}</Td>
                <Td color={customer.total_outstanding_balance_from_jobs && customer.total_outstanding_balance_from_jobs > 0 ? 'red.500' : 'green.500'}>
                  {customer.total_outstanding_balance_from_jobs != null ? `${customer.total_outstanding_balance_from_jobs.toFixed(2)} TL` : '-'}
                </Td>
                <Td>
                  <IconButton
                    aria-label="Düzenle"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => handleEdit(customer)}
                    isLoading={isUpdating}
                  />
                  <IconButton
                    aria-label="Sil"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    isLoading={isDeleting && customerToDelete === customer.id}
                    onClick={() => handleDeleteClick(customer.id)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Sayfalama bilgisi */}
      <Flex mt={4} justify="space-between" align="center" flexWrap="wrap" gap={2}>
        <Text fontSize="sm" color="gray.600">
          Gösterilen{' '}
          {totalCustomers === 0
            ? '0'
            : `${(currentPage - 1) * recordsPerPage + 1} - ${Math.min(
                currentPage * recordsPerPage,
                totalCustomers
              )}`}{' '}
          / Toplam {totalCustomers} müşteri
        </Text>
        <Flex gap={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            isDisabled={currentPage === 1}
          >
            Önceki
          </Button>
          <Text fontSize="sm" alignSelf="center">
            Sayfa {currentPage} / {totalPages}
          </Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            isDisabled={currentPage === totalPages || totalCustomers === 0}
          >
            Sonraki
          </Button>
        </Flex>
      </Flex>

      <CustomerForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        initialData={selectedCustomer}
        isSubmitting={isCreating || isUpdating}
      />

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Müşteri Sil
            </AlertDialogHeader>

            <AlertDialogBody>
              Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve müşteriye ait tüm veriler silinecektir.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                İptal
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3}
                isLoading={isDeleting}
              >
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}; 