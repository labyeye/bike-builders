import React from "react";
import { CheckCircle, CloudUpload, Link, Storage } from "@mui/icons-material";

const STAGES = [
  { key: "uploading", label: "Uploading images", icon: CloudUpload },
  { key: "urls",      label: "Generating image URLs", icon: Link },
  { key: "saving",    label: "Saving to database", icon: Storage },
  { key: "done",      label: "All done", icon: CheckCircle },
];

function stageIndex(stage) {
  return STAGES.findIndex((s) => s.key === stage);
}

export default function UploadProgressModal({ open, stage, progress, error }) {
  if (!open) return null;

  const currentIdx = stageIndex(stage);

  return (
    <div style={backdrop}>
      <div style={shell}>
        <div style={titleStyle}>
          {error ? "Failed" : stage === "done" ? "Saved!" : "Working on it…"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 8 }}>
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const status =
              error && i === currentIdx ? "error" :
              i < currentIdx ? "done" :
              i === currentIdx ? "active" :
              "pending";

            const colors = {
              done:    { bg: "#10b981", fg: "#fff",     ring: "rgba(16,185,129,.20)" },
              active:  { bg: "#2563eb", fg: "#fff",     ring: "rgba(37,99,235,.25)"  },
              pending: { bg: "#e2e8f0", fg: "#94a3b8",  ring: "transparent"          },
              error:   { bg: "#dc2626", fg: "#fff",     ring: "rgba(220,38,38,.25)"  },
            }[status];

            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: colors.bg, color: colors.fg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 0 6px ${colors.ring}`,
                    transition: "all .25s ease",
                    flexShrink: 0,
                  }}
                >
                  {status === "active" && stage !== "done" ? (
                    <span style={spinner} />
                  ) : status === "done" ? (
                    <CheckCircle style={{ fontSize: 22 }} />
                  ) : (
                    <Icon style={{ fontSize: 20 }} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: status === "pending" ? "#94a3b8" : "#0f172a",
                  }}>
                    {s.label}
                    {status === "done" && s.key === "uploading" && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: "#10b981" }}>(100%)</span>
                    )}
                  </div>

                  {status === "active" && s.key === "uploading" && (
                    <div style={progressTrack}>
                      <div style={{ ...progressFill, width: `${Math.max(2, progress)}%` }} />
                    </div>
                  )}
                  {status === "active" && s.key === "uploading" && (
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                      {Math.round(progress)}% uploaded
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {stage === "done" && !error && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={tickWrap}>
              <CheckCircle style={{ fontSize: 56, color: "#10b981" }} />
            </div>
            <div style={{ marginTop: 8, color: "#10b981", fontWeight: 600 }}>
              Saved successfully
            </div>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: 12, padding: "10px 12px",
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 8, color: "#dc2626", fontSize: 13,
          }}>
            {error}
          </div>
        )}
      </div>

      <style>{`
        @keyframes ump-spin { to { transform: rotate(360deg) } }
        @keyframes ump-pop  { 0% { transform: scale(.5); opacity: 0 } 60% { transform: scale(1.15) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes ump-stripe { from { background-position: 0 0 } to { background-position: 28px 0 } }
      `}</style>
    </div>
  );
}

const backdrop = {
  position: "fixed", inset: 0,
  background: "rgba(15,23,42,.55)", backdropFilter: "blur(2px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 9999,
};

const shell = {
  width: "100%", maxWidth: 380,
  background: "#fff", borderRadius: 14,
  padding: 24,
  boxShadow: "0 20px 50px rgba(0,0,0,.25)",
  fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
};

const titleStyle = {
  fontSize: 17, fontWeight: 700, color: "#0f172a",
  marginBottom: 16, textAlign: "center",
};

const spinner = {
  width: 16, height: 16,
  border: "2.5px solid rgba(255,255,255,.35)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  animation: "ump-spin .7s linear infinite",
  display: "inline-block",
};

const progressTrack = {
  marginTop: 6, height: 6, borderRadius: 4,
  background: "#e2e8f0", overflow: "hidden",
};

const progressFill = {
  height: "100%",
  background: "linear-gradient(90deg, #2563eb, #3b82f6)",
  backgroundImage: "linear-gradient(45deg, rgba(255,255,255,.18) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.18) 50%, rgba(255,255,255,.18) 75%, transparent 75%), linear-gradient(90deg, #2563eb, #3b82f6)",
  backgroundSize: "28px 28px, 100% 100%",
  animation: "ump-stripe 1s linear infinite",
  transition: "width .2s ease",
  borderRadius: 4,
};

const tickWrap = {
  display: "inline-flex",
  animation: "ump-pop .45s cubic-bezier(.34,1.56,.64,1)",
};
