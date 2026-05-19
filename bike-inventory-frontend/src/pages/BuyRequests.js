import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Call, Check, Email, Search, FilterList } from "@mui/icons-material";
import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Topbar";
import "../css/Dashboard.css";

const API = "https://bike-builders-backend.vercel.app";
const STATUSES = ["All","Pending","Contacted","Completed"];

export default function BuyRequests({ user }) {
  const navigate = useNavigate();
  const [requests, setRequests]   = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading]     = useState(true);

  
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("All");
  const [brand,     setBrand]     = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/api/admin/check-auth`, { credentials:"include" });
        if (!r.ok) return navigate("/login");
        const d = await r.json();
        if (!d.isAuthenticated) return navigate("/login");
        setAuthChecked(true);
      } catch { navigate("/login"); }
    })();
  }, [navigate]);

  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`${API}/api/admin/quote-requests`, { credentials:"include" });
        const d = await r.json();
        setRequests(d.requests || []);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [authChecked]);

  const updateStatus = async (id, s) => {
    try {
      const r = await fetch(`${API}/api/admin/quote-request/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        credentials:"include", body: JSON.stringify({ status: s }),
      });
      if (!r.ok) throw new Error();
      setRequests(prev => prev.map(req => req._id===id ? {...req,status:s} : req));
    } catch(e) { console.error(e); }
  };

  const allBrands = useMemo(() => ["All Brands",...new Set(requests.map(r=>r.brand).filter(Boolean))], [requests]);

  const filtered = useMemo(() => {
    let list = [...requests];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name?.toLowerCase().includes(q) || r.phone?.includes(q) || r.brand?.toLowerCase().includes(q));
    }
    if (status !== "All") list = list.filter(r => r.status === status);
    if (brand  && brand !== "All Brands") list = list.filter(r => r.brand === brand);
    if (minBudget) list = list.filter(r => (r.budget||0) >= Number(minBudget));
    if (maxBudget) list = list.filter(r => (r.budget||0) <= Number(maxBudget));
    return list;
  }, [requests, search, status, brand, minBudget, maxBudget]);

  const badgeClass = (s) => s==="Completed"?"badge-green":s==="Contacted"?"badge-blue":"badge-yellow";

  return (
    <div className="app-bg"><div className="bg-circle-mid" /><div className="app-container">
      <Sidebar user={user} />
      <div className="main-content">
        <Topbar user={user}/>
        <div className="content-inner">

          <div className="page-header">
            <div>
              <h1>Buy Requests</h1>
              <div className="page-subtitle">Customers looking to purchase a specific bike</div>
            </div>
          </div>

          <div className="filter-bar">
            <FilterList style={{color:"var(--text-muted)",fontSize:18,flexShrink:0}}/>
            <div className="filter-search">
              <Search/>
              <input placeholder="Search by name, phone, brand…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="filter-select" value={status} onChange={e=>setStatus(e.target.value)}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={brand||"All Brands"} onChange={e=>setBrand(e.target.value==="All Brands"?"":e.target.value)}>
              {allBrands.map(b=><option key={b}>{b}</option>)}
            </select>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <span className="filter-label">Budget ₹</span>
              <input className="filter-input" placeholder="Min" type="number" value={minBudget} onChange={e=>setMinBudget(e.target.value)}/>
              <span className="filter-label">–</span>
              <input className="filter-input" placeholder="Max" type="number" value={maxBudget} onChange={e=>setMaxBudget(e.target.value)}/>
            </div>
            <button className="filter-reset" onClick={()=>{setSearch("");setStatus("All");setBrand("");setMinBudget("");setMaxBudget("");}}>Reset</button>
            <span className="filter-count">{filtered.length} of {requests.length}</span>
          </div>

          {loading ? (
            <div className="loading">Loading requests…</div>
          ) : (
            <div className="card">
              <div className="table-wrap">
                <table className="data-table">
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
                    {filtered.length === 0 ? (
                      <tr><td colSpan="6" style={{textAlign:"center",padding:32,color:"var(--text-muted)"}}>No requests found</td></tr>
                    ) : filtered.map(req => (
                      <tr key={req._id}>
                        <td data-label="Customer">
                          <div className="cell-main">{req.name}</div>
                          <div className="cell-sub">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "—"}</div>
                        </td>
                        <td data-label="Bike">
                          <div className="cell-main">{req.brand}</div>
                          <div className="cell-sub">{req.model||"Any"} · {req.year||"Any year"}</div>
                          {req.notes && <div className="cell-sub" style={{color:"var(--text-secondary)"}}>{req.notes}</div>}
                        </td>
                        <td data-label="Budget"><strong>₹{req.budget?.toLocaleString()}</strong></td>
                        <td data-label="Contact">
                          <div>{req.phone}</div>
                          <div className="cell-sub">{req.email}</div>
                        </td>
                        <td data-label="Status">
                          <span className={`badge ${badgeClass(req.status)}`}>{req.status}</span>
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons">
                            {req.status === "Pending" && (
                              <button className="btn btn-sm secondary" onClick={()=>updateStatus(req._id,"Contacted")}>
                                <Call style={{fontSize:14}}/> Contacted
                              </button>
                            )}
                            {req.status !== "Completed" && (
                              <button className="btn btn-success btn-sm" onClick={()=>updateStatus(req._id,"Completed")}>
                                <Check style={{fontSize:14}}/> Complete
                              </button>
                            )}
                            <a href={`mailto:${req.email}?subject=Regarding your bike quote request`} className="btn btn-sm btn-warning">
                              <Email style={{fontSize:14}}/> Email
                            </a>
                          </div>
                        </td>
                      </tr>
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
