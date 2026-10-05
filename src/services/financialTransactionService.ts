import { supabase } from '../lib/supabase';
import {
  FinancialTransaction,
  FinancialTransactionCreate,
  FinancialTransactionUpdate,
} from '../types/financial';
import { logger } from '../utils/logger';
import { BaseApiService } from './baseApiService';

export class FinancialTransactionService extends BaseApiService {
  static async createFinancialTransaction(
    data: FinancialTransactionCreate
  ): Promise<FinancialTransaction> {
    const transaction = await this.handleCreateRequest<FinancialTransaction>(
      async () =>
        supabase
          .from('financial_transactions')
          .insert(data)
          .select('*') // Gerekirse ilişkili verileri de seçebilirsiniz: '*, customer:customers(id, full_name)'
          .single(),
      'Finansal işlem oluşturulamadı'
    );

    logger.info('Finansal işlem oluşturuldu', {
      transactionId: transaction.id,
      customerId: transaction.customer_id,
      jobId: transaction.job_id,
      vehicleId: transaction.vehicle_id,
      amount: transaction.amount,
      transactionType: transaction.transaction_type,
    });

    return transaction;
  }

  static async getFinancialTransactionById(
    id: string
  ): Promise<FinancialTransaction> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleRequest<FinancialTransaction>(
      async () =>
        supabase
          .from('financial_transactions')
          .select(`
            *, 
            customer:customers!inner(id, full_name, user_id), 
            vehicle:vehicles(id, plate)
          `)
          .eq('id', id)
          .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin işlemlerini getir
          .single(),
      'Finansal işlem detayları getirilemedi'
    );
  }

  static async getFinancialTransactionsByCustomerId(
    customerId: string
  ): Promise<FinancialTransaction[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleListRequest<FinancialTransaction>(
      async () =>
        supabase
          .from('financial_transactions')
          .select(`
            *, 
            vehicle:vehicles(id, plate),
            customer:customers!inner(id, full_name, user_id)
          `)
          .eq('customer_id', customerId)
          .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin işlemlerini getir
          .order('transaction_date', { ascending: false }),
      'Müşteriye ait finansal işlemler getirilemedi'
    );
  }

  static async getFinancialTransactionsByVehicleId(
    vehicleId: string
  ): Promise<FinancialTransaction[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleListRequest<FinancialTransaction>(
      async () =>
        supabase
          .from('financial_transactions')
          .select(`
            *, 
            customer:customers!inner(id, full_name, user_id)
          `)
          .eq('vehicle_id', vehicleId)
          .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin işlemlerini getir
          .order('transaction_date', { ascending: false }),
      'Araca ait finansal işlemler getirilemedi'
    );
  }

  static async getFinancialTransactionsByJobId(
    jobId: string
  ): Promise<FinancialTransaction[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleListRequest<FinancialTransaction>(
      async () =>
        supabase
          .from('financial_transactions')
          .select(`
            *, 
            customer:customers!inner(id, full_name, user_id)
          `)
          .eq('job_id', jobId)
          .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin işlemlerini getir
          .order('transaction_date', { ascending: false }),
      'İşe ait finansal işlemler getirilemedi'
    );
  }

  static async getCompanyFinancialTransactions(): Promise<FinancialTransaction[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleListRequest<FinancialTransaction>(
      async () =>
        supabase
          .from('financial_transactions')
          .select(`
            *, 
            customer:customers!inner(id, full_name, user_id),
            job:jobs(id, job_description)
          `)
          .eq('customer.user_id', user.id)
          .order('transaction_date', { ascending: false }),
      'Şirket finansal işlemleri getirilemedi'
    );
  }

  static async updateFinancialTransaction(
    id: string,
    data: FinancialTransactionUpdate
  ): Promise<FinancialTransaction> {
    const transaction = await this.handleUpdateRequest<FinancialTransaction>(
      async () =>
        supabase
          .from('financial_transactions')
          .update(data)
          .eq('id', id)
          .select('*')
          .single(),
      'Finansal işlem güncellenemedi'
    );

    logger.info('Finansal işlem güncellendi', {
      transactionId: transaction.id,
      customerId: transaction.customer_id,
      jobId: transaction.job_id,
      vehicleId: transaction.vehicle_id,
      amount: transaction.amount,
      transactionType: transaction.transaction_type,
    });

    return transaction;
  }

  static async deleteFinancialTransaction(id: string): Promise<void> {
    await this.handleDeleteRequest(
      async () =>
        supabase.from('financial_transactions').delete().eq('id', id),
      'Finansal işlem silinemedi'
    );

    logger.warn('Finansal işlem silindi', { transactionId: id });
  }

  // Toplu işlem ekleme (örn: araç formu için)
  static async createMultipleFinancialTransactions(
    transactions: FinancialTransactionCreate[]
  ): Promise<FinancialTransaction[]> {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    const createdTransactions = await this.handleCreateRequest<FinancialTransaction[]>(
      async () => supabase
        .from('financial_transactions')
        .insert(transactions)
        .select('*'),
      'Finansal işlemler oluşturulamadı'
    );

    logger.info('Toplu finansal işlem oluşturuldu', {
      transactionCount: createdTransactions.length,
      customerIds: Array.from(new Set(createdTransactions.map((tx) => tx.customer_id))),
    });

    return createdTransactions;
  }
} 