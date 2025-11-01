import React, { useEffect, useState } from "react";
import Sidebar from "../components/Layout/Sidebar";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";

const Reviews = ({ user }) => {
  const API_BASE = process.env.REACT_APP_API_BASE || "https://bike-builders-backend.vercel.app";
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // review object being edited
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/reviews`);
      const data = await res.json();
      const list = data && data.success && Array.isArray(data.reviews) ? data.reviews : [];
      setReviews(list);
    } catch (err) {
      console.error(err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setReviews((r) => r.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete review");
    }
  };

  const openEdit = (rev) => {
    setEditing({ ...rev });
  };

  const cancelEdit = () => setEditing(null);

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews/${editing._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editing.name, message: editing.message, rating: Number(editing.rating) }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update");
      }
      const d = await res.json();
      setReviews((prev) => prev.map((r) => (r._id === d.review._id ? d.review : r)));
      setEditing(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update review");
    }
  };

  return (
    <div className="app-container">
      <Sidebar user={user || { role: "admin" }} />
      <div className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Reviews</h1>
            <div className="dashboard-subtitle">Manage customer reviews — edit or remove inappropriate entries.</div>
          </div>
          <div className="header-actions">
            <button className="btn" onClick={() => navigate('/admin/dashboard')}>Back</button>
          </div>
        </div>

        <div style={{ padding: 12 }}>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : reviews.length === 0 ? (
            <div className="no-data">No reviews yet.</div>
          ) : (
            <div className="card">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Author</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Message</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Rating</th>
                    <th style={{ padding: 8 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r._id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: 8 }}>{r.name}</td>
                      <td style={{ padding: 8 }}>{r.message || r.text}</td>
                      <td style={{ padding: 8 }}>{r.rating}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        <button className="btn" onClick={() => openEdit(r)} style={{ marginRight: 8 }}>Edit</button>
                        <button className="btn" onClick={() => handleDelete(r._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {editing && (
            <div className="card" style={{ marginTop: 12 }}>
              <h3>Edit Review</h3>
              {error && <div style={{ color: '#e53e3e' }}>{error}</div>}
              <form onSubmit={submitEdit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label>Name</label>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                <label>Message</label>
                <textarea value={editing.message} onChange={(e) => setEditing({ ...editing, message: e.target.value })} />
                <label>Rating</label>
                <input type="number" min="1" max="5" value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: e.target.value })} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>
                  <button type="submit" className="btn primary">Save</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
