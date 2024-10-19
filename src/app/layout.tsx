"use client"

import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProjectProvider } from '@/components/ProjectContext'
import { useState } from 'react';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ProjectProvider>
            <Sidebar onToggle={(isOpen) => setIsSidebarOpen(isOpen)} />
            <main className={`p-4 transition-all duration-300 ${isSidebarOpen ? 'sm:ml-[250px]' : 'sm:ml-0'}`}>
              {children}
            </main>
          </ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}