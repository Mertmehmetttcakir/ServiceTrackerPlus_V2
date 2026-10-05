import {
    Box,
    Checkbox,
    CheckboxGroup,
    Divider,
    FormControl,
    FormHelperText,
    FormLabel,
    HStack,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Text,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { RecurrencePattern, RecurrenceType } from '../../../types/appointment';
import { formatDate } from '../../../utils/formatters';

interface RecurrenceOptionsProps {
  value: RecurrencePattern;
  onChange: (value: RecurrencePattern) => void;
  startDate: string;
}

export const RecurrenceOptions: React.FC<RecurrenceOptionsProps> = ({
  value,
  onChange,
  startDate,
}) => {
  // RecurrenceType olmayan 'none' için type guard
  const isRecurringType = (type: RecurrenceType): type is Exclude<RecurrenceType, 'none'> => 
    type !== 'none';

  const [endType, setEndType] = useState<'date' | 'occurrences'>(
    value.endDate ? 'date' : 'occurrences'
  );

  const weekdayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  // Değer değiştiğinde endType'ı güncelle
  useEffect(() => {
    if (value.endDate) {
      setEndType('date');
    } else if (value.occurrences) {
      setEndType('occurrences');
    }
  }, [value]);

  const handleTypeChange = (type: RecurrenceType) => {
    const newValue: RecurrencePattern = { type };

    // Varsayılan değerleri ayarla
    if (type !== 'none') {
      newValue.interval = 1;
      newValue.occurrences = 5;

      // Haftalık tekrarlamada, mevcut günü seç
      if (type === 'weekly' || type === 'biweekly') {
        const startDay = new Date(startDate).getDay();
        newValue.weekdays = [startDay];
      }

      // Aylık tekrarlamada, mevcut ayın gününü seç
      if (type === 'monthly') {
        const startDayOfMonth = new Date(startDate).getDate();
        newValue.dayOfMonth = startDayOfMonth;
      }
    }

    onChange(newValue);
  };

  const handleIntervalChange = (intervalValue: number) => {
    onChange({ ...value, interval: intervalValue });
  };

  const handleOccurrencesChange = (occurrences: number) => {
    onChange({ ...value, occurrences, endDate: undefined });
  };

  const handleEndDateChange = (date: string) => {
    onChange({ ...value, endDate: date, occurrences: undefined });
  };

  const handleWeekdaysChange = (weekdays: number[]) => {
    onChange({ ...value, weekdays });
  };

  const handleDayOfMonthChange = (dayOfMonth: number) => {
    onChange({ ...value, dayOfMonth });
  };

  const handleEndTypeChange = (type: 'date' | 'occurrences') => {
    setEndType(type);
    if (type === 'date' && !value.endDate) {
      // Varsayılan olarak 1 ay sonrasını seç
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      handleEndDateChange(endDate.toISOString().split('T')[0]);
    } else if (type === 'occurrences' && !value.occurrences) {
      handleOccurrencesChange(5);
    }
  };

  if (value.type === 'none') {
    return (
      <Box p={4} bg="gray.50" borderRadius="md">
        <Text>Tekrarlanmayan, tek seferlik randevu.</Text>
      </Box>
    );
  }

  // Burada value.type tipini daraltıyoruz
  const recurringType = value.type as Exclude<RecurrenceType, 'none'>;

  return (
    <Stack spacing={4}>
      <FormControl>
        <FormLabel>Tekrarlama Tipi</FormLabel>
        <Select
          value={recurringType}
          onChange={(e) => handleTypeChange(e.target.value as RecurrenceType)}
        >
          <option value="none">Tekrarlanmayan</option>
          <option value="daily">Günlük</option>
          <option value="weekly">Haftalık</option>
          <option value="biweekly">İki Haftalık</option>
          <option value="monthly">Aylık</option>
          <option value="yearly">Yıllık</option>
        </Select>
      </FormControl>

      <>
        <FormControl>
          <FormLabel>Tekrarlama Aralığı</FormLabel>
          <NumberInput
            min={1}
            max={99}
            value={value.interval || 1}
            onChange={(_, val) => handleIntervalChange(val)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>
            {recurringType === 'daily' && 'Her kaç günde bir tekrarlanacak'}
            {recurringType === 'weekly' && 'Her kaç haftada bir tekrarlanacak'}
            {recurringType === 'biweekly' && 'Her kaç iki haftada bir tekrarlanacak'}
            {recurringType === 'monthly' && 'Her kaç ayda bir tekrarlanacak'}
            {recurringType === 'yearly' && 'Her kaç yılda bir tekrarlanacak'}
          </FormHelperText>
        </FormControl>

        {(recurringType === 'weekly' || recurringType === 'biweekly') && (
          <FormControl>
            <FormLabel>Haftanın Günleri</FormLabel>
            <CheckboxGroup
              value={value.weekdays?.map(String) || []}
              onChange={(vals) => handleWeekdaysChange(vals.map(Number))}
            >
              <Stack direction={['column', 'row']} wrap="wrap">
                {weekdayNames.map((day, index) => (
                  <Checkbox key={index} value={index.toString()}>
                    {day}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
            <FormHelperText>Randevunun oluşturulacağı günleri seçin</FormHelperText>
          </FormControl>
        )}

        {recurringType === 'monthly' && (
          <FormControl>
            <FormLabel>Ayın Günü</FormLabel>
            <NumberInput
              min={1}
              max={31}
              value={value.dayOfMonth || 1}
              onChange={(_, val) => handleDayOfMonthChange(val)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>Randevunun her ay oluşturulacağı gün</FormHelperText>
          </FormControl>
        )}

        <Divider />

        <FormControl>
          <FormLabel>Bitiş</FormLabel>
          <RadioGroup value={endType} onChange={(val) => handleEndTypeChange(val as 'date' | 'occurrences')}>
            <Stack direction="column">
              <Radio value="occurrences">
                <HStack>
                  <Text>Tekrar Sayısı:</Text>
                  <NumberInput
                    min={1}
                    max={99}
                    size="sm"
                    w="80px"
                    value={value.occurrences || 5}
                    isDisabled={endType !== 'occurrences'}
                    onChange={(_, val) => handleOccurrencesChange(val)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text>kez</Text>
                </HStack>
              </Radio>
              <Radio value="date">
                <HStack>
                  <Text>Bitiş Tarihi:</Text>
                  <Input
                    type="date"
                    size="sm"
                    w="180px"
                    value={value.endDate || ''}
                    isDisabled={endType !== 'date'}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    min={new Date(startDate).toISOString().split('T')[0]}
                  />
                </HStack>
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        <Box p={3} bg="blue.50" borderRadius="md">
          <Text fontWeight="medium">Özet</Text>
          <Text fontSize="sm">
            {formatRecurrenceSummary(value, startDate)}
          </Text>
        </Box>
      </>
    </Stack>
  );
};

// Tekrarlama özeti oluşturan yardımcı fonksiyon
export const formatRecurrenceSummary = (pattern: RecurrencePattern, startDate: string): string => {
  if (pattern.type === 'none') {
    return 'Tekrarlanmayan randevu';
  }

  const weekdayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const interval = pattern.interval || 1;

  let summary = '';

  // Tekrarlama periyodu
  switch (pattern.type) {
    case 'daily':
      summary = interval === 1 ? 'Her gün' : `${interval} günde bir`;
      break;
    case 'weekly':
      summary = interval === 1 ? 'Her hafta' : `${interval} haftada bir`;
      if (pattern.weekdays && pattern.weekdays.length > 0) {
        const days = pattern.weekdays.map(day => weekdayNames[day]).join(', ');
        summary += ` (${days})`;
      }
      break;
    case 'biweekly':
      summary = 'İki haftada bir';
      if (pattern.weekdays && pattern.weekdays.length > 0) {
        const days = pattern.weekdays.map(day => weekdayNames[day]).join(', ');
        summary += ` (${days})`;
      }
      break;
    case 'monthly':
      if (pattern.dayOfMonth) {
        summary = interval === 1 
          ? `Her ayın ${pattern.dayOfMonth}. günü` 
          : `${interval} ayda bir ${pattern.dayOfMonth}. günü`;
      } else {
        summary = interval === 1 ? 'Her ay' : `${interval} ayda bir`;
      }
      break;
    case 'yearly':
      summary = interval === 1 ? 'Her yıl' : `${interval} yılda bir`;
      const date = new Date(startDate);
      summary += ` (${date.getDate()} ${date.toLocaleString('tr-TR', { month: 'long' })})`;
      break;
  }

  // Bitiş
  if (pattern.occurrences) {
    summary += `, toplam ${pattern.occurrences} kez`;
  } else if (pattern.endDate) {
    summary += `, ${formatDate(pattern.endDate)} tarihine kadar`;
  }

  return summary;
}; 