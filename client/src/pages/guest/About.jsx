import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import StarIcon from "@mui/icons-material/Star";
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia } from "@mui/material";

export default function About() {
  const [popularServices, setServices] = useState([]);
  const [consultants, setConsultants] = useState([]); // State for consultants
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch popular services
    axios
      .get("/api/services/")
      .then((response) => {
        setServices(response.data);
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
      });

    // Fetch consultants
    axios
      .get("/api/consultants/")
      .then((response) => {
        setConsultants(response.data);
      })
      .catch((error) => {
        console.error("Error fetching consultants:", error);
      });
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const consultantSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <Box sx={{ bgcolor: "#f9faef" }}>
      <Navbar />
      <Box
        sx={{
          width: "100%",
          height: "70vh",
          backgroundImage: "url(/images/1740975512430.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundAttachment: "fixed",
        }}
      >
      </Box>

      <Container sx={{ textAlign: "center", py: 5 }}>
        <Typography variant="h3" fontWeight={200} gutterBottom>
          Kể từ khi thành lập năm 1973, Ocean mist spa đã có một mục tiêu duy nhất: Tạo ra các giải pháp chăm sóc da an toàn, hiệu quả với kết quả rõ rệt… với mức giá hợp lý.
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          <span style={{ color: "#c86c79" }}>Chăm sóc da tự nhiên</span> tuyệt vời, giá cả phải chăng và hiệu quả!
        </Typography>
      </Container>

      <Container>
        <Slider {...settings}>
          {popularServices.map((service, index) => (
            <Box key={index} sx={{ p: 2, textAlign: "center" }}>
              <img src={service.image} alt={service.name} style={{ width: "100%", borderRadius: "10px" }} />
              <Typography variant="h6" sx={{ mt: 2 }}>{service.name}</Typography>
            </Box>
          ))}
        </Slider>
      </Container>

      <Container sx={{ textAlign: "center", py: 5 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Ocean mist spa – Chăm sóc da qua nhiều thế hệ
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Hãy tìm hiểu về chúng tôi và trải nghiệm di sản chăm sóc da tự nhiên chất lượng.
        </Typography>
      </Container>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="relative flex flex-row items-center justify-center py-10"
      >
        {/* Nội dung bên trái */}
        <div className="flex flex-col items-start max-w-[550px] text-left mr-6">
          <motion.span
            className="text-3xl font-semibold text-gray-900 leading-snug"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            Bên trong Ocean mist spa, bạn sẽ nhanh chóng nhận ra “gia đình” của chúng tôi còn bao gồm nhiều gia đình khác đã gắn bó lâu dài...
          </motion.span>

          <motion.span
            className="text-xl text-gray-700 mt-2 leading-snug"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
          >
            Thật tuyệt vời khi Ocean mist spa đã trở thành thương hiệu tự nhiên được tin tưởng và truyền từ thế hệ này sang thế hệ khác.
          </motion.span>
        </div>

        {/* Hình ảnh bên phải */}
        <motion.div
          className="w-[420px] h-[370px] bg-cover bg-no-repeat rounded-lg shadow-lg"
          style={{ backgroundImage: "url(/images/about_2.png)" }}
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        ></motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="w-full max-w-[1499px] flex justify-between items-start mx-auto px-6 space-x-10"
      >
        {/* Đoạn văn bản bên trái */}
        <div className="max-w-[803px] text-left text-[18px] font-light leading-[32px] tracking-[0.8px] text-gray-900">
          <span>
            Ocean mist spa đã trở thành một dòng sản phẩm chăm sóc da tự nhiên đa thế hệ theo nhiều cách khác nhau.{" "}
          </span>
          <span className="text-[#c86c79] font-medium">Stephen Strassler{" "}</span>
          <span>
            đã qua đời vào cuối năm 2016, để lại công ty cho người vợ Judy – người đã tin tưởng giao phó cho một đội ngũ tài năng – thế hệ lãnh đạo mới của Ocean mist spa. Đáng buồn, Ocean mist spa đã mất{" "}
          </span>
          <span className="text-[#c86c79] font-medium">Judith Strassler{" "}</span>
          <span>vào đầu năm 2020 và hiện Ocean mist spa được quản lý bởi một quỹ gia đình.</span>
        </div>

        {/* Đoạn văn bản bên phải */}
        <div className="max-w-[500px] text-left text-[18px] font-medium leading-[32px] tracking-[0.8px] text-gray-900">
          <span>
            Hãy làm quen với Ocean mist spa mới – chuyên gia chăm sóc da tự nhiên.
            Liên hệ đại diện bán hàng, truy cập website hoặc kết nối với chúng tôi qua mạng xã hội. Nếu cần thêm thông tin, vui lòng gọi{" "}
          </span>
          <span className="text-[#c86c79] font-semibold">800.257.7774</span>
          <span>{" "}hoặc truy cập{" "}</span>
          <span className="text-[#ffc0cb] underline">www.oceanmistspa.online</span>.
        </div>
      </motion.div>

      <div className="flex flex-col items-center justify-center text-[18px] font-light leading-[32px] tracking-[0.8px] text-gray-900 py-20 mt-10 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl text-center mx-auto p-6"
        >
          <motion.h1
            className="text-5xl meow-script-regular font-extrabold text-[#df6073] mb-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            Về Chúng Tôi
          </motion.h1>

          <motion.p
            className="text-xl text-gray-800 text-[18px] font-light leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Chúng tôi cam kết mang đến dịch vụ tốt nhất cho khách hàng.
            Đội ngũ chuyên gia của chúng tôi đảm bảo chất lượng và sự tin cậy trong từng dự án.
            Hãy đồng hành cùng chúng tôi trên hành trình hướng tới sự xuất sắc.
          </motion.p>

          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
          </motion.div>
        </motion.div>

        <Container sx={{ textAlign: "center", py: 5 }}>
        <motion.h1
            className="text-4xl meow-script-regular font-extrabold text-[#df6073] mb-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            Giá Trị Cốt Lõi
          </motion.h1>
          <Grid container spacing={4} justifyContent="center">
            {[
              { title: "Chất lượng", desc: "Chúng tôi chỉ sử dụng những thành phần tự nhiên tốt nhất cho sản phẩm chăm sóc da." },
              { title: "Đổi mới", desc: "Không ngừng nghiên cứu để mang lại giải pháp chăm sóc da hiệu quả nhất." },
              { title: "Bền vững", desc: "Cam kết đóng gói thân thiện môi trường và không thử nghiệm trên động vật." },
            ].map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <Card sx={{ p: 3, textAlign: "center", boxShadow: 3 }}>
                    <Typography variant="h6" fontWeight={600}>{value.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{value.desc}</Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Container sx={{ textAlign: "center", py: 5 }}>
          <motion.h1
            className="text-4xl meow-script-regular font-extrabold text-[#df6073] mb-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            Thành Tựu
          </motion.h1>
          <Grid container spacing={4} justifyContent="center">
            {[
              { image: "/images/award_1.png", text: "Thương hiệu chăm sóc da tự nhiên tốt nhất 2022" },
              { image: "/images/award_2.png", text: "Giải thưởng làm đẹp bền vững 2023" },
              { image: "/images/award_3.png", text: "Hơn 1 triệu khách hàng hài lòng" },
            ].map((achievement, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <Card sx={{ p: 3, textAlign: "center", boxShadow: 3 }}>
                    <CardMedia component="img" image={achievement.image} alt={achievement.text} sx={{ height: 150, objectFit: "contain" }} />
                    <Typography variant="body1" sx={{ mt: 2 }}>{achievement.text}</Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>

      {/* Booking Now Button */}
      <div className="fixed bottom-28 right-4">
        {/* Ping effect */}
        <span className="absolute -inset-1 inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>

        {/* Animated Button */}
        <motion.button
          onClick={() => navigate("/services")}
          className="relative px-6 py-3 text-white rounded-full shadow-lg pacifico-regular focus:outline-none focus:ring-4 focus:ring-green-300"
          style={{
            background: "linear-gradient(135deg, #6B8E23, #32CD32)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
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
          Đặt lịch ngay
        </motion.button>
      </div>

      {/* New section for consultants */}
      <Box sx={{ py: 5 }}>
        <Container sx={{ textAlign: "center" }}>
          <motion.h1
            className="text-4xl meow-script-regular font-extrabold text-[#df6073] mb-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            Đội Ngũ Chuyên Viên
          </motion.h1>
          <Slider {...consultantSettings}>
            {consultants.map((consultant) => (
              <Box key={consultant._id} sx={{ px: 2, textAlign: "center", position: "relative" }}>
                <Card
                  sx={{ maxWidth: 240, mx: "auto", minHeight: 320, cursor: "pointer", transition: "0.3s", "&:hover .consultant-info": { opacity: 1 } }}
                >
                  <CardMedia
                    component="img"
                    image={consultant.image || "/images/default-avatar.png"}
                    alt={consultant.firstName}
                    sx={{
                      height: 250,
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                  <CardContent sx={{ textAlign: "center", minHeight: 70 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {consultant.firstName} {consultant.lastName}
                    </Typography>
                  </CardContent>
                </Card>
                <Box
                  className="consultant-info"
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    bgcolor: "rgba(0, 0, 0, 0.7)",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    opacity: 0,
                    transition: "opacity 0.3s ease-in-out",
                    pointerEvents: "none",
                    maxWidth: "200px",
                  }}
                >
                  <Typography variant="body2">
                    {consultant.note || "Nhấn để xem thêm thông tin."}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Slider>
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
}
