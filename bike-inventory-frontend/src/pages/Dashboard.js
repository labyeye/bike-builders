import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DirectionsBike,
  CheckCircle,
  Cancel,
  Add,
  Edit,
  Delete,
  MoreVert,
  Image as ImageIcon
} from "@mui/icons-material";
import StatsCard from "../components/common/StatsCard";
import Sidebar from "../components/Layout/Sidebar";
import "../css/Dashboard.css";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [bikes, setBikes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    comingSoon: 0,
    sold: 0,
  });
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          "https://bike-builders-1.onrender.com/api/admin/check-auth",
          {
            credentials: "include",
          }
        );
        if (!response.ok) return navigate("/login");
        const data = await response.json();
        if (!data.isAuthenticated) return navigate("/login");
        setAuthChecked(true);
      } catch {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!authChecked) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://bike-builders-1.onrender.com/api/admin/dashboard", {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const data = await response.json();
        
        setBikes(data.bikes);
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [authChecked]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bike?")) return;
    try {
      const response = await fetch(`https://bike-builders-1.onrender.com/api/admin/bike/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to delete bike");
      
      setBikes((prev) => prev.filter((b) => b._id !== id));
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        available: prev.available - 1
      }));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Available":
        return "badge badge-green";
      case "Coming Soon":
        return "badge badge-yellow";
      case "Sold Out":
        return "badge badge-red";
      default:
        return "badge";
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    parent.innerHTML = '<div class="no-image"><ImageIcon /></div>';
  };

  if (!authChecked || loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app-container">
      <Sidebar user={user || { role: 'staff' }} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Bike Inventory Overview</h1>
          <div className="header-actions">
            <div className="update-time">
              <span>Last update: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <button
              className="btn primary"
              onClick={() => navigate("/admin/bike/add")}
            >
              <Add />
              <span>Add Bike</span>
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <StatsCard
            title="Total Bikes"
            value={stats.total}
            icon={<DirectionsBike />}
            color="primary"
          />
          <StatsCard
            title="Available"
            value={stats.available}
            icon={<CheckCircle />}
            color="success"
          />
          <StatsCard
            title="Coming Soon"
            value={stats.comingSoon}
            icon={<MoreVert />}
            color="warning"
          />
          <StatsCard
            title="Sold"
            value={stats.sold}
            icon={<Cancel />}
            color="error"
          />
        </div>

        <div className="bike-table-container">
          <h2>All Bikes</h2>
          <div className="table-responsive">
            <table className="bike-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Model</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bikes.length > 0 ? (
                  bikes.map((bike) => (
                    <tr key={bike._id}>
                      <td>
                        {bike.images && bike.images.length > 0 ? (
                          <img 
                            src={bike.images[0]} 
                            alt={bike.model} 
                            className="bike-thumbnail"
                            onError={handleImageError}
                          />
                        ) : (
                          <div className="no-image"><ImageIcon /></div>
                        )}
                      </td>
                      <td>{bike.model}</td>
                      <td>{bike.brand}</td>
                      <td>{formatPrice(bike.price)}</td>
                      <td>
                        <span className={getStatusBadgeClass(bike.status)}>
                          {bike.status}
                        </span>
                      </td>
                      <td>{bike.stock}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon edit"
                            onClick={() => navigate(`/admin/bike/edit/${bike._id}`)}
                          >
                            <Edit />
                          </button>
                          <button 
                            className="btn-icon delete"
                            onClick={() => handleDelete(bike._id)}
                          >
                            <Delete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No bikes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;