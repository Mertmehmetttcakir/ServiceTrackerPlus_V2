import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCreateBackupSilent, useSystemSettings } from '../../hooks/useSettings';

const AUTO_BACKUP_KEY = 'servicetracker:lastBackupAt';

const getFrequencyMs = (frequency: string | undefined | null): number => {
  switch (frequency) {
    case 'daily':
      return 24 * 60 * 60 * 1000;
    case 'monthly':
      return 30 * 24 * 60 * 60 * 1000;
    case 'weekly':
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
};

export const AutoBackupManager: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { data: settings } = useSystemSettings();
  const backupMutation = useCreateBackupSilent();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!settings?.auto_backup) return;

    try {
      const last = localStorage.getItem(AUTO_BACKUP_KEY);
      const now = Date.now();
      const freqMs = getFrequencyMs(settings.backup_frequency);

      if (!last || now - Number(last) >= freqMs) {
        if (!backupMutation.isPending) {
          backupMutation.mutate();
        }
      }
    } catch (e) {
      // localStorage erişim hatasını sessizce yut
      console.error('Otomatik yedekleme zamanlayıcı hatası:', e);
    }
  }, [isAuthenticated, settings?.auto_backup, settings?.backup_frequency, backupMutation]);

  return null;
};


