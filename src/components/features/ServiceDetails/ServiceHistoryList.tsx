import {
  Badge,
  Box,
  Heading,
  Link,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useVehicleServiceHistory } from '../../../hooks/useVehicleServiceHistory';
import { formatCurrency, formatDate } from '../../../utils/formatters';

interface ServiceHistoryListProps {
  vehicleId: string;
  currentServiceId?: string;
}

export const ServiceHistoryList: React.FC<ServiceHistoryListProps> = ({
  vehicleId,
  currentServiceId,
}) => {
  const { serviceHistory, isLoading } = useVehicleServiceHistory(vehicleId);

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="md" color="blue.500" />
      </Box>
    );
  }

  // Filtreleme: Mevcut servis kaydını çıkar ve diğerlerini tarihe göre sırala
  const filteredHistory = serviceHistory
    ? serviceHistory
        .filter((record) => record.id !== currentServiceId)
        .sort((a, b) => 
          new Date(b.service_date).getTime() - new Date(a.service_date).getTime()
        )
    : [];

  if (filteredHistory.length === 0) {
    return (
      <Box>
        <Heading size="sm" mb={2}>
          Servis Geçmişi
        </Heading>
        <Text>Bu araç için başka servis kaydı bulunmamaktadır.</Text>
      </Box>
    );
  }

  const getStatusBadge = (status: string) => {
    let color = '';
    let text = '';

    switch (status) {
      case 'in-progress':
        color = 'blue';
        text = 'Devam Ediyor';
        break;
      case 'completed':
        color = 'green';
        text = 'Tamamlandı';
        break;
      default:
        color = 'gray';
        text = 'Bilinmiyor';
    }

    return <Badge colorScheme={color}>{text}</Badge>;
  };

  // Teknisyen bilgisini notes alanından al
  const getTechnician = (notes?: string): string => {
    if (!notes) return '-';
    const match = notes.match(/technician_id:(\w+)/);
    return match ? match[1] : '-';
  };

  return (
    <Box>
      <Heading size="sm" mb={3}>
        Servis Geçmişi
      </Heading>
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Tarih</Th>
              <Th>İşlem</Th>
              <Th>Teknisyen</Th>
              <Th isNumeric>Tutar</Th>
              <Th>Durum</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredHistory.map((record) => (
              <Tr key={record.id}>
                <Td>{formatDate(record.service_date)}</Td>
                <Td>
                  <Link
                    as={RouterLink}
                    to={`/services/${record.id}`}
                    color="blue.600"
                    fontWeight="medium"
                  >
                    {record.service_type}
                  </Link>
                </Td>
                <Td>{getTechnician(record.notes)}</Td>
                <Td isNumeric>{formatCurrency(record.cost)}</Td>
                <Td>{getStatusBadge(record.status)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}; 