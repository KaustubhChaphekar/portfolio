import { ImageResponse } from "next/og";
import { profile } from "@/lib/data";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 78% 42%, #2a1f5c 0%, #0b0d14 42%, #05060a 75%)",
          color: "#eef0f6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, color: "#8b91a5", letterSpacing: 4 }}>
          <div style={{ width: 40, height: 2, background: "#5ee7ff" }} />
          PORTFOLIO · NASHIK, INDIA
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>{profile.name}</div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              backgroundImage: "linear-gradient(90deg, #5ee7ff, #9b8cff 50%, #ff6fae)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {profile.role}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 24, color: "#c9cddb" }}>
          {["Next.js", "Node.js", "Razorpay", "GCP Pub/Sub", "AI agents"].map((t) => (
            <div key={t} style={{ display: "flex", padding: "8px 18px", border: "1px solid #2a2f3d", borderRadius: 999 }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
