import { motion } from "framer-motion";
import { TrendingUp, Home, Key, Hammer, ArrowRight } from "lucide-react";
import SectionReveal from "./SectionReveal";

const strategies = [
  {
    icon: TrendingUp,
    title: "Sell at Best Price",
    description: "We analyze market demand and comparable sales to position your property at the optimal selling price.",
    cta: "Learn More",
  },
  {
    icon: Key,
    title: "Rent for Passive Income",
    description: "Estimate monthly rental yield and connect with verified tenants. We handle screening and lease management.",
    cta: "Explore Rentals",
  },
  {
    icon: Home,
    title: "Short-term Leasing",
    description: "Maximize seasonal returns through short-term rental platforms. Ideal for tourist and business districts.",
    cta: "Get Started",
  },
  {
    icon: Hammer,
    title: "Renovate & Upsell",
    description: "Identify high-ROI renovations that can increase property value by 15-30%. Get cost estimates instantly.",
    cta: "See Options",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const ServicesSection = () => {
  return (
    <section id="strategies" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <SectionReveal>
          <div className="text-center mb-16">
            <p className="label-caps mb-4">Monetization Strategies</p>
            <h2 className="font-serif text-4xl md:text-6xl text-foreground tracking-tight font-bold">
              Maximize Your Property's{" "}
              <span className="text-gradient-gold">Potential</span>
            </h2>
            <p className="text-muted-foreground mt-5 max-w-xl mx-auto text-lg font-medium">
              We don't just tell you what your property is worth — we show you the best way to profit from it.
            </p>
          </div>
        </SectionReveal>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
        >
          {strategies.map((s) => (
            <motion.div
              key={s.title}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group card-bold p-8 cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center mb-6 shadow-lg"
              >
                <s.icon size={24} className="text-primary-foreground" />
              </motion.div>
              <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-3 font-bold">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6 font-medium">{s.description}</p>
              <span className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-wide group-hover:gap-3 transition-all duration-300">
                {s.cta} <ArrowRight size={16} />
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
