"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();

  const userName = user?.name || "Athlete";
  const firstName = userName.split(" ")[0];

  // Time-based greeting
  const [greeting, setGreeting] = useState("Welcome");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) setGreeting("Good morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const dateStr = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    setFormattedDate(dateStr);
  }, []);

  const isRealPhoto = (url?: string) => {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("data:image/")) return true;
    if (url.startsWith("http") && !url.includes("ui-avatars.com")) return true;
    return false;
  };

  const rawAvatar = user?.avatar_url || (user as any)?.avatar;
  const userAvatar = isRealPhoto(rawAvatar)
    ? (rawAvatar as string)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=211f1e&color=ff9a2e&size=160&bold=true`;
  const userStreak = user?.streak || 0;

  // Day & Split Calculation
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const realDayIndex = new Date().getDay();
  const currentDayIndex = (realDayIndex + 6) % 7; // 0 = Mon, 6 = Sun

  const defaultSplit: Record<string, string> = {
    Mon: "Back and Biceps Day",
    Tue: "Chest & Triceps Day",
    Wed: "Legs Day",
    Thu: "Shoulders & Core",
    Fri: "Arms & Biceps",
    Sat: "Full Body Power",
    Sun: "Rest Day",
  };

  const dayName = dayNames[realDayIndex];
  const [splitData, setSplitData] = useState<Record<string, string>>(defaultSplit);

  useEffect(() => {
    const loadSplit = () => {
      try {
        const rawSplit =
          user?.customSplit ||
          (typeof window !== "undefined" ? localStorage.getItem("customSplit") : null);
        if (rawSplit) {
          const splitObj = typeof rawSplit === "string" ? JSON.parse(rawSplit) : rawSplit;
          if (splitObj && typeof splitObj === "object") {
            setSplitData(splitObj);
          }
        }
      } catch (e) {}
    };
    loadSplit();
    window.addEventListener("splitUpdated", loadSplit);
    return () => window.removeEventListener("splitUpdated", loadSplit);
  }, [user]);

  const todayFocus = splitData[dayName] || defaultSplit[dayName] || "Training Protocol";
  const isRestDay =
    todayFocus.toLowerCase().includes("rest") || todayFocus.toLowerCase().includes("recovery");

  // Queued workouts state
  const [queuedWorkouts, setQueuedWorkouts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSets, setActiveSets] = useState<
    { setNum: number; weight: string; reps: string; completed: boolean }[]
  >([]);

  // Active Floor Telemetry
  const [activeFloorCount, setActiveFloorCount] = useState<number>(0);
  const [activeFloorMembers, setActiveFloorMembers] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const updateQueue = () => {
      const q = localStorage.getItem("todaysQueue");
      if (q) {
        try {
          setQueuedWorkouts(JSON.parse(q));
        } catch (e) {}
      } else {
        setQueuedWorkouts([]);
      }
    };
    updateQueue();
    window.addEventListener("queueUpdated", updateQueue);

    // Fetch active floor telemetry
    api
      .getActiveFloorMembers()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setActiveFloorCount(data.length);
          setActiveFloorMembers(data.slice(0, 3));
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("queueUpdated", updateQueue);
  }, []);

  const openWorkoutExecutionModal = (ex: any) => {
    setSelectedWorkout(ex);
    const count = ex.targetSets || 4;
    const defaultReps = ex.targetReps || "10-12";
    const initialSets = Array.from({ length: count }, (_, i) => ({
      setNum: i + 1,
      weight: "",
      reps: defaultReps,
      completed: false,
    }));
    setActiveSets(initialSets);
    setIsModalOpen(true);
  };

  // Metrics calculation
  const weight = Number(user?.weight) || 70;
  const height = Number(user?.height) || 175;
  const bmr = 10 * weight + 6.25 * height - 5 * 25 + 5;
  const tdee = bmr * 1.55;

  let caloriesIntakeTarget = Math.round(tdee);
  const goalStr = (user?.goal || "Clean Hypertrophy").toLowerCase();
  if (goalStr.includes("hypertrophy") || goalStr.includes("bulk")) caloriesIntakeTarget += 300;
  else if (goalStr.includes("fat loss") || goalStr.includes("cut")) caloriesIntakeTarget -= 500;
  else if (goalStr.includes("strength")) caloriesIntakeTarget += 450;

  const caloriesBurnedTarget = Math.round(tdee * 0.22);
  const proteinTarget = Math.round(weight * 2.2);
  const fatsTarget = Math.round((caloriesIntakeTarget * 0.25) / 9);
  const carbsTarget = Math.round(
    (caloriesIntakeTarget - weight * 2.2 * 4 - caloriesIntakeTarget * 0.25) / 4
  );

  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="bg-[#100f0e] text-[#f0ece9] antialiased selection:bg-[#ff9a2e] selection:text-black min-h-screen pb-32">
      {/* Ambient Luxury Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-[#ff9a2e]/10 via-[#ff9a2e]/[0.02] to-transparent blur-3xl pointer-events-none z-0"></div>

      {/* Top App Bar with Frosted Glass */}
      <header className="fixed top-0 left-0 w-full z-40 bg-[#141210]/90 backdrop-blur-xl border-b border-white/[0.04] transition-all">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/profile"
              className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-[#ff9a2e] via-[#ffb877]/40 to-transparent block active:scale-95 transition-transform"
              title="View Athlete Profile"
            >
              <img
                className="w-10 h-10 rounded-full object-cover ring-1 ring-black/40"
                alt="Athlete Avatar"
                src={userAvatar}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#45dfa4] rounded-full ring-2 ring-[#141210] shadow-[0_0_8px_#45dfa4]"></span>
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a28d7c]">
                  AM-TIPPU CLUB
                </span>
                <span className="w-1 h-1 rounded-full bg-[#ff9a2e]"></span>
                <span className="text-[10px] font-bold text-[#ffb877]">
                  {formattedDate || "TODAY"}
                </span>
              </div>
              <h1 className="text-sm font-black text-white tracking-tight flex items-center gap-1">
                <span>{greeting},</span>
                <span className="text-[#ffb877]">{firstName}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/checkin"
              className="w-9 h-9 rounded-full bg-[#1e1c1b] border border-white/5 flex items-center justify-center text-[#ff9a2e] hover:border-[#ff9a2e]/40 transition-all active:scale-90"
              title="RFID Gate Pass"
            >
              <span className="material-symbols-outlined text-[19px]">qr_code_scanner</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 pt-20 px-4 space-y-4 max-w-md mx-auto">
        {/* Holographic Apple-Wallet Style Gate Pass Card */}
        <Link
          href="/dashboard/checkin"
          className="group block relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#1d1b1a] via-[#161514] to-[#0f0e0d] border border-[#ff9a2e]/20 hover:border-[#ff9a2e]/50 shadow-[0_10px_30px_rgba(0,0,0,0.6)] active:scale-[0.98] transition-all duration-200"
        >
          {/* Subtle gold shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff9a2e]/60 to-transparent"></div>
          <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-[#ff9a2e]/10 blur-2xl pointer-events-none group-hover:bg-[#ff9a2e]/15 transition-all"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff9a2e]/20 to-[#ff9a2e]/5 border border-[#ff9a2e]/30 flex items-center justify-center text-[#ff9a2e] shadow-[0_0_15px_rgba(255,154,46,0.2)]">
                <span className="material-symbols-outlined text-[24px]">sensor_door</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-white tracking-wide uppercase">
                    Turnstile RFID Gate
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#45dfa4]/15 border border-[#45dfa4]/30 text-[#45dfa4] text-[9px] font-black tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#45dfa4] animate-pulse"></span>
                    READY
                  </span>
                </div>
                <p className="text-[11px] text-[#a28d7c] font-medium mt-0.5">
                  ID #{user?.id || "3"} • Tap to scan optical QR pass
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#242220] border border-white/5 flex items-center justify-center text-[#a28d7c] group-hover:text-white group-hover:translate-x-0.5 transition-all">
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </div>
        </Link>



        {/* Weekly Habit Rhythm & Streak Tracker */}
        <section className="bg-gradient-to-b from-[#1b1918] to-[#141312] border border-white/[0.05] rounded-2xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#a28d7c] block">
                HABIT DISCIPLINE
              </span>
              <h2 className="text-sm font-black text-white tracking-tight">WEEKLY RHYTHM</h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#ff9a2e]/20 to-[#ff9a2e]/5 border border-[#ff9a2e]/30 text-[#ff9a2e] shadow-[0_0_16px_rgba(255,154,46,0.15)]">
              <span
                className="material-symbols-outlined text-[16px] text-[#ff9a2e]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <span className="text-xs font-black tracking-tight">{userStreak}-day streak</span>
            </div>
          </div>

          {/* Dynamic 7-Day Matrix */}
          <div className="grid grid-cols-7 gap-2 pt-1 pb-1">
            {days.map((day, idx) => {
              const isToday = idx === currentDayIndex;
              const isPast = idx < currentDayIndex;

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold ${
                      isToday ? "text-[#ff9a2e]" : "text-[#756558]"
                    }`}
                  >
                    {day}
                  </span>
                  {isToday ? (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ff9a2e] to-[#ffb877] text-black font-black flex items-center justify-center shadow-[0_0_18px_rgba(255,154,46,0.6)] ring-2 ring-[#ff9a2e]/50 animate-pulse">
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        local_fire_department
                      </span>
                    </div>
                  ) : isPast && userStreak > 0 ? (
                    <div className="w-9 h-9 rounded-full bg-[#ff9a2e]/15 border border-[#ff9a2e]/40 flex items-center justify-center text-[#ff9a2e]">
                      <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#1f1d1c] border border-white/[0.04] flex items-center justify-center text-[#554335]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#554335]"></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/[0.03] flex items-center justify-between text-[10px] text-[#a28d7c]">
            <span>{isRestDay ? "Recovery Window Active" : "Active Training Day"}</span>
            <span className="text-[#ff9a2e] font-semibold">
              {userStreak > 0 ? `${userStreak} sessions uninterrupted` : "Start your streak today"}
            </span>
          </div>
        </section>

        {/* Live Gym Floor Telemetry Pill */}
        <Link
          href="/dashboard/checkin"
          className="flex items-center justify-between p-3 rounded-2xl bg-[#171615] border border-white/[0.04] hover:border-white/10 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  activeFloorCount > 0 ? "bg-[#45dfa4]" : "bg-[#ff9a2e]"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  activeFloorCount > 0 ? "bg-[#45dfa4]" : "bg-[#ff9a2e]"
                }`}
              ></span>
            </span>
            <span className="text-xs font-bold text-white">
              {activeFloorCount > 0
                ? `${activeFloorCount} Athletes on gym floor now`
                : "Gym floor clear • Prime training window"}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#ff9a2e] flex items-center gap-0.5">
            <span>View Floor</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </span>
        </Link>

        {/* Today's Protocol Hero Card */}
        {isRestDay ? (
          <section className="bg-gradient-to-br from-[#1a1c1d] via-[#141617] to-[#101112] border border-white/[0.05] rounded-2xl p-5 relative overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#8dd7ff]/10 blur-3xl pointer-events-none"></div>
            <div className="flex justify-between items-center mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-[#8dd7ff]/15 border border-[#8dd7ff]/30 text-[#8dd7ff] text-[9px] font-extrabold uppercase tracking-wider">
                RECOVERY & REBUILD
              </span>
              <span className="text-[10px] text-[#a28d7c] font-semibold">{dayName} Protocol</span>
            </div>
            <div className="mb-5">
              <h2 className="text-xl font-black text-white tracking-tight">Active Recovery Day</h2>
              <p className="text-xs text-[#a28d7c] mt-1 leading-relaxed">
                Rehydrate, perform mobility drills, and let muscle fibers synthesize protein.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard/workouts"
                className="flex-1 py-3 rounded-full bg-[#242220] hover:bg-[#2e2b29] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
              >
                <span className="material-symbols-outlined text-[16px]">self_care</span>
                <span>Mobility Routines</span>
              </Link>
            </div>
          </section>
        ) : (
          <section className="bg-gradient-to-br from-[#201d1a] via-[#191715] to-[#11100f] border border-[#ff9a2e]/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_16px_36px_rgba(255,154,46,0.12)]">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#ff9a2e]/15 blur-3xl pointer-events-none"></div>
            <div className="flex justify-between items-center mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ff9a2e]/15 border border-[#ff9a2e]/30 text-[#ff9a2e] text-[9px] font-extrabold uppercase tracking-wider">
                TODAY'S TARGET
              </span>
              <span className="text-[10px] text-[#ffb877] font-semibold">
                Slot: {user?.preferredSlot || "Morning Slot"}
              </span>
            </div>
            <div className="mb-5">
              <h2 className="text-xl font-black text-white tracking-tight leading-snug">
                {todayFocus}
              </h2>
              <p className="text-xs text-[#a28d7c] mt-1">
                Target: {user?.goal || "Clean Hypertrophy"} • High Intensity
              </p>
            </div>
            <Link
              href="/dashboard/workouts?tab=queue"
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#ff9a2e] to-[#ffb877] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,154,46,0.35)] active:scale-[0.98] transition-all duration-150"
            >
              <span>Launch Today's Session</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </section>
        )}

        {/* Today's Queued Workouts Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-[#a28d7c] uppercase tracking-wider">
                Today's Workouts
              </span>
              {queuedWorkouts.length > 0 && (
                <span className="px-2 py-0.2 rounded-full bg-[#ff9a2e]/20 text-[#ff9a2e] text-[9px] font-black">
                  {queuedWorkouts.length}
                </span>
              )}
            </div>
            <Link
              href="/dashboard/workouts"
              className="text-[10px] font-bold text-[#ff9a2e] bg-[#ff9a2e]/10 border border-[#ff9a2e]/20 px-3 py-1 rounded-full hover:bg-[#ff9a2e] hover:text-black transition-all flex items-center gap-1"
            >
              <span>+ Add Exercise</span>
            </Link>
          </div>

          {mounted && queuedWorkouts.length === 0 ? (
            <div className="bg-[#181615] border border-white/[0.04] border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2.5">
              <div className="w-12 h-12 rounded-full bg-[#22201e] border border-white/5 flex items-center justify-center text-[#ff9a2e]/70">
                <span className="material-symbols-outlined text-[24px]">fitness_center</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">No exercises queued yet</h3>
                <p className="text-[11px] text-[#a28d7c] mt-0.5 max-w-[220px]">
                  Pick movements from the library to track live reps and sets.
                </p>
              </div>
              <Link href="/dashboard/workouts">
                <button className="mt-1 px-4 py-2 rounded-full bg-[#262422] hover:bg-[#ff9a2e] hover:text-black text-white text-[11px] font-bold active:scale-95 transition-all">
                  Browse Workout Vault
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {mounted &&
                queuedWorkouts.map((ex, i) => (
                  <div
                    key={i}
                    onClick={() => openWorkoutExecutionModal(ex)}
                    className="bg-[#191716] border border-white/[0.05] hover:border-[#ff9a2e]/40 rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-black/60 overflow-hidden shrink-0 border border-white/5 flex items-center justify-center">
                      <img
                        src={`/gif/${ex.gif}`}
                        alt={ex.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-[#ff9a2e] transition-colors truncate">
                        {ex.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-[#ff9a2e] font-bold uppercase">
                          {ex.target}
                        </span>
                        <span className="px-2 py-0.2 rounded-full bg-[#ff9a2e]/15 text-[#ff9a2e] text-[9px] font-black border border-[#ff9a2e]/25">
                          {ex.targetSets || 4} Sets × {ex.targetReps || "10-12"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const nq = queuedWorkouts.filter((_, idx) => idx !== i);
                        setQueuedWorkouts(nq);
                        localStorage.setItem("todaysQueue", JSON.stringify(nq));
                        window.dispatchEvent(new Event("queueUpdated"));
                      }}
                      className="w-7 h-7 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-90 transition-all shrink-0"
                      title="Remove from queue"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Nutrition & Macro Blueprint */}
        <section className="space-y-3 pb-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-extrabold text-[#a28d7c] uppercase tracking-wider">
              Nutrition & Macro Matrix
            </span>
            <Link
              href="/dashboard/progress"
              className="text-[11px] font-bold text-[#ff9a2e] hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {/* Current Bodyweight Card */}
          <div className="bg-[#181615] border border-white/[0.04] rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff9a2e]/10 border border-[#ff9a2e]/20 flex items-center justify-center text-[#ff9a2e]">
                <span className="material-symbols-outlined text-[20px]">monitor_weight</span>
              </div>
              <div>
                <p className="text-[9px] text-[#a28d7c] uppercase font-bold tracking-wider">
                  Current Athlete Weight
                </p>
                <p className="text-lg font-black text-white">
                  {user?.weight ? `${user.weight} kg` : "--"}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/progress"
              className="text-xs font-bold text-[#ff9a2e] bg-[#ff9a2e]/10 border border-[#ff9a2e]/20 px-3 py-1.5 rounded-full hover:bg-[#ff9a2e] hover:text-black transition-all"
            >
              Log Weigh-In
            </Link>
          </div>

          {/* Calorie Grid: Active Burn & Intake */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#181615] p-3.5 rounded-2xl border border-white/[0.04] space-y-2">
              <div className="flex justify-between items-center text-[#a28d7c] text-[10px] font-bold uppercase">
                <span>Active Burn</span>
                <span className="material-symbols-outlined text-[16px] text-[#ff9a2e]">bolt</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">0</span>
                <span className="text-[10px] text-[#a28d7c] font-semibold">
                  / {caloriesBurnedTarget} kcal
                </span>
              </div>
              <div className="w-full bg-[#242220] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#ff9a2e] to-[#ffb877] h-1.5 rounded-full"
                  style={{ width: "0%" }}
                ></div>
              </div>
            </div>

            <div className="bg-[#181615] p-3.5 rounded-2xl border border-white/[0.04] space-y-2">
              <div className="flex justify-between items-center text-[#a28d7c] text-[10px] font-bold uppercase">
                <span>Daily Intake</span>
                <span className="material-symbols-outlined text-[16px] text-[#45dfa4]">
                  restaurant
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">0</span>
                <span className="text-[10px] text-[#a28d7c] font-semibold">
                  / {caloriesIntakeTarget} kcal
                </span>
              </div>
              <div className="w-full bg-[#242220] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#45dfa4] h-1.5 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>
          </div>

          {/* Macro Split Row */}
          <div className="bg-[#181615] p-3 rounded-2xl border border-white/[0.04] flex items-center justify-around text-center">
            <div>
              <span className="text-[9px] font-bold text-[#ffb877] uppercase block tracking-wider">
                PROTEIN
              </span>
              <span className="text-xs font-black text-white mt-0.5 block">
                0 / {proteinTarget}g
              </span>
            </div>
            <div className="w-px h-6 bg-white/[0.06]"></div>
            <div>
              <span className="text-[9px] font-bold text-[#8dd7ff] uppercase block tracking-wider">
                CARBS
              </span>
              <span className="text-xs font-black text-white mt-0.5 block">
                0 / {carbsTarget}g
              </span>
            </div>
            <div className="w-px h-6 bg-white/[0.06]"></div>
            <div>
              <span className="text-[9px] font-bold text-[#ffdcc1] uppercase block tracking-wider">
                FATS
              </span>
              <span className="text-xs font-black text-white mt-0.5 block">
                0 / {fatsTarget}g
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Bottom Navigation Dock */}
      <nav
        aria-label="Primary Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2 pb-safe max-w-md mx-auto pointer-events-none"
      >
        <div className="w-full bg-[#181615]/90 backdrop-blur-xl rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.8)] flex justify-around items-center px-3 py-1.5 pointer-events-auto border border-white/[0.06]">
          <Link
            aria-label="Home"
            href="/dashboard"
            className="flex flex-col items-center justify-center text-[#ff9a2e] p-2 transition-colors duration-200 active:scale-90"
          >
            <span
              className="material-symbols-outlined text-[23px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              home
            </span>
          </Link>
          <Link
            aria-label="Workouts"
            href="/dashboard/workouts"
            className="flex flex-col items-center justify-center text-[#a28d7c] p-2 hover:text-white transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">fitness_center</span>
          </Link>
          <Link
            aria-label="Check-in"
            href="/dashboard/checkin"
            className="flex flex-col items-center justify-center text-[#a28d7c] p-2 hover:text-white transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">groups</span>
          </Link>
          <Link
            aria-label="Progress"
            href="/dashboard/progress"
            className="flex flex-col items-center justify-center text-[#a28d7c] p-2 hover:text-white transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">monitoring</span>
          </Link>
          <Link
            aria-label="Profile"
            href="/dashboard/profile"
            className="flex flex-col items-center justify-center text-[#a28d7c] p-2 hover:text-white transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">person</span>
          </Link>
        </div>
      </nav>

      {/* QUEUED WORKOUT EXECUTION & FORM GUIDE MODAL */}
      {isModalOpen && selectedWorkout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#191716] rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[90vh] flex flex-col overflow-hidden animate-slide-up shadow-2xl">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-[#ff9a2e] uppercase tracking-wider block">
                  Target: {selectedWorkout.target}
                </span>
                <h2 className="text-base font-black text-white leading-tight">
                  {selectedWorkout.name}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedWorkout(null);
                }}
                className="w-8 h-8 rounded-full bg-[#242220] text-[#a28d7c] hover:text-white flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
              {/* Animated GIF Showcase */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/80 border border-white/10 flex items-center justify-center">
                <img
                  src={`/gif/${selectedWorkout.gif}`}
                  alt={selectedWorkout.name}
                  className="w-full h-full object-contain p-2"
                />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-[9px] font-bold text-[#ff9a2e] border border-[#ff9a2e]/30">
                  LIVE FORM GUIDE
                </span>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#242220] border border-white/5 text-[11px] text-[#a28d7c] font-semibold">
                  Equipment: {selectedWorkout.equipment}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#242220] border border-white/5 text-[11px] text-[#a28d7c] font-semibold capitalize">
                  Muscle: {selectedWorkout.muscle_group}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#ff9a2e]/10 border border-[#ff9a2e]/20 text-[11px] text-[#ff9a2e] font-bold">
                  Target: {selectedWorkout.targetSets || 4} Sets ×{" "}
                  {selectedWorkout.targetReps || "10-12"} Reps
                </span>
              </div>

              {/* Execution Steps */}
              {selectedWorkout.steps && selectedWorkout.steps.length > 0 && (
                <div className="bg-[#211f1e] rounded-2xl p-4 border border-white/[0.04]">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#ff9a2e]">
                      fact_check
                    </span>
                    Execution Steps
                  </h3>
                  <ol className="space-y-1.5 text-xs text-[#a28d7c] leading-relaxed list-decimal pl-4">
                    {selectedWorkout.steps.map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Active Set Logger */}
              <div className="bg-[#211f1e] rounded-2xl p-4 border border-white/[0.04] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Live Set Logger
                    </h3>
                    <p className="text-[10px] text-[#a28d7c]">
                      Target: {selectedWorkout.targetSets || 4} Sets •{" "}
                      {selectedWorkout.targetReps || "10-12"} Reps
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeSets.length > 1) {
                          setActiveSets((prev) => prev.slice(0, -1));
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-[#2b2a28] border border-white/5 text-[10px] font-bold text-[#a28d7c] hover:text-white"
                      title="Remove set"
                    >
                      - Set
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSets((prev) => [
                          ...prev,
                          {
                            setNum: prev.length + 1,
                            weight: "",
                            reps: selectedWorkout.targetReps || "10-12",
                            completed: false,
                          },
                        ]);
                      }}
                      className="px-2 py-1 rounded-lg bg-[#ff9a2e]/20 border border-[#ff9a2e]/30 text-[10px] font-bold text-[#ff9a2e] hover:bg-[#ff9a2e]/30"
                      title="Add set"
                    >
                      + Set
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {activeSets.map((s, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                        s.completed
                          ? "bg-[#ff9a2e]/10 border-[#ff9a2e]/40"
                          : "bg-[#1a1918] border-white/5"
                      }`}
                    >
                      <span
                        className={`w-14 text-[11px] font-bold uppercase shrink-0 ${
                          s.completed ? "text-[#ff9a2e]" : "text-[#a28d7c]"
                        }`}
                      >
                        SET {s.setNum}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Weight (kg)"
                            value={s.weight}
                            onChange={(e) => {
                              const updated = [...activeSets];
                              updated[idx].weight = e.target.value;
                              setActiveSets(updated);
                            }}
                            className="w-full bg-[#242220] text-xs text-white placeholder:text-[#a28d7c]/40 px-2.5 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-[#ff9a2e] text-center font-bold"
                          />
                        </div>
                        <span className="text-[#a28d7c] text-xs">×</span>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Reps"
                            value={s.reps}
                            onChange={(e) => {
                              const updated = [...activeSets];
                              updated[idx].reps = e.target.value;
                              setActiveSets(updated);
                            }}
                            className="w-full bg-[#242220] text-xs text-white placeholder:text-[#a28d7c]/40 px-2.5 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-[#ff9a2e] text-center font-bold"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...activeSets];
                          updated[idx].completed = !updated[idx].completed;
                          setActiveSets(updated);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          s.completed
                            ? "bg-[#ff9a2e] text-black font-bold"
                            : "bg-[#242220] text-[#a28d7c] hover:text-white"
                        }`}
                        title={s.completed ? "Mark incomplete" : "Complete set"}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {s.completed ? "check" : "check_box_outline_blank"}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => {
                    const nq = queuedWorkouts.filter(
                      (item) => item.name !== selectedWorkout.name
                    );
                    setQueuedWorkouts(nq);
                    localStorage.setItem("todaysQueue", JSON.stringify(nq));
                    window.dispatchEvent(new Event("queueUpdated"));
                    setIsModalOpen(false);
                    setSelectedWorkout(null);
                  }}
                  className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#ff9a2e] to-[#ffb877] text-black font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(255,154,46,0.3)]"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Mark Done & Complete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
