"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Carrot, ShoppingCart, CalendarDays, LogOut } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/pantry", label: "Pantry", icon: Carrot },
  { href: "/shopping-list", label: "Shopping", icon: ShoppingCart },
  { href: "/meal-planner", label: "Planner", icon: CalendarDays },
];

export function Navbar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 border-r bg-card flex-col z-50">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🥗</span>
            <span className="text-xl font-bold text-primary">myFood</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium truncate">{userName || "User"}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-3 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
