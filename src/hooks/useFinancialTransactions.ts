import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { FinancialTransactionService } from '../services/financialTransactionService';
import {
  FinancialTransaction,
  FinancialTransactionCreate,
  FinancialTransactionUpdate,
} from '../types/financial';

// Bu sabitlerin normalde kendi dosyalarından export edilip burada import edilmesi daha iyi olurdu.
// Ancak mevcut durumda export edilmedikleri için burada string olarak kullanıyoruz veya yeniden tanımlıyoruz.
const JOBS_QUERY_KEY_PREFIX = 'jobs'; 
const CUSTOMERS_QUERY_KEY_PREFIX = 'customers';
const FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX = 'financialTransactions';

// Bir müşterinin finansal işlemlerini getirmek için hook
export const useGetFinancialTransactionsByCustomerId = (
  customerId: string | undefined,
  options?: Omit<
    UseQueryOptions<
      FinancialTransaction[],
      Error,
      FinancialTransaction[],
      (string | undefined)[]
    >,
    'queryKey' | 'queryFn' | 'initialData'
  >
) => {
  return useQuery<
    FinancialTransaction[],
    Error,
    FinancialTransaction[],
    (string | undefined)[]
  >({
    queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'byCustomer', customerId],
    queryFn: () => {
      if (!customerId) return Promise.resolve([]);
      return FinancialTransactionService.getFinancialTransactionsByCustomerId(customerId);
    },
    enabled: !!customerId,
    ...options,
  });
};

// Bir işe ait finansal işlemleri getirmek için hook
export const useGetFinancialTransactionsByJobId = (
  jobId: string | undefined,
  options?: Omit<
    UseQueryOptions<
      FinancialTransaction[],
      Error,
      FinancialTransaction[],
      (string | undefined)[]
    >,
    'queryKey' | 'queryFn' | 'initialData'
  >
) => {
  return useQuery<
    FinancialTransaction[],
    Error,
    FinancialTransaction[],
    (string | undefined)[]
  >({
    queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'byJob', jobId],
    queryFn: () => {
      if (!jobId) return Promise.resolve([]);
      return FinancialTransactionService.getFinancialTransactionsByJobId(jobId);
    },
    enabled: !!jobId,
    ...options,
  });
};

// Tüm şirket (kullanıcı) finansal işlemlerini getirmek için hook
export const useGetCompanyFinancialTransactions = (
  options?: Omit<
    UseQueryOptions<
      FinancialTransaction[],
      Error,
      FinancialTransaction[],
      string[]
    >,
    'queryKey' | 'queryFn' | 'initialData'
  >
) => {
  return useQuery<
    FinancialTransaction[],
    Error,
    FinancialTransaction[],
    string[]
  >({
    queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'company'],
    queryFn: () => FinancialTransactionService.getCompanyFinancialTransactions(),
    ...options,
  });
};

// Yeni bir finansal işlem oluşturmak için hook
export const useCreateFinancialTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation<
    FinancialTransaction,
    Error,
    FinancialTransactionCreate,
    unknown
  >({
    mutationFn: (transactionData) =>
      FinancialTransactionService.createFinancialTransaction(transactionData),
    onSuccess: (newTransaction) => {
      // Müşteriye ait finansal işlemler listesini geçersiz kıl
      queryClient.invalidateQueries({
        queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'byCustomer', newTransaction.customer_id],
      });
      // Bu işleme ait spesifik bir detay query'si varsa (genelde olmaz ama örnek için)
      queryClient.invalidateQueries({
        queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'detail', newTransaction.id],
      });

      // İlgili işin detaylarını ve listesini geçersiz kıl
      if (newTransaction.job_id) {
        queryClient.invalidateQueries({
          queryKey: [JOBS_QUERY_KEY_PREFIX, 'detail', newTransaction.job_id],
        });
        // Bu işe ait tüm finansal işlemleri de geçersiz kıl (zaten yukarıda customer bazlı yapılıyor ama job bazlı da eklenebilir)
        queryClient.invalidateQueries({
          queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'byJob', newTransaction.job_id],
        });
      }
      // Müşteriye ait tüm işler listesini geçersiz kıl (işin bakiyesi ve durumu değişmiş olabilir)
      queryClient.invalidateQueries({
        queryKey: [JOBS_QUERY_KEY_PREFIX, 'byCustomer', newTransaction.customer_id],
      });

      // Müşteri detaylarını geçersiz kıl (toplam bakiyenin güncellenmesi için)
      queryClient.invalidateQueries({
        queryKey: [CUSTOMERS_QUERY_KEY_PREFIX, 'detail', newTransaction.customer_id],
      });
       // Tüm müşteri listesini (bakiyeler güncellenebilir) geçersiz kıl
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY_PREFIX, 'list'] });
      // Bazen sadece en üst seviye key'i (örn: ['customers']) geçersiz kılmak da tüm alt sorguları kapsayabilir,
      // ama daha spesifik olmak genellikle daha iyidir.
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY_PREFIX] });
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY_PREFIX] });
      queryClient.invalidateQueries({ queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX] });
      // Dashboard gelir verilerini güncelle
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'monthlyRevenue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'totalRevenue'] });
    },
  });
};

