import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ServiceHistoryService } from '../services/serviceHistoryService';

export const useServiceReport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateReportMutation = useMutation({
    mutationFn: (serviceId: string) => ServiceHistoryService.generateServiceReportPdf(serviceId),
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setError(err);
      }
    }
  });

  const downloadReportMutation = useMutation({
    mutationFn: (serviceId: string) => ServiceHistoryService.getServiceRecordPdf(serviceId),
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setError(err);
      }
    }
  });

  const downloadExistingReport = async (serviceId: string, fileName?: string) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const pdfBlob = await downloadReportMutation.mutateAsync(serviceId) as Blob;
      
      // Dosyayı indir
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `servis-raporu-${serviceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAndDownloadReport = async (serviceId: string, fileName?: string) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const pdfBlob = await generateReportMutation.mutateAsync(serviceId) as Blob;
      
      // Dosyayı indir
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `servis-raporu-${serviceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    error,
    downloadExistingReport,
    generateAndDownloadReport
  };
}; 