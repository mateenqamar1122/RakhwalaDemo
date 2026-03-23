import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';

const AuthPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state
  const from = (location.state as any)?.from?.pathname || '/';

  // If user is already authenticated, redirect to intended destination
  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-foreground/5" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-background" />
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Welcome to <span className="text-gradient-gold">Rakhwala</span>
          </h1>

          {/* Description */}
          <p className="text-muted-foreground text-lg mb-8">
            Sign in or create an account to access exclusive property features and manage your real estate journey.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 mb-8 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Browse as Buyer</h3>
                <p className="text-sm text-muted-foreground">Save favorite properties, submit inquiries, and track your search history</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border"
            >
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 rounded-full bg-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">List as Seller</h3>
                <p className="text-sm text-muted-foreground">Post properties, manage inquiries, and track listing performance</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 rounded-full bg-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Switch Roles Anytime</h3>
                <p className="text-sm text-muted-foreground">Easily toggle between buyer and seller modes as needed</p>
              </div>
            </motion.div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="w-full h-12 text-base font-semibold"
          >
            Get Started
          </Button>

          {/* Trust indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span>✓ Secure Authentication</span>
            <span>✓ No Hidden Fees</span>
            <span>✓ 24/7 Support</span>
          </div>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
};

export default AuthPage;
