import os

filepath = 'd:/FTU_Connect/app/map/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Floating Card
content = content.replace('liquid-glass p-5 sm:p-6 rounded-[14px]', 'bg-white/95 p-5 sm:p-6 rounded-2xl')
content = content.replace('text-white flex items-center gap-2', 'text-gray-900 flex items-center gap-2')
content = content.replace('text-gray-300 mb-5', 'text-gray-600 mb-5')

# Ghim địa điểm mới button
content = content.replace('liquid-glass hover:bg-[#141414]/20 text-white px-5 py-3', 'bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-900 px-5 py-3')

# Radar filter buttons
content = content.replace('liquid-glass text-white scale-105', 'bg-white text-gray-900 scale-105 shadow-md')
content = content.replace('border-white/60', 'border-gray-300')
content = content.replace('liquid-glass text-gray-300 hover:bg-[#141414]/10', 'bg-white/90 text-gray-600 hover:bg-white hover:text-gray-900')

# Main radar button
content = content.replace('liquid-glass border border-white/20', 'bg-white border border-gray-200')
content = content.replace('text-white rotate-90', 'text-gray-900 rotate-90')
content = content.replace('text-white animate-[spin_3s_linear_infinite]', 'text-gray-900 animate-[spin_3s_linear_infinite]')
content = content.replace('w-8 h-8 text-white', 'w-8 h-8 text-gray-900')
# Ping circles
content = content.replace('border-[#ff385c]', 'border-[#0099ff]') # Just a nicer light mode radar ping color, maybe keep #ff385c, let's keep it

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated map page UI to light theme successfully.')
