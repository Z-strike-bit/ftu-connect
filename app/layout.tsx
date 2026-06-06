import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#FAFBFC] dark:bg-[#090909] text-gray-900 dark:text-white selection:bg-ftu-red-200 dark:selection:bg-[#0099ff] selection:text-ftu-red-900 dark:selection:text-white transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <GlobalChat />
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
