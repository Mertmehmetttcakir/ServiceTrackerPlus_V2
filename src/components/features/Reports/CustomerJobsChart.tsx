import {
    Alert,
    AlertIcon,
    Box,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    Spinner,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface CustomerJobData {
  jobId: string;
  jobDescription: string;
  jobDate: string;
  totalCost: number;
  paidAmount: number;
  remainingBalance: number;
}

interface CustomerJobsChartProps {
  data: CustomerJobData[];
  loading?: boolean;
  error?: string;
  selectedCustomerId?: string;
  customerName?: string;
}

export const CustomerJobsChart: React.FC<CustomerJobsChartProps> = ({
  data,
  loading = false,
  error,
  selectedCustomerId,
  customerName,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const formatTooltipValue = (value: number, name: string) => {
    const labels = {
      totalCost: 'Toplam Tutar',
      paidAmount: 'Ödenen Tutar',
      remainingBalance: 'Kalan Borç'
    };
    return [`₺${value.toLocaleString('tr-TR')}`, labels[name as keyof typeof labels] || name];
  };

  const formatTooltipLabel = (label: string) => {
    const job = data.find(job => job.jobId === label);
    if (job) {
      return `${job.jobDescription} (${new Date(job.jobDate).toLocaleDateString('tr-TR')})`;
    }
    return label;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const job = data.find(job => job.jobId === label);
      if (job) {
        return (
          <Box bg="white" p={3} border="1px" borderColor="gray.200" borderRadius="md" shadow="md">
            <Text fontWeight="bold" mb={2}>
              {job.jobDescription}
            </Text>
            <Text fontSize="sm" color="gray.600" mb={2}>
              {new Date(job.jobDate).toLocaleDateString('tr-TR')}
            </Text>
            {payload.map((entry: any) => (
              <Flex key={entry.dataKey} justify="space-between" align="center" mb={1}>
                <Flex align="center">
                  <Box w={3} h={3} bg={entry.color} mr={2} borderRadius="sm" />
                  <Text fontSize="sm">{entry.name}:</Text>
                </Flex>
                <Text fontSize="sm" fontWeight="bold">
                  ₺{entry.value.toLocaleString('tr-TR')}
                </Text>
              </Flex>
            ))}
          </Box>
        );
      }
    }
    return null;
  };

  if (!selectedCustomerId || !data.length) {
    return (
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">Müşteri İşleri ve Ödemeler</Heading>
        </CardHeader>
        <CardBody>
          <Text color="gray.500" textAlign="center" py={8}>
            {!selectedCustomerId 
              ? 'Grafik için bir müşteri seçiniz' 
              : 'Bu müşteriye ait iş bulunamadı'
            }
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <Heading size="md">
            {customerName ? `${customerName} - İşler ve Ödemeler` : 'Müşteri İşleri ve Ödemeler'}
          </Heading>
          <Text fontSize="sm" color="gray.500">
            {data.length} İş
          </Text>
        </Flex>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Flex justify="center" align="center" h="300px">
            <Spinner size="lg" color="blue.500" />
          </Flex>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <Box h="400px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="jobId"
                  tickFormatter={(value) => {
                    const job = data.find(job => job.jobId === value);
                    return job ? job.jobDescription.substring(0, 15) + '...' : value;
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `₺${value.toLocaleString('tr-TR')}`} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="totalCost" 
                  fill="#718096" 
                  name="Toplam Tutar"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="paidAmount" 
                  fill="#38A169" 
                  name="Ödenen Tutar"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="remainingBalance" 
                  fill="#E53E3E" 
                  name="Kalan Borç"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}; 