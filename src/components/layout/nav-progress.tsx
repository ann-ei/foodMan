"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";

export function NavProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset when navigation completes
    setLoading(false);
    setProgress(0);
  }, [pathname]);

  useEffect(() => {
    if (!loading) return;

    // Animate progress bar
    setProgress(20);
    const t1 = setTimeout(() => setProgress(50), 100);
    const t2 = setTimeout(() => setProgress(70), 300);
    const t3 = setTimeout(() => setProgress(85), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [loading]);

  useEffect(() => {
    // Listen for clicks on links to start loading
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (href && href.startsWith("/") && href !== pathname) {
        setLoading(true);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
