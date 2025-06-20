import React from "react";

function BlogCard({ image, title, description, onReadMore }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full">
      <img src={image} alt={title} className="w-full h-64 object-cover" />
      <div className="p-4 flex flex-col justify-between flex-grow">
        <h3 className="text-xl font-semibold text-[#AB152A]">{title}</h3>
        <p className="text-gray-600 text-sm mt-2">{description}</p>
      </div>
    </div>
  );
}

export default BlogCard;
