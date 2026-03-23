export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          title: string;
          location: string;
          city: string;
          type: string;
          price: number;
          price_label: string;
          badge: string | null;
          beds: number;
          baths: number;
          sqft: string;
          sqft_num: number;
          description: string;
          image_url: string;
          created_at: string;
          status?: 'active' | 'pending' | 'sold' | 'rented' | 'inactive';
          owner_id?: string | null;
          views?: number;
          inquiries_count?: number;
          featured?: boolean;
          contact_name?: string;
          contact_phone?: string;
          contact_email?: string;
        };
        Insert: Omit<Database["public"]["Tables"]["properties"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          image_url: string;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["property_images"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["property_images"]["Insert"]>;
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name?: string;
          phone?: string;
          avatar_url?: string;
          current_role: 'buyer' | 'seller' | 'admin';
          created_at: string;
          updated_at: string;
          bio?: string;
          location?: string;
          website?: string;
          phone_verified?: boolean;
          email_verified?: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["user_profiles"]["Row"], "created_at" | "updated_at"> & { created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          email_notifications: boolean;
          push_notifications: boolean;
          property_alerts: boolean;
          inquiry_notifications: boolean;
          marketing_emails: boolean;
          newsletter: boolean;
          profile_visibility: 'public' | 'private' | 'friends';
          show_email: boolean;
          show_phone: boolean;
          allow_messages: boolean;
          show_activity: boolean;
          theme: 'light' | 'dark' | 'system';
          language: string;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_settings"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["user_settings"]["Insert"]>;
      };
      user_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_type: 'view' | 'favorite' | 'inquiry' | 'login' | 'profile_update' | 'property_create' | 'property_update';
          property_id?: string | null;
          metadata?: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_activity"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["user_activity"]["Insert"]>;
      };
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_favorites"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["user_favorites"]["Insert"]>;
      };
      property_views: {
        Row: {
          id: string;
          property_id: string;
          user_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          viewed_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["property_views"]["Row"], "id" | "viewed_at"> & { id?: string; viewed_at?: string };
        Update: Partial<Database["public"]["Tables"]["property_views"]["Insert"]>;
      };
      property_inquiries: {
        Row: {
          id: string;
          property_id: string;
          name: string;
          email: string;
          phone: string;
          message: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["property_inquiries"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["property_inquiries"]["Insert"]>;
      };
      valuations: {
        Row: {
          id: string;
          property_type: string;
          city: string;
          area_sqft: number;
          bedrooms: number;
          condition: string;
          contact_name: string;
          contact_phone: string;
          estimated_value: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["valuations"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["valuations"]["Insert"]>;
      };
    };
    Functions: {
      create_property_with_images: {
        Args: {
          property_title: string;
          property_location: string;
          property_city: string;
          property_type: string;
          property_price: number;
          property_price_label: string;
          property_badge: string | null;
          property_beds: number;
          property_baths: number;
          property_sqft: string;
          property_sqft_num: number;
          property_description: string;
          property_status: string;
          contact_name_text: string;
          contact_phone_text: string;
          contact_email_text: string;
          image_urls: string[];
        };
        Returns: string;
      };
      log_property_view: {
        Args: {
          property_uuid: string;
          user_ip?: string;
          user_agent_text?: string;
        };
        Returns: void;
      };
      get_user_stats: {
        Args: {
          user_uuid: string;
        };
        Returns: Json;
      };
    };
  };
}
    Enums: {};
  };
}

export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type PropertyInquiry = Database["public"]["Tables"]["property_inquiries"]["Row"];
export type Valuation = Database["public"]["Tables"]["valuations"]["Row"];
