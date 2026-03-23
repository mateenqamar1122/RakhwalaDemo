-- ============================================================
-- Fix for 500 Error: Infinite Recursion in RLS Policies
-- Run this in your Supabase SQL Editor to resolve the issue.
-- ============================================================

-- 1. Create a secure function to check admin status
-- This function runs with "SECURITY DEFINER" to bypass RLS checks when reading user_profiles,
-- breaking the infinite recursion loop.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND "current_role" = 'admin'
  );
END;
$$;

-- 2. Drop the problematic recursive policies

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- 3. Recreate policies using the non-recursive function

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
FOR SELECT USING (
  public.is_admin()
);

-- 4. Update other policies to use the efficient is_admin() function as well (Recommended)

-- Consultation Requests
DROP POLICY IF EXISTS "Admins can view all consultation requests" ON public.consultation_requests;
CREATE POLICY "Admins can view all consultation requests" ON public.consultation_requests
FOR SELECT USING ( public.is_admin() );

-- User Properties
DROP POLICY IF EXISTS "Admins can view all user properties" ON public.user_properties;
CREATE POLICY "Admins can view all user properties" ON public.user_properties
FOR SELECT USING ( public.is_admin() );

-- Properties
DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;
CREATE POLICY "Admins can manage all properties" ON public.properties
FOR ALL USING ( public.is_admin() );

-- Inquiries
DROP POLICY IF EXISTS "Admins can manage all inquiries" ON public.property_inquiries;
CREATE POLICY "Admins can manage all inquiries" ON public.property_inquiries
FOR ALL USING ( public.is_admin() );

