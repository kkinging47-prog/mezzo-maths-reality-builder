import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Construction, Lightbulb, Map, RotateCcw, ShieldCheck, Sparkles, Users } from 'lucide-react';
import {
  FOOTBRIDGE_STORAGE_KEY,
  buildQuestionSet,
  defaultFootbridgeScenario,
  discoveryFacts,
  initialFootbridgeState,
  materialProfiles,
  totalBridgeLengthM,
  type FootbridgeMaterial,
  type FootbridgeState,
} from '../data/footbridgeMission';

type UnityCommand = { type: 'FOOTBRIDGE_STATE' | 'FOOTBRIDGE_TEST'; payload: unknown };
type Screen = 'welcome' | 'explore' | 'notebook' | 'challenge' | 'test';

const missionArt: Record<number, string> = {
  1: '/footbridge/mission-1-meet-the-communities.png',
  2: '/footbridge/mission-2-explore-the-river.png',
  3: '/footbridge/mission-3-choose-your-bridge.png',
  4: '/footbridge/mission-4-get-the-materials.png',
  5: '/footbridge/mission-5-plan-money-deliveries.png',
  6: '/footbridge/mission-6-build-and-check.png',
  7: '/footbridge/mission-7-test-fix-celebrate.png',
};

const missionMeta = [
  { title: 'Meet the Communities', emoji: '🏘️', guide: 'Ama', message: 'Adom and Nkabom need your help. Explore first — good project teams never calculate before they understand the problem.' },
  { title: 'Explore the River', emoji: '🌊', guide: 'Kojo', message: 'Now we investigate the crossing. Use the facts you collected and work out what the project really needs.' },
  { title: 'Choose Your Bridge', emoji: '🧩', guide: 'Ama', message: 'Three ideas are on the planning table. Your choice will change the materials and maths that come next.' },
  { title: 'Get the Materials', emoji: '📦', guide: 'Kojo', message: 'Turn your measurements into real quantities. What you calculate now is what the project team will receive.' },
  { title: 'Plan Money & Deliveries', emoji: '🚚', guide: 'Ama', message: 'A good plan must fit the people, the journey and the available resources. Check every number carefully.' },
  { title: 'Build & Check', emoji: '🛠️', guide: 'Kojo', message: 'The bridge is taking shape! Inspect what your earlier decisions have produced before anyone uses it.' },
  { title: 'Test, Fix & Celebrate', emoji: '🎉', guide: 'Ama', message: 'This is the big moment. Test carefully, learn from any problem, improve the project and connect the communities.' },
];

function sendUnityCommand(command: UnityCommand) {
  window.dispatchEvent(new CustomEvent('mezzo:unity-command', { detail: command }));
  const unity = (window as Window & { unityInstance?: { SendMessage?: (go: string, method: string, payload: string) => void } }).unityInstance;
  unity?.SendMessage?.('MezzoBridgeController', 'ReceiveWebCommand', JSON.stringify(command));
}

function loadSaved(): FootbridgeState {
  try {
    const raw = localStorage.getItem(FOOTBRIDGE_STORAGE_KEY);
    return raw ? { ...initialFootbridgeState, ...JSON.parse(raw) } as FootbridgeState : initialFootbridgeState;
  } catch { return initialFootbridgeState; }
}

function missionForQuestion(index: number, total: number) {
  if (index <= 1) return 2;
  if (index === 2) return 3;
  if (index <= 9) return 4;
  if (index <= Math.max(10, total - 8)) return 5;
  if (index < total - 2) return 6;
  return 7;
}

function SceneArt({ mission }: { mission: number }) {
  const [missing, setMissing] = useState(false);
  const meta = missionMeta[mission - 1];
  if (!missing) return <img src={missionArt[mission]} onError={() => setMissing(true)} alt={`${meta.title} adventure scene`} className="h-full min-h-[260px] w-full object-cover" />;
  return (
    <div className="flex min-h-[260px] items-center justify-center bg-gradient-to-br from-cyan-500/25 via-emerald-500/20 to-amber-400/20 p-8 text-center">
      <div><div className="text-7xl">{meta.emoji}</div><p className="mt-4 text-2xl font-black">{meta.title}</p><p className="mt-2 text-sm text-slate-300">Adventure artwork ready to be placed in this scene.</p></div>
    </div>
  );
}

