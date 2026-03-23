import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}

const getVariants = (direction: "up" | "left" | "right"): Variants => {
  const axis = direction === "up" ? "y" : "x";
  const value = direction === "right" ? 60 : direction === "left" ? -60 : 50;

  return {
    hidden: {
      opacity: 0,
      [axis]: value,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      [axis]: 0,
      filter: "blur(0px)",
    },
  };
};

const SectionReveal = ({ children, className, delay = 0, direction = "up" }: SectionRevealProps) => {
  return (
    <motion.div
      variants={getVariants(direction)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default SectionReveal;
