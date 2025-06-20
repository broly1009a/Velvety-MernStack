import React, { useState, useEffect } from 'react';
import client from '../../botpressConfig';
import ManagerSidebar from '../../components/ManagerSidebar';
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

// Regex nhận diện nhiều trường hợp đặt lịch thành công
const bookingSuccessRegex = /(confirm(ed|ation)?|successfully booked|has been booked|appointment is booked|booking is successful|has been scheduled|look forward to seeing you|đặt lịch thành công|đã được đặt|cảm ơn bạn đã đặt lịch)/i;

const BotpressData = () => {
  const [allRows, setAllRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [date, setDate] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [keyword, setKeyword] = useState('');

  // Fetch data function (tách riêng để dùng lại khi refresh)
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

      // Lọc các record có message cuối chứa các từ khóa thành công
      const confirmed = rows.filter(row => {
        const lastMsg = row.transcript?.[row.transcript.length - 1]?.preview || '';
        return bookingSuccessRegex.test(lastMsg);
      });

      setAllRows(confirmed);
      setFilteredRows(confirmed);
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

  // Filter handler
  const handleFilter = (e) => {
    e.preventDefault();
    let result = [...allRows];
    if (date) {
      result = result.filter(row => row.updatedAt && row.updatedAt.startsWith(date));
    }
    if (sentiment) {
      result = result.filter(row => row.sentiment === sentiment);
    }
    if (keyword) {
      result = result.filter(row => row.summary && row.summary.toLowerCase().includes(keyword.toLowerCase()));
    }
    setFilteredRows(result);
    setCurrentPage(1); // Reset về trang đầu khi filter
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Nút refresh
  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="flex min-h-screen bg-[#f4f4f4]">
      <ManagerSidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#C86C79' }}>
            Confirmed Bookings (Botpress)
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
            No confirmed bookings found.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F9FAEF' }}>
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
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>{new Date(row.updatedAt).toLocaleString()}</TableCell>
                        <TableCell>{Array.isArray(row.topics) ? row.topics.join(', ') : ''}</TableCell>
                        <TableCell>{row.summary}</TableCell>
                        <TableCell>{row.sentiment}</TableCell>
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