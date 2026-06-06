"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPESCRIPT INTERFACES ---
interface BaseMarker {
  id: string;
  position: [number, number];
  createdBy: string;
  type: 'food' | 'pass' | 'event';
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

interface EventMarker extends BaseMarker {
  type: 'event';
  eventName: string;
  clubName: string;
  locationDesc: string;
  isVerified: boolean;
}

type MapMarker = FoodMarker | PassItemMarker | EventMarker;

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

// USER LOCATION ICON (Blue Dot)
const userIcon = new L.DivIcon({
  html: `<div class="relative flex items-center justify-center">
           <div class="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-60"></div>
           <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_10px_rgba(37,99,235,0.8)] z-10"></div>
         </div>`,
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// GLOWING EVENT ICON
const eventIcon = new L.DivIcon({
  html: `<div class="relative w-12 h-12 flex items-center justify-center">
           <div class="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
           <div class="relative w-10 h-10 bg-gradient-to-tr from-yellow-400 to-red-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(250,204,21,0.8)] flex items-center justify-center text-xl z-10">🌟</div>
         </div>`,
  className: 'custom-leaflet-icon',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
  tooltipAnchor: [0, -48]
});

// FTU Main Icon
const ftuIcon = new L.DivIcon({
  html: `<div class="w-10 h-10 rounded-full bg-white border-2 border-red-600 shadow-lg flex items-center justify-center p-1"><img src="/logo_ftu_don_gian.png" class="w-full h-full object-contain" /></div>`,
  className: 'custom-leaflet-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  tooltipAnchor: [0, -40]
});

const getIconByType = (type: 'food' | 'pass' | 'event') => {
  if (type === 'event') return eventIcon;
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

const FoodPopup = ({ data, onReviewClick }: { data: FoodMarker, onReviewClick: (marker: FoodMarker) => void }) => {
  const [showReviews, setShowReviews] = useState(false);

  return (
    <div className="p-2 min-w-[240px] max-w-[300px]">
      <h3 className="font-semibold text-[20px] text-gray-900 dark:text-white mb-1 leading-tight tracking-tight">{data.restaurantName}</h3>
      <p className="text-[14px] text-gray-600 dark:text-gray-300 mb-4 flex items-start gap-1">
        <span className="shrink-0 mt-0.5">📍</span> {data.address}
      </p>
      
      <div className="border-t border-gray-200 dark:border-white/10 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[16px] font-bold text-gray-900 dark:text-white">
          ⭐ {data.averageRating > 0 ? data.averageRating.toFixed(1) : 'Chưa có'} 
          <span className="text-gray-500 dark:text-gray-400 font-normal ml-1 text-[14px]">({data.reviews.length})</span>
        </div>
        <button 
          onMouseDown={(e) => {
            e.stopPropagation();
            onReviewClick(data);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            onReviewClick(data);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onReviewClick(data);
          }}
          type="button"
          className="text-[14px] bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white px-4 py-1.5 rounded-full transition-colors font-semibold z-50 relative cursor-pointer"
        >
          Đánh giá
        </button>
      </div>

      {data.reviews.length > 0 && (
        <div className="mt-4">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowReviews(!showReviews);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-full text-center text-[14px] text-gray-900 dark:text-white font-semibold py-2 hover:underline flex justify-center items-center gap-1 transition-colors"
          >
            {showReviews ? 'Ẩn bình luận' : 'Xem bình luận'}
            <svg className={`w-4 h-4 transition-transform ${showReviews ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          <AnimatePresence>
            {showReviews && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                  {data.reviews.map((rev, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-[14px] text-gray-900 dark:text-white">{rev.user}</span>
                        <span className="text-[12px] text-amber-400 font-bold">★ {rev.rating}</span>
                      </div>
                      <p className="text-[14px] text-gray-600 dark:text-gray-300 leading-snug">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const PassItemPopup = ({ data }: { data: PassItemMarker }) => (
  <div className="p-2 min-w-[220px]">
    <h3 className="font-semibold text-[20px] text-gray-900 dark:text-white mb-1 leading-tight tracking-tight">{data.itemName}</h3>
    <p className="text-[14px] text-gray-600 dark:text-gray-300 mb-5 whitespace-pre-wrap">{data.description}</p>
    
    <a 
      href={data.inboxLink.startsWith('http') ? data.inboxLink : `https://${data.inboxLink}`} 
      target="_blank" 
      rel="noreferrer"
      className="block w-full text-center bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white font-semibold py-[14px] rounded-lg transition-colors mb-4 text-[16px]"
    >
      Nhắn tin ngay
    </a>
    
    <div className="text-[13px] font-medium text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-white/10 pt-3">
      Tự hủy sau: {formatTimeLeft(data.expireAt)}
    </div>
  </div>
);

const EventPopup = ({ data }: { data: EventMarker }) => (
  <div className="p-2 min-w-[240px]">
    <div className="flex items-center gap-1.5 mb-3">
      <div className="bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 border border-gray-200 dark:border-white/10">
        <svg className="w-3 h-3 text-[#ff385c]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        VERIFIED CLUB
      </div>
    </div>
    <h3 className="font-semibold text-[22px] text-gray-900 dark:text-white mb-1 leading-tight tracking-tight">{data.eventName}</h3>
    <p className="text-[16px] font-medium text-gray-600 dark:text-gray-300 mb-4">{data.clubName}</p>
    
    <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-xl mb-2">
      <p className="text-[14px] text-gray-900 dark:text-white flex items-start gap-2 font-medium">
        <span className="shrink-0">📍</span> {data.locationDesc}
      </p>
    </div>
  </div>
);


const MapEvents = ({ setTempPos }: { setTempPos: (pos: [number, number]) => void }) => {
  useMapEvents({
    click(e) {
      setTempPos([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
};

export default function SurvivalMap({ activeFilter = 'all' }: { activeFilter?: string }) {
  const ftuPosition: [number, number] = [21.0230, 105.8050];
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => console.warn('Lỗi lấy vị trí:', error.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const flyToUser = () => {
    if (mapInstance && userLocation) {
      mapInstance.flyTo(userLocation, 17, { animate: true });
    } else {
      alert("Chưa lấy được vị trí hoặc bạn chưa cấp quyền truy cập vị trí!");
    }
  };

  const [markers, setMarkers] = useState<MapMarker[]>([
    {
      id: 'm1',
      position: [21.0232, 105.8025],
      createdBy: 'admin',
      type: 'food',
      restaurantName: 'Quán quẩy nóng ngõ 119',
      address: 'Ngõ 119 Chùa Láng, Đống Đa, Hà Nội',
      averageRating: 4.5,
      reviews: [
        { user: 'Hải Sinh Viên', rating: 5, comment: 'Quẩy giòn rụm, nước chấm pha rất vừa miệng, mùa đông ăn thì hết sẩy!' },
        { user: 'Mai Trúc', rating: 4, comment: 'Quán hơi đông nên phải đợi tí, nhưng đồ ăn ngon rẻ.' }
      ]
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
    },
    {
      id: 'm3',
      position: [21.0230, 105.8040],
      createdBy: 'admin',
      type: 'event',
      eventName: 'Gala Nhạc Kịch 2026',
      clubName: 'CLB Tiếng Anh (SEC)',
      locationDesc: 'Sân nhà D - Bán vé trực tiếp tại bàn',
      isVerified: true
    }
  ]);

  // Bộ lọc hiển thị (Radar + Tự Hủy)
  const visibleMarkers = markers.filter(m => {
    // Lọc theo Radar
    if (activeFilter !== 'all' && m.type !== activeFilter) return false;
    
    // Lọc Tự hủy (Auto-destruct) cho loại Pass Đồ
    if (m.type === 'pass' && m.expireAt < Date.now()) return false;

    return true;
  });

  // State cho Modal thả ghim
  const [tempPos, setTempPos] = useState<[number, number] | null>(null);
  
  // Dynamic Form States
  const [formType, setFormType] = useState<'food' | 'pass' | 'event'>('food');
  const [foodForm, setFoodForm] = useState({ name: '', address: '' });
  const [passForm, setPassForm] = useState({ name: '', desc: '', link: '', duration: '24h' });
  const [eventForm, setEventForm] = useState({ eventName: '', clubName: '', locDesc: '' });

  // State cho Modal đánh giá
  const [reviewMarker, setReviewMarker] = useState<FoodMarker | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const handleCloseModal = () => {
    setTempPos(null);
    setFormType('food');
    setFoodForm({ name: '', address: '' });
    setPassForm({ name: '', desc: '', link: '', duration: '24h' });
    setEventForm({ eventName: '', clubName: '', locDesc: '' });
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
    } else if (formType === 'pass') {
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
    } else if (formType === 'event') {
      if (!eventForm.eventName || !eventForm.clubName) return;
      const newEvent: EventMarker = {
        id: Date.now().toString(),
        position: tempPos,
        createdBy: 'user',
        type: 'event',
        eventName: eventForm.eventName,
        clubName: eventForm.clubName,
        locationDesc: eventForm.locDesc,
        isVerified: true // Giả lập tick xanh
      };
      setMarkers(prev => [...prev, newEvent]);
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
        ref={setMapInstance}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents setTempPos={setTempPos} />

        {/* Điểm FTU Main */}
        <Marker position={ftuPosition} icon={ftuIcon}>
          <Tooltip permanent direction="top" offset={[0, -40]} className="font-bold text-red-600 bg-white px-2 py-1 rounded shadow-md border-none">
            📍 Đại học Ngoại Thương
          </Tooltip>
        </Marker>

        {/* Render danh sách Markers (Đã lọc qua Radar và Tự hủy) */}
        {visibleMarkers.map(m => (
          <Marker key={m.id} position={m.position} icon={getIconByType(m.type)}>
            <Popup className="custom-popup">
              {m.type === 'food' && <FoodPopup data={m as FoodMarker} onReviewClick={setReviewMarker} />}
              {m.type === 'pass' && <PassItemPopup data={m as PassItemMarker} />}
              {m.type === 'event' && <EventPopup data={m as EventMarker} />}
            </Popup>
          </Marker>
        ))}
        {/* Marker vị trí người dùng */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Tooltip permanent direction="top" className="font-bold text-blue-600 bg-white px-2 py-1 rounded shadow-md border-none">
              Bạn đang ở đây
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {/* Nút Định vị tôi (Locate Me) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[1000]">
        <button 
          onClick={flyToUser}
          className="bg-white w-10 h-10 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_2px_6px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.1)] text-[#222222] hover:bg-[#f7f7f7] transition-colors flex items-center justify-center group"
          title="Định vị trí của tôi"
        >
          <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
        </button>
      </div>

      {/* Modal Form Thêm Địa Điểm */}
      <AnimatePresence>
        {tempPos && (
              <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-gray-50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-[480px]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[22px] font-semibold text-gray-900 tracking-tight">
                  Thêm ghim mới
                </h2>
                <button onClick={handleCloseModal} className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5 overflow-x-auto custom-scrollbar border border-gray-100">
                <button 
                  onClick={() => setFormType('food')}
                  className={`flex-1 min-w-[90px] py-2 px-1 text-[13px] font-bold rounded-lg transition-all ${formType === 'food' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  🍜 Quán Ăn
                </button>
                <button 
                  onClick={() => setFormType('pass')}
                  className={`flex-1 min-w-[90px] py-2 px-1 text-[13px] font-bold rounded-lg transition-all ${formType === 'pass' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  📚 Pass Đồ
                </button>
                <button 
                  onClick={() => setFormType('event')}
                  className={`flex-1 min-w-[100px] py-2 px-1 text-[13px] font-bold rounded-lg transition-all ${formType === 'event' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  🌟 Sự kiện CLB
                </button>
              </div>

              {/* Dynamic Forms */}
              <div className="space-y-3.5">
                {formType === 'food' ? (
                  <>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Tên quán ăn <span className="text-red-400">*</span></label>
                      <input 
                        type="text" 
                        value={foodForm.name}
                        onChange={e => setFoodForm({...foodForm, name: e.target.value})}
                        placeholder="VD: Phở xào bà béo..." 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Địa chỉ <span className="text-red-400">*</span></label>
                      <input 
                        type="text" 
                        value={foodForm.address}
                        onChange={e => setFoodForm({...foodForm, address: e.target.value})}
                        placeholder="VD: Ngõ 84 Chùa Láng..." 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-shadow"
                      />
                    </div>
                  </>
                ) : formType === 'pass' ? (
                  <>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Tên món đồ <span className="text-red-400">*</span></label>
                      <input 
                        type="text" 
                        value={passForm.name}
                        onChange={e => setPassForm({...passForm, name: e.target.value})}
                        placeholder="VD: Giáo trình Vĩ mô K64..." 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Link Inbox (Mess/Zalo) <span className="text-red-400">*</span></label>
                      <input 
                        type="text" 
                        value={passForm.link}
                        onChange={e => setPassForm({...passForm, link: e.target.value})}
                        placeholder="VD: m.me/username..." 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Thời gian hiển thị</label>
                      <select 
                        value={passForm.duration}
                        onChange={e => setPassForm({...passForm, duration: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-shadow"
                      >
                        <option value="24h">24 Giờ</option>
                        <option value="3d">3 Ngày</option>
                        <option value="1w">1 Tuần</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Mô tả thêm</label>
                      <textarea 
                        rows={2}
                        value={passForm.desc}
                        onChange={e => setPassForm({...passForm, desc: e.target.value})}
                        placeholder="Tình trạng đồ, giá cả..." 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 resize-none transition-shadow"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gray-100 text-gray-900 p-2 rounded-lg border border-gray-200 text-[12px] flex items-center gap-2 font-medium mb-2">
                      <svg className="w-5 h-5 shrink-0 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Ghim của bạn sẽ được cấp Tick Xanh (Verified)
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Tên sự kiện <span className="text-red-400">*</span></label>
                      <input 
                        type="text" 
                        value={eventForm.eventName}
                        onChange={e => setEventForm({...eventForm, eventName: e.target.value})}
                        placeholder="VD: Đêm nhạc Mùa hè..." 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Tên Câu Lạc Bộ <span className="text-red-400">*</span></label>
                      <input 
                        type="text" 
                        value={eventForm.clubName}
                        onChange={e => setEventForm({...eventForm, clubName: e.target.value})}
                        placeholder="VD: CLB Tiếng Anh (SEC)..." 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Mô tả địa điểm / Chỉ đường</label>
                      <input 
                        type="text" 
                        value={eventForm.locDesc}
                        onChange={e => setEventForm({...eventForm, locDesc: e.target.value})}
                        placeholder="VD: Tầng 1 nhà D..." 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-shadow"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-8 border-t border-gray-200 pt-6">
                <button 
                  onClick={handleCloseModal}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold py-[14px] rounded-lg transition-colors text-[16px]"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSaveMarker}
                  disabled={formType === 'food' ? (!foodForm.name || !foodForm.address) : formType === 'pass' ? (!passForm.name || !passForm.link) : (!eventForm.eventName || !eventForm.clubName)}
                  className={`flex-1 font-semibold py-[14px] rounded-lg transition-colors text-gray-900 text-[16px] disabled:opacity-50 disabled:bg-gray-500 bg-black text-white hover:bg-gray-800`}
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
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-gray-50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-[400px]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[22px] font-semibold text-gray-900 tracking-tight">
                  Đánh giá quán ăn
                </h2>
                <button onClick={() => setReviewMarker(null)} className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Đang đánh giá:</p>
                <p className="text-[15px] font-bold text-gray-900">{reviewMarker.restaurantName}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] font-bold text-gray-800 mb-2">Chấm điểm</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className={`text-2xl transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-amber-400' : 'text-gray-900/20'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-gray-800 mb-1.5">Nhận xét của bạn</label>
                  <textarea 
                    rows={3}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                    placeholder="Quán ngon, cô chủ nhiệt tình..." 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 resize-none transition-shadow"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8 border-t border-gray-200 pt-6">
                <button 
                  onClick={() => {
                    if (reviewForm.comment.trim() === '') {
                      alert('Vui lòng nhập nhận xét của bạn!');
                      return;
                    }
                    
                    const updatedMarkers = markers.map(m => {
                      if (m.id === reviewMarker.id && m.type === 'food') {
                        const newReview = { user: 'Bạn (Vừa xong)', rating: reviewForm.rating, comment: reviewForm.comment };
                        const updatedReviews = [newReview, ...m.reviews];
                        const newAverage = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0) / updatedReviews.length;
                        return { ...m, reviews: updatedReviews, averageRating: newAverage };
                      }
                      return m;
                    });
                    
                    setMarkers(updatedMarkers);
                    setReviewMarker(null);
                    setReviewForm({ rating: 5, comment: '' });
                  }}
                  className="w-full font-semibold py-[14px] rounded-lg transition-colors text-gray-900 text-[16px] bg-black text-white hover:bg-gray-800"
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
