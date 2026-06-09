import type { Project } from '../data/projects';

export default function ThreeDView({ project, completedCount, finalTestCompleted }: { project: Project; completedCount: number; finalTestCompleted: boolean }) {
  const stage = Math.min(completedCount, project.steps.length);
  return (
    <div className="rounded-3xl bg-gradient-to-b from-slate-800 to-slate-950 p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-black">3D-style Builder</h2>
        <span className="rounded-full bg-purple-400/20 px-3 py-1 text-sm">{project.meterLabel}</span>
      </div>
      <div className="relative h-[420px] overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950" style={{ perspective: '900px' }}>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-slate-800" style={{ transform: 'rotateX(65deg)', transformOrigin: 'bottom' }} />
        {project.id === 'footbridge-stream' && <Footbridge3D stage={stage} finalTestCompleted={finalTestCompleted} />}
        {project.id !== 'footbridge-stream' && <Generic3D project={project} stage={stage} finalTestCompleted={finalTestCompleted} />}
      </div>
    </div>
  );
}

function Footbridge3D({ stage, finalTestCompleted }: { stage: number; finalTestCompleted: boolean }) {
  return <>
    <div className="absolute bottom-24 left-0 right-0 h-28 bg-blue-500/80 shadow-inner" />
    <div className="absolute bottom-12 left-0 h-20 w-full bg-green-900" />
    {stage >= 2 && <div className="absolute bottom-44 left-[24%] h-10 w-[52%] rounded-xl bg-amber-800 shadow-2xl transition-all" />}
    {stage >= 3 && <div className="absolute bottom-49 left-[26%] flex w-[48%] justify-between">{Array.from({ length: 6 }).map((_, i)=><div key={i} className="h-12 w-12 rounded bg-yellow-600 shadow-lg" />)}</div>}
    {stage >= 4 && <div className="absolute bottom-44 left-[22%] h-16 w-[56%] rounded-2xl border-4 border-yellow-100/80" />}
    {stage >= 5 && <>{[25,40,55,70].map(x=><div key={x} className="absolute bottom-24 h-24 w-5 rounded bg-yellow-900 shadow-xl" style={{ left: `${x}%` }} />)}</>}
    {stage >= 6 && <div className="absolute right-8 top-8 rounded-2xl bg-emerald-400/20 p-4 font-bold text-emerald-100">Load safe: 200kg</div>}
    {finalTestCompleted && <div className="absolute bottom-60 left-[48%] text-4xl animate-pulse">🚶</div>}
  </>;
}

function Generic3D({ project, stage, finalTestCompleted }: { project: Project; stage: number; finalTestCompleted: boolean }) {
  const icon: Record<string, string> = {
    'school-playground-layout': '🏟️',
    'ferry-river-crossing': '⛴️',
    'simple-cleaning-robot': '🤖',
    'tomato-sales-market': '🍅',
    'weather-balloon-launch': '🎈',
  };
  return <div className="absolute inset-0 grid place-items-center p-6 text-center">
    <div className="text-8xl drop-shadow-2xl">{icon[project.id] ?? '🧮'}</div>
    <div className="mt-6 w-full max-w-md rounded-3xl bg-white/10 p-5">
      <p className="text-2xl font-black">{project.title}</p>
      <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-950"><div className="h-full bg-emerald-300 transition-all" style={{ width: `${finalTestCompleted ? 100 : (stage / project.steps.length) * 100}%` }} /></div>
      <p className="mt-3 text-slate-300">Objects appear as each maths step is solved.</p>
      {finalTestCompleted && <p className="mt-3 font-bold text-emerald-200">Final simulation successful.</p>}
    </div>
  </div>;
}
