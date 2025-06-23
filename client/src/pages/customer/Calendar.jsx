import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Navbar from "../../components/Navbar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SkincareBooking = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [events, setEvents] = useState([]);
    const [consultants, setConsultants] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedService, setSelectedService] = useState("");
    const [selectedConsultant, setSelectedConsultant] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false); // State for payment modal
    const id = localStorage.getItem("consultantId");
    const serviceId = localStorage.getItem("serviceId");
    const [bookedSlots, setBookedSlots] = useState([]);
    const [serviceName, setServiceName] = useState("");
    const [servicePrice, setServicePrice] = useState(""); // Add state for service price
    const [createdBookingId, setCreatedBookingId] = useState(null); // State to store the created booking ID
    const navigate = useNavigate();  // Get the navigation function

    useEffect(() => {
        if (id && id !== "null") {
            setSelectedConsultant(id);
        }
    }, [id]);

    const times = [
        "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
    ];

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await axios.get(`/api/services/${serviceId}`);
                setServiceName(res.data.name);
                setServicePrice(res.data.price); // Set the service price
            } catch (err) {
                console.error("Không thể lấy tên và giá dịch vụ");
            }
        };

        if (serviceId) {
            fetchService();
        }
    }, [serviceId]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    useEffect(() => {
        const fetchConsultantById = async () => {
            try {
                if (id && id !== "null") { // Kiểm tra cả null dạng string
                    const res = await axios.get(`/api/consultants/${id}`);
                    setConsultants(res.data);
                }
            } catch (err) {
                toast.error("Không thể lấy thông tin chuyên gia");
            }
        };

        fetchConsultantById();
    }, [id]); // Chỉ chạy khi id thay đổi



    useEffect(() => {
        if (selectedConsultant && selectedDate) {
            axios.get(`/api/booking-requests/${selectedConsultant}/pending-bookings`)
                .then(response => {
                    const pendingBookings = response.data;

                    // Extract booked time slots for the selected date
                    const bookedTimes = pendingBookings
                        .filter(booking => new Date(booking.date).toDateString() === new Date(selectedDate).toDateString())
                        .map(booking => booking.time.trim()); // Ensure time format consistency

                    setBookedSlots(bookedTimes);
                })
                .catch(error => console.error("Lỗi khi lấy các khung giờ đã đặt:", error));
        }
    }, [selectedConsultant, selectedDate]);


    useEffect(() => {
        const updateAvailableTimes = () => {
            const now = new Date();
            const selectedDay = new Date(selectedDate);
            const currentTime = now.getHours() * 60 + now.getMinutes();

            let filteredTimes;
            if (selectedDay.toDateString() === now.toDateString()) {
                filteredTimes = times.filter(time => {
                    const [hour, minute] = time.split(/[: ]/);
                    const timeInMinutes = (parseInt(hour) % 12 + (time.includes("PM") ? 12 : 0)) * 60 + parseInt(minute);
                    return timeInMinutes > currentTime;
                });
            } else {
                filteredTimes = times;
            }

            setAvailableTimes(filteredTimes);
            if (filteredTimes.length > 0) {
                setSelectedTime(filteredTimes[0]);
            } else {
                setSelectedTime(null);
            }
        };

        updateAvailableTimes();
    }, [selectedDate]);


    const handleTimeSelect = (time) => {
        setSelectedTime(time);
    };


    const handleConfirmBooking = () => {
        setShowConfirmModal(true); // Chỉ hiển thị popup, không gửi API
    };

    const handleConfirmAndPay = async () => {
        try {
            console.log("🔄 Đang gửi yêu cầu đặt lịch...");
            const response = await createBookingRequest();

            if (response && response.status === 201) {
                console.log("✅ Đặt lịch thành công! Đang chuyển đến trang thanh toán...");
                const bookingId = response.data._id; // Extract booking ID from response
                setCreatedBookingId(bookingId); // Store booking ID in state

                const apiUrl = `/api/payments/create-payment/${bookingId}`;
                console.log("🌐 Khởi tạo thanh toán cho mã đặt lịch:", bookingId);

                const paymentResponse = await axios.post(apiUrl);
                const checkoutUrl = paymentResponse?.data?.data?.checkoutUrl; // Correct path
                const orderCode = paymentResponse?.data?.data?.orderCode; // Check if orderCode exists

                if (!checkoutUrl) {
                    throw new Error("Không tìm thấy checkoutUrl trong phản hồi API");
                }

                localStorage.setItem("orderCode", orderCode);
                sessionStorage.setItem("orderCode", orderCode);
                localStorage.setItem("bookingId", bookingId);
                sessionStorage.setItem("bookingId", bookingId);

                console.log("✅ Chuyển hướng đến trang thanh toán:", checkoutUrl);
                window.location.href = checkoutUrl; // Redirect to payment page
                toast.success(`Tạo liên kết thanh toán thành công cho mã đặt lịch #${bookingId}`);
            } else {
                console.log("❌ Yêu cầu đặt lịch không trả về trạng thái mong đợi:", response);
            }
        } catch (error) {
            console.error("❌ Lỗi khi đặt lịch hoặc thanh toán:", error);
            if (error.response) {
                console.error("⚠️ Lỗi phản hồi từ máy chủ:", error.response.data);
                toast.error(`Không thể tạo đặt lịch hoặc thanh toán: ${error.response.data.message || "Lỗi không xác định"}`);
            } else {
                toast.error("Không thể tạo đặt lịch hoặc thanh toán. Vui lòng thử lại.");
            }
        }
    };

    const handleCancel = () => {
        localStorage.setItem("serviceId", serviceId); // Lưu dịch vụ đã chọn
        window.location.href = "/consultant-customer"; // Chuyển về trang chuyên gia khi bấm Hủy
    };

    const isTimeDisabled = (time) => {
        const now = new Date();
        const selectedDay = new Date(selectedDate);
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [hour, minute] = time.split(/[: ]/);
        const timeInMinutes = (parseInt(hour) % 12 + (time.includes("PM") ? 12 : 0)) * 60 + parseInt(minute);

        // Disable past slots for today
        if (selectedDay.toDateString() === now.toDateString() && timeInMinutes <= currentTime) {
            return true;
        }

        // Disable already booked slots
        return bookedSlots.includes(time.trim()); // Ensure consistency in time format
    };

    const tileDisabled = ({ date, view }) => {
        if (view === 'month') {
            const today = new Date().setHours(0, 0, 0, 0);
            const formattedDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD

            // Disable past dates
            if (date < today) {
                return true;
            }

            // Disable fully booked dates
            return bookedSlots.includes(formattedDate);
        }
        return false;
    };

    // Gui api request tao booking 

    const createBookingRequest = async () => {
        if (!serviceId || !selectedTime || !selectedDate) {
            toast.error("Vui lòng chọn dịch vụ, ngày và giờ.");
            return null; // Return null explicitly to avoid undefined issues
        }

        const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);

        try {
            const payload = {
                serviceID: serviceId,
                customerID: localStorage.getItem("userId") || sessionStorage.getItem("userId"),
                date: localDate.toISOString().split("T")[0],
                time: selectedTime,
                consultantID: id && id !== "null" ? id : null,
                status: "Pending",
                isConsultantAssignedByCustomer: !!id,
            };

            console.log("📤 Đang gửi yêu cầu với dữ liệu:", payload);
            const response = await axios.post("/api/booking-requests/", payload);

            console.log("📥 Phản hồi từ API:", response);

            if (response.status === 201) {
                toast.success("Tạo yêu cầu đặt lịch thành công!");
                return response; // ✅ Ensure response is returned
            } else {
                console.error("❌ Trạng thái phản hồi không mong đợi:", response.status);
                return null;
            }
        } catch (error) {
            console.error("❌ Lỗi khi tạo yêu cầu đặt lịch:", error);

            toast.error("Chuyên gia này đã được đặt vào ngày và giờ đã chọn.");
            return null; // Return null in case of error
        }
    };

    return (
        <div className="bg-[#F8F4F2] min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto p-4">
                {consultants && id !== "null" && id && (
                    <h1 className="text-center text-2xl font-semibold my-4">
                        Tư vấn chăm sóc da với <span className="text-[#C54759]">{consultants.firstName} {consultants.lastName}</span>
                    </h1>
                )}

                <div className="bg-white p-6 rounded-xl shadow-lg flex gap-6">
                    <div>
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            className="border rounded-lg p-4 text-lg shadow-md"
                            tileDisabled={tileDisabled}
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                            Khung giờ còn trống cho <span className="text-[#C54759]">{selectedDate.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {times.map((time, index) => (
                                <button
                                    key={index}
                                    className={`border p-2 rounded-lg text-xs font-medium transition 
                                        ${selectedTime === time
                                            ? 'bg-pink-400 text-white'
                                            : isTimeDisabled(time)
                                                ? 'bg-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                                                : 'bg-gray-100 hover:bg-pink-100 hover:text-pink-600'
                                        }`}
                                    onClick={() => handleTimeSelect(time)}
                                    aria-label={`Chọn giờ ${time}`}
                                    disabled={isTimeDisabled(time)}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center gap-6 mt-8">
                            <button
                                className="bg-pink-500 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-pink-600 transition duration-300"
                                onClick={handleConfirmBooking}
                                aria-label="Xác nhận đặt lịch"
                            >
                                Chọn
                            </button>
                            <button
                                className="bg-gray-300 px-8 py-3 rounded-xl hover:bg-gray-400 transition duration-300"
                                onClick={handleCancel}
                                aria-label="Hủy đặt lịch"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>

                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center transition-opacity duration-300 backdrop-blur-sm">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                            <h2 className="text-2xl font-bold text-center text-[#C54759] mb-6">Xác nhận đặt lịch</h2>
                            <div className="text-gray-700 space-y-3">
                                <p>
                                    <strong className="text-[#C54759]">Dịch vụ:</strong> {serviceName}
                                </p>
                                <p>
                                    <strong className="text-[#C54759]">Giá:</strong> {formatPrice(servicePrice)}
                                </p>
                                <p>
                                    <strong className="text-[#C54759]">Ngày:</strong> {selectedDate.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                <p>
                                    <strong className="text-[#C54759]">Giờ:</strong> {selectedTime}
                                </p>
                                {consultants && id !== "null" && (
                                    <p>
                                        <strong className="text-[#C54759]">Chuyên gia:</strong> {consultants.firstName} {consultants.lastName}
                                    </p>
                                )}
                            </div>
                            <p className="text-sm text-red-600 mt-6 text-center font-medium">
                                ⚠️ LƯU Ý: Quý khách cần thanh toán trước 100% để xác nhận đặt lịch.<br />
                                Đặt lịch đã thanh toán sẽ không được hoàn tiền nếu hủy.
                            </p>
                            <div className="flex justify-end gap-4 mt-8">
                                <button
                                    className="bg-pink-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-pink-600 transition duration-300"
                                    onClick={handleConfirmAndPay}
                                >
                                    Xác nhận & Thanh toán
                                </button>
                                <button
                                    className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
                                    onClick={() => setShowConfirmModal(false)}
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

SkincareBooking.propTypes = {
    selectedDate: PropTypes.instanceOf(Date),
    selectedTime: PropTypes.string,
    times: PropTypes.arrayOf(PropTypes.string),
    handleTimeSelect: PropTypes.func,
    handleConfirm: PropTypes.func,
    handleCancel: PropTypes.func,
};

export default SkincareBooking;
