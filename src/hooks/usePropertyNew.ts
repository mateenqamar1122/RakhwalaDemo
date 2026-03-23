import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService, imageService } from '@/lib/supabase-functions';
import { useAuth } from '@/contexts/AuthContext';
import type { PropertyInsert } from '@/lib/supabase-functions';

interface PropertyFormData {
  title: string;
  description: string;
  type: string;
  city: string;
  location: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  status: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

interface UsePropertyNewReturn {
  createProperty: (formData: PropertyFormData, images: File[]) => Promise<string>;
  isCreating: boolean;
  error: Error | null;
  progress: number;
  reset: () => void;
}

export const usePropertyNew = (): UsePropertyNewReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const createPropertyMutation = useMutation({
    mutationFn: async ({ formData, images }: { formData: PropertyFormData; images: File[] }) => {
      if (!user?.id) throw new Error('User not authenticated');

      setProgress(10);

      // Validate form data
      if (!formData.title || !formData.type || !formData.city || !formData.location || !formData.price) {
        throw new Error('Please fill in all required fields');
      }

      setProgress(20);

      // Convert price to number
      const price = parseInt(formData.price.replace(/,/g, ''));
      if (isNaN(price) || price <= 0) {
        throw new Error('Please enter a valid price');
      }

      setProgress(30);

      // Convert beds and baths to numbers
      const beds = parseInt(formData.beds) || 0;
      const baths = parseInt(formData.baths) || 0;
      const sqftNum = parseInt(formData.sqft.replace(/,/g, '')) || 0;

      setProgress(40);

      // Upload images if any
      const imageUrls: string[] = [];
      if (images.length > 0) {
        setProgress(50);
        
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          
          // Validate image
          if (!image.type.startsWith('image/')) {
            throw new Error('Only image files are allowed');
          }
          
          if (image.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error('Image size must be less than 10MB');
          }

          try {
            const imageUrl = await imageService.uploadImage(image, 'temp-property-id');
            imageUrls.push(imageUrl);
            setProgress(50 + (i / images.length) * 30); // 50-80% for image uploads
          } catch (error) {
            throw new Error(`Failed to upload image ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      setProgress(80);

      // Create property data
      const propertyData: PropertyInsert & {
        contact_name: string;
        contact_phone: string;
        contact_email: string;
      } = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        city: formData.city,
        type: formData.type,
        price,
        price_label: `PKR ${(price / 1000000).toFixed(1)}M`,
        beds,
        baths,
        sqft: formData.sqft.includes('ft²') ? formData.sqft : `${formData.sqft} ft²`,
        sqft_num: sqftNum,
        description: formData.description.trim(),
        status: formData.status as any,
        contact_name: formData.contact_name.trim(),
        contact_phone: formData.contact_phone.trim(),
        contact_email: formData.contact_email.trim(),
      };

      setProgress(90);

      // Create property with images
      const propertyId = await propertyService.createPropertyWithImages(propertyData, imageUrls);

      setProgress(100);

      return propertyId;
    },
    onSuccess: (propertyId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['userProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 2000);
      
      return propertyId;
    },
    onError: (error) => {
      setProgress(0);
      return error;
    }
  });

  const createProperty = useCallback(async (
    formData: PropertyFormData,
    images: File[]
  ): Promise<string> => {
    try {
      const propertyId = await createPropertyMutation.mutateAsync({ formData, images });
      return propertyId;
    } catch (error) {
      throw error;
    }
  }, [createPropertyMutation]);

  const reset = useCallback(() => {
    createPropertyMutation.reset();
    setProgress(0);
  }, [createPropertyMutation]);

  return {
    createProperty,
    isCreating: createPropertyMutation.isPending,
    error: createPropertyMutation.error as Error | null,
    progress,
    reset
  };
};

// Helper hook for form validation
export const usePropertyFormValidation = () => {
  const validateForm = useCallback((formData: PropertyFormData): string[] => {
    const errors: string[] = [];

    // Required fields
    if (!formData.title.trim()) errors.push('Property title is required');
    if (!formData.type) errors.push('Property type is required');
    if (!formData.city) errors.push('City is required');
    if (!formData.location.trim()) errors.push('Location is required');
    if (!formData.price.trim()) errors.push('Price is required');
    if (!formData.sqft.trim()) errors.push('Area is required');
    if (!formData.baths.trim()) errors.push('Number of bathrooms is required');
    if (!formData.contact_name.trim()) errors.push('Contact name is required');
    if (!formData.contact_phone.trim()) errors.push('Contact phone is required');
    if (!formData.contact_email.trim()) errors.push('Contact email is required');

    // Email validation
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      errors.push('Please enter a valid email address');
    }

    // Phone validation (basic)
    if (formData.contact_phone && !/^[\d\s\-\+\(\)]+$/.test(formData.contact_phone)) {
      errors.push('Please enter a valid phone number');
    }

    // Price validation
    const price = parseInt(formData.price.replace(/,/g, ''));
    if (isNaN(price) || price <= 0) {
      errors.push('Please enter a valid price');
    }

    // Area validation
    const sqft = parseInt(formData.sqft.replace(/,/g, ''));
    if (isNaN(sqft) || sqft <= 0) {
      errors.push('Please enter a valid area');
    }

    // Beds and baths validation
    const beds = parseInt(formData.beds);
    const baths = parseInt(formData.baths);
    if (beds < 0 || beds > 20) {
      errors.push('Number of bedrooms must be between 0 and 20');
    }
    if (baths <= 0 || baths > 20) {
      errors.push('Number of bathrooms must be between 1 and 20');
    }

    return errors;
  }, []);

  return { validateForm };
};

// Helper hook for image handling
export const useImageHandling = () => {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<string[]>([]);

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Check total images limit (6)
    if (images.length + newFiles.length > 6) {
      errors.push('Maximum 6 images allowed');
      setImageErrors(errors);
      return;
    }

    // Validate each file
    newFiles.forEach((file, index) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        errors.push(`File ${index + 1} is not an image`);
        return;
      }

      // Check file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`File ${index + 1} is too large (max 10MB)`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setImageErrors(errors);
      return;
    }

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setImageErrors([]);
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }, [imagePreviews]);

  const clearImages = useCallback(() => {
    // Revoke all object URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    
    setImages([]);
    setImagePreviews([]);
    setImageErrors([]);
  }, [imagePreviews]);

  return {
    images,
    imagePreviews,
    imageErrors,
    handleImageUpload,
    removeImage,
    clearImages
  };
};
