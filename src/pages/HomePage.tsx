import { Link } from 'react-router-dom';
import { BookOpen, Rocket, School, Sparkles } from 'lucide-react';
import { projects } from '../data/projects';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-emerald-200"><Sparkles size={18}/> Practical maths innovation</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Mezzo Maths Reality Builder</h1>
            <p className="mt-5 text-2xl font-bold text-yellow-200">Where Mathematics Becomes Reality.</p>
            <p className="mt-5 text-lg text-slate-300">Students solve real-life maths problems and use each answer to build bridges, playgrounds, ferries, robots, markets, and science missions.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link to="/login" className="btn-primary">Enter App</Link><Link to="/student/worlds" className="btn-secondary">Explore Worlds</Link></div>
          </div>
          <div className="card p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {[['Build with equations', BookOpen], ['Explore in 2D/3D', Rocket], ['Track progress', School], ['Future VR learning', Sparkles]].map(([title, Icon]) => {
                const I = Icon as typeof Sparkles;
                return <div key={String(title)} className="rounded-3xl bg-white/10 p-5"><I className="text-emerald-300"/><p className="mt-4 font-black">{String(title)}</p></div>;
              })}
            </div>
          </div>
        </div>
        <h2 className="mt-16 text-3xl font-black">Maths World Adventure</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => <Link key={project.id} to={`/student/project/${project.id}`} className="card p-5 transition hover:-translate-y-1 hover:bg-white/15"><p className="text-sm text-emerald-300">{project.world}</p><h3 className="mt-2 text-xl font-black">{project.title}</h3><p className="mt-2 text-sm text-slate-300">{project.concepts.join(' • ')}</p></Link>)}
        </div>
      </section>
    </main>
  );
}
