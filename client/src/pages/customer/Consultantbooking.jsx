import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "../../utils/axiosInstance";
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function ConsultantGuest() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [visibleNoteIndex, setVisibleNoteIndex] = useState(null);
  const [consultants, setConsultants] = useState([]);


  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    try {
      const res = await axios.get("/api/consultants");
      const consultantsWithRatings = await Promise.all(
        res.data.map(async (c) => {
          const ratingRes = await axios.get(`/api/feedbacks/consultant-rating/${c._id}`);
          return {
            ...c,
            note: c.note,
            image: c.image,
            rating: ratingRes.data[0]?.averageRating || 0,
          };
        })
      );
      setConsultants(consultantsWithRatings);
    } catch (err) {
      toast.error("Failed to fetch consultants");
    }
  };

  const handleBookingNow = async (consultantId) => {
    localStorage.setItem("consultantId", consultantId);
    sessionStorage.setItem("consultantId", consultantId);
    localStorage.setItem("serviceUrl", `/services/${id}/consultant-customer/${consultantId}/calendar`);
    sessionStorage.setItem("serviceUrl", `/services/${id}/consultant-customer/${consultantId}/calendar`);
    navigate(`/services/${id}/consultant-customer/${consultantId}/calendar`);
    console.log("Navigating to:", `/services/${id}/consultant-customer/${consultantId}/calendar`);
  };

  return (
    <div className="main-container w-full h-auto bg-[#f9faef] relative overflow-hidden mx-auto my-0 font-['Lato']">
      <Navbar />
      <div className="w-full h-[97.333px] bg-[#ffc0cb] relative z-[2] flex items-center justify-center">

        <div className="flex items-center">
          <span className="text-[32px] font-bold leading-[32.01px] text-[#C54759] text-center whitespace-nowrap z-[2]">
            Choose your consultant
          </span>
        </div>
      </div>
      <div className="w-full max-w-[1800px] h-auto relative z-[27] mt-[40px] mx-auto flex flex-col gap-5 px-4">
        <button
          onClick={() => navigate("/services")}
          className="mb-2 text-lg text-[#C86C79] hover:text-[#ffc0cb] self-start"
        >
          ← Back to Services
        </button>
        {consultants.map((consultant, index) => (
          <div key={consultant._id} className="flex flex-row items-start bg-white p-6 rounded-lg shadow-lg gap-5 mb-5">
            <div>
              {consultant.image ? (
                <img
                  src={consultant.image}
                  alt="Consultant"
                  className="w-[150px] h-[150px] bg-cover bg-center bg-no-repeat rounded-t-lg"
                />
              ) : (
                "No Image"
              )}
            </div>
            <div className="flex flex-col items-start flex-1">
              <span className="text-[18px] font-semibold leading-[24px] text-[#000] tracking-[-0.8px]">
                {consultant.firstName} {consultant.lastName}
              </span>
              <span className="text-[14px] font-normal leading-[20px] text-[#555] tracking-[-0.4px]">
                {consultant.note}
              </span>
              <div className="flex items-center mt-2">
                {Array.from({ length: 5 }, (_, index) => {
                  const starValue = index + 1;
                  if (consultant.rating >= starValue) {
                    return <FaStar key={index} className="text-[#C54759] w-4 h-4" />;
                  } else if (consultant.rating >= starValue - 0.5) {
                    return <FaStarHalfAlt key={index} className="text-[#C54759] w-4 h-4" />;
                  } else {
                    return <FaRegStar key={index} className="text-[#C54759] w-4 h-4" />;
                  }
                })}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <strong>Specializes in:</strong>{" "}
                {consultant.category?.join(", ") || "No Categories"}
              </div>
              {visibleNoteIndex === index && (
                <span className="mt-2 text-[14px] font-normal leading-[20px] text-[#555] tracking-[-0.4px]">
                  No additional notes available.
                </span>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  className="w-[120px] h-[36px] bg-[#ffc0cb] rounded-full border-solid border-[1px] flex items-center justify-center hover:bg-[#ff8a8a] transition duration-300"
                  onClick={() => handleBookingNow(consultant._id)}
                >
                  <span className="text-[16px] font-bold leading-[20px] text-[#C54759]">
                    Choose
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* dat lich khi khach hang cho phep cua hang chon chuyen vien */}
      <div className="flex justify-center mt-8 mb-8">
        <button
          className="w-[220px] h-[50px] bg-[#ffc0cb] rounded-full border-solid border-[2px] border-[#C54759] flex items-center justify-center hover:bg-[#ff8a8a] transition duration-300 shadow-lg"
          onClick={() => {
            localStorage.setItem("consultantId", null);
            localStorage.setItem("serviceUrl", `/services/${id}/consultant-customer/null/calendar`);
            navigate(`/services/${id}/consultant-customer/null/calendar`);
            console.log("Navigating to: ", `/services/${id}/consultant-customer/null/calendar`);
          }}
        >
          <span className="text-[20px] font-bold leading-[24px] text-[#C54759]">
            We can choose consultant for you
          </span>
        </button>

      </div>
      <Footer />
    </div>
  );
}
