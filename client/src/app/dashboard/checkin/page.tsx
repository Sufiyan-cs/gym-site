"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function CheckinPage() {
  const { user } = useAuth();
  const [seconds, setSeconds] = useState(42);
  const [isWhoInsideOpen, setIsWhoInsideOpen] = useState(false);
  const [insideFilter, setInsideFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const openWhoInsideModal = () => {
    setInsideFilter("All");
    setIsWhoInsideOpen(true);
  };

  const closeWhoInsideModal = () => {
    setIsWhoInsideOpen(false);
  };

  const getInitials = (name: string) => {
    if (!name) return "AT";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface antialiased min-h-screen pb-32 select-none overflow-x-hidden">
      {/* Top App Bar Navigation Component (Docked full-width top-0) */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin h-16 bg-surface/90 dark:bg-surface/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/profile"
            className="w-9 h-9 rounded-full ring-1 ring-white/10 overflow-hidden bg-surface-container-high flex items-center justify-center active:scale-95 transition-transform"
            title="View Profile"
          >
            {user?.avatar ? (
              <img
                className="w-full h-full object-cover"
                src={user.avatar}
                alt="Profile"
              />
            ) : (
              <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">
                {getInitials(user?.name || "")}
              </div>
            )}
          </Link>
          <div>
            <div className="text-headline-sm font-headline-sm font-bold text-on-surface dark:text-on-surface tracking-tight">
              AM-Tippu
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Notifications"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container text-outline hover:text-primary transition-colors duration-200 active:scale-95 transition-transform duration-150"
          >
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Container with Native Mobile Margins */}
      <main className="max-w-md mx-auto pt-20 px-margin space-y-space-lg">
        {/* Screen Sub-header Status Bar */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">
              Turnstile Pass
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse"></span>
              <span className="text-label-md font-label-md text-outline">
                AM-Tippu Gym • Open until 11:00 PM
              </span>
            </div>
          </div>
          <div className="bg-surface-container px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/[0.04]">
            <span className="material-symbols-outlined text-[16px] text-primary">
              sync_saved_locally
            </span>
            <span className="text-label-caps font-label-caps text-primary">
              LIVE RFID
            </span>
          </div>
        </div>

        {/* PRIMARY PASS CARD: Hero Turnstile Access Pass */}
        <div className="relative rounded-3xl bg-surface-container p-6 border border-white/[0.04] shadow-[0px_12px_32px_rgba(255,154,46,0.15)] overflow-hidden">
          {/* Ambient Ember Atmospheric Underglow */}
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
          {/* Card Top: Member Credentials */}
          <div className="relative flex items-center justify-between pb-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-surface-container-high ring-1 ring-white/10 flex items-center justify-center text-primary font-bold text-body-lg">
                {getInitials(user?.name || "")}
              </div>
              <div>
                <div className="text-body-lg font-headline-sm font-semibold text-on-surface leading-tight">
                  {user?.name || "Athlete"}
                </div>
                <div className="text-label-md font-label-md text-outline">
                  Membership ID #{user?.id || "TK-9842"}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container text-label-caps font-label-caps shadow-sm">
              ELITE ATHLETE
            </span>
          </div>

          {/* Scannable High-Contrast Matrix Anchor */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative p-4 rounded-2xl bg-white shadow-xl flex items-center justify-center">
              {/* Outer Optical Finder Accents in Soft Molten Amber */}
              <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-primary-container rounded-tl-md"></div>
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2 border-primary-container rounded-tr-md"></div>
              <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2 border-primary-container rounded-bl-md"></div>
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-primary-container rounded-br-md"></div>

              {/* Stylized High-Readability Geometric QR Pattern */}
              <svg
                className="w-48 h-48"
                fill="none"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect fill="#0C0B0A" height="50" rx="10" width="50" x="10" y="10" />
                <rect fill="#FFFFFF" height="30" rx="5" width="30" x="20" y="20" />
                <rect fill="#0C0B0A" height="18" rx="3" width="18" x="26" y="26" />
                <rect fill="#0C0B0A" height="50" rx="10" width="50" x="140" y="10" />
                <rect fill="#FFFFFF" height="30" rx="5" width="30" x="150" y="20" />
                <rect fill="#0C0B0A" height="18" rx="3" width="18" x="156" y="26" />
                <rect fill="#0C0B0A" height="50" rx="10" width="50" x="10" y="140" />
                <rect fill="#FFFFFF" height="30" rx="5" width="30" x="20" y="150" />
                <rect fill="#0C0B0A" height="18" rx="3" width="18" x="26" y="156" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="70" y="15" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="90" y="15" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="110" y="15" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="70" y="35" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="110" y="35" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="90" y="55" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="15" y="70" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="35" y="70" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="15" y="110" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="35" y="110" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="50" y="90" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="145" y="70" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="175" y="70" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="145" y="90" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="165" y="110" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="70" y="145" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="90" y="165" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="110" y="145" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="145" y="145" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="165" y="165" />
                <rect fill="#0C0B0A" height="12" rx="3" width="12" x="145" y="175" />
                <rect fill="#0C0B0A" height="40" rx="8" width="40" x="80" y="80" />
                <circle cx="100" cy="100" fill="#FF9A2E" r="14" />
                <path
                  d="M96 95L100 105L104 95"
                  stroke="#0C0B0A"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            {/* Dynamic Auto-Refresh Indicator */}
            <div className="mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
              <span className="text-label-md font-label-md text-primary">
                Auto-refreshes in {seconds}s
              </span>
            </div>
          </div>

          {/* Card Bottom Guidance Footer */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2 text-outline">
            <span className="material-symbols-outlined text-[18px] text-primary">
              contactless
            </span>
            <span className="text-body-md font-body-md text-outline">
              Hold near turnstile optical scanner to enter or exit
            </span>
          </div>
        </div>

        {/* Facility Density & Ambiance Glance Card (Clickable to open Who's Inside) */}
        <div
          onClick={openWhoInsideModal}
          className="rounded-2xl bg-surface-container-low hover:bg-surface-container p-4 border border-white/[0.04] flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="text-label-lg font-label-lg text-on-surface font-bold">
                  Floor Density: Calm (0 athletes inside)
                </span>
              </div>
              <span className="text-label-md font-label-md text-outline">
                Tap to see active members &amp; social handles
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-surface-container-lowest bg-surface-container-high"></div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-surface-container-lowest bg-surface-container-high"></div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-surface-container-lowest bg-surface-container-high"></div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-white group-hover:translate-x-0.5 transition-all">
              chevron_right
            </span>
          </div>
        </div>

        {/* ATHLETES CURRENTLY TRAINING ON FLOOR PREVIEW */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <h2 className="text-xs font-bold text-outline uppercase tracking-wider">
                Active Members On Floor
              </h2>
            </div>
            <button
              onClick={openWhoInsideModal}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>View All (0)</span>
              <span className="material-symbols-outlined text-[14px]">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Horizontal Carousel of Members with Real Photos, Streaks & Social Links */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-margin px-margin pb-1 pt-1">
            <div className="py-4 text-center text-outline w-full text-xs">
              No athletes currently on the floor
            </div>
          </div>
        </div>

        {/* RECENT CHECK-IN LOGS SECTION */}
        <div className="space-y-space-md pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-headline-sm text-on-surface">
              Recent Access Logs
            </h2>
            <Link
              className="text-label-caps font-label-caps text-primary hover:underline"
              href="#"
            >
              VIEW ALL
            </Link>
          </div>
          <div className="rounded-2xl bg-surface-container-low border border-white/[0.04] p-8 text-center">
            <div className="flex flex-col items-center justify-center text-outline space-y-2">
              <span className="material-symbols-outlined text-[32px] text-outline/50">
                history
              </span>
              <p className="text-xs">No recent access logs found.</p>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM NAVIGATION DOCK (Unified Stitch Component) */}
      <nav
        aria-label="Primary Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2 pb-safe max-w-md mx-auto pointer-events-none"
      >
        <div className="w-full bg-surface-container-high/90 dark:bg-surface-container-high/90 backdrop-blur-xl rounded-full shadow-[0px_12px_32px_rgba(255,154,46,0.15)] flex justify-around items-center px-3 py-1.5 pointer-events-auto border border-white/[0.06]">
          <Link
            aria-label="Home"
            href="/dashboard"
            className="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">home</span>
          </Link>

          <Link
            aria-label="Workouts"
            href="/dashboard/workouts"
            className="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">
              fitness_center
            </span>
          </Link>

          <Link
            aria-current="page"
            aria-label="Check-in"
            href="/dashboard/checkin"
            className="flex flex-col items-center justify-center text-on-surface dark:text-on-surface p-2 after:content-[''] after:w-1.5 after:h-1.5 after:bg-primary-container after:rounded-full after:mt-1 active:scale-90 transition-transform duration-200"
          >
            <span
              className="material-symbols-outlined text-[23px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              qr_code_scanner
            </span>
          </Link>

          <Link
            aria-label="Progress"
            href="/dashboard/progress"
            className="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">
              monitoring
            </span>
          </Link>

          <Link
            aria-label="Profile"
            href="/dashboard/profile"
            className="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">person</span>
          </Link>
        </div>
      </nav>

      {/* WHO'S INSIDE AM-TIPPU GYM FLOOR MODAL */}
      {isWhoInsideOpen && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-surface-container rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-surface-container">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[22px]">
                    groups
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Athletes Inside AM-Tippu
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  </div>
                  <p className="text-[11px] text-outline">
                    0 athletes active • Verified optical turnstile scan
                  </p>
                </div>
              </div>
              <button
                onClick={closeWhoInsideModal}
                className="w-8 h-8 rounded-full bg-surface-container-high text-outline hover:text-white flex items-center justify-center active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>

            {/* Live Search & Floor Zone Filters */}
            <div className="p-4 border-b border-white/[0.04] space-y-3 bg-surface-container-low shrink-0">
              {/* Search Input */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members by name, zone, or handle..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-container border border-white/10 text-xs text-white placeholder-outline focus:border-primary focus:ring-0"
                />
              </div>

              {/* Zone Filter Pills */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                {["All", "Barbell", "Cardio", "Top Streaks"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setInsideFilter(filter)}
                    className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap active:scale-95 transition-all ${
                      insideFilter === filter
                        ? "font-bold bg-secondary text-black"
                        : "font-semibold bg-surface-container-high text-outline hover:text-white"
                    }`}
                  >
                    {filter === "All"
                      ? "All Inside (0)"
                      : filter === "Barbell"
                      ? "🏋️ Barbell Zone"
                      : filter === "Cardio"
                      ? "🏃 Turf & Cardio"
                      : "🔥 Top Streaks"}
                  </button>
                ))}
              </div>
            </div>

            {/* Inside Athletes List */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(92vh-210px)]">
              <div className="py-10 text-center text-outline space-y-2">
                <span className="material-symbols-outlined text-[32px] text-outline/50">
                  person_search
                </span>
                <p className="text-xs">
                  No athletes found matching this filter.
                </p>
              </div>
            </div>

            {/* Sticky Footer Notice */}
            <div className="p-3 bg-surface-container border-t border-white/[0.04] text-center shrink-0">
              <p className="text-[10px] text-outline">
                Turnstile Gate 1 & 2 Live Telemetry • Updated just now
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-[70] bg-surface-container-high border border-primary/40 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 ${
          toastMessage
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <span className="material-symbols-outlined text-[16px] text-primary">
          check_circle
        </span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
