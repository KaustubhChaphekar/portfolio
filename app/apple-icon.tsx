import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon for iPhone/iPad (and the PNG icon in the web manifest).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 30% 20%, #2a1f5c 0%, #05060a 70%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: -4,
            backgroundImage: "linear-gradient(135deg, #5ee7ff, #9b8cff 55%, #ff6fae)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          KC
        </div>
      </div>
    ),
    size,
  );
}
