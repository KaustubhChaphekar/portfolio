import { ImageResponse } from "next/og";
import { profile } from "@/lib/data";
import { ogPhoto } from "@/lib/og-photo";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photo = await ogPhoto();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(circle at 82% 45%, #2a1f5c 0%, #0b0d14 45%, #05060a 78%)",
          color: "#eef0f6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", maxWidth: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: "#8b91a5", letterSpacing: 4 }}>
            <div style={{ width: 40, height: 2, background: "#5ee7ff" }} />
            PORTFOLIO · NASHIK, INDIA
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 0.95 }}>
              <span>{profile.firstName}</span>
              <span>{profile.lastName}</span>
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 600,
                backgroundImage: "linear-gradient(90deg, #5ee7ff, #9b8cff 50%, #ff6fae)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {profile.role}
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 22, color: "#c9cddb" }}>
            {["Next.js", "Node.js", "Razorpay", "GCP", "AI agents"].map((t) => (
              <div key={t} style={{ display: "flex", padding: "7px 16px", border: "1px solid #2a2f3d", borderRadius: 999 }}>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            padding: 4,
            borderRadius: 44,
            backgroundImage: "linear-gradient(135deg, #5ee7ff, #9b8cff 55%, #ff6fae)",
            boxShadow: "0 30px 80px rgba(155, 140, 255, 0.35)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Open Graph images are rendered by Satori, not the browser */}
          <img src={photo} alt="" width={400} height={460} style={{ borderRadius: 40, objectFit: "cover", objectPosition: "50% 30%" }} />
        </div>
      </div>
    ),
    size,
  );
}
