export interface Supplier {
  id: string;
  user_id: string;
  company_name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type SupplierCreate = Omit<Supplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type SupplierUpdate = Partial<SupplierCreate>;

export interface SupplierTransaction {
  id: string;
  supplier_id: string;
  transaction_type: 'DEBT' | 'PAYMENT';
  amount: number;
  description?: string | null;
  transaction_date: string;
  created_at: string;
  supplier?: Supplier;
  receipt_url?: string | null;
}

export type SupplierTransactionCreate = Omit<SupplierTransaction, 'id' | 'created_at' | 'supplier'>;
export type SupplierTransactionUpdate = Partial<SupplierTransactionCreate>;

export interface SupplierInvoice {
  id: string;
  supplier_id: string;
  invoice_date: string;
  file_url: string;
  created_at: string;
}

export type SupplierInvoiceCreate = Omit<SupplierInvoice, 'id' | 'created_at'>;
