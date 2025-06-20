import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Pagination, // Import Pagination component
} from "@mui/material";
import Sidebar from "../../components/ManagerSidebar";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "../../utils/axiosInstance";
import { FaEdit, FaTrash } from "react-icons/fa";

const ITEMS_PER_PAGE = 6; // Number of questions per page

const QuestionCard = ({ question, onDelete, onEdit }) => {
  return (
    <Card sx={{ borderRadius: "12px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", transition: "transform 0.2s ease-in-out", "&:hover": { transform: "scale(1.02)" } }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {question.questionText}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          Answer Options:
        </Typography>
        {question.answerOptions.map((option, index) => (
          <Typography key={index} variant="body2" color="textSecondary">
            - {option.answerText} (Weight: {option.weight})
          </Typography>
        ))}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button size="small" variant="outlined" color="primary" onClick={() => onEdit(question)}>
            <FaEdit />
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={() => onDelete(question._id)}>
            <FaTrash />
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, questionId: null });
  const [editDialog, setEditDialog] = useState({ open: false, question: null });
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswerOptions, setNewAnswerOptions] = useState([{ answerText: "", weight: 0 }]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1); // Add state for current page

  useEffect(() => {
    axios
      .get("/api/questions")
      .then((response) => {
        setQuestions(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = (id) => {
    setDeleteDialog({ open: true, questionId: id });
  };

  const confirmDelete = () => {
    const { questionId } = deleteDialog;
    axios
      .delete(`/api/questions/${questionId}`)
      .then(() => setQuestions(questions.filter((q) => q._id !== questionId)))
      .catch((err) => console.error("Error deleting question:", err));
    setDeleteDialog({ open: false, questionId: null });
  };

  const handleEdit = (question) => {
    setEditDialog({ open: true, question });
    setNewQuestion(question.questionText);
    setNewAnswerOptions(question.answerOptions);
  };

  const handleAddOption = () => {
    setNewAnswerOptions([...newAnswerOptions, { answerText: "", weight: 0 }]);
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...newAnswerOptions];
    updatedOptions[index][field] = value;
    setNewAnswerOptions(updatedOptions);
  };

  const handleAdd = () => {
    if (newQuestion.trim() === "") {
      toast.error("Question text cannot be empty!");
      return;
    }

    if (newAnswerOptions.some((option) => option.answerText.trim() === "")) {
      toast.error("All answer options must have text!");
      return;
    }

    const questionData = { questionText: newQuestion, answerOptions: newAnswerOptions };

    // If editing an existing question
    if (editDialog.question) {
      axios
        .put(`/api/questions/${editDialog.question._id}`, questionData)
        .then((response) => {
          setQuestions(questions.map((q) => (q._id === response.data._id ? response.data : q)));
          setEditDialog({ open: false, question: null });
          setNewQuestion("");
          setNewAnswerOptions([{ answerText: "", weight: 0 }]);
        })
        .catch((err) => {
          console.error("Error updating question:", err);
          toast.error("Error updating question: " + err.message);
        });
    } else {
      // Add new question
      axios
        .post("/api/questions", questionData)
        .then(() => {
          return axios.get("/api/questions"); // Gọi lại API để lấy danh sách mới
        })
        .then((response) => {
          setQuestions(response.data); // Cập nhật lại danh sách
          setEditDialog({ open: false, question: null });
          setNewQuestion("");
          setNewAnswerOptions([{ answerText: "", weight: 0 }]);
        })
        .catch((err) => {
          console.error("Error adding question:", err);
          toast.error("Error adding question: " + err.message);
        });
    }
  };

  const filteredQuestions = questions.filter((question) =>
    question?.questionText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    return sortOrder === "asc"
      ? a.questionText.localeCompare(b.questionText)
      : b.questionText.localeCompare(a.questionText);
  });

  const totalPages = Math.ceil(sortedQuestions.length / ITEMS_PER_PAGE); // Calculate total pages
  const currentQuestions = sortedQuestions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE); // Get questions for current page

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      <Sidebar />
      <Container sx={{ ml: 3, p: "24px", maxWidth: "900px" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Question Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: "20px" }}>
          <Button variant="contained" color="primary" onClick={() => setEditDialog({ open: true, question: null })}>
            Add New Question
          </Button>
          <TextField
            label="Search Questions"
            variant="outlined"
            size="small"
            sx={{ ml: 2 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="bg-gray-500 text-white px-4 py-2 rounded">
            {sortOrder === "asc" ? "Sort Z-A" : "Sort A-Z"}
          </button>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Grid container spacing={3}>
              {currentQuestions.map((question) => (
                <Grid item xs={12} sm={6} key={question._id}>
                  <QuestionCard question={question} onDelete={handleDelete} onEdit={handleEdit} />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, value) => setCurrentPage(value)}
                color="primary"
              />
            </Box>
          </>
        )}
      </Container>
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, question: null })}>
        <DialogTitle>{editDialog.question ? "Edit Question" : "Add Question"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Question Text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Typography variant="subtitle1" sx={{ mt: 3 }}>
            Answer Options
          </Typography>
          {newAnswerOptions.map((option, index) => (
            <Box key={index} sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                label={`Option ${index + 1} Text`}
                value={option.answerText}
                onChange={(e) => handleOptionChange(index, "answerText", e.target.value)}
                fullWidth
              />
              <TextField
                label={`Weight`}
                type="number"
                value={option.weight}
                onChange={(e) => handleOptionChange(index, "weight", e.target.value)}
                fullWidth
              />
            </Box>
          ))}
          <Button onClick={handleAddOption} sx={{ mt: 2 }} variant="outlined" color="primary">
            Add Answer Option
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, question: null })} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAdd} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, questionId: null })}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, questionId: null })} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Box>
  );
};

export default QuestionManagement;


