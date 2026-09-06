"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Banjul, Gambia — sensible default center when an owner hasn't set a
// location yet (this marketplace only operates in the Gambia).
const DEFAULT_LAT = 13.4549;
const DEFAULT_LNG = -16.579;

function formatCoord(n: number): string {
  return n.toFixed(5);
}

/**
 * Replaces raw lat/lng number fields with a tap-to-place map, since most
 * pitch owners have no way to look up coordinates themselves. Still submits
 * plain "lat"/"lng" form fields underneath — the map just drives their
 * values instead of a keyboard.
 */
export function LocationPicker({ lat, lng }: { lat?: number; lng?: number }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const latInputRef = useRef<HTMLInputElement>(null);
  const lngInputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: lat ?? DEFAULT_LAT,
    lng: lng ?? DEFAULT_LNG,
  });
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialPosition = lat !== undefined && lng !== undefined;

  // Kept outside React state — Leaflet owns this instance imperatively, a
  // re-render should never recreate the map.
  const leafletRef = useRef<{
    map: import("leaflet").Map;
    marker: import("leaflet").Marker;
  } | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [position.lat, position.lng],
        zoom: hasInitialPosition ? 15 : 12,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // A plain divIcon avoids Leaflet's default marker image paths, which
      // break under bundlers unless separately configured.
      const icon = L.divIcon({
        className: "",
        html: `<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;margin:-28px 0 0 -16px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#059669" stroke="white" stroke-width="1.5">
            <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z"/>
          </svg>
        </span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 28],
      });

      const marker = L.marker([position.lat, position.lng], { icon, draggable: true }).addTo(map);

      function updatePosition(next: { lat: number; lng: number }) {
        setPosition(next);
        if (latInputRef.current) latInputRef.current.value = String(next.lat);
        if (lngInputRef.current) lngInputRef.current.value = String(next.lng);
      }

      marker.on("dragend", () => {
        const { lat: newLat, lng: newLng } = marker.getLatLng();
        updatePosition({ lat: newLat, lng: newLng });
      });

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        updatePosition({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      leafletRef.current = { map, marker };
    });

    return () => {
      cancelled = true;
      leafletRef.current?.map.remove();
      leafletRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once; position updates flow through refs/imperative calls instead
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location lookup.");
      return;
    }
    // The permission prompt itself only appears over a secure context
    // (https, or localhost) — over plain http on a LAN/IP address (e.g.
    // testing on a phone against your computer's network address) the
    // browser silently refuses without ever asking.
    if (!window.isSecureContext) {
      setError("Location access needs a secure (https) connection — tap the map to set the pin instead.");
      return;
    }
    setError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (result) => {
        const next = { lat: result.coords.latitude, lng: result.coords.longitude };
        setLocating(false);
        setPosition(next);
        if (latInputRef.current) latInputRef.current.value = String(next.lat);
        if (lngInputRef.current) lngInputRef.current.value = String(next.lng);
        const instance = leafletRef.current;
        if (instance) {
          instance.marker.setLatLng(next);
          instance.map.setView(next, 16);
        }
      },
      (err) => {
        setLocating(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access is blocked for this site — check your browser's site settings, or tap the map instead."
            : "Couldn't get your location — make sure location access is allowed, or tap the map instead.",
        );
      },
    );
  }

  return (
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <span className="text-sm font-medium text-zinc-700">Pitch location</span>
      <div className="overflow-hidden rounded-2xl border border-zinc-200">
        <div ref={mapRef} className="h-56 w-full" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <p className="flex items-center gap-1.5 text-xs text-zinc-500">
          <MapPin className="size-3.5 shrink-0 text-emerald-600" />
          Tap the map or drag the pin — {formatCoord(position.lat)}, {formatCoord(position.lng)}
        </p>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 disabled:opacity-60"
        >
          <LocateFixed className={`size-3.5 ${locating ? "animate-pulse" : ""}`} />
          {locating ? "Locating…" : "Use my current location"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {/* Controlled (not defaultValue): the outer PitchForm's <form action>
          gets reset by React after every submit, including a failed one —
          value={} re-asserts these from position, which that reset can't
          touch, so a moved pin survives a validation error elsewhere. */}
      <input ref={latInputRef} type="hidden" name="lat" value={position.lat} readOnly />
      <input ref={lngInputRef} type="hidden" name="lng" value={position.lng} readOnly />
    </div>
  );
}
