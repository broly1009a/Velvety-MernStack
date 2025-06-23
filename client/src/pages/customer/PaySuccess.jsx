import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "@/utils/axiosInstance";  
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const PaySuccess = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const orderCode = sessionStorage.getItem("orderCode") || localStorage.getItem("orderCode");
    const bookingId = sessionStorage.getItem("bookingId") || localStorage.getItem("bookingId");

    useEffect(() => {
        if (!orderCode) {
            setError("Không tìm thấy đơn hàng.");
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/orders/${orderCode}`);
                setOrder(response.data);
                
                // Update booking status **only if** bookingId exists
                if (bookingId) {
                    await updateBookingStatus();
                }
            } catch (error) {
                setError(error.response?.data?.message || "Không thể lấy thông tin đơn hàng.");
                console.error("Lỗi khi lấy đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderCode]); // bookingId is used only inside, no need to add in dependencies

    const updateBookingStatus = async () => {
        if (!bookingId) return;
    
        try {
            await axios.put(`/api/booking-requests/${bookingId}/status`, { status: "Completed" });
            console.log("Cập nhật trạng thái đặt chỗ thành công");
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đặt chỗ:", error.response?.data?.message || error.message);
        }
    };
    
    

    if (loading) return <div className="text-center mt-6">Đang tải...</div>;
    if (error) return <div className="text-center text-red-500 mt-6">{error}</div>;

    return (
        <div className="bg-[#dde8f8] min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-6 shadow-lg rounded-lg">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-600">Thanh toán thành công</h2>
                    <p className="text-gray-500">Cảm ơn bạn đã mua hàng!</p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Biên nhận</p>
                    <p className="text-sm text-gray-500">Mã đơn hàng: <span className="font-mono">{order?.orderCode}</span></p>
                    <p className="text-sm text-gray-500">
                        Ngày giao dịch: {order?.transactionDateTime ? new Date(order.transactionDateTime).toLocaleString() : "Không có"}
                    </p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Thông tin người mua</p>
                    <p className="text-sm text-gray-700 font-bold">Tên: {order?.buyerName || "Không có"}</p>
                    <p className="text-sm text-gray-700 font-bold">Email: {order?.buyerEmail || "Không có"}</p>
                    <p className="text-sm text-gray-700 font-bold">Số điện thoại: {order?.buyerPhone || "Không có"}</p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Tóm tắt đơn hàng</p>
                    <p className="text-sm font-bold">Mô tả: {order?.description || "Không có"}</p>
                    <p className="text-sm font-bold">Phương thức thanh toán: {order?.paymentMethod || "Không có"}</p>
                    <p className="text-sm font-bold">Trạng thái: {order?.status || "Không có"}</p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Số tiền đã thanh toán</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {order?.amount ? `${order.amount} ${order.currency}` : "Không có"}
                    </p>
                </div>

                <div className="flex justify-between mt-6">
                    <Link to={"/"} className="text-blue-600 flex items-center">
                        <ArrowBackIcon className="mr-1" /> Quay lại
                    </Link>
                </div>
            </div>
        </div>
    );
};
