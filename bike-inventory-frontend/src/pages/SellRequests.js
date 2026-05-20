import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Close, Search, FilterList } from "@mui/icons-material";
import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Topbar";
import "../css/Dashboard.css";

const API = "https://bike-builders-backend.vercel.app";
const STATUSES = ["All","Pending","Approved","Rejected"];

export default function SellRequests({ user }) {
  const navigate = useNavigate();
  const [requests, setRequests]       = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading]         = useState(true);

  
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("All");
  const [brand,     setBrand]     = useState("");
  const [minPrice,  setMinPrice]  = useState("");
  const [maxPrice,  setMaxPrice]  = useState("");

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
        const r = await fetch(`${API}/api/admin/sell-requests`, { credentials:"include" });
        const d = await r.json();
        setRequests(d.requests || []);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [authChecked]);

  const updateStatus = async (id, s) => {
    try {
      const r = await fetch(`${API}/api/sell-requests/${id}/status`, {
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
      list = list.filter(r => r.brand?.toLowerCase().includes(q) || r.model?.toLowerCase().includes(q) || r.sellerName?.toLowerCase().includes(q) || r.sellerPhone?.includes(q));
    }
    if (status !== "All") list = list.filter(r => r.status === status);
    if (brand && brand !== "All Brands") list = list.filter(r => r.brand === brand);
    if (minPrice) list = list.filter(r => (r.expectedPrice||0) >= Number(minPrice));
    if (maxPrice) list = list.filter(r => (r.expectedPrice||0) <= Number(maxPrice));
    return list;
  }, [requests, search, status, brand, minPrice, maxPrice]);

  const badgeClass = (s) => s==="Approved"?"badge-green":s==="Rejected"?"badge-red":"badge-yellow";

  return (
    <div className="app-bg"><div className="bg-circle-mid" /><div className="app-container">
      <Sidebar user={user} />
      <div className="main-content">
        <Topbar user={user}/>
        <div className="content-inner">

          <div className="page-header">
            <div>
              <h1>Sell Requests</h1>
              <div className="page-subtitle">Customers who want to sell their bike</div>
            </div>
          </div>

          <div className="filter-bar">
            <FilterList style={{color:"var(--text-muted)",fontSize:18,flexShrink:0}}/>
            <div className="filter-search">
              <Search/>
              <input placeholder="Search brand, model, seller…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="filter-select" value={status} onChange={e=>setStatus(e.target.value)}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={brand||"All Brands"} onChange={e=>setBrand(e.target.value==="All Brands"?"":e.target.value)}>
              {allBrands.map(b=><option key={b}>{b}</option>)}
            </select>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <span className="filter-label">Price ₹</span>
              <input className="filter-input" placeholder="Min" type="number" value={minPrice} onChange={e=>setMinPrice(e.target.value)}/>
              <span className="filter-label">–</span>
              <input className="filter-input" placeholder="Max" type="number" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}/>
            </div>
            <button className="filter-reset" onClick={()=>{setSearch("");setStatus("All");setBrand("");setMinPrice("");setMaxPrice("");}}>Reset</button>
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
                      <th>Bike</th>
                      <th>Seller</th>
                      <th>Expected Price</th>
                      <th>Images</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan="6" style={{textAlign:"center",padding:32,color:"var(--text-muted)"}}>No sell requests found</td></tr>
                    ) : filtered.map(req => (
                      <tr key={req._id}>
                        <td data-label="Bike">
                          <div className="cell-main">{req.brand} {req.model}</div>
                        </td>
                        <td data-label="Seller">
                          <div className="cell-main">{req.sellerName}</div>
                          <div className="cell-sub">{req.sellerPhone}</div>
                          <div className="cell-sub">{req.sellerEmail}</div>
                        </td>
                        <td data-label="Price"><strong>₹{req.expectedPrice?.toLocaleString()}</strong></td>
                        <td data-label="Images">
                          {req.images?.length > 0 ? (
                            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                              {req.images.slice(0,3).map((img,i) => {
                                const src = /^https?:\/\//i.test(img) ? img : `${API}/uploads/${img}`;
                                return (
                                  <img key={i} src={src} alt={`img-${i}`}
                                    style={{width:44,height:36,objectFit:"cover",borderRadius:4,border:"1px solid var(--border)",cursor:"pointer"}}
                                    onClick={()=>window.open(src,"_blank")}
                                  />
                                );
                              })}
                              {req.images.length > 3 && <span style={{fontSize:11,color:"var(--text-muted)",alignSelf:"center"}}>+{req.images.length-3}</span>}
                            </div>
                          ) : <span style={{color:"var(--text-muted)",fontSize:12}}>No images</span>}
                        </td>
                        <td data-label="Status">
                          <span className={`badge ${badgeClass(req.status)}`}>{req.status}</span>
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons">
                            {req.status === "Pending" && (
                              <>
                                <button className="btn btn-success btn-sm" onClick={()=>updateStatus(req._id,"Approved")}>
                                  <Check style={{fontSize:14}}/> Approve
                                </button>
                                <button className="btn btn-error btn-sm" onClick={()=>updateStatus(req._id,"Rejected")}>
                                  <Close style={{fontSize:14}}/> Reject
                                </button>
                              </>
                            )}
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
