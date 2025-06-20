import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import Sidebar from "../../components/ConsultantSidebar";
import { Pagination } from "@mui/material"; // Import Pagination component

const ViewBooked = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedFeedback, setExpandedFeedback] = useState({});
  const [selectedWeek, setSelectedWeek] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Add state for search term
  const ITEMS_PER_PAGE = 10; // Number of bookings per page
  const [currentPage, setCurrentPage] = useState(1); // Add state for current page

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("/api/booking-requests/my-bookings");
        const bookingsData = response.data.bookings || [];

        // Lấy feedback cho từng dịch vụ
        const bookingsWithFeedback = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              console.log(`Fetching feedback for bookingID: ${booking._id}`);
              
              const feedbackRes = await axios.get(`/api/feedbacks/bookingRequest/${booking._id}`);
              const feedbackData = feedbackRes.data;

              return {
                ...booking,
                feedback: feedbackData.consultantComment || "No feedback yet",
                rating: feedbackData.consultantRating || "N/A",
              };
            } catch (error) {
              console.error(`Error fetching feedback for booking ${booking._id}:`, error);
              return {
                ...booking,
                feedback: "No feedback yet",
                rating: "N/A",
              };
            }
          })
        );

        setBookings(bookingsWithFeedback);
      } catch (error) {
        console.error("Error fetching bookings:", error); // Log the error details
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getWeekRange = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${startOfWeek.toLocaleDateString("en-GB")} To ${endOfWeek.toLocaleDateString("en-GB")}`;
  };

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredBookings = bookings
    .filter((booking) => {
      const customerName = `${booking.customerID?.firstName || ""} ${booking.customerID?.lastName || ""}`.trim();
      const serviceName = booking.serviceID?.name || "";
      return (
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .filter((booking) =>
      selectedWeek ? getWeekRange(new Date(booking.date)) === selectedWeek : true
    );

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const currentBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (column) => {
    const newSortOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    const sortedData = [...bookings].sort((a, b) => {
      const valA = a[column]?.toString().toLowerCase() || "";
      const valB = b[column]?.toString().toLowerCase() || "";

      return newSortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    setBookings(sortedData);
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const toggleFeedback = (id) => {
    setExpandedFeedback((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  const uniqueWeeks = [...new Set(bookings.map((booking) => getWeekRange(new Date(booking.date))))];

  return (
    <div className={`flex transition-opacity duration-500 ${loading ? "opacity-50" : "opacity-100"}`}>
      <Sidebar />
      <div className="ml-2 p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">Work Schedule and Assessment</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-4 flex justify-between">
          <div>
            <label htmlFor="week-select" className="mr-2">Choose week:</label>
            <select id="week-select" value={selectedWeek} onChange={handleWeekChange} className="border p-2">
              <option value="">All</option>
              {uniqueWeeks.map((week) => (
                <option key={week} value={week}>{week}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Search by customer or service"
            value={searchTerm}
            onChange={handleSearch}
            className="border p-2 rounded w-1/3"
          />
        </div>
        {currentBookings.length === 0 ? ( // Update to use currentBookings
          <p>No bookings assigned to you yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 shadow-md">
              <thead>
                <tr className="bg-gray-100">
                  {[
                    { key: "serviceID.name", label: "Service" },
                    { key: "customerID.firstName", label: "Customer" },
                    { key: "date", label: "Date" },
                    { key: "time", label: "Time" },
                    { key: "status", label: "Status" },
                    { key: "feedback", label: "Feedback" },
                    { key: "rating", label: "Rating" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="border px-4 py-2 cursor-pointer hover:bg-gray-200 transition"
                      onClick={() => handleSort(key)}
                    >
                      {label} {sortBy === key && (sortOrder === "asc" ? " 🔼" : " 🔽")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentBookings.map((booking) => ( // Update to use currentBookings
                  <tr key={booking._id} className="text-center">
                    <td className="border px-4 py-2">{booking.serviceID?.name || "N/A"}</td>
                    <td className="border px-4 py-2">
                      {`${booking.customerID?.firstName || ""} ${booking.customerID?.lastName || ""}`.trim() || "N/A"}
                    </td>
                    <td className="border px-4 py-2">
                      {booking.date ? new Date(booking.date).toLocaleDateString("en-GB") : "N/A"}
                    </td>
                    <td className="border px-4 py-2">{booking.time || "N/A"}</td>
                    <td className="border px-4 py-2">{booking.status || "N/A"}</td>
                    <td className="border px-4 py-2">
                      <span onClick={() => toggleFeedback(booking._id)} className="cursor-pointer">
                        {expandedFeedback[booking._id]
                          ? booking.feedback
                          : `${booking.feedback.slice(0, 10)}...`}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      {booking.rating && booking.rating !== "N/A"
                        ? "⭐".repeat(Math.round(booking.rating))
                        : "not feedback yet"
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center mt-4">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, value) => setCurrentPage(value)}
                color="primary"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBooked;