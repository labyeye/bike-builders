import React, { useState, useEffect } from 'react';
import {
  Call,
  Check,
  Email,
  RequestQuote
} from '@mui/icons-material';

const BuyRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/quote-requests');
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching buy requests:', error);
      }
    };
    
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/quote-requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
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
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'contacted': return 'status-contacted';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <h1 className="table-title">Buy Requests</h1>
      </div>
      
      <div className="table-body">
        <table>
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
            {requests.map(request => (
              <tr key={request._id}>
                <td>
                  <strong>{request.name}</strong><br />
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <strong>{request.brand}</strong><br />
                  {request.model || 'Any model'}, {request.year}<br />
                  {request.notes && (
                    <small>{request.notes}</small>
                  )}
                </td>
                <td>
                  ₹{request.budget.toLocaleString()}
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
                      >
                        <Call className="btn-icon" />
                        <span>Contacted</span>
                      </button>
                    )}
                    {request.status !== 'Completed' && (
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => updateStatus(request._id, 'Completed')}
                      >
                        <Check className="btn-icon" />
                        <span>Complete</span>
                      </button>
                    )}
                    <a 
                      href={`mailto:${request.email}?subject=Regarding your bike quote request`} 
                      className="btn btn-warning btn-sm"
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
  );
};

export default BuyRequests;