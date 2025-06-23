import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "@/utils/axiosInstance";

export const PayFailed = () => {
    const orderCode = sessionStorage.getItem("orderCode") || localStorage.getItem("orderCode");
    const bookingId = sessionStorage.getItem("bookingId") || localStorage.getItem("bookingId");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const deleteBooking = async () => {
        try {
            await axios.delete(`/api/booking-requests/${bookingId}`);
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/orders/${orderCode}`);  // Gọi API lấy thông tin đơn hàng
                setOrder(response.data);
            } catch (error) {
                setError("Failed to fetch order details.");
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };
        deleteBooking();
        fetchOrder();
    }, [orderCode]);

    if (loading) return <div className="text-center mt-6 h-screen">Đang tải...</div>;
    if (error) return <div className="text-center text-red-500 mt-6">{error}</div>;

    return (
        <div className="bg-[#fdecea] pt-10 pb-10 h-screen">
            <div className="max-w-md mx-auto bg-white p-6 shadow-lg">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Thanh toán thất bại</h2>
                    <p className="text-gray-500">Vui lòng thử lại sau.</p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Biên nhận</p>
                    <p className="text-sm text-gray-500">Mã đơn hàng: <span className="font-mono">{order.orderCode}</span></p>
                    <p className="text-sm text-gray-500">Ngày giao dịch: {new Date(order.transactionDateTime).toLocaleString()}</p>
                </div>

                <div className="border-t mt-4 pt-4">
                    <p className="text-lg font-semibold">Thông tin người mua</p>
                    <p className="text-sm text-gray-700 font-bold">Tên: {order.buyerName}</p>
                    <p className="text-sm text-gray-700 font-bold">Email: {order.buyerEmail}</p>
                    <p className="text-sm text-gray-700 font-bold">Số điện thoại: {order.buyerPhone}</p>
                </div>

                <div className="flex justify-center mt-10">
                    <Link to={"/about"} className="text-blue-600">Quay về trang chủ</Link>
                </div>
            </div>
        </div>
    );
};
