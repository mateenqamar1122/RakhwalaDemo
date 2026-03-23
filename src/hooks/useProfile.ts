import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, activityService } from '@/lib/supabase-functions';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from './useFavorites';
import type { UserProfile, UserProfileUpdate, UserActivity } from '@/lib/supabase-functions';

interface ProfileStats {
  total_properties: number;
  active_properties: number;
  pending_properties: number;
  total_views: number;
  total_inquiries: number;
  total_favorites: number;
}

interface UseProfileReturn {
  profile: UserProfile | undefined;
  isLoading: boolean;
  error: Error | null;
  stats: ProfileStats | undefined;
  isStatsLoading: boolean;
  recentActivity: UserActivity[] | undefined;
  isActivityLoading: boolean;
  updateProfile: (updates: UserProfileUpdate) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  isUpdating: boolean;
  isUploadingAvatar: boolean;
  refetch: () => void;
}

export const useProfile = (): UseProfileReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { favorites } = useFavorites();

  // Fetch user profile
  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      // For now, return the profile from auth context
      // In a real app, you'd fetch from the database
      return user.user_metadata?.profile || {};
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user statistics
  const {
    data: stats,
    isLoading: isStatsLoading
  } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return profileService.getUserStats(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recent activity
  const {
    data: recentActivity,
    isLoading: isActivityLoading
  } = useQuery({
    queryKey: ['userActivity', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return profileService.getRecentActivity(user.id, 10);
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: UserProfileUpdate) => {
      if (!user?.id) throw new Error('User not authenticated');
      return profileService.updateProfile(user.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    }
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('User not authenticated');
      return profileService.uploadAvatar(user.id, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const updateProfile = useCallback(async (updates: UserProfileUpdate): Promise<void> => {
    try {
      await updateProfileMutation.mutateAsync(updates);
    } catch (error) {
      throw error;
    }
  }, [updateProfileMutation]);

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    try {
      const avatarUrl = await uploadAvatarMutation.mutateAsync(file);
      return avatarUrl;
    } catch (error) {
      throw error;
    }
  }, [uploadAvatarMutation]);

  return {
    profile,
    isLoading,
    error: error as Error | null,
    stats,
    isStatsLoading,
    recentActivity,
    isActivityLoading,
    updateProfile,
    uploadAvatar,
    isUpdating: updateProfileMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    refetch
  };
};

// Hook for profile validation
export const useProfileValidation = () => {
  const validateProfileData = useCallback((data: {
    full_name?: string;
    bio?: string;
    phone?: string;
    location?: string;
    website?: string;
  }): string[] => {
    const errors: string[] = [];

    // Name validation
    if (data.full_name && data.full_name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (data.full_name && data.full_name.length > 100) {
      errors.push('Name must be less than 100 characters');
    }

    // Bio validation
    if (data.bio && data.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }

    // Phone validation
    if (data.phone && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
      errors.push('Please enter a valid phone number');
    }

    // Website validation
    if (data.website) {
      try {
        new URL(data.website);
      } catch {
        errors.push('Please enter a valid website URL');
      }
    }

    return errors;
  }, []);

  return { validateProfileData };
};

// Hook for avatar handling
export const useAvatarUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const validateAndPreview = useCallback((file: File): string | null => {
    setUploadError(null);

    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed');
      return null;
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return null;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    return null;
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
    setUploadError(null);
  }, []);

  return {
    isUploading,
    uploadError,
    preview,
    validateAndPreview,
    clearPreview,
    setIsUploading,
    setUploadError
  };
};

// Hook for activity tracking
export const useActivityTracking = () => {
  const { user } = useAuth();

  const logActivity = useCallback(async (
    activityType: string,
    propertyId?: string,
    metadata?: any
  ): Promise<void> => {
    if (!user?.id) return;

    try {
      await activityService.logActivity(user.id, activityType, propertyId, metadata);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, [user?.id]);

  return { logActivity };
};

// Hook for profile completion
export const useProfileCompletion = (profile?: UserProfile) => {
  const calculateCompletion = useCallback((): number => {
    if (!profile) return 0;

    const fields = [
      profile.full_name,
      profile.bio,
      profile.phone,
      profile.location,
      profile.avatar_url,
      profile.website
    ];

    const completedFields = fields.filter(field => field && field.trim().length > 0).length;
    return Math.round((completedFields / fields.length) * 100);
  }, [profile]);

  const getMissingFields = useCallback((): string[] => {
    if (!profile) return [];

    const missing = [];
    if (!profile.full_name?.trim()) missing.push('Full Name');
    if (!profile.bio?.trim()) missing.push('Bio');
    if (!profile.phone?.trim()) missing.push('Phone Number');
    if (!profile.location?.trim()) missing.push('Location');
    if (!profile.avatar_url?.trim()) missing.push('Profile Picture');
    if (!profile.website?.trim()) missing.push('Website');

    return missing;
  }, [profile]);

  const completionPercentage = calculateCompletion();
  const missingFields = getMissingFields();

  return {
    completionPercentage,
    missingFields,
    isComplete: completionPercentage === 100,
    isPartiallyComplete: completionPercentage > 0 && completionPercentage < 100
  };
};

// Hook for profile visibility
export const useProfileVisibility = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const updateVisibilityMutation = useMutation({
    mutationFn: async (visibility: 'public' | 'private' | 'friends') => {
      // This would update the user settings
      // For now, we'll just simulate it
      return { visibility };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const updateVisibility = useCallback(async (visibility: 'public' | 'private' | 'friends') => {
    try {
      await updateVisibilityMutation.mutateAsync(visibility);
    } catch (error) {
      throw error;
    }
  }, [updateVisibilityMutation]);

  return {
    visibility: profile?.profile_visibility || 'public',
    updateVisibility,
    isUpdating: updateVisibilityMutation.isPending
  };
};
