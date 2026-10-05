import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { mockCustomers } from '../../../__mocks__/customerMocks';
import { CustomerList } from './CustomerList';

// Mock hooks
vi.mock('../../../hooks/useCustomers', () => ({
  useCustomers: vi.fn(() => ({
    customers: mockCustomers,
    isLoading: false,
  })),
}));

vi.mock('../../../hooks/useUserRole', () => ({
  useUserRole: vi.fn(() => ({
    canManageCustomers: true,
    isLoading: false,
  })),
}));

describe('CustomerList Component', () => {
  const queryClient = new QueryClient();

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CustomerList />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('müşteri listesini ve başlığı render eder', () => {
    renderComponent();
    expect(screen.getByText('Müşteriler')).toBeTruthy();
  });

  it('müşteri bilgilerini gösterir', () => {
    renderComponent();
    expect(screen.getByText(mockCustomers[0].full_name)).toBeTruthy();
    expect(screen.getByText(mockCustomers[0].email!)).toBeTruthy();
  });

  it('her müşteri için aksiyon butonlarını gösterir', () => {
    renderComponent();
    const editButtons = screen.getAllByRole('button', { name: /düzenle/i });
    expect(editButtons.length).toBeGreaterThan(0);
  });
}); 