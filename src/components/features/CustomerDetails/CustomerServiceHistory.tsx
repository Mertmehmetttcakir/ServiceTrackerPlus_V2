import { CopyIcon, DownloadIcon } from '@chakra-ui/icons';
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Alert,
    AlertIcon,
    Badge,
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    HStack,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack
} from '@chakra-ui/react';
import React from 'react';
import { useServiceHistory } from '../../../hooks/useServiceHistory';
import type { ServiceItem } from '../../../types/appointment';
import { ServiceHistory } from '../../../types/serviceHistory';
import { formatDate } from '../../../utils/formatters';

interface CustomerServiceHistoryProps {
  customerId: string;
}

export const CustomerServiceHistory: React.FC<CustomerServiceHistoryProps> = ({ customerId }) => {
  const { serviceRecords, isLoading, error } = useServiceHistory(customerId);

  const handleCopy = (recordId: string) => {
    navigator.clipboard.writeText(`Servis Kaydı #${recordId}`).then(() => {
      alert('Servis kaydı referansı kopyalandı');
    });
  };

  const handleDownload = (recordId: string) => {
    window.open(`/service-records/${recordId}/download`, '_blank');
  };

  const renderServiceHistoryTitle = (record: ServiceHistory) => {
    const date = record.service_date ? formatDate(record.service_date) : '-';
    const vehicleInfo = record.vehicleInfo || { brand: '-', model: '-', plate: '-' };
    return `${date} - ${vehicleInfo.brand} ${vehicleInfo.model} (${vehicleInfo.plate})`;
  };

  const renderServiceList = (record: ServiceHistory) => {
    return record.services?.map((service: ServiceItem) => (
      <Tr key={service.id}>
        <Td>{service.name}</Td>
        <Td>{service.description || '-'}</Td>
        <Td isNumeric>{service.price?.toLocaleString('tr-TR') || '-'} ₺</Td>
      </Tr>
    )) || null;
  };

  const renderTotalPrice = (record: ServiceHistory) => 
    record.totalPrice?.toLocaleString('tr-TR') || '-';

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Servis geçmişi yüklenirken bir hata oluştu
      </Alert>
    );
  }

  if (!serviceRecords || serviceRecords.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.500">
          Bu müşteriye ait servis kaydı bulunmamaktadır.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>
        Servis Geçmişi
      </Heading>

      <Accordion allowMultiple defaultIndex={[0]}>
        {serviceRecords.map((record) => (
          <AccordionItem key={record.id}>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="bold">
                      {renderServiceHistoryTitle(record)}
                    </Text>
                    <Badge colorScheme={record.status === 'completed' ? 'green' : 'orange'}>
                      {record.status === 'completed' ? 'Tamamlandı' : 'İşlemde'}
                    </Badge>
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Servis Detayları
                  </Text>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Hizmet</Th>
                        <Th>Açıklama</Th>
                        <Th isNumeric>Tutar</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {renderServiceList(record)}
                      <Tr fontWeight="bold">
                        <Td colSpan={2} textAlign="right">
                          Toplam
                        </Td>
                        <Td isNumeric>{renderTotalPrice(record)}</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Teknisyen Notları
                  </Text>
                  <Text>{record.technicianNotes || 'Not bulunmamaktadır.'}</Text>
                </Box>

                <Divider />

                <HStack justify="flex-end" spacing={2}>
                  <Button
                    leftIcon={<CopyIcon />}
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(record.id)}
                  >
                    Kopyala
                  </Button>
                  <Button
                    leftIcon={<DownloadIcon />}
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleDownload(record.id)}
                  >
                    PDF İndir
                  </Button>
                </HStack>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
}; 