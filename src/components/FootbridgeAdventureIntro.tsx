import { Compass, Map, Ruler, Hammer, Truck, ShieldCheck, Sparkles } from 'lucide-react';

const sessions = [
  { icon: Compass, title: 'Explore', text: 'Meet the communities and discover why they need your help.' },
  { icon: Ruler, title: 'Survey', text: 'Measure the river and record the clues you find.' },
  { icon: Map, title: 'Plan', text: 'Use your notebook to choose a safe bridge route.' },
  { icon: Truck, title: 'Materials', text: 'Work out the wood, blocks or metal needed.' },
  { icon: Hammer, title: 'Build', text: 'Turn your calculations into a real bridge design.' },
  { icon: ShieldCheck, title: 'Test', text: 'Inspect the bridge and test its strength carefully.' },
  { icon: Sparkles, title: 'Connect!', text: 'If your design survives, the communities can cross.' },
];

export default function FootbridgeAdventureIntro() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-100 px-4 py-6 text-slate-900 sm:px-6">
      <div className="pointer-events-none absolute -left-16 top-12 h-40 w-40 rounded-full bg-yellow-200/70 blur-2xl" />
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border-4 border-white/70 bg-white/85 shadow-2xl">
          <div className="grid lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-6 sm:p-9">
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-300 px-4 py-2 text-sm font-black shadow">🌍 COMMUNITY RESCUE MISSION</div>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Can your maths build a bridge?</h1>
              <p className="mt-4 max-w-2xl text-lg font-medium text-slate-700">A river separates two communities. Children, traders and families need a safe crossing. You are the project engineer. Explore the scene, collect information, calculate carefully, choose materials and build a bridge that can survive the final test.</p>
              <div className="mt-5 rounded-3xl border-2 border-amber-300 bg-amber-50 p-4">
                <p className="font-black">🎒 Engineer's rule</p>
                <p className="mt-1 text-sm text-slate-700">The mission will not always stop you when you make a poor decision. Your bridge remembers your choices. Too many weak decisions can make it fail at the end.</p>
              </div>
            </div>

            <div className="relative min-h-[340px] overflow-hidden bg-gradient-to-b from-sky-300 to-emerald-300 p-5">
              <div className="absolute left-0 right-0 top-[46%] h-28 -skew-y-3 bg-sky-500/90" />
              <div className="absolute left-0 right-0 top-[55%] h-2 -skew-y-3 bg-white/50" />
              <div className="absolute bottom-0 left-0 h-36 w-[42%] rounded-tr-[70%] bg-emerald-600" />
              <div className="absolute bottom-0 right-0 h-40 w-[42%] rounded-tl-[70%] bg-emerald-600" />
              <div className="absolute left-[12%] top-[28%] text-6xl">🏫</div>
              <div className="absolute right-[11%] top-[24%] text-6xl">🏘️</div>
              <div className="absolute left-[20%] top-[54%] text-5xl">🧒🏾</div>
              <div className="absolute right-[19%] top-[50%] text-5xl">👧🏾</div>
              <div className="absolute left-1/2 top-[39%] -translate-x-1/2 rounded-2xl bg-white/90 px-4 py-2 text-center font-black shadow-lg">THE RIVER<br/><span className="text-sm text-sky-700">Your first clue is here!</span></div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-5 py-2 text-sm font-black text-white shadow-xl">📐 Measure • Think • Build • Test</div>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3">
            {sessions.map((session, index) => {
              const Icon = session.icon;
              return (
                <div key={session.title} className="w-48 rounded-3xl border-2 border-white/80 bg-white/90 p-4 shadow-lg">
                  <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-200"><Icon size={21}/></span><span className="text-xs font-black text-slate-400">{index + 1}/7</span></div>
                  <p className="mt-3 text-lg font-black">{session.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{session.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