// Toplu finansal işlem oluşturmak için hook (Araç formu için)
export const useCreateMultipleFinancialTransactions = () => {
  const queryClient = useQueryClient();
  return useMutation<
    FinancialTransaction[],
    Error,
    { transactions: FinancialTransactionCreate[]; customerIdToInvalidate?: string, jobIdToInvalidate?: string }, 
    unknown
  >({
    mutationFn: ({ transactions }) =>
      FinancialTransactionService.createMultipleFinancialTransactions(transactions),
    onSuccess: (createdTransactions, variables) => {
      const customerId = variables.customerIdToInvalidate || createdTransactions[0]?.customer_id;
      const jobId = variables.jobIdToInvalidate || createdTransactions.find(t => t.job_id)?.job_id; // İlk job_id'si olanı bul

      if (customerId) {
        queryClient.invalidateQueries({
          queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'byCustomer', customerId],
        });
        queryClient.invalidateQueries({
          queryKey: [CUSTOMERS_QUERY_KEY_PREFIX, 'detail', customerId],
        });
        queryClient.invalidateQueries({
          queryKey: [JOBS_QUERY_KEY_PREFIX, 'byCustomer', customerId],
        });
      }
      if (jobId) {
        queryClient.invalidateQueries({
          queryKey: [JOBS_QUERY_KEY_PREFIX, 'detail', jobId],
        });
        queryClient.invalidateQueries({
          queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'byJob', jobId],
        });
      }
      
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY_PREFIX, 'list'] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY_PREFIX] });
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY_PREFIX] });
      queryClient.invalidateQueries({ queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX] });
      // Dashboard gelir verilerini güncelle
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'monthlyRevenue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'totalRevenue'] });
    },
  });
};


// Finansal bir işlemi güncellemek için hook
export const useUpdateFinancialTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation<
    FinancialTransaction,
    Error,
    { id: string; data: FinancialTransactionUpdate },
    unknown
  >({
    mutationFn: ({ id, data }) =>
      FinancialTransactionService.updateFinancialTransaction(id, data),
    onSuccess: (updatedTransaction) => {
      queryClient.invalidateQueries({queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'detail', updatedTransaction.id]});
      queryClient.invalidateQueries({
        queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'byCustomer', updatedTransaction.customer_id],
      });
      if (updatedTransaction.job_id) {
        queryClient.invalidateQueries({
          queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'byJob', updatedTransaction.job_id],
        });
        queryClient.invalidateQueries({
          queryKey: [JOBS_QUERY_KEY_PREFIX, 'detail', updatedTransaction.job_id],
        });
      }
      queryClient.invalidateQueries({
        queryKey: [JOBS_QUERY_KEY_PREFIX, 'byCustomer', updatedTransaction.customer_id],
      });
      queryClient.invalidateQueries({
        queryKey: [CUSTOMERS_QUERY_KEY_PREFIX, 'detail', updatedTransaction.customer_id]
      });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY_PREFIX, 'list'] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY_PREFIX] });
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY_PREFIX] });
      queryClient.invalidateQueries({ queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX] });
      // Dashboard gelir verilerini güncelle
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'monthlyRevenue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'totalRevenue'] });
    },
  });
};

// Finansal bir işlemi silmek için hook
export const useDeleteFinancialTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: string; customerId?: string, jobId?: string },
    unknown
  >({
    mutationFn: ({ id }) => FinancialTransactionService.deleteFinancialTransaction(id),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'detail', variables.id]});
      if (variables.customerId) {
        queryClient.invalidateQueries({
          queryKey: [
            FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX,
            'byCustomer',
            variables.customerId,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [CUSTOMERS_QUERY_KEY_PREFIX, 'detail', variables.customerId]
        });
         queryClient.invalidateQueries({
          queryKey: [JOBS_QUERY_KEY_PREFIX, 'byCustomer', variables.customerId],
        });
      }
      if (variables.jobId) {
         queryClient.invalidateQueries({
          queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX, 'byJob', variables.jobId],
        });
        queryClient.invalidateQueries({
          queryKey: [JOBS_QUERY_KEY_PREFIX, 'detail', variables.jobId],
        });
      }
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY_PREFIX, 'list'] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY_PREFIX] });
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY_PREFIX] });
      queryClient.invalidateQueries({ queryKey: [FINANCIAL_TRANSACTIONS_QUERY_KEY_PREFIX] });
      // Dashboard gelir verilerini güncelle
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'monthlyRevenue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'totalRevenue'] });
    },
  });
}; 