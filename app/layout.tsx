import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import GlobalChat from "@/components/GlobalChat";
import Chatbot from "@/components/Chatbot";

export const metadata: Metadata = {
  title: "FTU Connect - Nền tảng kết nối Mentor & Mentee",
  description: "Nền tảng kết nối Mentor và Mentee dành cho sinh viên FTU.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-[#090909] text-white selection:bg-[#0099ff] selection:text-white`}>
        {children}
        <GlobalChat />
        <Chatbot />
      </body>
    </html>
  );
}
