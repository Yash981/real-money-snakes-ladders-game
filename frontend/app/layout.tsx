import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react"
import { WebSocketProvider } from "@/providers/ws-provider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snakes & Ladders | Real Money Gaming",
  description: "Play the classic Snakes & Ladders game with real money stakes. Challenge friends and compete in an exciting multiplayer environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
        >
        <WebSocketProvider backendUrl={process.env.BACKEND_URL as string}>

        <Toaster position="top-center" richColors/>

        {children}
        <Analytics />
        </WebSocketProvider>
      </body>
    </html>
    </ViewTransitions>

  );
}
