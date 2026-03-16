import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Lora, DM_Sans } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "./lib/AuthContext";
import { Header } from "./components/common/Header";

const lora = Lora({ subsets: ["latin"], variable: "--font-display" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"]
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"]
// });

export const metadata: Metadata = {
  title: "HerMate",
  description: "Your personal mood and mental health companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap');`}</style>
      </head>
      <body
        className={`${lora.variable} ${dmSans.variable} antialiased bg-[var(--color-bg-page)] max-w-sm mx-auto`}
      >
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
