import { Link } from 'react-router-dom';

const roles = [
  ['Student', '/student/dashboard', 'Continue missions and earn badges'],
  ['Teacher', '/teacher/dashboard', 'Assign missions and view reports'],
  ['School Admin', '/school-admin/dashboard', 'Monitor school-wide progress'],
  ['Sponsor', '/sponsor/dashboard', 'View impact and sponsor schools'],
  ['Mezzo Admin', '/admin/dashboard', 'Manage content and platform data'],
];

export default function LoginPage() {
  return <main className="min-h-screen bg-slate-950 px-6 py-12 text-white"><div className="mx-auto max-w-5xl"><h1 className="text-4xl font-black">Choose your account type</h1><p className="mt-3 text-slate-300">Demo login for the MVP.</p><div className="mt-8 grid gap-4 md:grid-cols-2">{roles.map(([role, path, desc])=><Link key={role} to={path} className="card p-6 hover:bg-white/15"><h2 className="text-2xl font-black">{role}</h2><p className="mt-2 text-slate-300">{desc}</p></Link>)}</div></div></main>;
}
