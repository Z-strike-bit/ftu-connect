import os
import re

filepath = 'd:/FTU_Connect/components/SurvivalMap.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. TileLayer map background
content = content.replace(
    'url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"',
    'url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"'
)
content = content.replace(
    'attribution=\'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>\'',
    'attribution=\'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors\''
)

# 2. Modals and Popups UI
content = content.replace('bg-black/60 backdrop-blur-sm', 'bg-black/40 backdrop-blur-sm')
content = content.replace('className="liquid-glass p-6 sm:p-8 rounded-[14px] shadow-2xl', 'className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl')
content = content.replace('liquid-glass p-3 rounded-[14px]', 'bg-gray-50 p-3 rounded-xl border border-gray-100')

# Text Colors
content = content.replace('text-white', 'text-gray-900')
content = content.replace('text-gray-200', 'text-gray-800')
content = content.replace('text-gray-300', 'text-gray-600')
content = content.replace('text-gray-400', 'text-gray-500')

# Borders and Backgrounds
content = content.replace('border-white/20', 'border-gray-200')
content = content.replace('border-white/30', 'border-gray-300')
content = content.replace('border-white/10', 'border-gray-100')
content = content.replace('hover:bg-white/10', 'hover:bg-gray-100')
content = content.replace('hover:bg-white/20', 'hover:bg-gray-200')
content = content.replace('bg-white/10', 'bg-gray-100')
content = content.replace('hover:bg-white/5', 'hover:bg-gray-50')
content = content.replace('bg-black/40', 'bg-gray-50')
content = content.replace('focus:border-white/60', 'focus:border-gray-400')
content = content.replace('focus:ring-white/60', 'focus:ring-gray-400')

# Buttons and liquid-glass classes
content = content.replace('liquid-glass shadow-sm text-gray-900 border-gray-200', 'bg-white shadow-sm text-gray-900 border border-gray-200')
content = content.replace('liquid-glass border border-gray-200 hover:bg-gray-200', 'bg-black text-white hover:bg-gray-800') 
content = content.replace('liquid-glass text-gray-900 text-[11px]', 'bg-gray-100 text-gray-900 text-[11px]') 
content = content.replace('liquid-glass border border-gray-200 p-3 rounded-[14px]', 'bg-gray-50 border border-gray-200 p-3 rounded-xl') 
content = content.replace('liquid-glass hover:bg-gray-200 text-gray-900', 'bg-gray-100 hover:bg-gray-200 text-gray-900') 
content = content.replace('text-[14px] bg-gray-100 hover:bg-gray-200 text-gray-900', 'text-[14px] bg-black hover:bg-gray-800 text-white') 
content = content.replace('w-full font-semibold py-[14px] rounded-lg transition-colors text-gray-900 text-[16px] liquid-glass border border-gray-200 hover:bg-gray-200', 'w-full font-semibold py-[14px] rounded-lg transition-colors text-white bg-black hover:bg-gray-800 text-[16px]') 

# Cancel button:
content = content.replace('bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-900', 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-900')
# Link Button in Pass Item
content = content.replace('bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-[14px] rounded-lg transition-colors mb-4 text-[16px] border border-gray-200', 'bg-black hover:bg-gray-800 text-white font-semibold py-[14px] rounded-lg transition-colors mb-4 text-[16px]')

# Fix Close icon
content = content.replace('<svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">', '<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated SurvivalMap UI to light theme successfully.')
