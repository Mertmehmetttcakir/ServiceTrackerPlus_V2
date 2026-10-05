import { AddIcon, CalendarIcon, EmailIcon, InfoOutlineIcon, LinkIcon, PhoneIcon, WarningTwoIcon } from '@chakra-ui/icons';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { PaymentModal } from '../../components/features/Payments/PaymentModal';
import { VehicleForm } from '../../components/features/Vehicles/VehicleForm';
import { VehicleList } from '../../components/features/Vehicles/VehicleList';
import { useCustomerById } from '../../hooks/useCustomers';
import { useCreateFinancialTransaction } from '../../hooks/useFinancialTransactions';
import { useDeleteJob, useGetDeletedJobsByCustomerId, useGetJobsByCustomerId } from '../../hooks/useJobs';
import { useCustomerVehicles, useDeleteVehicle } from '../../hooks/useVehicles';
import { JobSummary } from '../../types/job';
import { Vehicle } from '../../types/vehicle';
import { formatCurrency } from '../../utils/formatters';

export const CustomerDetailsPage: React.FC = () => {
  const { id: customerId } = useParams<{ id: string }>();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: customer, isLoading: isLoadingCustomer, error: customerError, refetch: refetchCustomer } = useCustomerById(customerId);
  const { data: vehicles, isLoading: isLoadingVehicles, error: vehiclesError, refetch: refetchVehicles } = useCustomerVehicles(customerId);
  const { data: jobs, isLoading: isLoadingJobs, error: jobsError, refetch: refetchJobs } = useGetJobsByCustomerId(customerId);
  const { data: deletedJobs, isLoading: isLoadingDeletedJobs } = useGetDeletedJobsByCustomerId(customerId);
  const { mutate: deleteVehicle } = useDeleteVehicle();

  const { isOpen: isVehicleFormOpen, onOpen: onVehicleFormOpen, onClose: onVehicleFormClose } = useDisclosure();
  const { isOpen: isPaymentModalOpen, onOpen: onPaymentModalOpen, onClose: onPaymentModalClose } = useDisclosure();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<JobSummary | null>(null);
  const {
    isOpen: isDeleteJobDialogOpen,
    onOpen: onDeleteJobDialogOpen,
    onClose: onDeleteJobDialogClose,
  } = useDisclosure();
  const [selectedJobForDelete, setSelectedJobForDelete] = useState<JobSummary | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>('0');

  const { mutateAsync: createFinancialTransaction, isPending: isCreatingRefund } =
    useCreateFinancialTransaction();
  const { mutateAsync: deleteJob, isPending: isDeletingJob } = useDeleteJob();

  const isDeletingJobWithRefund = isCreatingRefund || isDeletingJob;

  // Mevcut araçlara göre işleri filtrele
  const filteredJobs = React.useMemo(() => {
    if (!jobs || !vehicles) return [];
    const vehicleIds = new Set(vehicles.map(v => v.id));
    // Sadece vehicle_id'si olan ve mevcut araçlar listesinde bulunan işleri göster
    return jobs.filter(job => job.vehicle_id && vehicleIds.has(job.vehicle_id));
  }, [jobs, vehicles]);

  // Filtrelenmiş işlere göre toplam bakiyeyi hesapla
  const calculatedTotalOutstandingBalance = React.useMemo(() => {
    return filteredJobs.reduce((acc, job) => acc + (job.remaining_balance_for_job ?? 0), 0);
  }, [filteredJobs]);

  if (isLoadingCustomer || (customerId && !customer && !customerError)) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </Flex>
    );
  }
  if (customerError) return <Text color="red.500" fontSize="lg" p={6}>Müşteri yüklenirken hata: {customerError.message}</Text>;
  if (!customer) return <Text fontSize="lg" p={6}>Müşteri bulunamadı.</Text>;

  const handleOpenVehicleForm = (vehicle?: Vehicle) => {
    setSelectedVehicle(vehicle || null);
    onVehicleFormOpen();
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      deleteVehicle({ vehicleId, customerId: customer.id }, {
        onSuccess: () => {
          toast({ title: 'Araç başarıyla silindi.', status: 'success', duration: 3000, isClosable: true });
          refetchVehicles();
          refetchCustomer();
          refetchJobs();
          queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
        onError: (error) => {
          toast({ title: 'Araç silinirken bir hata oluştu.', description: error.message, status: 'error', duration: 5000, isClosable: true });
        }
      });
    }
  };

  const handleFormSuccess = () => {
    refetchVehicles();
    refetchCustomer();
    refetchJobs();
    onVehicleFormClose();
    setSelectedVehicle(null);
  };

  const handleOpenPaymentModal = (job: JobSummary) => {
    setSelectedJobForPayment(job);
    onPaymentModalOpen();
  };

  const handlePaymentSuccess = () => {
    refetchJobs();
    refetchCustomer();
  };

  const handleOpenDeleteJobDialog = (job: JobSummary) => {
    setSelectedJobForDelete(job);
    setRefundAmount('0');
    onDeleteJobDialogOpen();
  };

  const handleConfirmDeleteJob = async () => {
    if (!customer || !selectedJobForDelete) return;

    try {
      const parsedRefund = parseFloat(refundAmount.replace(',', '.')) || 0;
      const maxRefund = selectedJobForDelete.total_paid_for_job ?? 0;

      if (parsedRefund < 0) {
        toast({
          title: 'Geçersiz tutar',
          description: 'İade tutarı negatif olamaz.',
          status: 'error',
          duration: 4000,
        });
        return;
      }

      if (parsedRefund > maxRefund) {
        toast({
          title: 'Geçersiz tutar',
          description: `İade tutarı, alınan toplam ödemeden (${formatCurrency(maxRefund)}) fazla olamaz.`,
          status: 'error',
          duration: 5000,
        });
        return;
      }

      // Geri ödeme gerekiyorsa önce REFUND işlemini kaydet
      if (parsedRefund > 0) {
        await createFinancialTransaction({
          customer_id: customer.id,
          vehicle_id: selectedJobForDelete.vehicle_id ?? null,
          appointment_id: null,
          job_id: selectedJobForDelete.id,
          transaction_type: 'REFUND',
          amount: parsedRefund,
          description: 'İş silinirken yapılan geri ödeme',
          transaction_date: new Date().toISOString(),
        });
      }

      // Ardından işi sil
      await deleteJob({ id: selectedJobForDelete.id, customerId: customer.id });

      toast({
        title: 'İş silindi',
        description: parsedRefund > 0
          ? `İş silindi ve ${formatCurrency(parsedRefund)} tutarında iade kaydedildi.`
          : 'İş silindi.',
        status: 'success',
        duration: 4000,
      });

      onDeleteJobDialogClose();
      setSelectedJobForDelete(null);
      // Verileri tazele
      refetchJobs();
      refetchCustomer();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'İş silinirken bir hata oluştu';
      toast({
        title: 'Hata',
        description: message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const getJobStatusColor = (status: JobSummary['status']) => {
    switch (status) {
      case 'Açık': return 'blue';
      case 'Tamamlandı - Ödeme Bekliyor': return 'orange';
      case 'Kısmi Ödendi': return 'yellow';
      case 'Tamamen Ödendi': return 'green';
      case 'İptal Edildi': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        <Card variant="outline" shadow="md">
          <CardHeader pb={2}>
            <Heading size="lg" color="blue.600">{customer.full_name}</Heading>
          </CardHeader>
          <CardBody pt={2}>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Icon as={InfoOutlineIcon} color="gray.500" />
                <Text fontSize="md" color="gray.700">
                  <Text as="span" fontWeight="semibold">Müşteri ID:</Text> {customer.id}
                </Text>
              </HStack>
              <HStack>
                <Icon as={EmailIcon} color="gray.500" />
                <Text fontSize="md" color="gray.700">
                  <Text as="span" fontWeight="semibold">E-posta:</Text> {customer.email || 'Belirtilmemiş'}
                </Text>
              </HStack>
              <HStack>
                <Icon as={PhoneIcon} color="gray.500" />
                <Text fontSize="md" color="gray.700">
                  <Text as="span" fontWeight="semibold">Telefon:</Text> {customer.phone || 'Belirtilmemiş'}
                </Text>
              </HStack>
              <Divider pt={2} />
              <HStack spacing={4} pt={2} justifyContent="space-around">
                <Stat size="sm">
                  <StatLabel display="flex" alignItems="center">
                    <Icon as={CalendarIcon} mr={2} color="blue.500" />
                    Son Randevu
                  </StatLabel>
                  <StatNumber fontSize="md">{customer.last_appointment_date ? new Date(customer.last_appointment_date).toLocaleDateString() : 'Yok'}</StatNumber>
                </Stat>
                <Stat size="sm">
                  <StatLabel display="flex" alignItems="center">
                    <Icon as={WarningTwoIcon} mr={2} color={calculatedTotalOutstandingBalance > 0 ? 'red.500' : 'green.500'} />
                    Toplam Bakiye
                  </StatLabel>
                  <StatNumber fontSize="md" color={calculatedTotalOutstandingBalance > 0 ? 'red.500' : 'green.500'}>
                    {formatCurrency(calculatedTotalOutstandingBalance ?? 0)}
                  </StatNumber>
                </Stat>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Divider my={2} />

        <Box bg="white" p={5} borderRadius="md" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg" color="gray.700">Araçlar</Heading>
            <Button 
              leftIcon={<AddIcon />} 
              colorScheme="teal" 
              onClick={() => handleOpenVehicleForm()}
              size="md"
            >
              Yeni Araç Ekle
            </Button>
          </Flex>
          
          {isLoadingVehicles && <Flex justify="center" py={10}><Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="xl" /></Flex>}
          {vehiclesError && <Text color="red.500" fontSize="md">Araçlar yüklenirken hata: {vehiclesError.message}</Text>}
          {vehicles && (
            <VehicleList 
              vehicles={vehicles} 
              customerId={customer.id}
              onEditVehicle={handleOpenVehicleForm}
              onDeleteVehicle={handleDeleteVehicle}
            />
          )}
          {!isLoadingVehicles && vehicles?.length === 0 && <Text color="gray.600" textAlign="center" py={5}>Bu müşteriye ait kayıtlı araç bulunmamaktadır.</Text>}
        </Box>

        <Divider my={2} />

        <Box bg="white" p={5} borderRadius="md" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg" color="gray.700">İşler</Heading>
          </Flex>

          {isLoadingJobs && <Flex justify="center" py={10}><Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="purple.500" size="xl" /></Flex>}
          {jobsError && <Text color="red.500" fontSize="md">İşler yüklenirken hata: {jobsError.message}</Text>}
          
          {!isLoadingJobs && filteredJobs && filteredJobs.length > 0 && (
            <Accordion allowMultiple defaultIndex={[0]}>
              {filteredJobs.map((job) => (
                <AccordionItem key={job.id}>
                  <h2>
                    <AccordionButton _expanded={{ bg: 'purple.50', color: 'purple.700' }}>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="semibold">{job.job_description} - <Text as="span" fontWeight="normal">{new Date(job.job_date).toLocaleDateString()}</Text></Text>
                      </Box>
                      <Badge colorScheme={getJobStatusColor(job.status)} mr={2}>{job.status}</Badge>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4} bg="white">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
                        {(() => {
                          const vehicle = vehicles?.find(v => v.id === job.vehicle_id);
                          if (vehicle) {
                            return <Text><Text as="span" fontWeight="semibold">Araç:</Text> {`${vehicle.brand} ${vehicle.model} (${vehicle.plate})`}</Text>;
                          } else if (job.vehicle_id) {
                            return <Text><Text as="span" fontWeight="semibold">Araç ID:</Text> {job.vehicle_id}</Text>;
                          }
                          return null;
                        })()}
                        <Text><Text as="span" fontWeight="semibold">Toplam Tutar:</Text> {formatCurrency(job.total_cost ?? 0)}</Text>
                        <Text color="green.600"><Text as="span" fontWeight="semibold">Toplam Ödenen:</Text> {formatCurrency(job.total_paid_for_job ?? 0)}</Text>
                        <Text color={job.remaining_balance_for_job && job.remaining_balance_for_job > 0 ? "red.600" : "green.600"}>
                            <Text as="span" fontWeight="semibold">Kalan Bakiye:</Text> {formatCurrency(job.remaining_balance_for_job ?? 0)}
                        </Text>
                    </SimpleGrid>
                    {job.notes && (
                        <Box mt={2} p={2} borderWidth="1px" borderRadius="md" bg="gray.50">
                            <Text fontWeight="semibold" fontSize="sm">İşe Özel Notlar:</Text>
                            <Text fontSize="sm">{job.notes}</Text>
                        </Box>
                    )}
                    <HStack mt={4} spacing={3}>
                       <Button 
                        colorScheme="blue" 
                        size="sm"
                        onClick={() => handleOpenPaymentModal(job)}
                        isDisabled={(job.remaining_balance_for_job ?? 0) <= 0}
                      >
                        Ödeme Yap
                      </Button>
                       <Button 
                        as={RouterLink} 
                        to={`/jobs/${job.id}`}
                        colorScheme="gray" 
                        size="sm"
                        leftIcon={<LinkIcon />}
                      >
                        İş Detayına Git 
                      </Button>
                      <Button
                        colorScheme="red"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDeleteJobDialog(job)}
                        isLoading={isDeletingJobWithRefund}
                      >
                        İşi Sil
                      </Button>
                    </HStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          {!isLoadingJobs && (!filteredJobs || filteredJobs.length === 0) && (
            <Text color="gray.600" textAlign="center" py={5}>Bu müşteriye ait kayıtlı iş bulunmamaktadır.</Text>
          )}
        </Box>

        {/* Silinen işler / Arşiv */}
        <Box bg="white" p={5} borderRadius="md" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md" color="gray.700">Silinen İşler (Arşiv)</Heading>
          </Flex>

          {isLoadingDeletedJobs && (
            <Flex justify="center" py={6}>
              <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="red.500" size="lg" />
            </Flex>
          )}

          {!isLoadingDeletedJobs && deletedJobs && deletedJobs.length > 0 && (
            <Accordion allowMultiple>
              {deletedJobs.map((job) => (
                <AccordionItem key={job.id}>
                  <h2>
                    <AccordionButton _expanded={{ bg: 'red.50', color: 'red.700' }}>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="semibold">
                          {job.job_description}{' '}
                          <Text as="span" fontWeight="normal">
                            ({new Date(job.job_date).toLocaleDateString()} tarihinde yapılmış)
                          </Text>
                        </Text>
                      </Box>
                      <Badge colorScheme="red" mr={2}>Silindi</Badge>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4} bg="white">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
                      <Text>
                        <Text as="span" fontWeight="semibold">Toplam İş Ücreti:</Text>{' '}
                        {formatCurrency(job.total_cost ?? 0)}
                      </Text>
                      <Text color="red.600">
                        <Text as="span" fontWeight="semibold">Geri İade Edilen İş Ücreti:</Text>{' '}
                        {formatCurrency(job.total_refunded_for_job ?? 0)}
                      </Text>
                      {job.deleted_at && (
                        <Text>
                          <Text as="span" fontWeight="semibold">Silinme Tarihi:</Text>{' '}
                          {new Date(job.deleted_at).toLocaleString()}
                        </Text>
                      )}
                    </SimpleGrid>
                    <Box mt={2} p={2} borderWidth="1px" borderRadius="md" bg="gray.50">
                      <Text fontWeight="semibold" fontSize="sm">İş Detayları</Text>
                      <Text fontSize="sm">
                        {job.job_description}{' '}
                        <Text as="span" color="gray.600">
                          ({new Date(job.job_date).toLocaleDateString()} tarihinde yapılmış)
                          {job.deleted_at && ` (Silindi: ${new Date(job.deleted_at).toLocaleString()})`}
                        </Text>
                      </Text>
                      {(() => {
                        if (!vehicles || !job.vehicle_id) return null;
                        const vehicle = vehicles.find(v => v.id === job.vehicle_id);
                        if (!vehicle) return null;
                        return (
                          <Text fontSize="sm">
                            <Text as="span" fontWeight="semibold">Araç:</Text>{' '}
                            {`${vehicle.brand} ${vehicle.model} (${vehicle.plate})`}
                          </Text>
                        );
                      })()}
                      {job.notes && (
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="semibold">Notlar:</Text> {job.notes}
                        </Text>
                      )}
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {!isLoadingDeletedJobs && (!deletedJobs || deletedJobs.length === 0) && (
            <Text color="gray.500" textAlign="center" py={4}>
              Bu müşteriye ait silinmiş iş bulunmamaktadır.
            </Text>
          )}
        </Box>
      </VStack>

      {isVehicleFormOpen && (
        <VehicleForm 
          isOpen={isVehicleFormOpen} 
          onClose={() => {
            onVehicleFormClose();
            setSelectedVehicle(null);
          }}
          customerId={customer.id}
          vehicleToEdit={selectedVehicle}
          onSuccess={handleFormSuccess}
        />
      )}

      {isPaymentModalOpen && selectedJobForPayment && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={onPaymentModalClose}
          job={selectedJobForPayment}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* İş silme ve iade pop-up'ı */}
      <AlertDialog
        isOpen={isDeleteJobDialogOpen}
        leastDestructiveRef={undefined as any}
        onClose={isDeletingJobWithRefund ? () => {} : onDeleteJobDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              İşi Sil ve Geri Ödeme
            </AlertDialogHeader>

            <AlertDialogBody>
              {selectedJobForDelete && (
                <VStack align="stretch" spacing={4}>
                  <Text>
                    Bu işi silmek üzeresiniz. İsterseniz bu işe ait alınan ödemelerin bir kısmını
                    veya tamamını iade olarak kaydedebilirsiniz.
                  </Text>
                  <Text fontWeight="semibold">
                    Alınan Toplam Ödeme:{' '}
                    <Box as="span" color="green.600">
                      {formatCurrency(selectedJobForDelete.total_paid_for_job ?? 0)}
                    </Box>
                  </Text>
                  <FormControl>
                    <FormLabel>Geri ödenecek tutar</FormLabel>
                    <Input
                      type="number"
                      min={0}
                      max={selectedJobForDelete.total_paid_for_job ?? 0}
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                    />
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      0 girersen sadece iş silinir, gelirde değişiklik yapılmaz.
                    </Text>
                  </FormControl>
                </VStack>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onDeleteJobDialogClose} disabled={isDeletingJobWithRefund}>
                İptal
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDeleteJob}
                ml={3}
                isLoading={isDeletingJobWithRefund}
              >
                İşi Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

// Gerekli CustomerById hook'u (src/hooks/useCustomers.ts içine eklenebilir):
/*
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { CustomerService } from '../services/customerService';
import { Customer } from '../types/customer';

const CUSTOMERS_QUERY_KEY_PREFIX = 'customers';

export const useCustomerById = (
  customerId: string | undefined,
  options?: Omit<UseQueryOptions<Customer, Error, Customer, (string | undefined)[]>, 'queryKey' | 'queryFn' | 'initialData'>
) => {
  return useQuery<Customer, Error, Customer, (string | undefined)[]>(
    {
      queryKey: [CUSTOMERS_QUERY_KEY_PREFIX, 'detail', customerId],
      queryFn: () => {
        if (!customerId) return Promise.reject(new Error('Müşteri ID gerekli'));
        return CustomerService.getCustomerById(customerId);
      },
      enabled: !!customerId,
      ...options,
    }
  );
};
*/ 