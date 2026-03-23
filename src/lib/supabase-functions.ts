import { supabase } from './supabase';
import type { Database, Json } from './database.types';

// Type definitions
export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];
export type PropertyImage = Database['public']['Tables']['property_images']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];
export type UserActivity = Database['public']['Tables']['user_activity']['Row'];
export type UserFavorite = Database['public']['Tables']['user_favorites']['Row'];

// Property Management Functions
export const propertyService = {
  // Create property with images
  async createPropertyWithImages(propertyData: PropertyInsert & {
    contact_name: string;
    contact_phone: string;
    contact_email: string;
  }, imageUrls: string[]) {
    // Explicitly type the status to match RPC expectations if needed, though passing string is usually fine.
    // Ensure all required fields for the RPC are present.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { data, error } = await supabase.rpc('create_property_with_images', {
      property_title: propertyData.title,
      property_location: propertyData.location,
      property_city: propertyData.city,
      property_type: propertyData.type,
      property_price: propertyData.price,
      property_price_label: propertyData.price_label,
      property_badge: propertyData.badge || null, // Handle potentially undefined badge
      property_beds: propertyData.beds,
      property_baths: propertyData.baths,
      property_sqft: propertyData.sqft,
      property_sqft_num: propertyData.sqft_num,
      property_description: propertyData.description,
      property_status: propertyData.status || 'pending',
      contact_name_text: propertyData.contact_name,
      contact_phone_text: propertyData.contact_phone,
      contact_email_text: propertyData.contact_email,
      image_urls: imageUrls
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    if (error) throw error;
    return data;
  },

  // Get user properties
  async getUserProperties(userId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          image_url,
          is_primary,
          sort_order
        )
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single property with images
  async getPropertyWithImages(propertyId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          image_url,
          is_primary,
          sort_order
        ),
        user_profiles!owner_id (
          full_name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq('id', propertyId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update property
  async updateProperty(propertyId: string, updates: PropertyUpdate) {
    const { data, error } = await supabase
      .from('properties')
      .update(updates as any)
      .eq('id', propertyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete property
  async deleteProperty(propertyId: string) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;
  },

  // Log property view
  async logPropertyView(propertyId: string, ipAddress?: string, userAgent?: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { error } = await supabase.rpc('log_property_view', {
      property_uuid: propertyId,
      user_ip: ipAddress,
      user_agent_text: userAgent
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    if (error) throw error;
  },

  // Get property statistics
  async getPropertyStats(propertyId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('views, inquiries_count')
      .eq('id', propertyId)
      .single();

    if (error) throw error;
    return data;
  }
};

// Property Images Functions
export const imageService = {
  // Upload image to storage
  async uploadImage(file: File, propertyId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}/${Date.now()}.${fileExt}`;
    const filePath = `properties/${fileName}`;

    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Add image record to database
  async addImageToProperty(propertyId: string, imageUrl: string, isPrimary = false, sortOrder = 0) {
    const { data, error } = await supabase
      .from('property_images')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .insert({
        property_id: propertyId,
        image_url: imageUrl,
        is_primary: isPrimary,
        sort_order: sortOrder
      } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update image
  async updateImage(imageId: string, updates: Partial<PropertyImage>) {
    const { data, error } = await supabase
      .from('property_images')
      .update(updates as any)
      .eq('id', imageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete image
  async deleteImage(imageId: string) {
    // First get the image to get the URL
    const { data: imageData } = await supabase
      .from('property_images')
      .select('image_url')
      .eq('id', imageId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((imageData as any)?.image_url) {
      // Extract file path from URL
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const urlParts = (imageData as any).image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `properties/${fileName}`;

      // Delete from storage
      await supabase.storage
        .from('property-images')
        .remove([filePath]);
    }

    // Delete from database
    const { error } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
  }
};

// User Profile Functions
export const profileService = {
  // Update profile
  async updateProfile(userId: string, updates: UserProfileUpdate) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase
      .from('user_activity')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .insert({
        user_id: userId,
        activity_type: 'profile_update',
        metadata: updates as unknown as Json
      } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select();

    return data;
  },

  // Upload avatar
  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with new avatar URL
    await this.updateProfile(userId, { avatar_url: publicUrl });

    return publicUrl;
  },

  // Get user statistics
  async getUserStats(userId: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { data, error } = await supabase.rpc('get_user_stats', {
      user_uuid: userId
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    if (error) throw error;
    return data;
  },

  // Get recent activity
  async getRecentActivity(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('user_activity')
      .select(`
        *,
        properties (
          title,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};

// User Settings Functions
export const settingsService = {
  // Get user settings
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    return data;
  },

  // Update user settings
  async updateUserSettings(userId: string, updates: UserSettingsUpdate) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...updates
      } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update notification preferences
  async updateNotificationPreferences(userId: string, preferences: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    property_alerts?: boolean;
    inquiry_notifications?: boolean;
    marketing_emails?: boolean;
    newsletter?: boolean;
  }) {
    return this.updateUserSettings(userId, preferences);
  },

  // Update privacy settings
  async updatePrivacySettings(userId: string, settings: {
    profile_visibility?: 'public' | 'private' | 'friends';
    show_email?: boolean;
    show_phone?: boolean;
    allow_messages?: boolean;
    show_activity?: boolean;
  }) {
    return this.updateUserSettings(userId, settings);
  },

  // Update appearance settings
  async updateAppearanceSettings(userId: string, settings: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    currency?: string;
    date_format?: string;
  }) {
    return this.updateUserSettings(userId, settings);
  }
};

// User Activity Functions
export const activityService = {
  // Log activity
  async logActivity(
    userId: string,
    activityType: 'view' | 'favorite' | 'inquiry' | 'login' | 'profile_update' | 'property_create' | 'property_update',
    propertyId?: string | null,
    metadata?: Json
  ) {
    const { data, error } = await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        activity_type: activityType,
        property_id: propertyId,
        metadata: metadata
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get activity feed
  async getActivityFeed(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('user_activity')
      .select(`
        *,
        properties (
          title,
          location,
          city,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};

// Search and Filter Functions
export const searchService = {
  // Search properties with filters
  async searchProperties(filters: {
    search?: string;
    city?: string;
    type?: string;
    minBeds?: number;
    maxPrice?: number;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('properties')
      .select(`
        *,
        property_images (
          image_url,
          is_primary
        ),
        user_profiles!owner_id (
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'active');

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.city && filters.city !== 'All Cities') {
      query = query.eq('city', filters.city);
    }

    if (filters.type && filters.type !== 'All Types') {
      query = query.eq('type', filters.type);
    }

    if (filters.minBeds && filters.minBeds > 0) {
      query = query.gte('beds', filters.minBeds);
    }

    if (filters.maxPrice && filters.maxPrice < 300000000) {
      query = query.lte('price', filters.maxPrice);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'sqft_desc':
        query = query.order('sqft_num', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Get featured properties
  async getFeaturedProperties(limit = 6) {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (
          image_url,
          is_primary
        )
      `)
      .eq('status', 'active')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};

// Analytics Functions
export const analyticsService = {
  // Get property view analytics
  async getPropertyViewAnalytics(propertyId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('property_views')
      .select('viewed_at')
      .eq('property_id', propertyId)
      .gte('viewed_at', startDate.toISOString())
      .order('viewed_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get user activity analytics
  async getUserActivityAnalytics(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('user_activity')
      .select('activity_type, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
};
