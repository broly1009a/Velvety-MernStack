import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation rules
  const validate = (name, value) => {
    let errorMessage = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (!/^[a-zA-Z\s]{2,}$/.test(value)) {
          errorMessage = "Must contain only letters and be at least 2 characters.";
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = "Invalid email format.";
        }
        break;
      case "password":
        if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(value)) {
          errorMessage = "Must be at least 6 characters, contain an uppercase letter, a number, and a special character.";
        }
        break;
      case "phoneNumber":
        if (!/^\d{10,15}$/.test(value)) {
          errorMessage = "Must contain only digits and be between 10-15 characters.";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error message for the specific field when user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      !errors.email && // Ensure there are no active errors
      !errors.phoneNumber &&
      !errors.form
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert("Please fill in all fields correctly.");
      return;
    }

    try {
      const response = await axios.post("/api/auth/register", {
        ...formData,
        roleName: "Customer",
      });

      if (response.status === 201) {
        alert("Registration successful! Please check your email to verify your account.");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phoneNumber: "",
          roleName: "Customer",
        });
        setErrors({});
        navigate("/login");
      }
    } catch (err) {
      if (err.response) {
        const errorMessage = err.response.data.message;

        setErrors((prev) => ({
          ...prev,
          email: errorMessage === "Email already in use" ? "This email is already registered." : prev.email,
          phoneNumber: errorMessage === "Phone number already in use" ? "This phone number is already registered." : prev.phoneNumber,
          form: errorMessage !== "Email already in use" && errorMessage !== "Phone number already in use" ? errorMessage : prev.form,
        }));
      } else {
        setErrors((prev) => ({ ...prev, form: "An unexpected error occurred. Please try again." }));
      }
    }
  };

  return (
    <div className="main-container w-full h-screen bg-[#f9faef] relative mx-auto">
      <Navbar />
      <div className="flex items-center justify-center h-auto max-h-screen overflow-auto relative flex-grow">
        <div className="absolute inset-0 bg-[url(/images/forgotpassword_resetpassword.png)] bg-cover bg-center bg-no-repeat opacity-50 z-0" />
        <div className="relative z-10 w-full max-w-[400px] bg-white bg-opacity-90 rounded-xl shadow-lg p-5 mt-5 mb-9 mx-4">
          <h2 className="text-center text-2xl font-bold text-[#c86c79] uppercase mb-6 md:mb-8">
            Register
          </h2>

          <form className="flex flex-col gap-4 md:gap-6" onSubmit={handleSubmit}>
            {[{ label: "First Name", name: "firstName", type: "text", placeholder: "Enter first name" },
            { label: "Last Name", name: "lastName", type: "text", placeholder: "Enter last name" },
            { label: "Email", name: "email", type: "email", placeholder: "Enter email" },
            { label: "Password", name: "password", type: "password", placeholder: "Enter password" },
            { label: "Phone Number", name: "phoneNumber", type: "text", placeholder: "Enter phone number" },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="block text-lg font-semibold text-gray-800 mb-1">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className={`w-full h-[50px] px-4 border ${errors[name] ? "border-red-500" : "border-gray-300"
                    } rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 ${errors[name] ? "focus:ring-red-500" : "focus:ring-[#c86c79]"
                    }`}
                  required
                />
                {errors[name] && <div className="text-red-500 text-sm mt-1">{errors[name]}</div>}
              </div>
            ))}

            {/* Register Button */}
            <button
              type="submit"
              className="w-full h-[50px] bg-[#c86c79] text-white text-lg font-bold rounded-lg shadow hover:bg-[#b25668] transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!isFormValid()}
            >
              Register
            </button>
          </form>

          <div className="text-center mt-8 text-gray-700 text-sm">
            <span>Already have an account? </span>
            <a href="/login" className="font-bold text-[#c86c79] hover:underline">
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
