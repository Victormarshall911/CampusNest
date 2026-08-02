'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import React from 'react';

interface AppMapProps {
  center: [number, number];
  zoom: number;
  children?: React.ReactNode;
  interactive?: boolean;
}

// Helper component to pan/zoom when center/zoom changes dynamically
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function AppMap({
  center,
  zoom,
  children,
  interactive = true,
}: AppMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={interactive}
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      className="w-full h-full z-0"
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}
