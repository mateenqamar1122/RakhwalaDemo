import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      id="about"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-16 bg-background border-t-2 border-border"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <a href="/" className="font-serif text-3xl font-bold text-foreground tracking-tight">
              Rakhwala<span className="text-gradient-gold">.</span>
            </a>
            <p className="text-muted-foreground text-sm mt-4 leading-relaxed font-medium">
              Helping Pakistani property owners discover the true value of their assets and make smarter real estate decisions.
            </p>
          </div>

          {[
            {
              title: "Services",
              links: ["Property Valuation", "Sell Property", "Rent Out", "Consultancy"],
            },
            {
              title: "Cities",
              links: ["Lahore", "Karachi", "Islamabad", "Rawalpindi"],
            },
            {
              title: "Company",
              links: ["About Us", "How It Works", "Careers", "Contact"],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="label-caps mb-4">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t-2 border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs font-semibold">
            © 2026 Rakhwala. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Contact Us"].map((link) => (
              <a key={link} href="#" className="text-muted-foreground text-xs font-semibold hover:text-foreground transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
