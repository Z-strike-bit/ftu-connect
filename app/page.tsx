import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white gap-8 p-6 mt-10">
      <h1 className="text-5xl md:text-6xl font-black text-black text-center leading-tight">
        Định hình <span className="text-red-600">Tương lai</span><br />
        Sinh viên Ngoại Thương
      </h1>
      <p className="text-lg text-slate-600 text-center max-w-2xl">
        Nền tảng kết nối Mentor-Mentee cao cấp, cung cấp kiến thức thực chiến và hành trang sắc bén nhất để chinh phục 4 năm đại học.
      </p>
      <div className="flex flex-row flex-wrap justify-center gap-4 mt-4">
        <Link href="/login" className="px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-xl whitespace-nowrap hover:bg-red-700 transition">
          Bắt đầu hành trình
        </Link>
        <Link href="/guide" className="px-8 py-4 bg-slate-100 text-slate-800 text-lg font-bold rounded-xl whitespace-nowrap hover:bg-slate-200 transition">
          Tìm hiểu thêm
        </Link>
      </div>
    </main>
  );
}
