import React, { useEffect, useState } from 'react';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BlogCard from '../../components/BlogCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // for navigation
import { motion } from "framer-motion";
import styled from 'styled-components';


export default function Blog() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const blogPostsPerPage = 6; // Define the number of blog posts per page
  const navigate = useNavigate(); // Hook to programmatically navigate
  const BlogPostWrapper = styled.div`
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: scale(1.05); /* Phóng to một chút */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Thêm bóng đổ khi hover */
  }
`;
  // Fetch blog posts data from server
  useEffect(() => {
    axios
      .get('/api/blogs') // Update with your backend API
      .then((response) => {
        setBlogPosts(response.data); // Set blog posts data
      })
      .catch((error) => {
        console.error('Error fetching blog posts:', error);
      });
  }, []);

  // Handle "Read More" button click (Navigate to the full blog post)
  const handleReadMore = (postId) => {
    navigate(`/blog/${postId}`); // This would navigate to a detailed blog page (e.g., `/blog/123`)
  };

  // Calculate the indices for the current page
  const indexOfLastBlogPost = currentPage * blogPostsPerPage;
  const indexOfFirstBlogPost = indexOfLastBlogPost - blogPostsPerPage;
  const currentBlogPosts = blogPosts.slice(indexOfFirstBlogPost, indexOfLastBlogPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="main-container w-full h-auto bg-[#f9faef] relative overflow-hidden mx-auto my-0">
      <Navbar />
      <div className="relative w-screen h-[300px] mx-50px">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-[1]">
          <span className="block font-['Lato'] text-[70px] font-bold leading-[100px] text-[#C54759] whitespace-nowrap">
            Expert Skincare Tips, Trends, & Insights
          </span>

          <span className="block font-['Lato'] text-[23px] font-normal leading-[30px] text-[#E68A98] mt-4 px-4 mx-auto">
            Explore our Blog for the latest in skincare science and beauty trends.
            Discover expert tips, in-depth reviews, and exclusive insights on our
            natural skincare products. Elevate your skin health and beauty regimen
            with us today!
          </span>
        </div>
      </div>

      {/* Render blog posts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-[30px] mb-[30px] mx-auto px-4 max-w-screen-xl">
        {currentBlogPosts.map((post) => (
          <BlogPostWrapper
            key={post._id}
            onClick={() => handleReadMore(post._id)}
          >
            <BlogCard
              image={post.image}
              title={<span className="text-[#E68A98]">{post.title}</span>}
              description={post.description}
              createdDate={post.createdDate}
            />
          </BlogPostWrapper>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-5 mb-10">
        {Array.from({ length: Math.ceil(blogPosts.length / blogPostsPerPage) }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-1 rounded-full ${currentPage === index + 1 ? 'bg-[#C54759] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Booking Now Button */}
      <div className="fixed bottom-4 right-4">
        {/* Ping effect */}
        <span className="absolute -inset-1 inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>

        {/* Animated Button */}
        <motion.button
          onClick={() => navigate("/services")}
          className="relative px-6 py-3 text-white rounded-full shadow-lg pacifico-regular focus:outline-none focus:ring-4 focus:ring-green-300"
          style={{
            background: "linear-gradient(135deg, #6B8E23, #32CD32)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
             marginBottom: "100px",
          }}
          animate={{
            y: [0, -5, 5, -5, 0], // Floating animation
            transition: {
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          Book Now
        </motion.button>
      </div>
      <Footer />
    </div>
  );
}