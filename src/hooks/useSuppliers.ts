import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { SupplierService } from '../services/supplierService';
import { Supplier, SupplierCreate, SupplierUpdate, SupplierTransaction, SupplierTransactionCreate, SupplierInvoice, SupplierInvoiceCreate } from '../types/supplier';

const SUPPLIERS_KEY = 'suppliers';
const SUPPLIER_TRANSACTIONS_KEY = 'supplier_transactions';
const SUPPLIER_INVOICES_KEY = 'supplier_invoices';

export const useSuppliers = (options?: Omit<UseQueryOptions<Supplier[], Error, Supplier[], string[]>, 'queryKey' | 'queryFn' | 'initialData'>) => {
  return useQuery({
    queryKey: [SUPPLIERS_KEY],
    queryFn: () => SupplierService.getSuppliers(),
    ...options,
  });
};

export const useSupplier = (id: string | undefined, options?: Omit<UseQueryOptions<Supplier, Error, Supplier, string[]>, 'queryKey' | 'queryFn' | 'initialData'>) => {
  return useQuery({
    queryKey: [SUPPLIERS_KEY, id || ''],
    queryFn: () => SupplierService.getSupplierById(id!),
    enabled: !!id,
    ...options,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierCreate) => SupplierService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierUpdate }) => SupplierService.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SupplierService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useSupplierTransactions = (supplierId: string, options?: Omit<UseQueryOptions<SupplierTransaction[], Error, SupplierTransaction[], string[]>, 'queryKey' | 'queryFn' | 'initialData'>) => {
  return useQuery({
    queryKey: [SUPPLIER_TRANSACTIONS_KEY, supplierId],
    queryFn: () => SupplierService.getSupplierTransactions(supplierId),
    enabled: !!supplierId,
    ...options,
  });
};

export const useAllSupplierTransactions = (options?: Omit<UseQueryOptions<SupplierTransaction[], Error, SupplierTransaction[], string[]>, 'queryKey' | 'queryFn' | 'initialData'>) => {
  return useQuery({
    queryKey: [SUPPLIER_TRANSACTIONS_KEY, 'all'],
    queryFn: () => SupplierService.getAllSupplierTransactions(),
    ...options,
  });
};

export const useCreateSupplierTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierTransactionCreate) => SupplierService.createSupplierTransaction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_TRANSACTIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useSupplierInvoices = (supplierId: string) => {
  return useQuery({
    queryKey: [SUPPLIER_INVOICES_KEY, supplierId],
    queryFn: () => SupplierService.getSupplierInvoices(supplierId),
    enabled: !!supplierId,
  });
};

export const useCreateSupplierInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierInvoiceCreate) => SupplierService.createSupplierInvoice(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_INVOICES_KEY, variables.supplier_id] });
    },
  });
};
