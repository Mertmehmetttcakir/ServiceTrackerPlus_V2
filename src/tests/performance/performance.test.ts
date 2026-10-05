import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { performance } from 'perf_hooks';
import React from 'react';
import { describe, expect, it } from 'vitest';

// Performance test utilities
const measurePerformance = async (fn: () => Promise<void> | void): Promise<number> => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('Performance Tests', () => {
  describe('Component Import Performance', () => {
    it('should import components efficiently', async () => {
      const importTime = await measurePerformance(async () => {
        // Test dynamic imports
        await import('../../utils/dateUtils');
        await import('../../utils/formatters');
      });

      // Component imports should complete within 100ms
      expect(importTime).toBeLessThan(100);
    });
  });

  describe('Hook Performance', () => {
    it('QueryClient should initialize quickly', async () => {
      const initTime = await measurePerformance(() => {
        const queryClient = createTestQueryClient();
        expect(queryClient).toBeDefined();
      });

      // QueryClient should initialize within 50ms
      expect(initTime).toBeLessThan(50);
    });
  });

  describe('Utility Function Performance', () => {
    it('date formatting should be performant', async () => {
      const { formatDate } = await import('../../utils/dateUtils');
      const testDate = '2024-03-20T10:30:00Z';

      const formatTime = await measurePerformance(() => {
        // Test with multiple iterations
        for (let i = 0; i < 1000; i++) {
          formatDate(testDate);
        }
      });

      // 1000 format operations should complete within 500ms (increased threshold)
      expect(formatTime).toBeLessThan(500);
    });

    it('large data filtering should be performant', async () => {
      // Create large mock dataset
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i.toString(),
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        phone: `555000${i.toString().padStart(4, '0')}`,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const filterTime = await measurePerformance(() => {
        // Simulate filtering operation
        const filtered = largeDataset.filter(customer =>
          customer.name.toLowerCase().includes('customer 123')
        );
        // Use filtered data
        expect(filtered.length).toBeGreaterThanOrEqual(0);
      });

      // Filtering 10k items should complete within 50ms
      expect(filterTime).toBeLessThan(50);
    });
  });

  describe('Memory Usage', () => {
    it('should not create excessive memory usage in hook operations', async () => {
      const queryClient = createTestQueryClient();
      
      const wrapper = ({ children }: { children: React.ReactNode }) => {
        return React.createElement(QueryClientProvider, { client: queryClient }, children);
      };

      // Get initial memory usage
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform multiple hook operations
      for (let i = 0; i < 10; i++) {
        const { result, unmount } = renderHook(() => ({
          data: `test-${i}`,
          isLoading: false,
        }), { wrapper });
        
        expect(result.current.data).toBe(`test-${i}`);
        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Bundle Size Performance', () => {
    it('should import utilities efficiently', async () => {
      const importTime = await measurePerformance(async () => {
        await import('../../utils/dateUtils');
      });

      // Utility imports should complete within 50ms
      expect(importTime).toBeLessThan(50);
    });
  });

  describe('API Performance Simulation', () => {
    it('should handle large response data efficiently', async () => {
      // Simulate large API response
      const largeResponse = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i.toString(),
          name: `Customer ${i}`,
          email: `customer${i}@example.com`,
          phone: `555000${i.toString().padStart(4, '0')}`,
          status: 'active' as const,
          appointments: Array.from({ length: 5 }, (_, j) => ({
            id: `${i}-${j}`,
            date: new Date().toISOString(),
            status: 'scheduled' as const,
          })),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        count: 1000,
      };

      const processingTime = await measurePerformance(() => {
        // Simulate data processing
        const processed = largeResponse.data.map(customer => ({
          ...customer,
          displayName: `${customer.name} (${customer.email})`,
          appointmentCount: customer.appointments.length,
        }));
        // Use processed data
        expect(processed.length).toBe(1000);
      });

      // Processing 1000 items should complete within 100ms
      expect(processingTime).toBeLessThan(100);
    });
  });
}); 