import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import ReduxProvider from "@/redux/Provider";
import { Toaster } from "@/components/ui/toast";
import { Providers } from './providers';
import AuthProvider from '@/components/AuthProvider'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://motoelan.com"),

  title: {
    default: "Motoelan — Azərbaycanda Motosiklet Elanları",
    template: "%s | Motoelan",
  },

  description:
    "Azərbaycanda motosiklet al və sat. Yeni və işlənmiş motosiklet elanlarına bax.",

  openGraph: {
    siteName: "Motoelan",
    locale: "az_AZ",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{children: ReactNode}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <Providers>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster />
          </Providers>
        </ReduxProvider>
      </body>
    </html>
  );
}
