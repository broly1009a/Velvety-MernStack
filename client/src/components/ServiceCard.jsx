import React from "react";
import { motion } from "framer-motion";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

// Helper function to format price
const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VND";
};

// Helper function to capitalize the first letter of the name
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const ServiceCard = ({ image, name, description, price, rating, category, onChoose }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-between w-[300px] h-[500px] relative font-['Lato'] bg-white p-6 rounded-lg shadow-lg border border-gray-200"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Image */}
      <div
        className="w-[200px] h-[200px] bg-cover bg-no-repeat rounded-full"
        style={{ backgroundImage: `url(${image})` }}
      ></div>

      {/* Title */}
      <span className="text-[18px] font-bold leading-[20px] text-[#AB152A] text-center mt-4">
        {capitalizeFirstLetter(name)}
      </span>

      {/* Description */}
      <span className="text-[14px] font-light leading-[20px] text-[#000] text-center">
        {description}
        <br />
      </span>

      
            {/* Recommended for */}
            <div className="text-[15px] font-bold leading-[20px] text-[#fb8c9e] text-center">
              <h3>
                Recommended for:{" "}
                {category && category.length > 0 
                  ? category.join(", ") 
                  : "All skin types"}
              </h3>
            </div>

      {/* Price */}
      <span className="text-[16px] font-normal leading-[19px] text-[#000] mt-2">
        <strong>{formatPrice(price)}</strong>
      </span>

      {/* Average Rating */}
      <div className="flex text-yellow-500 text-lg mt-2">
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1;
          if (rating >= starValue) {
            return <FaStar key={i} />;
          } else if (rating >= starValue - 0.5) {
            return <FaStarHalfAlt key={i} />;
          } else {
            return <FaRegStar key={i} />;
          }
        })}
      </div>

      {/* Choose Button with Small Pulsing Dot */}
      <div className="relative mt-[10px] flex items-center justify-center">
        {/* Small Pulsing Dot */}
        <span className="absolute top-[-10px] right-[-10px] flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff8a8a] opacity-75"></span>
          <span className="relative inline-flex size-3 rounded-full bg-[#C54759]"></span>
        </span>

        {/* Button */}
        <motion.button
          className="w-[169px] h-[44px] bg-[#ffc0cb] rounded-full border-solid border-[1.333px] flex items-center justify-center hover:bg-[#ff8a8a] transition duration-300 relative z-10"
          whileHover={{ scale: 1.1, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onChoose}
        >
          <span className="text-[20px] font-bold leading-[24px] text-[#C54759]">
            Choose
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
