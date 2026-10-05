import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
  Heading,
  SimpleGrid,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import React from 'react';

interface DashboardStatProps {
  label: string;
  value: string | number;
  helpText?: string;
}

const DashboardStat: React.FC<DashboardStatProps> = ({ label, value, helpText }) => {
  return (
    <Card>
      <CardBody>
        <Stat>
          <StatLabel fontSize="lg">{label}</StatLabel>
          <StatNumber fontSize="2xl">{value}</StatNumber>
          {helpText && <StatHelpText>{helpText}</StatHelpText>}
        </Stat>
      </CardBody>
    </Card>
  );
};

export const DashboardPage: React.FC = () => {
  // TODO: Bu verileri API'den alacağız
  const dashboardStats = [
    {
      label: 'Aktif Randevular',
      value: 12,
      helpText: 'Bu hafta',
    },
    {
      label: 'Toplam Müşteri',
      value: 156,
      helpText: 'Son 30 gün: +23',
    },
    {
      label: 'Bekleyen İşler',
      value: 8,
      helpText: 'Güncel durum',
    },
    {
      label: 'Tamamlanan İşler',
      value: 45,
      helpText: 'Bu ay',
    },
  ];

  return (
    <Box px={{ base: 4, md: 8 }} py={{ base: 4, md: 6 }}>
      <Grid gap={{ base: 6, md: 8 }}>
        <Box>
          <Heading
            fontSize={{ base: '2xl', md: '3xl' }}
            mb={{ base: 4, md: 6 }}
          >
            Genel Bakış
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {dashboardStats.map((stat, index) => (
              <DashboardStat
                key={index}
                label={stat.label}
                value={stat.value}
                helpText={stat.helpText}
              />
            ))}
          </SimpleGrid>
        </Box>

        {/* TODO: Buraya grafik ve tablolar eklenecek */}
        <Box>
          <Heading size="md" mb={4}>
            Son Aktiviteler
          </Heading>
          <Card>
            <CardHeader>
              <Heading size="sm">Yaklaşan Randevular</Heading>
            </CardHeader>
            <CardBody>
              {/* TODO: Randevu listesi komponenti eklenecek */}
              <Box>Yakında eklenecek...</Box>
            </CardBody>
          </Card>
        </Box>
      </Grid>
    </Box>
  );
}; 
