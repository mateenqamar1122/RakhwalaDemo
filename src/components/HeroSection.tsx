import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ marginTop: "-64px" }}
    >
      {/* Full-bleed background: rakhwala_hero.svg covers hero + navbar area */}
      <div className="absolute inset-0 -top-16">
        <video
          src="/rakhwala_hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-[center_20%]"
        />
        {/* Dark overlay so text remains readable */}
        <div className="absolute inset-0 bg-background/60" />
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[70%] rounded-full opacity-30 blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(35, 80%, 45%) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-[5%] w-[40%] h-[50%] rounded-full opacity-20 blur-[100px]"
          style={{ background: "radial-gradient(circle, hsl(280, 40%, 35%) 0%, transparent 70%)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-40 pb-16 flex flex-col lg:flex-row items-center justify-between min-h-screen gap-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ y: contentY, opacity: contentOpacity }}
          className="w-full lg:w-[55%] text-left"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-start mb-8">
            <a
              href="#valuation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-foreground/20 bg-foreground/5 backdrop-blur-sm text-sm font-semibold text-foreground/80 hover:bg-foreground/10 transition-colors duration-300"
            >
              Pakistan's Trusted Property Partner 🏠
              <ArrowRight size={14} />
            </a>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-4xl md:text-6xl lg:text-[4.5rem] font-bold text-foreground tracking-tight leading-[1.08] mb-7"
          >
            Know Your Property's{" "}
            <span className="text-gradient-gold">True Worth</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mb-12 font-medium mx-auto lg:mx-0"
          >
            Accurate valuations, smart monetization strategies, and a transparent
            marketplace — all in one platform for Pakistani property owners.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-start gap-4">
            <a
              href="#valuation"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-foreground text-background font-bold text-sm tracking-wide hover:bg-foreground/90 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Get Free Valuation
            </a>
            <a
              href="#properties"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-foreground/30 text-foreground font-bold text-sm tracking-wide hover:border-foreground/60 hover:bg-foreground/5 transition-all duration-300 hover:scale-105"
            >
              Browse Properties
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-start gap-10 md:gap-14 mt-20"
          >
            {[
              { value: "PKR 50B+", label: "Valuations Processed" },
              { value: "12,000+", label: "Properties Analyzed" },
              { value: "15+", label: "Cities in Pakistan" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center lg:text-left"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.15, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              >
                <p className="font-serif text-2xl md:text-3xl font-bold text-foreground tabular">{stat.value}</p>
                <p className="label-caps mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side Illustration */}
        <motion.div
           initial={{ opacity: 0, x: 50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8, delay: 0.5 }}
           className="hidden lg:block w-[45%] h-full relative"
        >
          <img
            src="/Rakhwala_herosection.svg"
            alt="Property Illustration"
            className="w-full h-auto drop-shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
