import { FinancialTransaction } from '../types/financial';

export const mockFinancialTransactions: FinancialTransaction[] = [
  {
    id: '1',
    customer_id: '1',
    appointment_id: '1',
    amount: 450,
    transaction_type: 'PAYMENT',
    description: 'Motor bakımı ödemesi',
    transaction_date: '2024-03-20',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    customer_id: '2',
    appointment_id: '2',
    amount: 280,
    transaction_type: 'PAYMENT',
    description: 'Fren bakımı ödemesi',
    transaction_date: '2024-03-19',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockCreateFinancialTransaction = (data: Partial<FinancialTransaction>): FinancialTransaction => ({
  id: Math.random().toString(36).substr(2, 9),
  customer_id: '',
  appointment_id: '',
  amount: 0,
  transaction_type: 'PAYMENT',
  description: '',
  transaction_date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...data
}); 