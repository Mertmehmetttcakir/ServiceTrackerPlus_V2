import {
    Alert,
    AlertIcon,
    Box,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    Select,
    Spinner,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ChartDataPoint } from '../../../types/reports';

interface RevenueChartProps {
  data: ChartDataPoint[];
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  onPeriodChange: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  loading?: boolean;
  error?: string;
  chartType?: 'line' | 'bar' | 'area';
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  period,
  onPeriodChange,
  loading = false,
  error,
  chartType = 'line',
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const formatXAxisLabel = (value: string) => {
    if (!value) return '';
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    switch (period) {
      case 'daily':
        return date.toLocaleDateString('tr-TR', { 
          day: '2-digit', 
          month: '2-digit' 
        });
      case 'weekly':
        return `H${getWeekNumber(date)}`;
      case 'monthly':
        return date.toLocaleDateString('tr-TR', { 
          month: 'short',
          year: '2-digit'
        });
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return value;
    }
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'value' || name === 'revenue') {
      return [`₺${value.toLocaleString('tr-TR')}`, 'Gelir'];
    }
    return [value.toLocaleString('tr-TR'), name];
  };

  const formatTooltipLabel = (label: string) => {
    if (!label) return '';
    
    const date = new Date(label);
    if (isNaN(date.getTime())) return label;

    switch (period) {
      case 'daily':
        return date.toLocaleDateString('tr-TR');
      case 'weekly':
        return `Hafta ${getWeekNumber(date)} - ${date.getFullYear()}`;
      case 'monthly':
        return date.toLocaleDateString('tr-TR', { 
          month: 'long',
          year: 'numeric'
        });
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return label;
    }
  };

  const getWeekNumber = (date: Date): number => {
    const d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tickFormatter={(value) => `₺${value.toLocaleString('tr-TR')}`} />
            <Tooltip 
              formatter={formatTooltipValue}
              labelFormatter={formatTooltipLabel}
            />
            <Legend />
            <Bar dataKey="value" fill="#3182CE" name="Gelir" />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tickFormatter={(value) => `₺${value.toLocaleString('tr-TR')}`} />
            <Tooltip 
              formatter={formatTooltipValue}
              labelFormatter={formatTooltipLabel}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3182CE" 
              fill="#3182CE" 
              fillOpacity={0.3}
              name="Gelir"
            />
          </AreaChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tickFormatter={(value) => `₺${value.toLocaleString('tr-TR')}`} />
            <Tooltip 
              formatter={formatTooltipValue}
              labelFormatter={formatTooltipLabel}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3182CE" 
              strokeWidth={2}
              name="Gelir"
            />
          </LineChart>
        );
    }
  };

  if (error) {
    return (
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <Heading size="md">Gelir Grafiği</Heading>
          <Select 
            value={period} 
            onChange={(e) => onPeriodChange(e.target.value as any)}
            width="150px"
          >
            <option value="daily">Günlük</option>
            <option value="weekly">Haftalık</option>
            <option value="monthly">Aylık</option>
            <option value="yearly">Yıllık</option>
          </Select>
        </Flex>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Flex justify="center" align="center" height="300px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : data.length === 0 ? (
          <Flex justify="center" align="center" height="300px">
            <Text color="gray.500">Veri bulunamadı</Text>
          </Flex>
        ) : (
          <Box height="300px">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

// Helper function for week calculation
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}; 