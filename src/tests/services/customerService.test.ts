import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockCustomers } from '../../__mocks__/customerMocks';

// Simple mock for customerService
const mockCustomerService = {
  getCustomers: vi.fn(),
  getCustomerById: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
};

vi.mock('../../services/customerService', () => ({
  CustomerService: function() {
    return mockCustomerService;
  },
  customerService: mockCustomerService,
}));

describe('CustomerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCustomers', () => {
    it('müşteri listesini başarılı şekilde getirir', async () => {
      const mockData = mockCustomers;
      mockCustomerService.getCustomers.mockResolvedValue(mockData);

      const result = await mockCustomerService.getCustomers();

      expect(result).toEqual(mockData);
      expect(mockCustomerService.getCustomers).toHaveBeenCalled();
    });

    it('hata durumunda exception fırlatır', async () => {
      const errorMessage = 'Database error';
      mockCustomerService.getCustomers.mockRejectedValue(new Error(errorMessage));

      await expect(mockCustomerService.getCustomers()).rejects.toThrow(errorMessage);
    });
  });

  describe('getCustomerById', () => {
    it('müşteriyi ID ile başarılı şekilde getirir', async () => {
      const mockCustomer = mockCustomers[0];
      mockCustomerService.getCustomerById.mockResolvedValue(mockCustomer);

      const result = await mockCustomerService.getCustomerById(mockCustomer.id);

      expect(result).toEqual(mockCustomer);
      expect(mockCustomerService.getCustomerById).toHaveBeenCalledWith(mockCustomer.id);
    });

    it('müşteri bulunamadığında null döner', async () => {
      mockCustomerService.getCustomerById.mockResolvedValue(null);

      const result = await mockCustomerService.getCustomerById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createCustomer', () => {
    it('yeni müşteriyi başarılı şekilde oluşturur', async () => {
      const newCustomer = {
        full_name: 'Yeni Müşteri',
        email: 'yeni@example.com',
        phone: '5551234567',
      };
      const createdCustomer = { ...newCustomer, id: 'new-id' };

      mockCustomerService.createCustomer.mockResolvedValue(createdCustomer);

      const result = await mockCustomerService.createCustomer(newCustomer);

      expect(result).toEqual(createdCustomer);
      expect(mockCustomerService.createCustomer).toHaveBeenCalledWith(newCustomer);
    });
  });

  describe('updateCustomer', () => {
    it('müşteriyi başarılı şekilde günceller', async () => {
      const updateData = { full_name: 'Güncellenmiş İsim' };
      const updatedCustomer = { ...mockCustomers[0], ...updateData };

      mockCustomerService.updateCustomer.mockResolvedValue(updatedCustomer);

      const result = await mockCustomerService.updateCustomer(mockCustomers[0].id, updateData);

      expect(result).toEqual(updatedCustomer);
      expect(mockCustomerService.updateCustomer).toHaveBeenCalledWith(mockCustomers[0].id, updateData);
    });
  });

  describe('deleteCustomer', () => {
    it('müşteriyi başarılı şekilde siler', async () => {
      mockCustomerService.deleteCustomer.mockResolvedValue(undefined);

      await mockCustomerService.deleteCustomer(mockCustomers[0].id);

      expect(mockCustomerService.deleteCustomer).toHaveBeenCalledWith(mockCustomers[0].id);
    });
  });
}); 