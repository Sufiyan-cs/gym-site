"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const userName = user?.name || "Athlete";
  const firstName = userName.split(" ")[0];
  const userAvatar = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=2b2a28&color=ffb877&size=120`;

  // Settings State
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [occupancyAlerts, setOccupancyAlerts] = useState(true);
  const [unitSystem, setUnitSystem] = useState<"Metric" | "Imperial">("Metric");

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    avatarUrl: user?.avatar_url || "",
    instagram: (user as any)?.social_instagram || "",
    strava: "",
    twitter: "",
    youtube: (user as any)?.social_youtube || "",
    handle: "",
    memberId: "",
    tier: user?.role?.toUpperCase() || "MEMBER",
    goal: user?.goal || "Clean Hypertrophy",
    targetWeight: (user as any)?.targetWeight || "70",
    preferredSlot: (user as any)?.preferredSlot || "07:00 AM",
    phone: user?.phone || "",
    bloodGroup: "O+",
    emergencyContact: "",
    fobId: "",
    hapticFeedback: true,
    occupancyAlerts: true,
  });

  const [splitData, setSplitData] = useState<Record<string, string>>({
    Mon: "Back and Biceps Day",
    Tue: "Chest & Triceps Day",
    Wed: "Legs Day",
    Thu: "Shoulders & Core",
    Fri: "Arms & Biceps",
    Sat: "Full Body Power",
    Sun: "Rest Day"
  });

  useEffect(() => {
    if (user) {
      setEditForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        goal: user.goal || prev.goal,
        targetWeight: (user as any).targetWeight || prev.targetWeight,
        preferredSlot: (user as any).preferredSlot || prev.preferredSlot,
        avatarUrl: user.avatar_url || prev.avatarUrl,
        phone: user.phone || prev.phone,
      }));
      if ((user as any).customSplit) {
        try {
          const parsed = typeof (user as any).customSplit === "string" ? JSON.parse((user as any).customSplit) : (user as any).customSplit;
          if (parsed && typeof parsed === "object") {
            setSplitData(parsed);
          }
        } catch (e) {}
      } else {
        const local = localStorage.getItem("customSplit");
        if (local) {
          try { setSplitData(JSON.parse(local)); } catch (e) {}
        }
      }
    }
  }, [user]);

  // UPI Modal State
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleLogout = () => {
    localStorage.clear();
    logout();
    router.push("/login");
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: editForm.name,
        goal: editForm.goal,
        targetWeight: editForm.targetWeight,
        preferredSlot: editForm.preferredSlot,
        avatar_url: editForm.avatarUrl,
        social_instagram: editForm.instagram,
        social_youtube: editForm.youtube,
        social_links: {
          strava: editForm.strava,
          twitter: editForm.twitter,
          handle: editForm.handle,
          memberId: editForm.memberId,
        },
        customSplit: splitData,
      };

      await api.updateProfile(payload);
      localStorage.setItem("customSplit", JSON.stringify(splitData));
      window.dispatchEvent(new Event("splitUpdated"));

      setHapticFeedback(editForm.hapticFeedback);
      setOccupancyAlerts(editForm.occupancyAlerts);
      setIsEditModalOpen(false);
      displayToast("Profile & weekly split updated successfully!");
    } catch (err: any) {
      console.error("Save error:", err);
      // Fallback local persistence
      localStorage.setItem("customSplit", JSON.stringify(splitData));
      window.dispatchEvent(new Event("splitUpdated"));
      setIsEditModalOpen(false);
      displayToast("Profile split saved locally!");
    } finally {
      setIsSaving(false);
    }
  };

  const applyPresetSplit = (preset: string) => {
    if (preset === "ppl") {
      setSplitData({
        Mon: "Push Day",
        Tue: "Pull Day",
        Wed: "Leg Day",
        Thu: "Push Day",
        Fri: "Pull Day",
        Sat: "Leg Day",
        Sun: "Rest Day"
      });
    } else if (preset === "arnold") {
      setSplitData({
        Mon: "Chest & Back Day",
        Tue: "Shoulders & Arms",
        Wed: "Legs Day",
        Thu: "Chest & Back Day",
        Fri: "Shoulders & Arms",
        Sat: "Legs Day",
        Sun: "Rest Day"
      });
    } else if (preset === "bro") {
      setSplitData({
        Mon: "Chest Day",
        Tue: "Back Day",
        Wed: "Shoulders Day",
        Thu: "Legs Day",
        Fri: "Arms Day",
        Sat: "Core & Weak Points",
        Sun: "Rest Day"
      });
    } else if (preset === "upper_lower") {
      setSplitData({
        Mon: "Upper Body Power",
        Tue: "Lower Body Power",
        Wed: "Rest & Active Mobility",
        Thu: "Upper Body Hypertrophy",
        Fri: "Lower Body Hypertrophy",
        Sat: "Full Body Conditioning",
        Sun: "Rest Day"
      });
    }
    displayToast(`Applied ${preset.toUpperCase()} split template!`);
  };

  const simulateUpi = () => {
    displayToast("UPI Payments coming soon!");
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen text-on-surface antialiased pb-28">
      {/* TOP APP BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-low/90 backdrop-blur-md border-b border-white/[0.04]">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-full bg-surface-elevated border border-white/5 flex items-center justify-center text-outline hover:text-white"
            >
              <span className="material-symbols-outlined text-[19px]">arrow_back</span>
            </Link>
            <h1 className="text-base font-bold text-white tracking-tight">Athlete Profile & Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/checkin"
              className="w-9 h-9 rounded-full bg-surface-elevated border border-white/5 flex items-center justify-center text-outline hover:text-secondary active:scale-95 transition-all"
              title="View Athletes On Floor (Check-in)"
            >
              <span className="material-symbols-outlined text-[19px]">groups</span>
            </Link>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-9 h-9 rounded-full bg-surface-elevated border border-white/5 flex items-center justify-center text-outline hover:text-primary active:scale-95 transition-all"
              title="Edit Profile & Configurations"
            >
              <span className="material-symbols-outlined text-[19px]">settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN SCROLLABLE CONTAINER */}
      <main className="max-w-md mx-auto pt-20 px-5 space-y-5">
        {/* ATHLETE IDENTITY SECTION (Clickable to Edit) */}
        <section className="flex flex-col items-center text-center pt-1">
          <div
            className="relative mb-3 cursor-pointer group"
            onClick={() => setIsEditModalOpen(true)}
            title="Tap to upload your real photo"
          >
            <div className="w-24 h-24 rounded-full p-[2.5px] bg-gradient-to-b from-primary to-surface-card shadow-[0_0_24px_rgba(255,154,46,0.3)]">
              <img
                className="w-full h-full rounded-full object-cover bg-surface-card group-hover:opacity-90 transition-opacity"
                src={userAvatar}
                alt="Athlete Profile"
              />
            </div>
            <div className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                photo_camera
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">{user?.name || "Athlete"}</h2>
          <p className="text-xs text-outline mt-0.5">
            @{user?.name?.toLowerCase().replace(/\s+/g, ".") || "athlete"} • Member ID: #TK-${user?.id || "0000"}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/15 border border-primary/40 text-[10px] font-bold text-primary tracking-wider">
              {user?.role?.toUpperCase() || "MEMBER"}
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-card border border-white/5 text-[10px] text-outline font-semibold">
              Member
            </span>
          </div>

          {/* USER'S REAL SOCIAL MEDIA LINKS BAR */}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            {/* Can render dynamically if socials provided */}
          </div>

          {/* Prominent Edit Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="mt-3 px-4 py-2 rounded-full bg-surface-card hover:bg-surface-elevated border border-white/10 text-xs font-bold text-white flex items-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">manage_accounts</span>
            <span>Edit Profile, Photo & Socials</span>
          </button>
        </section>

        {/* ALL-ACCESS PASS HERO CARD WITH UPI RENEWAL */}
        <section className="bg-surface-card rounded-3xl p-5 border border-white/[0.06] amber-glow space-y-4 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-outline tracking-wider uppercase block">MEMBERSHIP ACCESS</span>
              <h3 className="text-lg font-bold text-white mt-0.5">AM-Tippu All-Access Unlimited</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-white/5 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                military_tech
              </span>
            </div>
          </div>

          {/* Live Validity Status */}
          <div className="p-3 rounded-2xl bg-surface-container-low border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <div>
                <span className="text-xs font-bold text-white block">Active</span>
                <span className="text-[10px] text-outline">Renews on --</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-secondary bg-secondary/15 px-2 py-0.5 rounded-full">VALID</span>
          </div>

          {/* Privileges Checklist */}
          <div className="space-y-2 text-xs text-outline/90">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
              <span className="text-white">Operating Hours: 06:00 AM - 11:00 PM (Sun: 08:00 AM - 01:00 PM)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
              <span className="text-white">Coach Tippu 1-on-1 Guidance & Programming</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
              <span className="text-white">RFID Key Fob & Dynamic Turnstile QR Synced</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
              <span className="text-white">Premium Supplements & Gym Gear Available</span>
            </div>
          </div>

          {/* UPI RENEW BUTTON */}
          <button
            onClick={() => setIsUpiModalOpen(true)}
            className="w-full py-3.5 rounded-full bg-primary text-black font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>Renew via UPI (GPay / PhonePe / Paytm)</span>
          </button>
        </section>

        {/* ATTENDANCE & ACTIVITY TELEMETRY (4-BENTO METRIC GRID) */}
        <section className="space-y-2.5">
          <h3 className="text-xs font-bold text-outline uppercase tracking-wider px-1">Gym Floor Attendance</h3>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-surface-card p-3.5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-outline uppercase">Total Check-Ins</span>
              <div className="text-2xl font-extrabold text-white">
                -- <span className="text-xs text-outline font-normal">days</span>
              </div>
              <span className="text-[10px] text-secondary font-bold">--</span>
            </div>
            <div className="bg-surface-card p-3.5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-outline uppercase">Current Streak</span>
              <div className="text-2xl font-extrabold text-primary">
                -- <span className="text-xs text-outline font-normal">days 🔥</span>
              </div>
              <span className="text-[10px] text-outline">--</span>
            </div>
            <div className="bg-surface-card p-3.5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-outline uppercase">Avg Session Duration</span>
              <div className="text-xl font-extrabold text-white">
                -- <span className="text-xs text-outline font-normal">mins</span>
              </div>
              <span className="text-[10px] text-outline">--</span>
            </div>
            <div className="bg-surface-card p-3.5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-outline uppercase">Preferred Slot</span>
              <div className="text-xl font-extrabold text-white">
                {user?.preferredSlot ? (
                  <span className="text-sm sm:text-base">{user.preferredSlot}</span>
                ) : (
                  <>-- <span className="text-xs text-outline font-normal">AM</span></>
                )}
              </div>
              <span className="text-[10px] text-secondary font-semibold">--</span>
            </div>
          </div>
        </section>

        {/* WEEKLY ROUTINE & SPLIT CARD */}
        <section className="bg-surface-card rounded-3xl p-5 border border-white/[0.06] space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">ATHLETE ROUTINE</span>
              <h3 className="text-sm font-bold text-white">Weekly Training Split</h3>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary hover:text-black transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              <span>Edit Split</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {[
              { day: "Mon", full: "Monday" },
              { day: "Tue", full: "Tuesday" },
              { day: "Wed", full: "Wednesday" },
              { day: "Thu", full: "Thursday" },
              { day: "Fri", full: "Friday" },
              { day: "Sat", full: "Saturday" },
              { day: "Sun", full: "Sunday" },
            ].map(({ day, full }) => {
              const focus = splitData[day] || "Rest Day";
              const isRest = focus.toLowerCase().includes("rest") || focus.toLowerCase().includes("recovery");
              return (
                <div key={day} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-white/5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 font-bold text-outline uppercase text-[11px]">{day}</span>
                    <span className={`font-semibold ${isRest ? 'text-outline' : 'text-white'}`}>{focus}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isRest ? 'bg-surface-elevated text-outline' : 'bg-primary/10 text-primary'}`}>
                    {isRest ? "REST" : "ACTIVE"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* GYM FLOOR LIVE STATUS CALLOUT (Directs to Checkin) */}
        <Link
          href="/dashboard/checkin"
          className="flex items-center justify-between p-4 rounded-2xl bg-surface-card hover:bg-surface-elevated border border-white/5 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="text-xs font-bold text-white">-- Athletes On Gym Floor Now</span>
              </div>
              <span className="text-[10px] text-outline">View active members, streaks & social links in Turnstile Pass</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-surface-card object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                alt="Member"
              />
            </div>
            <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all">
              chevron_right
            </span>
          </div>
        </Link>

        {/* COACH TIPPU RELATIONSHIP & ASSESSMENT HUB */}
        <section className="bg-surface-card rounded-3xl p-5 border border-white/[0.06] space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/40 bg-surface-elevated shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=150&q=80"
                  alt="Coach Tippu"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white">Coach Tippu</h4>
                  <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
                </div>
                <p className="text-[11px] text-outline">Head Strength & Conditioning Coach</p>
                <span className="text-[10px] text-primary font-semibold">Goal: --</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-2xl border border-white/5 text-xs text-outline space-y-1">
            <div className="flex items-center justify-between text-white font-semibold">
              <span>Next 1-on-1 Form Check:</span>
              <span className="text-primary font-bold">--</span>
            </div>
            <p className="text-[11px] text-outline/80 leading-relaxed">Focus: --</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-full bg-surface-elevated hover:bg-surface-container-high border border-white/5 text-xs font-bold text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">chat</span>
              <span>Message Coach</span>
            </a>
            <button
              onClick={() => displayToast("Assessment request sent to Coach Tippu!")}
              className="py-2.5 px-3 rounded-full bg-surface-elevated hover:bg-surface-container-high border border-white/5 text-xs font-bold text-primary flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
              <span>Book Check-in</span>
            </button>
          </div>
        </section>

        {/* INVOICES & PAYMENT RECEIPTS */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-outline uppercase tracking-wider">Billing History & Tax Receipts</h3>
            <span className="text-[10px] text-primary font-semibold">GST Invoices</span>
          </div>

          <div className="bg-surface-card rounded-2xl border border-white/5 divide-y divide-white/[0.04] overflow-hidden">
            <div className="p-4 flex items-center justify-between text-center">
              <span className="text-xs text-outline w-full block">No billing history available.</span>
            </div>
          </div>
        </section>

        {/* ATHLETE SPECS & EMERGENCY PROFILE */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-outline uppercase tracking-wider">Athlete Specs &amp; Health Profile</h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>Edit</span>
              <span className="material-symbols-outlined text-[13px]">edit</span>
            </button>
          </div>
          <div className="bg-surface-card rounded-2xl p-4 border border-white/5 space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
              <span className="text-outline">RFID Key Fob ID</span>
              <span className="font-bold text-primary">#AMT-FOB-0000 (Synced)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
              <span className="text-outline">Emergency Contact</span>
              <span className="font-bold text-white">--</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-outline">Blood Group &amp; Medical</span>
              <span className="font-bold text-secondary">-- • PAR-Q Cleared</span>
            </div>
          </div>
        </section>

        {/* PREFERENCES & TOGGLES */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-outline uppercase tracking-wider">Facility Preferences</h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>Configure</span>
              <span className="material-symbols-outlined text-[13px]">settings</span>
            </button>
          </div>
          <div className="bg-surface-card rounded-2xl border border-white/5 divide-y divide-white/[0.04] overflow-hidden text-xs">
            {/* Toggle 1 */}
            <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors">
              <div>
                <span className="font-bold text-white block">Turnstile Haptic Feedback</span>
                <span className="text-[10px] text-outline">Vibrate upon optical QR scanner clearance</span>
              </div>
              <input
                type="checkbox"
                checked={hapticFeedback}
                onChange={(e) => setHapticFeedback(e.target.checked)}
                className="rounded bg-surface-elevated border-white/10 text-primary focus:ring-0 w-4 h-4"
              />
            </label>
            {/* Toggle 2 */}
            <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors">
              <div>
                <span className="font-bold text-white block">Floor Peak Occupancy Alerts</span>
                <span className="text-[10px] text-outline">Notify when gym floor occupancy &lt; 20 athletes</span>
              </div>
              <input
                type="checkbox"
                checked={occupancyAlerts}
                onChange={(e) => setOccupancyAlerts(e.target.checked)}
                className="rounded bg-surface-elevated border-white/10 text-primary focus:ring-0 w-4 h-4"
              />
            </label>
            {/* Units */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => setIsEditModalOpen(true)}
            >
              <div>
                <span className="font-bold text-white block">Measurement System</span>
                <span className="text-[10px] text-outline">
                  {unitSystem === "Metric" ? "Metric (kg, cm, Celsius)" : "Imperial (lbs, in, Fahrenheit)"}
                </span>
              </div>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg uppercase">
                {unitSystem}
              </span>
            </div>
            {/* Rules */}
            <button
              onClick={() => displayToast("Facility etiquette: Re-rack weights & wipe machines")}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-elevated transition-colors"
            >
              <div>
                <span className="font-bold text-white block">Gym Etiquette & Facility Guidelines</span>
                <span className="text-[10px] text-outline">Turnstile rules, dress code, chalk policy</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            </button>
          </div>
        </section>

        {/* LOGOUT & VERSION */}
        <section className="pt-2 text-center space-y-2">
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-full bg-surface-elevated border border-white/5 text-xs font-semibold text-outline hover:text-red-400 active:scale-95 transition-all"
          >
            Sign Out of Account
          </button>
          <p className="text-[10px] text-outline/60">AM-Tippu Fitness • v2.4.0 (Build 89) • Made for {user?.name || "Athlete"}</p>
        </section>
      </main>

      {/* ========================================== */}
      {/* EDIT PROFILE & CONFIGURATIONS MODAL */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-surface-card rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-surface-card">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Edit Profile & Settings</h3>
                  <p className="text-[11px] text-outline">Real photo, social links & gym specs</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-elevated text-outline hover:text-white flex items-center justify-center active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(92vh-140px)]">
              {/* 1. REAL PHOTO UPLOAD */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                    1. Member Real Photo
                  </label>
                  <span className="text-[10px] text-primary font-semibold">Camera or File</span>
                </div>

                <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-white/5">
                  <div className="relative shrink-0">
                    <div className="w-[72px] h-[72px] rounded-full p-[2px] bg-gradient-to-tr from-primary to-surface-card shadow-[0_0_16px_rgba(255,154,46,0.25)]">
                      <img
                        src={userAvatar}
                        className="w-full h-full rounded-full object-cover bg-surface-card"
                        alt="Avatar preview"
                      />
                    </div>
                    <button
                      type="button"
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
                      title="Take photo or upload"
                    >
                      <span className="material-symbols-outlined text-[14px] font-bold">photo_camera</span>
                    </button>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-fixed-dim text-xs font-bold text-black flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">upload_file</span>
                        <span>Upload Real Photo</span>
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-container-high border border-white/5 text-[11px] font-semibold text-outline hover:text-white transition-all"
                      >
                        Reset
                      </button>
                    </div>
                    <input type="file" accept="image/*" className="hidden" />
                    <p className="text-[10px] text-outline">Upload your actual gym photo from camera or phone library</p>
                  </div>
                </div>

                {/* Direct Image URL Option */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-outline">Or Paste Photo Direct URL</span>
                  <input
                    type="url"
                    value={editForm.avatarUrl}
                    onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                  />
                </div>
              </div>

              {/* 2. SOCIAL MEDIA LINKS CONFIGURATION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                    2. Your Social Media Links
                  </label>
                  <span className="text-[10px] text-secondary font-semibold">Visible to Gym Members</span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] font-semibold text-outline block mb-1">Instagram Profile / Handle</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-pink-400">IG</span>
                      <input
                        type="text"
                        value={editForm.instagram}
                        onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                        placeholder="@sufiyan.fit or https://instagram.com/sufiyan.fit"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-outline block mb-1">Strava Athlete Profile</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-orange-400">
                        ST
                      </span>
                      <input
                        type="text"
                        value={editForm.strava}
                        onChange={(e) => setEditForm({ ...editForm, strava: e.target.value })}
                        placeholder="strava.com/athletes/... or athlete name"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-outline block mb-1">X / Twitter Handle</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-white text-[11px]">𝕏</span>
                        <input
                          type="text"
                          value={editForm.twitter}
                          onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                          placeholder="@sufiyan_fit"
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-outline block mb-1">YouTube / Other Link</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-red-500 text-[11px]">YT</span>
                        <input
                          type="text"
                          value={editForm.youtube}
                          onChange={(e) => setEditForm({ ...editForm, youtube: e.target.value })}
                          placeholder="@channel or URL"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. ATHLETE IDENTITY */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                  3. Athlete Identity
                </label>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] font-semibold text-outline block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g. Sufiyan Khan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs font-bold text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-outline block mb-1">Handle / Username</label>
                      <input
                        type="text"
                        value={editForm.handle}
                        onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })}
                        placeholder="@sufiyan.fit"
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-outline block mb-1">Membership ID</label>
                      <input
                        type="text"
                        value={editForm.memberId}
                        onChange={(e) => setEditForm({ ...editForm, memberId: e.target.value })}
                        placeholder="#TK-9842"
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-outline block mb-1">Membership Tier & Badge</label>
                    <select
                      value={editForm.tier}
                      onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white focus:border-primary focus:ring-0"
                    >
                      <option value={user?.role?.toUpperCase() || "MEMBER"}>{user?.role?.toUpperCase() || "MEMBER"} (Gold Tier)</option>
                      <option value="PRO ALL-ACCESS ATHLETE">PRO ALL-ACCESS ATHLETE</option>
                      <option value="FOUNDER'S CIRCLE">FOUNDER'S CIRCLE</option>
                      <option value="STANDARD ATHLETE">STANDARD ATHLETE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. FITNESS GOALS & TARGETS */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                  4. Goals & Coaching Specs
                </label>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] font-semibold text-outline block mb-1">Current Goal / Bio Statement</label>
                    <input
                      type="text"
                      value={editForm.goal}
                      onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
                      placeholder="e.g. Clean Bulk to 78kg • Strength Focus"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-outline block mb-1">Target Goal Weight</label>
                      <input
                        type="text"
                        value={editForm.targetWeight}
                        onChange={(e) => setEditForm({ ...editForm, targetWeight: e.target.value })}
                        placeholder="e.g. 72.0 kg"
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-outline block mb-1">Preferred Gym Slot</label>
                      <select
                        value={editForm.preferredSlot}
                        onChange={(e) => setEditForm({ ...editForm, preferredSlot: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white focus:border-primary focus:ring-0"
                      >
                        <option value="06:00 AM">06:00 AM (Early Bird)</option>
                        <option value="07:00 AM">07:00 AM (Low-Density)</option>
                        <option value="08:30 AM">08:30 AM (Morning Rush)</option>
                        <option value="05:30 PM">05:30 PM (Evening Prime)</option>
                        <option value="07:00 PM">07:00 PM (Peak Power)</option>
                        <option value="09:00 PM">09:00 PM (Night Owls)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. WEEKLY SPLIT BUILDER */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                    5. Weekly Training Split (Customize Days)
                  </label>
                  <span className="text-[10px] text-primary font-bold">Auto-syncs to Dashboard</span>
                </div>

                {/* Preset split buttons */}
                <div className="flex overflow-x-auto no-scrollbar gap-1.5 py-1">
                  <button type="button" onClick={() => applyPresetSplit('ppl')} className="px-3 py-1 rounded-full bg-surface-elevated hover:bg-surface-container-high border border-white/5 text-[10px] font-bold text-white shrink-0">
                    Push Pull Legs
                  </button>
                  <button type="button" onClick={() => applyPresetSplit('arnold')} className="px-3 py-1 rounded-full bg-surface-elevated hover:bg-surface-container-high border border-white/5 text-[10px] font-bold text-white shrink-0">
                    Arnold Split
                  </button>
                  <button type="button" onClick={() => applyPresetSplit('bro')} className="px-3 py-1 rounded-full bg-surface-elevated hover:bg-surface-container-high border border-white/5 text-[10px] font-bold text-white shrink-0">
                    Bro Split
                  </button>
                  <button type="button" onClick={() => applyPresetSplit('upper_lower')} className="px-3 py-1 rounded-full bg-surface-elevated hover:bg-surface-container-high border border-white/5 text-[10px] font-bold text-white shrink-0">
                    Upper / Lower
                  </button>
                </div>

                {/* Day by Day inputs */}
                <div className="space-y-2">
                  {[
                    { key: "Mon", label: "Monday" },
                    { key: "Tue", label: "Tuesday" },
                    { key: "Wed", label: "Wednesday" },
                    { key: "Thu", label: "Thursday" },
                    { key: "Fri", label: "Friday" },
                    { key: "Sat", label: "Saturday" },
                    { key: "Sun", label: "Sunday" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2 bg-surface-container-low p-2 rounded-xl border border-white/5">
                      <span className="w-12 text-[10px] font-bold text-outline uppercase pl-1">{key}</span>
                      <input
                        type="text"
                        value={splitData[key] || ""}
                        onChange={(e) => setSplitData({ ...splitData, [key]: e.target.value })}
                        placeholder="e.g. Back and Biceps Day"
                        className="flex-1 bg-surface-elevated border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-outline/40 focus:border-primary focus:ring-0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. CONTACT & EMERGENCY SPECS */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                  6. Contact & Facility Specs
                </label>

                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-outline block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-outline block mb-1">Blood Group</label>
                      <select
                        value={editForm.bloodGroup}
                        onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white focus:border-primary focus:ring-0"
                      >
                        <option value="O+">O+ Positive</option>
                        <option value="O-">O- Negative</option>
                        <option value="A+">A+ Positive</option>
                        <option value="A-">A- Negative</option>
                        <option value="B+">B+ Positive</option>
                        <option value="B-">B- Negative</option>
                        <option value="AB+">AB+ Positive</option>
                        <option value="AB-">AB- Negative</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-outline block mb-1">
                      Emergency Contact (Relation & Phone)
                    </label>
                    <input
                      type="text"
                      value={editForm.emergencyContact}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                      placeholder="e.g. Brother (+91 98765 43210)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-outline block mb-1">RFID Key Fob ID</label>
                    <input
                      type="text"
                      value={editForm.fobId}
                      onChange={(e) => setEditForm({ ...editForm, fobId: e.target.value })}
                      placeholder="#AMT-FOB-9842"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary focus:ring-0"
                    />
                  </div>
                </div>
              </div>

              {/* 6. FACILITY & APP CONFIGURATIONS */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                  6. App & Facility Configurations
                </label>

                <div className="bg-surface-container-low rounded-2xl border border-white/5 divide-y divide-white/[0.04] p-1">
                  {/* Toggle: Haptic Feedback */}
                  <label className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]">
                    <div>
                      <span className="text-xs font-bold text-white block">Turnstile Haptic Feedback</span>
                      <span className="text-[10px] text-outline">Vibrate upon optical QR scanner clearance</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editForm.hapticFeedback}
                      onChange={(e) => setEditForm({ ...editForm, hapticFeedback: e.target.checked })}
                      className="rounded bg-surface-elevated border-white/10 text-primary focus:ring-0 w-4 h-4"
                    />
                  </label>

                  {/* Toggle: Occupancy Alerts */}
                  <label className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]">
                    <div>
                      <span className="text-xs font-bold text-white block">Peak Floor Occupancy Alerts</span>
                      <span className="text-[10px] text-outline">Notify when gym floor occupancy &lt; 20 athletes</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editForm.occupancyAlerts}
                      onChange={(e) => setEditForm({ ...editForm, occupancyAlerts: e.target.checked })}
                      className="rounded bg-surface-elevated border-white/10 text-primary focus:ring-0 w-4 h-4"
                    />
                  </label>

                  {/* Toggle: Measurement Unit */}
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Measurement Unit System</span>
                      <span className="text-[10px] text-outline">Used for weight logging and bar plates</span>
                    </div>
                    <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-white/5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setUnitSystem("Metric")}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          unitSystem === "Metric" ? "bg-primary text-black" : "text-outline hover:text-white"
                        }`}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnitSystem("Imperial")}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          unitSystem === "Imperial" ? "bg-primary text-black" : "text-outline hover:text-white"
                        }`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions (Sticky Bottom) */}
            <div className="p-4 bg-surface-card border-t border-white/[0.06] flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-1/3 py-3 rounded-full bg-surface-elevated hover:bg-surface-container-high border border-white/10 text-xs font-bold text-white active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-2/3 py-3 rounded-full bg-primary hover:bg-primary/90 text-xs font-extrabold text-black flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-[0_4px_16px_rgba(255,154,46,0.3)]"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI RENEWAL BOTTOM SHEET MODAL */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-surface-card rounded-t-3xl sm:rounded-3xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">INSTANT UPI RENEWAL</span>
                <h3 className="text-lg font-bold text-white">Renew All-Access Pass</h3>
              </div>
              <button
                onClick={() => setIsUpiModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-elevated text-outline hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between text-outline">
                <span>Plan:</span>
                <span className="text-white font-bold">12-Month Unlimited All-Access</span>
              </div>
              <div className="flex justify-between text-outline">
                <span>New Expiry:</span>
                <span className="text-secondary font-bold">--</span>
              </div>
              <div className="flex justify-between text-outline pt-2 border-t border-white/5">
                <span className="text-sm font-bold text-white">Total Amount:</span>
                <span className="text-lg font-extrabold text-primary">₹14,999</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-outline uppercase block">Select Payment App</span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <button
                  onClick={() => {
                    simulateUpi();
                    setIsUpiModalOpen(false);
                  }}
                  className="p-3 rounded-2xl bg-surface-elevated border border-white/5 hover:border-primary/40 text-white font-bold active:scale-95 transition-all"
                >
                  Google Pay
                </button>
                <button
                  onClick={() => {
                    simulateUpi();
                    setIsUpiModalOpen(false);
                  }}
                  className="p-3 rounded-2xl bg-surface-elevated border border-white/5 hover:border-primary/40 text-white font-bold active:scale-95 transition-all"
                >
                  PhonePe
                </button>
                <button
                  onClick={() => {
                    simulateUpi();
                    setIsUpiModalOpen(false);
                  }}
                  className="p-3 rounded-2xl bg-surface-elevated border border-white/5 hover:border-primary/40 text-white font-bold active:scale-95 transition-all"
                >
                  Paytm
                </button>
              </div>
            </div>

            <p className="text-[10px] text-outline text-center">
              Protected by 256-bit bank grade encryption • Instant Turnstile Pass Refresh
            </p>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-surface-elevated border border-primary/40 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 ${
          showToast ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
        <span>{toastMessage}</span>
      </div>

      {/* BOTTOM NAVIGATION DOCK */}
      <nav
        aria-label="Primary Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2 pb-safe max-w-md mx-auto pointer-events-none"
      >
        <div className="w-full bg-surface-elevated/90 backdrop-blur-xl rounded-full shadow-[0px_12px_32px_rgba(255,154,46,0.15)] flex justify-around items-center px-3 py-1.5 pointer-events-auto border border-white/[0.06]">
          <Link
            aria-label="Home"
            href="/dashboard"
            className="flex flex-col items-center justify-center text-outline p-2 hover:text-white transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">home</span>
          </Link>
          <Link
            aria-label="Workouts"
            href="/dashboard/workouts"
            className="flex flex-col items-center justify-center text-outline p-2 hover:text-white transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">fitness_center</span>
          </Link>
          <Link
            aria-label="Check-in"
            href="/dashboard/checkin"
            className="flex flex-col items-center justify-center text-outline p-2 hover:text-white transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">groups</span>
          </Link>
          <Link
            aria-label="Progress"
            href="/dashboard/progress"
            className="flex flex-col items-center justify-center text-outline p-2 hover:text-white transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]">monitoring</span>
          </Link>
          <Link
            aria-label="Profile"
            href="/dashboard/profile"
            className="flex flex-col items-center justify-center text-primary p-2 transition-colors duration-200 active:scale-90"
          >
            <span className="material-symbols-outlined text-[23px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              person
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
