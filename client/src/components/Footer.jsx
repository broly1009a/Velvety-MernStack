import React from "react";

const Footer = () => {
  return (
    <div className="w-full bg-[#f7f5f4] pt-10 px-5" style={{ boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)" }}>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:justify-between">
        {/* Tiêu đề chính */}
        <div className="lg:w-1/4 flex flex-col items-start mb-8">
          <h2 className="text-4xl font-normal tracking-tight pacifico-regular text-[#E27585] whitespace-nowrap mb-4">Take care your skin</h2>
          <p className="mb-4 text-left">No Parabens, Phthalates, Sulfates, Mineral Oil, Petroleum, or Other Harmful Ingredients - We Promise!</p>
          <p className="text-lg mb-2 text-left">
            © 2025 <span className="font-normal tracking-tight pacifico-regular text-[#E27585]">Velvety</span> - The Natural Skin Care Authority®
          </p>
        </div>

        {/* Divider */}
        <div className="hidden lg:block lg:w-px bg-gray-300 mx-10"></div>

        {/* Grid 3 cột */}
        <div className="lg:w-3/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          {/* Thông tin dưới cùng */}
          <div>
            <h3 className="text-2xl font-normal tracking-tight pacifico-regular text-[#E27585] mb-4">You need support</h3>
            <p className="text-2xl mt-2.5 mb-5"><strong>0823263509</strong></p>
            <p><strong>Adress:</strong> Lot E2a-7, Road D1, D1 Street, Long Thanh My, Thu Duc City, Ho Chi Minh City 700000</p>
            <p className="mt-1.5"><strong>Email:</strong> ngocnhat0103@gmail.com</p>
          </div>

          {/* Cột Extras */}
          <div>
            <h3 className="text-2xl font-normal tracking-tight pacifico-regular text-[#E27585] mb-4">Usefull Link</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="hover:text-[#E27585]">About</a></li>
              <li><a href="/services" className="hover:text-[#E27585]">Service</a></li>
              <li><a href="/blog" className="hover:text-[#E27585]">Blog</a></li>
              <li><a href="/consultant" className="hover:text-[#E27585]">Consultant</a></li>
              <li><a href="/quiz" className="hover:text-[#E27585]">Quiz</a></li>
            </ul>
          </div>

          {/* Cột About */}
          <div>
            <h3 className="text-2xl font-normal tracking-tight pacifico-regular text-[#E27585] mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="hover:text-[#E27585]">About</a></li>
              <li><a href="/services" className="hover:text-[#E27585]">Service</a></li>
              <li><a href="/blog" className="hover:text-[#E27585]">Blog</a></li>
              <li><a href="/consultant" className="hover:text-[#E27585]">Consultant</a></li>
              <li><a href="/quiz" className="hover:text-[#E27585]">Quiz</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer;