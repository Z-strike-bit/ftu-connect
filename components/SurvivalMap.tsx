"use client";

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPESCRIPT INTERFACES ---
interface BaseMarker {
  id: string;
  position: [number, number];
  createdBy: string;
  type: 'food' | 'pass';
}

interface Review {
  user: string;
  rating: number;
  comment: string;
}

interface FoodMarker extends BaseMarker {
  type: 'food';
  restaurantName: string;
  address: string;
  averageRating: number;
  reviews: Review[];
}

interface PassItemMarker extends BaseMarker {
  type: 'pass';
  itemName: string;
  description: string;
  inboxLink: string;
  createdAt: number;
  expireAt: number;
}

type MapMarker = FoodMarker | PassItemMarker;

// --- CUSTOM DIV ICONS ---
const foodIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-md flex items-center justify-center text-lg">🍜</div>`,
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
  tooltipAnchor: [0, -36]
});

const studyIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-md flex items-center justify-center text-lg">📚</div>`,
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
  tooltipAnchor: [0, -36]
});

// FTU Main Icon
const ftuIcon = new L.DivIcon({
  html: `<div class="w-10 h-10 rounded-full bg-white border-2 border-red-600 shadow-lg flex items-center justify-center p-1"><img src="/logo_ftu_don_gian.png" class="w-full h-full object-contain" /></div>`,
  className: 'custom-leaflet-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  tooltipAnchor: [0, -40]
});

const getIconByType = (type: 'food' | 'pass') => {
  return type === 'food' ? foodIcon : studyIcon;
};

// --- POPUP COMPONENTS ---
const formatTimeLeft = (expireAt: number) => {
  const now = Date.now();
  const diff = expireAt - now;
  if (diff <= 0) return 'Đã hết hạn';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} ngày`;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours} giờ`;
  
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes} phút`;
};

const FoodPopup = ({ data, onReviewClick }: { data: FoodMarker, onReviewClick: (marker: FoodMarker) => void }) => (
  <div className="p-1 min-w-[200px]">
    <h3 className="font-bold text-[17px] text-orange-600 mb-1 leading-tight">{data.restaurantName}</h3>
    <p className="text-[13px] text-slate-600 mb-3 flex items-start gap-1">
      <span className="shrink-0 mt-0.5">📍</span> {data.address}
    </p>
    
    <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
      <div className="flex items-center gap-1 text-[13px] font-bold text-amber-500">
        ⭐ {data.averageRating > 0 ? data.averageRating.toFixed(1) : 'Chưa có'}
      </div>
      <button 
        onClick={() => onReviewClick(data)}
        className="text-[12px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition-colors font-semibold"
      >
        + Đánh giá
      </button>
    </div>
  </div>
);

const PassItemPopup = ({ data }: { data: PassItemMarker }) => (
  <div className="p-1 min-w-[200px]">
    <h3 className="font-bold text-[17px] text-blue-600 mb-1 leading-tight">{data.itemName}</h3>
    <p className="text-[13px] text-slate-700 mb-4 whitespace-pre-wrap">{data.description}</p>
    
    <a 
      href={data.inboxLink.startsWith('http') ? data.inboxLink : `https://${data.inboxLink}`} 
      target="_blank" 
      rel="noreferrer"
      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors mb-3 text-[14px]"
    >
      Nhắn tin ngay
    </a>
    
    <div className="text-[12px] font-bold text-red-500 text-center bg-red-50 py-1 rounded-md">
      ⏳ Tự hủy sau: {formatTimeLeft(data.expireAt)}
    </div>
  </div>
);


