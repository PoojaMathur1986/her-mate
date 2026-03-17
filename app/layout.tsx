import type { Metadata } from "next";
import { Lora, DM_Sans } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "./lib/AuthContext";
import { Header } from "./components/common/Header";
import { PWARegister } from "./lib/PWARegister";

const lora = Lora({ subsets: ["latin"], variable: "--font-display" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "HerMate",
  description: "Your personal mood and mental health companion",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HerMate",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=yes"
        />
        <meta name="theme-color" content="#F5B7D1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="HerMate" />
        <link rel="manifest" href="/manifest.json" />
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap');`}</style>
      </head>
      <body
        className={`${lora.variable} ${dmSans.variable} antialiased bg-[var(--color-bg-page)] max-w-sm mx-auto`}
      >
        <PWARegister />
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
