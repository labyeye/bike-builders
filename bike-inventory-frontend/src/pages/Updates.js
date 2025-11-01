import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import "../css/Dashboard.css";

const Updates = ({ user }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://bike-builders-1.onrender.com/api/updates");
        const data = await res.json();
        // data is expected as array
        setUpdates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load updates");
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files && e.target.files[0]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !file) return setError("Title and poster are required");
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("link", link);
      form.append("poster", file);
      const res = await fetch("https://bike-builders-1.onrender.com/api/admin/updates", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create update");
      }
      const d = await res.json();
      setUpdates((prev) => [d.update, ...prev]);
      setTitle("");
      setLink("");
      setFile(null);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this update?")) return;
    try {
      const res = await fetch(`https://bike-builders-1.onrender.com/api/admin/updates/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete update");
      setUpdates((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete");
    }
  };

  return (
    <div className="app-container">
      <Sidebar user={user || { role: "staff" }} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Updates Page</h1>
          <div className="header-actions">
            <button className="btn" onClick={() => navigate("/admin/dashboard")}>Back</button>
          </div>
        </div>

        <div className="card">
          <h2>Add Update</h2>
          {error && <div style={{ color: "#e53e3e" }}>{error}</div>}
          <form onSubmit={handleCreate} style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Link (optional)</label>
              <input value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Poster Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} required />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="submit" className="btn primary">Create</button>
            </div>
          </form>
        </div>

        <div style={{ marginTop: 18 }}>
          <h2>Existing Updates</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : updates.length === 0 ? (
            <div className="no-data">No updates yet</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {updates.map((u) => (
                <div key={u._id} className="card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img src={u.poster} alt={u.title} style={{ width: 160, height: 90, objectFit: "cover", borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0 }}>{u.title}</h3>
                    {u.link && <a href={u.link} target="_blank" rel="noreferrer">Visit</a>}
                    <div style={{ color: "#718096", fontSize: 12 }}>{new Date(u.createdAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <button className="btn" onClick={() => handleDelete(u._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Updates;
