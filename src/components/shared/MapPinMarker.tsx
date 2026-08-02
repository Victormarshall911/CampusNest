'use client';

import L from 'leaflet';
import { Marker } from 'react-leaflet';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

// Price Pin Layout
function PricePinMarkup({ price, isSelected }: { price: number; isSelected: boolean }) {
  return (
    <div
      className={`px-2 py-1 rounded-lg text-xs font-bold shadow-md whitespace-nowrap border transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-[#6C3CE1] to-[#3B82F6] text-white border-transparent scale-115'
          : 'bg-white text-[#1a1a2e] border-neutral-200/80 hover:border-[#6C3CE1]/35'
      }`}
      style={{
        position: 'relative',
        transform: 'translate(-50%, -100%)', // Anchor bottom-center of bubble on pin coordinates
        marginTop: '-4px',
      }}
    >
      {Math.round(price / 1000)}k
      <div
        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b ${
          isSelected
            ? 'bg-gradient-to-r from-[#6C3CE1] to-[#3B82F6] border-transparent'
            : 'bg-white border-neutral-200/80'
        }`}
      />
    </div>
  );
}

// Campus Marker Layout
function CampusMarkerMarkup({ shortName }: { shortName: string }) {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6C3CE1] to-[#3B82F6] flex items-center justify-center shadow-lg border-2 border-white">
        <span className="text-white text-[8px] font-bold">{shortName.slice(0, 3)}</span>
      </div>
      <span className="mt-1 text-[9px] font-bold text-[#6C3CE1] bg-white/95 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
        {shortName}
      </span>
    </div>
  );
}

const createPricePinIcon = (price: number, isSelected: boolean) => {
  return L.divIcon({
    html: ReactDOMServer.renderToString(<PricePinMarkup price={price} isSelected={isSelected} />),
    className: 'custom-price-pin-icon',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const createCampusIcon = (shortName: string) => {
  return L.divIcon({
    html: ReactDOMServer.renderToString(<CampusMarkerMarkup shortName={shortName} />),
    className: 'custom-campus-icon',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

interface MapPinMarkerProps {
  position: [number, number];
  type: 'price' | 'campus';
  price?: number;
  isSelected?: boolean;
  shortName?: string;
  onClick?: () => void;
}

export default function MapPinMarker({
  position,
  type,
  price = 0,
  isSelected = false,
  shortName = '',
  onClick,
}: MapPinMarkerProps) {
  const icon = React.useMemo(() => {
    if (type === 'price') {
      return createPricePinIcon(price, isSelected);
    } else {
      return createCampusIcon(shortName);
    }
  }, [type, price, isSelected, shortName]);

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => onClick?.(),
      }}
    />
  );
}
