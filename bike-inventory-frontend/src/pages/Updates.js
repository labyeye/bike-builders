import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import "../css/Dashboard.css";

const Updates = ({ user }) => {
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE || "https://bike-builders-1.onrender.com";
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
        const res = await fetch(`${API_BASE}/api/updates`);
        const data = await res.json();
        // data is expected as array
        const list = Array.isArray(data) ? data : [];
        // normalize poster urls
        const normalized = list.map((u) => ({
          ...u,
          poster: normalizeImageUrl(u.poster),
        }));
        setUpdates(normalized);
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
      const res = await fetch(`${API_BASE}/api/admin/updates`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create update");
      }
      const d = await res.json();
      const newUpdate = { ...d.update, poster: normalizeImageUrl(d.update.poster) };
      setUpdates((prev) => [newUpdate, ...prev]);
      setTitle("");
      setLink("");
      setFile(null);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Normalize image/poster URLs to absolute paths using API base.
  function normalizeImageUrl(url) {
    if (!url) return url || "";
    if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("//")) return url;
    if (url.startsWith("/")) return API_BASE + url;
    return API_BASE + "/" + url;
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this update?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/updates/${id}`, {
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
          <div className="dashboard-title">
            <h1>Updates</h1>
            <div className="dashboard-subtitle">Create and manage site updates, offers and announcements.</div>
          </div>
          <div className="header-actions">
            <button className="btn" onClick={() => navigate("/admin/dashboard")}>Back</button>
          </div>
        </div>

        <div className="updates-layout">
          <aside className="update-form-card card">
            <h3 style={{ marginTop: 0 }}>Create Update</h3>
            {error && <div style={{ color: "#e53e3e", marginBottom: 8 }}>{error}</div>}
            <form onSubmit={handleCreate} className="update-form">
              <label>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short headline" required />

              <label>Link (optional)</label>
              <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://example.com" />

              <label>Poster Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} required />

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="submit" className="btn primary">Create</button>
              </div>
            </form>
          </aside>

          <section className="updates-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Existing Updates</h2>
            </div>

            {loading ? (
              <div className="loading">Loading...</div>
            ) : updates.length === 0 ? (
              <div className="no-data">No updates yet — create the first announcement.</div>
            ) : (
              <div className="updates-cards-grid">
                {updates.map((u) => (
                  <div key={u._id} className="update-card card">
                    <div className="update-media">
                      <img src={u.poster} alt={u.title} />
                    </div>
                    <div className="update-body">
                      <div className="update-meta">
                        <div className="update-date">{new Date(u.createdAt).toLocaleDateString()}</div>
                      </div>
                      <h3 className="update-title">{u.title}</h3>
                      {u.link && <a href={u.link} target="_blank" rel="noreferrer" className="update-link">Visit</a>}
                    </div>
                    <div className="update-actions">
                      <button className="btn" onClick={() => handleDelete(u._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Updates;
