# Database Setup Guide

This guide explains how to set up the fully functional database backend for your Golden Key Properties application.

## 📋 Prerequisites

- Supabase account and project
- Node.js and npm installed
- Basic knowledge of SQL

## 🗄️ Database Schema

### 1. Run Main Schema

Execute the main schema file in Supabase SQL Editor:

```sql
-- Run this in: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
-- File: supabase/schema.sql
```

### 2. Run Schema Updates

Execute the schema updates to add new features:

```sql
-- File: supabase/schema_updates.sql
```

This adds:
- Enhanced user profiles with additional fields
- Property status tracking and analytics
- Property images table for multiple images
- User settings for notifications, privacy, and appearance
- User activity logging
- Property views tracking
- Performance indexes

## 🔧 Key Features

### Property Management
- **Multiple Images**: Properties can have up to 6 images with primary image support
- **Status Tracking**: Active, Pending, Sold, Rented, Inactive
- **Analytics**: View counts, inquiry tracking, performance metrics
- **Bulk Operations**: Mass status changes and deletions

### User Profiles
- **Enhanced Profiles**: Bio, location, website, phone verification
- **Profile Completion**: Track completion percentage
- **Avatar Upload**: Profile picture management
- **Activity Feed**: Recent user actions and interactions

### Settings System
- **Notifications**: Email, push, property alerts, marketing preferences
- **Privacy**: Profile visibility, contact information display
- **Appearance**: Theme, language, currency, date format
- **Data Management**: Export/import settings, data export

### Search & Analytics
- **Advanced Search**: Filter by city, type, price, bedrooms
- **Property Analytics**: View trends, engagement metrics
- **User Statistics**: Property counts, performance data
- **Activity Logging**: Track all user interactions

## 🚀 API Functions

### Property Service
```typescript
// Create property with images
await propertyService.createPropertyWithImages(propertyData, imageUrls);

// Get user properties
await propertyService.getUserProperties(userId);

// Update property
await propertyService.updateProperty(propertyId, updates);

// Delete property
await propertyService.deleteProperty(propertyId);
```

### Profile Service
```typescript
// Update profile
await profileService.updateProfile(userId, updates);

// Upload avatar
await profileService.uploadAvatar(userId, file);

// Get user statistics
await profileService.getUserStats(userId);
```

### Settings Service
```typescript
// Update notification settings
await settingsService.updateNotificationPreferences(userId, preferences);

// Update privacy settings
await settingsService.updatePrivacySettings(userId, settings);

// Update appearance settings
await settingsService.updateAppearanceSettings(userId, settings);
```

## 📊 Database Functions

### Built-in Functions
- `get_property_primary_image(property_uuid)` - Get primary image for property
- `log_property_view(property_uuid, user_ip, user_agent)` - Track property views
- `get_user_stats(user_uuid)` - Get comprehensive user statistics
- `create_property_with_images(...)` - Create property with multiple images
- `is_admin()` - Check if user is admin

### Triggers
- `handle_new_user()` - Auto-create profile on signup
- `handle_updated_at()` - Auto-update timestamps
- `create_user_settings()` - Auto-create default settings

## 🔐 Security & Permissions

### Row Level Security (RLS)
- **Properties**: Owners can manage, admins can manage all, public read
- **User Profiles**: Users can manage own, admins can view all
- **Settings**: Users can manage own only
- **Activity**: Users can view own, admins can view all
- **Images**: Property owners can manage, public read

### Access Control
- Role-based permissions (buyer, seller, admin)
- Profile visibility settings
- Contact information privacy controls
- Activity visibility preferences

## 📈 Performance Optimizations

### Indexes
```sql
-- Property search indexes
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_price ON properties(price);

-- Activity and analytics indexes
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_property_views_property_id ON property_views(property_id);
```

### Storage Buckets
- `property-images` - Property photos
- `avatars` - User profile pictures

## 🔄 Data Flow

### Property Creation
1. User uploads images → Storage
2. Form validation → Client
3. Create property → Database function
4. Log activity → Activity table
5. Update statistics → Stats calculation

### Property Viewing
1. User views property → Client
2. Log view → Database function
3. Update counters → Property table
4. Track analytics → Views table

### Profile Updates
1. User edits profile → Client
2. Validation → Client/Server
3. Update profile → Database
4. Log activity → Activity table
5. Update avatar → Storage (if changed)

## 🛠️ Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note project URL and anon key

### 2. Configure Environment
```env
# .env.local
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Schema Files
1. Open Supabase SQL Editor
2. Copy-paste `schema.sql` contents
3. Execute
4. Copy-paste `schema_updates.sql` contents
5. Execute

### 4. Setup Storage
1. Go to Storage section
2. Create buckets:
   - `property-images` (public)
   - `avatars` (public)
3. Set up Row Level Security policies for storage

### 5. Test Integration
```typescript
// Test database connection
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('properties')
  .select('*')
  .limit(1);

console.log('Database test:', data, error);
```

## 🔍 Troubleshooting

### Common Issues

**Permission Denied Errors**
- Check RLS policies are properly set
- Verify user is authenticated
- Check role assignments

**Storage Upload Issues**
- Verify bucket permissions
- Check file size limits
- Validate file types

**Performance Issues**
- Check indexes are created
- Monitor query performance
- Consider pagination for large datasets

### Debug Queries
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'properties';

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'properties';

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🎯 Next Steps

1. **Implement Real-time Updates**: Use Supabase realtime for live updates
2. **Add Caching**: Implement Redis for frequently accessed data
3. **Background Jobs**: Set up cron jobs for data cleanup
4. **Analytics Dashboard**: Create comprehensive analytics views
5. **API Rate Limiting**: Implement proper rate limiting
6. **Data Backup**: Set up automated backups

## 🤝 Support

For issues with the database setup:
1. Check Supabase logs
2. Review SQL execution errors
3. Verify environment variables
4. Test with sample data

The database is now fully functional and ready to support all features of your Golden Key Properties application!
