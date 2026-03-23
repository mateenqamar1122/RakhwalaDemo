import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import RoleSwitcher from "@/components/RoleSwitcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const navLinks = [
  { label: "Valuation", href: "#valuation" },
  { label: "Properties", href: "/properties" },
  { label: "Dashboard", href: "/dashboard", requiresAuth: true },
  { label: "RoleSwitcher", component: <RoleSwitcher /> },
  { label: "Logout", action: "logout" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-transparent">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <a href="/" className="font-serif text-2xl font-bold text-white tracking-tight">
          Rakhwala<span className="text-gradient-gold">.</span>
        </a>

        {/* Desktop Navigation - centered */}
        <div className="hidden lg:flex items-center gap-6">
          <a href="#valuation" className="nav-link">Valuation</a>
          <a href="/properties" className="nav-link">Properties</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#consultancy" className="nav-link">Consultancy</a>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3">
          {user && profile ? (
            <>
              <RoleSwitcher />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-2 ring-1 ring-white/20">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="bg-gradient-gold text-white font-bold">
                        {profile.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="end">
                  <div className="flex items-center justify-start gap-3 p-3 mb-1">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-foreground">{profile.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate w-[180px]">{profile.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/dashboard'} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/profile'} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/settings'} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-500 hover:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              onClick={() => setShowAuthModal(true)}
              className="hidden lg:inline-flex items-center justify-center px-6 py-2 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 hover:border-white/60 transition-all duration-200"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-white p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background/90 backdrop-blur-xl border-t border-border overflow-hidden"
          >
            <div className="px-6 pb-6 pt-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                // Skip dashboard link if user is not authenticated
                if (link.requiresAuth && !user) return null;
                
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-3 rounded-lg hover:bg-foreground/5 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                    {link.hasDropdown && <ChevronDown size={14} className="opacity-60" />}
                  </a>
                );
              })}
              {user && profile ? (
                <>
                  <div className="px-3 py-2 border-t border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                        <AvatarFallback>
                          {profile.full_name?.charAt(0) || profile.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <RoleSwitcher />
                    </div>
                    <Button
                      onClick={() => signOut()}
                      variant="outline"
                      className="w-full"
                    >
                      <LogOut size={14} className="mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setShowAuthModal(true);
                    setOpen(false);
                  }}
                  className="mt-3 inline-flex items-center justify-center px-6 py-3 rounded-full border border-foreground/20 text-foreground text-sm font-semibold hover:bg-foreground/5 transition-all"
                >
                  Sign In
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </nav>
  );
};

export default Navbar;
