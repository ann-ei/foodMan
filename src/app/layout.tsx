import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "myFood - Personal Cooking Decision Assistant",
  description: "Decide what to cook, rediscover forgotten meals, avoid food waste.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="md:ml-64 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
