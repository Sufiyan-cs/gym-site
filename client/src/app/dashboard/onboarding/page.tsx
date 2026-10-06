"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SelfieModal from '@/components/SelfieModal';

export default function OnboardingPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    avatarUrl: '',
    gender: '',
    age: 18,
    height: 170,
    currentWeight: 70.0,
    targetWeight: 70.0,
    bloodGroup: '',
    trainingBackground: '',
    primaryFocus: '',
    customWeeklySplit: {
      Mon: 'Rest Day',
      Tue: 'Rest Day',
      Wed: 'Rest Day',
      Thu: 'Rest Day',
      Fri: 'Rest Day',
      Sat: 'Rest Day',
      Sun: 'Rest Day'
    },
    preferredSlot: '',
    injuries: '',
    cardioClearance: false,
    doctorClearance: false,
    diet: '',
    calories: 2000,
    protein: 100,
  });

  const [activeDayKey, setActiveDayKey] = useState<'Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun'>('Mon');

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateSplit = (day: string, focus: string) => {
    setFormData(prev => ({
      ...prev,
      customWeeklySplit: {
        ...prev.customWeeklySplit,
        [day]: focus
      }
    }));
  };

  const applySplitTemplate = (templateKey: string) => {
    const TEMPLATES: any = {
      custom: { Mon: 'Back Day', Tue: 'Chest Day', Wed: 'Leg Day', Thu: 'Shoulders', Fri: 'Arms & Biceps', Sat: 'Full Body', Sun: 'Rest Day' },
      ppl: { Mon: 'Push Day', Tue: 'Pull Day', Wed: 'Leg Day', Thu: 'Push Day', Fri: 'Pull Day', Sat: 'Leg Day', Sun: 'Rest Day' },
      arnold: { Mon: 'Chest & Back', Tue: 'Shoulders & Arms', Wed: 'Legs', Thu: 'Chest & Back', Fri: 'Shoulders & Arms', Sat: 'Legs', Sun: 'Rest Day' },
      upperlower: { Mon: 'Upper Body', Tue: 'Lower Body', Wed: 'Rest Day', Thu: 'Upper Body', Fri: 'Lower Body', Sat: 'Active Recovery', Sun: 'Rest Day' }
    };
    if (TEMPLATES[templateKey]) {
      updateFormData('customWeeklySplit', TEMPLATES[templateKey]);
    }
  };

  const WEEKDAYS = [
    { key: 'Mon', label: 'Monday', short: 'M' },
    { key: 'Tue', label: 'Tuesday', short: 'T' },
    { key: 'Wed', label: 'Wednesday', short: 'W' },
    { key: 'Thu', label: 'Thursday', short: 'T' },
    { key: 'Fri', label: 'Friday', short: 'F' },
    { key: 'Sat', label: 'Saturday', short: 'S' },
    { key: 'Sun', label: 'Sunday', short: 'S' }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitForm();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        weight: formData.currentWeight.toString(),
        height: formData.height.toString(),
        goal: formData.primaryFocus || 'Fitness',
        targetWeight: formData.targetWeight.toString(),
        preferredSlot: formData.preferredSlot,
        customSplit: formData.customWeeklySplit,
        avatarUrl: formData.avatarUrl,
      };
      
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to submit onboarding:', errorData);
        alert('Failed to submit onboarding. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error. Please try again.');
    }
    setIsSubmitting(false);
  };

  const trainingDaysCount = Object.values(formData.customWeeklySplit).filter(f => !f.toLowerCase().includes('rest') && !f.toLowerCase().includes('recovery')).length;

  const currentFocus = formData.customWeeklySplit[activeDayKey as keyof typeof formData.customWeeklySplit];
  const activeDayObj = WEEKDAYS.find(w => w.key === activeDayKey);

  const stepTitles = [
    "Complete Athlete Profile",
    "Training Background",
    "Primary Athletic Focus",
    "Split & Weekly Rhythm",
    "Floor Access Window",
    "PAR-Q & Clearance",
    "Nutrition Blueprint",
    "Amenities & Mentorship"
  ];

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body-md min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container dark">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-36">
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-margin py-3">
          <div className="flex items-center justify-between">
            <button onClick={handleBack} aria-label="Go Back" className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors active:scale-95 border border-white/5" type="button">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_rgba(255,154,46,0.6)]"></span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">AM-Tippu</span>
              <span className="text-[9px] font-label-caps uppercase px-1.5 py-0.5 rounded bg-surface-container-high text-outline tracking-wider border border-white/5">Athletics</span>
            </div>
            <button aria-label="Support Desk" className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors active:scale-95 border border-white/5" type="button">
              <span className="material-symbols-outlined text-base">help_outline</span>
            </button>
          </div>
          
          <div className="mt-3 pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-label-caps font-label-caps text-outline uppercase tracking-wider">Step {currentStep} of {totalSteps} • {stepTitles[currentStep - 1]}</span>
              <span className="text-label-caps font-label-caps text-primary-container font-semibold">{Math.round((currentStep / totalSteps) * 100)}% Completed</span>
            </div>
            <div className="grid grid-cols-8 gap-1 w-full">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-1 rounded-full ${i < currentStep ? 'bg-primary-container shadow-[0_0_10px_rgba(255,154,46,0.4)]' : 'bg-surface-container-high'}`}></div>
              ))}
            </div>
          </div>
        </header>

        <main className="px-margin pt-4 space-y-7">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container border border-primary-container/20 text-primary text-[10px] font-label-caps">
              <span className="material-symbols-outlined text-xs text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span>Serenity Elite Protocol</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Assessment &amp; Protocol Blueprint
            </h1>
            <p className="font-body-md text-body-md text-outline leading-relaxed">
              Personalize your training split, biometric milestones, and access credentials.
            </p>
          </div>

          {currentStep === 1 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary-container text-label-caps font-bold flex items-center justify-center text-[10px]">01</span>
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Biometrics &amp; Core Identity</h2>
                </div>
                <span className="text-label-caps font-label-caps text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
                  Live Bio-Sync
                </span>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5 space-y-4">
                {/* ATHLETE PHOTO & LIVE SELFIE SELECTION */}
                <div className="bg-surface-container rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => setIsSelfieModalOpen(true)}
                      className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-primary to-surface-card shadow-[0_0_16px_rgba(255,154,46,0.3)] cursor-pointer hover:scale-105 transition-transform shrink-0"
                    >
                      {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} alt="Athlete Selfie" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center text-outline">
                          <span className="material-symbols-outlined text-[24px] text-primary">add_a_photo</span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-[12px]">camera_alt</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white">Athlete Photo / Selfie</h4>
                      <p className="text-[10px] text-outline mt-0.5">
                        {formData.avatarUrl ? "✓ Photo set! Tap to change" : "Take live selfie or upload photo"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSelfieModalOpen(true)}
                    className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary hover:text-black transition-all shrink-0 active:scale-95"
                  >
                    {formData.avatarUrl ? "Change" : "+ Add"}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-label-caps font-label-caps text-outline uppercase tracking-wider block">Biological Profile</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Non-binary'].map((g, idx) => {
                      const isActive = formData.gender === g;
                      const icons = ['male', 'female', 'transgender'];
                      return (
                        <button key={g} onClick={() => updateFormData('gender', g)} className={`py-2.5 px-3 rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-1.5 transition-colors ${isActive ? 'bg-surface-container text-on-surface border border-primary-container/40 shadow-[0px_4px_16px_rgba(255,154,46,0.12)]' : 'bg-surface-container-lowest text-outline border border-transparent hover:text-on-surface'}`} type="button">
                          <span className={`material-symbols-outlined text-sm ${isActive ? 'text-primary-container' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{icons[idx]}</span>
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                    <span className="text-label-caps font-label-caps text-outline uppercase">Chronological Age</span>
                    <div className="flex items-baseline gap-1 my-1">
                      <span className="font-display-metric text-display-metric font-bold text-on-surface tracking-tight">{formData.age}</span>
                      <span className="text-body-md text-outline">yrs</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <button onClick={() => updateFormData('age', Math.max(18, formData.age - 1))} className="w-7 h-7 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-bright active:scale-95 transition-all" type="button">
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="text-[11px] text-outline font-mono">18-65</span>
                      <button onClick={() => updateFormData('age', Math.min(65, formData.age + 1))} className="w-7 h-7 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-bright active:scale-95 transition-all" type="button">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface-container p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                    <span className="text-label-caps font-label-caps text-outline uppercase">Stature / Height</span>
                    <div className="flex items-baseline gap-1 my-1">
                      <span className="font-display-metric text-display-metric font-bold text-on-surface tracking-tight">{formData.height}</span>
                      <span className="text-body-md text-outline">cm</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <button onClick={() => updateFormData('height', Math.max(100, formData.height - 1))} className="w-7 h-7 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-bright active:scale-95 transition-all" type="button">
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="text-[11px] text-outline font-mono">{(formData.height / 30.48).toFixed(1)} ft</span>
                      <button onClick={() => updateFormData('height', Math.min(250, formData.height + 1))} className="w-7 h-7 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-bright active:scale-95 transition-all" type="button">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container p-3.5 rounded-xl border border-white/5 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-label-caps font-label-caps text-outline uppercase block">Current Weight</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-display-metric text-display-metric font-bold text-on-surface">{formData.currentWeight.toFixed(1)}</span>
                        <span className="text-body-md text-outline font-medium">kg</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => updateFormData('currentWeight', formData.currentWeight - 0.5)} className="w-6 h-6 rounded bg-surface-container-high flex items-center justify-center"><span className="material-symbols-outlined text-xs">remove</span></button>
                        <button onClick={() => updateFormData('currentWeight', formData.currentWeight + 0.5)} className="w-6 h-6 rounded bg-surface-container-high flex items-center justify-center"><span className="material-symbols-outlined text-xs">add</span></button>
                      </div>
                    </div>
                    <div>
                      <span className="text-label-caps font-label-caps text-primary uppercase block">Target Goal Weight</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-display-metric text-display-metric font-bold text-primary-container">{formData.targetWeight.toFixed(1)}</span>
                        <span className="text-body-md text-primary font-medium">kg</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => updateFormData('targetWeight', formData.targetWeight - 0.5)} className="w-6 h-6 rounded bg-surface-container-high text-primary-container flex items-center justify-center"><span className="material-symbols-outlined text-xs">remove</span></button>
                        <button onClick={() => updateFormData('targetWeight', formData.targetWeight + 0.5)} className="w-6 h-6 rounded bg-surface-container-high text-primary-container flex items-center justify-center"><span className="material-symbols-outlined text-xs">add</span></button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    <div className="flex items-center justify-between text-label-caps font-label-caps">
                      <span className="text-outline">{formData.targetWeight >= formData.currentWeight ? '+' : ''}{(formData.targetWeight - formData.currentWeight).toFixed(1)} kg Lean Mass Protocol</span>
                      <span className="text-secondary font-semibold">Healthy Range</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden flex">
                      <div className="w-[72%] bg-outline-variant h-full"></div>
                      <div className="w-[28%] bg-primary-container h-full rounded-r-full shadow-[0_0_8px_rgba(255,154,46,0.6)]"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-label-caps font-label-caps text-outline uppercase tracking-wider block">Clinical Blood Group</label>
                  <div className="flex items-center justify-between gap-1.5">
                    {['A+', 'B+', 'O+', 'AB+', 'O-'].map(bg => {
                      const isActive = formData.bloodGroup === bg;
                      return (
                        <button key={bg} onClick={() => updateFormData('bloodGroup', bg)} className={`flex-1 py-2 rounded-lg text-label-md font-label-md border transition-colors ${isActive ? 'bg-surface-container text-primary-container border-primary-container/40 shadow-[0_2px_8px_rgba(255,154,46,0.15)] font-bold' : 'bg-surface-container-lowest text-outline border-transparent hover:text-on-surface'}`} type="button">{bg}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary-container text-label-caps font-bold flex items-center justify-center text-[10px]">02</span>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Training Background</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'Beginner', icon: 'spa', desc: '< 1 yr deliberate training' },
                  { id: 'Intermediate', icon: 'fitness_center', desc: '1-3 yrs structured lifting' },
                  { id: 'Advanced', icon: 'bolt', desc: '3-5+ yrs progressive overload' },
                  { id: 'Competitive', icon: 'military_tech', desc: 'Stage / Meet / Hyrox Pro' }
                ].map(bg => {
                  const isActive = formData.trainingBackground === bg.id;
                  return (
                    <button key={bg.id} onClick={() => updateFormData('trainingBackground', bg.id)} className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] ${isActive ? 'bg-surface-container border-primary-container shadow-[0px_8px_24px_rgba(255,154,46,0.14)]' : 'bg-surface-container-low border-white/5 hover:bg-surface-container'}`} type="button">
                      {isActive ? (
                        <div className="flex items-center justify-between w-full mb-3">
                          <span className="material-symbols-outlined text-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{bg.icon}</span>
                          <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                        </div>
                      ) : (
                        <span className="material-symbols-outlined text-outline text-xl mb-3">{bg.icon}</span>
                      )}
                      <div>
                        <div className={`font-label-lg text-label-lg ${isActive ? 'font-bold text-on-surface' : 'font-semibold text-on-surface'}`}>{bg.id}</div>
                        <div className={`text-label-caps font-label-caps mt-0.5 ${isActive ? 'text-primary' : 'text-outline'}`}>{bg.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary-container text-label-caps font-bold flex items-center justify-center text-[10px]">03</span>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Primary Athletic Focus</h2>
              </div>
              <div className="space-y-2.5">
                {[
                  { id: 'Clean Hypertrophy', icon: 'check_circle', tag: '', desc: 'Targeting +3 to 4 kg lean skeletal muscle mass with calculated caloric surplus and myofibrillar stimulus.' },
                  { id: 'Max Strength & Powerlifting PRs', icon: 'hardware', tag: 'RPE 8-10', desc: 'CNS-focused periodization maximizing 1RM in Deadlift, Low-bar Squat, and Bench Press.' },
                  { id: 'Aggressive Fat Loss & Definition', icon: 'local_fire_department', tag: 'Sub-10%', desc: 'Preserve nitrogen balance while sustaining aggressive deficit and lactate-threshold circuits.' },
                  { id: 'Hyrox & Functional Conditioning', icon: 'sprint', tag: 'Aerobic Zone 2/4', desc: 'SkiErg, Sled Push, Wall Balls, and lactate buffering for official competition readiness.' }
                ].map(focus => {
                  const isActive = formData.primaryFocus === focus.id;
                  return (
                    <div key={focus.id} onClick={() => updateFormData('primaryFocus', focus.id)} className={`p-4 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer ${isActive ? 'bg-surface-container border-primary-container shadow-[0px_10px_28px_rgba(255,154,46,0.18)] relative' : 'bg-surface-container-low border-white/5 hover:bg-surface-container'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isActive ? 'bg-primary-container/20 text-primary-container' : 'bg-surface-container-high text-outline'}`}>
                        <span className="material-symbols-outlined text-lg" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{isActive ? 'check_circle' : focus.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-headline-sm ${isActive ? 'text-[16px] font-bold' : 'text-[15px] font-semibold'} text-on-surface`}>{focus.id}</h3>
                          {isActive ? (
                            <span className="text-label-caps font-label-caps px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-extrabold uppercase">Selected</span>
                          ) : (
                            <span className="text-label-caps font-label-caps text-outline">{focus.tag}</span>
                          )}
                        </div>
                        <p className={`text-body-md mt-0.5 ${isActive ? 'font-body-md text-on-surface-variant text-[13px] leading-snug' : 'text-outline text-[12px]'}`}>
                          {focus.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {currentStep === 4 && (
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary-container text-label-caps font-bold flex items-center justify-center text-[10px]">04</span>
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Split &amp; Weekly Rhythm</h2>
                </div>
                <span className="text-label-caps font-label-caps text-primary uppercase font-bold text-[10px]">Custom Weekday Split</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'custom', name: 'Custom Split', desc: 'Your exact daily focus', tag: '' },
                  { key: 'ppl', name: 'Push / Pull / Legs', desc: 'PPL Hypertrophy', tag: '6 Days' },
                  { key: 'arnold', name: 'Arnold Split', desc: 'Chest/Back, Arms, Legs', tag: '6 Days' },
                  { key: 'upperlower', name: 'Upper / Lower', desc: 'Power & Recovery', tag: '4 Days' }
                ].map(t => (
                  <button key={t.key} onClick={() => applySplitTemplate(t.key)} className="p-3 rounded-xl bg-surface-container-low border border-white/5 hover:border-white/20 text-left transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-on-surface">{t.name}</span>
                      {t.tag && <span className="text-[10px] text-outline">{t.tag}</span>}
                    </div>
                    <p className="text-[10px] text-outline">{t.desc}</p>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Interactive Weekday Split Builder</span>
                    <span className="text-[10px] text-outline">Tap a day (M, T, W...) then assign your focus</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold">Live Synced</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {WEEKDAYS.map(w => {
                    const isActive = activeDayKey === w.key;
                    return (
                      <button key={w.key} onClick={() => setActiveDayKey(w.key as any)} className={`py-2.5 rounded-xl text-center transition-all ${isActive ? 'bg-primary-container text-black font-extrabold shadow-[0px_2px_10px_rgba(255,154,46,0.25)] ring-2 ring-primary-container' : 'bg-surface-container text-outline hover:text-white border border-white/5'}`}>
                        <span className={`text-xs block ${!isActive ? 'font-bold' : ''}`}>{w.short}</span>
                        <span className={`text-[8px] uppercase tracking-tighter block ${isActive ? 'opacity-80' : ''}`}>{w.key}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container border border-primary-container/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary-container text-base">calendar_month</span>
                      <span className="text-xs font-bold text-white">Configuring: <span className="text-primary-container">{activeDayObj?.label}</span></span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-primary-container/20 text-primary-container text-[11px] font-bold">{currentFocus || 'Rest Day'}</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-outline uppercase tracking-wider font-semibold block">Quick Focus Presets (Tap to Assign):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Back Day', 'Chest Day', 'Leg Day', 'Shoulders', 'Arms & Biceps', 'Push Day', 'Pull Day', 'Full Body', 'Rest Day'].map(focus => {
                        const isActive = currentFocus === focus;
                        return (
                          <button key={focus} onClick={() => updateSplit(activeDayKey, focus)} className={`px-2.5 py-1 rounded-lg text-xs transition-all ${isActive ? 'bg-primary-container text-black font-bold' : focus === 'Rest Day' ? 'font-medium bg-surface-container-high text-secondary border border-secondary/20' : 'font-medium bg-surface-container-high text-on-surface hover:text-white border border-white/5'}`}>
                            {focus}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] text-outline font-semibold block">Or Type Custom Focus for this Day:</label>
                    <div className="relative">
                      <input type="text" value={currentFocus} onChange={(e) => updateSplit(activeDayKey, e.target.value)} placeholder="e.g. Back Day & Deadlifts, Chest & Abs..." className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-white/10 text-xs text-white placeholder-outline/50 focus:border-primary-container focus:ring-0" />
                      <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-sm pointer-events-none">edit</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Your Weekly 7-Day Schedule:</span>
                    <span className="text-[10px] text-primary">{trainingDaysCount} Training Days • {7 - trainingDaysCount} Rest</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {WEEKDAYS.map(w => {
                      const focus = formData.customWeeklySplit[w.key as keyof typeof formData.customWeeklySplit];
                      const isCurrent = w.key === activeDayKey;
                      const isRest = focus.toLowerCase().includes('rest') || focus.toLowerCase().includes('recovery');
                      return (
                        <div key={w.key} onClick={() => setActiveDayKey(w.key as any)} className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer hover:border-white/20 transition-all ${isCurrent ? 'bg-primary-container/10 border-primary-container/50' : 'bg-surface-container-lowest border-white/5'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${isCurrent ? 'bg-primary-container text-black font-extrabold' : 'bg-surface-container text-outline'}`}>{w.short}</span>
                            <div>
                              <span className="text-[11px] font-bold text-white block truncate max-w-[105px]">{focus}</span>
                              <span className="text-[9px] text-outline">{w.label}</span>
                            </div>
                          </div>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isRest ? 'bg-outline/40' : 'bg-primary-container'}`}></span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {currentStep === 5 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary-container text-label-caps font-bold flex items-center justify-center text-[10px]">05</span>
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Floor Access Window</h2>
                </div>
                <span className="text-label-caps font-label-caps text-secondary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                  Sensors Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { time: '06:00 AM', tag: '18% Capacity', tagClass: 'bg-secondary/10 text-secondary', desc: 'Dawn Crew • Minimal Traffic' },
                  { time: '07:00 AM', tag: 'Primary', tagClass: 'bg-primary-container/20 text-primary-container', desc: 'Morning Peak • Full Energy' },
                  { time: '06:00 PM', tag: '82% Peak', tagClass: 'bg-error/15 text-error', desc: 'Evening Rush • High Intensity' },
                  { time: '08:00 PM', tag: '34% Capacity', tagClass: 'bg-secondary/10 text-secondary', desc: 'Night Vault • Ambient Flow' }
                ].map(slot => {
                  const isActive = formData.preferredSlot === slot.time;
                  return (
                    <button key={slot.time} onClick={() => updateFormData('preferredSlot', slot.time)} className={`p-3 rounded-xl border text-left transition-colors ${isActive ? 'bg-surface-container border-primary-container shadow-[0px_4px_16px_rgba(255,154,46,0.15)]' : 'bg-surface-container-low border-white/5 hover:bg-surface-container'}`} type="button">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-label-lg text-label-lg font-semibold ${isActive ? 'text-primary-container font-bold' : 'text-on-surface'}`}>{slot.time}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-label-caps ${slot.tagClass}`}>{slot.tag}</span>
                      </div>
                      <span className={`text-label-caps font-label-caps block ${isActive ? 'text-on-surface' : 'text-outline'}`}>{slot.desc}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {currentStep === 6 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary-container text-label-caps font-bold flex items-center justify-center text-[10px]">06</span>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">PAR-Q &amp; Medical Clearance</h2>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-label-caps font-label-caps text-outline uppercase tracking-wider block" htmlFor="injuries">
                    Joint, Spinal or Muscular Restrictions
                  </label>
                  <div className="relative">
                    <input className="w-full bg-surface-container text-on-surface text-body-md rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container font-body-md" id="injuries" type="text" value={formData.injuries} onChange={(e) => updateFormData('injuries', e.target.value)} placeholder="None" />
                    <span className="material-symbols-outlined text-outline absolute right-3 top-2.5 text-base">edit_note</span>
                  </div>
                  <span className="text-[11px] text-outline-variant">Coach Tippu will automatically adjust pressing angles in your template.</span>
                </div>
                
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="pr-3">
                    <div className="font-label-lg text-label-lg font-semibold text-on-surface">Cardiovascular Clearance</div>
                    <div className="text-[11px] text-secondary font-medium">Cleared for high-intensity training (Zone 4/5)</div>
                  </div>
                  <button onClick={() => updateFormData('cardioClearance', !formData.cardioClearance)} aria-checked={formData.cardioClearance} className={`w-12 h-6 rounded-full p-0.5 transition-colors relative flex items-center ${formData.cardioClearance ? 'bg-secondary-container justify-end' : 'bg-surface-container-high justify-start'}`} role="switch" type="button">
                    <span className="w-5 h-5 rounded-full bg-on-background shadow-md"></span>
                  </button>
                </div>
                
                <div className="pt-3 border-t border-white/5 flex items-start gap-2.5">
                  <input checked={formData.doctorClearance} onChange={(e) => updateFormData('doctorClearance', e.target.checked)} className="mt-0.5 rounded bg-surface-container border-white/20 text-primary-container focus:ring-primary-container" id="liability" type="checkbox"/>
                  <label className="text-[11px] text-outline leading-tight select-none" htmlFor="liability">
                    I certify that I have had medical clearance or accept full personal liability for vigorous athletic loading within AM-Tippu athletic facilities.
                  </label>
                </div>
              </div>
            </section>
          )}

          {currentStep === 7 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary-container text-label-caps font-bold flex items-center justify-center text-[10px]">07</span>
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Nutrition Blueprint</h2>
                </div>
                <span className="text-label-caps font-label-caps text-primary uppercase">Macros Engine</span>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4 border border-white/5 space-y-4">
                <div className="space-y-2">
                  <span className="text-label-caps font-label-caps text-outline uppercase tracking-wider block">Nutritional Philosophy</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['High Protein Non-Veg', 'High Protein Veg', 'Strict Vegan / Plant', 'Ketogenic / Low-Carb'].map(d => {
                      const isActive = formData.diet === d;
                      return (
                        <button key={d} onClick={() => updateFormData('diet', d)} className={`py-2.5 px-3 rounded-xl font-label-lg text-label-lg border flex items-center justify-between ${isActive ? 'bg-surface-container text-on-surface border-primary-container/40' : 'bg-surface-container-lowest text-outline border-transparent hover:text-on-surface text-left'}`} type="button">
                          <span>{d}</span>
                          {isActive && <span className="material-symbols-outlined text-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
                  <div className="bg-surface-container p-3 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between text-label-caps font-label-caps text-outline uppercase">
                      <span>Energy Ceiling</span>
                      <span className="material-symbols-outlined text-primary text-xs">local_fire_department</span>
                    </div>
                    <div className="my-1.5">
                      <span className="font-display-metric text-display-metric font-bold text-on-surface">{formData.calories}</span>
                      <span className="text-label-caps text-outline block">kcal / daily</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <button onClick={() => updateFormData('calories', Math.max(1000, formData.calories - 50))} aria-label="Decrease calories" className="w-6 h-6 rounded bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-bright" type="button">
                        <span className="material-symbols-outlined text-xs">remove</span>
                      </button>
                      <span className="text-[10px] text-primary font-mono">+300 surplus</span>
                      <button onClick={() => updateFormData('calories', formData.calories + 50)} aria-label="Increase calories" className="w-6 h-6 rounded bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-bright" type="button">
                        <span className="material-symbols-outlined text-xs">add</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface-container p-3 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between text-label-caps font-label-caps text-outline uppercase">
                      <span>Anabolic Floor</span>
                      <span className="material-symbols-outlined text-secondary text-xs">egg_alt</span>
                    </div>
                    <div className="my-1.5">
                      <span className="font-display-metric text-display-metric font-bold text-secondary">{formData.protein}</span>
                      <span className="text-label-caps text-outline block">grams / daily</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <button onClick={() => updateFormData('protein', Math.max(50, formData.protein - 5))} aria-label="Decrease protein" className="w-6 h-6 rounded bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-bright" type="button">
                        <span className="material-symbols-outlined text-xs">remove</span>
                      </button>
                      <span className="text-[10px] text-outline font-mono">2.2g / kg</span>
                      <button onClick={() => updateFormData('protein', formData.protein + 5)} aria-label="Increase protein" className="w-6 h-6 rounded bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-bright" type="button">
                        <span className="material-symbols-outlined text-xs">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

        </main>

        <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-dim/95 backdrop-blur-xl border-t border-white/5 py-3 px-margin">
          <div className="max-w-md mx-auto space-y-2">
            <button onClick={handleNext} disabled={isSubmitting} className="w-full py-4 px-6 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-[0px_12px_32px_rgba(255,154,46,0.3)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50" type="button">
              <span>{currentStep < totalSteps ? 'Next Step' : (isSubmitting ? 'Activating...' : 'Save & Activate Turnstile Pass')}</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-outline">
              <span className="material-symbols-outlined text-xs text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <span>Generates dynamic 256-bit optical gate QR • AM-Tippu Athletics Vault</span>
            </div>
          </div>
        </div>

        <SelfieModal
          isOpen={isSelfieModalOpen}
          onClose={() => setIsSelfieModalOpen(false)}
          onPhotoSelected={(url) => updateFormData('avatarUrl', url)}
          currentAvatar={formData.avatarUrl}
        />
      </div>
    </div>
  );
}
