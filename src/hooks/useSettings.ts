import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/lib/supabase-functions';
import { useAuth } from '@/contexts/AuthContext';
import type { UserSettings, UserSettingsUpdate } from '@/lib/supabase-functions';

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  property_alerts: boolean;
  inquiry_notifications: boolean;
  marketing_emails: boolean;
  newsletter: boolean;
}

interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  show_email: boolean;
  show_phone: boolean;
  allow_messages: boolean;
  show_activity: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  date_format: string;
}

interface UseSettingsReturn {
  settings: UserSettings | undefined;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (updates: UserSettingsUpdate) => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  updatePrivacySettings: (settings: PrivacySettings) => Promise<void>;
  updateAppearanceSettings: (settings: AppearanceSettings) => Promise<void>;
  isUpdating: boolean;
  resetToDefaults: () => Promise<void>;
  exportSettings: () => Promise<void>;
  importSettings: (settingsData: string) => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user settings
  const {
    data: settings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['userSettings', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return settingsService.getUserSettings(user.id);
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: UserSettingsUpdate) => {
      if (!user?.id) throw new Error('User not authenticated');
      return settingsService.updateUserSettings(user.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    }
  });

  const updateSettings = useCallback(async (updates: UserSettingsUpdate): Promise<void> => {
    try {
      await updateSettingsMutation.mutateAsync(updates);
    } catch (error) {
      throw error;
    }
  }, [updateSettingsMutation]);

  const updateNotificationSettings = useCallback(async (
    notificationSettings: NotificationSettings
  ): Promise<void> => {
    try {
      await updateSettingsMutation.mutateAsync(notificationSettings);
    } catch (error) {
      throw error;
    }
  }, [updateSettingsMutation]);

  const updatePrivacySettings = useCallback(async (
    privacySettings: PrivacySettings
  ): Promise<void> => {
    try {
      await updateSettingsMutation.mutateAsync(privacySettings);
    } catch (error) {
      throw error;
    }
  }, [updateSettingsMutation]);

  const updateAppearanceSettings = useCallback(async (
    appearanceSettings: AppearanceSettings
  ): Promise<void> => {
    try {
      await updateSettingsMutation.mutateAsync(appearanceSettings);
      
      // Apply theme immediately
      if (appearanceSettings.theme) {
        applyTheme(appearanceSettings.theme);
      }
    } catch (error) {
      throw error;
    }
  }, [updateSettingsMutation]);

  // Reset to defaults
  const resetToDefaults = useCallback(async (): Promise<void> => {
    const defaultSettings: UserSettingsUpdate = {
      email_notifications: true,
      push_notifications: false,
      property_alerts: true,
      inquiry_notifications: true,
      marketing_emails: false,
      newsletter: true,
      profile_visibility: 'public',
      show_email: false,
      show_phone: true,
      allow_messages: true,
      show_activity: true,
      theme: 'light',
      language: 'en',
      currency: 'PKR',
      date_format: 'dd/mm/yyyy'
    };

    try {
      await updateSettingsMutation.mutateAsync(defaultSettings);
      applyTheme('light');
    } catch (error) {
      throw error;
    }
  }, [updateSettingsMutation]);

