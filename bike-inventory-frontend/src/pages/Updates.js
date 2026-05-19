import React, { useState, useEffect, useCallback } from "react";
import { Add, Delete, Link, Search } from "@mui/icons-material";
import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Topbar";
import "../css/Dashboard.css";

const API = process.env.REACT_APP_API_BASE || "https://bike-builders-backend.vercel.app";

export default function Updates({ user }) {
  const [title,   setTitle]   = useState("");
  const [link,    setLink]    = useState("");
  const [file,    setFile]    = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");

  const normalize = useCallback(url => {
    if (!url) return "";
    if (/^https?:\/\
    return API + (url.startsWith("/") ? url : "/" + url);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`${API}/api/updates`);
        const d = await r.json();
        setUpdates((Array.isArray(d) ? d : []).map(u => ({...u, poster: normalize(u.poster)})));
      } catch { setError("Failed to load updates"); }
      finally { setLoading(false); }
    })();
  }, [normalize]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !file) return setError("Title and poster image are required");
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("link",  link);
      form.append("poster", file);
      const r = await fetch(`${API}/api/admin/updates`, { method:"POST", credentials:"include", body:form });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || "Failed"); }
      const d = await r.json();
      setUpdates(p => [{ ...d.update, poster: normalize(d.update.poster) }, ...p]);
      setTitle(""); setLink(""); setFile(null); setError(null);
    } catch(e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this update?")) return;
    try {
      const r = await fetch(`${API}/api/admin/updates/${id}`, { method:"DELETE", credentials:"include" });
      if (!r.ok) throw new Error();
      setUpdates(p => p.filter(u => u._id!==id));
    } catch { setError("Failed to delete"); }
  };

  const filtered = updates.filter(u => !search || u.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="app-bg"><div className="bg-circle-mid" /><div className="app-container">
      <Sidebar user={user || { role:"staff" }} />
      <div className="main-content">
        <Topbar user={user}/>
        <div className="content-inner">

          <div className="page-header">
            <div>
              <h1>Updates</h1>
              <div className="page-subtitle">Create and manage site announcements and offers</div>
            </div>
          </div>

          <div className="updates-layout">
            {}
            <aside className="update-form-sidebar">
              <h3><Add style={{fontSize:18,verticalAlign:"middle",marginRight:4}}/>New Update</h3>
              {error && <div style={{color:"var(--danger)",fontSize:12,marginBottom:10}}>{error}</div>}
              <form onSubmit={handleCreate} style={{display:"flex",flexDirection:"column",gap:12}}>
                <div className="form-group">
                  <label>Title <span style={{color:"var(--danger)"}}>*</span></label>
                  <input className="form-control" placeholder="Short headline" value={title} onChange={e=>setTitle(e.target.value)} required/>
                </div>
                <div className="form-group">
                  <label>Link (optional)</label>
                  <div className="input-group">
                    <input className="form-control" placeholder="https://…" value={link} onChange={e=>setLink(e.target.value)}/>
                    <div className="input-addon"><Link style={{fontSize:16}}/></div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Poster Image <span style={{color:"var(--danger)"}}>*</span></label>
                  <div
                    className="image-upload-box"
                    onClick={()=>document.getElementById("poster-input").click()}
                  >
                    <input id="poster-input" type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)}/>
                    {file
                      ? <p style={{color:"var(--primary)",fontWeight:600}}>{file.name}</p>
                      : <><div style={{fontSize:24,color:"var(--text-muted)"}}>📁</div><p>Click to upload image</p></>
                    }
                  </div>
                </div>
                <button type="submit" className="btn primary" style={{width:"100%",justifyContent:"center"}}>
                  <Add style={{fontSize:18}}/> Create Update
                </button>
              </form>
            </aside>

            {}
            <section>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <div className="filter-search" style={{flex:1}}>
                  <Search/>
                  <input placeholder="Search updates…" value={search} onChange={e=>setSearch(e.target.value)}/>
                </div>
                <span className="filter-count">{filtered.length} update{filtered.length!==1?"s":""}</span>
              </div>

              {loading ? (
                <div className="loading">Loading updates…</div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <p>No updates yet</p>
                  <span>Create the first announcement using the form</span>
                </div>
              ) : (
                <div className="updates-grid">
                  {filtered.map(u => (
                    <div key={u._id} className="update-card">
                      <img src={u.poster} alt={u.title} className="update-card-img"/>
                      <div className="update-card-body">
                        <div className="update-card-date">{new Date(u.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                        <div className="update-card-title">{u.title}</div>
                        {u.link && <a href={u.link} target="_blank" rel="noreferrer" className="update-card-link">Visit link ↗</a>}
                      </div>
                      <div className="update-card-footer">
                        <button className="btn btn-error btn-sm" onClick={()=>handleDelete(u._id)}>
                          <Delete style={{fontSize:14}}/> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

        </div>
      </div>
    </div>
  </div>
);
}
