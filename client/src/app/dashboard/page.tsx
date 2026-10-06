"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  const userName = user?.name || "Athlete";
  const firstName = userName.split(" ")[0];

  const isRealPhoto = (url?: string) => {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('data:image/')) return true;
    if (url.startsWith('http') && !url.includes('ui-avatars.com')) return true;
    return false;
  };

  const rawAvatar = user?.avatar_url || (user as any)?.avatar;
  const userAvatar = isRealPhoto(rawAvatar)
    ? (rawAvatar as string)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=2b2a28&color=ffb877&size=120`;
  const userStreak = user?.streak || 0;
  
  // Calculate current day index (0 = Monday, 6 = Sunday for this display)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const realDayIndex = new Date().getDay();
  const currentDayIndex = (realDayIndex + 6) % 7; 
  
  const defaultSplit: Record<string, string> = {
    Mon: "Back and Biceps Day",
    Tue: "Chest & Triceps Day",
    Wed: "Legs Day",
    Thu: "Shoulders & Core",
    Fri: "Arms & Biceps",
    Sat: "Full Body Power",
    Sun: "Rest Day"
  };

  const dayName = dayNames[realDayIndex];
  const [splitData, setSplitData] = useState<Record<string, string>>(defaultSplit);

  useEffect(() => {
    const loadSplit = () => {
      try {
        const rawSplit = user?.customSplit || (typeof window !== "undefined" ? localStorage.getItem("customSplit") : null);
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

  const todayFocus = splitData[dayName] || defaultSplit[dayName] || "Training";
  const isRestDay = todayFocus.toLowerCase().includes("rest") || todayFocus.toLowerCase().includes("recovery");

  const [queuedWorkouts, setQueuedWorkouts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSets, setActiveSets] = useState<{ setNum: number; weight: string; reps: string; completed: boolean }[]>([]);

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

  useEffect(() => {
    setMounted(true);
    const updateQueue = () => {
      const q = localStorage.getItem('todaysQueue');
      if (q) setQueuedWorkouts(JSON.parse(q));
    };
    updateQueue();
    window.addEventListener('queueUpdated', updateQueue);
    return () => window.removeEventListener('queueUpdated', updateQueue);
  }, []);

  const weight = Number(user?.weight) || 60;
  const height = Number(user?.height) || 170;
  const bmr = (10 * weight) + (6.25 * height) - (5 * 25) + 5;
  const tdee = bmr * 1.55;
  
  let caloriesIntakeTarget = Math.round(tdee);
  const goalStr = (user?.goal || "Clean Hypertrophy").toLowerCase();
  if (goalStr.includes('hypertrophy') || goalStr.includes('bulk')) caloriesIntakeTarget += 300;
  else if (goalStr.includes('fat loss') || goalStr.includes('cut')) caloriesIntakeTarget -= 500;
  else if (goalStr.includes('strength')) caloriesIntakeTarget += 500;
  
  const caloriesBurnedTarget = Math.round(tdee * 0.2);
  const proteinTarget = Math.round(weight * 2.2);
  const fatsTarget = Math.round((caloriesIntakeTarget * 0.25) / 9);
  const carbsTarget = Math.round((caloriesIntakeTarget - (weight * 2.2 * 4) - (caloriesIntakeTarget * 0.25)) / 4);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-background text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin h-16 bg-surface/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/profile" className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-primary-container/80 to-transparent block active:scale-95 transition-transform" title="View Profile">
            <img className="w-10 h-10 rounded-full object-cover border border-surface-container" alt="User avatar" src={userAvatar} />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-secondary rounded-full ring-2 ring-surface"></span>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-label-caps text-label-caps text-outline tracking-wider">AM-TIPPU CLUB</span>
              <span className="w-1 h-1 rounded-full bg-primary-container"></span>
              <span className="font-label-caps text-label-caps text-primary-fixed-dim">CENTRAL</span>
            </div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">Good morning, {firstName}</h1>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-20 px-margin space-y-5 max-w-md mx-auto">
        {/* Turnstile QR Pass Pill */}
        <Link href="/dashboard/checkin" className="block w-full bg-surface-container-low border border-white/[0.04] rounded-2xl p-3 flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-label-lg text-label-lg font-bold text-on-surface">Turnstile QR Pass</p>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  Active
                </span>
              </div>
              <p className="font-label-md text-label-md text-outline">Tap to scan at gate • AM-Tippu Central</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </div>
        </Link>

        {/* Weekly Rhythm Card */}
        <section className="bg-surface-container-low border border-white/[0.04] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="font-label-caps text-label-caps text-outline block">HABIT TRACKER</span>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">WEEKLY RHYTHM</h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/25 text-primary-container shadow-[0px_8px_16px_rgba(255,154,46,0.1)]">
              <span className="material-symbols-outlined text-[16px] text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="font-label-md text-label-md font-bold text-primary-container tracking-normal">{userStreak}-day streak</span>
            </div>
          </div>
          {/* Dynamic 7-Day Matrix */}
          <div className="grid grid-cols-7 gap-2 pt-1">
            {days.map((day, idx) => {
              const isToday = idx === currentDayIndex;
              const isPast = idx < currentDayIndex;
              
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className={`font-label-md text-label-md ${isToday ? 'text-primary-container font-bold' : 'text-outline-variant'}`}>
                    {day}
                  </span>
                  {isToday ? (
                    <div className="w-9 h-9 rounded-full bg-primary-container text-surface-container-lowest font-bold flex items-center justify-center shadow-[0px_0px_16px_rgba(255,154,46,0.6)] ring-2 ring-primary-container/50">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    </div>
                  ) : isPast && userStreak > 0 ? (
                    <div className="w-9 h-9 rounded-full bg-primary-container/15 border border-primary-container/40 flex items-center justify-center text-primary-container">
                      <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-surface-container border border-white/[0.03] flex items-center justify-center text-outline">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Hero Card */}
        {isRestDay ? (
          <section className="bg-surface-container-low border border-white/[0.04] rounded-2xl p-5 relative overflow-hidden shadow-[0px_12px_32px_rgba(141,164,180,0.12)]">
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/15 text-secondary-container font-label-caps text-label-caps">
                  REST & RECOVERY
                </span>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">
                Active Recovery Day
              </h2>
              <p className="font-body-md text-body-md text-outline mt-0.5">Hydrate, stretch, and let your muscles rebuild.</p>
            </div>
            <button className="w-full py-3.5 px-6 rounded-full bg-surface-container hover:bg-surface-container-high text-white font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150 cursor-default">
              <span className="material-symbols-outlined text-[18px]">self_care</span>
              <span>Enjoy your rest</span>
            </button>
          </section>
        ) : (
          <section className="bg-surface-container-low border border-white/[0.04] rounded-2xl p-5 relative overflow-hidden shadow-[0px_12px_32px_rgba(255,154,46,0.12)]">
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-container/15 text-primary-container font-label-caps text-label-caps">
                  UPCOMING
                </span>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">
                {todayFocus}
              </h2>
              <p className="font-body-md text-body-md text-outline mt-0.5">Ready to crush your goals today?</p>
            </div>
            <Link href="/dashboard/workouts?tab=queue" style={{ textDecoration: "none" }}>
              <button className="w-full py-3.5 px-6 rounded-full bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-[0px_8px_24px_rgba(255,154,46,0.3)] active:scale-[0.98] transition-all duration-150">
                <span>Start Workout</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </Link>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Today's Workouts</span>
            <Link href="/dashboard/workouts" className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">+ Add</Link>
          </div>
          
          {mounted && queuedWorkouts.length === 0 ? (
            <div className="bg-surface-container-low border border-white/[0.04] border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-[24px]">fitness_center</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">No exercises queued</h3>
                <p className="text-xs text-outline mt-1 max-w-[200px]">Build your workout by adding exercises from the library.</p>
              </div>
              <Link href="/dashboard/workouts">
                <button className="mt-2 px-5 py-2.5 rounded-full bg-surface-container-highest text-white text-xs font-bold active:scale-95 transition-all">
                  Browse Library
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {mounted && queuedWorkouts.map((ex, i) => (
                <div 
                  key={i} 
                  onClick={() => openWorkoutExecutionModal(ex)}
                  className="bg-surface-container-low border border-white/[0.04] hover:border-primary/40 rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-black/60 overflow-hidden shrink-0 border border-white/5 flex items-center justify-center">
                    <img src={`/gif/${ex.gif}`} alt={ex.name} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">{ex.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-primary font-bold uppercase">{ex.target}</span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-extrabold border border-primary/30">
                        {ex.targetSets || 4} Sets × {ex.targetReps || "10-12"} Reps
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const nq = queuedWorkouts.filter((_, idx) => idx !== i);
                      setQueuedWorkouts(nq);
                      localStorage.setItem("todaysQueue", JSON.stringify(nq)); 
                      window.dispatchEvent(new Event('queueUpdated'));
                    }} 
                    className="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error/20 active:scale-90 transition-all shrink-0"
                    title="Remove from queue"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* NUTRITION & MACRO BLUEPRINT */}
        <section className="space-y-3 pb-6">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Nutrition & Macros</span>
            <Link href="/dashboard/progress" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <span>Full Analytics</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {/* Current Weight Banner */}
          <div className="bg-surface-container-low border border-white/[0.04] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-[20px]">monitor_weight</span>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-outline uppercase font-bold">Current Weight</p>
                <p className="text-xl font-extrabold text-white">
                  {user?.weight ? `${user.weight} kg` : "--"}
                </p>
              </div>
            </div>
            <Link href="/dashboard/progress" className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary hover:text-black transition-all">
              Log Weigh-In
            </Link>
          </div>

          {/* Main Calorie Grid: Active Burn & Intake */}
          <div className="grid grid-cols-2 gap-3">
            {/* Active Burn */}
            <div className="bg-surface-container-low p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-outline text-[10px] font-bold uppercase">
                <span>Active Burn</span>
                <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-white">0</span>
                <span className="text-xs text-outline font-semibold">/ {caloriesBurnedTarget} kcal</span>
              </div>
              <div className="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary-container h-1.5 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>

            {/* Calorie Intake */}
            <div className="bg-surface-container-low p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-outline text-[10px] font-bold uppercase">
                <span>Intake</span>
                <span className="material-symbols-outlined text-[16px] text-secondary">restaurant</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-white">0</span>
                <span className="text-xs text-outline font-semibold">/ {caloriesIntakeTarget} kcal</span>
              </div>
              <div className="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
                <div className="bg-secondary h-1.5 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>
          </div>

          {/* Macro Split Row */}
          <div className="bg-surface-container-low p-3.5 rounded-2xl border border-white/5 flex items-center justify-around text-center text-xs">
            <div>
              <span className="text-[10px] font-bold text-outline uppercase block">PROTEIN</span>
              <span className="text-sm font-extrabold text-white">0 / {proteinTarget}g</span>
            </div>
            <div className="w-px h-7 bg-white/10"></div>
            <div>
              <span className="text-[10px] font-bold text-outline uppercase block">CARBS</span>
              <span className="text-sm font-extrabold text-white">0 / {carbsTarget}g</span>
            </div>
            <div className="w-px h-7 bg-white/10"></div>
            <div>
              <span className="text-[10px] font-bold text-outline uppercase block">FATS</span>
              <span className="text-sm font-extrabold text-white">0 / {fatsTarget}g</span>
            </div>
          </div>
        </section>      </main>
      <nav aria-label="Primary Navigation" className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2 pb-safe max-w-md mx-auto pointer-events-none">
        <div className="w-full bg-surface-elevated/90 backdrop-blur-xl rounded-full shadow-[0px_12px_32px_rgba(255,154,46,0.15)] flex justify-around items-center px-3 py-1.5 pointer-events-auto border border-white/[0.06]">
          <Link aria-label="Home" href="/dashboard" className="flex flex-col items-center justify-center text-primary p-2 transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          </Link>
          <Link aria-label="Workouts" href="/dashboard/workouts" className="flex flex-col items-center justify-center text-outline p-2 hover:text-white transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]">fitness_center</span>
          </Link>
          <Link aria-label="Check-in" href="/dashboard/checkin" className="flex flex-col items-center justify-center text-outline p-2 hover:text-white transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]">groups</span>
          </Link>
          <Link aria-label="Progress" href="/dashboard/progress" className="flex flex-col items-center justify-center text-outline p-2 hover:text-white transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]">monitoring</span>
          </Link>
          <Link aria-label="Profile" href="/dashboard/profile" className="flex flex-col items-center justify-center text-outline p-2 hover:text-white transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]">person</span>
          </Link>
        </div>
      </nav>

      {/* QUEUED WORKOUT EXECUTION & FORM GUIDE MODAL */}
      {isModalOpen && selectedWorkout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-surface-card rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Target: {selectedWorkout.target}</span>
                <h2 className="text-lg font-bold text-white leading-tight">{selectedWorkout.name}</h2>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedWorkout(null);
                }} 
                className="w-8 h-8 rounded-full bg-surface-elevated text-outline hover:text-white flex items-center justify-center transition-colors"
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
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-bold text-primary border border-primary/30">
                  LIVE FORM GUIDE
                </span>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-surface-elevated border border-white/5 text-xs text-outline font-semibold">
                  Equipment: {selectedWorkout.equipment}
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-elevated border border-white/5 text-xs text-outline font-semibold capitalize">
                  Muscle: {selectedWorkout.muscle_group}
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold">
                  Target: {selectedWorkout.targetSets || 4} Sets × {selectedWorkout.targetReps || "10-12"} Reps
                </span>
              </div>

              {/* Execution Steps */}
              {selectedWorkout.steps && selectedWorkout.steps.length > 0 && (
                <div className="bg-surface-elevated rounded-2xl p-4 border border-white/[0.04]">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">fact_check</span>
                    Execution Steps
                  </h3>
                  <ol className="space-y-2 text-xs text-outline/90 leading-relaxed list-decimal pl-4">
                    {selectedWorkout.steps.map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Active Set Logger */}
              <div className="bg-surface-elevated rounded-2xl p-4 border border-white/[0.04] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Set Logger</h3>
                    <p className="text-[10px] text-outline">Target: {selectedWorkout.targetSets || 4} Sets • {selectedWorkout.targetReps || "10-12"} Reps</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={() => {
                        if (activeSets.length > 1) {
                          setActiveSets(prev => prev.slice(0, -1));
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-surface-card border border-white/5 text-[10px] font-bold text-outline hover:text-white"
                      title="Remove set"
                    >
                      - Set
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setActiveSets(prev => [
                          ...prev,
                          { setNum: prev.length + 1, weight: "", reps: selectedWorkout.targetReps || "10-12", completed: false }
                        ]);
                      }}
                      className="px-2 py-1 rounded-lg bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary hover:bg-primary/30"
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
                        s.completed ? 'bg-primary/10 border-primary/40' : 'bg-surface-card border-white/5'
                      }`}
                    >
                      <span className={`w-14 text-[11px] font-bold uppercase shrink-0 ${s.completed ? 'text-primary' : 'text-outline'}`}>
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
                            className="w-full bg-surface-elevated text-xs text-white placeholder:text-outline/40 px-2.5 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-primary text-center font-bold"
                          />
                        </div>
                        <span className="text-outline text-xs">×</span>
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
                            className="w-full bg-surface-elevated text-xs text-white placeholder:text-outline/40 px-2.5 py-1.5 rounded-lg border border-white/5 focus:outline-none focus:border-primary text-center font-bold"
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
                          s.completed ? 'bg-primary text-black font-bold' : 'bg-surface-elevated text-outline hover:text-white'
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
                    const nq = queuedWorkouts.filter((item) => item.name !== selectedWorkout.name);
                    setQueuedWorkouts(nq);
                    localStorage.setItem("todaysQueue", JSON.stringify(nq)); 
                    window.dispatchEvent(new Event('queueUpdated'));
                    setIsModalOpen(false);
                    setSelectedWorkout(null);
                  }}
                  className="flex-1 py-3.5 rounded-full bg-primary text-black font-bold text-xs amber-glow active:scale-95 transition-all flex items-center justify-center gap-1.5"
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
