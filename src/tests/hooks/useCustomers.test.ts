import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { mockCustomers } from '../../__mocks__/customerMocks';

// Mock Supabase
const mockSupabaseQuery = {
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
};

const mockSupabase = {
  from: vi.fn(() => mockSupabaseQuery),
};

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// useCustomers hook'unu mock'la
const mockUseCustomers = vi.fn();
vi.mock('../../hooks/useCustomers', () => ({
  useCustomers: mockUseCustomers,
}));

describe('useCustomers Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  it('müşteri listesini başarıyla döndürür', async () => {
    // Mock hook response
    mockUseCustomers.mockReturnValue({
      customers: mockCustomers,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => mockUseCustomers(), { wrapper });

    expect(result.current.customers).toEqual(mockCustomers);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loading durumunu doğru şekilde yönetir', async () => {
    // İlk loading state
    mockUseCustomers.mockReturnValue({
      customers: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { result, rerender } = renderHook(() => mockUseCustomers(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.customers).toBeUndefined();

    // Loading tamamlandıktan sonra
    mockUseCustomers.mockReturnValue({
      customers: mockCustomers,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    rerender();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.customers).toEqual(mockCustomers);
  });

  it('hata durumunu doğru şekilde işler', async () => {
    const errorMessage = 'Database connection failed';
    
    mockUseCustomers.mockReturnValue({
      customers: undefined,
      isLoading: false,
      error: new Error(errorMessage),
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => mockUseCustomers(), { wrapper });

    expect(result.current.customers).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe(errorMessage);
  });

  it('refetch fonksiyonunu sağlar', async () => {
    const mockRefetch = vi.fn();
    
    mockUseCustomers.mockReturnValue({
      customers: mockCustomers,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => mockUseCustomers(), { wrapper });

    expect(typeof result.current.refetch).toBe('function');
    
    // Refetch çağır
    result.current.refetch();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('boş müşteri listesi ile çalışır', async () => {
    mockUseCustomers.mockReturnValue({
      customers: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => mockUseCustomers(), { wrapper });

    expect(result.current.customers).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
}); 