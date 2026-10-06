"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import SelfieModal from "@/components/SelfieModal";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();

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
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=141210&color=FF9A2E&size=160&bold=true`;

  // Settings State
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [unitSystem, setUnitSystem] = useState<"Metric" | "Imperial">("Metric");

  // Modals & Popups
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Weekly Split State
  const [splitData, setSplitData] = useState<Record<string, string>>({
    Mon: "Back and Biceps Day",
    Tue: "Chest & Triceps Day",
    Wed: "Legs Day",
    Thu: "Shoulders & Core",
    Fri: "Arms & Biceps",
    Sat: "Full Body Power",
    Sun: "Rest Day",
  });

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: "",
    weight: "",
    targetWeight: "",
    goal: "Clean Hypertrophy",
    preferredSlot: "07:00 AM",
    instagram: "",
    youtube: "",
    strava: "",
  });

  // Sync state from user on load
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        weight: user.weight ? String(user.weight) : "",
        targetWeight: (user as any).targetWeight ? String((user as any).targetWeight) : "",
        goal: user.goal || "Clean Hypertrophy",
        preferredSlot: (user as any).preferredSlot || "07:00 AM",
        instagram: (user as any).social_instagram || "",
        youtube: (user as any).social_youtube || "",
        strava: (user as any).social_links?.strava || "",
      });

      if ((user as any).customSplit) {
        try {
          const parsed =
            typeof (user as any).customSplit === "string"
              ? JSON.parse((user as any).customSplit)
              : (user as any).customSplit;
          if (parsed && typeof parsed === "object") {
            setSplitData(parsed);
          }
        } catch (e) {}
      } else {
        const local = localStorage.getItem("customSplit");
        if (local) {
          try {
            setSplitData(JSON.parse(local));
          } catch (e) {}
        }
      }
    }
  }, [user]);

  // Today key for highlighting split
  const todayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon
  const dayKeys = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDayKey = dayKeys[todayIndex];

  // Handle Selfie / Photo Capture Selection
  const handlePhotoSelected = async (dataUrl: string) => {
    try {
      updateUser({ avatar_url: dataUrl });
      const res = await api.updateProfile({ avatar_url: dataUrl });
      if (res?.user) {
        updateUser(res.user);
      }
      displayToast("Athlete photo updated successfully!");
    } catch (err) {
      console.error("Failed to persist avatar:", err);
      displayToast("Photo updated locally!");
    }
  };

  // Preset Split Selection
  const applyPresetSplit = async (preset: "ppl" | "arnold" | "bro" | "upper_lower") => {
    let newSplit: Record<string, string> = {};
    if (preset === "ppl") {
      newSplit = {
        Mon: "Push Day (Chest, Shoulders, Triceps)",
        Tue: "Pull Day (Back & Biceps)",
        Wed: "Legs Day (Quads, Hamstrings, Calves)",
        Thu: "Push Day (Hypertrophy Focus)",
        Fri: "Pull Day (Lats & Traps Focus)",
        Sat: "Legs & Core Power",
        Sun: "Rest & Active Recovery",
      };
    } else if (preset === "arnold") {
      newSplit = {
        Mon: "Chest & Back Day",
        Tue: "Shoulders & Arms",
        Wed: "Legs & Core Day",
        Thu: "Chest & Back Day",
        Fri: "Shoulders & Arms",
        Sat: "Legs & Power Conditioning",
        Sun: "Rest & Mobility",
      };
    } else if (preset === "bro") {
      newSplit = {
        Mon: "Chest Day",
        Tue: "Back & Lats Day",
        Wed: "Shoulders & Traps",
        Thu: "Legs & Calves Day",
        Fri: "Arms & Forearms (Biceps/Triceps)",
        Sat: "Core & High-Intensity Cardio",
        Sun: "Rest & Recovery",
      };
    } else if (preset === "upper_lower") {
      newSplit = {
        Mon: "Upper Body Strength",
        Tue: "Lower Body Strength",
        Wed: "Rest & Active Recovery",
        Thu: "Upper Body Hypertrophy",
        Fri: "Lower Body Hypertrophy",
        Sat: "Full Body Mobility & Core",
        Sun: "Rest Day",
      };
    }

    setSplitData(newSplit);
    localStorage.setItem("customSplit", JSON.stringify(newSplit));
    window.dispatchEvent(new Event("splitUpdated"));

    try {
      await api.updateProfile({ customSplit: newSplit });
      updateUser({ customSplit: newSplit });
      displayToast(`Preset applied: ${preset.toUpperCase()}`);
    } catch (err) {
      displayToast("Preset saved locally!");
    }
  };

  // Handle Save Profile Form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = {
        name: editForm.name,
        goal: editForm.goal,
        weight: editForm.weight,
        targetWeight: editForm.targetWeight,
        preferredSlot: editForm.preferredSlot,
        social_instagram: editForm.instagram,
        social_youtube: editForm.youtube,
        social_links: {
          strava: editForm.strava,
        },
        customSplit: splitData,
      };

      if (isRealPhoto(user?.avatar_url)) {
        payload.avatar_url = user?.avatar_url;
      }

      const res = await api.updateProfile(payload);
      if (res?.user) {
        updateUser(res.user);
      } else {
        updateUser(payload);
      }
      localStorage.setItem("customSplit", JSON.stringify(splitData));
      window.dispatchEvent(new Event("splitUpdated"));

      setIsEditModalOpen(false);
      displayToast("Profile updated successfully!");
    } catch (err) {
      console.error("Profile save error:", err);
      // Fallback local update
      updateUser({
        name: editForm.name,
        goal: editForm.goal,
        weight: editForm.weight,
        targetWeight: editForm.targetWeight,
        preferredSlot: editForm.preferredSlot,
      });
      localStorage.setItem("customSplit", JSON.stringify(splitData));
      window.dispatchEvent(new Event("splitUpdated"));
      setIsEditModalOpen(false);
      displayToast("Profile changes saved locally!");
    } finally {
      setIsSaving(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setIsSigningOut(true);
    localStorage.clear();
    logout();
    router.push("/login");
  };

  return (
    <div className="bg-[#0c0a09] text-white min-h-screen pb-32 selection:bg-[#FF9A2E] selection:text-black antialiased font-sans">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1c1917] border border-[#FF9A2E]/40 text-white px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgba(255,154,46,0.25)] flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-[18px] text-[#FF9A2E]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP APP HEADER */}
      <header className="sticky top-0 z-40 bg-[#0c0a09]/90 backdrop-blur-md border-b border-white/[0.06] px-5 py-3.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-[#1c1917] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
            title="Back to Dashboard"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF9A2E] animate-pulse"></span>
            <h1 className="text-sm font-bold tracking-wider text-zinc-200 uppercase">Athlete Profile</h1>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-9 h-9 rounded-full bg-[#1c1917] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-[#FF9A2E] transition-all active:scale-95"
            title="Edit Profile"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-md mx-auto px-5 pt-5 space-y-6">
        {/* ========================================== */}
        {/* 1. DIGITAL ATHLETE CREST CARD */}
        {/* ========================================== */}
        <section className="bg-gradient-to-b from-[#181512] to-[#12100e] rounded-3xl p-6 border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF9A2E]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Avatar with Camera Badge */}
          <div className="relative mb-4 group cursor-pointer" onClick={() => setIsSelfieModalOpen(true)}>
            <div className="w-24 h-24 rounded-full p-[2.5px] bg-gradient-to-tr from-[#FF9A2E] via-[#FFB766] to-[#26221d] shadow-[0_0_24px_rgba(255,154,46,0.35)] transition-transform group-hover:scale-105">
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full rounded-full object-cover bg-[#1c1917]"
              />
            </div>
            {/* Live Camera Badge */}
            <button
              type="button"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FF9A2E] text-black flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
              title="Snap Selfie or Upload Photo"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">photo_camera</span>
            </button>
          </div>

          {/* Name & ID */}
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{userName}</h2>
          <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
            <span>Pass ID: #AMT-{String(user?.id || 1).padStart(4, "0")}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
            <span>{user?.phone ? user.phone : "AM-Tippu Collective"}</span>
          </p>

          {/* Status Pills */}
          <div className="mt-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FF9A2E]/15 border border-[#FF9A2E]/40 text-[11px] font-bold text-[#FF9A2E] tracking-wider uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              {user?.role === "admin" ? "STAFF / COACH" : "PRO ATHLETE"}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/40 text-[11px] font-bold text-[#22c55e] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
              ACTIVE PASS
            </span>
          </div>

          {/* Edit Bio Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="mt-4 px-5 py-2 rounded-full bg-[#26221d] hover:bg-[#322c26] border border-white/10 text-xs font-bold text-zinc-200 hover:text-white flex items-center gap-2 active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px] text-[#FF9A2E]">manage_accounts</span>
            <span>Edit Profile &amp; Biometrics</span>
          </button>
        </section>

        {/* ========================================== */}
        {/* 2. CORE BIOMETRICS & TARGETS BENTO */}
        {/* ========================================== */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Athlete Biometrics</h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[11px] font-bold text-[#FF9A2E] hover:underline"
            >
              Update
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Current Weight */}
            <div
              onClick={() => setIsEditModalOpen(true)}
              className="bg-[#141210] p-4 rounded-2xl border border-white/5 hover:border-[#FF9A2E]/30 transition-all cursor-pointer space-y-1 shadow-sm"
            >
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Current Weight</span>
                <span className="material-symbols-outlined text-[16px]">scale</span>
              </div>
              <div className="text-xl font-extrabold text-white">
                {user?.weight ? (
                  <>
                    {user.weight} <span className="text-xs font-normal text-zinc-400">kg</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-zinc-500">Set weight</span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500">Live physical benchmark</p>
            </div>

            {/* Target Weight */}
            <div
              onClick={() => setIsEditModalOpen(true)}
              className="bg-[#141210] p-4 rounded-2xl border border-white/5 hover:border-[#FF9A2E]/30 transition-all cursor-pointer space-y-1 shadow-sm"
            >
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Target Weight</span>
                <span className="material-symbols-outlined text-[16px]">flag</span>
              </div>
              <div className="text-xl font-extrabold text-[#FF9A2E]">
                {(user as any)?.targetWeight ? (
                  <>
                    {(user as any).targetWeight} <span className="text-xs font-normal text-zinc-400">kg</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-zinc-500">Set target</span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500">Goal transformation</p>
            </div>

            {/* Primary Goal */}
            <div
              onClick={() => setIsEditModalOpen(true)}
              className="bg-[#141210] p-4 rounded-2xl border border-white/5 hover:border-[#FF9A2E]/30 transition-all cursor-pointer space-y-1 shadow-sm"
            >
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Primary Goal</span>
                <span className="material-symbols-outlined text-[16px]">fitness_center</span>
              </div>
              <div className="text-sm font-bold text-white truncate">
                {user?.goal || "Clean Hypertrophy"}
              </div>
              <p className="text-[10px] text-zinc-500">Periodization protocol</p>
            </div>

            {/* Preferred Slot */}
            <div
              onClick={() => setIsEditModalOpen(true)}
              className="bg-[#141210] p-4 rounded-2xl border border-white/5 hover:border-[#FF9A2E]/30 transition-all cursor-pointer space-y-1 shadow-sm"
            >
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Training Window</span>
                <span className="material-symbols-outlined text-[16px]">schedule</span>
              </div>
              <div className="text-sm font-bold text-white truncate">
                {(user as any)?.preferredSlot || "Morning 07:00 AM"}
              </div>
              <p className="text-[10px] text-zinc-500">Floor slot</p>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 3. WEEKLY TRAINING SPLIT HUB */}
        {/* ========================================== */}
        <section className="bg-[#141210] rounded-3xl p-5 border border-white/[0.08] space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                TRAINING PROGRAM
              </span>
              <h3 className="text-base font-bold text-white">Weekly Training Split</h3>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-bold text-[#FF9A2E] bg-[#FF9A2E]/10 hover:bg-[#FF9A2E] hover:text-black px-3 py-1.5 rounded-full transition-all flex items-center gap-1 active:scale-95"
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span>Edit Routine</span>
            </button>
          </div>

          {/* Quick Presets Bar */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              1-Tap Routine Presets
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => applyPresetSplit("ppl")}
                className="py-1.5 px-1 rounded-xl bg-[#1c1917] hover:bg-[#26221d] border border-white/5 text-[11px] font-bold text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                PPL
              </button>
              <button
                type="button"
                onClick={() => applyPresetSplit("arnold")}
                className="py-1.5 px-1 rounded-xl bg-[#1c1917] hover:bg-[#26221d] border border-white/5 text-[11px] font-bold text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                Arnold
              </button>
              <button
                type="button"
                onClick={() => applyPresetSplit("bro")}
                className="py-1.5 px-1 rounded-xl bg-[#1c1917] hover:bg-[#26221d] border border-white/5 text-[11px] font-bold text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                Bro Split
              </button>
              <button
                type="button"
                onClick={() => applyPresetSplit("upper_lower")}
                className="py-1.5 px-1 rounded-xl bg-[#1c1917] hover:bg-[#26221d] border border-white/5 text-[11px] font-bold text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                Upper/Low
              </button>
            </div>
          </div>

          {/* 7-Day Matrix */}
          <div className="space-y-2 pt-1">
            {[
              { day: "Mon", full: "Monday" },
              { day: "Tue", full: "Tuesday" },
              { day: "Wed", full: "Wednesday" },
              { day: "Thu", full: "Thursday" },
              { day: "Fri", full: "Friday" },
              { day: "Sat", full: "Saturday" },
              { day: "Sun", full: "Sunday" },
            ].map(({ day }) => {
              const focus = splitData[day] || "Rest Day";
              const isToday = day === currentDayKey;
              const isRest =
                focus.toLowerCase().includes("rest") || focus.toLowerCase().includes("recovery");

              return (
                <div
                  key={day}
                  onClick={() => setIsEditModalOpen(true)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isToday
                      ? "bg-[#FF9A2E]/10 border-[#FF9A2E]/50 shadow-[0_0_16px_rgba(255,154,46,0.15)]"
                      : "bg-[#1c1917] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 text-xs font-extrabold uppercase ${
                        isToday ? "text-[#FF9A2E]" : "text-zinc-400"
                      }`}
                    >
                      {day}
                    </span>
                    <div>
                      <span className={`text-xs font-bold block ${isRest ? "text-zinc-400" : "text-white"}`}>
                        {focus}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isToday && (
                      <span className="text-[9px] font-extrabold bg-[#FF9A2E] text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        TODAY
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isRest
                          ? "bg-zinc-800 text-zinc-400"
                          : isToday
                          ? "bg-[#FF9A2E]/20 text-[#FF9A2E]"
                          : "bg-[#22c55e]/15 text-[#22c55e]"
                      }`}
                    >
                      {isRest ? "REST" : "ACTIVE"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================== */}
        {/* 4. GYM FLOOR & MEMBERS DIRECTORY HUB */}
        {/* ========================================== */}
        <section className="bg-gradient-to-r from-[#181512] to-[#141210] rounded-3xl p-5 border border-white/[0.08] shadow-md space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF9A2E]/15 border border-[#FF9A2E]/30 flex items-center justify-center text-[#FF9A2E]">
                <span className="material-symbols-outlined text-[22px]">groups</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Gym Floor &amp; Athletes Directory</h3>
                <p className="text-[11px] text-zinc-400">See who is on the floor or browse all members</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/dashboard/checkin"
              className="p-3 rounded-2xl bg-[#1c1917] hover:bg-[#26221d] border border-white/5 flex items-center gap-2.5 transition-all group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse shrink-0"></span>
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate group-hover:text-[#FF9A2E] transition-colors">
                  On Floor Now
                </span>
                <span className="text-[10px] text-zinc-500">Live attendance</span>
              </div>
            </Link>

            <Link
              href="/dashboard/checkin"
              className="p-3 rounded-2xl bg-[#1c1917] hover:bg-[#26221d] border border-white/5 flex items-center gap-2.5 transition-all group"
            >
              <span className="material-symbols-outlined text-[16px] text-[#FF9A2E] shrink-0">badge</span>
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate group-hover:text-[#FF9A2E] transition-colors">
                  All Members
                </span>
                <span className="text-[10px] text-zinc-500">Gym collective</span>
              </div>
            </Link>
          </div>
        </section>

        {/* ========================================== */}
        {/* 5. CONNECTED SOCIAL ATHLETE HANDLES */}
        {/* ========================================== */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Social Handles</h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[11px] font-bold text-[#FF9A2E] hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="bg-[#141210] rounded-2xl p-4 border border-white/5 space-y-3">
            {(user as any)?.social_instagram || (user as any)?.social_youtube || (user as any)?.social_links?.strava ? (
              <div className="flex flex-wrap gap-2">
                {(user as any)?.social_instagram && (
                  <a
                    href={`https://instagram.com/${String((user as any).social_instagram).replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold flex items-center gap-2 hover:bg-pink-500/20 transition-colors"
                  >
                    <span>📷</span>
                    <span>{(user as any).social_instagram}</span>
                  </a>
                )}
                {(user as any)?.social_youtube && (
                  <a
                    href={`https://youtube.com/${String((user as any).social_youtube).replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2 hover:bg-red-500/20 transition-colors"
                  >
                    <span>▶️</span>
                    <span>{(user as any).social_youtube}</span>
                  </a>
                )}
                {(user as any)?.social_links?.strava && (
                  <a
                    href={`https://strava.com/athletes/${(user as any).social_links.strava}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center gap-2 hover:bg-orange-500/20 transition-colors"
                  >
                    <span>🏃</span>
                    <span>Strava Athlete</span>
                  </a>
                )}
              </div>
            ) : (
              <div
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1c1917] flex items-center justify-center text-zinc-400 group-hover:text-[#FF9A2E] transition-colors">
                    <span className="material-symbols-outlined text-[18px]">share</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Link Instagram or YouTube</span>
                    <span className="text-[10px] text-zinc-500">Show your fitness profile to gym members</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#FF9A2E]">+ Add</span>
              </div>
            )}
          </div>
        </section>

        {/* ========================================== */}
        {/* 6. FACILITY & APP PREFERENCES */}
        {/* ========================================== */}
        <section className="space-y-2.5">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">App Preferences</h3>
          <div className="bg-[#141210] rounded-2xl border border-white/5 divide-y divide-white/[0.04] overflow-hidden text-xs">
            <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors">
              <div>
                <span className="font-bold text-white block">Turnstile Haptic Vibration</span>
                <span className="text-[10px] text-zinc-400">Vibrate when scanning turnstile pass</span>
              </div>
              <input
                type="checkbox"
                checked={hapticFeedback}
                onChange={(e) => setHapticFeedback(e.target.checked)}
                className="rounded bg-[#1c1917] border-white/10 text-[#FF9A2E] focus:ring-0 w-4 h-4"
              />
            </label>

            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => setUnitSystem(unitSystem === "Metric" ? "Imperial" : "Metric")}
            >
              <div>
                <span className="font-bold text-white block">Measurement Unit</span>
                <span className="text-[10px] text-zinc-400">
                  {unitSystem === "Metric" ? "Kilograms (kg) & Centimeters (cm)" : "Pounds (lbs) & Inches (in)"}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#FF9A2E] bg-[#FF9A2E]/10 px-2.5 py-1 rounded-lg uppercase">
                {unitSystem}
              </span>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 7. SIGN OUT & SYSTEM FOOTER */}
        {/* ========================================== */}
        <section className="pt-2 text-center space-y-3">
          <button
            onClick={handleLogout}
            disabled={isSigningOut}
            className="w-full py-3.5 rounded-full bg-[#1c1917] hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 text-xs font-bold text-zinc-400 hover:text-red-400 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>{isSigningOut ? "Signing Out..." : "Sign Out of Account"}</span>
          </button>
          <p className="text-[10px] text-zinc-600">
            AM-Tippu Fitness • Built for Performance • Connected as {userName}
          </p>
        </section>
      </main>

      {/* BOTTOM NAVIGATION DOCK */}
      <nav
        aria-label="Primary Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-4 py-2 pb-safe max-w-md mx-auto pointer-events-none"
      >
        <div className="w-full bg-[#1c1917]/90 backdrop-blur-xl rounded-full shadow-[0px_12px_32px_rgba(255,154,46,0.15)] flex justify-around items-center px-3 py-1.5 pointer-events-auto border border-white/[0.06]">
          <Link
            aria-label="Home"
            href="/dashboard"
            className="flex flex-col items-center justify-center text-zinc-400 p-2 hover:text-white transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">home</span>
          </Link>
          <Link
            aria-label="Workouts"
            href="/dashboard/workouts"
            className="flex flex-col items-center justify-center text-zinc-400 p-2 hover:text-white transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">fitness_center</span>
          </Link>
          <Link
            aria-label="Check-in"
            href="/dashboard/checkin"
            className="flex flex-col items-center justify-center text-zinc-400 p-2 hover:text-white transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">qr_code_scanner</span>
          </Link>
          <Link
            aria-label="Progress"
            href="/dashboard/progress"
            className="flex flex-col items-center justify-center text-zinc-400 p-2 hover:text-white transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">monitoring</span>
          </Link>
          <Link
            aria-current="page"
            aria-label="Profile"
            href="/dashboard/profile"
            className="flex flex-col items-center justify-center text-white p-2 after:content-[''] after:w-1.5 after:h-1.5 after:bg-[#FF9A2E] after:rounded-full after:mt-1 active:scale-90 transition-transform duration-200"
          >
            <span
              className="material-symbols-outlined text-[23px] text-[#FF9A2E]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
          </Link>
        </div>
      </nav>

      {/* ========================================== */}
      {/* 8. SELFIE / PHOTO MODAL */}
      {/* ========================================== */}
      <SelfieModal
        isOpen={isSelfieModalOpen}
        onClose={() => setIsSelfieModalOpen(false)}
        onPhotoSelected={handlePhotoSelected}
        currentAvatar={userAvatar}
      />

      {/* ========================================== */}
      {/* 9. EDIT PROFILE & SPLIT MODAL */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#141210] rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#141210]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF9A2E]/15 border border-[#FF9A2E]/30 flex items-center justify-center text-[#FF9A2E]">
                  <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Edit Athlete Profile</h3>
                  <p className="text-[11px] text-zinc-400">Photo, goals, training window &amp; split</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1c1917] text-zinc-400 hover:text-white flex items-center justify-center active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Photo Section */}
              <div className="bg-[#1c1917] p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#FF9A2E] to-zinc-700 shrink-0">
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover bg-black"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Athlete Photo</h4>
                    <p className="text-[10px] text-zinc-400">Live selfie or gallery upload</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSelfieModalOpen(true)}
                  className="px-3.5 py-2 rounded-full bg-[#FF9A2E] text-black text-xs font-bold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                  <span>Take Selfie</span>
                </button>
              </div>

              {/* Basic Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Athlete Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1917] border border-white/10 text-xs text-white placeholder-zinc-500 focus:border-[#FF9A2E] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Current Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.weight}
                      onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                      placeholder="e.g. 74.5"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1917] border border-white/10 text-xs text-white placeholder-zinc-500 focus:border-[#FF9A2E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Target Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.targetWeight}
                      onChange={(e) => setEditForm({ ...editForm, targetWeight: e.target.value })}
                      placeholder="e.g. 70.0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1917] border border-white/10 text-xs text-white placeholder-zinc-500 focus:border-[#FF9A2E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Primary Fitness Goal
                  </label>
                  <select
                    value={editForm.goal}
                    onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1917] border border-white/10 text-xs text-white focus:border-[#FF9A2E] focus:outline-none"
                  >
                    <option value="Clean Hypertrophy">Clean Hypertrophy (Muscle Gain)</option>
                    <option value="Aggressive Cut / Fat Loss">Aggressive Cut / Fat Loss</option>
                    <option value="Lean Bulk">Lean Bulk &amp; Size</option>
                    <option value="Athletic Strength & Power">Athletic Strength &amp; Power</option>
                    <option value="Endurance & General Conditioning">Endurance &amp; General Conditioning</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Preferred Floor Training Slot
                  </label>
                  <select
                    value={editForm.preferredSlot}
                    onChange={(e) => setEditForm({ ...editForm, preferredSlot: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1917] border border-white/10 text-xs text-white focus:border-[#FF9A2E] focus:outline-none"
                  >
                    <option value="Early Morning (06:00 AM - 08:00 AM)">Early Morning (06:00 AM - 08:00 AM)</option>
                    <option value="Morning (08:00 AM - 11:00 AM)">Morning (08:00 AM - 11:00 AM)</option>
                    <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12:00 PM - 04:00 PM)</option>
                    <option value="Evening Rush (05:00 PM - 08:00 PM)">Evening Rush (05:00 PM - 08:00 PM)</option>
                    <option value="Night Power (08:00 PM - 11:00 PM)">Night Power (08:00 PM - 11:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Social Handles */}
              <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Social Handles</h4>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={editForm.instagram}
                    onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                    placeholder="@athlete_handle"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1917] border border-white/10 text-xs text-white placeholder-zinc-500 focus:border-[#FF9A2E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 block mb-1">YouTube Handle / Channel</label>
                  <input
                    type="text"
                    value={editForm.youtube}
                    onChange={(e) => setEditForm({ ...editForm, youtube: e.target.value })}
                    placeholder="@youtube_handle"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1917] border border-white/10 text-xs text-white placeholder-zinc-500 focus:border-[#FF9A2E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Weekly Split Configuration */}
              <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customize Weekly Split</h4>
                  <span className="text-[10px] text-[#FF9A2E] font-semibold">Day-by-Day</span>
                </div>

                <div className="space-y-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="flex items-center gap-2">
                      <span className="w-9 text-xs font-bold text-zinc-400 uppercase">{day}</span>
                      <input
                        type="text"
                        value={splitData[day] || ""}
                        onChange={(e) => setSplitData({ ...splitData, [day]: e.target.value })}
                        placeholder="e.g. Chest & Triceps or Rest Day"
                        className="flex-1 px-3 py-2 rounded-xl bg-[#1c1917] border border-white/10 text-xs text-white placeholder-zinc-500 focus:border-[#FF9A2E] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 sticky bottom-0 bg-[#141210] pb-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 rounded-full bg-[#FF9A2E] hover:bg-[#ffb05c] text-black font-extrabold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all shadow-[0_8px_24px_rgba(255,154,46,0.3)] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>{isSaving ? "Saving Updates..." : "Save Profile & Split"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
