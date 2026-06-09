import { Box, Glasses, Wrench } from 'lucide-react';
import type { Project } from '../data/projects';

export default function VRPreview({ project, unlockedTools }: { project: Project; unlockedTools: string[] }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-purple-950 to-slate-950 p-6">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid place-items-center rounded-3xl bg-white/10 p-8 text-center">
          <Glasses size={80} className="text-yellow-300" />
          <h2 className="mt-4 text-2xl font-black">VR Mode Preview</h2>
          <p className="mt-2 text-slate-300">Real WebXR headset mode can be added after the web MVP is stable.</p>
          <button className="btn-primary mt-5">Launch VR Mode Coming Soon</button>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl bg-white/10 p-5">
            <p className="text-sm text-emerald-300">VR Environment</p>
            <h3 className="text-2xl font-black">{project.vrEnvironment}</h3>
            <p className="mt-2 text-slate-300">{project.vrObjective}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5">
            <p className="flex items-center gap-2 font-bold text-yellow-200"><Box size={18} /> Interactive objects</p>
            <div className="mt-3 flex flex-wrap gap-2">{project.vrObjects.map(obj => <span key={obj} className="rounded-full bg-purple-400/20 px-3 py-1 text-sm">{obj}</span>)}</div>
          </div>
          <div className="rounded-3xl bg-white/10 p-5">
            <p className="flex items-center gap-2 font-bold text-emerald-200"><Wrench size={18} /> Tools unlocked in this run</p>
            <div className="mt-3 flex flex-wrap gap-2">{unlockedTools.length ? unlockedTools.map(tool => <span key={tool} className="rounded-full bg-emerald-400/20 px-3 py-1 text-sm">{tool}</span>) : <span className="text-slate-400">Solve steps to unlock VR tools.</span>}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
