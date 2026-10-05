import { Box, Card, CardBody, CardHeader, Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface PopularServiceData {
  service: string;
  count: number;
  revenue: number;
}

interface PopularServicesChartProps {
  data: PopularServiceData[];
}

const COLORS = ['#3182CE', '#38A169', '#E53E3E', '#D69E2E', '#805AD5', '#319795', '#D53F8C', '#DD6B20', '#3182CE', '#38A169'];

export const PopularServicesChart: React.FC<PopularServicesChartProps> = ({ data }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Grafikte sadece en çok yapılan 5 işlemi gösterelim, gerisini "Diğer" yapalım ki pasta karmaşıklaşmasın
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // İşlem sayısına (count) göre sırala
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5);
    
    if (others.length > 0) {
      const othersCount = others.reduce((acc, curr) => acc + curr.count, 0);
      const othersRevenue = others.reduce((acc, curr) => acc + curr.revenue, 0);
      top5.push({
        service: 'Diğer İşlemler',
        count: othersCount,
        revenue: othersRevenue
      });
    }
    
    return top5;
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box bg="white" p={3} border="1px" borderColor="gray.200" borderRadius="md" shadow="md">
          <Text fontWeight="bold" mb={1}>{data.service}</Text>
          <Text fontSize="sm">İşlem Sayısı: {data.count}</Text>
          <Text fontSize="sm">Toplam Gelir: ₺{data.revenue.toLocaleString('tr-TR')}</Text>
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
        <Heading size="md">En Çok Yapılan İşlemler (Dağılım)</Heading>
      </CardHeader>
      <CardBody>
        <Box h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="service"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardBody>
    </Card>
  );
};
