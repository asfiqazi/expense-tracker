import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { axiosInstance } from '../lib/axios';
import { ExpenseAnalytics } from '../types';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        
        const response = await axiosInstance.get('/expenses/analytics', {
          params: {
            startDate: startDate.toISOString(),
            endDate: new Date().toISOString(),
          },
        });
        
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return <Typography>Error loading analytics</Typography>;
  }

  const lineChartData = {
    labels: Object.keys(analytics.expensesByMonth).map(month => 
      format(new Date(month), 'MMM yyyy')
    ),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: Object.values(analytics.expensesByMonth),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(analytics.expensesByCategory),
    datasets: [
      {
        data: Object.values(analytics.expensesByCategory),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4">
                ${analytics.totalExpenses.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Expenses Trend
            </Typography>
            <Line data={lineChartData} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <Pie data={pieChartData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
