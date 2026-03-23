import { motion } from "framer-motion";
import { ClipboardList, BarChart3, Lightbulb, Handshake } from "lucide-react";
import SectionReveal from "./SectionReveal";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Enter Property Details",
    description: "Share your property's location, size, type, and features using our simple valuation form.",
  },
  {
    icon: BarChart3,
    step: "02",
    title: "Get Market Analysis",
    description: "Our system analyzes comparable properties and local market trends to estimate true value.",
  },
  {
    icon: Lightbulb,
    step: "03",
    title: "Receive Strategies",
    description: "Get personalized recommendations — sell, rent, lease, or renovate for maximum ROI.",
  },
  {
    icon: Handshake,
    step: "04",
    title: "Connect & Transact",
    description: "List your property or connect with verified buyers, investors, and tenants.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-card">
      <div className="container mx-auto px-6">
        <SectionReveal>
          <div className="text-center mb-16">
            <p className="label-caps mb-4">How Rakhwala Works</p>
            <h2 className="font-serif text-4xl md:text-6xl text-foreground tracking-tight font-bold">
              Four <span className="text-gradient-gold">Simple</span> Steps
            </h2>
          </div>
        </SectionReveal>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {steps.map((step) => (
            <motion.div
              key={step.step}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="relative card-bold p-7 text-center group cursor-pointer"
            >
              <p className="font-serif text-6xl text-primary/10 font-bold absolute top-2 right-4">{step.step}</p>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-16 h-16 rounded-xl gradient-gold flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <step.icon size={26} className="text-primary-foreground" />
              </motion.div>
              <h3 className="font-serif text-xl md:text-2xl text-foreground mb-3 font-bold">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <SectionReveal delay={0.3}>
          <div className="text-center mt-14">
            <a href="#valuation" className="btn-gradient-lg gap-2">
              Start Your Valuation Now
            </a>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
};

export default HowItWorks;
