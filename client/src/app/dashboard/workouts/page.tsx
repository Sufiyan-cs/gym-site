"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  target: string;
  secondary_muscles: string;
  equipment: string;
  steps: string[];
  img: string;
  gif: string;
  targetSets?: number;
  targetReps?: string;
}

export default function WorkoutsPage() {
  const { token } = useAuth();
  const router = useRouter();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');
  
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGifPlaying, setIsGifPlaying] = useState(true);
  
  // Sets and Reps Configurator State
  const [configSets, setConfigSets] = useState<number>(4);
  const [configReps, setConfigReps] = useState<string>("10-12");
  
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const [activeTab, setActiveTab] = useState('library');
  const [todaysQueue, setTodaysQueue] = useState<Exercise[]>([]);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const q = localStorage.getItem('todaysQueue');
    if (q) setTodaysQueue(JSON.parse(q));
  }, []);
  
  const addToQueueWithConfig = (ex: Exercise, sets: number, reps: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const existingIndex = todaysQueue.findIndex(item => item.name.toLowerCase() === ex.name.toLowerCase());
    let q: Exercise[];
    if (existingIndex !== -1) {
      q = [...todaysQueue];
      q[existingIndex] = { ...q[existingIndex], targetSets: sets, targetReps: reps };
      showQuickToast(`Updated ${ex.name} (${sets} sets × ${reps})`);
    } else {
      const itemWithConfig: Exercise = {
        ...ex,
        targetSets: sets,
        targetReps: reps,
      };
      q = [...todaysQueue, itemWithConfig];
      showQuickToast(`Added ${ex.name} (${sets} sets × ${reps})`);
    }
    setTodaysQueue(q);
    localStorage.setItem('todaysQueue', JSON.stringify(q));
    window.dispatchEvent(new Event('queueUpdated'));
  };

  const updateQueueItemSets = (idx: number, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const q = [...todaysQueue];
    const currentSets = q[idx].targetSets || 4;
    const newSets = Math.max(1, Math.min(12, currentSets + delta));
    q[idx] = { ...q[idx], targetSets: newSets };
    setTodaysQueue(q);
    localStorage.setItem('todaysQueue', JSON.stringify(q));
    window.dispatchEvent(new Event('queueUpdated'));
  };

  const updateQueueItemReps = (idx: number, newReps: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const q = [...todaysQueue];
    q[idx] = { ...q[idx], targetReps: newReps };
    setTodaysQueue(q);
    localStorage.setItem('todaysQueue', JSON.stringify(q));
    window.dispatchEvent(new Event('queueUpdated'));
  };

  const removeFromQueue = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const removedName = todaysQueue[idx]?.name;
    const q = todaysQueue.filter((_, i) => i !== idx);
    setTodaysQueue(q);
    localStorage.setItem('todaysQueue', JSON.stringify(q));
    window.dispatchEvent(new Event('queueUpdated'));
    showQuickToast(`Removed ${removedName || 'exercise'} from queue`);
  };


  useEffect(() => {
    if (!token) return;
    const fetchExercises = async () => {
      try {
        const res = await fetch('/api/workouts/library', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setExercises(data);
          setFilteredExercises(data);
        }
      } catch (error) {
        console.error('Failed to fetch exercises', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExercises();
  }, [token]);

  useEffect(() => {
    let filtered = exercises;
    if (currentCategory !== 'all') {
      filtered = filtered.filter(x => 
        (x.muscle_group || '').toLowerCase() === currentCategory.toLowerCase()
      );
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(x => 
        (x.name || '').toLowerCase().includes(q) || 
        (x.target || '').toLowerCase().includes(q) || 
        (x.equipment || '').toLowerCase().includes(q)
      );
    }
    setFilteredExercises(filtered);
  }, [searchQuery, currentCategory, exercises]);

  const showQuickToast = (text: string) => {
    setToastMessage(text);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 2400);
  };

  const openExerciseDetail = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    const existing = todaysQueue.find(item => item.name.toLowerCase() === exercise.name.toLowerCase());
    if (existing) {
      setConfigSets(existing.targetSets || 4);
      setConfigReps(existing.targetReps || "10-12");
    } else {
      setConfigSets(exercise.targetSets || 4);
      setConfigReps(exercise.targetReps || "10-12");
    }
    setIsGifPlaying(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedExercise(null), 300); // clear after animation
  };

  const spotlightExercise = exercises.length > 0 ? exercises[0] : null;

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
              <h1 className="text-base font-bold text-white tracking-tight">Exercise Library</h1>
              <p className="text-[11px] text-primary font-medium tracking-wide">{exercises.length} Exercises • GIF Dataset</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-surface-elevated border border-white/10 text-[10px] font-bold text-secondary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              GIFs ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* MAIN SCROLLABLE CONTAINER */}
      <main className="max-w-md mx-auto pt-20 px-5 space-y-5">
      {activeTab === 'queue' ? (
        <section className="space-y-3 pt-2">
          {mounted && todaysQueue.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">fitness_center</span>
              <h3 className="text-white font-bold">Queue is Empty</h3>
              <p className="text-xs text-outline mt-1">Switch to Library to add exercises for today.</p>
              <button onClick={() => setActiveTab('library')} className="mt-4 px-5 py-2 bg-primary text-black font-bold text-xs rounded-full">Browse Library</button>
            </div>
          ) : (
            mounted && todaysQueue.map((item, idx) => (
              <div key={idx} onClick={() => openExerciseDetail(item)} className="bg-surface-container-low rounded-2xl p-3.5 border border-white/[0.05] flex gap-3.5 hover:border-primary/40 cursor-pointer transition-all active:scale-[0.99] group">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/5 flex items-center justify-center">
                  <img src={`/gif/${item.gif}`} alt={item.name} className="w-full h-full object-contain p-1" loading="lazy" />
                </div>
                <div className="flex-1 py-0.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">{item.target}</span>
                    <h3 className="text-sm font-bold text-white leading-tight mb-1 pr-2 group-hover:text-primary transition-colors">{item.name}</h3>
                  </div>

                  {/* Interactive Sets Stepper & Reps Selector */}
                  <div className="flex items-center gap-2 my-1.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center bg-surface-elevated rounded-lg border border-white/10 px-1 py-0.5 shadow-inner">
                      <button 
                        type="button"
                        onClick={(e) => updateQueueItemSets(idx, -1, e)}
                        className="w-6 h-6 rounded bg-surface-container hover:bg-white/10 text-white font-bold flex items-center justify-center text-xs active:scale-90"
                        title="Decrease sets"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold text-white text-[11px] whitespace-nowrap">{item.targetSets || 4} Sets</span>
                      <button 
                        type="button"
                        onClick={(e) => updateQueueItemSets(idx, 1, e)}
                        className="w-6 h-6 rounded bg-surface-container hover:bg-white/10 text-white font-bold flex items-center justify-center text-xs active:scale-90"
                        title="Increase sets"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center bg-surface-elevated rounded-lg border border-white/10 px-2 py-1 shadow-inner">
                      <span className="text-[10px] font-bold text-primary mr-1">Reps:</span>
                      <select 
                        value={item.targetReps || "10-12"}
                        onChange={(e) => updateQueueItemReps(idx, e.target.value, e as any)}
                        className="bg-transparent text-white text-[11px] font-bold border-0 p-0 focus:ring-0 focus:outline-none cursor-pointer"
                      >
                        <option value="6-8" className="bg-surface-elevated text-white">6-8 Reps</option>
                        <option value="8-10" className="bg-surface-elevated text-white">8-10 Reps</option>
                        <option value="10-12" className="bg-surface-elevated text-white">10-12 Reps</option>
                        <option value="12-15" className="bg-surface-elevated text-white">12-15 Reps</option>
                        <option value="15-20" className="bg-surface-elevated text-white">15-20 Reps</option>
                        <option value="To Failure" className="bg-surface-elevated text-white">To Failure</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded border border-white/10 text-[9px] font-semibold text-outline uppercase">{item.equipment}</span>
                      <span className="text-[9px] text-outline font-medium">• Tap for form guide</span>
                    </div>
                    <button onClick={(e) => removeFromQueue(idx, e)} className="w-7 h-7 rounded-full bg-error/10 text-error hover:bg-error/20 flex items-center justify-center active:scale-90 transition-all" title="Remove from today">
                      <span className="material-symbols-outlined text-[15px]">remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      ) : (
        <>

        {/* SEARCH BAR */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-outline text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Search exercises (e.g. Bench, Squat, Lats)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-card text-sm text-white placeholder:text-outline/60 pl-11 pr-4 py-3 rounded-2xl border border-white/[0.06] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* BODY PART FILTER PILLS */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-outline uppercase">Target Body Part</span>
            <span className="text-[11px] text-outline font-semibold">{filteredExercises.length} movements</span>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-2 py-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'chest', label: 'Chest' },
              { id: 'back', label: 'Back' },
              { id: 'upper legs', label: 'Legs' },
              { id: 'upper arms', label: 'Arms' },
              { id: 'shoulders', label: 'Shoulders' },
              { id: 'waist', label: 'Core / Waist' }
            ].map(cat => (
              <button 
                key={cat.id}
                onClick={() => setCurrentCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  currentCategory === cat.id 
                    ? 'bg-primary text-black font-bold' 
                    : 'bg-surface-card text-outline hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* EXERCISE CARDS LIST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-base font-bold text-white">Movement Library</h3>
            <span className="text-[11px] text-outline">Tap card to configure sets & reps</span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-outline text-xs">Loading exercises...</div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-8 text-outline text-xs">No exercises found matching criteria.</div>
            ) : (
              filteredExercises.map(item => {
                const queued = todaysQueue.find(q => q.name.toLowerCase() === item.name.toLowerCase());
                return (
                  <article 
                    key={item.id} 
                    onClick={() => openExerciseDetail(item)} 
                    className={`bg-surface-card rounded-2xl p-3.5 border transition-all active:scale-[0.99] group cursor-pointer flex gap-3.5 ${
                      queued ? 'border-primary/40 bg-surface-card/90' : 'border-white/[0.05] hover:border-primary/40'
                    }`}
                  >
                    {/* GIF Preview */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/5 flex items-center justify-center">
                      <img src={`/gif/${item.gif}`} alt={item.name} className="w-full h-full object-contain p-1" loading="lazy" />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[8px] font-bold px-1 rounded text-primary">GIF</span>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors leading-snug">{item.name}</h4>
                          <button 
                            onClick={(e) => {
                              if (queued) {
                                const idx = todaysQueue.findIndex(q => q.name.toLowerCase() === item.name.toLowerCase());
                                if (idx !== -1) removeFromQueue(idx, e);
                              } else {
                                addToQueueWithConfig(item, 4, "10-12", e);
                              }
                            }} 
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                              queued 
                                ? 'bg-primary text-black' 
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-black'
                            }`}
                            title={queued ? "In Queue (Click to remove)" : "Add to Today's Routine (4 Sets × 10-12 Reps)"}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {queued ? "check" : "add_circle"}
                            </span>
                          </button>
                        </div>
                        <p className="text-[11px] text-outline mt-0.5">Target: {item.target}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-surface-elevated text-outline text-[10px] font-medium">{item.equipment}</span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-elevated text-outline text-[10px] font-medium capitalize">{item.muscle_group}</span>
                        {queued ? (
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-extrabold border border-primary/30">
                            {queued.targetSets || 4} Sets × {queued.targetReps || "10-12"} Reps
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold">
                            4 Sets × 10-12 Reps
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
        </>
      )}
      </main>

      {/* EXERCISE DETAIL & FORM MODAL */}
      {isModalOpen && selectedExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-surface-card rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Target: {selectedExercise.target}</span>
                <h2 className="text-lg font-bold text-white">{selectedExercise.name}</h2>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-surface-elevated text-outline hover:text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
              {/* Looping GIF Frame */}
              <div 
                className="w-full h-56 rounded-2xl bg-black/70 border border-white/10 overflow-hidden flex items-center justify-center cursor-pointer relative"
                onClick={() => setIsGifPlaying(!isGifPlaying)}
              >
                <img 
                  src={isGifPlaying ? `/gif/${selectedExercise.gif}` : `/img/${selectedExercise.img}`} 
                  alt="Exercise Demonstration" 
                  className="w-full h-full object-contain p-2"
                />
                {!isGifPlaying && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-4xl opacity-80 drop-shadow-md">play_circle</span>
                  </div>
                )}
                {isGifPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                     <span className="material-symbols-outlined text-white text-4xl opacity-80 drop-shadow-md">pause_circle</span>
                  </div>
                )}
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-surface-elevated border border-white/5 text-xs text-white">Equipment: {selectedExercise.equipment}</span>
                <span className="px-3 py-1 rounded-full bg-surface-elevated border border-white/5 text-xs text-outline">Synergists: {selectedExercise.secondary_muscles}</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                  {configSets} Sets × {configReps}
                </span>
              </div>

              {/* Step by step instructions */}
              <div className="bg-surface-elevated rounded-2xl p-4 border border-white/[0.04]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">fact_check</span>
                  Execution Steps (from Dataset)
                </h3>
                <ol className="space-y-2 text-xs text-outline/90 leading-relaxed list-decimal pl-4">
                  {selectedExercise.steps?.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* SETS & REPS CONFIGURATOR FOR TODAY */}
              <div className="bg-surface-elevated rounded-2xl p-4 border border-white/[0.04] space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">tune</span>
                    Configure Routine for Today
                  </h3>
                  <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                    {configSets} Sets × {configReps}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Sets Stepper */}
                  <div className="bg-surface-card p-3 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold text-outline uppercase block">Sets Count</span>
                    <div className="flex items-center justify-between">
                      <button 
                        type="button"
                        onClick={() => setConfigSets(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-surface-elevated text-white hover:bg-white/10 flex items-center justify-center font-bold text-base active:scale-90"
                      >
                        -
                      </button>
                      <span className="text-sm font-extrabold text-white">{configSets} Sets</span>
                      <button 
                        type="button"
                        onClick={() => setConfigSets(prev => Math.min(12, prev + 1))}
                        className="w-8 h-8 rounded-lg bg-surface-elevated text-white hover:bg-white/10 flex items-center justify-center font-bold text-base active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Target Reps Input */}
                  <div className="bg-surface-card p-3 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold text-outline uppercase block">Target Reps</span>
                    <input 
                      type="text" 
                      value={configReps}
                      onChange={(e) => setConfigReps(e.target.value)}
                      placeholder="e.g. 10-12"
                      className="w-full bg-surface-elevated text-center font-bold text-white text-xs py-2 rounded-lg border border-white/10 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Quick Rep Presets */}
                <div>
                  <span className="text-[9px] font-bold text-outline uppercase block mb-1.5">Quick Presets</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "6-8", desc: "Heavy Strength" },
                      { label: "8-10", desc: "Hypertrophy" },
                      { label: "10-12", desc: "Standard" },
                      { label: "12-15", desc: "Endurance" },
                      { label: "To Failure", desc: "Burnout" }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setConfigReps(p.label)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          configReps === p.label 
                            ? 'bg-primary text-black font-extrabold' 
                            : 'bg-surface-card text-outline hover:text-white border border-white/5'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={(e) => {
                  addToQueueWithConfig(selectedExercise, configSets, configReps, e);
                  closeModal();
                }} 
                className="w-full py-3.5 rounded-full bg-primary text-black font-bold text-sm amber-glow active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>
                  {todaysQueue.some(q => q.name.toLowerCase() === selectedExercise.name.toLowerCase()) 
                    ? `Update Routine (${configSets} Sets × ${configReps})` 
                    : `Add to Today's Queue (${configSets} Sets × ${configReps})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div 
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-surface-elevated border border-primary/40 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 ${
          isToastVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
        <span>{toastMessage}</span>
      </div>

      {/* BOTTOM NAVIGATION DOCK */}
      <nav aria-label="Primary Navigation" className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2 pb-safe max-w-md mx-auto pointer-events-none">
        <div className="w-full bg-surface-container-high/90 dark:bg-surface-container-high/90 backdrop-blur-xl rounded-full micro-border shadow-[0px_12px_32px_rgba(255,154,46,0.15)] flex justify-around items-center px-3 py-1.5 pointer-events-auto border border-white/[0.06]">
          <Link aria-label="Home" href="/dashboard" className="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]">home</span>
          </Link>

          <Link aria-current="page" aria-label="Workouts" href="/dashboard/workouts" className="flex flex-col items-center justify-center text-on-surface dark:text-on-surface p-2 after:content-[''] after:w-1.5 after:h-1.5 after:bg-primary-container after:rounded-full after:mt-1 active:scale-90 transition-transform duration-200">
            <span className="material-symbols-outlined text-[23px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
          </Link>

          <Link aria-label="Check-in" href="/dashboard/checkin" className="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]">qr_code_scanner</span>
          </Link>

          <Link aria-label="Progress" href="/dashboard/progress" className="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]">monitoring</span>
          </Link>

          <Link aria-label="Profile" href="/dashboard/profile" className="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90">
            <span className="material-symbols-outlined text-[23px]">person</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
