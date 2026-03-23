import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Heart, 
  FileText, 
  Calendar, 
  TrendingUp, 
  User, 
  Settings, 
  LogOut,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useUserProperties } from '@/hooks/useUserProperties';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import RoleSwitcher from '@/components/RoleSwitcher';

const UserDashboard = () => {
  const { user, profile, signOut, isBuyer, isSeller, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { userProperties } = useUserProperties();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user's consultation requests
  const { data: consultationRequests = [], isLoading: consultationsLoading } = useQuery({
    queryKey: ['userConsultations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data } = await supabase
        .from('consultation_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch user's valuations
  const { data: valuations = [], isLoading: valuationsLoading } = useQuery({
    queryKey: ['userValuations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data } = await supabase
        .from('valuations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      return data || [];
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  const getRoleIcon = () => {
    switch (profile?.current_role) {
      case 'buyer': return <Home className="w-5 h-5" />;
      case 'seller': return <TrendingUp className="w-5 h-5" />;
      case 'admin': return <User className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = () => {
    switch (profile?.current_role) {
      case 'buyer': return 'text-blue-500';
      case 'seller': return 'text-green-500';
      case 'admin': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  if (!user || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback>
                  {profile.full_name?.charAt(0) || profile.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Welcome back, {profile.full_name || 'User'}!
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-2">
                    {getRoleIcon()}
                    <span className="capitalize">{profile.current_role}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {profile.email}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <RoleSwitcher />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/properties')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Browse Properties
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="favorites" disabled={!isBuyer}>Favorites</TabsTrigger>
            <TabsTrigger value="properties" disabled={!isSeller}>My Properties</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                  <Heart className={`h-4 w-4 ${getRoleColor()}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{favorites.length}</div>
                  <p className="text-xs text-muted-foreground">Saved properties</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Properties</CardTitle>
                  <Home className={`h-4 w-4 ${getRoleColor()}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userProperties.length}</div>
                  <p className="text-xs text-muted-foreground">Listed properties</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consultations</CardTitle>
                  <Calendar className={`h-4 w-4 ${getRoleColor()}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{consultationRequests.length}</div>
                  <p className="text-xs text-muted-foreground">Consultation requests</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valuations</CardTitle>
                  <FileText className={`h-4 w-4 ${getRoleColor()}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{valuations.length}</div>
                  <p className="text-xs text-muted-foreground">Property valuations</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks based on your current role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isBuyer && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/properties')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Browse Properties
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/valuation')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Get Valuation
                      </Button>
                    </>
                  )}
                  {isSeller && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/properties/new')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        List Property
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/properties/manage')}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Manage Properties
                      </Button>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/admin')}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/users')}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Manage Users
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your profile and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Favorite Properties</CardTitle>
                <CardDescription>
                  Properties you've saved for later
                </CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No favorites yet</h3>
                    <p className="text-muted-foreground">
                      Start browsing and save properties you're interested in!
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate('/properties')}
                    >
                      Browse Properties
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((property) => (
                      <div key={property.id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">{property.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
                        <p className="text-lg font-bold text-primary">{property.priceLabel}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Listed Properties</CardTitle>
                <CardDescription>
                  Properties you have listed for sale or rent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No properties listed</h3>
                    <p className="text-muted-foreground">
                      Start listing your properties to reach potential buyers!
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate('/properties/new')}
                    >
                      List Your First Property
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userProperties.map((property) => (
                      <div key={property.id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">{property.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
                        <p className="text-lg font-bold text-primary">{property.priceLabel}</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Consultation Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Consultation Requests</CardTitle>
                  <CardDescription>
                    Your consultation and service requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {consultationRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No consultation requests yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {consultationRequests.slice(0, 5).map((request) => (
                        <div key={request.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-foreground">{request.interest}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{request.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Valuations */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Valuations</CardTitle>
                  <CardDescription>
                    Your property valuation reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {valuations.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No valuations yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {valuations.slice(0, 5).map((valuation) => (
                        <div key={valuation.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-foreground">
                              {valuation.property_type} in {valuation.city}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(valuation.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {valuation.area_sqft} sq.ft • {valuation.bedrooms} beds
                          </p>
                          <p className="text-lg font-bold text-primary">
                            PKR {(valuation.estimated_value / 10000000).toFixed(2)} Cr
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default () => (
  <ProtectedRoute>
    <UserDashboard />
  </ProtectedRoute>
);
