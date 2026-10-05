const fs = require('fs');
const path = require('path');

const previewDir = path.join(__dirname, 'temp_preview');

function buildBottomNav(activeTab) {
  const items = [
    { id: 'home', file: 'index.html', icon: 'home', label: 'Home' },
    { id: 'workouts', file: 'workouts.html', icon: 'fitness_center', label: 'Workouts' },
    { id: 'checkin', file: 'checkin.html', icon: 'qr_code_scanner', label: 'Check-in' },
    { id: 'progress', file: 'progress.html', icon: 'monitoring', label: 'Progress' },
    { id: 'profile', file: 'profile.html', icon: 'person', label: 'Profile' }
  ];

  const htmlItems = items.map(item => {
    const isActive = item.id === activeTab;
    if (isActive) {
      return `
        <!-- ${item.label} (Active) -->
        <a aria-current="page" aria-label="${item.label}" href="${item.file}" class="flex flex-col items-center justify-center text-on-surface dark:text-on-surface p-2 after:content-[''] after:w-1.5 after:h-1.5 after:bg-primary-container after:rounded-full after:mt-1 active:scale-90 transition-transform duration-200">
          <span class="material-symbols-outlined text-[23px] text-primary" style="font-variation-settings: 'FILL' 1;">${item.icon}</span>
        </a>`;
    } else {
      return `
        <!-- ${item.label} -->
        <a aria-label="${item.label}" href="${item.file}" class="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90">
          <span class="material-symbols-outlined text-[23px]">${item.icon}</span>
        </a>`;
    }
  }).join('\n');

  return `
<!-- BOTTOM NAVIGATION DOCK (Unified Stitch Component) -->
<nav aria-label="Primary Navigation" class="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2 pb-safe max-w-md mx-auto pointer-events-none">
  <div class="w-full bg-surface-container-high/90 dark:bg-surface-container-high/90 backdrop-blur-xl rounded-full micro-border shadow-[0px_12px_32px_rgba(255,154,46,0.15)] flex justify-around items-center px-3 py-1.5 pointer-events-auto border border-white/[0.06]">
    ${htmlItems}
  </div>
</nav>`;
}

