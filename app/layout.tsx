import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "hellolink - Say hello to your links",
  description: "👋 Hello to your ⛓️‍💥 links, all in one 🏠 place.",
  openGraph: {
    title: "HelloLink - Say hello to your links",
    description:
      "HelloLink is the smart link management platform for developers, creators, and animators to create landing pages, showcase work, and share multiple links with a customizable profile.",
    images: ["/thumbnail.png"], // Assuming the image is at /public/thumbnail.png
    url: "https://hellolink.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "HelloLink - Say hello to your links",
    description:
      "HelloLink is the smart link management platform for developers, creators, and animators to create landing pages, showcase work, and share multiple links with a customizable profile.",
    images: ["/thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
