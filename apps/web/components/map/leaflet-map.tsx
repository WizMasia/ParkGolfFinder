"use client";

import React, { useEffect, useRef } from "react";
import type * as LeafletType from "leaflet";

export interface MapFacility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  holes?: number | null;
  feeSummary?: string | null;
  address?: string | null;
  phone?: string | null;
  [key: string]: unknown;
}

export interface LeafletMapProps {
  facilities: MapFacility[];
  selectedFacilityId?: string | null;
  onSelectFacility?: (id: string) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

export const SEOUL_CITY_HALL: [number, number] = [37.5665, 126.978];
export const DEFAULT_ZOOM = 11;
export const OPEN_STREET_MAP_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OPEN_STREET_MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const DEFAULT_PIN_COLOR = "#0f766e";
export const SELECTED_PIN_COLOR = "#10b981";

/**
 * Validates latitude and longitude values.
 * Latitude must be between -90 and 90.
 * Longitude must be between -180 and 180.
 * (0, 0) dummy/null coordinates are rejected.
 */
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

/**
 * Filters facility items to include only those with valid coordinates.
 */
export function filterValidFacilities<T extends { lat: number; lng: number }>(facilities: T[]): T[] {
  return facilities.filter((f) => isValidCoordinate(f.lat, f.lng));
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Creates custom SVG pin HTML with #0f766e green coloring and hole count badge.
 */
export function createMarkerHtml(
  facility: { name: string; holes?: number | null },
  isSelected = false
): string {
  const pinColor = isSelected ? SELECTED_PIN_COLOR : DEFAULT_PIN_COLOR;
  const strokeWidth = isSelected ? "2.5" : "1.5";
  const badgeText = facility.holes ? String(facility.holes) + "H" : "⛳";
  const safeName = escapeHtml(facility.name);
  const scale = isSelected ? "scale(1.15)" : "scale(1)";

  return '<div class="parkgolf-marker-wrapper ' + (isSelected ? "selected" : "") + '" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; text-align: center;">' +
    '<div style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.4)); transform: ' + scale + '; transition: transform 0.2s ease;">' +
      '<svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M17 0C7.61116 0 0 7.61116 0 17C0 27.5 17 42 17 42C17 42 34 27.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="' + pinColor + '" stroke="#ffffff" stroke-width="' + strokeWidth + '"/>' +
        '<circle cx="17" cy="16" r="11" fill="#ffffff" />' +
        '<text x="17" y="20" font-size="10" font-weight="800" fill="' + DEFAULT_PIN_COLOR + '" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">' + badgeText + '</text>' +
      '</svg>' +
    '</div>' +
    '<div style="margin-top: 2px; font-size: 11px; font-weight: 700; color: #f1f5f9; background: rgba(15, 23, 42, 0.9); padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap; max-width: 120px; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 2px 6px rgba(0,0,0,0.5); pointer-events: none;">' +
      safeName +
    '</div>' +
  '</div>';
}

/**
 * Creates popup HTML with details and link to facility page.
 */
export function createPopupHtml(facility: MapFacility): string {
  const safeName = escapeHtml(facility.name);
  const holesBadge = facility.holes
    ? '<span style="font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">' + facility.holes + '홀</span>'
    : "";
  const feeInfo = facility.feeSummary
    ? '<div style="font-size: 12px; color: #475569; margin-top: 4px;">요금: <strong style="color: #34d399;">' + escapeHtml(facility.feeSummary) + '</strong></div>'
    : "";
  const addressInfo = facility.address
    ? '<div style="font-size: 11px; color: #94a3b8; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + escapeHtml(facility.address) + '</div>'
    : "";

  return '<div style="padding: 6px 4px; min-width: 170px; max-width: 240px; font-family: system-ui, -apple-system, sans-serif;">' +
    '<div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; border-bottom: 1px solid #334155; padding-bottom: 6px;">' +
      '<strong style="color: #0f172a; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + safeName + '</strong>' +
      holesBadge +
    '</div>' +
    feeInfo +
    addressInfo +
    '<div style="margin-top: 8px; display: flex; gap: 6px;">' +
      '<a href="/facility/' + facility.id + '" style="display: block; width: 100%; text-align: center; background: #0f766e; color: #ffffff; font-size: 12px; font-weight: 700; padding: 6px 10px; border-radius: 6px; text-decoration: none;">' +
        '상세보기' +
      '</a>' +
    '</div>' +
  '</div>';
}

/**
 * Client-side interactive Leaflet map with OpenStreetMap tiles.
 */
export default function LeafletMap({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  className,
  center,
  zoom,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletType.Map | null>(null);
  const layerGroupRef = useRef<LeafletType.LayerGroup | null>(null);
  const leafletModuleRef = useRef<typeof LeafletType | null>(null);
  const markerMapRef = useRef<Map<string, LeafletType.Marker>>(new Map());

  // Helper to re-render markers
  const renderMarkers = (
    L: typeof LeafletType,
    map: LeafletType.Map,
    layerGroup: LeafletType.LayerGroup
  ) => {
    layerGroup.clearLayers();
    markerMapRef.current.clear();

    const validFacilities = filterValidFacilities(facilities);
    if (validFacilities.length === 0) return;

    for (const facility of validFacilities) {
      const isSelected = selectedFacilityId === facility.id;
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: createMarkerHtml(facility, isSelected),
        iconSize: [34, 60],
        iconAnchor: [17, 42],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([facility.lat, facility.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      });

      marker.on("click", () => {
        onSelectFacility?.(facility.id);
      });

      marker.bindPopup(createPopupHtml(facility));
      marker.addTo(layerGroup);
      markerMapRef.current.set(facility.id, marker);

      if (isSelected) {
        marker.openPopup();
      }
    }

    if (selectedFacilityId && markerMapRef.current.has(selectedFacilityId)) {
      const selectedFacility = validFacilities.find((f) => f.id === selectedFacilityId);
      if (selectedFacility) {
        map.setView([selectedFacility.lat, selectedFacility.lng], Math.max(map.getZoom(), 14), {
          animate: true,
        });
      }
    } else if (validFacilities.length > 1) {
      const bounds = L.latLngBounds(validFacilities.map((f) => [f.lat, f.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (validFacilities.length === 1) {
      map.setView([validFacilities[0].lat, validFacilities[0].lng], 14, { animate: true });
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!containerRef.current) return;

    import("leaflet").then((L) => {
      if (!isMounted || !containerRef.current) return;

      leafletModuleRef.current = L;

      // Prevent re-initialization error in React StrictMode
      if ((containerRef.current as any)._leaflet_id && mapRef.current) {
        return;
      }

      const initialCenter = center || SEOUL_CITY_HALL;
      const initialZoom = zoom || DEFAULT_ZOOM;

      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      L.tileLayer(OPEN_STREET_MAP_URL, {
        attribution: OPEN_STREET_MAP_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerGroupRef.current = layerGroup;

      renderMarkers(L, map, layerGroup);
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupRef.current = null;
        markerMapRef.current.clear();
      }
    };
  }, []);

  // Update markers when facilities or selection changes
  useEffect(() => {
    if (leafletModuleRef.current && mapRef.current && layerGroupRef.current) {
      renderMarkers(leafletModuleRef.current, mapRef.current, layerGroupRef.current);
    }
  }, [facilities, selectedFacilityId, onSelectFacility]);

  return (
    <div
      ref={containerRef}
      className={"w-full h-full min-h-[300px] relative z-0 " + (className || "")}
      data-testid="leaflet-map-container"
    />
  );
}

export { LeafletMap };
