const PayOS = require('../utils/payos'); // Assuming PayOS is your payment gateway utility
const Order = require("../models/Order");
const Service = require("../models/Service");
const BookingRequest = require("../models/BookingRequest");
const User = require("../models/User");
const dotenv = require('dotenv');
dotenv.config();

// Function to create an embedded payment link
const createEmbeddedPaymentLink = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const bookingRequest = await BookingRequest.findById(bookingId);

        if (!bookingRequest) {
            return res.status(404).json({ error: 1, message: 'Booking request not found' });
        }
        const userId = bookingRequest.customerID;
        const serviceId = bookingRequest.serviceID;

        const user = await User.findById(userId);
        const service = await Service.findById(serviceId);

        if (!user) {
            return res.status(404).json({ error: 1, message: 'User not found' });
        }

        if (!service) {
            return res.status(404).json({ error: 1, message: 'Service not found' });
        }

        const transactionDateTime = new Date();

        let orderCode;
        while (true) {
            orderCode = Number(Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0'));
            const existingOrder = await Order.findOne({ orderCode });
            if (!existingOrder) break;
        }

        // Thêm bookingId vào order để liên kết
        const newOrder = new Order({
            memberId: userId,
            serviceId: serviceId,
            bookingId: bookingId,
            status: "Pending",
            amount: service.price,
            orderCode,
            description: "Service Payment",
            buyerName: user.firstName + " " + user.lastName,
            buyerEmail: user.email,
            buyerPhone: user.phoneNumber,
            transactionDateTime: transactionDateTime
        });
        await newOrder.save();

        const amount = service.price;
        const description = "Service Payment";
        const items = [{ name: service.name, quantity: 1, price: service.price }];
        const returnUrl = process.env.RETURN_URL || "http://localhost:5173/pay-success";
        const cancelUrl = process.env.CANCEL_URL || "http://localhost:5173/pay-failed";

        const paymentLinkRes = await PayOS.createPaymentLink({
            orderCode,
            amount,
            description,
            items,
            returnUrl,
            cancelUrl,
        });

        return res.json({
            error: 0,
            message: "Success",
            data: {
                bin: paymentLinkRes.bin,
                checkoutUrl: paymentLinkRes.checkoutUrl,
                accountNumber: paymentLinkRes.accountNumber,
                accountName: paymentLinkRes.accountName,
                amount: paymentLinkRes.amount,
                description: paymentLinkRes.description,
                orderCode: paymentLinkRes.orderCode,
                qrCode: paymentLinkRes.qrCode,
            },
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 1,
            message: "Internal server error",
            data: null,
        });
    }
};



const receivePayment = async (req, res) => {
    try {
        let data = req.body; // Lấy dữ liệu webhook từ PayOS

        console.log('Webhook received:', data);

        // Kiểm tra và xử lý orderCode
        if (data.data && data.data.orderCode) {
            const orderCode = data.data.orderCode;
            const order = await Order.findOne({ orderCode });
            if (data.data.orderCode == 123) {
                return res.status(200).json({ error: 0, message: "Success" });
            }
            if (!order) {
                console.log(`Order with orderCode ${orderCode} not found.`);
                return res.status(404).json({ error: 1, message: "Order not found" });
            }

            if (data.success) {
                order.status = "Paid";
                order.currency = data.data.currency;
                order.paymentMethod = "PayOS";
                order.paymentStatus = data.data.desc || "Payment Successful";

                if (order.bookingId) {
                    const bookingRequest = await BookingRequest.findById(order.bookingId);
                    if (bookingRequest) {
                        if (bookingRequest.status === "Completed") {
                            console.log(`You already paid for booking ${order.bookingId}`);
                        } else if (bookingRequest.status === "Confirmed") {
                            bookingRequest.status = "Completed";
                            await bookingRequest.save();
                            console.log(`Booking ${order.bookingId} updated to Completed.`);
                        } else {
                            console.log(`Booking ${order.bookingId} has status ${bookingRequest.status}, skipping update.`);
                        }
                    }
                }

                console.log(`Order ${orderCode} updated to Paid.`);
            } else {    
                order.status = "Canceled";
                order.paymentStatus = data.data.desc || "Payment Failed";
                console.log(`Order ${orderCode} updated to Canceled.`);
            }

            await order.save();
            return res.status(200).json({ error: 0, message: "Order updated successfully", order });
        }

        return res.status(400).json({ error: 1, message: "Invalid payment data" });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return res.status(500).json({ error: 1, message: "Internal server error" });
    }
};

module.exports = { createEmbeddedPaymentLink, receivePayment };
