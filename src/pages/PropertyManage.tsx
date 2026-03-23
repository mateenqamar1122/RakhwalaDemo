import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Home, Edit, Trash2, Eye, Plus, Search, Filter,
  MapPin, BedDouble, Bath, Maximize, Calendar,
  AlertCircle, CheckCircle, Clock, TrendingUp, Users
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { usePropertyManage, usePropertyFilters, usePropertyStatus, usePropertyExport } from "@/hooks/usePropertyManage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import RoleBasedAccess from "@/components/RoleBasedAccess";

type PropertyStatus = 'active' | 'pending' | 'sold' | 'rented' | 'inactive';

interface UserProperty {
  id: string;
  title: string;
  type: string;
  city: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  sqft: string;
  status: PropertyStatus;
  views: number;
  inquiries: number;
  created_at: string;
  image?: string;
}

const PropertyManage = () => {
  const navigate = useNavigate();
  const { user, profile, isSeller, isAdmin } = useAuth();
  const { properties, isLoading, error, stats, isStatsLoading, updateProperty, deleteProperty, isUpdating, isDeleting, refetch } = usePropertyManage();
  const { search, setSearch, statusFilter, setStatusFilter, filteredProperties } = usePropertyFilters(properties || []);
  const { changeStatus, isChangingStatus } = usePropertyStatus();
  const { exportToCSV, isExporting } = usePropertyExport();
  
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; propertyId: string | null }>({ open: false, propertyId: null });

  // Refetch properties when component mounts and when window regains focus
  useEffect(() => {
    refetch();

    // Also refetch when user returns to the tab/window
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  // Use real data from the hook
  const userStats = stats || {
    total_properties: 0,
    active_properties: 0,
    pending_properties: 0,
    total_views: 0,
    total_inquiries: 0,
    total_favorites: 0
  };

  const getStatusBadge = (status: PropertyStatus) => {
    const styles = {
      active: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      sold: "bg-blue-500/10 text-blue-300 border-blue-500/20",
      rented: "bg-purple-500/10 text-purple-300 border-purple-500/20",
      inactive: "bg-gray-500/10 text-gray-300 border-gray-500/20"
    };
    
    const icons = {
      active: <CheckCircle size={12} />,
      pending: <Clock size={12} />,
      sold: <TrendingUp size={12} />,
      rented: <Home size={12} />,
      inactive: <AlertCircle size={12} />
    };

    return (
      <Badge className={`flex items-center gap-1 ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleDeleteProperty = async () => {
    if (!deleteDialog.propertyId) return;
    
    try {
      await deleteProperty(deleteDialog.propertyId);
      setDeleteDialog({ open: false, propertyId: null });
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  // Use real stats from the hook

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative pt-24 pb-14 bg-background border-b border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Manage <span className="text-gradient-gold">Properties</span>
                </h1>
                <p className="text-muted-foreground text-lg font-medium">
                  Manage your property listings and track performance
                </p>
              </div>
              <Button
                onClick={() => navigate('/properties/new')}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Property
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <Home className="mx-auto h-8 w-8 text-amber-400 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{userStats.total_properties}</p>
                  <p className="text-xs text-muted-foreground">Total Properties</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{userStats.active_properties}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="mx-auto h-8 w-8 text-amber-400 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{userStats.pending_properties}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Eye className="mx-auto h-8 w-8 text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{userStats.total_views}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="mx-auto h-8 w-8 text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{userStats.total_inquiries}</p>
                  <p className="text-xs text-muted-foreground">Inquiries</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      <RoleBasedAccess allowedRoles={['seller', 'admin']}>
        <div className="container mx-auto px-6 py-10">
          <div className="max-w-6xl mx-auto">
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col md:flex-row gap-4 mb-6"
            >
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Properties List */}
            <div className="space-y-4">
              <AnimatePresence>
                {filteredProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Property Image */}
                          <div className="lg:w-48 h-32 bg-foreground/10 rounded-lg overflow-hidden">
                            {property.image ? (
                              <img
                                src={property.image}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Home size={32} className="text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Property Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                                  {property.title}
                                </h3>
                                <p className="flex items-center gap-1 text-muted-foreground text-sm">
                                  <MapPin size={14} />
                                  {property.location}, {property.city}
                                </p>
                              </div>
                              {getStatusBadge(property.status)}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              {property.beds > 0 && (
                                <span className="flex items-center gap-1">
                                  <BedDouble size={14} />
                                  {property.beds} Beds
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Bath size={14} />
                                {property.baths} Baths
                              </span>
                              <span className="flex items-center gap-1">
                                <Maximize size={14} />
                                {property.sqft} sqft
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(property.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="font-serif text-2xl font-bold text-gradient-gold">
                                PKR {(property.price / 1000000).toFixed(1)}M
                              </p>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  <Eye size={14} className="inline mr-1" />
                                  {property.views}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  <Users size={14} className="inline mr-1" />
                                  {property.inquiries}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex lg:flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/properties/${property.id}`)}
                              className="flex items-center gap-2"
                            >
                              <Eye size={14} />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/properties/${property.id}/edit`)}
                              className="flex items-center gap-2"
                            >
                              <Edit size={14} />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteDialog({ open: true, propertyId: property.id })}
                              className="flex items-center gap-2 text-red-500 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredProperties.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Home size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                    No properties found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {search || statusFilter !== "all" 
                      ? "Try adjusting your filters" 
                      : "Start by adding your first property"
                    }
                  </p>
                  <Button onClick={() => navigate('/properties/new')}>
                    <Plus size={16} className="mr-2" />
                    Add Your First Property
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </RoleBasedAccess>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, propertyId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this property? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, propertyId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProperty}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PropertyManage;