  // Export settings
  const exportSettings = useCallback(async (): Promise<void> => {
    if (!settings) return;

    const exportData = {
      notifications: {
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        property_alerts: settings.property_alerts,
        inquiry_notifications: settings.inquiry_notifications,
        marketing_emails: settings.marketing_emails,
        newsletter: settings.newsletter
      },
      privacy: {
        profile_visibility: settings.profile_visibility,
        show_email: settings.show_email,
        show_phone: settings.show_phone,
        allow_messages: settings.allow_messages,
        show_activity: settings.show_activity
      },
      appearance: {
        theme: settings.theme,
        language: settings.language,
        currency: settings.currency,
        date_format: settings.date_format
      },
      exported_at: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [settings]);

  // Import settings
  const importSettings = useCallback(async (settingsData: string): Promise<void> => {
    try {
      const importedData = JSON.parse(settingsData);
      
      if (!importedData.notifications && !importedData.privacy && !importedData.appearance) {
        throw new Error('Invalid settings file format');
      }

      const updates: UserSettingsUpdate = {};

      if (importedData.notifications) {
        Object.assign(updates, importedData.notifications);
      }

      if (importedData.privacy) {
        Object.assign(updates, importedData.privacy);
      }

      if (importedData.appearance) {
        Object.assign(updates, importedData.appearance);
        
        // Apply theme if present
        if (importedData.appearance.theme) {
          applyTheme(importedData.appearance.theme);
        }
      }

      await updateSettingsMutation.mutateAsync(updates);
    } catch (error) {
      throw new Error('Failed to import settings. Please check the file format.');
    }
  }, [updateSettingsMutation]);

  return {
    settings,
    isLoading,
    error: error as Error | null,
    updateSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    updateAppearanceSettings,
    isUpdating: updateSettingsMutation.isPending,
    resetToDefaults,
    exportSettings,
    importSettings
  };
};

// Helper function to apply theme
const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.toggle('dark', systemTheme === 'dark');
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
  
  // Save to localStorage for immediate persistence
  localStorage.setItem('theme', theme);
};

// Hook for password change
export const usePasswordChange = () => {
  const { user } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    if (!user) {
      setChangeError('User not authenticated');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setChangeError('Password must be at least 8 characters long');
      return;
    }

    setIsChanging(true);
    setChangeError(null);

    try {
      // This would use Supabase auth to update password
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation:
      // await supabase.auth.updateUser({
      //   password: newPassword
      // });
      
      setIsChanging(false);
    } catch (error) {
      setChangeError(error instanceof Error ? error.message : 'Failed to change password');
      setIsChanging(false);
      throw error;
    }
  }, [user]);

  const clearError = useCallback(() => {
    setChangeError(null);
  }, []);

  return {
    changePassword,
    isChanging,
    changeError,
    clearError
  };
};

// Hook for account deletion
export const useAccountDeletion = () => {
  const { user, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteAccount = useCallback(async (password: string): Promise<void> => {
    if (!user) {
      setDeleteError('User not authenticated');
      return;
    }

    if (!password) {
      setDeleteError('Password is required to delete account');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // In a real implementation, you would:
      // 1. Verify the password
      // 2. Delete user data from your tables
      // 3. Delete the auth user
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate deletion
      
      // Sign out the user
      await signOut();
      
      setIsDeleting(false);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account');
      setIsDeleting(false);
      throw error;
    }
  }, [user, signOut]);

  const clearError = useCallback(() => {
    setDeleteError(null);
  }, []);

  return {
    deleteAccount,
    isDeleting,
    deleteError,
    clearError
  };
};

// Hook for data export
export const useDataExport = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportUserData = useCallback(async (): Promise<void> => {
    if (!user) {
      setExportError('User not authenticated');
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      // In a real implementation, you would fetch all user data
      const userData = {
        profile: {
          id: user.id,
          email: user.email,
          // Add other profile data
        },
        properties: [], // Fetch user properties
        favorites: [], // Fetch user favorites
        settings: {}, // Fetch user settings
        activity: [], // Fetch user activity
        exported_at: new Date().toISOString()
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Failed to export data');
      setIsExporting(false);
      throw error;
    }
  }, [user]);

  const clearError = useCallback(() => {
    setExportError(null);
  }, []);

  return {
    exportUserData,
    isExporting,
    exportError,
    clearError
  };
};

// Hook for settings validation
export const useSettingsValidation = () => {
  const validateNotificationSettings = useCallback((settings: NotificationSettings): string[] => {
    const errors: string[] = [];
    
    // Add validation logic for notification settings if needed
    return errors;
  }, []);

  const validatePrivacySettings = useCallback((settings: PrivacySettings): string[] => {
    const errors: string[] = [];
    
    if (!['public', 'private', 'friends'].includes(settings.profile_visibility)) {
      errors.push('Invalid profile visibility setting');
    }
    
    return errors;
  }, []);

  const validateAppearanceSettings = useCallback((settings: AppearanceSettings): string[] => {
    const errors: string[] = [];
    
    if (!['light', 'dark', 'system'].includes(settings.theme)) {
      errors.push('Invalid theme setting');
    }
    
    if (!settings.language || settings.language.length !== 2) {
      errors.push('Invalid language setting');
    }
    
    if (!['PKR', 'USD', 'EUR'].includes(settings.currency)) {
      errors.push('Invalid currency setting');
    }
    
    return errors;
  }, []);

  return {
    validateNotificationSettings,
    validatePrivacySettings,
    validateAppearanceSettings
  };
};