export default function FootbridgeMissionEngine() {
  const [state, setState] = useState<FootbridgeState>(() => loadSaved());
  const [screen, setScreen] = useState<Screen>(() => loadSaved().notebook.length ? 'challenge' : 'welcome');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [discovered, setDiscovered] = useState<string[]>(() => loadSaved().notebook.map(e => e.key));
  const [testResult, setTestResult] = useState<'idle' | 'pass' | 'fail'>('idle');
  const [showHint, setShowHint] = useState(false);

  const questions = useMemo(() => buildQuestionSet(state.material), [state.material]);
  const question = questions[Math.min(state.currentQuestion, questions.length - 1)];
  const allFactsDiscovered = discoveryFacts.every(f => discovered.includes(f.key));
  const mission = state.currentQuestion >= questions.length ? 7 : missionForQuestion(state.currentQuestion, questions.length);
  const meta = missionMeta[mission - 1];
  const answeredCount = Object.keys(state.answers).length;
  const progress = Math.min(100, Math.round((answeredCount / questions.length) * 100));

  useEffect(() => {
    localStorage.setItem(FOOTBRIDGE_STORAGE_KEY, JSON.stringify(state));
    const payload = { missionId: 'footbridge-stream', ...state };
    window.dispatchEvent(new CustomEvent('mezzo:footbridge-state', { detail: payload }));
    sendUnityCommand({ type: 'FOOTBRIDGE_STATE', payload });
  }, [state]);

  function discoverFact(key: string) {
    const fact = discoveryFacts.find(f => f.key === key);
    if (!fact || discovered.includes(key)) return;
    setDiscovered(items => [...items, key]);
    setState(current => ({ ...current, notebook: [...current.notebook, fact], phase: 'survey' }));
  }

  function submit(answer: string) {
    if (!question) return;
    const selectedMaterial = question.id === 'q3-material' ? answer as FootbridgeMaterial : state.material;
    const result = question.evaluate(answer, selectedMaterial, defaultFootbridgeScenario);
    const penalty = result.correct ? 0 : (result.integrityPenalty ?? 5);
    setState(current => ({
      ...current,
      material: question.id === 'q3-material' ? selectedMaterial : current.material,
      answers: { ...current.answers, [question.id]: answer },
      integrity: Math.max(0, current.integrity - penalty),
      warnings: result.correct ? current.warnings : [...current.warnings, `${question.title}: ${result.note}`],
      currentQuestion: Math.min(current.currentQuestion + 1, buildQuestionSet(selectedMaterial).length),
      phase: current.currentQuestion >= 14 ? 'build' : current.currentQuestion >= 5 ? 'design' : current.currentQuestion >= 2 ? 'decision' : 'survey',
    }));
    setFeedback(result.correct ? `🌟 Nice work! ${result.note}` : `🧠 Good try. ${result.note} Your decision has been recorded, so you can see its effect later.`);
    setInput('');
    setShowHint(false);
  }

  function runFinalTest() {
    const pass = state.currentQuestion >= questions.length && state.integrity >= 70 && Boolean(state.material);
    setTestResult(pass ? 'pass' : 'fail');
    setState(current => ({ ...current, phase: pass ? 'complete' : 'test' }));
    sendUnityCommand({ type: 'FOOTBRIDGE_TEST', payload: { pass, integrity: state.integrity, material: state.material } });
  }

  function resetMission() {
    localStorage.removeItem(FOOTBRIDGE_STORAGE_KEY);
    setState(initialFootbridgeState); setDiscovered([]); setFeedback(''); setTestResult('idle'); setInput(''); setScreen('welcome'); setShowHint(false);
  }

  const material = state.material ? materialProfiles[state.material] : null;

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Mezzo Maths Adventure</p><p className="font-black">Connecting Communities</p></div>
          <button onClick={resetMission} className="rounded-xl bg-white/10 p-2 text-slate-300 hover:bg-white/15" title="Restart adventure"><RotateCcw size={18}/></button>
        </header>

        <div className="overflow-hidden rounded-full bg-slate-800"><div className="h-2 bg-emerald-400 transition-all" style={{ width: `${progress}%` }}/></div>

        {screen === 'welcome' && (
          <section className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-900 shadow-2xl">
            <div className="grid lg:grid-cols-2">
              <SceneArt mission={1}/>
              <div className="p-6 sm:p-10">
                <p className="text-sm font-black uppercase tracking-widest text-yellow-300">Your adventure begins</p>
                <h1 className="mt-3 text-4xl font-black sm:text-5xl">Can you connect Adom & Nkabom?</h1>
                <p className="mt-5 text-lg leading-8 text-slate-200">A river separates two communities. Children travel to school, farmers carry produce and traders travel to market. Your team has been invited to investigate whether a new crossing can help.</p>
                <div className="mt-6 rounded-3xl bg-cyan-400/10 p-5"><p className="font-black text-cyan-200">👧 Ama says:</p><p className="mt-2 text-slate-200">“Don’t rush to calculate! First, let’s meet the people, explore the river and collect the clues we need.”</p></div>
                <button onClick={() => setScreen('explore')} className="btn-primary mt-7 flex items-center gap-2">Start exploring <ArrowRight size={18}/></button>
              </div>
            </div>
          </section>
        )}

        {screen === 'explore' && (
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]"><SceneArt mission={1}/><div className="p-6 sm:p-8">
              <div className="flex items-center gap-3"><Users className="text-cyan-300"/><div><p className="text-sm font-bold text-cyan-200">Mission 1</p><h2 className="text-3xl font-black">Meet the Communities</h2></div></div>
              <p className="mt-4 text-slate-300">Tap each clue. The information you discover is automatically saved in your Project Notebook. You will need these facts later.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {discoveryFacts.map(f => { const found = discovered.includes(f.key); return <button key={f.key} disabled={found} onClick={() => discoverFact(f.key)} className={`rounded-2xl border p-4 text-left ${found ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}><p className="text-xs font-black uppercase text-cyan-200">{found ? '✓ Clue collected' : '🔎 Explore / ask'}</p><p className="mt-1 font-black">{f.label}</p>{found && <p className="mt-2 text-sm text-emerald-100">{f.value}</p>}</button>; })}
              </div>
              {allFactsDiscovered && <button onClick={() => setScreen('notebook')} className="btn-primary mt-6 flex items-center gap-2">Open my notebook <BookOpen size={18}/></button>}
            </div></div>
          </section>
        )}

        {screen === 'notebook' && (
          <section className="rounded-[2rem] border border-amber-300/20 bg-slate-900 p-6 sm:p-9">
            <div className="flex items-center gap-3"><BookOpen className="text-amber-300"/><div><p className="text-sm font-bold text-amber-200">Project Notebook</p><h2 className="text-3xl font-black">Your clues are ready</h2></div></div>
            <p className="mt-3 text-slate-300">You do not need to memorise these. Your notebook travels with you through the whole adventure.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{state.notebook.map(e => <div key={e.key} className="rounded-2xl bg-white/5 p-4"><p className="text-sm text-slate-400">{e.label}</p><p className="mt-1 text-xl font-black text-emerald-200">{e.value}</p><p className="mt-2 text-xs text-slate-500">Found from: {e.source}</p></div>)}</div>
            <button onClick={() => setScreen('challenge')} className="btn-primary mt-7 flex items-center gap-2">Go to the river team <ArrowRight size={18}/></button>
          </section>
        )}

        {screen === 'challenge' && allFactsDiscovered && state.currentQuestion < questions.length && (
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative"><SceneArt mission={mission}/><div className="absolute inset-x-4 bottom-4 rounded-2xl bg-slate-950/85 p-4 backdrop-blur"><p className="font-black text-yellow-200">{meta.guide} says:</p><p className="mt-1 text-sm text-white">{meta.message}</p></div></div>
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-black text-emerald-300">{meta.emoji} Mission {mission}</p><h2 className="text-2xl font-black">{meta.title}</h2></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">Adventure progress {progress}%</span></div>
                <div className="mt-6 rounded-3xl bg-white/5 p-5"><p className="text-xs font-black uppercase tracking-wider text-yellow-300">Your task</p><h3 className="mt-2 text-2xl font-black">{question.title}</h3><p className="mt-3 text-lg leading-7 text-slate-200">{question.prompt}</p></div>

                <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/5 p-4"><p className="flex items-center gap-2 font-black text-cyan-100"><BookOpen size={17}/> Information you can use</p><div className="mt-3 flex flex-wrap gap-2">{state.notebook.map(e => <span key={e.key} className="rounded-full bg-white/10 px-3 py-2 text-xs"><b>{e.label}:</b> {e.value}</span>)}</div></div>

                {question.hint && <div className="mt-4"><button onClick={() => setShowHint(v => !v)} className="flex items-center gap-2 text-sm font-bold text-amber-200"><Lightbulb size={17}/>{showHint ? 'Hide hint' : 'Need a hint?'}</button>{showHint && <p className="mt-2 rounded-2xl bg-amber-300/10 p-4 text-sm text-amber-100">{question.hint}</p>}</div>}

                {question.type === 'number' ? <div className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="flex flex-1 items-center rounded-2xl border-2 border-cyan-300/30 bg-white px-4"><input style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a', caretColor: '#0891b2' }} className="w-full bg-white py-4 text-xl font-black outline-none placeholder:text-slate-400" type="number" step="any" value={input} onChange={e => setInput(e.target.value)} placeholder="Type your answer"/><span className="font-bold text-slate-500">{question.unit}</span></div><button disabled={!input.trim()} onClick={() => submit(input)} className="btn-primary">Check my decision</button></div> : <div className="mt-5 grid gap-3 sm:grid-cols-3">{question.options?.map(o => <button key={o} onClick={() => submit(o)} className="btn-secondary capitalize">{o}</button>)}</div>}
                {feedback && <div className="mt-5 rounded-2xl bg-emerald-400/10 p-4 text-sm text-emerald-50">{feedback}</div>}
              </div>
            </div>
          </section>
        )}

        {screen === 'challenge' && state.currentQuestion >= questions.length && (
          <section className="overflow-hidden rounded-[2rem] border border-yellow-300/20 bg-slate-900"><div className="grid lg:grid-cols-2"><SceneArt mission={7}/><div className="p-8 text-center lg:text-left"><Construction className="text-yellow-300" size={48}/><h2 className="mt-4 text-4xl font-black">The bridge is ready for testing!</h2><p className="mt-3 text-slate-300">Your investigation, measurements and decisions have all reached this moment. Let’s see how they work together.</p><button onClick={() => setScreen('test')} className="btn-primary mt-6">Go to the test site</button></div></div></section>
        )}

        {screen === 'test' && (
          <section className="rounded-[2rem] border border-white/10 bg-slate-900 p-7 text-center sm:p-10">
            <Sparkles className="mx-auto text-yellow-300" size={52}/><p className="mt-3 text-sm font-black uppercase tracking-widest text-yellow-200">Final Mission</p><h2 className="mt-2 text-4xl font-black">Test, learn and improve</h2><p className="mx-auto mt-4 max-w-2xl text-slate-300">The simulation checks the decisions you made during the adventure. This is educational simulation data only — not real bridge engineering guidance.</p>
            {testResult === 'idle' && <button onClick={runFinalTest} className="btn-primary mt-7 px-10">Start the controlled test</button>}
            {testResult !== 'idle' && <div className={`mx-auto mt-7 max-w-2xl rounded-3xl border p-7 ${testResult === 'pass' ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-amber-300/40 bg-amber-400/10'}`}>{testResult === 'pass' ? <ShieldCheck className="mx-auto text-emerald-300" size={58}/> : <AlertTriangle className="mx-auto text-amber-300" size={58}/>}<h3 className="mt-3 text-3xl font-black">{testResult === 'pass' ? 'Adom and Nkabom are connected! 🎉' : 'The test team spotted a problem'}</h3><p className="mt-3 text-slate-200">{testResult === 'pass' ? 'Your decisions worked together well enough for the simulated project to pass.' : 'This is part of the adventure. Review your earlier decisions, find what weakened the project and improve it.'}</p></div>}
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3 text-xs text-slate-400"><span className="flex items-center gap-2"><Map size={15}/> One scene at a time • autosaved</span><span>Educational simulation only</span></div>
      </div>
    </main>
  );
}
