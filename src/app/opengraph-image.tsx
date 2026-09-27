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
          backgroundColor: "#e9e6dc",
          color: "#201d18",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 600, display: "flex" }}>
          Quotarly
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: "#4d473c",
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
