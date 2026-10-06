"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { MARKETS, mapsUrl } from "@/data/markets";

/** Pin tondo oro con il numero del giorno (1 = lunedì … 6 = sabato). */
const pin = (n: number, active: boolean) =>
  L.divIcon({
    className: "pin-furgone",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    html: `<div style="width:34px;height:34px;border-radius:50%;background:#d4a85c;color:#0c0c0c;font:800 15px Poppins,sans-serif;display:flex;align-items:center;justify-content:center;border:3px solid ${active ? "#fff" : "#0c0c0c"};box-shadow:0 0 0 2px #d4a85c">${n}</div>`,
  });

function FlyTo({ slug }: { slug: string }) {
  const map = useMap();
  useEffect(() => {
    const m = MARKETS.find((x) => x.slug === slug);
    if (m) map.flyTo([m.lat, m.lng], 15, { duration: 0.8 });
  }, [slug, map]);
  return null;
}

/** Mappa OpenStreetMap con i 6 mercati; il selezionato viene centrato. */
export default function MarketMap({ selected, onSelect }: { selected: string; onSelect: (slug: string) => void }) {
  const bounds = L.latLngBounds(MARKETS.map((m) => [m.lat, m.lng] as [number, number]));
  return (
    <div className="mappa h-[360px] w-full overflow-hidden rounded-tag border-2 border-oro sm:h-[460px]">
      <MapContainer bounds={bounds} boundsOptions={{ padding: [30, 30] }} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo slug={selected} />
        {MARKETS.map((m, i) => (
          <Marker
            key={m.slug}
            position={[m.lat, m.lng]}
            icon={pin(i + 1, m.slug === selected)}
            eventHandlers={{ click: () => onSelect(m.slug) }}
            keyboard
            title={`${m.dayName}: ${m.town}`}
          >
            <Popup>
              <strong>{m.dayName}, {m.town}</strong>
              <br />
              {m.spot}
              <br />
              <a href={mapsUrl(m)} rel="noopener">Indicazioni</a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
