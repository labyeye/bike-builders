import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Call,
  Check,
  Email,
  RequestQuote
} from '@mui/icons-material';
import Sidebar from '../components/Layout/Sidebar';
import '../css/Dashboard.css';

const BuyRequests = ({ user }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('https://bike-builders-1.onrender.com/api/admin/check-auth', {
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
    const fetchRequests = async () => {
      try {
        const response = await fetch('https://bike-builders-1.onrender.com/api/admin/quote-requests', {
          credentials: 'include',
        });
        const data = await response.json();
        setRequests(data.requests || []);
      } catch (error) {
        console.error('Error fetching buy requests:', error);
      }
    };
    fetchRequests();
  }, [authChecked]);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`https://bike-builders-1.onrender.com/api/admin/quote-request/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      setRequests(requests.map(request =>
        request._id === id ? { ...request, status } : request
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'contacted': return 'status-contacted';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  return (
    <div className="app-container">
      <Sidebar user={user} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Buy Requests</h1>
        </div>
        <div className="table-body">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Bike Details</th>
                <th>Budget</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, idx) => (
                <tr key={request._id} className={idx % 2 === 0 ? 'table-row-striped' : ''}>
                  <td>
                    <strong>{request.name}</strong><br />
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ''}
                  </td>
                  <td>
                    <strong>{request.brand}</strong><br />
                    {request.model || 'Any model'}, {request.year}<br />
                    {request.notes && (
                      <small>{request.notes}</small>
                    )}
                  </td>
                  <td>
                    ₹{request.budget?.toLocaleString()}
                  </td>
                  <td>
                    {request.phone}<br />
                    {request.email}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {request.status === 'Pending' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(request._id, 'Contacted')}
                          style={{ borderRadius: '6px' }}
                        >
                          <Call className="btn-icon" />
                          <span>Contacted</span>
                        </button>
                      )}
                      {request.status !== 'Completed' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateStatus(request._id, 'Completed')}
                          style={{ borderRadius: '6px' }}
                        >
                          <Check className="btn-icon" />
                          <span>Complete</span>
                        </button>
                      )}
                      <a
                        href={`mailto:${request.email}?subject=Regarding your bike quote request`}
                        className="btn btn-warning btn-sm"
                        style={{ borderRadius: '6px' }}
                      >
                        <Email className="btn-icon" />
                        <span>Email</span>
                      </a>
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

export default BuyRequests;