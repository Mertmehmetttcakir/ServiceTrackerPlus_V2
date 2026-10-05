import { Box, Card, CardBody, CardHeader, Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TopCustomerData {
  id: string;
  name: string;
  totalSpent: number;
  jobCount: number;
}

interface TopCustomersChartProps {
  data: TopCustomerData[];
}

export const TopCustomersChart: React.FC<TopCustomersChartProps> = ({ data }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Grafikte sadece en çok para harcayan 5 müşteriyi gösterelim
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box bg="white" p={3} border="1px" borderColor="gray.200" borderRadius="md" shadow="md">
          <Text fontWeight="bold" mb={1}>{data.name}</Text>
          <Text fontSize="sm">Toplam İş: {data.jobCount}</Text>
          <Text fontSize="sm">Kazanç: ₺{data.totalSpent.toLocaleString('tr-TR')}</Text>
        </Box>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
      <CardHeader pb={0}>
        <Heading size="md">VIP Müşteriler (En Çok Kazandıran İlk 5)</Heading>
      </CardHeader>
      <CardBody>
        <Box h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `₺${value.toLocaleString('tr-TR')}`} 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120}
                tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="totalSpent" 
                fill="#38A169" 
                name="Toplam Ciro" 
                radius={[0, 4, 4, 0]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardBody>
    </Card>
  );
};
