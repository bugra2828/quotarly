import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#08090d",
          color: "#f2f2f5",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 600, display: "flex", color: "#4f7dfd" }}>
          Quotarly
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: "#9a9aa8",
            maxWidth: 820,
            display: "flex",
          }}
        >
          Get quoted before the deadline passes.
        </div>
      </div>
    ),
    { ...size }
  );
}
