import { Link, useParams } from 'react-router-dom';
import MissionEngine from '../components/MissionEngine';
import { getProjectById } from '../data/projects';

export default function ProjectPage(){const { projectId }=useParams(); const project=getProjectById(projectId); if(!project){return <main className="min-h-screen bg-slate-950 px-6 py-16 text-white"><div className="mx-auto max-w-3xl card p-8 text-center"><h1 className="text-3xl font-black">Project not found</h1><p className="mt-3 text-slate-300">This mission is not active yet.</p><Link className="btn-primary mt-6 inline-block" to="/student/worlds">Back to Worlds</Link></div></main>;} return <MissionEngine project={project}/>;}
