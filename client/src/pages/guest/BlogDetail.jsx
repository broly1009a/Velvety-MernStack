import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        const res = await axios.get(`/api/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [id]);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        const res = await axios.get("/api/blogs");
        const shuffledBlogs = res.data
          .filter((relatedBlog) => relatedBlog._id !== id) // Loại bỏ blog trùng ID
          .sort(() => 0.5 - Math.random());
        setRelatedBlogs(shuffledBlogs.slice(0, 3)); // Lấy 3 blog ngẫu nhiên
      } catch (err) {
        console.error("Error fetching related blogs:", err);
      }
    };

    fetchRelatedBlogs();
  }, [id]);

  // Scroll to top when the blog ID changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Thêm hiệu ứng mượt mà
    });
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  if (!blog) return <p className="text-center text-red-500 mt-10">Blog not found.</p>;

  return (
    <div className="">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 flex">

        <div className="w-3/4">
          {/* ✅ Back Button */}
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded mb-4"
            onClick={() => navigate('/blog')}
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold text-gray-900">{blog.title}</h1>

          <p className="text-gray-500 text-sm mt-2">{new Date(blog.createdDate).toLocaleDateString()}</p>

          {/* Fix: Ensure HTML content renders properly */}
          <div className="w-full h-[60vh] overflow-hidden rounded-lg mt-4 ">
            <img
              src={blog.image}
              alt="Blog Cover"
            />
          </div>
          <div
            className="mt-6 text-gray-700 text-lg leading-relaxed tracking-wide font-sans"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
        {/* Related Blogs */}
        <div className="w-1/4 pl-8">
          <h2 className="text-4xl font-bold pacifico-regular text-[#E27585]">Related Blogs</h2>
          {relatedBlogs.map((relatedBlog) => (
            <div key={relatedBlog.id} className="mt-4">
              <div onClick={() => navigate(`/blog/${relatedBlog._id}`)} className="block transform transition duration-300 hover:scale-105 cursor-pointer">
                <img src={relatedBlog.image} alt={relatedBlog.title} className="w-full h-56 object-cover mb-2 rounded-lg" style={{ aspectRatio: '1 / 1', borderRadius: '8px' }} />
                <span className="text-black font-bold">{relatedBlog.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail;
