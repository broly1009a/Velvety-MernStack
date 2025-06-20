const Blog = require("../models/Blog");

// Create a new blog post
exports.createBlogPost = async (req, res) => {
  try {
    const { title, image, description, content, author } = req.body;

    const newPost = new Blog({
      title,
      image,
      description,
      content,
      author,
      createdDate: new Date(),
      updatedDate: new Date(),
    });

    await newPost.save();
    res.status(201).json({ message: "Blog post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get all blog posts
exports.getAllBlogPosts = async (req, res) => {
  try {
    const posts = await Blog.find();
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get a single blog post by ID
exports.getBlogPostById = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Blog.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Blog post not found." });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Update a blog post
exports.updateBlogPost = async (req, res) => {
  const { postId } = req.params;
  const { title, image, description, content, author } = req.body;

  try {
    const updatedPost = await Blog.findByIdAndUpdate(
      postId,
      { title, image, description, content, author, updatedDate: new Date() },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    res.status(200).json({ message: "Blog post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Delete a blog post
exports.deleteBlogPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const deletedPost = await Blog.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    res.status(200).json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
