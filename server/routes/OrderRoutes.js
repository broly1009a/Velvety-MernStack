const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderController");
const { authenticate, authorize } = require('../middlewares/AuthMiddleware');

// Tạo đơn hàng (Chỉ người dùng đã đăng nhập mới có thể đặt hàng)
router.post("/", authenticate, orderController.createOrder);

// Lấy danh sách đơn hàng của thành viên (Chỉ người dùng đã đăng nhập mới xem được đơn của mình)
router.get("/member", authenticate, orderController.getOrdersByMemberId);

// Lấy danh sách đơn hàng đã thanh toán (Chỉ Admin và Manager mới có quyền truy cập)
router.get("/revenue", orderController.getTotalRevenue);
router.get("/most-ordered-service", orderController.getMostOrderedService);

// Lấy doanh thu hàng tháng (Chỉ Admin và Manager mới có quyền truy cập)
router.get("/monthly-revenue-by-service", authenticate, authorize(["Admin","Manager"]), orderController.getMonthlyRevenueByService);

// Lấy tất cả đơn hàng (Chỉ Admin và Manager mới có quyền truy cập)
router.get("/", authenticate, authorize(["Admin","Manager"]), orderController.getAllOrders);

// Lấy đơn hàng theo mã (sau cùng để tránh bắt nhầm)
router.get("/:orderCode", authenticate, orderController.getOrderByOrderCode);

// Xóa đơn hàng
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
