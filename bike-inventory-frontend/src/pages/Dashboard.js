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
  Image as ImageIcon,
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
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          "https://bike-builders-backend.vercel.app/api/admin/check-auth",
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

        // fetch dashboard stats, bikes list (public), and bookings in parallel
        const [dashRes, bikesRes, bookingsRes] = await Promise.all([
          fetch(
            "https://bike-builders-backend.vercel.app/api/admin/dashboard",
            { credentials: "include" }
          ),
          // Use the public bikes endpoint so the list comes from the bikes collection
          fetch("https://bike-builders-backend.vercel.app/api/bikes"),
          fetch("https://bike-builders-backend.vercel.app/api/admin/bookings", {
            credentials: "include",
          }),
        ]);

        if (!dashRes.ok) throw new Error("Failed to fetch dashboard data");
        if (!bikesRes.ok) throw new Error("Failed to fetch bikes");
        if (!bookingsRes.ok) throw new Error("Failed to fetch bookings");

        const dashData = await dashRes.json();
        const bikesData = await bikesRes.json();
        const bookingsData = await bookingsRes.json();

        // bikesData comes from the public /api/bikes endpoint
        setBikes(bikesData.bikes || []);
        setStats(
          dashData.stats || { total: 0, available: 0, comingSoon: 0, sold: 0 }
        );
        setBookingCount(
          Array.isArray(bookingsData.bookings)
            ? bookingsData.bookings.length
            : 0
        );
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
      const response = await fetch(
        `https://bike-builders-backend.vercel.app/api/admin/bike/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to delete bike");

      setBikes((prev) => prev.filter((b) => b._id !== id));
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
        available: prev.available - 1,
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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = "none";
    const parent = e.target.parentElement;
    parent.innerHTML = '<div class="no-image">No Image</div>';
  };

  if (!authChecked || loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app-container">
      <Sidebar user={user || { role: "staff" }} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Bike Inventory Overview</h1>
          <div className="header-actions">
            <div className="update-time">
              <span>
                Last update:{" "}
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
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
            title="No of Bikes"
            value={stats.total}
            icon={<DirectionsBike />}
            color="primary"
          />
          <StatsCard
            title="No of Bikes Sold"
            value={stats.sold}
            icon={<Cancel />}
            color="error"
          />
          <StatsCard
            title="No of Bikes Available"
            value={stats.available}
            icon={<CheckCircle />}
            color="success"
          />
          <StatsCard
            title="No. of Bookings"
            value={bookingCount}
            icon={<MoreVert />}
            color="warning"
          />
        </div>

        <div className="bike-table-container">
          <h2>All Bikes</h2>
          <div className="table-responsive">
            <table className="bike-table">
              <thead>
                <tr>
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
                      <td data-label="Model">{bike.model}</td>
                      <td data-label="Brand">{bike.brand}</td>
                      <td data-label="Price">{formatPrice(bike.price)}</td>
                      <td data-label="Status">
                        <span className={getStatusBadgeClass(bike.status)}>
                          {bike.status}
                        </span>
                      </td>
                      <td data-label="Stock">{bike.stock}</td>
                      <td data-label="Actions">
                        <div className="action-buttons">
                          <button
                            className="btn-icon edit"
                            onClick={() =>
                              navigate(`/admin/bike/edit/${bike._id}`)
                            }
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
