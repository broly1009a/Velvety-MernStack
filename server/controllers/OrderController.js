const Order = require("../models/Order");
const User = require("../models/User");
const Service = require("../models/Service");

// Hàm tạo mã đơn hàng tự động
const generateOrderCode = () => {
    return `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const createOrder = async (req, res) => {
    try {
        const { serviceId, amount, description, buyerName, buyerEmail, buyerPhone, buyerAddress, items, currency, paymentMethod, paymentStatus, transactionDateTime } = req.body;
        const memberID = req.user.id;
        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const newOrder = new Order({
            memberId: memberID,
            serviceId,
            orderCode: generateOrderCode(),  // Thêm orderCode
            amount,
            description,
            buyerName,
            buyerEmail,
            buyerPhone,
            buyerAddress,
            items,
            currency,
            paymentMethod,
            paymentStatus,
            transactionDateTime: transactionDateTime ? new Date(transactionDateTime) : Date.now(), // Định dạng lại thời gian
        });

        await newOrder.save();
        res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrdersByMemberId = async (req, res) => {
    try {
        const memberId = req.user.id;
        const orders = await Order.find({ memberId, status: "Paid" }); // Chỉ lấy đơn hàng đã thanh toán

        res.status(200).json(orders); // Trả về [] nếu không có đơn hàng nào
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders); // Không cần kiểm tra `if (!orders)`, vì MongoDB sẽ trả về []
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const memberId = req.user.id;

        // Kiểm tra quyền sở hữu trước khi xóa
        const deletedOrder = await Order.findOneAndDelete({ _id: orderId, memberId });
        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found or unauthorized" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrderByOrderCode = async (req, res) => {
    try {
        const { orderCode } = req.params;
        const order = await Order.findOne({ orderCode: orderCode.toLowerCase() }); // Không phân biệt hoa thường

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTotalRevenue = async (req, res) => {
    try {
        const totalRevenue = await Order.aggregate([
            { $match: { status: "Paid" } }, // Lọc chỉ lấy đơn hàng đã thanh toán
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } } // Tính tổng amount
        ]);

        res.status(200).json({ totalRevenue: totalRevenue[0]?.totalAmount || 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMostOrderedService = async (req, res) => {
    try {
        const serviceOrders = await Order.aggregate([
            { $match: { status: "Paid" } }, // Chỉ tính các đơn hàng đã thanh toán
            { $group: { _id: "$serviceId", count: { $sum: 1 } } }, // Nhóm theo serviceId và đếm số lượng
            { $sort: { count: -1 } }, // Sắp xếp giảm dần theo số lượng
            { $limit: 1 } // Lấy dịch vụ có số lần đặt cao nhất
        ]);

        if (serviceOrders.length === 0) {
            return res.status(404).json({ message: "No paid orders found" });
        }

        const mostOrderedService = await Service.findById(serviceOrders[0]._id);

        if (!mostOrderedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ 
            service: mostOrderedService, 
            orderCount: serviceOrders[0].count 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMonthlyRevenueByService = async (req, res) => {
  try {
    const { year } = req.query;
    const pipeline = [
      { $match: { status: "Paid" } },
      {
        $project: {
          serviceId: 1,
          amount: 1,
          month: { $month: "$transactionDateTime" },
          year: { $year: "$transactionDateTime" },
        },
      },
      { $match: { year: Number(year) } },
      {
        $group: {
          _id: { serviceId: "$serviceId", month: "$month" },
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.serviceId",
          monthly: {
            $push: {
              month: "$_id.month",
              totalRevenue: "$totalRevenue",
              totalOrders: "$totalOrders",
            },
          },
        },
      },
      // Join sang bảng Service để lấy tên
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "serviceInfo"
        }
      },
      {
        $unwind: "$serviceInfo"
      },
      {
        $project: {
          _id: 0,
          serviceId: "$serviceInfo._id",
          serviceName: "$serviceInfo.name",
          monthly: 1
        }
      }
    ];
    const result = await Order.aggregate(pipeline);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
    createOrder,
    getOrdersByMemberId,
    getAllOrders,
    getOrderByOrderCode,
    deleteOrder,
    getTotalRevenue,
    getMostOrderedService,
    getMonthlyRevenueByService
};
