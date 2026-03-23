import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Shield, Globe, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SectionReveal from './SectionReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const features = [
  { icon: CheckCircle, text: "Accurate market valuation & cost analysis" },
  { icon: Calendar, text: "Flexible scheduling — in-person or virtual consultancy" },
  { icon: Shield, text: "Full confidentiality and transparent process" },
  { icon: Globe, text: "Coverage across 15+ cities in Pakistan" },
];

interface ConsultationRequest {
  full_name: string;
  phone: string;
  email: string;
  interest: string;
  message: string;
}

const ConsultancySection = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ConsultationRequest>({
    full_name: '',
    phone: '',
    email: '',
    interest: 'Property Valuation',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // If user is logged in, use their profile data
      const submissionData = {
        ...formData,
        full_name: formData.full_name || profile?.full_name || '',
        email: formData.email || profile?.email || '',
        user_id: user?.id || null,
      };

      const { error } = await supabase
        .from('consultation_requests')
        .insert([submissionData]);

      if (error) {
        console.error('Error submitting consultation request:', error);
        toast({
          title: "Submission failed",
          description: "Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request submitted successfully!",
          description: "Our team will contact you within 24 hours.",
        });
        
        // Reset form
        setFormData({
          full_name: '',
          phone: '',
          email: '',
          interest: 'Property Valuation',
          message: '',
        });

        // Redirect user to dashboard if logged in
        if (user) {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Submission failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ConsultationRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return (
    <section id="consultancy" className="py-24 md:py-32 bg-card">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <SectionReveal direction="left">
            <div>
              <p className="label-caps mb-4">Expert Consultancy</p>
              <h2 className="font-serif text-4xl md:text-6xl text-foreground tracking-tight mb-6 font-bold">
                End-to-End Property{" "}
                <span className="text-gradient-gold">Management</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-10 max-w-lg text-lg font-medium">
                Rakhwala manages the entire process — from property evaluation and optimal pricing to ongoing oversight. We ensure your property achieves the highest possible return.
              </p>

              <div className="space-y-5 mb-10">
                {features.map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0 shadow-lg">
                      <item.icon size={20} className="text-primary-foreground" />
                    </div>
                    <p className="text-foreground font-semibold group-hover:text-primary transition-colors">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </SectionReveal>

          <SectionReveal direction="right" delay={0.15}>
            <div className="p-8 md:p-10 card-bold bg-background">
              <h3 className="font-serif text-3xl text-foreground mb-8 font-bold">Book a Consultation</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="03XX-XXXXXXX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="interest">Interest</Label>
                  <Select value={formData.interest} onValueChange={(value) => handleInputChange('interest', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Property Valuation">Property Valuation</SelectItem>
                      <SelectItem value="Sell My Property">Sell My Property</SelectItem>
                      <SelectItem value="Rental Management">Rental Management</SelectItem>
                      <SelectItem value="Investment Advisory">Investment Advisory</SelectItem>
                      <SelectItem value="Portfolio Review">Portfolio Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={3}
                    placeholder="Briefly describe your property and requirements..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full resize-none"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Request Consultation
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
};

export default ConsultancySection;
