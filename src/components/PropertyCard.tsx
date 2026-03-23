import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BedDouble, Bath, Maximize } from "lucide-react";

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  price: string;
  badge?: string;
  beds: number;
  baths: number;
  sqft: string;
  featured?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const PropertyCard = ({
  id,
  image,
  title,
  location,
  price,
  badge,
  beds,
  baths,
  sqft,
  featured,
}: PropertyCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/properties/${id}`);
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={handleCardClick}
      className={`group card-bold p-2.5 cursor-pointer ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg aspect-[16/10]">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {badge && (
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute top-3 left-3 px-3 py-1.5 gradient-gold text-primary-foreground text-[10px] font-extrabold tracking-[0.12em] uppercase rounded-md shadow-lg"
          >
            {badge}
          </motion.span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-5">
        <p className="font-serif text-xl md:text-2xl text-card-foreground font-bold">{title}</p>
        <p className="text-muted-foreground text-sm mt-1 font-medium">{location}</p>

        <div className="flex items-center justify-between mt-5 pt-4 border-t-2 border-border">
          <p className="font-serif text-xl font-bold text-gradient-gold tabular">{price}</p>
          <div className="flex items-center gap-3 text-muted-foreground text-xs font-bold">
            <span className="flex items-center gap-1"><BedDouble size={14} /> {beds}</span>
            <span className="w-px h-3 bg-border" />
            <span className="flex items-center gap-1"><Bath size={14} /> {baths}</span>
            <span className="w-px h-3 bg-border" />
            <span className="flex items-center gap-1"><Maximize size={14} /> {sqft}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
