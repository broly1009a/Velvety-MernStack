
// /controllers/serviceController.js
const Service = require('../models/Service');
const QuizResult = require('../models/QuizResult');
const Order = require('../models/Order');
const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');

// Get all services from the database
const getAllServices = async (req, res) => {
  try {
    console.log('Fetching services...');
    const services = await Service.find();
    console.log('Fetched services:', services); // This should log the services
    if (!services || services.length === 0) {
      console.log('No services found');
    }
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const { price, name, description, detaildescription, image, effectimage, resultimage, sensationimage, category, status } = req.body;
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Price must be a valid number' });
    }

    const newService = new Service({
      price: parsedPrice,
      name,
      description: description || "",
      detaildescription: detaildescription || "",
      image: image || "",
      effectimage: effectimage || "",
      resultimage: resultimage || "",
      sensationimage: sensationimage || "",
      category: Array.isArray(category) ? category : [],
      status: status || "active"
    });
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, name, description, detaildescription, image, effectimage, resultimage, sensationimage, category, status } = req.body;
    const updatedService = await Service.findByIdAndUpdate(id, { price, name, description, detaildescription, image, effectimage, resultimage, sensationimage, category, status },
      { new: true } // Trả về dữ liệu sau khi cập nhật
    );
    if (!updatedService) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(updatedService);
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedService = await Service.findByIdAndDelete(id);
    if (!deletedService) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getRecommendedServices = async (req, res) => {
  try {
    const { quizResultId } = req.params; // Correctly extracting quizResultId

    if (!quizResultId || !mongoose.Types.ObjectId.isValid(quizResultId)) {
      return res.status(400).json({ message: "Invalid quiz result ID" });
    }

    // Find the quiz result by ID
    const quizResult = await QuizResult.findById(quizResultId);
    if (!quizResult) {
      return res.status(404).json({ message: `Quiz result not found for ID: ${quizResultId}` });
    }

    // Extract skin type from quiz result
    const { skinType } = quizResult;

    // Find services that match the user's skin type
    const recommendedServices = await Service.find({ category: skinType }).lean();

    return res.status(200).json(recommendedServices);
  } catch (error) {
    console.error("Error fetching recommended services:", error);
    return res.status(500).json({ message: "Failed to fetch recommended services. Please try again later." });
  }
};

// Lấy chi tiết dịch vụ kèm thống kê
const getServiceDetailStats = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Đếm số lượt đặt và tổng doanh thu
    const orders = await Order.find({ serviceId: id, status: "Paid" });
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const totalOrders = orders.length;

    // Lấy rating trung bình
    const feedbacks = await Feedback.find({ serviceId: id });
    const avgRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + (f.serviceRating || 0), 0) /
        feedbacks.length
        : 0;

    res.json({
      ...service.toObject(),
      totalRevenue,
      totalOrders,
      avgRating,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createService,
  getAllServices,
  updateService,
  deleteService,
  getServiceById,
  getRecommendedServices,
  getServiceDetailStats
};


