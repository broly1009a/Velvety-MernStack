const express = require("express");
const {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
} = require("../controllers/BlogController");
const { authenticate, authorize } = require("../middlewares/AuthMiddleware");

const router = express.Router();

// Route to create a new blog post (Only Manager)
router.post("/", authenticate, authorize(["Manager"]), createBlogPost);

// Route to get all blog posts (Anyone)
router.get("/", getAllBlogPosts);

// Route to get a single blog post by ID (Anyone)
router.get("/:postId", getBlogPostById);

// Route to update a blog post (Only Manager)
router.put("/:postId", authenticate, authorize(["Manager"]), updateBlogPost);

// Route to delete a blog post (Only Manager)
router.delete("/:postId", authenticate, authorize(["Manager"]), deleteBlogPost);

module.exports = router;
