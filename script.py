import sys
import re

with open(r'C:\Users\SUFIYAN\Desktop\Temp\gym-site\client\src\app\dashboard\workouts\page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

header_new = '''            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Workouts</h1>
              <p className="text-[11px] text-primary font-medium tracking-wide">{exercises.length} Exercises ? GIF Dataset</p>
            </div>
          </div>
          <div className="flex bg-surface-container border border-white/5 p-1 rounded-lg">
            <button onClick={() => setActiveTab('library')} className={px-3 py-1 text-xs font-bold rounded-md transition-colors }>Library</button>
            <button onClick={() => setActiveTab('queue')} className={px-3 py-1 text-xs font-bold rounded-md transition-colors }>Queue {todaysQueue.length > 0 && <span className="ml-1 bg-black text-primary px-1.5 py-0.5 rounded-full text-[9px]">{todaysQueue.length}</span>}</button>
          </div>
        </div>
      </header>'''

text = re.sub(
    r'<div>\s*<h1 className=\"text-base font-bold text-white tracking-tight\">Exercise Library</h1>\s*<p className=\"text-\[11px\] text-primary font-medium tracking-wide\">\{exercises\.length\} Exercises.*?</div>\s*</div>\s*</div>\s*</header>', 
    header_new, 
    text, 
    flags=re.DOTALL
)

main_content_old = '''      {/* MAIN CONTENT */}
      <main className="pt-20 px-5 max-w-md mx-auto space-y-6">'''

main_content_new = '''      {/* MAIN CONTENT */}
      <main className="pt-20 px-5 max-w-md mx-auto space-y-6">
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
                  <img src={/gif/} alt={item.name} className="w-full h-full object-contain p-1" loading="lazy" />
                </div>
                <div className="flex-1 py-1 flex flex-col">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">{item.target}</span>
                  <h3 className="text-sm font-bold text-white leading-tight mb-1.5 pr-2 group-hover:text-primary transition-colors">{item.name}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded border border-white/10 text-[9px] font-semibold text-outline uppercase">{item.equipment}</span>
                    </div>
                    <button onClick={(e) => removeFromQueue(idx, e)} className="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center active:scale-90 transition-all">
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      ) : (
        <>'''

text = text.replace(main_content_old, main_content_new)

bottom_old = '''          </div>
        </div>
      </main>'''

bottom_new = '''          </div>
        </div>
        </>
      )}
      </main>'''

text = text.replace(bottom_old, bottom_new)

card_button_old = '''                      <span className="px-2 py-0.5 rounded border border-white/10 text-[9px] font-semibold text-outline uppercase">{item.equipment}</span>
                    </div>
                  </div>'''

card_button_new = '''                      <span className="px-2 py-0.5 rounded border border-white/10 text-[9px] font-semibold text-outline uppercase">{item.equipment}</span>
                    </div>
                    <button onClick={(e) => addToQueue(item, e)} className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center active:scale-90 transition-all ml-auto hover:bg-primary hover:text-black">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>'''

text = text.replace(card_button_old, card_button_new)

with open(r'C:\Users\SUFIYAN\Desktop\Temp\gym-site\client\src\app\dashboard\workouts\page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