// ----------------------------------------------------
// 1. ENHANCE WORKOUTS.HTML (Real GIFs from dataset, live filter, exercise detail modal)
// ----------------------------------------------------
function buildWorkoutsPage() {
  const exercises = [
    {
      id: "0025",
      name: "Barbell Bench Press",
      category: "chest",
      body_part: "chest",
      target: "Pectorals (Chest)",
      equipment: "Barbell",
      level: "Intermediate",
      sets: "4 Sets • 8-10 Reps",
      gif: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0025-EIeI8Vf.gif",
      secondary: "Triceps, Anterior Deltoids",
      instructions: [
        "Lie flat on the bench with your eyes directly under the racked bar and feet flat on the floor.",
        "Grasp the barbell with an overhand grip slightly wider than shoulder-width, wrists neutral.",
        "Unrack the bar and stabilize it directly over your mid-chest with elbows extended.",
        "Inhale and lower the bar under control until it lightly touches your sternum, keeping elbows tucked at 45 degrees.",
        "Exhale and press powerfully back up along a slight J-curve path to the lockout position."
      ]
    },
    {
      id: "0043",
      name: "Barbell Full Squat",
      category: "upper legs",
      body_part: "upper legs",
      target: "Quadriceps & Gluteals",
      equipment: "Barbell",
      level: "Advanced",
      sets: "4 Sets • 6-8 Reps",
      gif: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0043-qXTaZnJ.gif",
      secondary: "Hamstrings, Core, Calves",
      instructions: [
        "Rest the barbell comfortably across your upper traps and grip the bar firmly.",
        "Set your feet shoulder-width apart with toes flared slightly outwards (15-30 degrees).",
        "Brace your core, hinge at your hips and bend your knees to descend smoothly.",
        "Lower until hip crease drops below the top of the knee, maintaining an upright torso.",
        "Drive forcefully through your midfoot to return to full extension."
      ]
    },
    {
      id: "0032",
      name: "Barbell Conventional Deadlift",
      category: "back",
      body_part: "back",
      target: "Erector Spinae & Posterior Chain",
      equipment: "Barbell",
      level: "Advanced",
      sets: "3 Sets • 5 Reps",
      gif: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0032-ila4NZS.gif",
      secondary: "Hamstrings, Glutes, Forearms, Traps",
      instructions: [
        "Stand with midfoot directly under the bar, feet hip-width apart.",
        "Hinge forward at the hips and grip the barbell just outside your shins.",
        "Pull your chest high, engage your lats, and pull slack out of the barbell.",
        "Drive the floor away through your heels, keeping the bar glued against your legs.",
        "Lock out hips and knees simultaneously with tall posture, avoiding excessive hyperextension."
      ]
    },
    {
      id: "0652",
      name: "Wide-Grip Bodyweight Pull-Up",
      category: "back",
      body_part: "back",
      target: "Latissimus Dorsi (Lats)",
      equipment: "Body Weight",
      level: "Intermediate",
      sets: "4 Sets • 8-12 Reps",
      gif: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0652-lBDjFxJ.gif",
      secondary: "Biceps, Rhomboids, Middle Traps",
      instructions: [
        "Grip the overhead pull-up bar with hands wider than shoulder-width, palms facing away.",
        "Hang with fully extended arms and core braced (dead hang start).",
        "Depress and retract your scapulae, then pull your chest up towards the bar.",
        "Lead with your elbows driving down towards your hips until chin clears bar height.",
        "Lower under full control back to a complete dead-hang extension."
      ]
    },
    {
      id: "0294",
      name: "Incline Dumbbell Biceps Curl",
      category: "upper arms",
      body_part: "upper arms",
      target: "Biceps Brachii (Long Head)",
      equipment: "Dumbbell",
      level: "Intermediate",
      sets: "3 Sets • 10-12 Reps",
      gif: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0294-NbVPDMW.gif",
      secondary: "Brachialis, Forearms",
      instructions: [
        "Sit on an incline bench angled at 45-60 degrees with a dumbbell in each hand.",
        "Let your arms hang straight down perpendicular to the floor with palms facing in.",
        "Keeping your upper arms stationary, curl weights while supinating wrists so palms face up.",
        "Squeeze biceps firmly at the peak contraction for a 1-second pause.",
        "Slowly lower back down under tension to the full bottom stretch."
      ]
    },
    {
      id: "0334",
      name: "Dumbbell Lateral Raise",
      category: "shoulders",
      body_part: "shoulders",
      target: "Lateral Deltoids (Shoulders)",
      equipment: "Dumbbell",
      level: "All Levels",
      sets: "4 Sets • 12-15 Reps",
      gif: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0334-DsgkuIt.gif",
      secondary: "Trapezius, Serratus",
      instructions: [
        "Stand tall holding dumbbells at your sides with a slight forward torso lean.",
        "With a soft bend in your elbows, raise the dumbbells out to the sides.",
        "Lead with your elbows and pinkies until arms are parallel with the floor.",
        "Hold the contraction at shoulder height for a brief moment.",
        "Lower weights slowly in the scapular plane over 2-3 seconds."
      ]
    },
    {
      id: "0172",
      name: "Cable Triceps Pushdown",
      category: "upper arms",
      body_part: "upper arms",
      target: "Triceps Brachii (Lateral/Medial Head)",
      equipment: "Cable",
      level: "All Levels",
      sets: "3 Sets • 12-15 Reps",
      gif: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0172-1PK5Uo3.gif",
      secondary: "Forearms",
      instructions: [
        "Attach a rope or straight bar to a high cable pulley.",
        "Stand with feet shoulder-width, tuck elbows tight to your ribs, and brace core.",
        "Push the cable attachment downwards by extending elbows until arms are straight.",
        "Spread rope handles apart at the bottom for maximum triceps peak contraction.",
        "Control the weight back up to roughly 90 degrees elbow flexion."
      ]
    },
    {
      id: "0001",
      name: "Floor 3/4 Sit-Up & Crunch",
      category: "waist",
      body_part: "waist",
      target: "Rectus Abdominis (Abs)",
      equipment: "Body Weight",
      level: "All Levels",
      sets: "3 Sets • 15-20 Reps",
      gif: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0001-2gPfomN.gif",
      secondary: "Obliques, Hip Flexors",
      instructions: [
        "Lie on your back with knees bent at 90 degrees and feet flat on the mat.",
        "Place fingertips lightly beside your ears or crossed over your chest.",
        "Contract your abdominal wall and curl your ribcage towards your pelvis.",
        "Rise to a 45-degree angle, pausing at peak tension without pulling your neck.",
        "Lower back down under smooth control until shoulders touch the floor."
      ]
    }
  ];

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <title>Exercises & Workout Library - AM-Tippu Fitness</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <script>
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "surface-lowest": "#0C0B0A",
            "surface-low": "#141312",
            "surface-card": "#181716",
            "surface-elevated": "#21201E",
            "surface-high": "#2A2826",
            "primary": "#FF9A2E",
            "primary-container": "#FF9A2E",
            "secondary": "#34D399",
            "on-surface": "#FFFFFF",
            "outline": "#8E8D8A"
          },
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif']
          }
        }
      }
    };
  </script>
  <style>
    body {
      background-color: #0C0B0A;
      color: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .amber-glow {
      box-shadow: 0px 10px 28px rgba(255, 154, 46, 0.2);
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  </style>
</head>
<body class="bg-surface-lowest min-h-screen text-on-surface antialiased pb-28">

  <!-- TOP APP BAR -->
  <header class="fixed top-0 left-0 right-0 z-40 bg-surface-low/90 backdrop-blur-md border-b border-white/[0.04]">
    <div class="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a href="index.html" class="w-9 h-9 rounded-full bg-surface-elevated border border-white/5 flex items-center justify-center text-outline hover:text-white">
          <span class="material-symbols-outlined text-[19px]">arrow_back</span>
        </a>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight">Exercise Library</h1>
          <p class="text-[11px] text-primary font-medium tracking-wide">1,324 Exercises • GIF Dataset</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded-full bg-surface-elevated border border-white/10 text-[10px] font-bold text-secondary flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
          GIFs ACTIVE
        </span>
      </div>
    </div>
  </header>

  <!-- MAIN SCROLLABLE CONTAINER -->
  <main class="max-w-md mx-auto pt-20 px-5 space-y-5">

    <!-- SEARCH BAR -->
    <div class="relative">
      <span class="material-symbols-outlined absolute left-3.5 top-3.5 text-outline text-[20px]">search</span>
      <input id="exercise-search" type="text" placeholder="Search exercises (e.g. Bench, Squat, Lats)..." 
        class="w-full bg-surface-card text-sm text-white placeholder:text-outline/60 pl-11 pr-4 py-3 rounded-2xl border border-white/[0.06] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"/>
    </div>

    <!-- BODY PART FILTER PILLS -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-bold tracking-wider text-outline uppercase">Target Body Part</span>
        <span id="active-count" class="text-[11px] text-outline font-semibold">8 movements</span>
      </div>
      <div id="category-pills" class="flex overflow-x-auto no-scrollbar gap-2 py-1">
        <button data-cat="all" class="cat-pill px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-black transition-all shrink-0">All</button>
        <button data-cat="chest" class="cat-pill px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-card text-outline hover:text-white border border-white/5 transition-all shrink-0">Chest</button>
        <button data-cat="back" class="cat-pill px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-card text-outline hover:text-white border border-white/5 transition-all shrink-0">Back</button>
        <button data-cat="upper legs" class="cat-pill px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-card text-outline hover:text-white border border-white/5 transition-all shrink-0">Legs</button>
        <button data-cat="upper arms" class="cat-pill px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-card text-outline hover:text-white border border-white/5 transition-all shrink-0">Arms</button>
        <button data-cat="shoulders" class="cat-pill px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-card text-outline hover:text-white border border-white/5 transition-all shrink-0">Shoulders</button>
        <button data-cat="waist" class="cat-pill px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-card text-outline hover:text-white border border-white/5 transition-all shrink-0">Core / Waist</button>
      </div>
    </div>

    <!-- SPOTLIGHT EXERCISE CARD -->
    <div id="spotlight-card" class="bg-surface-card rounded-3xl p-5 border border-white/[0.06] amber-glow space-y-3.5 relative overflow-hidden">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-extrabold tracking-wider">SPOTLIGHT</span>
          <span class="text-xs text-outline font-medium">• Chest / Pectorals</span>
        </div>
        <span class="text-[11px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Intermediate</span>
      </div>

      <div>
        <h2 class="text-xl font-extrabold text-white">Barbell Bench Press</h2>
        <p class="text-xs text-outline mt-0.5">Barbell • Primary: Pectoralis Major</p>
      </div>

      <!-- ANIMATED DEMO GIF CONTAINER -->
      <div class="relative w-full h-56 rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center cursor-pointer group" onclick="openExerciseDetail('0025')">
        <img src="https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0025-EIeI8Vf.gif" 
             alt="Barbell Bench Press animated form GIF" 
             class="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
             loading="eager"/>
        <div class="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
          <span class="text-[9px] font-bold text-white tracking-widest uppercase">HD Form Loop</span>
        </div>
        <div class="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] text-primary font-bold flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">visibility</span>
          <span>Tap for Cues</span>
        </div>
      </div>

      <!-- COACH TIPPU FORM TIP -->
      <div class="bg-surface-elevated rounded-2xl p-3.5 border border-white/[0.04] flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs shrink-0 mt-0.5">
          T
        </div>
        <div>
          <span class="text-[10px] font-bold text-primary tracking-wider uppercase block">Coach Tippu Form Cue</span>
          <p class="text-xs text-on-surface leading-relaxed mt-0.5">Retract scapulae into bench, tuck elbows at 45°, and press in a controlled arc.</p>
        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="grid grid-cols-2 gap-2.5 pt-1">
        <button onclick="openExerciseDetail('0025')" class="py-3 px-3 rounded-full bg-surface-elevated hover:bg-surface-high text-xs font-bold text-white border border-white/10 flex items-center justify-center gap-1.5 transition-all active:scale-95">
          <span class="material-symbols-outlined text-[16px]">info</span>
          <span>View Guide</span>
        </button>
        <button onclick="showQuickToast('Barbell Bench Press added to today split!')" class="py-3 px-3 rounded-full bg-primary text-black font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md">
          <span class="material-symbols-outlined text-[16px]">add</span>
          <span>Add to Split</span>
        </button>
      </div>
    </div>

    <!-- EXERCISE CARDS LIST -->
    <div class="space-y-3">
      <div class="flex items-center justify-between pt-2">
        <h3 class="text-base font-bold text-white">Movement Library</h3>
        <span class="text-[11px] text-outline">Tap card for form guide</span>
      </div>

      <div id="exercise-list-container" class="space-y-3">
        <!-- Rendered via JS -->
      </div>
    </div>

  </main>

  <!-- EXERCISE DETAIL & FORM MODAL -->
  <div id="exercise-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="w-full max-w-md bg-surface-card rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <span id="modal-target" class="text-[10px] font-bold text-primary uppercase tracking-wider block">Target Muscle</span>
          <h2 id="modal-title" class="text-lg font-bold text-white">Exercise Title</h2>
        </div>
        <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-surface-elevated text-outline hover:text-white flex items-center justify-center">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-5 overflow-y-auto space-y-4 no-scrollbar">
        <!-- Looping GIF Frame -->
        <div class="w-full h-56 rounded-2xl bg-black/70 border border-white/10 overflow-hidden flex items-center justify-center">
          <img id="modal-gif" src="" alt="Exercise Demonstration" class="w-full h-full object-contain p-2"/>
        </div>

        <!-- Meta pills -->
        <div class="flex flex-wrap gap-2">
          <span id="modal-equip" class="px-3 py-1 rounded-full bg-surface-elevated border border-white/5 text-xs text-white">Equipment</span>
          <span id="modal-secondary" class="px-3 py-1 rounded-full bg-surface-elevated border border-white/5 text-xs text-outline">Secondary</span>
          <span id="modal-sets" class="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold">Recommended Sets</span>
        </div>

        <!-- Step by step instructions -->
        <div class="bg-surface-elevated rounded-2xl p-4 border border-white/[0.04]">
          <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-primary">fact_check</span>
            Execution Steps (from Dataset)
          </h3>
          <ol id="modal-steps" class="space-y-2 text-xs text-outline/90 leading-relaxed list-decimal pl-4">
            <!-- Dynamic steps -->
          </ol>
        </div>

        <!-- Set Tracker Logger in Modal -->
        <div class="bg-surface-elevated rounded-2xl p-4 border border-white/[0.04] space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">Log Sets for This Exercise</h3>
            <span class="text-[10px] text-primary font-bold">+ Auto-syncs to workout</span>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div class="bg-surface-card p-2 rounded-xl border border-white/5">
              <span class="text-[10px] text-outline block">SET 1</span>
              <input type="text" value="80 kg × 10" class="w-full bg-transparent text-center font-bold text-white text-xs mt-1 border-0 p-0 focus:ring-0"/>
            </div>
            <div class="bg-surface-card p-2 rounded-xl border border-white/5">
              <span class="text-[10px] text-outline block">SET 2</span>
              <input type="text" value="85 kg × 8" class="w-full bg-transparent text-center font-bold text-white text-xs mt-1 border-0 p-0 focus:ring-0"/>
            </div>
            <div class="bg-surface-card p-2 rounded-xl border border-white/5">
              <span class="text-[10px] text-outline block">SET 3</span>
              <input type="text" value="90 kg × 6" class="w-full bg-transparent text-center font-bold text-white text-xs mt-1 border-0 p-0 focus:ring-0"/>
            </div>
          </div>
        </div>

        <button onclick="showQuickToast('Sets recorded into today workout!'); closeModal();" class="w-full py-3.5 rounded-full bg-primary text-black font-bold text-sm amber-glow active:scale-95 transition-all">
          ✓ Save Sets to Workout
        </button>
      </div>
    </div>
  </div>

  <!-- TOAST NOTIFICATION -->
  <div id="toast" class="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-surface-elevated border border-primary/40 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 opacity-0 pointer-events-none flex items-center gap-2">
    <span class="material-symbols-outlined text-[16px] text-primary">check_circle</span>
    <span id="toast-text">Action completed</span>
  </div>

  ${buildBottomNav('workouts')}

  <script>
    const exerciseData = ${JSON.stringify(exercises)};

    function renderExercises(list) {
      const container = document.getElementById('exercise-list-container');
      const countEl = document.getElementById('active-count');
      countEl.textContent = list.length + ' movements';

      if (list.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-outline text-xs">No exercises found matching criteria.</div>';
        return;
      }

      container.innerHTML = list.map(item => \`
        <article onclick="openExerciseDetail('\${item.id}')" class="bg-surface-card rounded-2xl p-3.5 border border-white/[0.05] flex gap-3.5 hover:border-primary/40 cursor-pointer transition-all active:scale-[0.99] group">
          <!-- GIF Preview -->
          <div class="relative w-24 h-24 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/5 flex items-center justify-center">
            <img src="\${item.gif}" alt="\${item.name}" class="w-full h-full object-contain p-1" loading="lazy"/>
            <span class="absolute bottom-1 right-1 bg-black/80 text-[8px] font-bold px-1 rounded text-primary">GIF</span>
          </div>

          <!-- Metadata -->
          <div class="flex-1 flex flex-col justify-between py-0.5">
            <div>
              <div class="flex items-start justify-between">
                <h4 class="text-sm font-bold text-white group-hover:text-primary transition-colors leading-snug">\${item.name}</h4>
                <button onclick="event.stopPropagation(); showQuickToast('Added \${item.name} to routine');" class="text-outline hover:text-primary transition-colors p-1">
                  <span class="material-symbols-outlined text-[18px]">add_circle</span>
                </button>
              </div>
              <p class="text-[11px] text-outline mt-0.5">Target: \${item.target}</p>
            </div>
            <div class="flex items-center gap-1.5 flex-wrap mt-2">
              <span class="px-2 py-0.5 rounded-full bg-surface-elevated text-outline text-[10px] font-medium">\${item.equipment}</span>
              <span class="px-2 py-0.5 rounded-full bg-surface-elevated text-outline text-[10px] font-medium capitalize">\${item.body_part}</span>
              <span class="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold">\${item.sets}</span>
            </div>
          </div>
        </article>
      \`).join('');
    }

    // Filter by category
    let currentCategory = 'all';
    let searchQuery = '';

    function filterData() {
      let filtered = exerciseData;
      if (currentCategory !== 'all') {
        filtered = filtered.filter(x => x.body_part.toLowerCase() === currentCategory.toLowerCase() || x.category.toLowerCase() === currentCategory.toLowerCase());
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(x => 
          x.name.toLowerCase().includes(q) || 
          x.target.toLowerCase().includes(q) || 
          x.equipment.toLowerCase().includes(q)
        );
      }
      renderExercises(filtered);
    }

    document.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill').forEach(b => {
          b.classList.remove('bg-primary', 'text-black');
          b.classList.add('bg-surface-card', 'text-outline');
        });
        btn.classList.add('bg-primary', 'text-black');
        btn.classList.remove('bg-surface-card', 'text-outline');
        currentCategory = btn.getAttribute('data-cat');
        filterData();
      });
    });

    document.getElementById('exercise-search').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterData();
    });

    // Modal
    function openExerciseDetail(id) {
      const item = exerciseData.find(x => x.id === id);
      if (!item) return;

      document.getElementById('modal-title').textContent = item.name;
      document.getElementById('modal-target').textContent = 'Target: ' + item.target;
      document.getElementById('modal-gif').src = item.gif;
      document.getElementById('modal-equip').textContent = 'Equipment: ' + item.equipment;
      document.getElementById('modal-secondary').textContent = 'Synergists: ' + item.secondary;
      document.getElementById('modal-sets').textContent = item.sets;

      const stepsList = document.getElementById('modal-steps');
      stepsList.innerHTML = item.instructions.map(s => '<li>' + s + '</li>').join('');

      document.getElementById('exercise-modal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('exercise-modal').classList.add('hidden');
    }

    function showQuickToast(text) {
      const toast = document.getElementById('toast');
      document.getElementById('toast-text').textContent = text;
      toast.classList.remove('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        toast.classList.add('opacity-0', 'pointer-events-none');
      }, 2400);
    }

    // Initial render
    renderExercises(exerciseData);
  </script>
</body>
</html>`;
}

// ----------------------------------------------------
// 2. ENHANCE PROGRESS.HTML (Functional Weight Stepper, History persistence, Add Weigh-In)
// ----------------------------------------------------
function buildProgressPage() {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <title>Progress & Weight Logger - AM-Tippu Fitness</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <script>
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "surface-lowest": "#0C0B0A",
            "surface-low": "#141312",
            "surface-card": "#181716",
            "surface-elevated": "#21201E",
            "surface-high": "#2A2826",
            "primary": "#FF9A2E",
            "primary-container": "#FF9A2E",
            "secondary": "#34D399",
            "on-surface": "#FFFFFF",
            "outline": "#8E8D8A"
          },
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif']
          }
        }
      }
    };
  </script>
  <style>
    body {
      background-color: #0C0B0A;
      color: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .amber-glow {
      box-shadow: 0px 10px 28px rgba(255, 154, 46, 0.2);
    }
  </style>
</head>
<body class="bg-surface-lowest min-h-screen text-on-surface antialiased pb-28">

  <!-- TOP APP BAR -->
  <header class="fixed top-0 left-0 right-0 z-40 bg-surface-low/90 backdrop-blur-md border-b border-white/[0.04]">
    <div class="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a href="index.html" class="w-9 h-9 rounded-full bg-surface-elevated border border-white/5 flex items-center justify-center text-outline hover:text-white">
          <span class="material-symbols-outlined text-[19px]">arrow_back</span>
        </a>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight">Progress & Analytics</h1>
          <p class="text-[11px] text-outline">Weight trajectory & body metrics</p>
        </div>
      </div>
      <div class="flex items-center gap-1.5 bg-surface-elevated px-2.5 py-1 rounded-full border border-white/5 text-[11px]">
        <span class="text-outline">Goal:</span>
        <span class="text-primary font-bold">72.0 kg</span>
      </div>
    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="max-w-md mx-auto pt-20 px-5 space-y-5">

    <!-- TIMEFRAME SELECTOR -->
    <div class="flex justify-between items-center bg-surface-card p-1 rounded-2xl border border-white/5 text-xs font-semibold">
      <button class="flex-1 py-1.5 rounded-xl text-outline hover:text-white">1M</button>
      <button class="flex-1 py-1.5 rounded-xl bg-primary text-black font-bold">3M</button>
      <button class="flex-1 py-1.5 rounded-xl text-outline hover:text-white">6M</button>
      <button class="flex-1 py-1.5 rounded-xl text-outline hover:text-white">1Y</button>
    </div>

    <!-- CURRENT WEIGHT TRAJECTORY HERO CARD -->
    <section class="bg-surface-card rounded-3xl p-5 border border-white/[0.06] amber-glow space-y-4">
      <div class="flex items-start justify-between">
        <div>
          <span class="text-[10px] font-bold text-outline tracking-wider uppercase block">Current Weight</span>
          <div class="flex items-baseline gap-1 mt-0.5">
            <span id="hero-weight" class="text-4xl font-extrabold text-white">74.8</span>
            <span class="text-lg text-outline font-semibold">kg</span>
          </div>
          <p id="hero-date" class="text-[11px] text-outline mt-0.5">Logged today, 7:15 AM</p>
        </div>
        <div id="hero-delta" class="px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px]">trending_down</span>
          <span>-1.4 kg this mo</span>
        </div>
      </div>

      <!-- TRAJECTORY SVG GRAPH -->
      <div class="relative w-full h-32 mt-2">
        <svg class="w-full h-full overflow-visible" viewBox="0 0 320 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="amberGlowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#FF9A2E" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#FF9A2E" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path d="M 0,20 Q 80,30 140,45 T 220,60 T 300,80 L 300,100 L 0,100 Z" fill="url(#amberGlowGrad)"/>
          <path d="M 0,20 Q 80,30 140,45 T 220,60 T 300,80" fill="none" stroke="#FF9A2E" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="0" cy="20" r="3" fill="#8E8D8A"/>
          <circle cx="140" cy="45" r="3" fill="#8E8D8A"/>
          <circle cx="220" cy="60" r="3" fill="#8E8D8A"/>
          <circle cx="300" cy="80" r="5" fill="#FF9A2E"/>
          <circle cx="300" cy="80" r="2" fill="#0C0B0A"/>
        </svg>
      </div>

      <div class="flex justify-between text-[10px] text-outline font-semibold pt-1 border-t border-white/[0.04]">
        <span>OCT 01 (76.8)</span>
        <span>NOV 01 (75.9)</span>
        <span>DEC 01 (75.2)</span>
        <span class="text-primary font-bold">TODAY (<span id="graph-today-val">74.8</span>)</span>
      </div>
    </section>

    <!-- INTERACTIVE WEIGHT LOGGER WIDGET -->
    <section class="bg-surface-card rounded-3xl p-5 border border-white/[0.06] space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
            <span class="material-symbols-outlined text-[19px]">scale</span>
          </div>
          <div>
            <h2 class="text-sm font-bold text-white">Log Today's Weight</h2>
            <p class="text-[11px] text-outline">Adjust with buttons or tap number</p>
          </div>
        </div>
        <span class="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">ACTIVE LOGGER</span>
      </div>

      <!-- STEPPER CONTROLS -->
      <div class="flex items-center justify-between bg-surface-low p-3.5 rounded-2xl border border-white/[0.05]">
        <button id="btn-decrement" class="w-12 h-12 rounded-xl bg-surface-elevated hover:bg-surface-high active:scale-90 flex items-center justify-center text-white text-xl font-bold transition-all border border-white/5">
          <span class="material-symbols-outlined text-[20px]">remove</span>
        </button>

        <div class="text-center">
          <div class="flex items-baseline justify-center gap-1">
            <input id="input-weight" type="number" step="0.1" value="74.8" 
              class="w-28 text-center text-3xl font-extrabold text-white bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"/>
            <span class="text-sm text-outline font-semibold">kg</span>
          </div>
          <span class="text-[9px] text-outline uppercase font-bold tracking-wider block mt-1">Tap number to type</span>
        </div>

        <button id="btn-increment" class="w-12 h-12 rounded-xl bg-surface-elevated hover:bg-surface-high active:scale-90 flex items-center justify-center text-primary text-xl font-bold transition-all border border-white/5">
          <span class="material-symbols-outlined text-[20px]">add</span>
        </button>
      </div>

      <!-- OPTIONAL ATTRIBUTES -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label class="text-[10px] font-bold text-outline uppercase block mb-1">Body Fat % (Est.)</label>
          <input id="input-bf" type="text" value="14.6%" 
            class="w-full bg-surface-low text-xs text-white rounded-xl border border-white/[0.06] p-2.5 focus:border-primary focus:ring-0"/>
        </div>
        <div>
          <label class="text-[10px] font-bold text-outline uppercase block mb-1">Weigh-in Condition</label>
          <select id="input-cond" class="w-full bg-surface-low text-xs text-white rounded-xl border border-white/[0.06] p-2.5 focus:border-primary focus:ring-0">
            <option>Morning Fasted</option>
            <option>Post-Workout</option>
            <option>Evening Before Bed</option>
            <option>Rest Day Baseline</option>
          </select>
        </div>
      </div>

      <!-- NOTES FIELD -->
      <div>
        <label class="text-[10px] font-bold text-outline uppercase block mb-1">Notes (Optional)</label>
        <input id="input-notes" type="text" placeholder="e.g. Well rested, post light jog..." 
          class="w-full bg-surface-low text-xs text-white placeholder:text-outline/50 rounded-xl border border-white/[0.06] p-2.5 focus:border-primary focus:ring-0"/>
      </div>

      <!-- SAVE BUTTON -->
      <button id="btn-save-weight" class="w-full py-3.5 rounded-full bg-primary text-black font-bold text-sm amber-glow flex items-center justify-center gap-2 active:scale-98 transition-all">
        <span class="material-symbols-outlined text-[18px]">check</span>
        <span>Save Weigh-In Entry</span>
      </button>
    </section>

    <!-- BODY COMPOSITION METRICS -->
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-surface-card rounded-2xl p-4 border border-white/[0.05] space-y-2">
        <div class="flex items-center justify-between text-outline">
          <span class="text-[10px] font-bold uppercase tracking-wider">Body Fat</span>
          <span class="material-symbols-outlined text-[16px] text-secondary">pie_chart</span>
        </div>
        <div class="text-2xl font-extrabold text-white">14.6%</div>
        <div class="flex items-center gap-1 text-[11px] text-secondary font-bold">
          <span class="material-symbols-outlined text-[13px]">arrow_downward</span>
          <span>-0.8% this month</span>
        </div>
      </div>

      <div class="bg-surface-card rounded-2xl p-4 border border-white/[0.05] space-y-2">
        <div class="flex items-center justify-between text-outline">
          <span class="text-[10px] font-bold uppercase tracking-wider">Skeletal Muscle</span>
          <span class="material-symbols-outlined text-[16px] text-primary">fitness_center</span>
        </div>
        <div class="text-2xl font-extrabold text-white">38.2 kg</div>
        <div class="flex items-center gap-1 text-[11px] text-secondary font-bold">
          <span class="material-symbols-outlined text-[13px]">arrow_upward</span>
          <span>+0.6 kg this month</span>
        </div>
      </div>
    </div>

    <!-- PERSONAL RECORDS (PR) MILESTONES -->
    <section class="bg-surface-card rounded-3xl p-5 border border-white/[0.05] space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Personal Records (1RM)</h3>
        <span class="text-[10px] text-primary font-bold">POWER/WT 3.8X</span>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center text-xs">
        <div class="bg-surface-low p-3 rounded-2xl border border-white/5">
          <span class="text-[10px] text-outline font-bold block mb-1">BENCH</span>
          <span class="text-base font-extrabold text-white block">105 kg</span>
          <span class="inline-block mt-1 bg-primary/20 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded-full">NEW PR</span>
        </div>
        <div class="bg-surface-low p-3 rounded-2xl border border-white/5">
          <span class="text-[10px] text-outline font-bold block mb-1">SQUAT</span>
          <span class="text-base font-extrabold text-white block">140 kg</span>
          <span class="inline-block mt-1 text-secondary text-[8px] font-bold px-1.5 py-0.5">+5 kg</span>
        </div>
        <div class="bg-surface-low p-3 rounded-2xl border border-white/5">
          <span class="text-[10px] text-outline font-bold block mb-1">DEADLIFT</span>
          <span class="text-base font-extrabold text-white block">175 kg</span>
          <span class="inline-block mt-1 text-secondary text-[8px] font-bold px-1.5 py-0.5">+7.5 kg</span>
        </div>
      </div>
    </section>

    <!-- HISTORICAL WEIGH-IN LOG -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-white">Weigh-In History</h3>
          <p class="text-[11px] text-outline">Stored chronologically</p>
        </div>
        <button onclick="resetLogsToDefault()" class="text-[10px] text-outline hover:text-white">Reset Demo</button>
      </div>

      <div id="history-container" class="space-y-2.5">
        <!-- Rendered via JS -->
      </div>
    </section>

  </main>

  <!-- TOAST NOTIFICATION -->
  <div id="toast" class="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-surface-elevated border border-primary/40 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 opacity-0 pointer-events-none flex items-center gap-2">
    <span class="material-symbols-outlined text-[16px] text-primary">check_circle</span>
    <span id="toast-text">Weigh-in recorded</span>
  </div>

  ${buildBottomNav('progress')}

  <script>
    const defaultHistory = [
      { id: 1, date: "Oct 04, 2026", time: "07:15 AM", weight: 74.8, delta: "-0.3 kg", cond: "Morning fasted", note: "Baseline fasted" },
      { id: 2, date: "Oct 01, 2026", time: "06:45 PM", weight: 75.1, delta: "-0.4 kg", cond: "Post workout", note: "Hydrated" },
      { id: 3, date: "Sep 28, 2026", time: "07:10 AM", weight: 75.5, delta: "-0.4 kg", cond: "Morning fasted", note: "Post leg session" },
      { id: 4, date: "Sep 24, 2026", time: "08:00 AM", weight: 75.9, delta: "-0.5 kg", cond: "Rest day baseline", note: "Clean refeed" },
      { id: 5, date: "Sep 18, 2026", time: "07:30 AM", weight: 76.4, delta: "-0.3 kg", cond: "Baseline check-in", note: "Program kick-off" }
    ];

    function getHistory() {
      const stored = localStorage.getItem('am_tippu_weight_history');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      return defaultHistory;
    }

    function saveHistory(list) {
      localStorage.setItem('am_tippu_weight_history', JSON.stringify(list));
    }

    function renderHistory() {
      const list = getHistory();
      const container = document.getElementById('history-container');

      if (list.length > 0) {
        const latest = list[0];
        document.getElementById('hero-weight').textContent = Number(latest.weight).toFixed(1);
        document.getElementById('graph-today-val').textContent = Number(latest.weight).toFixed(1);
        document.getElementById('hero-date').textContent = 'Logged ' + latest.date + ', ' + latest.time;
      }

      container.innerHTML = list.map(item => \`
        <div class="bg-surface-card rounded-2xl p-3.5 border border-white/[0.05] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-surface-elevated border border-white/5 flex flex-col items-center justify-center">
              <span class="text-[9px] font-bold text-outline uppercase">\${item.date.split(' ')[0]}</span>
              <span class="text-sm font-bold text-white leading-none">\${item.date.split(' ')[1].replace(',', '')}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-white">\${Number(item.weight).toFixed(1)} kg</span>
                <span class="text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">\${item.delta}</span>
              </div>
              <p class="text-[11px] text-outline">\${item.cond} • \${item.time}</p>
            </div>
          </div>
          <button onclick="deleteEntry(\${item.id})" class="text-outline hover:text-red-400 p-1">
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      \`).join('');
    }

    const inputWeight = document.getElementById('input-weight');

    document.getElementById('btn-decrement').addEventListener('click', () => {
      let val = parseFloat(inputWeight.value) || 74.8;
      val = Math.max(30, val - 0.1);
      inputWeight.value = val.toFixed(1);
    });

    document.getElementById('btn-increment').addEventListener('click', () => {
      let val = parseFloat(inputWeight.value) || 74.8;
      val = Math.min(250, val + 0.1);
      inputWeight.value = val.toFixed(1);
    });

    document.getElementById('btn-save-weight').addEventListener('click', () => {
      const weight = parseFloat(inputWeight.value);
      if (isNaN(weight) || weight <= 0) {
        showToast('Please enter a valid weight');
        return;
      }

      const cond = document.getElementById('input-cond').value;
      const notes = document.getElementById('input-notes').value || 'User logged entry';
      const history = getHistory();
      
      const prevWeight = history.length > 0 ? history[0].weight : weight;
      const deltaVal = (weight - prevWeight).toFixed(1);
      const deltaStr = deltaVal <= 0 ? deltaVal + ' kg' : '+' + deltaVal + ' kg';

      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateStr = months[now.getMonth()] + ' ' + String(now.getDate()).padStart(2, '0') + ', ' + now.getFullYear();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newEntry = {
        id: Date.now(),
        date: dateStr,
        time: timeStr,
        weight: weight,
        delta: deltaStr,
        cond: cond,
        note: notes
      };

      history.unshift(newEntry);
      saveHistory(history);
      renderHistory();
      showToast('✓ Saved weigh-in: ' + weight.toFixed(1) + ' kg!');
    });

    function deleteEntry(id) {
      let history = getHistory();
      history = history.filter(x => x.id !== id);
      saveHistory(history);
      renderHistory();
      showToast('Entry removed');
    }

    function resetLogsToDefault() {
      localStorage.removeItem('am_tippu_weight_history');
      renderHistory();
      showToast('Demo logs reset');
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      document.getElementById('toast-text').textContent = msg;
      t.classList.remove('opacity-0', 'pointer-events-none');
      setTimeout(() => t.classList.add('opacity-0', 'pointer-events-none'), 2200);
    }

    renderHistory();
  </script>
</body>
</html>`;
}

// ----------------------------------------------------
// 3. ENHANCE PROFILE.HTML (Rich content: Membership, Invoices, Coach, Locker, Attendance, Settings)
// ----------------------------------------------------
function buildProfilePage() {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <title>Athlete Profile & Membership - AM-Tippu Fitness</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <script>
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "surface-lowest": "#0C0B0A",
            "surface-low": "#141312",
            "surface-card": "#181716",
            "surface-elevated": "#21201E",
            "surface-high": "#2A2826",
            "primary": "#FF9A2E",
            "primary-container": "#FF9A2E",
            "secondary": "#34D399",
            "on-surface": "#FFFFFF",
            "outline": "#8E8D8A"
          },
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif']
          }
        }
      }
    };
  </script>
  <style>
    body {
      background-color: #0C0B0A;
      color: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .amber-glow {
      box-shadow: 0px 10px 28px rgba(255, 154, 46, 0.2);
    }
  </style>
</head>
<body class="bg-surface-lowest min-h-screen text-on-surface antialiased pb-28">

  <!-- TOP APP BAR -->
  <header class="fixed top-0 left-0 right-0 z-40 bg-surface-low/90 backdrop-blur-md border-b border-white/[0.04]">
    <div class="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a href="index.html" class="w-9 h-9 rounded-full bg-surface-elevated border border-white/5 flex items-center justify-center text-outline hover:text-white">
          <span class="material-symbols-outlined text-[19px]">arrow_back</span>
        </a>
        <h1 class="text-base font-bold text-white tracking-tight">Athlete Profile & Hub</h1>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="showToast('Settings saved')" class="w-9 h-9 rounded-full bg-surface-elevated border border-white/5 flex items-center justify-center text-outline hover:text-primary">
          <span class="material-symbols-outlined text-[19px]">settings</span>
        </button>
      </div>
    </div>
  </header>

  <!-- MAIN SCROLLABLE CONTAINER -->
  <main class="max-w-md mx-auto pt-20 px-5 space-y-5">

    <!-- ATHLETE IDENTITY SECTION -->
    <section class="flex flex-col items-center text-center pt-1">
      <div class="relative mb-3">
        <div class="w-24 h-24 rounded-full p-[2.5px] bg-gradient-to-b from-primary to-surface-card shadow-[0_0_24px_rgba(255,154,46,0.3)]">
          <img class="w-full h-full rounded-full object-cover bg-surface-card" 
               src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" 
               alt="Sufiyan Khan Profile"/>
        </div>
        <div class="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-surface-high border-2 border-surface-lowest flex items-center justify-center text-primary">
          <span class="material-symbols-outlined text-[13px]" style="font-variation-settings: 'FILL' 1;">verified</span>
        </div>
      </div>

      <h2 class="text-2xl font-extrabold text-white tracking-tight">Sufiyan Khan</h2>
      <p class="text-xs text-outline mt-0.5">@sufiyan.fit • Member ID: #TK-9842</p>

      <div class="mt-2.5 flex items-center gap-2">
        <span class="px-3 py-1 rounded-full bg-primary/15 border border-primary/40 text-[10px] font-bold text-primary tracking-wider">
          ELITE ANNUAL ATHLETE
        </span>
        <span class="px-3 py-1 rounded-full bg-surface-card border border-white/5 text-[10px] text-outline font-semibold">
          Member since Nov 2024
        </span>
      </div>
    </section>

    <!-- ALL-ACCESS PASS HERO CARD WITH UPI RENEWAL -->
    <section class="bg-surface-card rounded-3xl p-5 border border-white/[0.06] amber-glow space-y-4 relative overflow-hidden">
      <div class="flex items-start justify-between">
        <div>
          <span class="text-[10px] font-bold text-outline tracking-wider uppercase block">MEMBERSHIP ACCESS</span>
          <h3 class="text-lg font-bold text-white mt-0.5">AM-Tippu All-Access Unlimited</h3>
        </div>
        <div class="w-9 h-9 rounded-xl bg-surface-elevated border border-white/5 flex items-center justify-center text-primary">
          <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">military_tech</span>
        </div>
      </div>

      <!-- Live Validity Status -->
      <div class="p-3 rounded-2xl bg-surface-low border border-white/5 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <div>
            <span class="text-xs font-bold text-white block">Active • 24 Days Remaining</span>
            <span class="text-[10px] text-outline">Renews on 28 Nov 2026</span>
          </div>
        </div>
        <span class="text-[10px] font-bold text-secondary bg-secondary/15 px-2 py-0.5 rounded-full">VALID</span>
      </div>

      <!-- Privileges Checklist -->
      <div class="space-y-2 text-xs text-outline/90">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-[16px] text-primary">check_circle</span>
          <span class="text-white">24/7 Optical Turnstile Access (Door & Gate)</span>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-[16px] text-primary">check_circle</span>
          <span class="text-white">Coach Tippu 1-on-1 Guidance & Programming</span>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-[16px] text-primary">check_circle</span>
          <span class="text-white">Dedicated Locker #42 Assigned</span>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-[16px] text-primary">check_circle</span>
          <span class="text-white">Recovery Spa, Sauna & 2 Guest Passes Remaining</span>
        </div>
      </div>

      <!-- UPI RENEW BUTTON -->
      <button onclick="openUpiModal()" class="w-full py-3.5 rounded-full bg-primary text-black font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md">
        <span class="material-symbols-outlined text-[18px]">bolt</span>
        <span>Renew via UPI (GPay / PhonePe / Paytm) • ₹14,999</span>
      </button>
    </section>

    <!-- ATTENDANCE & ACTIVITY TELEMETRY (4-BENTO METRIC GRID) -->
    <section class="space-y-2.5">
      <h3 class="text-xs font-bold text-outline uppercase tracking-wider px-1">Gym Floor Attendance</h3>
      <div class="grid grid-cols-2 gap-2.5">
        <div class="bg-surface-card p-3.5 rounded-2xl border border-white/5 space-y-1">
          <span class="text-[10px] font-bold text-outline uppercase">Total Check-Ins</span>
          <div class="text-2xl font-extrabold text-white">148 <span class="text-xs text-outline font-normal">days</span></div>
          <span class="text-[10px] text-secondary font-bold">Top 5% Facility Consistency</span>
        </div>
        <div class="bg-surface-card p-3.5 rounded-2xl border border-white/5 space-y-1">
          <span class="text-[10px] font-bold text-outline uppercase">Current Streak</span>
          <div class="text-2xl font-extrabold text-primary">14 <span class="text-xs text-outline font-normal">days 🔥</span></div>
          <span class="text-[10px] text-outline">Personal Record Streak</span>
        </div>
        <div class="bg-surface-card p-3.5 rounded-2xl border border-white/5 space-y-1">
          <span class="text-[10px] font-bold text-outline uppercase">Avg Session Duration</span>
          <div class="text-xl font-extrabold text-white">62 <span class="text-xs text-outline font-normal">mins</span></div>
          <span class="text-[10px] text-outline">Ideal Hypertrophy Window</span>
        </div>
        <div class="bg-surface-card p-3.5 rounded-2xl border border-white/5 space-y-1">
          <span class="text-[10px] font-bold text-outline uppercase">Preferred Slot</span>
          <div class="text-xl font-extrabold text-white">07:00 <span class="text-xs text-outline font-normal">AM</span></div>
          <span class="text-[10px] text-secondary font-semibold">Morning Low-Density</span>
        </div>
      </div>
    </section>

    <!-- COACH TIPPU RELATIONSHIP & ASSESSMENT HUB -->
    <section class="bg-surface-card rounded-3xl p-5 border border-white/[0.06] space-y-3.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full overflow-hidden border border-primary/40 bg-surface-elevated shrink-0">
            <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=150&q=80" 
                 alt="Coach Tippu" class="w-full h-full object-cover"/>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h4 class="text-sm font-bold text-white">Coach Tippu</h4>
              <span class="material-symbols-outlined text-[14px] text-primary">verified</span>
            </div>
            <p class="text-[11px] text-outline">Head Strength & Conditioning Coach</p>
            <span class="text-[10px] text-primary font-semibold">Goal: Clean Bulk to 78kg</span>
          </div>
        </div>
      </div>

      <div class="p-3 bg-surface-low rounded-2xl border border-white/5 text-xs text-outline space-y-1">
        <div class="flex items-center justify-between text-white font-semibold">
          <span>Next 1-on-1 Form Check:</span>
          <span class="text-primary font-bold">Saturday, 10:00 AM</span>
        </div>
        <p class="text-[11px] text-outline/80 leading-relaxed">Focus: Bench press bar path & deadlift hip hinge torque review.</p>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <a href="https://wa.me/" target="_blank" class="py-2.5 px-3 rounded-full bg-surface-elevated hover:bg-surface-high border border-white/5 text-xs font-bold text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all">
          <span class="material-symbols-outlined text-[16px] text-secondary">chat</span>
          <span>Message Coach</span>
        </a>
        <button onclick="showToast('Assessment request sent to Coach Tippu!')" class="py-2.5 px-3 rounded-full bg-surface-elevated hover:bg-surface-high border border-white/5 text-xs font-bold text-primary flex items-center justify-center gap-1.5 active:scale-95 transition-all">
          <span class="material-symbols-outlined text-[16px]">calendar_add_on</span>
          <span>Book Check-in</span>
        </button>
      </div>
    </section>

    <!-- INVOICES & PAYMENT RECEIPTS -->
    <section class="space-y-2.5">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xs font-bold text-outline uppercase tracking-wider">Billing History & Tax Receipts</h3>
        <span class="text-[10px] text-primary font-semibold">GST Invoices</span>
      </div>

      <div class="bg-surface-card rounded-2xl border border-white/5 divide-y divide-white/[0.04] overflow-hidden">
        <!-- Receipt 1 -->
        <div class="p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-surface-elevated flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
            <div>
              <span class="text-xs font-bold text-white block">INV-2025-8821 • ₹14,999</span>
              <span class="text-[10px] text-outline">Paid via UPI (PhonePe) • 28 Nov 2025</span>
            </div>
          </div>
          <button onclick="showToast('Downloading Invoice INV-2025-8821.pdf')" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>PDF</span>
            <span class="material-symbols-outlined text-[14px]">download</span>
          </button>
        </div>

        <!-- Receipt 2 -->
        <div class="p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-surface-elevated flex items-center justify-center text-outline">
              <span class="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
            <div>
              <span class="text-xs font-bold text-white block">INV-2024-4102 • ₹13,500</span>
              <span class="text-[10px] text-outline">Paid via UPI (GPay) • 28 Nov 2024</span>
            </div>
          </div>
          <button onclick="showToast('Downloading Invoice INV-2024-4102.pdf')" class="text-xs font-bold text-outline hover:text-white flex items-center gap-1">
            <span>PDF</span>
            <span class="material-symbols-outlined text-[14px]">download</span>
          </button>
        </div>
      </div>
    </section>

    <!-- LOCKER & EMERGENCY PROFILE -->
    <section class="space-y-2.5">
      <h3 class="text-xs font-bold text-outline uppercase tracking-wider px-1">Locker & Health Specs</h3>
      <div class="bg-surface-card rounded-2xl p-4 border border-white/5 space-y-3 text-xs">
        <div class="flex items-center justify-between py-1 border-b border-white/[0.04]">
          <span class="text-outline">Assigned Locker</span>
          <span class="font-bold text-white">Locker #42 (Row B, East Wing)</span>
        </div>
        <div class="flex items-center justify-between py-1 border-b border-white/[0.04]">
          <span class="text-outline">RFID Key Fob ID</span>
          <span class="font-bold text-primary">#AMT-FOB-9842 (Synced)</span>
        </div>
        <div class="flex items-center justify-between py-1 border-b border-white/[0.04]">
          <span class="text-outline">Emergency Contact</span>
          <span class="font-bold text-white">Brother (+91 98765 43210)</span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-outline">Blood Group & Medical</span>
          <span class="font-bold text-secondary">O+ • PAR-Q Cleared</span>
        </div>
      </div>
    </section>

    <!-- PREFERENCES & TOGGLES -->
    <section class="space-y-2.5">
      <h3 class="text-xs font-bold text-outline uppercase tracking-wider px-1">Facility Preferences</h3>
      <div class="bg-surface-card rounded-2xl border border-white/5 divide-y divide-white/[0.04] overflow-hidden text-xs">
        <!-- Toggle 1 -->
        <div class="p-4 flex items-center justify-between">
          <div>
            <span class="font-bold text-white block">Turnstile Haptic Feedback</span>
            <span class="text-[10px] text-outline">Vibrate upon optical QR scanner clearance</span>
          </div>
          <input type="checkbox" checked class="rounded bg-surface-elevated border-white/10 text-primary focus:ring-0 w-4 h-4"/>
        </div>
        <!-- Toggle 2 -->
        <div class="p-4 flex items-center justify-between">
          <div>
            <span class="font-bold text-white block">Floor Peak Occupancy Alerts</span>
            <span class="text-[10px] text-outline">Notify when gym occupancy is &lt; 20 athletes</span>
          </div>
          <input type="checkbox" checked class="rounded bg-surface-elevated border-white/10 text-primary focus:ring-0 w-4 h-4"/>
        </div>
        <!-- Units -->
        <div class="p-4 flex items-center justify-between">
          <div>
            <span class="font-bold text-white block">Measurement System</span>
            <span class="text-[10px] text-outline">Metric (kg, cm, Celsius)</span>
          </div>
          <span class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">METRIC</span>
        </div>
        <!-- Rules -->
        <button onclick="showToast('Facility etiquette: Re-rack weights & wipe machines')" class="w-full p-4 flex items-center justify-between text-left hover:bg-surface-elevated transition-colors">
          <div>
            <span class="font-bold text-white block">Gym Etiquette & Facility Guidelines</span>
            <span class="text-[10px] text-outline">Turnstile rules, dress code, chalk policy</span>
          </div>
          <span class="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
        </button>
      </div>
    </section>

    <!-- LOGOUT & VERSION -->
    <section class="pt-2 text-center space-y-2">
      <button onclick="showToast('Signed out of demo session')" class="px-5 py-2.5 rounded-full bg-surface-elevated border border-white/5 text-xs font-semibold text-outline hover:text-red-400 active:scale-95 transition-all">
        Sign Out of Account
      </button>
      <p class="text-[10px] text-outline/60">AM-Tippu Fitness • v2.4.0 (Build 89) • Made for Sufiyan</p>
    </section>

  </main>

  <!-- UPI RENEWAL BOTTOM SHEET MODAL -->
  <div id="upi-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="w-full max-w-md bg-surface-card rounded-t-3xl sm:rounded-3xl border border-white/10 p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold text-primary uppercase tracking-wider block">INSTANT UPI RENEWAL</span>
          <h3 class="text-lg font-bold text-white">Renew All-Access Pass</h3>
        </div>
        <button onclick="closeUpiModal()" class="w-8 h-8 rounded-full bg-surface-elevated text-outline hover:text-white flex items-center justify-center">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="bg-surface-low p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
        <div class="flex justify-between text-outline">
          <span>Plan:</span>
          <span class="text-white font-bold">12-Month Unlimited All-Access</span>
        </div>
        <div class="flex justify-between text-outline">
          <span>New Expiry:</span>
          <span class="text-secondary font-bold">28 Nov 2027 (+365 Days)</span>
        </div>
        <div class="flex justify-between text-outline pt-2 border-t border-white/5">
          <span class="text-sm font-bold text-white">Total Amount:</span>
          <span class="text-lg font-extrabold text-primary">₹14,999</span>
        </div>
      </div>

      <div class="space-y-2">
        <span class="text-[11px] font-bold text-outline uppercase block">Select Payment App</span>
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <button onclick="simulateUpi('Google Pay')" class="p-3 rounded-2xl bg-surface-elevated border border-white/5 hover:border-primary/40 text-white font-bold active:scale-95 transition-all">
            Google Pay
          </button>
          <button onclick="simulateUpi('PhonePe')" class="p-3 rounded-2xl bg-surface-elevated border border-white/5 hover:border-primary/40 text-white font-bold active:scale-95 transition-all">
            PhonePe
          </button>
          <button onclick="simulateUpi('Paytm')" class="p-3 rounded-2xl bg-surface-elevated border border-white/5 hover:border-primary/40 text-white font-bold active:scale-95 transition-all">
            Paytm
          </button>
        </div>
      </div>

      <p class="text-[10px] text-outline text-center">Protected by 256-bit bank grade encryption • Instant Turnstile Pass Refresh</p>
    </div>
  </div>

  <!-- TOAST NOTIFICATION -->
  <div id="toast" class="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-surface-elevated border border-primary/40 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 opacity-0 pointer-events-none flex items-center gap-2">
    <span class="material-symbols-outlined text-[16px] text-primary">check_circle</span>
    <span id="toast-text">Action completed</span>
  </div>

  ${buildBottomNav('profile')}

  <script>
    function openUpiModal() {
      document.getElementById('upi-modal').classList.remove('hidden');
    }
    function closeUpiModal() {
      document.getElementById('upi-modal').classList.add('hidden');
    }
    function simulateUpi(app) {
      closeUpiModal();
      showToast('Opening ' + app + ' UPI payment gateway...');
      setTimeout(() => {
        showToast('✓ Payment Received! Membership extended to Nov 2027.');
      }, 1500);
    }
    function showToast(msg) {
      const t = document.getElementById('toast');
      document.getElementById('toast-text').textContent = msg;
      t.classList.remove('opacity-0', 'pointer-events-none');
      setTimeout(() => t.classList.add('opacity-0', 'pointer-events-none'), 2500);
    }
  </script>
</body>
</html>`;
}

// ----------------------------------------------------
// WRITE FILES & SYNC NAVIGATION
// ----------------------------------------------------
fs.writeFileSync(path.join(previewDir, 'workouts.html'), buildWorkoutsPage(), 'utf8');
console.log('✓ Written enhanced workouts.html with animated GIFs & dataset detail modal');

fs.writeFileSync(path.join(previewDir, 'progress.html'), buildProgressPage(), 'utf8');
console.log('✓ Written enhanced progress.html with interactive weight logger & history');

fs.writeFileSync(path.join(previewDir, 'profile.html'), buildProfilePage(), 'utf8');
console.log('✓ Written enhanced profile.html with comprehensive rich content');

// Ensure index.html and checkin.html also have the updated bottom nav
['index.html', 'checkin.html'].forEach(f => {
  const p = path.join(previewDir, f);
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    const tab = f === 'index.html' ? 'home' : 'checkin';
    const navRegex = /<!-- BOTTOM NAVIGATION DOCK[\s\S]*?<\/nav>/i;
    if (navRegex.test(c)) {
      c = c.replace(navRegex, buildBottomNav(tab));
    } else {
      const genericNav = /<nav[\s\S]*?<\/nav>/i;
      if (genericNav.test(c)) {
        c = c.replace(genericNav, buildBottomNav(tab));
      }
    }
    fs.writeFileSync(p, c, 'utf8');
    console.log('✓ Synchronized bottom nav in ' + f);
  }
});

console.log('\nAll enhanced screens deployed to temp_preview successfully!');
