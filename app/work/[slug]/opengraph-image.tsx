import { ImageResponse } from "next/og";
import { caseStudies, getCaseStudy } from "@/lib/case-studies";
import { profile } from "@/lib/data";

export const alt = "Case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const study = getCaseStudy((await params).slug);
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
          background: "radial-gradient(circle at 85% 20%, #1c3b52 0%, #0b0d14 45%, #05060a 80%)",
          color: "#eef0f6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, color: "#8b91a5", letterSpacing: 4 }}>
          <div style={{ width: 40, height: 2, background: "#5ee7ff" }} />
          CASE STUDY · {(study?.kind ?? "").toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>{study?.title ?? "Case study"}</div>
          <div style={{ fontSize: 30, color: "#c9cddb", lineHeight: 1.35, maxWidth: 980 }}>{study?.subtitle}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24 }}>
          <div
            style={{
              backgroundImage: "linear-gradient(90deg, #5ee7ff, #9b8cff 50%, #ff6fae)",
              backgroundClip: "text",
              color: "transparent",
              fontWeight: 600,
            }}
          >
            {profile.name}
          </div>
          <div style={{ color: "#8b91a5" }}>{study?.period}</div>
        </div>
      </div>
    ),
    size,
  );
}
