"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

// Define Types
type WeightEntry = {
  id: string | number;
  date: string;
  time: string;
  weight: number;
  delta: string;
  cond: string;
  note: string;
};

type WorkoutRecord = {
  name: string;
  category: string;
  equipment: string;
  pr: string;
  date: string;
  history: string[];
};

export default function ProgressPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [timeframe, setTimeframe] = useState("3M");
  
  // Weight Logger State
  const [logWeight, setLogWeight] = useState<number>(user?.weight ? parseFloat(user.weight.toString()) : 0);
  const [logBf, setLogBf] = useState<string>("");
  const [logCond, setLogCond] = useState<string>("Morning Fasted");
  const [logNotes, setLogNotes] = useState<string>("");
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  
  // PRs State (Clean User Data only)
  const [prRecords, setPrRecords] = useState<WorkoutRecord[]>([]);
  const [isPrModalOpen, setIsPrModalOpen] = useState(false);
  const [isAddPrModalOpen, setIsAddPrModalOpen] = useState(false);
  const [editingPrIndex, setEditingPrIndex] = useState<number | null>(null);
  const [prCategory, setPrCategory] = useState("All");
  const [prSearch, setPrSearch] = useState("");
  const [newPrForm, setNewPrForm] = useState({
    name: "",
    category: "Chest",
    equipment: "Barbell",
    weight: "",
    reps: "1"
  });

  useEffect(() => {
    const saved = localStorage.getItem("athlete_prs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Completely strip out any temporary mock data with date "Recent Session"
        const clean = Array.isArray(parsed) ? parsed.filter((p: any) => p.date !== "Recent Session") : [];
        setPrRecords(clean);
        localStorage.setItem("athlete_prs", JSON.stringify(clean));
      } catch (e) {
        setPrRecords([]);
      }
    } else {
      setPrRecords([]);
    }

    const savedWeighins = localStorage.getItem("athlete_weighins");
    if (savedWeighins) {
      try {
        setWeightHistory(JSON.parse(savedWeighins));
      } catch (e) {}
    }
  }, []);

  const handleOpenAddPr = () => {
    setEditingPrIndex(null);
    setNewPrForm({ name: "", category: "Chest", equipment: "Barbell", weight: "", reps: "1" });
    setIsAddPrModalOpen(true);
  };

  const handleEditPr = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const pr = prRecords[index];
    if (!pr) return;
    setEditingPrIndex(index);
    const weightClean = pr.pr.replace(/[^\d.]/g, '');
    setNewPrForm({
      name: pr.name,
      category: pr.category,
      equipment: pr.equipment,
      weight: weightClean,
      reps: "1"
    });
    setIsAddPrModalOpen(true);
  };

  const handleDeletePr = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = prRecords.filter((_, i) => i !== index);
    setPrRecords(updated);
    localStorage.setItem("athlete_prs", JSON.stringify(updated));
    triggerToast("Personal Record deleted");
  };

  const handleSavePr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrForm.name.trim() || !newPrForm.weight.trim()) {
      triggerToast("Please enter an exercise name and PR weight");
      return;
    }
    const weightNum = parseFloat(newPrForm.weight);
    const record: WorkoutRecord = {
      name: newPrForm.name.trim(),
      category: newPrForm.category,
      equipment: newPrForm.equipment,
      pr: `${newPrForm.weight} kg`,
      date: "Today",
      history: [
        `${(weightNum * 0.75).toFixed(0)} kg × 10`,
        `${(weightNum * 0.85).toFixed(0)} kg × 6`,
        `${newPrForm.weight} kg × ${newPrForm.reps} (PR)`
      ]
    };

    let updated: WorkoutRecord[];
    if (editingPrIndex !== null) {
      updated = [...prRecords];
      updated[editingPrIndex] = record;
      triggerToast(`Personal Record for ${record.name} updated!`);
    } else {
      updated = [record, ...prRecords.filter(p => p.name.toLowerCase() !== record.name.toLowerCase())];
      triggerToast(`Personal Record for ${record.name} recorded!`);
    }

    setPrRecords(updated);
    localStorage.setItem("athlete_prs", JSON.stringify(updated));
    setIsAddPrModalOpen(false);
    setEditingPrIndex(null);
    setNewPrForm({ name: "", category: "Chest", equipment: "Barbell", weight: "", reps: "1" });
  };

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Stats
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [caloriesBurnedTarget, setCaloriesBurnedTarget] = useState(0);
  const [caloriesIntake, setCaloriesIntake] = useState(0);
  const [caloriesIntakeTarget, setCaloriesIntakeTarget] = useState(0);
  
  const [protein, setProtein] = useState(0);
  const [proteinTarget, setProteinTarget] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [carbsTarget, setCarbsTarget] = useState(0);
  const [fats, setFats] = useState(0);
  const [fatsTarget, setFatsTarget] = useState(0);
  
  const [bodyFat, setBodyFat] = useState(0);
  const [skeletalMuscle, setSkeletalMuscle] = useState(0);

  useEffect(() => {
    if (user?.weight && user?.height) {
      const w = parseFloat(user.weight.toString()) || 70;
      const h = parseFloat(user.height.toString()) || 170;
      // Basic BMR formula (Mifflin-St Jeor)
      const bmr = (10 * w) + (6.25 * h) - (5 * 25) + 5;
      const tdee = bmr * 1.55; // moderate activity
      
      let target = tdee;
      if (user.goal?.toLowerCase().includes('hypertrophy')) target += 300;
      else if (user.goal?.toLowerCase().includes('fat loss')) target -= 500;
      else if (user.goal?.toLowerCase().includes('strength')) target += 500;
      
      setCaloriesIntakeTarget(Math.round(target));
      setCaloriesBurnedTarget(Math.round(tdee * 0.2)); 
      
      setProteinTarget(Math.round(w * 2.2));
      setFatsTarget(Math.round((target * 0.25) / 9));
      setCarbsTarget(Math.round((target - (w * 2.2 * 4) - (target * 0.25)) / 4));
    }
  }, [user]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  const handleDecrement = () => {
    setLogWeight(prev => Math.max(30, Number((prev - 0.1).toFixed(1))));
  };

  const handleIncrement = () => {
    setLogWeight(prev => Math.min(250, Number((prev + 0.1).toFixed(1))));
  };

  const handleSaveWeight = () => {
    if (!logWeight || logWeight <= 0) {
      triggerToast("Please enter a valid weight");
      return;
    }

    const prevWeight = weightHistory.length > 0 ? weightHistory[0].weight : logWeight;
    const deltaVal = (logWeight - prevWeight).toFixed(1);
    const deltaStr = Number(deltaVal) <= 0 ? `${deltaVal} kg` : `+${deltaVal} kg`;

    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateStr = `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, "0")}, ${now.getFullYear()}`;
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newEntry: WeightEntry = {
      id: Date.now(),
      date: dateStr,
      time: timeStr,
      weight: logWeight,
      delta: deltaStr,
      cond: logCond,
      note: logNotes || "User logged entry"
    };

    const updated = [newEntry, ...weightHistory];
    setWeightHistory(updated);
    localStorage.setItem("athlete_weighins", JSON.stringify(updated));
    triggerToast(`✓ Saved weigh-in: ${logWeight.toFixed(1)} kg!`);
    
    // reset form
    setLogNotes("");
  };

  const deleteEntry = (id: string | number) => {
    const updated = weightHistory.filter(entry => entry.id !== id);
    setWeightHistory(updated);
    localStorage.setItem("athlete_weighins", JSON.stringify(updated));
    triggerToast("Entry removed");
  };

  const filteredPrs = prRecords.filter(pr => {
    if (prCategory !== "All" && pr.category.toLowerCase() !== prCategory.toLowerCase()) return false;
    if (prSearch.trim()) {
      const q = prSearch.toLowerCase();
      if (!pr.name.toLowerCase().includes(q) && !pr.category.toLowerCase().includes(q) && !pr.equipment.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const latestWeight = weightHistory.length > 0 ? weightHistory[0].weight : logWeight;

  return (
    <div className="bg-surface-container-lowest min-h-screen text-on-surface antialiased pb-28">
      {/* TOP APP BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-low/90 backdrop-blur-md border-b border-white/[0.04]">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-9 h-9 rounded-full bg-surface-elevated border border-white/5 flex items-center justify-center text-outline hover:text-white">
              <span className="material-symbols-outlined text-[19px]">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Progress & Analytics</h1>
              <p className="text-[11px] text-outline">Weight trajectory & body metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-elevated px-2.5 py-1 rounded-full border border-white/5 text-[11px]">
            <span className="text-outline">Goal:</span>
            <span className="text-primary font-bold">{user?.targetWeight ? `${user.targetWeight} kg` : (user?.goal || "Not Set")}</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-md mx-auto pt-20 px-5 space-y-5">
        
        {/* TIMEFRAME SELECTOR */}
        <div className="flex justify-between items-center bg-surface-card p-1 rounded-2xl border border-white/5 text-xs font-semibold">
          {["1M", "3M", "6M", "1Y"].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 py-1.5 rounded-xl ${timeframe === tf ? 'bg-primary text-black font-bold' : 'text-outline hover:text-white'}`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* CURRENT WEIGHT TRAJECTORY HERO CARD */}
        <section className="bg-surface-card rounded-3xl p-5 border border-white/[0.06] amber-glow space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-outline tracking-wider uppercase block">Current Weight</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-4xl font-extrabold text-white">{latestWeight > 0 ? latestWeight.toFixed(1) : "--"}</span>
                <span className="text-lg text-outline font-semibold">kg</span>
              </div>
              <p className="text-[11px] text-outline mt-0.5">
                {weightHistory.length > 0 ? `Logged ${weightHistory[0].date}, ${weightHistory[0].time}` : "No entries yet"}
              </p>
            </div>
            {weightHistory.length > 0 && (
              <div className="px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">trending_down</span>
                <span>{weightHistory[0].delta}</span>
              </div>
            )}
          </div>

          {/* TRAJECTORY SVG GRAPH */}
          <div className="relative w-full h-32 mt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 320 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="amberGlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF9A2E" stopOpacity="0.35"/>
                  <stop offset="100%" stopColor="#FF9A2E" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              <path d="M 0,50 L 300,50 L 300,100 L 0,100 Z" fill="url(#amberGlowGrad)"/>
              <path d="M 0,50 L 300,50" fill="none" stroke="#FF9A2E" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="300" cy="50" r="5" fill="#FF9A2E"/>
              <circle cx="300" cy="50" r="2" fill="#0C0B0A"/>
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-outline font-semibold pt-1 border-t border-white/[0.04]">
            <span>--</span>
            <span>--</span>
            <span>--</span>
            <span className="text-primary font-bold">TODAY ({latestWeight > 0 ? latestWeight.toFixed(1) : "--"})</span>
          </div>
        </section>

        {/* INTERACTIVE WEIGHT LOGGER WIDGET */}
        <section className="bg-surface-card rounded-3xl p-5 border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[19px]">scale</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Log Today's Weight</h2>
                <p className="text-[11px] text-outline">Adjust with buttons or tap number</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">ACTIVE LOGGER</span>
          </div>

          {/* STEPPER CONTROLS */}
          <div className="flex items-center justify-between bg-surface-container-low p-3.5 rounded-2xl border border-white/[0.05]">
            <button onClick={handleDecrement} className="w-12 h-12 rounded-xl bg-surface-elevated hover:bg-surface-container-high active:scale-90 flex items-center justify-center text-white text-xl font-bold transition-all border border-white/5">
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>

            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={logWeight || ""}
                  onChange={(e) => setLogWeight(parseFloat(e.target.value))}
                  className="w-28 text-center text-3xl font-extrabold text-white bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
                />
                <span className="text-sm text-outline font-semibold">kg</span>
              </div>
              <span className="text-[9px] text-outline uppercase font-bold tracking-wider block mt-1">Tap number to type</span>
            </div>

            <button onClick={handleIncrement} className="w-12 h-12 rounded-xl bg-surface-elevated hover:bg-surface-container-high active:scale-90 flex items-center justify-center text-primary text-xl font-bold transition-all border border-white/5">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>

          {/* OPTIONAL ATTRIBUTES */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-outline uppercase block mb-1">Body Fat % (Est.)</label>
              <input 
                type="text" 
                value={logBf}
                onChange={(e) => setLogBf(e.target.value)}
                placeholder="%"
                className="w-full bg-surface-container-low text-xs text-white rounded-xl border border-white/[0.06] p-2.5 focus:border-primary focus:ring-0"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-outline uppercase block mb-1">Weigh-in Condition</label>
              <select 
                value={logCond}
                onChange={(e) => setLogCond(e.target.value)}
                className="w-full bg-surface-container-low text-xs text-white rounded-xl border border-white/[0.06] p-2.5 focus:border-primary focus:ring-0 [&>option]:bg-[#121212] [&>option]:text-white"
              >
                <option>Morning Fasted</option>
                <option>Post-Workout</option>
                <option>Evening Before Bed</option>
                <option>Rest Day Baseline</option>
              </select>
            </div>
          </div>

          {/* NOTES FIELD */}
          <div>
            <label className="text-[10px] font-bold text-outline uppercase block mb-1">Notes (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Well rested, post light jog..."
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              className="w-full bg-surface-container-low text-xs text-white placeholder:text-outline/50 rounded-xl border border-white/[0.06] p-2.5 focus:border-primary focus:ring-0"
            />
          </div>

          {/* SAVE BUTTON */}
          <button onClick={handleSaveWeight} className="w-full py-3.5 rounded-full bg-primary text-black font-bold text-sm amber-glow flex items-center justify-center gap-2 active:scale-98 transition-all">
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>Save Weigh-In Entry</span>
          </button>
        </section>

        {/* CALORIE & DAILY ACTIVE ENERGY TRACKER */}
        <section className="bg-surface-card rounded-3xl p-5 border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container shadow-[0px_0px_16px_rgba(255,154,46,0.3)]">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Calorie & Energy Tracker</h2>
                <p className="text-[11px] text-outline">Active Burn & Nutrition Balance</p>
              </div>
            </div>
          </div>

          {/* Main Calorie Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Active Burn */}
            <div className="bg-surface-container-low p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-outline text-[10px] font-bold uppercase">
                <span>Active Burn</span>
                <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-white">{caloriesBurned}</span>
                <span className="text-xs text-outline font-semibold">/ {caloriesBurnedTarget} kcal</span>
              </div>
              <div className="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary-container h-1.5 rounded-full" style={{ width: `${caloriesBurnedTarget ? (caloriesBurned / caloriesBurnedTarget) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Calorie Intake */}
            <div className="bg-surface-container-low p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-outline text-[10px] font-bold uppercase">
                <span>Intake</span>
                <span className="material-symbols-outlined text-[16px] text-secondary">restaurant</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-white">{caloriesIntake}</span>
                <span className="text-xs text-outline font-semibold">/ {caloriesIntakeTarget} kcal</span>
              </div>
              <div className="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
                <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${caloriesIntakeTarget ? (caloriesIntake / caloriesIntakeTarget) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>

          {/* Macro Split Row */}
          <div className="bg-surface-container-low p-3.5 rounded-2xl border border-white/5 flex items-center justify-around text-center text-xs">
            <div>
              <span className="text-[10px] font-bold text-outline uppercase block">PROTEIN</span>
              <span className="text-sm font-extrabold text-white">{protein} / {proteinTarget}g</span>
            </div>
            <div className="w-px h-7 bg-white/10"></div>
            <div>
              <span className="text-[10px] font-bold text-outline uppercase block">CARBS</span>
              <span className="text-sm font-extrabold text-white">{carbs} / {carbsTarget}g</span>
            </div>
            <div className="w-px h-7 bg-white/10"></div>
            <div>
              <span className="text-[10px] font-bold text-outline uppercase block">FATS</span>
              <span className="text-sm font-extrabold text-white">{fats} / {fatsTarget}g</span>
            </div>
          </div>

          {/* Quick Action Button */}
          <button onClick={() => triggerToast("Action coming soon")} className="w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-container-high border border-white/5 text-xs font-bold text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[16px] text-primary">add_circle</span>
            <span>+ Log Calories or Meal</span>
          </button>
        </section>

        {/* BODY COMPOSITION METRICS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-card rounded-2xl p-4 border border-white/[0.05] space-y-2">
            <div className="flex items-center justify-between text-outline">
              <span className="text-[10px] font-bold uppercase tracking-wider">Body Fat</span>
              <span className="material-symbols-outlined text-[16px] text-secondary">pie_chart</span>
            </div>
            <div className="text-2xl font-extrabold text-white">{bodyFat}%</div>
          </div>

          <div className="bg-surface-card rounded-2xl p-4 border border-white/[0.05] space-y-2">
            <div className="flex items-center justify-between text-outline">
              <span className="text-[10px] font-bold uppercase tracking-wider">Skeletal Muscle</span>
              <span className="material-symbols-outlined text-[16px] text-primary">fitness_center</span>
            </div>
            <div className="text-2xl font-extrabold text-white">{skeletalMuscle} kg</div>
          </div>
        </div>

        {/* PERSONAL RECORDS (PR) MILESTONES */}
        <section className="bg-surface-card rounded-3xl p-5 border border-white/[0.05] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Personal Records (1RM)</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsAddPrModalOpen(true)} 
                className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary hover:text-black transition-all flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Record PR</span>
              </button>
              <button onClick={() => setIsPrModalOpen(true)} className="text-xs font-bold text-outline hover:text-white flex items-center gap-1 active:scale-95 transition-all">
                <span>View All</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {prRecords.slice(0, 3).map((pr, i) => (
              <div 
                key={i} 
                onClick={() => handleEditPr(i)} 
                className="bg-surface-container-low p-3 rounded-2xl border border-white/5 flex flex-col justify-between relative group cursor-pointer hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-outline uppercase">{pr.category}</span>
                  <button 
                    onClick={(e) => handleDeletePr(i, e)} 
                    className="text-outline hover:text-red-400 p-0.5" 
                    title="Delete PR"
                  >
                    <span className="material-symbols-outlined text-[13px]">delete</span>
                  </button>
                </div>
                <span className="text-base font-extrabold text-primary block my-1">{pr.pr}</span>
                <span className="text-[10px] text-white font-bold block truncate">{pr.name}</span>
                <span className="text-[8px] text-outline mt-0.5">Tap to Edit</span>
              </div>
            ))}
            {prRecords.length === 0 && (
              <div className="col-span-3 text-center text-outline text-xs py-4">
                No Personal Records logged yet. Tap "Record PR" above to log your best lifts!
              </div>
            )}
          </div>
        </section>

        {/* HISTORICAL WEIGH-IN LOG */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Weigh-In History</h3>
              <p className="text-[11px] text-outline">Stored chronologically</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {weightHistory.length === 0 ? (
              <div className="text-center py-6 text-outline text-xs bg-surface-card rounded-2xl border border-white/5">
                No weigh-in history yet. Log your weight above!
              </div>
            ) : (
              weightHistory.map(item => (
                <div key={item.id} className="bg-surface-card rounded-2xl p-3.5 border border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-white/5 flex flex-col items-center justify-center">
                      <span className="text-[9px] font-bold text-outline uppercase">{item.date.split(' ')[0]}</span>
                      <span className="text-sm font-bold text-white leading-none">{item.date.split(' ')[1].replace(',', '')}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{Number(item.weight).toFixed(1)} kg</span>
                        <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">{item.delta}</span>
                      </div>
                      <p className="text-[11px] text-outline">{item.cond} • {item.time}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteEntry(item.id)} className="text-outline hover:text-red-400 p-1">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* TOAST NOTIFICATION */}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-surface-elevated border border-primary/40 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 ${showToast ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
        <span>{toastMessage}</span>
      </div>

      {/* ALL WORKOUT RECORDS & EXERCISE PR MODAL */}
      {isPrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-surface-card rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">ALL EXERCISE MILESTONES</span>
                <h2 className="text-lg font-bold text-white">Previous Workout Records</h2>
              </div>
              <button onClick={() => setIsPrModalOpen(false)} className="w-8 h-8 rounded-full bg-surface-elevated text-outline hover:text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-4 border-b border-white/[0.04] space-y-2.5">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
                <input 
                  type="text" 
                  placeholder="Search exercises (e.g. Squat, Row, OHP)..." 
                  value={prSearch}
                  onChange={(e) => setPrSearch(e.target.value)}
                  className="w-full bg-surface-container-low text-xs text-white placeholder:text-outline/60 pl-9 pr-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex overflow-x-auto no-scrollbar gap-1.5 py-0.5">
                {["All", "Chest", "Back", "Legs", "Shoulders", "Arms"].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setPrCategory(cat)} 
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 ${prCategory === cat ? 'bg-primary text-black font-bold' : 'bg-surface-elevated text-outline hover:text-white border border-white/5'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 no-scrollbar max-h-[60vh]">
              {filteredPrs.length === 0 ? (
                <div className="text-center py-6 text-outline text-xs">No records found matching filter.</div>
              ) : (
                filteredPrs.map((item, i) => (
                  <div key={i} className="bg-surface-container-low rounded-2xl p-4 border border-white/5 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{item.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold">PR {item.pr}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-outline mt-0.5">
                          <span className="px-2 py-0.2 rounded bg-surface-elevated">{item.category}</span>
                          <span>•</span>
                          <span>{item.equipment}</span>
                          <span>•</span>
                          <span>Last logged: {item.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const realIndex = prRecords.findIndex(p => p.name === item.name);
                            if (realIndex !== -1) handleEditPr(realIndex, e);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-white/10 text-white hover:border-primary/40 text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Edit PR"
                        >
                          <span className="material-symbols-outlined text-[13px] text-primary">edit</span>
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const realIndex = prRecords.findIndex(p => p.name === item.name);
                            if (realIndex !== -1) handleDeletePr(realIndex, e);
                          }}
                          className="w-7 h-7 rounded-lg bg-error/10 text-error hover:bg-error/20 flex items-center justify-center transition-all"
                          title="Delete PR"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-surface-card p-2.5 rounded-xl border border-white/[0.04]">
                      <span className="text-[9px] font-bold text-outline uppercase block mb-1.5">Previous Session Sets:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.history.map((s, idx) => (
                          <span key={idx} className={`px-2.5 py-1 rounded-lg bg-surface-elevated text-xs font-semibold ${s.includes('PR') ? 'text-primary border border-primary/30' : 'text-on-surface'}`}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/[0.06] bg-surface-card">
              <button 
                onClick={handleOpenAddPr} 
                className="w-full py-3 rounded-full bg-primary text-black font-bold text-xs amber-glow active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>+ Record New Personal Record (1RM)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PERSONAL RECORD (1RM) MODAL */}
      {isAddPrModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-surface-card rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                  {editingPrIndex !== null ? "UPDATE 1RM BENCHMARK" : "RECORD 1RM MILESTONE"}
                </span>
                <h2 className="text-lg font-bold text-white">
                  {editingPrIndex !== null ? `Edit ${prRecords[editingPrIndex]?.name || 'Record'}` : "Log Personal Record"}
                </h2>
              </div>
              <button onClick={() => { setIsAddPrModalOpen(false); setEditingPrIndex(null); }} className="w-8 h-8 rounded-full bg-surface-elevated text-outline hover:text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePr} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-outline uppercase block mb-1">Exercise Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Incline Dumbbell Press"
                  value={newPrForm.name}
                  onChange={(e) => setNewPrForm({ ...newPrForm, name: e.target.value })}
                  className="w-full bg-surface-container-low text-xs text-white placeholder:text-outline/50 rounded-xl border border-white/10 p-3 focus:border-primary focus:ring-0"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block mb-1">Category / Muscle</label>
                  <select 
                    value={newPrForm.category}
                    onChange={(e) => setNewPrForm({ ...newPrForm, category: e.target.value })}
                    className="w-full bg-surface-container-low text-xs text-white rounded-xl border border-white/10 p-3 focus:border-primary focus:ring-0"
                  >
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Legs">Legs</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Arms">Arms</option>
                    <option value="Core">Core</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block mb-1">Equipment</label>
                  <select 
                    value={newPrForm.equipment}
                    onChange={(e) => setNewPrForm({ ...newPrForm, equipment: e.target.value })}
                    className="w-full bg-surface-container-low text-xs text-white rounded-xl border border-white/10 p-3 focus:border-primary focus:ring-0"
                  >
                    <option value="Barbell">Barbell</option>
                    <option value="Dumbbell">Dumbbell</option>
                    <option value="Machine">Machine</option>
                    <option value="Cable">Cable</option>
                    <option value="Bodyweight">Bodyweight</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block mb-1">Top Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    placeholder="e.g. 100"
                    value={newPrForm.weight}
                    onChange={(e) => setNewPrForm({ ...newPrForm, weight: e.target.value })}
                    className="w-full bg-surface-container-low text-xs text-white placeholder:text-outline/50 rounded-xl border border-white/10 p-3 focus:border-primary focus:ring-0"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block mb-1">Reps Performed</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1 (1RM)"
                    value={newPrForm.reps}
                    onChange={(e) => setNewPrForm({ ...newPrForm, reps: e.target.value })}
                    className="w-full bg-surface-container-low text-xs text-white placeholder:text-outline/50 rounded-xl border border-white/10 p-3 focus:border-primary focus:ring-0"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-primary text-black font-bold text-xs amber-glow active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {editingPrIndex !== null ? "check_circle" : "workspace_premium"}
                  </span>
                  <span>{editingPrIndex !== null ? "Save Changes to Record" : "Save Personal Record (1RM)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION DOCK */}
      <nav aria-label="Primary Navigation" className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2 pb-safe max-w-md mx-auto pointer-events-none">
        <div className="w-full bg-surface-container-high/90 dark:bg-surface-container-high/90 backdrop-blur-xl rounded-full micro-border shadow-[0px_12px_32px_rgba(255,154,46,0.15)] flex justify-around items-center px-3 py-1.5 pointer-events-auto border border-white/[0.06]">
          <Link aria-label="Home" href="/dashboard" className="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]">home</span>
          </Link>
          <Link aria-label="Workouts" href="/dashboard/workouts" className="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]">fitness_center</span>
          </Link>
          <Link aria-label="Check-in" href="/dashboard/checkin" className="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]">qr_code_scanner</span>
          </Link>
          <Link aria-current="page" aria-label="Progress" href="/dashboard/progress" className="flex flex-col items-center justify-center text-on-surface dark:text-on-surface p-2 after:content-[''] after:w-1.5 after:h-1.5 after:bg-primary-container after:rounded-full after:mt-1 active:scale-90 transition-transform duration-200">
            <span className="material-symbols-outlined text-[23px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
          </Link>
          <Link aria-label="Profile" href="/dashboard/profile" className="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]">person</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
