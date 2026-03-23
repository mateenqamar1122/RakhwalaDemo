import { useState } from 'react';
import { Home, TrendingUp, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import StaggeredDropDown from './ui/animated-staggered-dropdown';

const RoleSwitcher = () => {
  const { profile, switchRole } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);

  const roles = [
    {
      value: 'buyer' as const,
      label: 'Buyer',
      description: 'Browse properties, save favorites',
      icon: Home,
      color: 'text-blue-500',
    },
    {
      value: 'seller' as const,
      label: 'Seller',
      description: 'List properties, manage inquiries',
      icon: TrendingUp,
      color: 'text-green-500',
    },
  ];

  if (!profile) return null;

  const currentRole = roles.find(r => r.value === profile.current_role);

  const handleRoleSwitch = async (newRole: 'buyer' | 'seller') => {
    if (newRole === profile.current_role) return;

    try {
      setIsSwitching(true);
      await switchRole(newRole);

      toast({
        title: "Role Switched",
        description: `You are now viewing as a ${newRole}`,
      });
    } catch (error) {
      toast({
        title: "Failed to switch role",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  // Create dropdown items from roles
  const dropdownItems = roles.map(role => ({
    icon: role.icon,
    text: role.label,
    onClick: () => handleRoleSwitch(role.value),
  }));

  // Trigger button with current role
  const triggerButton = (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/40 bg-secondary hover:bg-secondary/80 text-foreground transition-all">
      {currentRole && (
        <>
          <currentRole.icon className="w-3 h-3" />
          <span className="font-medium text-xs">{currentRole.label}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      <StaggeredDropDown
        trigger={triggerButton}
        items={dropdownItems}
        className="relative"
      />
    </div>
  );
};

export default RoleSwitcher;
