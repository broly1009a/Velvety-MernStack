import React, { useState, useEffect } from 'react';
import client from '../../botpressConfig';
import StaffSidebar from '../../components/StaffSidebar';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, CircularProgress, TextField, MenuItem, Button, Pagination, IconButton, Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const sentimentOptions = [
  { value: '', label: 'All' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
];

const ROWS_PER_PAGE = 10;

// Hàm lấy summary từ transcript nếu summary bị null
const getSummaryFromTranscript = (transcript) => {
  if (!Array.isArray(transcript)) return "";
  const botMsgs = transcript.filter(msg => msg.sender === "bot").reverse();
  const regexArr = [
    /(has been (successfully )?booked|has been confirmed|has been scheduled|booking is successful|successfully booked|look forward to seeing you|appointment.*has been (successfully )?booked)/i,
    /(couldn[’']?t confirm|not available|would you like me to check|I couldn[’']?t confirm)/i,
    /(thank you|we look forward|feel free to let me know)/i
  ];
  for (const regex of regexArr) {
    const found = botMsgs.find(msg => regex.test(msg.preview));
    if (found) return found.preview;
  }
  return botMsgs[0]?.preview || "";
};

// Hàm lấy sentiment từ transcript nếu sentiment bị null
const getSentimentFromTranscript = (transcript) => {
  if (!Array.isArray(transcript)) return "N/A";
  const botMsgs = transcript.filter(msg => msg.sender === "bot").reverse();
  if (botMsgs.some(msg => /successfully|confirmed|look forward|thank you|happy|great|wonderful|glad/i.test(msg.preview))) {
    return "positive";
  }
  if (botMsgs.some(msg => /couldn[’']?t|not available|unfortunately|sorry|fail|unable|problem|issue/i.test(msg.preview))) {
    return "negative";
  }
  if (botMsgs.some(msg => /please confirm|could you|would you|let me know|need more information|waiting/i.test(msg.preview))) {
    return "neutral";
  }
  return "N/A";
};

// Hàm lấy topics từ transcript nếu topics bị null hoặc rỗng
const getTopicsFromTranscript = (transcript) => {
  if (!Array.isArray(transcript)) return ["N/A"];
  // Lấy các message của user
  const userMsgs = transcript.filter(msg => msg.sender === "user");
  // Regex các từ khóa dịch vụ phổ biến
  const serviceRegex = /(booking|service|facial|massage|treatment|appointment|consultant|pro|skin|hydrat|bright|dermaplaning)/i;
  // Tìm message user chứa từ khóa
  const found = userMsgs.find(msg => serviceRegex.test(msg.preview));
  if (found) {
    // Lấy tất cả từ khóa khớp trong message
    const matches = found.preview.match(new RegExp(serviceRegex, "gi"));
    if (matches && matches.length > 0) return matches.map(m => m.trim());
    return [found.preview];
  }
  // Nếu không có, lấy message đầu tiên của user
  if (userMsgs.length > 0) return [userMsgs[0].preview];
  return ["N/A"];
};

const BotpressData = () => {
  const [allRows, setAllRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [date, setDate] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [keyword, setKeyword] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { rows } = await client.findTableRows({
        table: 'Int_Connor_Conversations_Table',
        limit: 50,
        offset: 0,
        filter: {},
        orderBy: 'row_id',
        orderDirection: 'asc'
      });
      setAllRows(rows);
      setFilteredRows(rows);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching Botpress data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    let result = [...allRows];
    if (date) {
      result = result.filter(row => row.updatedAt && row.updatedAt.startsWith(date));
    }
    if (sentiment) {
      result = result.filter(row => {
        const sentimentValue = row.sentiment || getSentimentFromTranscript(row.transcript);
        return sentimentValue === sentiment;
      });
    }
    if (keyword) {
      result = result.filter(row => {
        const summary = row.summary || getSummaryFromTranscript(row.transcript);
        return summary && summary.toLowerCase().includes(keyword.toLowerCase());
      });
    }
    setFilteredRows(result);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="flex min-h-screen bg-[#f4f4f4]">
       <StaffSidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#C86C79' }}>
            All Conversations (Chatbot Argent AI)
          </Typography>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} color="primary" sx={{ ml: 2 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </div>

        {/* Bộ lọc */}
        <form className="flex gap-4 mb-6" onSubmit={handleFilter}>
          <TextField
            label="Date"
            type="date"
            size="small"
            value={date}
            onChange={e => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Sentiment"
            size="small"
            value={sentiment}
            onChange={e => setSentiment(e.target.value)}
            style={{ minWidth: 120 }}
          >
            {sentimentOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Keyword in Summary"
            size="small"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <Button type="submit" variant="contained" sx={{ background: "#C86C79" }}>
            Filter
          </Button>
        </form>

        {loading ? (
          <Box className="flex justify-center items-center h-64">
            <CircularProgress />
          </Box>
        ) : paginatedRows.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No conversations found.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F9FAEF' }}>
                    <TableCell><b>ID</b></TableCell>
                    <TableCell><b>Time</b></TableCell>
                    <TableCell><b>Topics</b></TableCell>
                    <TableCell><b>Summary</b></TableCell>
                    <TableCell><b>Sentiment</b></TableCell>
                    <TableCell><b>Last Message</b></TableCell>
                    <TableCell><b>Conversation ID</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.map((row) => {
                    const lastMsg = row.transcript?.[row.transcript.length - 1]?.preview || '';
                    const summary = row.summary || getSummaryFromTranscript(row.transcript);
                    const sentimentValue = row.sentiment || getSentimentFromTranscript(row.transcript);
                    const topicsValue = (Array.isArray(row.topics) && row.topics.length > 0)
                      ? row.topics.join(', ')
                      : getTopicsFromTranscript(row.transcript).join(', ');
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{new Date(row.updatedAt).toLocaleString()}</TableCell>
                        <TableCell>{topicsValue}</TableCell>
                        <TableCell>{summary}</TableCell>
                        <TableCell>{sentimentValue}</TableCell>
                        <TableCell>{lastMsg}</TableCell>
                        <TableCell>{row.conversationId}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box className="flex justify-center mt-6">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
            </Box>
          </>
        )}
      </div>
    </div>
  );
};

export default BotpressData;