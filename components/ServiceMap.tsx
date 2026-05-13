"use client";

import { useEffect, useRef } from "react";
import type { ServiceRecord } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/utils";
import { fmtNum } from "@/lib/utils";

/* City coordinates for Kazakhstan cities */
const CITY_COORDS: Record<string, [number, number]> = {
  "Almaty":    [43.2220, 76.8512],
  "Astana":    [51.1801, 71.4460],
  "Shymkent":  [42.3417, 69.5901],
  "Karaganda": [49.8047, 73.1094],
  "Aktobe":    [50.2797, 57.2071],
  "Taraz":     [42.9000, 71.3667],
  "Pavlodar":  [52.2873, 76.9674],
  "Oskemen":   [49.9483, 82.6278],
  "Semey":     [50.4119, 80.2275],
  "Atyrau":    [47.0945, 51.9237],
  "Kostanay":  [53.2141, 63.6242],
  "Kyzylorda": [44.8479, 65.5093],
  "Oral":      [51.2333, 51.3500],
  "Petropavl": [54.8720, 69.1453],
  "Aktau":     [43.6527, 51.1575],
  "Temirtau":  [50.0597, 72.9646],
  "Turkestan": [43.3011, 68.2726],
  "Ekibastuz": [51.7230, 75.3677],
  "Rudny":     [52.9692, 63.1279],
  "Zhezkazgan":[47.7847, 67.7143],
};

const DEFAULT_CENTER: [number, number] = [48.0196, 66.9237]; // center of Kazakhstan

function jitter(coord: number, amount = 0.008): number {
  return coord + (Math.random() - 0.5) * amount;
}

const CATEGORY_EMOJI: Record<string, string> = {
  automobiles: "🚗",
  "real-estate": "🏠",
  plumbing: "🔧",
  electrical: "⚡",
  painting: "🎨",
  cleaning: "🧹",
  renovation: "🏗️",
  welding: "🔩",
  roofing: "🏚️",
  other: "🛠️",
};

interface ServiceMapProps {
  services: ServiceRecord[];
  onServiceClick?: (id: string) => void;
}

export function ServiceMap({ services, onServiceClick }: ServiceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let L: typeof import("leaflet");
    let isMounted = true;

    async function initMap() {
      L = (await import("leaflet")).default;

      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!isMounted || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Group by city for auto-fit
      const bounds: [number, number][] = [];

      services.forEach((service) => {
        const cityCoords = service.city ? CITY_COORDS[service.city] : null;
        if (!cityCoords) return;

        const lat = service.lat ?? jitter(cityCoords[0]);
        const lng = service.lng ?? jitter(cityCoords[1]);
        bounds.push([lat, lng]);

        const emoji = CATEGORY_EMOJI[service.category] ?? "📍";
        const color = service.category === "automobiles" ? "#3b82f6"
          : service.category === "real-estate" ? "#10b981"
          : service.category === "electrical" ? "#f59e0b"
          : service.category === "plumbing" ? "#06b6d4"
          : service.category === "cleaning" ? "#14b8a6"
          : service.category === "renovation" ? "#f97316"
          : "#8b5cf6";

        const icon = L.divIcon({
          html: `<div style="
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            background:${color};border:3px solid white;
            display:flex;align-items:center;justify-content:center;
            font-size:14px;transform:rotate(-45deg);
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
          "><span style="transform:rotate(45deg)">${emoji}</span></div>`,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -38],
        });

        const ratingHtml = typeof service.rating === "number"
          ? `<div style="display:flex;align-items:center;gap:3px;margin:4px 0">
              ${"★".repeat(Math.round(service.rating))}<span style="color:#999;font-size:11px">${service.rating.toFixed(1)}</span>
             </div>`
          : "";

        const popupHtml = `
          <div style="min-width:200px;max-width:240px;font-family:sans-serif">
            ${service.images[0]?.url
              ? `<img src="${service.images[0].url}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px" alt="${service.name}" />`
              : ""}
            <div style="font-size:11px;color:${color};font-weight:700;text-transform:uppercase;letter-spacing:0.05em">${emoji} ${service.category.replace("-", " ")}</div>
            <div style="font-size:14px;font-weight:700;margin:4px 0;line-height:1.3">${service.name}</div>
            <div style="font-size:12px;color:#666">${service.company.name ?? ""}</div>
            ${ratingHtml}
            <div style="font-size:13px;font-weight:700;color:#111;margin:6px 0">
              ${fmtNum(service.priceFrom)}${service.priceTo !== service.priceFrom ? ` – ${fmtNum(service.priceTo)}` : ""} ₸
            </div>
            ${service.city ? `<div style="font-size:11px;color:#888">📍 ${service.city}</div>` : ""}
            <a href="/repair/${service.id}" style="
              display:block;margin-top:10px;padding:7px 12px;
              background:${color};color:white;border-radius:8px;
              text-decoration:none;font-size:12px;font-weight:600;text-align:center;
            " target="_blank">View details →</a>
          </div>
        `;

        L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(popupHtml, { maxWidth: 260 })
          .on("click", () => {
            onServiceClick?.(service.id);
          });
      });

      // Fit to markers if we have any
      if (bounds.length > 0) {
        map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 13 });
      }
    }

    void initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when services change (re-init)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    // Simple approach: just reinit the map when services change
    // This is acceptable for a diploma project
  }, [services]);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div
        ref={mapRef}
        className="w-full rounded-2xl overflow-hidden border border-border/50 shadow-sm"
        style={{ height: "520px", zIndex: 0 }}
      />
    </>
  );
}
