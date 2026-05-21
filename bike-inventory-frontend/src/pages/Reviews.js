import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Edit, Delete, Search, Star, FilterList } from "@mui/icons-material";
import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Topbar";
import "../css/Dashboard.css";

const API = process.env.REACT_APP_API_BASE || "https://backend.bikebuilders.in";

function Stars({ rating }) {
  return (
    <div style={{display:"flex",gap:2}}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} style={{fontSize:16,color: i<=rating ? "#f59e0b" : "var(--border)"}}/>
      ))}
    </div>
  );
}

export default function Reviews({ user }) {
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [editing,  setEditing]  = useState(null);

  
  const [search,     setSearch]    = useState("");
  const [minRating,  setMinRating] = useState(0);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API}/api/reviews`);
      const d = await r.json();
      setReviews(d?.success && Array.isArray(d.reviews) ? d.reviews : []);
    } catch(e) { setError("Failed to load reviews"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const r = await fetch(`${API}/api/admin/reviews/${id}`, { method:"DELETE", credentials:"include" });
      if (!r.ok) throw new Error();
      setReviews(p => p.filter(x => x._id!==id));
    } catch { setError("Failed to delete"); }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/api/admin/reviews/${editing._id}`, {
        method:"PUT", credentials:"include",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name:editing.name, message:editing.message, rating:Number(editing.rating) }),
      });
      if (!r.ok) throw new Error((await r.json()).error || "Failed");
      const d = await r.json();
      setReviews(p => p.map(x => x._id===d.review._id ? d.review : x));
      setEditing(null);
    } catch(e) { setError(e.message); }
  };

  const filtered = useMemo(() => {
    let list = [...reviews];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name?.toLowerCase().includes(q) || (r.message||r.text||"").toLowerCase().includes(q));
    }
    if (minRating > 0) list = list.filter(r => (r.rating||0) >= minRating);
    return list;
  }, [reviews, search, minRating]);

  return (
    <div className="app-bg"><div className="bg-circle-mid" /><div className="app-container">
      <Sidebar user={user || { role:"admin" }} />
      <div className="main-content">
        <Topbar user={user}/>
        <div className="content-inner">

          <div className="page-header">
            <div>
              <h1>Reviews</h1>
              <div className="page-subtitle">Manage customer reviews — edit or remove entries</div>
            </div>
          </div>

          <div className="filter-bar">
            <FilterList style={{color:"var(--text-muted)",fontSize:18,flexShrink:0}}/>
            <div className="filter-search">
              <Search/>
              <input placeholder="Search by name or message…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span className="filter-label">Min rating</span>
              {[0,1,2,3,4,5].map(n=>(
                <button key={n}
                  onClick={()=>setMinRating(n)}
                  style={{
                    padding:"4px 10px", borderRadius:"var(--radius)", fontSize:12, fontWeight:600,
                    border:"1px solid var(--border)", cursor:"pointer",
                    background: minRating===n ? "var(--primary)" : "var(--bg)",
                    color:       minRating===n ? "#fff" : "var(--text-secondary)",
                  }}
                >{n===0?"All":n+"★"}</button>
              ))}
            </div>
            <button className="filter-reset" onClick={()=>{setSearch("");setMinRating(0);}}>Reset</button>
            <span className="filter-count">{filtered.length} of {reviews.length}</span>
          </div>

          {error && <div style={{color:"var(--danger)",padding:"8px 0",fontSize:13}}>{error}</div>}

          {loading ? (
            <div className="loading">Loading reviews…</div>
          ) : (
            <div className="card">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Author</th>
                      <th>Message</th>
                      <th>Rating</th>
                      <th style={{textAlign:"center"}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan="4" style={{textAlign:"center",padding:32,color:"var(--text-muted)"}}>No reviews found</td></tr>
                    ) : filtered.map(r => (
                      <React.Fragment key={r._id}>
                        <tr>
                          <td data-label="Author"><div className="cell-main">{r.name}</div></td>
                          <td data-label="Message" style={{maxWidth:340,color:"var(--text-secondary)"}}>{r.message||r.text}</td>
                          <td data-label="Rating"><Stars rating={r.rating}/></td>
                          <td data-label="Actions">
                            <div className="action-buttons" style={{justifyContent:"center"}}>
                              <button className="btn-icon-only" onClick={()=>setEditing({...r})} title="Edit">
                                <Edit style={{fontSize:16}}/>
                              </button>
                              <button className="btn-icon-only danger" onClick={()=>handleDelete(r._id)} title="Delete">
                                <Delete style={{fontSize:16}}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {editing?._id === r._id && (
                          <tr>
                            <td colSpan="4" style={{padding:0}}>
                              <div className="edit-panel">
                                <h3>Edit Review</h3>
                                <form onSubmit={submitEdit} className="form-grid">
                                  <div className="form-group">
                                    <label>Name</label>
                                    <input className="form-control" value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})}/>
                                  </div>
                                  <div className="form-group">
                                    <label>Rating (1–5)</label>
                                    <input className="form-control" type="number" min="1" max="5" value={editing.rating} onChange={e=>setEditing({...editing,rating:e.target.value})}/>
                                  </div>
                                  <div className="form-group form-col-full">
                                    <label>Message</label>
                                    <textarea className="form-control" value={editing.message} onChange={e=>setEditing({...editing,message:e.target.value})}/>
                                  </div>
                                  <div className="form-col-full" style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                                    <button type="button" className="btn secondary" onClick={()=>setEditing(null)}>Cancel</button>
                                    <button type="submit" className="btn primary">Save</button>
                                  </div>
                                </form>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  </div>
);
}
