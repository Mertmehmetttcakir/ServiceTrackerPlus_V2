import { CopyIcon, DownloadIcon, EditIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  List,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaFilePdf, FaPrint } from 'react-icons/fa';
import { useServiceDetail } from '../../../hooks/useServiceDetail';
import { useServiceReport } from '../../../hooks/useServiceReport';
import { ServiceStatus } from '../../../types/serviceHistory';
import { formatCurrency, formatDate, formatPhoneNumber } from '../../../utils/formatters';
import { ServiceHistoryList } from './ServiceHistoryList';
import { ServiceReportPreview } from './ServiceReportPreview';
import { TechnicianNotesEditor } from './TechnicianNotesEditor';
interface ServiceDetailProps {
  serviceId: string;
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({ serviceId }) => {
  const { service, isLoading, isUpdating, handleStatusUpdate } = useServiceDetail(serviceId);
  const { isGenerating, downloadExistingReport, generateAndDownloadReport } = useServiceReport();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleStatusChange = async (status: ServiceStatus) => {
    try {
      setIsUpdatingStatus(true);
      await handleStatusUpdate({ status, notes: service?.notes });
      toast({
        title: 'Durum güncellendi',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Durum güncellenirken bir hata oluştu',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Servis Kaydı #${serviceId}`).then(() => {
      toast({
        title: 'Kopyalandı',
        description: 'Servis kaydı referansı kopyalandı',
        status: 'success',
        duration: 2000,
      });
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      const success = await downloadExistingReport(serviceId);
      if (!success) {
        toast({
          title: 'Hata',
          description: 'PDF indirilirken bir sorun oluştu',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'PDF indirilirken bir sorun oluştu',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleGenerateNewPdf = async () => {
    try {
      const success = await generateAndDownloadReport(serviceId);
      if (success) {
        toast({
          title: 'PDF Oluşturuldu',
          description: 'Servis raporu oluşturuldu ve indirildi',
          status: 'success',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Hata',
          description: 'PDF oluşturulurken bir sorun oluştu',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'PDF oluşturulurken bir sorun oluştu',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleOpenPreview = () => {
    onOpen();
  };

  // Teknisyen notlarını kaydetmek için yardımcı fonksiyon
  const saveNotes = async (notes: string): Promise<boolean> => {
    try {
      if (!service) return false;
      await handleStatusUpdate({
        status: service.status,
        notes
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="300px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!service) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        Servis kaydı yüklenirken bir hata oluştu
      </Alert>
    );
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'in-progress':
        return 'blue';
      case 'completed':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'partial':
        return 'orange';
      case 'pending':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPaymentStatusText = (status: string): string => {
    switch (status) {
      case 'paid':
        return 'Ödendi';
      case 'partial':
        return 'Kısmi Ödeme';
      case 'pending':
        return 'Ödenmedi';
      default:
        return 'Bilinmiyor';
    }
  };

  // Servis adı
  const serviceName = service.service_type;

  // Notes alanından ödeme durumunu çıkar
  const getPaymentStatus = (notes?: string): 'paid' | 'partial' | 'pending' => {
    if (!notes) return 'pending';
    if (notes.includes('payment:paid')) return 'paid';
    if (notes.includes('payment:partial')) return 'partial';
    return 'pending';
  };

  // Notes alanından ödeme tutarını çıkar
  const getPaymentAmount = (notes?: string): number => {
    if (!notes) return 0;
    const match = notes.match(/amount:(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Customer ve Vehicle bilgilerini notes'tan çıkarmak için yardımcı fonksiyonlar
  const getCustomerName = (): string => {
    if (service.customer) {
      return service.customer.name ?? service.customer.full_name ?? 'Belirtilmemiş';
    }
    if (service.notes && service.notes.includes('customer_name:')) {
      const match = service.notes.match(/customer_name:([^,]+)/);
      return match ? match[1].trim() : 'Belirtilmemiş';
    }
    return 'Belirtilmemiş';
  };

  const getCustomerPhone = (): string => {
    if (service.customer) return service.customer.phone;
    if (service.notes && service.notes.includes('customer_phone:')) {
      const match = service.notes.match(/customer_phone:([^,]+)/);
      return match ? match[1].trim() : '';
    }
    return '';
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading size="lg">Servis Detayı #{service.id.substring(0, 8)}</Heading>
          <Text color="gray.600" mt={1}>
            {formatDate(service.service_date)}
          </Text>
        </Box>

        <HStack spacing={2}>
          <Button leftIcon={<CopyIcon />} variant="outline" size="sm" onClick={handleCopy}>
            Kopyala
          </Button>
          <Button leftIcon={<FaPrint />} variant="outline" size="sm" onClick={handlePrint}>
            Yazdır
          </Button>
          <Menu>
            <MenuButton
              as={Button}
              leftIcon={<FaFilePdf />}
              rightIcon={<DownloadIcon />}
              colorScheme="blue"
              size="sm"
              isLoading={isGenerating}
            >
              PDF
            </MenuButton>
            <MenuList>
              <MenuItem onClick={handleOpenPreview}>Rapor Önizleme</MenuItem>
              <MenuItem onClick={handleDownloadPdf}>Mevcut PDF'i İndir</MenuItem>
              <MenuItem onClick={handleGenerateNewPdf}>Yeni PDF Oluştur ve İndir</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* PDF Önizleme ve Yönetim Modal */}
      <ServiceReportPreview
        isOpen={isOpen}
        onClose={onClose}
        serviceId={serviceId}
        serviceName={serviceName}
        customerName={getCustomerName()}
      />

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6} mb={6}>
        <GridItem>
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">Müşteri Bilgileri</Heading>
            </CardHeader>
            <CardBody>
              <List spacing={2}>
                <ListItem>
                  <Text fontWeight="bold">Ad Soyad:</Text> {getCustomerName()}
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold">Telefon:</Text> {formatPhoneNumber(getCustomerPhone())}
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold">E-posta:</Text> {service.customer?.email || '-'}
                </ListItem>
              </List>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">Araç Bilgileri</Heading>
            </CardHeader>
            <CardBody>
              <List spacing={2}>
                <ListItem>
                  <Text fontWeight="bold">Marka/Model:</Text> {service.vehicle?.brand} {service.vehicle?.model}
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold">Plaka:</Text> {service.vehicle?.plate}
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold">Yıl:</Text> {service.vehicle?.year || '-'}
                </ListItem>
              </List>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: '1fr', md: '1fr 300px' }} gap={6}>
        <GridItem>
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Servis Detayları</Tab>
              <Tab>Teknisyen Notları</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Box overflowX="auto">
                    <Box as="table" width="100%" style={{ borderCollapse: 'collapse' }}>
                      <Box as="thead" bg="gray.50">
                        <Box as="tr">
                          <Box as="th" p={3} textAlign="left">Hizmet</Box>
                          <Box as="th" p={3} textAlign="left">Açıklama</Box>
                          <Box as="th" p={3} textAlign="right">Tutar</Box>
                        </Box>
                      </Box>
                      <Box as="tbody">
                        <Box as="tr" bg="white">
                          <Box as="td" p={3}>{service.service_type}</Box>
                          <Box as="td" p={3}>{service.description || '-'}</Box>
                          <Box as="td" p={3} textAlign="right">{formatCurrency(service.cost)}</Box>
                        </Box>
                      </Box>
                      <Box as="tfoot" bg="gray.100">
                        <Box as="tr">
                          <Box as="td" p={3} colSpan={2} textAlign="right" fontWeight="bold">Toplam</Box>
                          <Box as="td" p={3} textAlign="right" fontWeight="bold">{formatCurrency(service.cost)}</Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Divider />

                  <Box>
                    <ServiceHistoryList 
                      vehicleId={service.vehicle_id} 
                      currentServiceId={service.id} 
                    />
                  </Box>
                </VStack>
              </TabPanel>

              <TabPanel>
                <TechnicianNotesEditor 
                  notes={service.notes}
                  onSave={saveNotes}
                  isReadOnly={service.status === 'completed'} 
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>

        <GridItem>
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">Durum Bilgisi</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>Servis Durumu</Text>
                  <Badge colorScheme={getStatusColor(service.status)} p={2} borderRadius="md" width="100%" textAlign="center">
                    {service.status === 'in-progress' ? 'Devam Ediyor' : 'Tamamlandı'}
                  </Badge>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>Ödeme Durumu</Text>
                  <Badge colorScheme={getPaymentStatusColor(getPaymentStatus(service.notes))} p={2} borderRadius="md" width="100%" textAlign="center">
                    {getPaymentStatusText(getPaymentStatus(service.notes))}
                  </Badge>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>Toplam Tutar</Text>
                  <Text fontWeight="bold">{formatCurrency(service.cost)}</Text>
                </Box>

                <Divider />

                <Button
                  leftIcon={<EditIcon />}
                  colorScheme="blue"
                  isLoading={isUpdatingStatus}
                  isDisabled={service.status === 'completed'}
                  onClick={() => handleStatusChange('completed')}
                >
                  Tamamlandı Olarak İşaretle
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
}; 