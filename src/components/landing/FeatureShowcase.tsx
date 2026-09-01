import React, { useState, useEffect, useRef } from "react";
import { FEATURES } from "./feature-showcase-data";
import { cn } from "@/lib/utils";

export function FeatureShowcase() {
  const [state, setState] = useState({ activeIdx: 0, progress: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const pauseUntilRef = useRef<number>(0);
  const touchStartRef = useRef<number | null>(null);

  const { activeIdx, progress } = state;
  const currentFeature = FEATURES[activeIdx];

  // Auto-rotation timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      // Skip updates if user manually paused or is hovering
      if (now < pauseUntilRef.current || isHovered) {
        return;
      }

      setState((prev) => {
        if (prev.progress >= 100) {
          return {
            activeIdx: (prev.activeIdx + 1) % FEATURES.length,
            progress: 0,
          };
        }
        return {
          ...prev,
          progress: prev.progress + 1, // 30ms tick represents 1% of 3000ms duration (3 seconds)
        };
      });
    }, 30);

    return () => clearInterval(timer);
  }, [isHovered]);

  const handleTabClick = (idx: number) => {
    setState({ activeIdx: idx, progress: 0 });
    // Pause auto-rotation for 8 seconds
    pauseUntilRef.current = Date.now() + 8000;
  };

  const handleMouseEnter = () => {
    // Only pause on devices that actually support hovering (e.g. have a mouse)
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      setIsHovered(false);
    }
  };

  // Mobile touch swiping handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped left -> load next feature
        const nextIdx = (activeIdx + 1) % FEATURES.length;
        handleTabClick(nextIdx);
      } else {
        // Swiped right -> load previous feature
        const prevIdx = (activeIdx - 1 + FEATURES.length) % FEATURES.length;
        handleTabClick(prevIdx);
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div className="w-full">
      {/* Horizontally scrollable tab buttons on mobile, centered grid/flex on desktop */}
      <div className="flex justify-start md:justify-center items-center gap-2 mb-16 bg-gray-50 p-2 rounded-2xl border border-gray-100 max-w-full overflow-x-auto scrollbar-none mx-auto w-fit snap-x">
        {FEATURES.map((feat, index) => {
          const Icon = feat.icon;
          const isActive = activeIdx === index;
          return (
            <div key={feat.id} className="relative flex flex-col snap-center shrink-0">
              <button
                onClick={() => handleTabClick(index)}
                className={cn(
                  "relative overflow-hidden flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/30",
                  isActive
                    ? "bg-[#FEE2E2] border border-[#CC1100] text-[#CC1100] shadow-sm"
                    : "text-gray-500 hover:text-gray-900 border border-transparent hover:bg-gray-100/50",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="text-[10px] opacity-60 font-medium">0{index + 1}</span>
                {feat.title}
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Tab Info - removed key to prevent abrupt remounting, using smooth CSS transitions */}
      <div className="text-center mb-16 max-w-3xl mx-auto px-4 transition-all duration-500">
        <span className="inline-block bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2.5 py-1 rounded mb-4 uppercase tracking-wider">
          {currentFeature.badge}
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 transition-all duration-500">
          {currentFeature.subtitle}
        </h2>
        <p className="text-gray-500 text-base leading-relaxed transition-all duration-500">
          {currentFeature.description}
        </p>
      </div>

      {/* Dashboard Preview Representation - Keep static to prevent frame flashing */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-w-5xl mx-auto p-4 md:p-6 bg-gradient-to-tr from-gray-50 to-white transition-all duration-500"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-inner bg-card h-80 md:h-[480px] flex flex-col">
          {/* Fake App Window top bar */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full bg-red-400" />
              <div className="size-3 rounded-full bg-yellow-400" />
              <div className="size-3 rounded-full bg-green-400" />
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Virrat Reach Dashboard Preview
            </div>
            <div className="w-12" />
          </div>

          {/* App Layout preview */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 md:w-48 bg-gray-50 border-r border-gray-200 flex flex-col p-2 gap-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-full hidden md:block" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-2 items-center p-2 rounded hover:bg-gray-100">
                  <div className="size-5 bg-gray-300 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-20 hidden md:block" />
                </div>
              ))}
            </div>

            {/* Content area - removed key for smooth in-place transitions instead of sharp remounts */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 transition-all duration-500">
              {currentFeature.renderPreview()}
            </div>
          </div>
        </div>

        {/* Float badges */}
        <div className="absolute bottom-10 left-10 hidden md:block space-y-3 pointer-events-none">
          <div className="bg-white px-3.5 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#CC1100]/10 rounded-full flex items-center justify-center text-[#CC1100] font-bold text-[10px]">
              API
            </div>
            <span className="text-xs font-bold text-gray-700">Official WhatsApp API</span>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2.5">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold text-[10px]">
              QR
            </div>
            <span className="text-xs font-bold text-gray-700">WhatsApp QR scan</span>
          </div>
        </div>
        <div className="absolute bottom-10 right-10 hidden md:block pointer-events-none">
          <div className="bg-white px-3.5 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2.5">
            <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-500 font-bold text-[10px]">
              TG
            </div>
            <span className="text-xs font-bold text-gray-700">Telegram Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
