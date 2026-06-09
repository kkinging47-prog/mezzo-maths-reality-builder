import type { Project } from '../data/projects';

export default function TwoDView({ project, completedCount, finalTestCompleted }: { project: Project; completedCount: number; finalTestCompleted: boolean }) {
  const stage = Math.min(completedCount, project.steps.length);

  if (project.id === 'footbridge-stream') {
    return (
      <div className="rounded-3xl bg-sky-950 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-black">2D Blueprint: Footbridge</h2>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm">Stage {stage}/6</span>
        </div>
        <svg viewBox="0 0 760 420" className="h-[420px] w-full rounded-3xl bg-slate-900">
          <rect width="760" height="420" fill="#082f49" />
          <rect x="0" y="155" width="760" height="110" fill="#0284c7" />
          <rect x="0" y="0" width="760" height="145" fill="#166534" />
          <rect x="0" y="275" width="760" height="145" fill="#166534" />
          <text x="318" y="145" fill="white" fontSize="18">Stream: 4m</text>
          {stage >= 1 && <line x1="250" y1="125" x2="510" y2="125" stroke="#facc15" strokeWidth="5" markerEnd="url(#arrow)" />}
          {stage >= 2 && <rect x="170" y="188" width="420" height="46" fill="#a16207" rx="8" />}
          {stage >= 2 && <text x="280" y="80" fill="#fde68a" fontSize="18">1m + 4m + 1m = 6m total length</text>}
          {stage >= 3 && [185,250,315,380,445,510].map((x,i)=><rect key={i} x={x} y="190" width="58" height="42" fill="#fbbf24" stroke="#78350f" />)}
          {stage >= 4 && <rect x="185" y="178" width="362" height="68" fill="none" stroke="#fef3c7" strokeWidth="4" strokeDasharray="8 8" />}
          {stage >= 5 && [170,310,450,590].map((x)=><g key={x}><circle cx={x} cy="255" r="12" fill="#92400e"/><text x={x-13} y="285" fill="white" fontSize="13">{Math.round((x-170)/70)}m</text></g>)}
          {stage >= 6 && <text x="270" y="340" fill="#bbf7d0" fontSize="22">Load: 50kg × 4 = 200kg</text>}
          {finalTestCompleted && <><circle cx="380" cy="210" r="18" fill="#ecfeff"/><text x="305" y="385" fill="#bbf7d0" fontSize="24">Safe for crossing</text></>}
        </svg>
      </div>
    );
  }

  const labels: Record<string, string[]> = {
    'school-playground-layout': ['Playground rectangle', 'Area label added', 'Fence and safe zones complete'],
    'ferry-river-crossing': ['River route map', 'Passenger capacity checked', 'Timetable complete'],
    'simple-cleaning-robot': ['Classroom grid', 'Obstacle avoided', 'Robot route drawn'],
    'tomato-sales-market': ['Sales table', 'Profit calculated', 'Business result ready'],
    'weather-balloon-launch': ['Launch graph', 'Data points plotted', 'Prediction line complete'],
  };

  return (
    <div className="rounded-3xl bg-slate-900 p-6">
      <h2 className="text-xl font-black">2D Builder: {project.title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {(labels[project.id] ?? ['Plan', 'Build', 'Test']).map((label, index) => (
          <div key={label} className={`min-h-40 rounded-3xl border p-5 ${stage > index ? 'border-emerald-300 bg-emerald-400/15' : 'border-white/10 bg-white/5'}`}>
            <p className="font-bold">{label}</p>
            <div className="mt-4 h-24 rounded-2xl bg-gradient-to-br from-purple-500/30 to-emerald-400/20" />
          </div>
        ))}
      </div>
      {finalTestCompleted && <p className="mt-5 rounded-2xl bg-emerald-400/20 p-4 font-bold text-emerald-100">Final test passed.</p>}
    </div>
  );
}
