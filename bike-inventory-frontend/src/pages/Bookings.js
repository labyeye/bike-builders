import React, { useState, useEffect } from 'react';
import { Check, Close, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import '../css/Dashboard.css';

const Bookings = ({ user }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:2500/api/admin/check-auth', {
          credentials: 'include',
        });
        if (!response.ok) return navigate('/login');
        const data = await response.json();
        if (!data.isAuthenticated) return navigate('/login');
        setAuthChecked(true);
      } catch {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!authChecked) return;
    fetchBookings();
  }, [authChecked]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:2500/api/admin/bookings', {
        credentials: 'include',
      });
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:2500/api/admin/booking/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update booking');
      fetchBookings();
    } catch (error) {
      alert('Error updating booking status');
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      const response = await fetch(`http://localhost:2500/api/admin/booking/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete booking');
      fetchBookings();
    } catch (error) {
      alert('Error deleting booking');
    }
  };

  const editBooking = (booking) => {
    // You can implement a modal or redirect to an edit page
    alert('Edit booking feature coming soon!');
  };

  return (
    <div className="app-container">
      <Sidebar user={user} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Bike Bookings</h1>
        </div>
        <div className="table-body">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Bike</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, idx) => (
                <tr key={booking._id} className={idx % 2 === 0 ? 'table-row-striped' : ''}>
                  <td>{booking.name}</td>
                  <td>{booking.bikeId?.brand} {booking.bikeId?.model}</td>
                  <td>{booking.phone}</td>
                  <td>{booking.email}</td>
                  <td>{booking.paymentMethod} <br />₹{booking.amount?.toLocaleString()}</td>
                  <td>{booking.status}</td>
                  <td>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ''}</td>
                  <td>
                    <div className="action-buttons">
                      {booking.status === 'Pending' && (
                        <>
                          <button className="btn btn-success btn-sm" style={{ borderRadius: '6px' }} onClick={() => updateBookingStatus(booking._id, 'Approved')}>
                            <Check className="btn-icon" /> Approve
                          </button>
                          <button className="btn btn-error btn-sm" style={{ borderRadius: '6px' }} onClick={() => updateBookingStatus(booking._id, 'Rejected')}>
                            <Close className="btn-icon" /> Reject
                          </button>
                        </>
                      )}
                      <button className="btn btn-primary btn-sm" style={{ borderRadius: '6px' }} onClick={() => editBooking(booking)}>
                        <Edit className="btn-icon" /> Edit
                      </button>
                      <button className="btn btn-error btn-sm" style={{ borderRadius: '6px' }} onClick={() => deleteBooking(booking._id)}>
                        <Delete className="btn-icon" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
