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
    title: "hellolink - Say hello to your links",
    description:
      "HelloLink simplifies link sharing with a single, customizable profile.",
    images: ["/thumbnail.png"], // Assuming the image is at /public/thumbnail.png
    url: "https://hellolink.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "hello link - Say hello to your links",
    description:
      "HelloLink simplifies link sharing with a single, customizable profile.",
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
