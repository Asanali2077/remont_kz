import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Remont.kz — Ремонт и обслуживание в Казахстане";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Background pattern */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.05, display: "flex", flexWrap: "wrap", gap: "60px", padding: "40px" }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa" }} />
        ))}
      </div>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, color: "white", fontWeight: 900,
          boxShadow: "0 0 40px rgba(59,130,246,0.5)",
        }}>
          R
        </div>
        <span style={{ fontSize: 52, fontWeight: 900, color: "white", letterSpacing: "-1px" }}>
          Remont<span style={{ color: "#3b82f6" }}>.kz</span>
        </span>
      </div>

      {/* Tagline */}
      <p style={{ fontSize: 28, color: "#94a3b8", margin: "0 0 40px", textAlign: "center", maxWidth: 700 }}>
        Найдите проверенных подрядчиков по ремонту в Казахстане
      </p>

      {/* Features */}
      <div style={{ display: "flex", gap: "24px" }}>
        {["🔧 10 категорий услуг", "⭐ Рейтинги и отзывы", "💬 Онлайн чат", "📍 По всему Казахстану"].map((f) => (
          <div key={f} style={{
            background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 12, padding: "12px 20px", color: "#e2e8f0", fontSize: 18,
          }}>
            {f}
          </div>
        ))}
      </div>
    </div>,
    { ...size }
  );
}
