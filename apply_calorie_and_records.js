const fs = require('fs');
const path = require('path');

const previewDir = path.join(__dirname, 'temp_preview');

// ----------------------------------------------------
// 1. UPDATE INDEX.HTML TO SHOW CALORIE BURN & REFLECT CALORIES
// ----------------------------------------------------
function updateIndexHtml() {
  const indexPath = path.join(previewDir, 'index.html');
  let content = fs.readFileSync(indexPath, 'utf8');

  // We want to add Calorie Tracker into the Quick Glance section of index.html
  // Let's replace the 2-column grid with a 3-column or dedicated Calorie + Target + Weight grid!
  const oldMetricsRegex = /<!-- Quick Glance Metrics Grid \(2 Columns\) -->[\s\S]*?<\/section>/i;

  const newMetricsSection = `<!-- Quick Glance Metrics: Calories Burned, Target & Weight (Reflected from Analytics) -->
    <section class="space-y-3">
      <div class="flex items-center justify-between px-1">
        <span class="font-label-caps text-label-caps text-outline uppercase tracking-wider">Daily Activity & Biometrics</span>
        <a href="progress.html" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          <span>Analytics</span>
          <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
        </a>
      </div>

      <!-- Featured Calorie Burn Bar -->
      <div class="bg-surface-container-low border border-white/[0.04] rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
        <div class="flex items-center gap-3.5 relative z-10">
          <div class="w-11 h-11 rounded-xl bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container shadow-[0px_0px_16px_rgba(255,154,46,0.3)]">
            <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
          </div>
          <div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-xl font-extrabold text-white font-display-metric">640</span>
              <span class="text-xs text-outline font-semibold">/ 750 kcal</span>
              <span class="text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.2 rounded ml-1">85% Goal</span>
            </div>
            <p class="text-[11px] text-outline mt-0.5">Active Burn • +120 kcal above daily avg</p>
          </div>
        </div>

        <div class="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg class="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path class="text-surface-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-width="3.5"></path>
            <path class="text-primary-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-dasharray="85, 100" stroke-linecap="round" stroke-width="3.5"></path>
          </svg>
          <span class="absolute text-[10px] font-bold text-primary font-label-caps">85%</span>
        </div>
      </div>

      <!-- 2-Card Row: Weekly Target & Current Weight -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Card 1: Weekly Target -->
        <div class="bg-surface-container-low border border-white/[0.04] rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex justify-between items-start">
            <span class="font-label-caps text-label-caps text-outline">WEEKLY TARGET</span>
            <div class="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[16px]" data-icon="flag">flag</span>
            </div>
          </div>
          <div class="my-3 flex items-center justify-between">
            <div>
              <div class="font-display-metric text-display-metric font-bold text-on-surface leading-none">4/5</div>
              <p class="font-label-md text-label-md text-outline mt-1">Sessions done</p>
            </div>
            <div class="relative w-10 h-10 flex items-center justify-center">
              <svg class="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                <path class="text-surface-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-width="3.5"></path>
                <path class="text-primary-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-dasharray="80, 100" stroke-linecap="round" stroke-width="3.5"></path>
              </svg>
              <span class="absolute font-label-caps text-[9px] font-bold text-on-surface">80%</span>
            </div>
          </div>
          <div class="pt-2 border-t border-white/[0.04] flex items-center justify-between font-label-md text-label-md text-outline">
            <span>1 left</span>
            <span class="text-on-surface-variant font-medium">Target: Fri</span>
          </div>
        </div>

        <!-- Card 2: Current Weight -->
        <div class="bg-surface-container-low border border-white/[0.04] rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex justify-between items-start">
            <span class="font-label-caps text-label-caps text-outline">BODY WEIGHT</span>
            <div class="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-secondary">
              <span class="material-symbols-outlined text-[16px]" data-icon="monitor_weight">monitor_weight</span>
            </div>
          </div>
          <div class="my-3">
            <div class="flex items-baseline gap-1">
              <span class="font-display-metric text-display-metric font-bold text-on-surface leading-none">74.8</span>
              <span class="font-label-md text-label-md text-outline">kg</span>
            </div>
            <div class="inline-flex items-center gap-1 mt-1 text-secondary font-label-md text-label-md font-semibold">
              <span class="material-symbols-outlined text-[14px]" data-icon="trending_down">trending_down</span>
              <span>-0.4 kg this week</span>
            </div>
          </div>
          <div class="pt-2 border-t border-white/[0.04] flex items-center justify-between font-label-md text-label-md text-outline">
            <span>Logged today</span>
            <span class="text-on-surface-variant font-medium">7:30 AM</span>
          </div>
        </div>
      </div>
    </section>`;

  if (oldMetricsRegex.test(content)) {
    content = content.replace(oldMetricsRegex, newMetricsSection);
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('✓ Successfully reflected Calorie Tracker on index.html');
  } else {
    console.log('Warning: oldMetricsRegex did not match in index.html');
  }
}

