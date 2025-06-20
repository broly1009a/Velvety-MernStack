import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import StaffSidebar from "../../components/StaffSidebar";
import { toast, ToastContainer } from "react-toastify";
import { Pagination, Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Modal,
  Box,
  CircularProgress } from "@mui/material"; // Import Pagination component


const ITEMS_PER_PAGE = 10; // Number of bookings per page

const ViewBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [availableConsultants, setAvailableConsultants] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null); // booking hiện tại khi chưa có consultant
  const [currentPage, setCurrentPage] = useState(1); // Add state for current page
  const [searchTerm, setSearchTerm] = useState(""); // Add state for search term
  const [sortField, setSortField] = useState("createdAt"); // Add state for sorting field
  const [sortOrder, setSortOrder] = useState("desc"); // Add state for sorting order
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinInput, setCheckinInput] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const handleOpenCheckoutModal = (booking) => {
    setSelectedBooking(booking); // Set the selected booking for checkout
    setCheckoutModalOpen(true);
  };

  const handleCloseCheckoutModal = () => {
    setCheckoutModalOpen(false);
    setSelectedBooking(null);
  };

  const handleOpenCheckinModal = (booking) => {
    setSelectedBooking(booking);
    setCheckinInput("");
    setCheckinModalOpen(true);
  };
  
  const handleCloseCheckinModal = () => {
    setCheckinModalOpen(false);
    setSelectedBooking(null);
    setCheckinInput("");
  };

  const handleCheckinSubmit = async () => {
    if (!selectedBooking) return;
  
    if (checkinInput.trim() !== selectedBooking.CheckinCode) {
      toast.error("❌ Incorrect Check-in Code");
      return;
    }
  
    try {
      setCheckinLoading(true);

      await axios.put(`/api/booking-requests/${selectedBooking._id}/status`, {
        status: "Confirmed",
      });
  
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === selectedBooking._id
            ? { ...booking, status: "Confirmed" }
            : booking
        )
      );
      toast.success("✅ Booking confirmed successfully");
      handleCloseCheckinModal();
    } catch (err) {
      console.error("Check-in error:", err);
      toast.error("❌ Failed to update booking status");
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleCheckoutConfirm = async () => {
    setLoading(true);
    try {
      // Update booking status to "Completed"
      await axios.put(`/api/booking-requests/${selectedBooking._id}/status`, {
        status: "Completed", // Update status to "Completed"
      });

      // Update the local state to reflect the new status and updatedDate
      setBookings((prev) =>
        prev.map((item) =>
          item._id === selectedBooking._id
            ? { ...item, status: "Completed", updatedDate: new Date().toISOString() }
            : item
        )
      );

      toast.success(`✅ Booking #${selectedBooking._id} checked out successfully.`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("❌ Failed to checkout booking.");
    } finally {
      setLoading(false);
      handleCloseCheckoutModal();
    }
};


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("/api/booking-requests");
        const bookingsData = response.data;

        // Map qua và fetch từng user
        const bookingsWithCustomer = await Promise.all(
          bookingsData.map(async (booking) => {
            const customerRes = await axios.get(`/api/users/${booking.customerID}`);
            return {
              ...booking,
              customerInfo: customerRes.data,
            };
          })
        );

        setBookings(bookingsWithCustomer);
      } catch (err) {
        console.error(
          "Error fetching bookings:",
          err.response ? err.response.data : err.message
        );
        setError(err.response ? err.response.data.message : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  
  const handleConsultantClick = async (consultantID, bookingID) => {
    if (!bookingID) {
      console.error("Invalid booking ID:", bookingID);
      setError("Invalid booking ID");
      return;
    }

    if (consultantID) {
      try {
        const response = await axios.get(`/api/users/${consultantID}`);
        setSelectedConsultant(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch consultant details"
        );
      }
    } else {
      try {
        console.log("Fetching available consultants for bookingID:", bookingID);
        console.log(
          `Request URL: http://localhost:5000/api/consultants/available/${bookingID}`
        );
        const response = await axios.get(
          `/api/consultants/available/${bookingID}`
        );
        console.log(response.data);
        setAvailableConsultants(response.data);
        setCurrentBooking(bookingID);
      } catch (err) {
        console.error("Error fetching available consultants:", err);
        setError(
          err.response?.data?.message || "Failed to fetch available consultants"
        );
      }
    }
  };

  const closeConsultantModal = () => {
    setSelectedConsultant(null);
  };

  const assignConsultant = async (bookingId, consultantId) => {
    try {
      const response = await axios.put(`/api/booking-requests/${bookingId}/assign`, {
        consultantId,
      });

      const updatedBooking = response.data;

      // Update state to reflect the change
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === updatedBooking._id ? updatedBooking : booking
        )
      );

      toast.success(`✅ Consultant assigned successfully to Booking #${bookingId}`);

      // Close modal
      setAvailableConsultants([]);
    } catch (error) {
      console.error(
        "Error assigning consultant:",
        error.response?.data || error.message
      );
      toast.error("❌ Failed to assign consultant. Please try again.");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`/api/booking-requests/${id}/status`, {
        status: newStatus,
      });
      // Cập nhật trạng thái ngay lập tức
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === id ? { ...booking, status: newStatus } : booking
        )
      );
      toast.success(`✅ Booking #${id} status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message);
      toast.error(`❌ Failed to update status for booking #${id}`);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleColumnSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const customerName = booking.customerInfo
      ? `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`
      : "Unknown";
    return (
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceID?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedBookings = filteredBookings.sort((a, b) => {
    const fieldA =
      sortField === "customerInfo"
        ? `${a.customerInfo?.firstName || ""} ${a.customerInfo?.lastName || ""}`
        : sortField === "serviceID.name"
        ? a.serviceID?.name || ""
        : a[sortField] || "";
    const fieldB =
      sortField === "customerInfo"
        ? `${b.customerInfo?.firstName || ""} ${b.customerInfo?.lastName || ""}`
        : sortField === "serviceID.name"
        ? b.serviceID?.name || ""
        : b[sortField] || "";

    if (!isNaN(Date.parse(fieldA)) && !isNaN(Date.parse(fieldB))) {
      // Sort by date if fields are valid dates
      return sortOrder === "asc"
        ? new Date(fieldA) - new Date(fieldB)
        : new Date(fieldB) - new Date(fieldA);
    } else if (!isNaN(fieldA) && !isNaN(fieldB)) {
      // Sort numerically if fields are numbers
      return sortOrder === "asc" ? fieldA - fieldB : fieldB - fieldA;
    } else {
      // Sort alphabetically for strings
      return sortOrder === "asc"
        ? fieldA.toString().localeCompare(fieldB.toString())
        : fieldB.toString().localeCompare(fieldA.toString());
    }
  });

  const totalPages = Math.ceil(sortedBookings.length / ITEMS_PER_PAGE);
  const currentBookings = sortedBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex">
      <StaffSidebar />
      <div className="p-4 w-full">
        <ToastContainer />
        <h1 className="text-2xl font-bold mb-4">View Bookings</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Search by customer or service"
            value={searchTerm}
            onChange={handleSearch}
            className="border p-2 rounded w-1/3"
          />
        </div>

        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-200">
              <th
                className="border p-2 text-center cursor-pointer"
                onClick={() => handleColumnSort("customerInfo")}
              >
                Customer Name {sortField === "customerInfo" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="border p-2 text-center cursor-pointer"
                onClick={() => handleColumnSort("serviceID.name")}
              >
                Service Name {sortField === "serviceID.name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="border p-2 text-center cursor-pointer"
                onClick={() => handleColumnSort("date")}
              >
                Date {sortField === "date" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="border p-2 text-center cursor-pointer"
                onClick={() => handleColumnSort("time")}
              >
                Time {sortField === "time" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="border p-2 text-center cursor-pointer"
                onClick={() => handleColumnSort("consultantID.firstName")}
              >
                Consultant {sortField === "consultantID.firstName" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>
                Created date
              </th>
              <th>
                Updated date
              </th>
              <th
                className="border p-2 text-center cursor-pointer"
                onClick={() => handleColumnSort("status")}
              >
                Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.map((booking) => (
              <tr key={booking._id} className="border">
                {/* Thêm cột Tên Khách Hàng */}
                <td className="border p-2 text-center">
                  {booking.customerInfo
                    ? `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`
                    : "Unknown"}
                </td>
                <td className="border p-2 text-center">
                  {booking.serviceID?.name || "Not Available"}
                </td>

                <td className="border p-2 text-center">
                  {new Date(booking.date).toLocaleDateString("en-GB")}
                </td>
                <td className="border p-2 text-center">{booking.time}</td>

                <td
                  className="border p-2 text-center cursor-pointer text-blue-500"
                  onClick={() =>
                    handleConsultantClick(
                      booking.consultantID?._id,
                      booking._id
                    )
                  }
                >
                  {booking.consultantID?.firstName || "Not Assigned"}
                </td>

                <td className="border p-2 text-center">
                  {new Date(booking.createdDate).toLocaleDateString("en-GB")}
                </td>

                <td className="border p-2 text-center text-sm text-gray-500">
                  {new Date(booking.updatedDate).toLocaleString("en-GB")}
                </td>

                <td className="border p-2 text-center">
                  <span
                    className={`p-1 rounded ${booking.status === "Pending"
                      ? "bg-yellow-200"
                      : booking.status === "Confirmed"
                        ? "bg-blue-200"
                        : booking.status === "Completed"
                          ? "bg-green-200"
                          : "bg-red-200"
                      }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="border p-2 text-center space-y-1">
                {booking.status === "Pending" && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenCheckinModal(booking)}
                    disabled={new Date().toLocaleDateString() !== new Date(booking.date).toLocaleDateString()}
                  >
                    Check In
                  </Button>
                )}

                {booking.status === "Confirmed" && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleOpenCheckoutModal(booking)} // Pass booking to the modal
                    disabled={checkoutLoadingId === booking._id || new Date() < new Date(`${booking.date} ${booking.time}`)}
                  >
                    {checkoutLoadingId === booking._id ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Checkout"
                    )}
                  </Button>
                )}

                {/* If Completed or Cancelled, show something else instead of status */}
                {booking.status === "Completed" && (
                  <span className="text-yellow-500 font-semibold">
                    <i className="fas fa-lock"></i> Locked
                  </span> // Adding a lock icon for "Locked"
                )}

                {booking.status === "Cancelled" && (
                  <span className="text-red-500 font-semibold">
                    <i className="fas fa-ban"></i> Blocked
                  </span> // Adding a block icon for "Blocked"
                )}
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

        {/* Hiển thị chi tiết Consultant nếu đã có */}
        {selectedConsultant && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  Consultant Details
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={closeConsultantModal}
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">First Name:</span>
                  <span className="text-gray-800">
                    {selectedConsultant.firstName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Last Name:</span>
                  <span className="text-gray-800">
                    {selectedConsultant.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="text-gray-800">
                    {selectedConsultant.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="text-gray-800">
                    {selectedConsultant.phoneNumber || "Not Available"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Role:</span>
                  <span className="text-gray-800">
                    {selectedConsultant.roleName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Verified:</span>
                  <span
                    className={`font-semibold ${selectedConsultant.verified
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {selectedConsultant.verified ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end"></div>
            </div>
          </div>
        )}

        <Dialog open={checkinModalOpen} onClose={handleCloseCheckinModal}>
          <DialogTitle>Enter Check-in Code</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Check-in Code"
              fullWidth
              value={checkinInput}
              onChange={(e) => setCheckinInput(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCheckinModal} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleCheckinSubmit}
              variant="contained"
              color="primary"
              disabled={checkinLoading}
              startIcon={checkinLoading ? <CircularProgress size={18} /> : null}
            >
              {checkinLoading ? "Checking..." : "Confirm"}
            </Button>
          </DialogActions>
        </Dialog>


      {/* Checkout Modal */}
      <Modal
          open={checkoutModalOpen}
          onClose={handleCloseCheckoutModal}
          aria-labelledby="checkout-modal-title"
          aria-describedby="checkout-modal-description"
        >
          <Box className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 id="checkout-modal-title" className="text-xl font-semibold mb-4">
                Confirm Checkout
              </h2>
              <p id="checkout-modal-description" className="mb-4">
                Are you sure you want to check out this customer?
              </p>
              <div className="flex justify-between">
                <Button
                  onClick={handleCloseCheckoutModal}
                  className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleCheckoutConfirm}
                  disabled={loading}
                  className="ml-2"
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : "Confirm"}
                </Button>
              </div>
            </div>
          </Box>
        </Modal>


        {/* Modal for Assigning Consultant */}
        {currentBooking && availableConsultants.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  Assign a Consultant
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setAvailableConsultants([])}
                >
                  ✕
                </button>
              </div>

              <div className="mt-4">
                {availableConsultants.map((consultant) => (
                  <div
                    key={consultant._id}
                    className="flex justify-between items-center border-b py-2"
                  >
                    <div>
                      <p className="text-gray-800 font-medium">
                        {consultant.firstName} {consultant.lastName}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {consultant.email}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        assignConsultant(currentBooking, consultant._id)
                      }
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBooking;
