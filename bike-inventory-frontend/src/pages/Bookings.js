import React, { useState, useEffect, useMemo } from "react";
import { Check, Close, Delete, Search, FilterList } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Topbar";
import { authHeaders } from "../utils/auth";
import "../css/Dashboard.css";

const API = "https://backend.bikebuilders.in";
const STATUSES = ["All","Pending","Approved","Rejected"];

export default function Bookings({ user }) {
  const navigate = useNavigate();
  const [bookings, setBookings]   = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading]     = useState(true);

  
  const [search,    setSearch]   = useState("");
  const [status,    setStatus]   = useState("All");
  const [dateFrom,  setDateFrom] = useState("");
  const [dateTo,    setDateTo]   = useState("");

  useEffect(() => {
    if (user) { setAuthChecked(true); return; }
    (async () => {
      try {
        const r = await fetch(`${API}/api/check-auth`, { headers: authHeaders() });
        if (!r.ok) return navigate("/login");
        const d = await r.json();
        if (!d.isAuthenticated) return navigate("/login");
        setAuthChecked(true);
      } catch {
        try {
          const stored = localStorage.getItem("bb_user");
          if (stored && JSON.parse(stored)) { setAuthChecked(true); return; }
        } catch(e) {}
        navigate("/login");
      }
    })();
  }, [navigate, user]);

  useEffect(() => {
    if (!authChecked) return;
    fetchBookings();
  }, [authChecked]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API}/api/bookings`, {
        headers: { ...authHeaders(), "Accept": "application/json" },
      });
      const d = await r.json();
      setBookings(d.bookings || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, s) => {
    try {
      const r = await fetch(`${API}/api/booking/${id}`, {
        method:"PUT",
        headers:{ ...authHeaders(), "Content-Type":"application/json" },
        body: JSON.stringify({ status: s }),
      });
      if (!r.ok) throw new Error();
      fetchBookings();
    } catch { alert("Error updating booking"); }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await fetch(`${API}/api/booking/${id}`, { method:"DELETE", headers: authHeaders() });
      fetchBookings();
    } catch { alert("Error deleting booking"); }
  };

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b => b.name?.toLowerCase().includes(q) || b.phone?.includes(q) || b.email?.toLowerCase().includes(q));
    }
    if (status !== "All") list = list.filter(b => b.status === status);
    if (dateFrom) list = list.filter(b => new Date(b.createdAt) >= new Date(dateFrom));
    if (dateTo)   list = list.filter(b => new Date(b.createdAt) <= new Date(dateTo + "T23:59:59"));
    return list;
  }, [bookings, search, status, dateFrom, dateTo]);

  const badgeClass = (s) => s==="Approved"?"badge-green":s==="Rejected"?"badge-red":"badge-yellow";

  return (
    <div className="app-bg"><div className="bg-circle-mid" /><div className="app-container">
      <Sidebar user={user} />
      <div className="main-content">
        <Topbar user={user}/>
        <div className="content-inner">

          <div className="page-header">
            <div>
              <h1>Bookings</h1>
              <div className="page-subtitle">Manage test-ride and purchase bookings</div>
            </div>
          </div>

          <div className="filter-bar">
            <FilterList style={{color:"var(--text-muted)",fontSize:18,flexShrink:0}}/>
            <div className="filter-search">
              <Search/>
              <input placeholder="Search by name, phone, email…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="filter-select" value={status} onChange={e=>setStatus(e.target.value)}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span className="filter-label">From</span>
              <input type="date" className="filter-input" style={{width:140}} value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
              <span className="filter-label">To</span>
              <input type="date" className="filter-input" style={{width:140}} value={dateTo}   onChange={e=>setDateTo(e.target.value)}/>
            </div>
            <button className="filter-reset" onClick={()=>{setSearch("");setStatus("All");setDateFrom("");setDateTo("");}}>Reset</button>
            <span className="filter-count">{filtered.length} of {bookings.length}</span>
          </div>

          {loading ? (
            <div className="loading">Loading bookings…</div>
          ) : (
            <div className="card">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Bike</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan="8" style={{textAlign:"center",padding:32,color:"var(--text-muted)"}}>No bookings found</td></tr>
                    ) : filtered.map(b => (
                      <tr key={b._id}>
                        <td data-label="Customer"><div className="cell-main">{b.name}</div></td>
                        <td data-label="Bike">{b.bikeId?.brand} {b.bikeId?.model}</td>
                        <td data-label="Phone">{b.phone}</td>
                        <td data-label="Email" style={{fontSize:12}}>{b.email}</td>
                        <td data-label="Payment">
                          <div>{b.paymentMethod}</div>
                          <div className="cell-sub">₹{b.amount?.toLocaleString()}</div>
                        </td>
                        <td data-label="Status">
                          <span className={`badge ${badgeClass(b.status)}`}>{b.status}</span>
                        </td>
                        <td data-label="Date">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}</td>
                        <td data-label="Actions">
                          <div className="action-buttons">
                            {b.status === "Pending" && (
                              <>
                                <button className="btn btn-success btn-sm" onClick={()=>updateStatus(b._id,"Approved")}>
                                  <Check style={{fontSize:14}}/> Approve
                                </button>
                                <button className="btn btn-error btn-sm" onClick={()=>updateStatus(b._id,"Rejected")}>
                                  <Close style={{fontSize:14}}/> Reject
                                </button>
                              </>
                            )}
                            <button className="btn-icon-only danger" onClick={()=>deleteBooking(b._id)} title="Delete">
                              <Delete style={{fontSize:16}}/>
                            </button>
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
