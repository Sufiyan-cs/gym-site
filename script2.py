import sys

with open(r'C:\Users\SUFIYAN\Desktop\Temp\gym-site\client\src\app\dashboard\workouts\page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the invalid </> block first
text = text.replace(
'''          </div>
        </div>
        </>
      )}
      </main>''',
'''          </div>
        </div>
      </main>'''
)

# Now apply it correctly
old_main = '''      {/* MAIN SCROLLABLE CONTAINER */}
      <main className="max-w-md mx-auto pt-20 px-5 space-y-5">'''

new_main = '''      {/* MAIN SCROLLABLE CONTAINER */}
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

text = text.replace(old_main, new_main)

old_bottom = '''          </div>
        </div>
      </main>'''

new_bottom = '''          </div>
        </div>
        </>
      )}
      </main>'''

text = text.replace(old_bottom, new_bottom)

with open(r'C:\Users\SUFIYAN\Desktop\Temp\gym-site\client\src\app\dashboard\workouts\page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
