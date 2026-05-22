import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import Chatbot from "@/components/Chatbot";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "StreamAura — Your Gateway to Unlimited Entertainment",
    template: "%s | StreamAura",
  },
  description:
    "Discover trending movies, binge-worthy series, and everything in between. StreamAura brings you the best of entertainment with a modern streaming experience.",
  keywords: ["streaming", "movies", "tv shows", "series", "entertainment", "StreamAura"],
  openGraph: {
    title: "StreamAura — Your Gateway to Unlimited Entertainment",
    description: "Discover trending movies, binge-worthy series, and everything in between.",
    siteName: "StreamAura",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  );
}
