"use client";

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';

// --- CUSTOM DIV ICONS ---
const foodIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-md flex items-center justify-center text-lg">🍜</div>`,
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  tooltipAnchor: [0, -32]
});

const studyIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-md flex items-center justify-center text-lg">📚</div>`,
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  tooltipAnchor: [0, -32]
});

const eventIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-md flex items-center justify-center text-lg">🦖</div>`,
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  tooltipAnchor: [0, -32]
});

// FTU Main Icon
const ftuIcon = new L.DivIcon({
  html: `<div class="w-10 h-10 rounded-full bg-white border-2 border-red-600 shadow-lg flex items-center justify-center p-1"><img src="/logo_ftu_don_gian.png" class="w-full h-full object-contain" /></div>`,
  className: 'custom-leaflet-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  tooltipAnchor: [0, -40]
});

// Map Icon Helper
const getIconByCategory = (category: string) => {
  if (category === 'Ăn uống') return foodIcon;
  if (category === 'Học tập') return studyIcon;
  if (category === 'Sự kiện') return eventIcon;
  return eventIcon; // Default
};

export default function SurvivalMap() {
  const ftuPosition: [number, number] = [21.0227, 105.8019];

  // Danh sách Markers
  const [markers, setMarkers] = useState([
    {
      id: 'm1',
      position: [21.0232, 105.8025] as [number, number],
      title: 'Góc Thực Thần',
      desc: 'Quán quẩy nóng ngõ 119 - 4.5 Sao',
      category: 'Ăn uống'
    },
    {
      id: 'm2',
      position: [21.0220, 105.8010] as [number, number],
      title: 'Góc Pass Đồ',
      desc: 'Pass giáo trình Vĩ mô K64',
      category: 'Học tập'
    }
  ]);

  // State cho Modal thả ghim
  const [tempPos, setTempPos] = useState<[number, number] | null>(null);
  const [formData, setFormData] = useState({ title: '', category: 'Ăn uống', desc: '' });

  // Component lắng nghe sự kiện click trên bản đồ
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setTempPos([e.latlng.lat, e.latlng.lng]);
        setFormData({ title: '', category: 'Ăn uống', desc: '' }); // reset form
      }
    });
    return null;
  };

  const handleSaveMarker = () => {
    if (!tempPos || !formData.title) return;
    
    const newMarker = {
      id: Date.now().toString(),
      position: tempPos,
      title: formData.title,
      desc: formData.desc,
      category: formData.category
    };

    setMarkers([...markers, newMarker]);
    setTempPos(null);
    
    // TODO: Push to Firebase later
  };

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={ftuPosition} 
        zoom={16} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents />

        {/* Điểm FTU Main */}
        <Marker position={ftuPosition} icon={ftuIcon}>
          <Tooltip permanent direction="top" offset={[0, -40]} className="font-bold text-red-600 bg-white px-2 py-1 rounded shadow-md border-none">
            📍 Đại học Ngoại Thương
          </Tooltip>
        </Marker>

        {/* Render danh sách Markers */}
        {markers.map(m => (
          <Marker key={m.id} position={m.position} icon={getIconByCategory(m.category)}>
            <Tooltip direction="top" className="bg-white px-3 py-2 rounded-lg shadow-md border-none">
              <div className={`font-bold flex items-center gap-1 ${
                m.category === 'Ăn uống' ? 'text-orange-600' : 
                m.category === 'Học tập' ? 'text-blue-600' : 'text-red-600'
              }`}>
                <span>
                  {m.category === 'Ăn uống' ? '🍜' : m.category === 'Học tập' ? '📚' : '🦖'}
                </span> 
                {m.title}
              </div>
              <div className="text-[13px] text-slate-700 mt-1">{m.desc}</div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Modal Form Thêm Địa Điểm */}
      <AnimatePresence>
        {tempPos && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm"
            >
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                📍 Thêm địa điểm mới
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tên địa điểm <span className="text-red-600">*</span></label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Ví dụ: Quán cơm dì Nga..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phân loại</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  >
                    <option value="Ăn uống">🍜 Ăn uống</option>
                    <option value="Học tập">📚 Học tập / Pass đồ</option>
                    <option value="Sự kiện">🦖 Sự kiện FTU</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả ngắn</label>
                  <textarea 
                    rows={2}
                    value={formData.desc}
                    onChange={e => setFormData({...formData, desc: e.target.value})}
                    placeholder="Mô tả về địa điểm này..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setTempPos(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSaveMarker}
                  disabled={!formData.title}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  Lưu địa điểm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
