import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Calendar, Camera, Edit, Save, X,
  Home, Heart, Eye, Settings, Shield, Badge, Star, TrendingUp
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as UIBadge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const { favorites } = useFavorites();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    website: profile?.website || "",
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
        location: profile.location || "",
        website: profile.website || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      await updateProfile(editForm);
      setSaveStatus('success');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      phone: profile?.phone || "",
      location: profile?.location || "",
      website: profile?.website || "",
    });
    setIsEditing(false);
  };

  // Mock data for demonstration
  const userStats = {
    totalViews: 1250,
    propertiesListed: 8,
    favoritesCount: favorites.length,
    memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Jan 2024",
    responseRate: 95,
    averageResponseTime: "2 hours"
  };

  const recentActivity = [
    { id: 1, type: "view", property: "Modern Villa in DHA", date: "2 hours ago" },
    { id: 2, type: "favorite", property: "Luxury Apartment", date: "1 day ago" },
    { id: 3, type: "inquiry", property: "Commercial Space", date: "3 days ago" },
    { id: 4, type: "view", property: "Penthouse with View", date: "1 week ago" },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "view": return <Eye size={16} className="text-blue-400" />;
      case "favorite": return <Heart size={16} className="text-red-400" />;
      case "inquiry": return <Mail size={16} className="text-green-400" />;
      default: return <User size={16} className="text-gray-400" />;
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-24">
          <div className="text-center">
            <User size={48} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
              Please sign in to view your profile
            </h2>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative pt-24 pb-14 bg-background border-b border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              My <span className="text-gradient-gold">Profile</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              Manage your personal information and account settings
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User size={20} />
                        Profile Overview
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? <X size={16} /> : <Edit size={16} />}
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback className="text-2xl font-bold bg-gradient-gold text-white">
                            {profile.full_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        >
                          <Camera size={14} />
                        </Button>
                      </div>
                      
                      <div className="flex-1">
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                          {profile.full_name || 'User'}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          {profile.bio || "No bio provided yet"}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-muted-foreground" />
                            <span>{profile.email}</span>
                          </div>
                          {profile.phone && (
                            <div className="flex items-center gap-2">
                              <Phone size={16} className="text-muted-foreground" />
                              <span>{profile.phone}</span>
                            </div>
                          )}
                          {profile.location && (
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-muted-foreground" />
                              <span>{profile.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-muted-foreground" />
                            <span>Member since {userStats.memberSince}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Eye className="mx-auto h-8 w-8 text-blue-400 mb-2" />
                      <p className="text-2xl font-bold text-foreground">{userStats.totalViews}</p>
                      <p className="text-xs text-muted-foreground">Total Views</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Home className="mx-auto h-8 w-8 text-amber-400 mb-2" />
                      <p className="text-2xl font-bold text-foreground">{userStats.propertiesListed}</p>
                      <p className="text-xs text-muted-foreground">Properties Listed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Heart className="mx-auto h-8 w-8 text-red-400 mb-2" />
                      <p className="text-2xl font-bold text-foreground">{userStats.favoritesCount}</p>
                      <p className="text-xs text-muted-foreground">Favorites</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                      <p className="text-2xl font-bold text-foreground">{userStats.responseRate}%</p>
                      <p className="text-xs text-muted-foreground">Response Rate</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            {/* Personal Info Tab */}
            <TabsContent value="personal" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings size={20} />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          value={profile.email}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+923001234567"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="e.g., Lahore, Pakistan"
                          value={editForm.location}
                          onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        placeholder="https://yourwebsite.com"
                        value={editForm.website}
                        onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>

                    {isEditing && (
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="flex items-center gap-2"
                        >
                          <Save size={16} />
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {saveStatus !== 'idle' && (
                      <div className={`p-3 rounded-lg flex items-center gap-2 ${
                        saveStatus === 'success' 
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-300 border border-red-500/20'
                      }`}>
                        {saveStatus === 'success' ? (
                          <>
                            <Star size={16} />
                            <span>Profile updated successfully!</span>
                          </>
                        ) : (
                          <>
                            <X size={16} />
                            <span>Failed to update profile. Please try again.</span>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp size={20} />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-foreground/5">
                          <div className="flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {activity.type === 'view' && 'Viewed property: '}
                              {activity.type === 'favorite' && 'Added to favorites: '}
                              {activity.type === 'inquiry' && 'Made inquiry about: '}
                              {activity.property}
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart size={20} />
                      Favorite Properties
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {favorites.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favorites.map((property) => (
                          <div key={property.id} className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-3">
                              <div className="w-16 h-16 bg-foreground/10 rounded-lg flex items-center justify-center">
                                <Home size={24} className="text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{property.title}</h4>
                                <p className="text-sm text-muted-foreground">{property.location}</p>
                                <p className="font-serif text-lg font-bold text-gradient-gold mt-1">
                                  {property.priceLabel}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart size={48} className="text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                          No favorites yet
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Start browsing and save properties you're interested in
                        </p>
                        <Button onClick={() => window.location.href = '/properties'}>
                          Browse Properties
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
