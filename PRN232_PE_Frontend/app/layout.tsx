import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Post Manager",
  description: "Manage your posts with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
          <main className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-50/50">
            <div className="w-full">
              {children}
            </div>
          </main>
          <Toaster />
      </body>
    </html>
  );
}
