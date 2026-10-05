import { supabase } from '../lib/supabase';
import { Supplier, SupplierCreate, SupplierUpdate, SupplierTransaction, SupplierTransactionCreate, SupplierInvoice, SupplierInvoiceCreate } from '../types/supplier';
import { BaseApiService } from './baseApiService';

export class SupplierService extends BaseApiService {
  static async getSuppliers(): Promise<Supplier[]> {
    return this.handleListRequest<Supplier>(
      async () => supabase.from('suppliers').select('*').order('company_name', { ascending: true }),
      'Tedarikçiler getirilemedi'
    );
  }

  static async getSupplierById(id: string): Promise<Supplier> {
    return this.handleRequest<Supplier>(
      async () => supabase.from('suppliers').select('*').eq('id', id).single(),
      'Tedarikçi detayları getirilemedi'
    );
  }

  static async createSupplier(data: SupplierCreate): Promise<Supplier> {
    return this.handleCreateRequest<Supplier>(
      async () => supabase.from('suppliers').insert(data).select('*').single(),
      'Tedarikçi oluşturulamadı'
    );
  }

  static async updateSupplier(id: string, data: SupplierUpdate): Promise<Supplier> {
    return this.handleUpdateRequest<Supplier>(
      async () => supabase.from('suppliers').update(data).eq('id', id).select('*').single(),
      'Tedarikçi güncellenemedi'
    );
  }

  static async deleteSupplier(id: string): Promise<void> {
    return this.handleDeleteRequest(
      async () => supabase.from('suppliers').delete().eq('id', id),
      'Tedarikçi silinemedi'
    );
  }

  static async getSupplierTransactions(supplierId: string): Promise<SupplierTransaction[]> {
    return this.handleListRequest<SupplierTransaction>(
      async () => supabase.from('supplier_transactions').select('*').eq('supplier_id', supplierId).order('transaction_date', { ascending: false }),
      'Tedarikçi işlemleri getirilemedi'
    );
  }

  static async getAllSupplierTransactions(): Promise<SupplierTransaction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    return this.handleListRequest<SupplierTransaction>(
      async () => supabase
        .from('supplier_transactions')
        .select(`
          *,
          supplier:suppliers!inner(id, company_name, user_id)
        `)
        .eq('supplier.user_id', user?.id)
        .order('transaction_date', { ascending: false }),
      'Tüm tedarikçi işlemleri getirilemedi'
    );
  }

  static async createSupplierTransaction(data: SupplierTransactionCreate): Promise<SupplierTransaction> {
    return this.handleCreateRequest<SupplierTransaction>(
      async () => supabase.from('supplier_transactions').insert(data).select('*').single(),
      'Tedarikçi işlemi oluşturulamadı'
    );
  }

  static async getSupplierInvoices(supplierId: string): Promise<SupplierInvoice[]> {
    return this.handleListRequest<SupplierInvoice>(
      async () => supabase.from('supplier_invoices' as any).select('*').eq('supplier_id', supplierId).order('invoice_date', { ascending: false }),
      'Tedarikçi faturaları getirilemedi'
    );
  }

  static async createSupplierInvoice(data: SupplierInvoiceCreate): Promise<SupplierInvoice> {
    return this.handleCreateRequest<SupplierInvoice>(
      async () => supabase.from('supplier_invoices' as any).insert(data).select('*').single(),
      'Tedarikçi faturası eklenirken hata oluştu'
    );
  }
}
