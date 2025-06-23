import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from '../utils/axiosInstance';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("authToken") || sessionStorage.getItem("authToken"));
  const fullName = localStorage.getItem("fullName") || sessionStorage.getItem("fullName");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("authToken")) || sessionStorage.getItem("authToken");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const isLoginPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/customer-profile" || location.pathname === "/forgot-password";

  const handleLogout = () => {
    if (!showModal) return;
    axios.post("/api/auth/logout")
      .then(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("roleName");
        localStorage.removeItem("fullName");
        localStorage.removeItem("userId");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("roleName");
        sessionStorage.removeItem("fullName");
        sessionStorage.removeItem("userId");
        navigate("/login");
      })
      .catch(error => {
        console.error("Logout failed:", error.response?.data?.message || error.message);
      });
  };

  return (
    <div className="w-full h-[80px] bg-[#F9FAEF] flex items-center justify-between px-6 md:px-12 lg:px-10 shadow-md relative z-10">
      <NavLink to="/" className="w-[150px] h-[50px]">
        <div className="w-full h-full bg-[url(/images/logo.png)] bg-cover bg-no-repeat"></div>
      </NavLink>

      <button
        className="md:hidden text-[#E27585] text-[30px] z-20"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        ☰
      </button>

      <nav
        className={`absolute top-[80px] left-0 w-full bg-[#F9FAEF] flex flex-col items-center pacifico-regular gap-4 p-6 shadow-lg rounded-md transition-transform duration-300 md:static md:w-auto md:p-0 md:flex-row md:shadow-none md:gap-20 ${isMobileMenuOpen ? "flex" : "hidden md:flex"}`}
      >
        {["About", "Services", "Blog", "Consultant", "Quiz"].map((item) => (
          <NavLink
            key={item}
            to={`/${item.toLowerCase()}`}
            className={({ isActive }) =>
              `text-center text-[20px] font-semibold transition-all text-[#E27585] hover:text-[#fadade] ${isActive ? "underline" : ""}`
            }
          >
            {item === "About" ? "Giới thiệu" :
             item === "Services" ? "Dịch vụ" :
             item === "Blog" ? "Blog" :
             item === "Consultant" ? "Tư vấn" :
             item === "Quiz" ? "Trắc nghiệm" : item}
          </NavLink>
        ))}
      </nav>

      {!isLoginPage && (
        <div className="relative">
          {token ? (
            <button onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)}>
              <i className="fas fa-user text-[#E27585] text-[30px]"></i>
            </button>
          ) : (
            <NavLink to="/login" className="hidden md:block bg-[#e78999] text-white text-[18px] px-4 py-2 rounded-full shadow-sm hover:opacity-80">
              Đăng nhập
            </NavLink>
          )}

          {isProfilePopupOpen && token && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="block px-4 py-2 text-gray-800">
                Xin chào, {fullName}
              </div>
              <NavLink to="/customer-profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                Hồ sơ cá nhân
              </NavLink>
              <button onClick={() => setShowModal(true)} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
      {/* Custom Logout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Xác nhận đăng xuất</h3>
            <p className="text-gray-600">Bạn có chắc chắn muốn đăng xuất không?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="py-2 px-6 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button
                className="py-2 px-6 bg-[#f1baba] text-white rounded-lg hover:bg-[#e78999] transition"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;