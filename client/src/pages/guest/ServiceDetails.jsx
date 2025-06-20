import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [comments, setComments] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10); // Hiển thị 3 comment đầu tiên
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Chỉ số ảnh hiện tại

  const loadMore = () => { setVisibleCount(prev => prev + 3); };

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const serviceRes = await axios.get(`/api/services/${id}`);
        setService(serviceRes.data);

        setGalleryImages([
          serviceRes.data.image,
          serviceRes.data.effectimage,
          serviceRes.data.resultimage,
          serviceRes.data.sensationimage,
        ].filter(img => img)); // Loại bỏ ảnh null hoặc undefined
      } catch (error) {
        console.error("Error fetching service:", error);
        setError("Failed to load service details.");
        setService(null);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsRes = await axios.get(`/api/feedbacks/service/${id}`);
        setComments(commentsRes.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      }
    };

    const fetchAverageRating = async () => {
      try {
        const ratingRes = await axios.get(`/api/feedbacks/service-rating/${id}`);
        setAverageRating(ratingRes.data[0]?.averageRating || 0); // Ensure default is 0 if no ratings
      } catch (error) {
        console.error("Error fetching service rating:", error);
        setAverageRating(0); // Default to 0 if error occurs
      }
    };

    fetchServiceDetails();
    fetchComments();
    fetchAverageRating();
  }, [id]);

  const handleBookingNow = async () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    localStorage.setItem("serviceId", id);
    sessionStorage.setItem("serviceId", id);
    localStorage.setItem("serviceUrl", `/services/${id}/consultant-customer`);
    sessionStorage.setItem("serviceUrl", `/services/${id}/consultant-customer`);
    navigate(`/services/${id}/consultant-customer`);
    console.log("Navigating to:", `/services/${id}/consultant-customer`);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  if (error) return <div className="text-red-600 text-center mt-10">{error}</div>;
  if (!service) return <div className="text-center text-gray-600 mt-10">Loading...</div>;

  return (
    <div className="main-container w-full h-auto bg-[#f9faef] relative overflow-hidden mx-auto my-0">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 bg-white shadow-lg rounded-lg mt-10 mb-10">
        <button
          onClick={() => navigate("/services")}
          className="mb-2 text-lg text-[#C86C79] hover:text-[#ffc0cb] self-end"
        >
          ← Back to Services
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white p-8 rounded-lg shadow-lg">
          {service.image && (
            <div className="w-full max-h-[60vh] overflow-hidden flex justify-center items-center">
              <ImageGallery
                items={galleryImages.map((img) => ({ original: img }))}
                showThumbnails={false}
                showFullscreenButton={false}
                showPlayButton={false}
                slideDuration={600} // Increase the duration for smoother transition
                slideInterval={3000} // Set the interval for automatic slide transition
                showBullets={false}
                showNav={false}
                startIndex={currentImageIndex}
                additionalClass="object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-5xl font-extrabold text-[#9d3847] leading-tight">{service.name}</h1>

            <p className="mt-6 text-lg text-gray-700 leading-relaxed">{service.description}</p>
            <div
              className="text-gray-600 mt-6 leading-relaxed border-t-2 border-gray-200 pt-6"
              dangerouslySetInnerHTML={{ __html: service.detaildescription }}
            />
            {/* Hiển thị avg sao rating của ServiceId tương ứng bằng filter */}

            <div className="flex text-yellow-500 text-lg mt-4">
              {Array.from({ length: 5 }, (_, i) => {
                const starValue = i + 1;
                if (averageRating >= starValue) {
                  return <FaStar key={i} />;
                } else if (averageRating >= starValue - 0.5) {
                  return <FaStarHalfAlt key={i} />;
                } else {
                  return <FaRegStar key={i} />;
                }
              })}
            </div>

            {/* Recommended for */}
            <div className="mt-3 text-lg bold text-gray-700 leading-relaxed">
              <h3>
                Recommended for:{" "}
                {service.category && service.category.length > 0
                  ? service.category.join(", ")
                  : "All skin types"}
              </h3>
            </div>

            {/* Product Price */}
            <div className=" text-2xl font-bold text-[#C54759] mt-4">
              Price: {service.price.toLocaleString('vi-VN')} VND
            </div>

            {/* Booking Button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleBookingNow}
                className="w-[169px] h-[44px] rounded-full border-solid border-[1px] text-[20px] font-bold leading-[24px] text-[#C54759] pacifico-regular flex items-center justify-center hover:bg-[#ff8a8a] bg-[#ffc0cb] transition duration-300"
                style={{
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(3deg)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                }}
              >
                Booking Now
              </button>
            </div>

          </div>
        </div>

        {/* Additional Images */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[service.image, service.effectimage, service.resultimage, service.sensationimage].filter(img => img).map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Service Image ${index}`}
              className="w-full h-40 object-cover rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300 cursor-pointer"
              onClick={() => setCurrentImageIndex(index)} // Cập nhật chỉ số ảnh hiện tại

            />
          ))}
        </div>

        <div className="mt-6 space-y-6">
          {comments.slice(0, visibleCount).map((comment, index) => {
            // Kiểm tra nếu có bookingRequestId và customerID
            const customer = comment.bookingRequestId?.customerID;
            const avatarUrl = customer?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
            const fullName = customer ? `${customer.firstName} ${customer.lastName}` : "Anonymous";

            return (
              <div key={index} className="border-b border-gray-200 pb-6 mb-6">
                <div className="mt-3 flex items-center gap-3 mb-3">
                  {/* Avatar */}
                  <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />

                  {/* Tên và Rating */}
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 text-lg">{fullName}</p>

                    {/* Rating sao */}
                    <div className="flex text-yellow-500 text-sm">
                      {Array.from({ length: Math.max(0, Math.min(comment.serviceRating, 5)) }).map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Nội dung bình luận */}
                <p className="text-gray-700 mt-2 leading-relaxed">
                  {comment.serviceComment || comment.consultantComment}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Log in to booking
            </h3>
            <p className="text-gray-600">You need to be logged in to book now. Do you want to log in now?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="py-2 px-6 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </button>
              <button
                className="py-2 px-6 bg-[#f1baba] text-white rounded-lg hover:bg-[#e78999] transition"
                onClick={handleLoginRedirect}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}