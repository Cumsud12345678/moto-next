import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import ReduxProvider from "@/redux/Provider";
import { Toaster } from "@/components/ui/toast";
import { Providers } from "./providers";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.SITE_URL!

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Motoelan — Azərbaycanda Motosiklet Elanları",
    template: "%s | Motoelan",
  },

  description:
    "Azərbaycanda motosiklet al və sat. Yeni və işlənmiş motosiklet elanlarına bax.",

  applicationName: "Motoelan",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "az_AZ",
    siteName: "Motoelan",
    title: "Motoelan — Azərbaycanda Motosiklet Elanları",
    description:
      "Azərbaycanda motosiklet al və sat. Yeni və işlənmiş motosiklet elanlarına bax.",
    url: "/",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Motoelan — Motosiklet Elanları",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Motoelan — Azərbaycanda Motosiklet Elanları",
    description:
      "Azərbaycanda motosiklet al və sat. Yeni və işlənmiş motosiklet elanlarına bax.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="az"
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