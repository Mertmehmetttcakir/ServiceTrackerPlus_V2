import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { JobService } from '../services/jobService';
import {
  Job,
  JobCreate,
  JobSummary,
  JobUpdate
} from '../types/job';

const JOBS_QUERY_KEY_PREFIX = 'jobs';

// Tüm işleri getirmek için hook
export const useAllJobs = (
  options?: Omit<
    UseQueryOptions<JobSummary[], Error, JobSummary[], string[]>,
    'queryKey' | 'queryFn' | 'initialData'
  >
) => {
  return useQuery<JobSummary[], Error, JobSummary[], string[]>({
    queryKey: [JOBS_QUERY_KEY_PREFIX, 'all'],
    queryFn: () => JobService.getAllJobs(),
    ...options,
  });
};

// Bir müşteriye ait aktif işleri getirmek için hook
export const useGetJobsByCustomerId = (
  customerId: string | undefined,
  options?: Omit<
    UseQueryOptions<
      JobSummary[],
      Error,
      JobSummary[],
      (string | undefined)[]
    >,
    'queryKey' | 'queryFn' | 'initialData'
  >
) => {
  return useQuery<
    JobSummary[],
    Error,
    JobSummary[],
    (string | undefined)[]
  >({
    queryKey: [JOBS_QUERY_KEY_PREFIX, 'byCustomer', customerId],
    queryFn: () => {
      if (!customerId) return Promise.resolve([]);
      return JobService.getJobsByCustomerId(customerId);
    },
    enabled: !!customerId,
    ...options,
  });
};

// Bir müşteriye ait silinmiş işleri (arşiv) getirmek için hook
export const useGetDeletedJobsByCustomerId = (
  customerId: string | undefined,
  options?: Omit<
    UseQueryOptions<
      JobSummary[],
      Error,
      JobSummary[],
      (string | undefined)[]
    >,
    'queryKey' | 'queryFn' | 'initialData'
  >
) => {
  return useQuery<
    JobSummary[],
    Error,
    JobSummary[],
    (string | undefined)[]
  >({
    queryKey: [JOBS_QUERY_KEY_PREFIX, 'deletedByCustomer', customerId],
    queryFn: () => {
      if (!customerId) return Promise.resolve([]);
      return JobService.getDeletedJobsByCustomerId(customerId);
    },
    enabled: !!customerId,
    ...options,
  });
};

// Bir işin detaylarını getirmek için hook
export const useGetJobById = (
  jobId: string | undefined,
  options?: Omit<
    UseQueryOptions<JobSummary, Error, JobSummary, (string | undefined)[] >,
    'queryKey' | 'queryFn' | 'initialData'
  >
) => {
  return useQuery<JobSummary, Error, JobSummary, (string | undefined)[]>({
    queryKey: [JOBS_QUERY_KEY_PREFIX, 'detail', jobId],
    queryFn: () => {
      if (!jobId) return Promise.reject(new Error('Job ID gerekli'));
      return JobService.getJobById(jobId);
    },
    enabled: !!jobId,
    ...options,
  });
};


// Yeni bir iş oluşturmak için hook
export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Job, // Dönen tip Job (servisten Job dönüyor, JobSummary değil)
    Error,
    JobCreate,
    unknown
  >({
    mutationFn: (jobData) => JobService.createJob(jobData),
    onSuccess: (data) => {
      // Müşteriye ait işler listesini geçersiz kıl
      queryClient.invalidateQueries({
        queryKey: [JOBS_QUERY_KEY_PREFIX, 'byCustomer', data.customer_id],
      });
      // Genel müşteri listesini ve detayını da geçersiz kılabiliriz (bakiye değişmiş olabilir)
      queryClient.invalidateQueries({ queryKey: ['customers', 'detail', data.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

// Bir işi güncellemek için hook
export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Job,
    Error,
    { id: string; data: JobUpdate },
    unknown
  >({
    mutationFn: ({ id, data }) => JobService.updateJob(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: [JOBS_QUERY_KEY_PREFIX, 'detail', data.id]});
      queryClient.invalidateQueries({
        queryKey: [JOBS_QUERY_KEY_PREFIX, 'byCustomer', data.customer_id],
      });
      queryClient.invalidateQueries({ queryKey: ['customers', 'detail', data.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
    },
  });
};

// Bir işi silmek için hook
export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: string; customerId?: string }, // customerId, invalidasyon için
    unknown
  >({
    mutationFn: ({ id }) => JobService.deleteJob(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({queryKey: [JOBS_QUERY_KEY_PREFIX, 'detail', variables.id]});
      if (variables.customerId) {
        queryClient.invalidateQueries({
          queryKey: [JOBS_QUERY_KEY_PREFIX, 'byCustomer', variables.customerId],
        });
        // Silinen işler (arşiv) listesini de yenile
        queryClient.invalidateQueries({
          queryKey: [JOBS_QUERY_KEY_PREFIX, 'deletedByCustomer', variables.customerId],
        });
        queryClient.invalidateQueries({
          queryKey: ['customers', 'detail', variables.customerId]
        });
      }
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
    },
  });
}; 