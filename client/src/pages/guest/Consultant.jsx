import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
export default function ConsultantGuest() {
  const navigate = useNavigate();
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [selectedConsultantRating, setSelectedConsultantRating] = useState(0);
  const [consultants, setConsultants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // Add search term state
  const consultantsPerPage = 6;

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    try {
      const res = await axios.get("/api/consultants");
      const consultantsWithRatings = await Promise.all(
        res.data.map(async (c) => {
          try {
            const ratingRes = await axios.get(`/api/feedbacks/consultant-rating/${c._id}`);
            return {
              ...c,
              note: c.note || "No additional notes available.",
              image: c.image || null,
              rating: ratingRes.data[0]?.averageRating || 0, // Add rating
              category: c.category || [], // Add category
            };
          } catch (err) {
            if (err.response && err.response.status === 401) {
              toast.error("Unauthorized access to ratings");
            }
            return { ...c, rating: 0, category: c.category || [] }; // Default category if unauthorized
          }
        })
      );
      setConsultants(consultantsWithRatings);
    } catch (err) {
      toast.error("Failed to fetch consultants");
    }
  };

  const handleViewMore = async (consultant) => {
    setSelectedConsultant(consultant);
    await axios.get(`/api/feedbacks/consultant-rating/${consultant._id}`).then((res) => {
      setSelectedConsultantRating(res.data[0].averageRating);
    });
  };

  const closePanel = () => {
    setSelectedConsultant(null);
    setSelectedConsultantRating(0);
  };

  const indexOfLastConsultant = currentPage * consultantsPerPage;
  const indexOfFirstConsultant = indexOfLastConsultant - consultantsPerPage;
  const currentConsultants = consultants
    .filter((consultant) =>
      `${consultant.firstName} ${consultant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(indexOfFirstConsultant, indexOfLastConsultant);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="main-container w-full h-auto bg-[#f9faef] relative overflow-hidden mx-auto my-0 font-['Lato']">
      <Navbar />
      <div className="w-full h-[70vh] bg-[url(/images/anhdatrang.png)] bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundAttachment: "fixed" }}>
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-outline-2 -smooth pacifico-regular text-[90px] font-bold leading-[134.4px] text-[#fff] tracking-[-2.24px] text-center z-[1]">
        </span>
      </div>

      <div className="w-full max-w-[1800px] h-[48px] relative z-10 mt-[37.33px] mx-auto flex items-center justify-between">
        <div className="w-[300px] h-[1px] bg-[url(/images/line.png)] bg-cover bg-no-repeat flex-1" />
        <span className="flex-shrink-0 font-['Lato'] text-[40px] text-[#C54759] pacifico-regular leading-[48px] tracking-[-0.8px] text-center px-[80px]">
          <span className="text-[50px]">A</span>
          bout Our Consultants
        </span>
        <div className="w-[300px] h-[1px] bg-[url(/images/line.png)] bg-cover bg-no-repeat flex-1" />
      </div>

      {/* Search bar */}
      <div className="w-full max-w-[1800px] h-auto relative z-10 mt-[20px] mb-[10px] mx-auto flex justify-end px-4">
        <input
          type="text"
          placeholder="Search your consultants"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-[300px] px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C54759] focus:border-transparent border-[#C54759] rounded-lg"
        />
      </div>

      <div className="w-full max-w-[800px] mx-auto grid grid-cols-2 md:grid-cols-3 gap-8 px-4 mt-10">
        {currentConsultants.map((consultant, index) => (
          <div
            key={index}
            className="flex flex-col items-center bg-white p-5 rounded-xl shadow-lg transition-all duration-300 hover:border-2 hover:border-[#ffc0cb]"
          >
            {consultant.image ? (
              <motion.img
                src={consultant.image}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                alt="Consultant"
                className="w-[120px] h-[120px] rounded-full"
              />
            ) : (
              <span className="text-gray-500">No Image</span>
            )}
            <span className="text-[18px] font-semibold text-[#000] mt-3">
              {consultant.firstName} {consultant.lastName}
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
            <motion.div
              className="relative mt-[15px] flex items-center justify-center w-full"
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3, ease: "easeInOut" },
              }}
            >
              <button
                className="w-full max-w-[120px] h-[40px] bg-[#ffc0cb] rounded-full border hover:bg-[#ff8a8a] transition-all duration-300 flex items-center justify-center"
                onClick={() => handleViewMore(consultant)}
              >
                <span className="text-[15px] font-bold text-[#C54759]">
                  View More
                </span>
              </button>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        {Array.from({ length: Math.ceil(consultants.length / consultantsPerPage) }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-1 rounded-full ${currentPage === index + 1 ? 'bg-[#C54759] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {selectedConsultant && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-[800px] relative flex"
          >
            <button
              className="absolute top-2 right-2 text-xl text-[#C54759] hover:text-[#ff8a8a] transition-colors duration-300"
              onClick={closePanel}
            >
              ✖
            </button>
            {selectedConsultant.image && (
              <img
                src={selectedConsultant.image}
                alt="Consultant"
                className="w-[350px] h-[400px] object-cover rounded-lg mb-4"
              />
            )}
            <div className="ml-6 w-2/3">
              <h2 className="text-lg font-semibold">
                {selectedConsultant.firstName} {selectedConsultant.lastName}
              </h2>
              <p className="text-sm text-gray-600 mt-2">{selectedConsultant.note}</p>
              <div className="mt-2">
                <span className="text-sm text-gray-600">Average Rating:</span>
                <span className="flex items-center ml-1">
                  {Array.from({ length: 5 }, (_, index) => {
                    const starValue = index + 1;
                    if (selectedConsultantRating >= starValue) {
                      return <FaStar key={index} className="text-[#C54759] w-4 h-4" />;
                    } else if (selectedConsultantRating >= starValue - 0.5) {
                      return <FaStarHalfAlt key={index} className="text-[#C54759] w-4 h-4" />;
                    } else {
                      return <FaRegStar key={index} className="text-[#C54759] w-4 h-4" />;
                    }
                  })}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700">Certifications:</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                  {selectedConsultant.certifications?.length > 0 ? (
                    selectedConsultant.certifications.map((cert, index) => (
                      <li key={index}>{cert}</li>
                    ))
                  ) : (
                    <li>No Certifications</li>
                  )}
                </ul>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700">Specializes in:</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                  {selectedConsultant.category?.length > 0 ? (
                    selectedConsultant.category.map((cat, index) => (
                      <li key={index}>{cat}</li>
                    ))
                  ) : (
                    <li>No Categories</li>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-center mt-10 mb-10">
        <div className="relative">
          <span className="absolute -inset-1 inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
          <motion.button
            onClick={() => navigate("/services")}
            className="relative px-6 py-3 text-white rounded-full shadow-lg pacifico-regular focus:outline-none focus:ring-4 focus:ring-green-300"
            style={{
              background: "linear-gradient(135deg, #6B8E23, #32CD32)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
               marginBottom: "100px",
            }}
            variants={{
              float: {
                y: [0, -5, 5, -5, 0],
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              },
            }}
            initial="float"
            whileHover={{
              scale: 1.1,
              rotate: 5,
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Book Now
          </motion.button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