export default function SurvivalMap() {
  const ftuPosition: [number, number] = [21.0230, 105.8050];

  const [markers, setMarkers] = useState<MapMarker[]>([
    {
      id: 'm1',
      position: [21.0232, 105.8025],
      createdBy: 'admin',
      type: 'food',
      restaurantName: 'Quán quẩy nóng ngõ 119',
      address: 'Ngõ 119 Chùa Láng, Đống Đa, Hà Nội',
      averageRating: 4.5,
      reviews: []
    },
    {
      id: 'm2',
      position: [21.0220, 105.8010],
      createdBy: 'admin',
      type: 'pass',
      itemName: 'Giáo trình Vĩ mô K64',
      description: 'Sách gốc 99%, có note bút dạ cẩn thận.',
      inboxLink: 'https://m.me/username',
      createdAt: Date.now(),
      expireAt: Date.now() + 3 * 24 * 60 * 60 * 1000 // 3 days
    }
  ]);

  // State cho Modal thả ghim
  const [tempPos, setTempPos] = useState<[number, number] | null>(null);
  
  // Dynamic Form States
  const [formType, setFormType] = useState<'food' | 'pass'>('food');
  const [foodForm, setFoodForm] = useState({ name: '', address: '' });
  const [passForm, setPassForm] = useState({ name: '', desc: '', link: '', duration: '24h' });

  // State cho Modal đánh giá
  const [reviewMarker, setReviewMarker] = useState<FoodMarker | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  // Component lắng nghe sự kiện click trên bản đồ
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setTempPos([e.latlng.lat, e.latlng.lng]);
      }
    });
    return null;
  };

  const handleCloseModal = () => {
    setTempPos(null);
    setFormType('food');
    setFoodForm({ name: '', address: '' });
    setPassForm({ name: '', desc: '', link: '', duration: '24h' });
  };

  const handleSaveMarker = () => {
    if (!tempPos) return;
    
    if (formType === 'food') {
      if (!foodForm.name || !foodForm.address) return;
      const newFood: FoodMarker = {
        id: Date.now().toString(),
        position: tempPos,
        createdBy: 'user', // Tạm thời
        type: 'food',
        restaurantName: foodForm.name,
        address: foodForm.address,
        averageRating: 0,
        reviews: []
      };
      setMarkers(prev => [...prev, newFood]);
    } else {
      if (!passForm.name || !passForm.link) return;
      const now = Date.now();
      let expireAdd = 24 * 60 * 60 * 1000;
      if (passForm.duration === '3d') expireAdd = 3 * 24 * 60 * 60 * 1000;
      if (passForm.duration === '1w') expireAdd = 7 * 24 * 60 * 60 * 1000;
      
      const newPass: PassItemMarker = {
        id: Date.now().toString(),
        position: tempPos,
        createdBy: 'user',
        type: 'pass',
        itemName: passForm.name,
        description: passForm.desc,
        inboxLink: passForm.link,
        createdAt: now,
        expireAt: now + expireAdd
      };
      setMarkers(prev => [...prev, newPass]);
    }

    handleCloseModal();
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
          <Marker key={m.id} position={m.position} icon={getIconByType(m.type)}>
            <Popup className="custom-popup">
              {m.type === 'food' ? <FoodPopup data={m as FoodMarker} onReviewClick={setReviewMarker} /> : <PassItemPopup data={m as PassItemMarker} />}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Modal Form Thêm Địa Điểm */}
      <AnimatePresence>
        {tempPos && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-[20px] font-bold text-black flex items-center gap-2">
                  📍 Thêm ghim mới
                </h2>
                <button onClick={handleCloseModal} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-5">
                <button 
                  onClick={() => setFormType('food')}
                  className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-all ${formType === 'food' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:bg-slate-200/50'}`}
                >
                  🍜 Quán Ăn
                </button>
                <button 
                  onClick={() => setFormType('pass')}
                  className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-all ${formType === 'pass' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-slate-200/50'}`}
                >
                  📚 Pass Đồ
                </button>
              </div>

              {/* Dynamic Forms */}
              <div className="space-y-4">
                {formType === 'food' ? (
                  <>
                    <div>
                      <label className="block text-[14px] font-bold text-slate-700 mb-1.5">Tên quán ăn <span className="text-red-600">*</span></label>
                      <input 
                        type="text" 
                        value={foodForm.name}
                        onChange={e => setFoodForm({...foodForm, name: e.target.value})}
                        placeholder="VD: Phở xào bà béo..." 
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-bold text-slate-700 mb-1.5">Địa chỉ <span className="text-red-600">*</span></label>
                      <input 
                        type="text" 
                        value={foodForm.address}
                        onChange={e => setFoodForm({...foodForm, address: e.target.value})}
                        placeholder="VD: Ngõ 84 Chùa Láng..." 
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-shadow"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[14px] font-bold text-slate-700 mb-1.5">Tên món đồ <span className="text-red-600">*</span></label>
                      <input 
                        type="text" 
                        value={passForm.name}
                        onChange={e => setPassForm({...passForm, name: e.target.value})}
                        placeholder="VD: Giáo trình Vĩ mô K64..." 
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-bold text-slate-700 mb-1.5">Link Inbox (Mess/Zalo) <span className="text-red-600">*</span></label>
                      <input 
                        type="text" 
                        value={passForm.link}
                        onChange={e => setPassForm({...passForm, link: e.target.value})}
                        placeholder="VD: m.me/username..." 
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-bold text-slate-700 mb-1.5">Thời gian hiển thị</label>
                      <select 
                        value={passForm.duration}
                        onChange={e => setPassForm({...passForm, duration: e.target.value})}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                      >
                        <option value="24h">24 Giờ</option>
                        <option value="3d">3 Ngày</option>
                        <option value="1w">1 Tuần</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[14px] font-bold text-slate-700 mb-1.5">Mô tả thêm</label>
                      <textarea 
                        rows={2}
                        value={passForm.desc}
                        onChange={e => setPassForm({...passForm, desc: e.target.value})}
                        placeholder="Tình trạng đồ, giá cả..." 
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-shadow"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-7">
                <button 
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors text-[15px]"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSaveMarker}
                  disabled={formType === 'food' ? (!foodForm.name || !foodForm.address) : (!passForm.name || !passForm.link)}
                  className={`flex-1 font-bold py-3 rounded-xl transition-colors text-white text-[15px] disabled:opacity-50 ${formType === 'food' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  Lưu địa điểm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Đánh Giá Quán Ăn */}
      <AnimatePresence>
        {reviewMarker && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[18px] font-bold text-black flex items-center gap-2">
                  ⭐ Đánh giá quán ăn
                </h2>
                <button onClick={() => setReviewMarker(null)} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-slate-500">Đang đánh giá:</p>
                <p className="text-[15px] font-bold text-orange-600">{reviewMarker.restaurantName}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] font-bold text-slate-700 mb-2">Chấm điểm</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className={`text-2xl transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-slate-700 mb-1.5">Nhận xét của bạn</label>
                  <textarea 
                    rows={3}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                    placeholder="Quán ngon, cô chủ nhiệt tình..." 
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none transition-shadow"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => {
                    alert('Đã gửi đánh giá thành công!');
                    setReviewMarker(null);
                    setReviewForm({ rating: 5, comment: '' });
                  }}
                  className="w-full font-bold py-2.5 rounded-xl transition-colors text-white text-[15px] bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20"
                >
                  Gửi đánh giá
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
