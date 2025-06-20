import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "../../components/CustomerSidebar";
import axios from "../../utils/axiosInstance";
import {
  Fab,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TablePagination,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const QuizResultHistory = () => {
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [skinTypeFilter, setSkinTypeFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const navigate = useNavigate();

  const fetchQuizResults = async () => {
    try {
      const response = await axios.get("/api/quiz-results/user");
      const results = response.data || [];
      console.log(results);

      // Fetch recommended services for each quiz result
      const resultsWithServices = await Promise.all(
        results.map(async (result) => {
          try {
            const serviceResponse = await axios.get(`/api/services/recommended-services/${result._id}`);
            return { ...result, recommendedServices: serviceResponse.data };
          } catch (err) {
            console.error(`Error fetching recommended services for quiz result ${result._id}:`, err.message);
            return { ...result, recommendedServices: [] };
          }
        })
      );

      setQuizResults(resultsWithServices);
    } catch (err) {
      console.error("Error fetching quiz results:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/quiz-results/${id}`);
      if (response.status === 200) {
        setQuizResults((prevResults) => prevResults.filter((result) => result._id !== id));
        toast.success("Quiz result deleted successfully!");
      } else {
        toast.error("Failed to delete quiz result. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting quiz result:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to delete quiz result.");
    }
  };

  useEffect(() => {
    fetchQuizResults();
  }, []);

  const filteredQuizResults = quizResults.filter(
    (result) =>
      result.skinType.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (skinTypeFilter ? result.skinType === skinTypeFilter : true)
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="flex main-container w-full h-full relative mx-auto my-0 p-6">
      <CustomerSidebar />
      <div className="w-full">
        <Typography variant="h4" className="mb-4 text-[#c86c79] text-center">
          Quiz Result History
        </Typography>
        <div className="flex justify-between mb-4">
          <TextField
            label="Search by Skin Type"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/2"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "gray", // Default border color
                },
                "&:hover fieldset": {
                  borderColor: "#E27585", // Border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#daacac", // Border color when focused
                },
              },
              "& .MuiInputBase-input": {
                color: "#000000", // Changes the text color inside the field
              },
              "& .MuiInputLabel-root": {
                color: "gray", // Default label color
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#E27585", // Label color when focused
              },
            }}
          />
          <FormControl
            size="small"
            className="w-1/4"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "gray", // Default border color
                },
                "&:hover fieldset": {
                  borderColor: "#E27585", // Border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#daacac", // Border color when focused
                },
              },
              "& .MuiInputBase-input": {
                color: "#000000", // Changes the text color inside the field
              },
              "& .MuiInputLabel-root": {
                color: "gray", // Default label color
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#E27585", // Label color when focused
              },
            }}
          >
            <InputLabel>Skin Type</InputLabel>
            <Select
              value={skinTypeFilter}
              onChange={(e) => setSkinTypeFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Oily">Oily</MenuItem>
              <MenuItem value="Dry">Dry</MenuItem>
              <MenuItem value="Combination">Combination</MenuItem>
              <MenuItem value="Normal">Normal</MenuItem>
            </Select>
          </FormControl>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error" className="text-center">
            {error}
          </Typography>
        ) : filteredQuizResults.length === 0 ? (
          <Typography className="text-center">
            No quiz results found.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} elevation={3} className="shadow-md">
              <Table>
                <TableHead className="bg-[#E27585] text-white">
                  <TableRow>
                    <TableCell align="center">No</TableCell>
                    <TableCell align="center">Date</TableCell>
                    <TableCell align="center">Time</TableCell>
                    <TableCell align="center">Skin Type</TableCell>
                    <TableCell align="center">Recommend Services</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQuizResults
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((result, index) => (
                      <TableRow
                        key={result._id}
                        className="transition duration-300 hover:bg-gray-100"
                      >
                        <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell align="center">
                          {new Date(result.createdDate).toLocaleDateString("en-GB")}
                        </TableCell>
                        <TableCell align="center">
                          {new Date(result.createdDate).toLocaleTimeString()}
                        </TableCell>
                        <TableCell align="center">{result.skinType}</TableCell>
                        <TableCell align="center">
                          {result.recommendedServices.length > 0 ? (
                            <div>
                              {result.recommendedServices.slice(0, result.showAll ? result.recommendedServices.length : 3).map((service) => (
                                <div
                                  key={service._id}
                                  onClick={() => handleServiceClick(service._id)}
                                  style={{
                                    cursor: "pointer",
                                    transition: "transform 0.3s, color 0.3s",
                                  }}
                                  className="flex items-center gap-4 hover:scale-105 hover:text-[#C54759]"
                                >
                                  <img
                                    src={service.image}
                                    alt={service.name}
                                    className="w-12 h-12 object-cover rounded-full mt-1"
                                  />
                                  <span>{service.name}</span>
                                </div>
                              ))}
                              {result.recommendedServices.length > 3 && (
                                <button
                                  onClick={() => {
                                    const updatedResults = quizResults.map((r) =>
                                      r._id === result._id ? { ...r, showAll: !r.showAll } : r
                                    );
                                    setQuizResults(updatedResults);
                                  }} 
                                  style={{
                                    cursor: "pointer",
                                    transition: "transform 0.3s, color 0.3s",
                                    color: "#C54759",
                                  }}
                                  className="flex items-center gap-4 hover:scale-105 hover:text-[#C54759] mt-2"
                                >
                                  {result.showAll ? "View Less" : "View More"}
                                </button>
                              )}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Fab
                            size="small"
                            color="secondary"
                            onClick={() => handleDelete(result._id)}
                            sx={{
                              backgroundColor: "#E27585",
                              "&:hover": { backgroundColor: "#a92a4e" },
                            }}
                          >
                            <DeleteIcon />
                          </Fab>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredQuizResults.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        <Fab
          color="primary"
          onClick={() => navigate("/")}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            backgroundColor: "#E27585",
            "&:hover": { backgroundColor: "#a92a4e" },
          }}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a92a4e] opacity-75"></span>
          <HomeIcon />
        </Fab>
      </div>
    </div>
  );
};

export default QuizResultHistory;