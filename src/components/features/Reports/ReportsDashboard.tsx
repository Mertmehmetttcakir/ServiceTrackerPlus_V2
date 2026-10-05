import { ChevronDownIcon, DownloadIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Spinner,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useToast,
  VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useCustomers } from '../../../hooks/useCustomers';
import {
  useCustomerJobsData,
  useCustomerReport,
  useFinancialReport,
  useRevenueChartData,
  useServiceReport,
  useTechnicianReport
} from '../../../hooks/useReports';
import { PDFExportService } from '../../../services/pdfExportService';
import { ReportFilters } from '../../../types/reports';
import { CustomerJobsChart } from './CustomerJobsChart';
import { PopularServicesChart } from './PopularServicesChart';
import { ReportFiltersForm } from './ReportFiltersForm';
import { RevenueChart } from './RevenueChart';
import { TopCustomersChart } from './TopCustomersChart';

export const ReportsDashboard: React.FC = () => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      end: new Date().toISOString(),
    },
  });

  // Müşteri listesini getir
  const { customers } = useCustomers({ 
    sortBy: 'full_name', 
    sortOrder: 'asc' 
  });

  // Rapor verilerini getir
  const { data: financialData, isLoading: financialLoading, error: financialError } = useFinancialReport(filters);
  const { data: customerData, isLoading: customerLoading, error: customerError } = useCustomerReport(filters);
  const { data: serviceData, isLoading: serviceLoading, error: serviceError } = useServiceReport(filters);
  const { data: technicianData, isLoading: technicianLoading, error: technicianError } = useTechnicianReport(filters);
  const { data: chartData, isLoading: chartLoading, error: chartError } = useRevenueChartData(filters);
  const { data: customerJobsData, isLoading: customerJobsLoading, error: customerJobsError } = useCustomerJobsData(filters.customerId, filters);

  const handleFiltersChange = (newFilters: ReportFilters) => {
    setFilters(newFilters);
  };

  // Seçilen müşterinin adını bul
  const selectedCustomer = filters.customerId ? 
    customers?.find(c => c.id === filters.customerId) : null;

  const getReportTitle = () => {
    if (selectedCustomer) {
      return `${selectedCustomer.full_name} - Müşteri Raporları`;
    }
    return 'Genel Raporlar';
  };

  const handleExportCSV = async (reportType: string) => {
    try {
      let data;
      let filename;

      switch (reportType) {
        case 'financial':
          data = financialData;
          filename = 'financial-report.csv';
          break;
        case 'customer':
          data = customerData;
          filename = 'customer-report.csv';
          break;
        case 'service':
          data = serviceData;
          filename = 'service-report.csv';
          break;
        case 'technician':
          data = technicianData;
          filename = 'technician-report.csv';
          break;
        default:
          return;
      }

      if (data) {
        const csvContent = convertToCSV(data);
        downloadCSV(csvContent, filename);
        toast({
          title: 'Success',
          description: 'CSV file downloaded',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'CSV dosyası indirilemedi',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleExportPDF = async (reportType: string) => {
    try {
      switch (reportType) {
        case 'financial':
          if (financialData) await PDFExportService.exportFinancialReport(financialData);
          break;
        case 'customer':
          if (customerData) await PDFExportService.exportCustomerReport(customerData);
          break;
        case 'service':
          if (serviceData) await PDFExportService.exportServiceReport(serviceData);
          break;
        case 'technician':
          if (technicianData) await PDFExportService.exportTechnicianReport(technicianData);
          break;
        case 'combined':
          if (financialData && customerData && serviceData && technicianData) {
            await PDFExportService.exportCombinedReport(
              financialData,
              customerData,
              serviceData,
              technicianData
            );
          }
          break;
        default:
          return;
      }

      toast({
        title: 'Başarılı',
        description: 'PDF dosyası indirildi',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'PDF dosyası indirilemedi',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const convertToCSV = (data: any): string => {
    const headers = Object.keys(data);
    const values = Object.values(data);
    
    let csv = headers.join(',') + '\n';
    csv += values.map(value => 
      typeof value === 'object' ? JSON.stringify(value) : value
    ).join(',');
    
    return csv;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ExportButton: React.FC<{ reportType: string }> = ({ reportType }) => (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="outline">
        <DownloadIcon mr={2} />
        Dışa Aktar
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => handleExportCSV(reportType)}>
          CSV olarak indir
        </MenuItem>
        <MenuItem onClick={() => handleExportPDF(reportType)}>
          PDF olarak indir
        </MenuItem>
      </MenuList>
    </Menu>
  );

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>{getReportTitle()}</Heading>
          <Text color="gray.600" mb={6}>
            {selectedCustomer ? 
              `${selectedCustomer.full_name} müşterisinin performans raporları` :
              'İşletmenizin performansını analiz edin ve raporlar oluşturun'
            }
          </Text>
        </Box>

        {/* Filtreleme Arayüzü */}
        <ReportFiltersForm
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Gelir Grafiği */}
        <RevenueChart
          data={
            chartPeriod === 'weekly'
              ? chartData?.weekly || []
              : chartPeriod === 'monthly'
              ? chartData?.monthly || []
              : chartPeriod === 'yearly'
              ? chartData?.yearly || []
              : chartData?.daily || []
          }
          period={chartPeriod}
          onPeriodChange={setChartPeriod}
          loading={chartLoading}
          error={chartError?.message}
        />

        {/* Müşteri İşleri Grafiği */}
        <CustomerJobsChart
          data={customerJobsData || []}
          loading={customerJobsLoading}
          error={customerJobsError?.message}
          selectedCustomerId={filters.customerId}
          customerName={selectedCustomer?.full_name}
        />

        {/* Yeni Grafikler (Pasta ve VIP Müşteri) */}
        {!filters.customerId && (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <PopularServicesChart data={serviceData?.popularServices || []} />
            <TopCustomersChart data={customerData?.topCustomers || []} />
          </SimpleGrid>
        )}

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Finansal</Tab>
            <Tab>Müşteri</Tab>
            <Tab>Servis</Tab>
            <Tab>Teknisyen</Tab>
          </TabList>

          <TabPanels>
            {/* Finansal Rapor */}
            <TabPanel>
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Finansal Rapor</Heading>
                    <ExportButton reportType="financial" />
                  </Flex>
                </CardHeader>
                <CardBody>
                  {financialLoading ? (
                    <Flex justify="center" py={8}>
                      <Spinner size="lg" />
                    </Flex>
                  ) : financialError ? (
                    <Alert status="error">
                      <AlertIcon />
                      Finansal veriler yüklenemedi
                    </Alert>
                  ) : financialData ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                      <Stat>
                        <StatLabel>Toplam Gelir</StatLabel>
                        <StatNumber>₺{financialData.totalRevenue.toLocaleString('tr-TR')}</StatNumber>
                        <StatHelpText>
                          <StatArrow type={financialData.revenueGrowth >= 0 ? 'increase' : 'decrease'} />
                          %{Math.abs(financialData.revenueGrowth).toFixed(2)}
                        </StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Net Kar</StatLabel>
                        <StatNumber>₺{financialData.netProfit.toLocaleString('tr-TR')}</StatNumber>
                        <StatHelpText>Kar Marjı: %{financialData.profitMargin.toFixed(2)}</StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Bekleyen Ödemeler</StatLabel>
                        <StatNumber>₺{financialData.pendingAmount.toLocaleString('tr-TR')}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Toplam Gider</StatLabel>
                        <StatNumber>₺{financialData.totalExpenses.toLocaleString('tr-TR')}</StatNumber>
                      </Stat>
                    </SimpleGrid>
                  ) : (
                    <Text>Veri bulunamadı</Text>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Müşteri Raporu */}
            <TabPanel>
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Müşteri Raporu</Heading>
                    <ExportButton reportType="customer" />
                  </Flex>
                </CardHeader>
                <CardBody>
                  {customerLoading ? (
                    <Flex justify="center" py={8}>
                      <Spinner size="lg" />
                    </Flex>
                  ) : customerError ? (
                    <Alert status="error">
                      <AlertIcon />
                      Müşteri verileri yüklenemedi
                    </Alert>
                  ) : customerData ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                      <Stat>
                        <StatLabel>Toplam Müşteri</StatLabel>
                        <StatNumber>{customerData.totalCustomers}</StatNumber>
                        <StatHelpText>
                          <StatArrow type={customerData.customerGrowth >= 0 ? 'increase' : 'decrease'} />
                          %{Math.abs(customerData.customerGrowth).toFixed(2)}
                        </StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Yeni Müşteri</StatLabel>
                        <StatNumber>{customerData.newCustomers}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Müşteri Tutma Oranı</StatLabel>
                        <StatNumber>%{customerData.customerRetentionRate.toFixed(2)}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Ortalama Müşteri Değeri</StatLabel>
                        <StatNumber>₺{customerData.averageCustomerValue.toLocaleString('tr-TR')}</StatNumber>
                      </Stat>
                    </SimpleGrid>
                  ) : (
                    <Text>Veri bulunamadı</Text>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Servis Raporu */}
            <TabPanel>
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Servis Raporu</Heading>
                    <ExportButton reportType="service" />
                  </Flex>
                </CardHeader>
                <CardBody>
                  {serviceLoading ? (
                    <Flex justify="center" py={8}>
                      <Spinner size="lg" />
                    </Flex>
                  ) : serviceError ? (
                    <Alert status="error">
                      <AlertIcon />
                      Servis verileri yüklenemedi
                    </Alert>
                  ) : serviceData ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                      <Stat>
                        <StatLabel>Toplam İş</StatLabel>
                        <StatNumber>{serviceData.totalJobs}</StatNumber>
                        <StatHelpText>
                          <StatArrow type={serviceData.jobGrowth >= 0 ? 'increase' : 'decrease'} />
                          %{Math.abs(serviceData.jobGrowth).toFixed(2)}
                        </StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Tamamlanan İş</StatLabel>
                        <StatNumber>{serviceData.completedJobs}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Bekleyen İş</StatLabel>
                        <StatNumber>{serviceData.pendingJobs}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Ortalama İş Değeri</StatLabel>
                        <StatNumber>₺{serviceData.averageJobValue.toLocaleString('tr-TR')}</StatNumber>
                      </Stat>
                    </SimpleGrid>
                  ) : (
                    <Text>Veri bulunamadı</Text>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Teknisyen Raporu */}
            <TabPanel>
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Teknisyen Raporu</Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {technicianLoading ? (
                    <Flex justify="center" py={8}>
                      <Spinner size="lg" />
                    </Flex>
                  ) : technicianError ? (
                    <Alert status="error">
                      <AlertIcon />
                      Teknisyen verileri yüklenemedi
                    </Alert>
                  ) : (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Text>Bu özellik şu anda geliştirme aşamasındadır.</Text>
                    </Alert>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Kapsamlı Rapor İndir */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="md" mb={2}>Kapsamlı Rapor</Heading>
                <Text color="gray.600">Tüm raporları tek bir PDF'te indirin</Text>
              </Box>
              <Button 
                colorScheme="blue" 
                leftIcon={<DownloadIcon />}
                onClick={() => handleExportPDF('combined')}
                isDisabled={!financialData || !customerData || !serviceData || !technicianData}
              >
                PDF İndir
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}; 