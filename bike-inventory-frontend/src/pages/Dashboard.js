// Dashboard.js
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
} from "@mui/icons-material";
import StatsCard from "../components/common/StatsCard";
import Sidebar from "../components/Layout/Sidebar";
import "../css/Dashboard.css"; // Assuming you have a CSS file for styling

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
          "http://localhost:2500/api/admin/check-auth",
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
        const [bikesRes, statsRes] = await Promise.all([
          fetch("http://localhost:2500/api/admin/dashboard", {
            credentials: "include",
          }),
          fetch("http://localhost:2500/api/admin/dashboard", {
            credentials: "include",
          }),
        ]);
        if (!bikesRes.ok || !statsRes.ok)
          throw new Error("Failed to fetch data");
        setBikes((await bikesRes.json()).bikes);
        setStats((await statsRes.json()).stats);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authChecked]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bike?")) return;
    try {
      await fetch(`http://localhost:2500/api/admin/bike/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setBikes((prev) => prev.filter((b) => b._id !== id));
      const statsRes = await fetch(
        "http://localhost:2500/api/admin/dashboard",
        { credentials: "include" }
      );
      setStats((await statsRes.json()).stats);
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

  if (!authChecked || loading) return <div className="loading">Loading...</div>;

  const userRole = user?.role || "staff";

  return (
    <div className="app-container">
   <Sidebar user={user || { role: 'staff' }} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Bike Inventory</h1>
          <button
            className="btn primary"
            onClick={() => navigate("/admin/bike/add")}
          >
            <Add />
            <span>Add Bike</span>
          </button>
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

        <div className="table-card">
          <div className="table-header">
            <h2>All Bikes</h2>
            <button className="btn icon-btn">
              <MoreVert />
            </button>
          </div>

          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>KM Driven</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bikes.length > 0 ? (
                  bikes.map((bike) => (
                    <tr key={bike._id}>
                      <td>{bike.brand}</td>
                      <td>{bike.model}</td>
                      <td>{bike.modelYear}</td>
                      <td>{bike.kmDriven.toLocaleString()} km</td>
                      <td>₹{bike.price.toLocaleString()}</td>
                      <td>
                        <span className={getStatusBadgeClass(bike.status)}>
                          {bike.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn action warning"
                          onClick={() =>
                            navigate(`/admin/bike/edit/${bike._id}`)
                          }
                        >
                          <Edit />
                        </button>
                        {user?.role === "admin" && (
                          <button
                            className="btn action error"
                            onClick={() => handleDelete(bike._id)}
                          >
                            <Delete />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <DirectionsBike style={{ fontSize: 48 }} />
                      <h3>No bikes found</h3>
                      <p>
                        <a href="/admin/bike/add">Add a new bike</a> to get
                        started.
                      </p>
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
