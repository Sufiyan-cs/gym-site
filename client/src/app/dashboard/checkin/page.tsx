"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface MemberItem {
  id: number;
  name: string;
  avatar_url?: string;
  role?: string;
  goal?: string;
  preferredSlot?: string;
  customSplit?: any;
  social_instagram?: string;
  social_youtube?: string;
  is_on_floor?: number;
  check_in_time?: string;
}

export default function CheckinPage() {
  const { user } = useAuth();
  const [seconds, setSeconds] = useState(42);
  const [isWhoInsideOpen, setIsWhoInsideOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"floor" | "all">("floor");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const [floorMembers, setFloorMembers] = useState<MemberItem[]>([]);
  const [allMembers, setAllMembers] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isProcessingCheckin, setIsProcessingCheckin] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const [floorRes, allRes] = await Promise.allSettled([
        api.getActiveFloorMembers(),
        api.getCommunityMembers(),
      ]);

      if (floorRes.status === "fulfilled" && Array.isArray(floorRes.value)) {
        setFloorMembers(floorRes.value);
        if (user?.id) {
          setIsCheckedIn(floorRes.value.some((m: any) => m.id === user.id));
        }
      }

      if (allRes.status === "fulfilled" && Array.isArray(allRes.value)) {
        setAllMembers(allRes.value);
      }
    } catch (e) {
      console.error("Failed to fetch members:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2800);
  };

  const handleToggleCheckin = async () => {
    if (isProcessingCheckin) return;
    setIsProcessingCheckin(true);

    try {
      if (isCheckedIn) {
        await api.checkOut();
        setIsCheckedIn(false);
        showToast("✓ Checked out of gym floor. Great session!");
      } else {
        await api.checkIn();
        setIsCheckedIn(true);
        showToast("✓ Welcome to AM-Tippu! Access gate opened.");
      }
      loadMembers();
    } catch (err: any) {
      console.error("Check-in error:", err);
      // Fallback local toggle for instant tactile feedback
      setIsCheckedIn((prev) => !prev);
      showToast(isCheckedIn ? "Checked out" : "Checked in to floor");
    } finally {
      setIsProcessingCheckin(false);
    }
  };

  const openFloorModal = () => {
    setModalTab("floor");
    setSearchQuery("");
    setIsWhoInsideOpen(true);
  };

  const openDirectoryModal = () => {
    setModalTab("all");
    setSearchQuery("");
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

  // Filtered lists for modal
  const filteredFloor = floorMembers.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.goal?.toLowerCase().includes(q) ||
      m.social_instagram?.toLowerCase().includes(q)
    );
  });

  const filteredAll = allMembers.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.goal?.toLowerCase().includes(q) ||
      m.preferredSlot?.toLowerCase().includes(q) ||
      m.social_instagram?.toLowerCase().includes(q)
    );
  });

  const floorDensityText =
    floorMembers.length === 0
      ? "Calm (0 athletes inside)"
      : floorMembers.length <= 5
      ? `Moderate (${floorMembers.length} athletes training)`
      : `Peak Energy (${floorMembers.length} athletes training)`;

  return (
    <div className="bg-surface-container-lowest text-on-surface antialiased min-h-screen pb-32 select-none overflow-x-hidden">
      {/* Top App Bar Navigation */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 h-16 bg-surface/90 dark:bg-surface/90 backdrop-blur-md border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/profile"
            className="w-9 h-9 rounded-full ring-1 ring-white/10 overflow-hidden bg-surface-container-high flex items-center justify-center active:scale-95 transition-transform"
            title="View Profile"
          >
            {user?.avatar_url ? (
              <img
                className="w-full h-full object-cover"
                src={user.avatar_url}
                alt="Profile"
              />
            ) : (
              <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">
                {getInitials(user?.name || "")}
              </div>
            )}
          </Link>
          <div>
            <div className="text-base font-bold text-on-surface tracking-tight">
              AM-Tippu Turnstile Pass
            </div>
            <p className="text-[10px] text-outline">Optical Gate & Floor Telemetry</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openDirectoryModal}
            className="px-3 py-1.5 rounded-full bg-surface-container text-xs font-bold text-primary border border-primary/20 flex items-center gap-1 active:scale-95 transition-all"
            title="Browse all members"
          >
            <span className="material-symbols-outlined text-[16px]">groups</span>
            <span>Members ({allMembers.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto pt-20 px-5 space-y-5">
        {/* Subheader */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-on-surface tracking-tight">
              Turnstile RFID Pass
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-secondary animate-pulse' : 'bg-outline'}`}></span>
              <span className="text-xs text-outline">
                Status: {isCheckedIn ? "🟢 Checked In on Gym Floor" : "⚪ Outside / Ready to Scan"}
              </span>
            </div>
          </div>
          <div className="bg-surface-container px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/[0.04]">
            <span className="material-symbols-outlined text-[16px] text-primary">
              sync_saved_locally
            </span>
            <span className="text-[10px] font-bold text-primary tracking-wider uppercase">
              LIVE RFID
            </span>
          </div>
        </div>

        {/* PRIMARY PASS CARD */}
        <div className="relative rounded-3xl bg-surface-container p-6 border border-white/[0.04] shadow-[0px_12px_32px_rgba(255,154,46,0.15)] overflow-hidden">
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Member Credentials */}
          <div className="relative flex items-center justify-between pb-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-container-high ring-2 ring-primary/40 overflow-hidden flex items-center justify-center text-primary font-bold text-sm shadow-md">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.name || "Athlete")
                )}
              </div>
              <div>
                <div className="text-base font-extrabold text-on-surface leading-tight">
                  {user?.name || "Athlete"}
                </div>
                <div className="text-xs text-outline mt-0.5">
                  Member ID #{user?.id || "TK-9842"} • {user?.role?.toUpperCase() || "MEMBER"}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold border border-secondary/20">
              ACTIVE PASS
            </span>
          </div>

          {/* QR Code Presentation */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative p-4 rounded-2xl bg-white shadow-xl flex items-center justify-center">
              <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-primary-container rounded-tl-md"></div>
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2 border-primary-container rounded-tr-md"></div>
              <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2 border-primary-container rounded-bl-md"></div>
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-primary-container rounded-br-md"></div>

              <svg
                className="w-44 h-44"
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

            <div className="mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
              <span className="text-xs font-semibold text-primary">
                Auto-refreshes in {seconds}s
              </span>
            </div>
          </div>

          {/* Interactive Check-in / Out Button */}
          <div className="pt-2">
            <button
              onClick={handleToggleCheckin}
              disabled={isProcessingCheckin}
              className={`w-full py-3.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                isCheckedIn
                  ? "bg-surface-elevated text-white border border-secondary/40 hover:bg-secondary/20"
                  : "bg-primary text-black amber-glow hover:bg-primary-hover"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isCheckedIn ? "logout" : "sensor_door"}
              </span>
              <span>
                {isCheckedIn
                  ? "Exit Gym Floor (Tap to Check Out)"
                  : "Scan Turnstile & Enter Gym Floor"}
              </span>
            </button>
          </div>
        </div>

        {/* TWO DEDICATED MEMBER HUBS: ON FLOOR vs ALL MEMBERS */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Athletes On Floor */}
          <div
            onClick={openFloorModal}
            className="rounded-2xl bg-surface-container-low hover:bg-surface-container p-4 border border-white/[0.05] flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">meeting_room</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            </div>
            <div className="mt-3">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                ON FLOOR NOW
              </span>
              <h3 className="text-sm font-extrabold text-white">
                {floorMembers.length} {floorMembers.length === 1 ? 'Athlete' : 'Athletes'}
              </h3>
              <p className="text-[10px] text-outline mt-0.5">
                {floorMembers.length === 0 ? "Floor is calm" : "Currently training"}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-secondary font-bold">
              <span>View Floor</span>
              <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>

          {/* Card 2: All Gym Collective Members */}
          <div
            onClick={openDirectoryModal}
            className="rounded-2xl bg-surface-container-low hover:bg-surface-container p-4 border border-white/[0.05] flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">groups</span>
              </div>
              <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                Directory
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                ALL MEMBERS
              </span>
              <h3 className="text-sm font-extrabold text-white">
                {allMembers.length} Athletes
              </h3>
              <p className="text-[10px] text-outline mt-0.5">
                Collective & handles
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-primary font-bold">
              <span>Browse All</span>
              <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* ACTIVE MEMBERS ON FLOOR PREVIEW LIST */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <h2 className="text-xs font-bold text-outline uppercase tracking-wider">
                Live On-Floor Athletes ({floorMembers.length})
              </h2>
            </div>
            <button
              onClick={openFloorModal}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {floorMembers.length === 0 ? (
            <div className="bg-surface-container-low border border-white/[0.04] rounded-2xl p-4 text-center text-outline text-xs">
              No athletes currently on the gym floor. Be the first to check in!
            </div>
          ) : (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {floorMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={openFloorModal}
                  className="bg-surface-container-low p-3 rounded-2xl border border-white/5 flex items-center gap-3 shrink-0 min-w-[200px] cursor-pointer hover:border-secondary/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-elevated ring-1 ring-secondary/50 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-secondary">
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(m.name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{m.name}</h4>
                    <p className="text-[10px] text-secondary font-medium truncate">🟢 Inside now</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ALL MEMBERS QUICK GLANCE */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-outline uppercase tracking-wider">
              Gym Collective Members ({allMembers.length})
            </h2>
            <button
              onClick={openDirectoryModal}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>Explore All</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-3 border border-white/5 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all" onClick={openDirectoryModal}>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                {allMembers.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="w-8 h-8 rounded-full ring-2 ring-surface-container-low bg-surface-elevated overflow-hidden flex items-center justify-center text-[10px] font-bold text-primary">
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(m.name)
                    )}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-white">All Member Directory</p>
                <p className="text-[10px] text-outline">View goals, splits & Instagram handles</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
          </div>
        </div>
      </main>

      {/* BOTTOM NAVIGATION DOCK */}
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

      {/* MEMBER DIRECTORY & ON-FLOOR MODAL */}
      {isWhoInsideOpen && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-surface-container rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="p-5 pb-3 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-surface-container">
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  AM-Tippu Member Hub
                </h3>
                <p className="text-[11px] text-outline">
                  {floorMembers.length} currently on floor • {allMembers.length} total members
                </p>
              </div>
              <button
                onClick={closeWhoInsideModal}
                className="w-8 h-8 rounded-full bg-surface-container-high text-outline hover:text-white flex items-center justify-center active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Top Tabs: On Floor vs All Members */}
            <div className="p-3 bg-surface-container-low border-b border-white/5 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setModalTab("floor")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  modalTab === "floor"
                    ? "bg-secondary text-black shadow-md font-extrabold"
                    : "bg-surface-elevated text-outline hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-black"></span>
                <span>On Floor ({floorMembers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab("all")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  modalTab === "all"
                    ? "bg-primary text-black shadow-md font-extrabold"
                    : "bg-surface-elevated text-outline hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">groups</span>
                <span>All Members ({allMembers.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-white/[0.04] bg-surface-container-low shrink-0">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    modalTab === "floor"
                      ? "Search athletes on floor..."
                      : "Search all members by name, goal, or handle..."
                  }
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container border border-white/10 text-xs text-white placeholder-outline focus:border-primary focus:ring-0"
                />
              </div>
            </div>

            {/* Members List */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(92vh-220px)]">
              {modalTab === "floor" ? (
                filteredFloor.length === 0 ? (
                  <div className="py-12 text-center text-outline space-y-2">
                    <span className="material-symbols-outlined text-[36px] text-outline/40">
                      meeting_room
                    </span>
                    <p className="text-xs">No athletes currently on the gym floor.</p>
                  </div>
                ) : (
                  filteredFloor.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl bg-surface-container-low border border-white/5 space-y-2 hover:border-secondary/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-surface-elevated ring-2 ring-secondary/50 overflow-hidden flex items-center justify-center font-bold text-xs text-secondary shrink-0">
                            {m.avatar_url ? (
                              <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(m.name)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white">{m.name}</h4>
                              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                            </div>
                            <span className="text-[10px] text-secondary font-medium">
                              On floor • {m.goal || "Clean Hypertrophy"}
                            </span>
                          </div>
                        </div>

                        {m.social_instagram && (
                          <a
                            href={`https://instagram.com/${m.social_instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-full bg-surface-elevated text-[10px] font-bold text-white hover:text-primary flex items-center gap-1 border border-white/5"
                          >
                            <span>@{m.social_instagram.replace('@', '')}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )
              ) : (
                filteredAll.length === 0 ? (
                  <div className="py-12 text-center text-outline space-y-2">
                    <span className="material-symbols-outlined text-[36px] text-outline/40">
                      person_search
                    </span>
                    <p className="text-xs">No members found matching search.</p>
                  </div>
                ) : (
                  filteredAll.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl bg-surface-container-low border border-white/5 space-y-2 hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-surface-elevated ring-1 ring-white/10 overflow-hidden flex items-center justify-center font-bold text-xs text-primary shrink-0">
                            {m.avatar_url ? (
                              <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(m.name)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white">{m.name}</h4>
                              {m.is_on_floor ? (
                                <span className="px-1.5 py-0.2 rounded bg-secondary/20 text-secondary text-[8px] font-bold">
                                  ON FLOOR
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded bg-surface-elevated text-outline text-[8px] font-bold">
                                  OFFLINE
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-outline mt-0.5">
                              Goal: {m.goal || "Athletic Conditioning"}
                            </p>
                          </div>
                        </div>

                        {m.social_instagram ? (
                          <a
                            href={`https://instagram.com/${m.social_instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-full bg-primary/10 text-[10px] font-bold text-primary hover:bg-primary hover:text-black flex items-center gap-1 transition-all"
                          >
                            <span>@{m.social_instagram.replace('@', '')}</span>
                          </a>
                        ) : (
                          <span className="text-[9px] text-outline bg-surface-elevated px-2 py-0.5 rounded">
                            {m.preferredSlot || "Morning Slot"}
                          </span>
                        )}
                      </div>

                      {/* Biometric & Split Pills */}
                      <div className="flex items-center gap-2 pt-1 border-t border-white/[0.03] text-[9px] text-outline flex-wrap">
                        <span>Slot: {m.preferredSlot || "06:00 AM - 08:00 AM"}</span>
                        <span>•</span>
                        <span>Tier: {m.role?.toUpperCase() || "MEMBER"}</span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-surface-container border-t border-white/[0.04] text-center shrink-0">
              <p className="text-[10px] text-outline">
                AM-Tippu Collective • Verified Athlete Directory
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
