"use client";
import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix missing marker icons in Next.js/Leaflet
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

export default function SurvivalMap() {
  // Toạ độ FTU Hà Nội
  const ftuPosition: [number, number] = [21.0227, 105.8019];
  const foodPosition: [number, number] = [21.0232, 105.8025];
  const passPosition: [number, number] = [21.0220, 105.8010];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 z-0 relative">
      <MapContainer 
        center={ftuPosition} 
        zoom={16} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Điểm FTU */}
        <Marker position={ftuPosition} icon={customIcon}>
          <Tooltip permanent direction="top" offset={[0, -40]} className="font-bold text-red-600 bg-white px-2 py-1 rounded shadow-md border-none">
            📍 Đại học Ngoại Thương
          </Tooltip>
        </Marker>

        {/* Marker 1: Góc Thực Thần */}
        <Marker position={foodPosition} icon={customIcon}>
          <Tooltip direction="top" className="bg-white px-3 py-2 rounded-lg shadow-md border-none">
            <div className="font-bold text-orange-600 flex items-center gap-1">
              <span>🍜</span> Góc Thực Thần
            </div>
            <div className="text-[13px] text-slate-700 mt-1">Quán quẩy nóng ngõ 119 - 4.5 Sao</div>
          </Tooltip>
        </Marker>

        {/* Marker 2: Góc Pass Đồ */}
        <Marker position={passPosition} icon={customIcon}>
          <Tooltip direction="top" className="bg-white px-3 py-2 rounded-lg shadow-md border-none">
            <div className="font-bold text-blue-600 flex items-center gap-1">
              <span>📚</span> Góc Pass Đồ
            </div>
            <div className="text-[13px] text-slate-700 mt-1">Pass giáo trình Vĩ mô K64</div>
          </Tooltip>
        </Marker>
      </MapContainer>
    </div>
  );
}
