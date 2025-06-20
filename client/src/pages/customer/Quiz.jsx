import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import navigate for redirection
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";
import { motion } from "framer-motion";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recommendedServices, setRecommendedServices] = useState([]); // State for services
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false); // State for modal
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("/api/questions");
        setQuestions(response.data);
      } catch (error) {
        setError("Failed to load questions. Please try again later.");
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);


  const fetchRecommendedServices = async (quizResultId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/services/recommended-services/${quizResultId}`);
      setRecommendedServices(response.data); // Set recommended services from response
    } catch (err) {
      console.error("Error fetching recommended services:", err);
      setError("Failed to fetch recommended services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizResult) {
      fetchRecommendedServices(quizResult._id); // Fetch recommended services if quizResult is available
    }
  }, [quizResult]);

  const handleAnswerSelection = (weight, questionId, answerText) => {
    setAnswers((prevAnswers) => [
      ...prevAnswers.filter((answer) => answer.questionId !== questionId),
      { questionId, weight, answerText },
    ]);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };

  const handleSubmitQuiz = async () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      setShowLoginModal(true);
      return;
    }

    console.log("Submitting answers:", answers); // Debug: Kiểm tra xem answers có dữ liệu không

    try {
      const response = await axios.post(
        "/api/quiz-results/save",
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Response from server:", response.data); // Debug: Kiểm tra phản hồi từ server
      setQuizResult(response.data.quizResult);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError("Something went wrong. Please try again.");
    }
  };


  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  const handleServiceClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 text-center">
        {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div
      className="relative bg-gray-100 min-h-screen flex flex-col items-center"
      style={{
        backgroundImage: "url('/images/cuccot.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        // filter: "blur(8px)",
      }}
    >
      <Navbar />
      <div className="bg-white p-6 m-8 rounded-xl shadow-lg max-w-3xl w-full">
        <h2 className="text-3xl font-semibold text-center pacifico-regular text-gray-800 mb-8">
          Skincare Quiz
        </h2>

        <div className="text-center mb-4">
          <p>
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#fadade] h-2 rounded-full"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-lg text-gray-700 mb-4">{currentQuestion.questionText}</p>
          <div className="space-y-4">
            {currentQuestion.answerOptions?.map((option, index) => {
              const isSelected = answers.some(
                (answer) =>
                  answer.questionId === currentQuestion._id &&
                  answer.answerText === option.answerText
              );
              return (
                <button
                  key={index}
                  className={`w-full py-3 px-4 ${isSelected ? "bg-[#f6d7d7]" : "bg-gray-200"
                    } hover:bg-gray-300 text-left rounded-lg transition-all transform hover:scale-105 duration-150`}
                  onClick={() =>
                    handleAnswerSelection(option.weight, currentQuestion._id, option.answerText)
                  }
                >
                  {option.answerText}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center pacifico-regular">
          {currentQuestionIndex > 0 && (
            <button
              className="py-2 px-6 bg-[#f1baba] text-white rounded-lg hover:bg-[#e78999] transition"
              onClick={handlePrevQuestion}
            >
              Previous
            </button>
          )}
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              disabled={!answers.some(answer => answer.questionId === currentQuestion._id)}
              className={`py-2 px-6 bg-[#f1baba]   ${!answers.some(answer => answer.questionId === currentQuestion._id)
                } text-white rounded-lg hover:bg-[#e78999] transition`}
              onClick={handleNextQuestion}
            >
              Next
            </button>
          ) : (
            <button
              className="py-2 px-6 bg-[#fb5b76] text-white rounded-lg hover:bg-[#fd4967] transition"
              onClick={handleSubmitQuiz}
            >
              Submit
            </button>
          )}
        </div>
      </div>

      {/* Show the quiz result and recommended services after submission */}
      {quizResult && (
        <div className="fixed inset-0 bg-[#faf5f0] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pacifico-regular">
              Your Skin Type: {quizResult.skinType}
            </h3>
            <p>{quizResult.recommendation}</p>

            {/* Recommended Services Section */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Recommended Services:
              </h4>
              {loading ? (
                <p>Loading services...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : recommendedServices.length > 0 ? (
                <ul className="list-none text-gray-700">
                  {recommendedServices.map((service) => (
                    <li
                      key={service._id}
                      onClick={() => handleServiceClick(service._id)}
                      style={{
                        cursor: "pointer",
                        transition: "transform 0.3s, color 0.3s",
                      }}
                      className="flex items-center gap-4 hover:scale-105 hover:text-[#C54759]"
                    >
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-12 h-12 object-cover rounded-full mt-2"
                      />
                      <span>{service.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No services found for your skin type.</p>
              )}
            </div>

            <button
              className="mt-4 py-2 px-6 bg-[#f1baba] text-white rounded-lg hover:bg-[#e78999] transition"
              onClick={() => setQuizResult(null)} // Close result
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Custom Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Log in to save your results
            </h3>
            <p className="text-gray-600">You need to be logged in to save your quiz results. Do you want to log in now?</p>
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
      {/* Booking Now Button */}
      <div className="fixed bottom-4 right-4">
        {/* Ping effect */}
        <span className="absolute -inset-1 inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>

        {/* Animated Button */}
        <motion.button
          onClick={() => navigate("/services")}
          className="relative px-6 py-3 text-white rounded-full shadow-lg pacifico-regular focus:outline-none focus:ring-4 focus:ring-green-300"
          style={{
            background: "linear-gradient(135deg, #6B8E23, #32CD32)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
             marginBottom: "100px",
          }}
          animate={{
            y: [0, -5, 5, -5, 0], // Floating animation
            transition: {
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          Book Now
        </motion.button>
      </div>

      <Footer />
    </div>
  );
};

export default Quiz;