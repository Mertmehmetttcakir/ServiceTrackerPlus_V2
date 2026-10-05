import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  Box,
  Button,
  Heading,
  HStack,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import React, { useRef } from 'react';
import { useCustomer } from '../../../hooks/useCustomer';
import { Customer } from '../../../types/customer';
import { CustomerAppointments } from './CustomerAppointments';
import { CustomerForm } from './CustomerForm';
import { CustomerServiceHistory } from './CustomerServiceHistory';
import { CustomerVehicles } from './CustomerVehicles';

interface CustomerDetailsProps {
  customerId: string;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customerId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  const { 
    customer, 
    isLoading, 
    error, 
    updateCustomer,
    deleteCustomer,
    isUpdating,
    isDeleting
  } = useCustomer(customerId);

  const handleUpdate = async (data: Partial<Customer>) => {
    await updateCustomer(data);
    onClose();
  };

  const handleDelete = async () => {
    await deleteCustomer();
    onDeleteDialogClose();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  if (error || !customer) {
    return (
      <Alert status="error">
        <AlertIcon />
        Müşteri bilgileri yüklenirken bir hata oluştu
      </Alert>
    );
  }

  return (
    <Box p={4}>
      <HStack justify="space-between" mb={6}>
        <VStack align="flex-start" spacing={2}>
          <Heading size="lg">{customer.full_name}</Heading>
          <HStack spacing={4}>
            <Text color="gray.600">{customer.phone}</Text>
            <Text color="gray.600">{customer.email}</Text>
          </HStack>
        </VStack>
        <HStack>
          <Button
            leftIcon={<EditIcon />}
            colorScheme="blue"
            variant="outline"
            onClick={onOpen}
            isLoading={isUpdating}
          >
            Düzenle
          </Button>
          <Button
            leftIcon={<DeleteIcon />}
            colorScheme="red"
            variant="outline"
            onClick={onDeleteDialogOpen}
            isLoading={isDeleting}
          >
            Sil
          </Button>
        </HStack>
      </HStack>

      <Tabs>
        <TabList>
          <Tab>Araçlar</Tab>
          <Tab>Randevular</Tab>
          <Tab>Servis Geçmişi</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <CustomerVehicles customerId={customerId} />
          </TabPanel>
          <TabPanel>
            <CustomerAppointments customerId={customerId} />
          </TabPanel>
          <TabPanel>
            <CustomerServiceHistory customerId={customerId} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <CustomerForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleUpdate}
        initialData={customer}
        isSubmitting={isUpdating}
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