"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 animate-gradient-shift"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-32 right-20 w-48 h-48 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full blur-2xl animate-float-slow-reverse"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-indigo-400/12 to-blue-400/12 rounded-full blur-lg animate-float-medium"></div>
      <div className="absolute top-1/2 right-10 w-36 h-36 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-xl animate-float-medium-reverse"></div>
      
      {/* Moving particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
      
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent animate-pulse-slow"></div>
    </div>
  );
}
