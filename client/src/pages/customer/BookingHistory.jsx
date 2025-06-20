import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "../../components/CustomerSidebar";
import axios from "../../utils/axiosInstance";
import { MdVerified, MdClose } from "react-icons/md";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Fab,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Tooltip,
  Typography,
  Modal,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Rating,
  TablePagination,
  IconButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { motion } from "framer-motion";
import { FaTrash, FaComment } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewBookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false); // 🔄 Trigger refresh
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [consultantsCache, setConsultantsCache] = useState(new Map());
  const [showModal, setShowModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [visibleCodes, setVisibleCodes] = useState({});

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const navigate = useNavigate();

  const handleChangeTime = (BookedConsultantId, bookingId, isRescheduled) => {
    if (isRescheduled) {
      toast.warning("You can only reschedule once.");
      return;
    }

    if (BookedConsultantId) {
      localStorage.setItem("BookedConsultantId", BookedConsultantId);
      sessionStorage.setItem("BookedConsultantId", BookedConsultantId);
    } else {
      localStorage.setItem("BookedConsultantId", "null");
      sessionStorage.setItem("BookedConsultantId", "null");
    }

    localStorage.setItem("selectedBookingId", bookingId);
    sessionStorage.setItem("selectedBookingId", bookingId);

    navigate(`/change-consultant`);
  };


  const toggleCheckinCode = (bookingId) => {
    setVisibleCodes((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const handleReviewClick = (bookingId) => {
    setReviewData({ bookingId, comment: "", rating: 0 });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewData.comment || !reviewData.rating) {
      alert("Please enter your comment and rating.");
      return;
    }

    const reviewPayload = {
      bookingId: booking._id,  // ID của lịch đặt cần đánh giá
      comment: reviewData.comment,
      rating: reviewData.rating,
      createdAt: new Date().toISOString(),
    };

    try {
      // Gửi request lưu review vào lịch sử đặt lịch
      const response = await fetch("/api/historyBooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewPayload),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      alert("Review submitted successfully!");
      setShowReviewModal(false); // Đóng modal sau khi gửi
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    }
  };

  const [feedbackData, setFeedbackData] = useState({
    consultantRating: 0,
    consultantComment: "",
    serviceRating: 0,
    serviceComment: "",
    bookingId: null,
  });

  const fetchBookingsByCustomer = async () => {
    try {
      const response = await axios.get(
        "/api/booking-requests/history-bookings"
      );
      setBookings(
        response.data.bookings.map((booking) => ({
          ...booking,
          feedbackSubmitted: booking.feedback ? true : false, // Add feedbackSubmitted flag
        }))
      );
    } catch (err) {
      console.error(
        "Error fetching bookings:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Re-run fetch when `refresh` changes
  useEffect(() => {
    fetchBookingsByCustomer();
  }, [refresh]); // 👈 Add `refresh` as a dependency

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.put(`/api/booking-requests/${bookingId}/cancel`);
      // ✅ Success Toast
      toast.success("✅ Booking successfully canceled!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (err) {
      console.error(
        "Error canceling booking:",
        err.response?.data || err.message
      );
      // ❌ Error Toast
      toast.error("❌ Failed to cancel booking", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } finally {
      setShowModal(false);
      setRefresh((prev) => !prev); // 🔄 Toggle `refresh` state
    }
  };

  const handleConsultantClick = async (consultantID) => {
    if (!consultantID) return;
    if (consultantsCache.has(consultantID)) {
      setSelectedConsultant(consultantsCache.get(consultantID));
      return;
    }
    try {
      const response = await axios.get(`/api/consultants/${consultantID}`);
      setConsultantsCache(
        new Map(consultantsCache.set(consultantID, response.data))
      );
      setSelectedConsultant(response.data);
    } catch (error) {
      console.error("Error fetching consultant details:", error);
      setError("Failed to fetch consultant details.");
    }
  };

  const closeConsultantModal = () => {
    setSelectedConsultant(null);
  };

  const handleFeedbackClick = (bookingRequestId) => {
    const booking = bookings.find((b) => b._id === bookingRequestId);
    if (booking.feedbackSubmitted) {
      toast.error("Feedback has already been submitted for this booking.");
      return; // Prevent opening the feedback modal if feedback is already submitted
    }

    setFeedbackData((prev) => ({
      ...prev,
      bookingRequestId: bookingRequestId,
    }));
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    const booking = bookings.find((b) => b._id === feedbackData.bookingRequestId);
    if (booking.feedbackSubmitted) {
      toast.error("Feedback has already been submitted for this booking.");
      return; // Prevent duplicate feedback submission
    }

    try {
      const response = await axios.post("/api/feedbacks", feedbackData);
      if (response.status === 201) {
        toast.success("Feedback submitted successfully!");
        setShowFeedbackModal(false);
        setFeedbackData({
          consultantRating: 0,
          consultantComment: "",
          serviceRating: 0,
          serviceComment: "",
          bookingId: null,
        }); // Reset feedback form fields

        // Update the feedbackSubmitted flag for the booking and update the booking state
        setBookings((prevBookings) =>
          prevBookings.map((b) =>
            b._id === feedbackData.bookingRequestId
              ? { ...b, feedbackSubmitted: true }
              : b
          )
        );

        // Ensure the page gets refreshed with new data if needed
        setRefresh((prev) => !prev);
      }
    } catch (error) {
      toast.error("Failed to submit feedback");
    }
  };


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      (booking.serviceID?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        booking.consultantID?.firstName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())) &&
      (statusFilter ? booking.status === statusFilter : true)
  );

  const paginatedBookings = filteredBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="flex main-container w-full h-full relative mx-auto my-0 p-6">
      <CustomerSidebar />
      <div className="w-full">
        <Typography
          variant="h4"
          className="mb-4 text-[#c86c79] text-center"
        >
          Booking History
        </Typography>
        <div className="flex justify-between mb-4">
          <TextField
            label="Search by Service or Consultant"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/2"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "gray", // Default border color
                },
                "&:hover fieldset": {
                  borderColor: "#E27585", // Border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#daacac", // Border color when focused
                },
              },
              "& .MuiInputBase-input": {
                color: "#000000", // Changes the text color inside the field
              },
              "& .MuiInputLabel-root": {
                color: "gray", // Default label color
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#E27585", // Label color when focused
              },
            }}
          />
          <FormControl
            size="small"
            className="w-1/4"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "gray", // Default border color
                },
                "&:hover fieldset": {
                  borderColor: "#E27585", // Border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#daacac", // Border color when focused
                },
              },
              "& .MuiInputBase-input": {
                color: "#000000", // Changes the text color inside the field
              },
              "& .MuiInputLabel-root": {
                color: "gray", // Default label color
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#E27585", // Label color when focused
              },
            }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending" sx={{ color: "#e0f131" }}>
                Pending
              </MenuItem>
              <MenuItem value="Confirmed" sx={{ color: "#3139f1" }}>
                Confirmed
              </MenuItem>
              <MenuItem value="Completed" sx={{ color: "#31f131" }}>
                Completed
              </MenuItem>
              <MenuItem value="Cancelled" sx={{ color: "#E27585" }}>
                Cancelled
              </MenuItem>
            </Select>
          </FormControl>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error" className="text-center">
            {error}
          </Typography>
        ) : filteredBookings.length === 0 ? (
          <Typography className="text-center">
            No booking history found.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} elevation={3} className="shadow-md">
              <Table>
                <TableHead className="bg-[#E27585] text-white">
                  <TableRow>
                    <TableCell align="center">Service</TableCell>
                    <TableCell align="center">Date</TableCell>
                    <TableCell align="center">Time</TableCell>
                    <TableCell align="center">Consultant</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Create Date</TableCell>
                    <TableCell align="center">Cancel</TableCell>
                    <TableCell align="center">Feedback</TableCell>
                    <TableCell align="center">Change Date</TableCell>
                    <TableCell align="center">Checkin Code</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedBookings.map((booking) => (
                    <TableRow
                      key={booking._id}
                      className="transition duration-300 hover:bg-gray-100"
                    >
                      <TableCell align="center">
                        {booking.serviceID?.name || "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        {new Date(booking.date).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell align="center">{booking.time}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Consultant Details">
                          <span
                            className="cursor-pointer text-[#E27585] hover:underline"
                            onClick={() =>
                              handleConsultantClick(booking.consultantID?._id)
                            }
                          >
                            {booking.consultantID?.firstName
                              ? `${booking.consultantID.firstName} ${booking.consultantID.lastName || ""
                              }`
                              : "Not Assigned"}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <span
                          className={`p-1 rounded ${booking.status === "Pending"
                            ? "text-yellow-500"
                            : booking.status === "Confirmed"
                              ? "text-blue-500"
                              : booking.status === "Completed"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                        >
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        {new Date(booking.createdDate).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedBookingId(booking._id);
                            setShowModal(true);
                          }}
                          disabled={booking.status === "Completed" || booking.status === "Cancelled" || booking.status === "Confirmed"} // Disable cancel button if status is Completed
                        >
                          <FaTrash />
                        </Button>
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleFeedbackClick(booking._id)}
                          disabled={booking.feedbackSubmitted || booking.status === "Cancelled" || booking.status === "Pending" || booking.status === "Confirmed"}
                        >
                          <FaComment />
                        </Button>

                      </TableCell>
                      {/* Nút "Change Time" */}
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          onClick={() =>
                            handleChangeTime(
                              booking.consultantID?._id,
                              booking._id,
                              booking.isUpdated
                            )
                          }
                          disabled={booking.isUpdated || booking.status === "Completed" || booking.status === "Cancelled" || booking.status === "Confirmed"}
                          className="text-xs py-1 px-3 min-w-auto whitespace-nowrap disabled:opacity-50"
                        >
                          Change Date
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex items-center justify-center gap-2">
                          {visibleCodes[booking._id] ? (
                            <>
                              <span className="bg-gray-100 px-3 py-1 rounded-md font-mono text-sm border border-gray-300">
                                {booking.CheckinCode}
                              </span>
                              <Tooltip title="Hide Check-in Code">
                                <IconButton
                                  size="small"
                                  onClick={() => toggleCheckinCode(booking._id)}
                                  color="error"
                                >
                                  <VisibilityOffIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <Tooltip title="Show Check-in Code">
                              <IconButton
                                size="small"
                                onClick={() => toggleCheckinCode(booking._id)}
                                color="primary"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredBookings.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        <Modal open={!!selectedConsultant} onClose={closeConsultantModal}>
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-xl max-w-lg mx-auto mt-24 relative"
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition"
              onClick={closeConsultantModal}
            >
              <MdClose size={24} />
            </button>

            {/* Modal Title */}
            <Typography variant="h5" className="text-gray-800 font-bold mb-4">
              Consultant Details
            </Typography>

            {selectedConsultant && (
              <div className="space-y-3 text-gray-500">
                <Typography>
                  <strong>First Name:</strong> {selectedConsultant.firstName}
                </Typography>
                <Typography>
                  <strong>Last Name:</strong> {selectedConsultant.lastName}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {selectedConsultant.email}
                </Typography>
                <Typography>
                  <strong>Phone:</strong>{" "}
                  {selectedConsultant.phoneNumber || "Not Available"}
                </Typography>
                <Typography className="flex items-center">
                  <strong>Verified:</strong>
                  <span
                    className={`ml-2 flex items-center ${selectedConsultant.verified
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {selectedConsultant.verified ? (
                      <MdVerified size={18} className="ml-1" />
                    ) : (
                      "No"
                    )}
                  </span>
                </Typography>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <Button
                variant="contained"
                color="primary"
                className="rounded-full px-6 shadow-md"
                onClick={closeConsultantModal}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </Modal>

        <Fab
          color="primary"
          onClick={() => navigate("/")}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            backgroundColor: "#E27585",
            "&:hover": { backgroundColor: "#a92a4e" },
          }}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a92a4e] opacity-75"></span>
          <HomeIcon />
        </Fab>
      </div>
      {/* Cancel Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Cancel Confirmation
            </h3>
            <p className="text-gray-600">
              Are you sure you want to cancel this booking ? This action cannot
              be undone. The money will not be refunded.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="py-2 px-6 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="py-2 px-6 bg-[#f1baba] text-white rounded-lg hover:bg-[#e78999] transition"
                onClick={() => handleCancelBooking(selectedBookingId)}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <Modal
          open={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Leave Feedback</h3>

              <div className="mb-4">
                <Typography component="legend">Consultant Rating</Typography>
                <Rating
                  value={feedbackData.consultantRating}
                  onChange={(_, value) =>
                    setFeedbackData((prev) => ({
                      ...prev,
                      consultantRating: value,
                    }))
                  }
                />
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Consultant Comment"
                  value={feedbackData.consultantComment}
                  onChange={(e) =>
                    setFeedbackData((prev) => ({
                      ...prev,
                      consultantComment: e.target.value,
                    }))
                  }
                  className="mt-2"
                />
              </div>

              <div className="mb-4">
                <Typography component="legend">Service Rating</Typography>
                <Rating
                  value={feedbackData.serviceRating}
                  onChange={(_, value) =>
                    setFeedbackData((prev) => ({
                      ...prev,
                      serviceRating: value,
                    }))
                  }
                />
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Service Comment"
                  value={feedbackData.serviceComment}
                  onChange={(e) =>
                    setFeedbackData((prev) => ({
                      ...prev,
                      serviceComment: e.target.value,
                    }))
                  }
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowFeedbackModal(false)}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSubmitFeedback}>
                  Submit Feedback
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ViewBookingHistory;