// ----------------------------------------------------
// 2. UPDATE PROGRESS.HTML TO ADD CALORIE TRACKER & "VIEW ALL" ALL-EXERCISES MODAL
// ----------------------------------------------------
function updateProgressHtml() {
  const progressPath = path.join(previewDir, 'progress.html');
  let content = fs.readFileSync(progressPath, 'utf8');

  // Replace POWER/WT 3.8X with View All button
  content = content.replace(
    '<span class="text-[10px] text-primary font-bold">POWER/WT 3.8X</span>',
    `<button onclick="openAllWorkoutRecords()" class="text-xs font-bold text-primary hover:underline flex items-center gap-1 active:scale-95 transition-all">
          <span>View All</span>
          <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
        </button>`
  );

  // Add CALORIE & ACTIVE ENERGY TRACKER CARD right before Body Composition
  const calorieSection = `
    <!-- CALORIE & DAILY ACTIVE ENERGY TRACKER -->
    <section class="bg-surface-card rounded-3xl p-5 border border-white/[0.06] space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container shadow-[0px_0px_16px_rgba(255,154,46,0.3)]">
            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
          </div>
          <div>
            <h2 class="text-sm font-bold text-white uppercase tracking-wider">Calorie & Energy Tracker</h2>
            <p class="text-[11px] text-outline">Active Burn & Nutrition Balance</p>
          </div>
        </div>
        <span class="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">-410 kcal Deficit</span>
      </div>

      <!-- Main Calorie Grid -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Active Burn -->
        <div class="bg-surface-low p-4 rounded-2xl border border-white/5 space-y-2">
          <div class="flex justify-between items-center text-outline text-[10px] font-bold uppercase">
            <span>Active Burn</span>
            <span class="material-symbols-outlined text-[16px] text-primary">bolt</span>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-extrabold text-white">640</span>
            <span class="text-xs text-outline font-semibold">/ 750 kcal</span>
          </div>
          <div class="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
            <div class="bg-primary-container h-1.5 rounded-full" style="width: 85%;"></div>
          </div>
          <span class="text-[10px] text-secondary font-medium block">85% • Push Day Workout</span>
        </div>

        <!-- Calorie Intake -->
        <div class="bg-surface-low p-4 rounded-2xl border border-white/5 space-y-2">
          <div class="flex justify-between items-center text-outline text-[10px] font-bold uppercase">
            <span>Intake</span>
            <span class="material-symbols-outlined text-[16px] text-secondary">restaurant</span>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-extrabold text-white">2,450</span>
            <span class="text-xs text-outline font-semibold">/ 2,800 kcal</span>
          </div>
          <div class="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
            <div class="bg-secondary h-1.5 rounded-full" style="width: 87%;"></div>
          </div>
          <span class="text-[10px] text-outline font-medium block">3 Meals • 1 Shake logged</span>
        </div>
      </div>

      <!-- Macro Split Row -->
      <div class="bg-surface-low p-3.5 rounded-2xl border border-white/5 flex items-center justify-around text-center text-xs">
        <div>
          <span class="text-[10px] font-bold text-outline uppercase block">PROTEIN</span>
          <span class="text-sm font-extrabold text-white">165g</span>
          <span class="text-[9px] text-secondary block font-semibold">97% Target</span>
        </div>
        <div class="w-px h-7 bg-white/10"></div>
        <div>
          <span class="text-[10px] font-bold text-outline uppercase block">CARBS</span>
          <span class="text-sm font-extrabold text-white">240g</span>
          <span class="text-[9px] text-outline block">92% Target</span>
        </div>
        <div class="w-px h-7 bg-white/10"></div>
        <div>
          <span class="text-[10px] font-bold text-outline uppercase block">FATS</span>
          <span class="text-sm font-extrabold text-white">62g</span>
          <span class="text-[9px] text-outline block">95% Target</span>
        </div>
      </div>

      <!-- Quick Action Button -->
      <button onclick="showToast('✓ Quick Meal logged: +450 kcal')" class="w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-high border border-white/5 text-xs font-bold text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all">
        <span class="material-symbols-outlined text-[16px] text-primary">add_circle</span>
        <span>+ Log Calories or Meal</span>
      </button>
    </section>
`;

  content = content.replace('<!-- BODY COMPOSITION METRICS -->', `${calorieSection}\n    <!-- BODY COMPOSITION METRICS -->`);

  // Now, let's inject the "All Workout Records & PR History" modal before </body>
  const allRecordsData = [
    {
      name: "Barbell Bench Press",
      category: "Chest",
      equipment: "Barbell",
      pr: "105 kg",
      date: "Oct 02, 2026",
      history: ["105 kg × 5 (PR)", "100 kg × 6", "95 kg × 8", "90 kg × 10"]
    },
    {
      name: "Barbell Full Squat",
      category: "Legs",
      equipment: "Barbell",
      pr: "140 kg",
      date: "Sep 30, 2026",
      history: ["140 kg × 5 (PR)", "140 kg × 4", "130 kg × 6", "120 kg × 8"]
    },
    {
      name: "Conventional Deadlift",
      category: "Back",
      equipment: "Barbell",
      pr: "175 kg",
      date: "Sep 27, 2026",
      history: ["175 kg × 3 (PR)", "165 kg × 4", "150 kg × 5"]
    },
    {
      name: "Dumbbell Shoulder Press",
      category: "Shoulders",
      equipment: "Dumbbell",
      pr: "34 kg",
      date: "Oct 03, 2026",
      history: ["34 kg × 8 (PR)", "34 kg × 6", "30 kg × 10", "28 kg × 10"]
    },
    {
      name: "Barbell Bent-Over Row",
      category: "Back",
      equipment: "Barbell",
      pr: "92.5 kg",
      date: "Oct 01, 2026",
      history: ["92.5 kg × 8 (PR)", "92.5 kg × 6", "85 kg × 8", "80 kg × 10"]
    },
    {
      name: "Weighted Pull-Up",
      category: "Back",
      equipment: "Bodyweight + Weight",
      pr: "+20 kg",
      date: "Sep 29, 2026",
      history: ["+20 kg × 5 (PR)", "+15 kg × 6", "+10 kg × 8", "BW × 12"]
    },
    {
      name: "Incline Dumbbell Curl",
      category: "Arms",
      equipment: "Dumbbell",
      pr: "22 kg",
      date: "Sep 29, 2026",
      history: ["22 kg × 8 (PR)", "20 kg × 8", "18 kg × 10"]
    },
    {
      name: "Dumbbell Lateral Raise",
      category: "Shoulders",
      equipment: "Dumbbell",
      pr: "16 kg",
      date: "Oct 03, 2026",
      history: ["16 kg × 12 (PR)", "16 kg × 10", "14 kg × 12", "12 kg × 15"]
    },
    {
      name: "Cable Triceps Pushdown",
      category: "Arms",
      equipment: "Cable",
      pr: "42.5 kg",
      date: "Oct 02, 2026",
      history: ["42.5 kg × 10 (PR)", "40 kg × 10", "35 kg × 12"]
    },
    {
      name: "Incline Barbell Bench Press",
      category: "Chest",
      equipment: "Barbell",
      pr: "85 kg",
      date: "Oct 02, 2026",
      history: ["85 kg × 6 (PR)", "80 kg × 8", "75 kg × 8"]
    },
    {
      name: "Leg Press",
      category: "Legs",
      equipment: "Machine",
      pr: "280 kg",
      date: "Sep 25, 2026",
      history: ["280 kg × 10 (PR)", "280 kg × 8", "250 kg × 10", "220 kg × 12"]
    },
    {
      name: "Romanian Deadlift (RDL)",
      category: "Legs",
      equipment: "Barbell",
      pr: "130 kg",
      date: "Sep 20, 2026",
      history: ["130 kg × 6 (PR)", "120 kg × 8", "115 kg × 8", "100 kg × 10"]
    }
  ];

  const modalHtml = `
  <!-- ALL WORKOUT RECORDS & EXERCISE PR MODAL -->
  <div id="all-records-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="w-full max-w-md bg-surface-card rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold text-primary uppercase tracking-wider block">ALL EXERCISE MILESTONES</span>
          <h2 class="text-lg font-bold text-white">Previous Workout Records</h2>
        </div>
        <button onclick="closeAllWorkoutRecords()" class="w-8 h-8 rounded-full bg-surface-elevated text-outline hover:text-white flex items-center justify-center">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <!-- Search & Category Filters -->
      <div class="p-4 border-b border-white/[0.04] space-y-2.5">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
          <input id="pr-search" type="text" placeholder="Search exercises (e.g. Squat, Row, OHP)..." 
            class="w-full bg-surface-low text-xs text-white placeholder:text-outline/60 pl-9 pr-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-primary"/>
        </div>

        <div id="pr-filter-pills" class="flex overflow-x-auto no-scrollbar gap-1.5 py-0.5">
          <button data-cat="All" class="pr-cat-pill px-3 py-1 rounded-full text-[11px] font-bold bg-primary text-black shrink-0">All (${allRecordsData.length})</button>
          <button data-cat="Chest" class="pr-cat-pill px-3 py-1 rounded-full text-[11px] font-semibold bg-surface-elevated text-outline hover:text-white border border-white/5 shrink-0">Chest</button>
          <button data-cat="Back" class="pr-cat-pill px-3 py-1 rounded-full text-[11px] font-semibold bg-surface-elevated text-outline hover:text-white border border-white/5 shrink-0">Back</button>
          <button data-cat="Legs" class="pr-cat-pill px-3 py-1 rounded-full text-[11px] font-semibold bg-surface-elevated text-outline hover:text-white border border-white/5 shrink-0">Legs</button>
          <button data-cat="Shoulders" class="pr-cat-pill px-3 py-1 rounded-full text-[11px] font-semibold bg-surface-elevated text-outline hover:text-white border border-white/5 shrink-0">Shoulders</button>
          <button data-cat="Arms" class="pr-cat-pill px-3 py-1 rounded-full text-[11px] font-semibold bg-surface-elevated text-outline hover:text-white border border-white/5 shrink-0">Arms</button>
        </div>
      </div>

      <!-- Records List -->
      <div id="pr-records-list" class="p-4 overflow-y-auto space-y-3 no-scrollbar max-h-[60vh]">
        <!-- Dynamic PR items rendered via JS -->
      </div>

      <!-- Modal Footer -->
      <div class="p-4 border-t border-white/[0.06] bg-surface-card">
        <button onclick="showToast('Opened routine logger'); closeAllWorkoutRecords();" class="w-full py-3 rounded-full bg-primary text-black font-bold text-xs amber-glow active:scale-95 transition-all">
          + Log New Workout Session
        </button>
      </div>
    </div>
  </div>

  <script>
    const allRecordsData = ${JSON.stringify(allRecordsData)};

    function renderAllRecords(list) {
      const container = document.getElementById('pr-records-list');
      if (list.length === 0) {
        container.innerHTML = '<div class="text-center py-6 text-outline text-xs">No records found matching filter.</div>';
        return;
      }

      container.innerHTML = list.map(item => \`
        <div class="bg-surface-low rounded-2xl p-4 border border-white/5 space-y-2.5">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-bold text-white">\${item.name}</h4>
                <span class="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold">PR \${item.pr}</span>
              </div>
              <div class="flex items-center gap-2 text-[10px] text-outline mt-0.5">
                <span class="px-2 py-0.2 rounded bg-surface-elevated">\${item.category}</span>
                <span>•</span>
                <span>\${item.equipment}</span>
                <span>•</span>
                <span>Last logged: \${item.date}</span>
              </div>
            </div>
          </div>

          <!-- History Sets Pill Grid -->
          <div class="bg-surface-card p-2.5 rounded-xl border border-white/[0.04]">
            <span class="text-[9px] font-bold text-outline uppercase block mb-1.5">Previous Session Sets:</span>
            <div class="flex flex-wrap gap-1.5">
              \${item.history.map(s => \`
                <span class="px-2.5 py-1 rounded-lg bg-surface-elevated text-xs font-semibold \${s.includes('PR') ? 'text-primary border border-primary/30' : 'text-on-surface'}">\${s}</span>
              \`).join('')}
            </div>
          </div>
        </div>
      \`).join('');
    }

    function openAllWorkoutRecords() {
      document.getElementById('all-records-modal').classList.remove('hidden');
      renderAllRecords(allRecordsData);
    }

    function closeAllWorkoutRecords() {
      document.getElementById('all-records-modal').classList.add('hidden');
    }

    // Modal filters
    let currentPrCat = 'All';
    let currentPrSearch = '';

    function filterPrs() {
      let filtered = allRecordsData;
      if (currentPrCat !== 'All') {
        filtered = filtered.filter(x => x.category.toLowerCase() === currentPrCat.toLowerCase());
      }
      if (currentPrSearch.trim() !== '') {
        const q = currentPrSearch.toLowerCase();
        filtered = filtered.filter(x => x.name.toLowerCase().includes(q) || x.category.toLowerCase().includes(q) || x.equipment.toLowerCase().includes(q));
      }
      renderAllRecords(filtered);
    }

    document.querySelectorAll('.pr-cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pr-cat-pill').forEach(b => {
          b.classList.remove('bg-primary', 'text-black');
          b.classList.add('bg-surface-elevated', 'text-outline');
        });
        btn.classList.add('bg-primary', 'text-black');
        btn.classList.remove('bg-surface-elevated', 'text-outline');
        currentPrCat = btn.getAttribute('data-cat');
        filterPrs();
      });
    });

    document.getElementById('pr-search').addEventListener('input', (e) => {
      currentPrSearch = e.target.value;
      filterPrs();
    });
  </script>
`;

  content = content.replace('</body>', `${modalHtml}\n</body>`);

  fs.writeFileSync(progressPath, content, 'utf8');
  console.log('✓ Successfully added Calorie Tracker, View All button, and PR History Modal to progress.html');
}

updateIndexHtml();
updateProgressHtml();

console.log('\nAll updates applied successfully!');
