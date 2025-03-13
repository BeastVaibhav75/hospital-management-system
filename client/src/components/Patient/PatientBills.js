import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { format } from 'date-fns';

function PatientBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.id) {
          throw new Error('User information not found');
        }

        const response = await axios.get(
          `http://localhost:5000/api/patients/${userInfo.id}/bills`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        // Sort bills by date (most recent first)
        const sortedBills = response.data.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );

        setBills(sortedBills);
        setError(null);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setError('Failed to load bills');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const formatDate = (date) => {
    return format(new Date(date), 'PPP');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const handlePaymentClick = (bill) => {
    setSelectedBill(bill);
    setPaymentDialogOpen(true);
  };

  const handlePaymentClose = () => {
    setPaymentDialogOpen(false);
    setSelectedBill(null);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedBill) return;

    setPaymentLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/bills/${selectedBill._id}/pay`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the local state
      setBills(bills.map(bill => 
        bill._id === selectedBill._id 
          ? { ...bill, status: 'paid', paidAt: new Date() }
          : bill
      ));

      handlePaymentClose();
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Failed to process payment. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          My Bills
        </Typography>

        {bills.length === 0 ? (
          <Alert severity="info">You have no bills.</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill._id}>
                    <TableCell>{formatDate(bill.date)}</TableCell>
                    <TableCell>{bill.description}</TableCell>
                    <TableCell>{formatCurrency(bill.amount)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={bill.status} 
                        color={getStatusColor(bill.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {bill.status !== 'paid' && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handlePaymentClick(bill)}
                        >
                          Pay Now
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Payment Confirmation Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handlePaymentClose}
        aria-labelledby="payment-dialog-title"
      >
        <DialogTitle id="payment-dialog-title">
          Confirm Payment
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to pay {selectedBill && formatCurrency(selectedBill.amount)} for {selectedBill?.description}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentClose} disabled={paymentLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handlePaymentConfirm} 
            color="primary" 
            variant="contained"
            disabled={paymentLoading}
          >
            {paymentLoading ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PatientBills; 