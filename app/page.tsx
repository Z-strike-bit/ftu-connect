import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 liquid-glass flex items-center justify-between px-6 py-4 md:px-12 border-b border-white/10">
        <div className="font-bold text-xl text-white tracking-tight">
          FTU Connect
        </div>
        
        {/* Menu Links */}
        <div className="hidden md:flex space-x-8">
          <Link href="/map" className="text-white hover:text-white/80 transition-colors font-medium text-[16px]">
            Bản Đồ
          </Link>
          <Link href="/market" className="text-white hover:text-white/80 transition-colors font-medium text-[16px]">
            Góc Pass Đồ
          </Link>
          <Link href="/events" className="text-white hover:text-white/80 transition-colors font-medium text-[16px]">
            Sự Kiện CLB
          </Link>
          <Link href="/about" className="text-white hover:text-white/80 transition-colors font-medium text-[16px]">
            Về Chúng Tôi
          </Link>
        </div>

        {/* CTA */}
        <div>
          <Link href="/login" className="px-5 py-2.5 bg-white text-ink text-sm font-medium rounded-full hover:bg-surface-soft transition-colors shadow-sm">
            Đăng nhập
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 text-center mt-16">
        <h1 className="text-4xl md:text-[56px] font-bold text-white max-w-4xl leading-[1.15] tracking-tight animate-fade-rise">
          Nền tảng sinh tồn & Kết nối tại Chùa Láng.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-white/95 max-w-2xl font-normal leading-relaxed animate-fade-rise-delay">
          Khám phá quán ăn ngon, săn giáo trình cũ và không bỏ lỡ bất kỳ sự kiện nào từ MaC, Dynamic, FSC... Dành riêng cho sinh viên Ngoại Thương.
        </p>
        <Link
          href="/map"
          className="mt-10 px-8 py-4 liquid-glass text-white text-lg font-medium rounded-full hover:bg-white/20 transition-all duration-300 animate-fade-rise-delay-2 flex items-center gap-2 group"
        >
          Khám phá Bản Đồ ngay
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
