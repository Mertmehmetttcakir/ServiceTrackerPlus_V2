import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockCustomers } from '../../__mocks__/customerMocks';
import { CustomerList } from '../../components/features/CustomerList/CustomerList';

// Mock hooks
vi.mock('../../hooks/useCustomers', () => ({
  useCustomers: vi.fn(() => ({
    customers: mockCustomers,
    isLoading: false,
    createCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    deleteCustomer: vi.fn(),
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  })),
}));

vi.mock('../../hooks/useUserRole', () => ({
  useUserRole: vi.fn(() => ({
    canManageCustomers: true,
    isLoading: false,
  })),
}));

describe('Customer Flow Integration Tests', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (component: React.ReactElement) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <BrowserRouter>
            {component}
          </BrowserRouter>
        </ChakraProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('müşteri listesi sayfası yüklenir', () => {
    renderWithProviders(<CustomerList />);
    
    expect(screen.getByText(/müşteriler/i)).toBeInTheDocument();
  });

  it('müşteri listesi gösterilir', () => {
    renderWithProviders(<CustomerList />);
    
    // Mock müşterilerin görüntülendiğini kontrol et
    expect(screen.getByText(mockCustomers[0].full_name)).toBeInTheDocument();
  });

  it('yeni müşteri ekle butonu gösterilir', () => {
    renderWithProviders(<CustomerList />);
    
    expect(screen.getByRole('button', { name: /yeni müşteri/i })).toBeInTheDocument();
  });
}); 