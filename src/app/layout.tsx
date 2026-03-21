import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "myFood - Personal Cooking Decision Assistant",
  description: "Decide what to cook, rediscover forgotten meals, avoid food waste.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Don't show navbar on auth pages
  const showNavbar = !!session?.user;

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {showNavbar && <Navbar userName={session?.user?.name} />}
          <main className={showNavbar ? "md:ml-64 pb-20 md:pb-8" : ""}>
            <div className={showNavbar ? "max-w-6xl mx-auto p-4 md:p-8" : ""}>{children}</div>
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
