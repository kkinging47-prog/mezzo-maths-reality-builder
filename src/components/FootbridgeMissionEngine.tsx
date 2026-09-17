import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, CheckCircle2, Construction, RotateCcw, ShieldCheck, Users } from 'lucide-react';
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

type UnityCommand = {
  type: 'FOOTBRIDGE_STATE' | 'FOOTBRIDGE_TEST';
  payload: unknown;
};

function sendUnityCommand(command: UnityCommand) {
  window.dispatchEvent(new CustomEvent('mezzo:unity-command', { detail: command }));
  const unity = (window as Window & { unityInstance?: { SendMessage?: (go: string, method: string, payload: string) => void } }).unityInstance;
  unity?.SendMessage?.('MezzoBridgeController', 'ReceiveWebCommand', JSON.stringify(command));
}

function loadSaved(): FootbridgeState {
  try {
    const raw = localStorage.getItem(FOOTBRIDGE_STORAGE_KEY);
    if (!raw) return initialFootbridgeState;
    return { ...initialFootbridgeState, ...JSON.parse(raw) } as FootbridgeState;
  } catch {
    return initialFootbridgeState;
  }
}

export default function FootbridgeMissionEngine() {
  const [state, setState] = useState<FootbridgeState>(() => loadSaved());
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [discovered, setDiscovered] = useState<string[]>(() => loadSaved().notebook.map((entry) => entry.key));
  const [testResult, setTestResult] = useState<'idle' | 'pass' | 'fail'>('idle');

  const questions = useMemo(() => buildQuestionSet(state.material), [state.material]);
  const question = questions[Math.min(state.currentQuestion, questions.length - 1)];
  const allFactsDiscovered = discoveryFacts.every((fact) => discovered.includes(fact.key));
  const answeredCount = Object.keys(state.answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  useEffect(() => {
    localStorage.setItem(FOOTBRIDGE_STORAGE_KEY, JSON.stringify(state));
    const payload = { missionId: 'footbridge-stream', ...state };
    window.dispatchEvent(new CustomEvent('mezzo:footbridge-state', { detail: payload }));
    sendUnityCommand({ type: 'FOOTBRIDGE_STATE', payload });
  }, [state]);

  function discoverFact(key: string) {
    const fact = discoveryFacts.find((item) => item.key === key);
    if (!fact || discovered.includes(key)) return;
    setDiscovered((items) => [...items, key]);
    setState((current) => ({ ...current, notebook: [...current.notebook, fact], phase: 'survey' }));
  }

  function submit(answer: string) {
    if (!question) return;
    if (question.id === 'q3-material') {
      setState((current) => ({ ...current, material: answer as FootbridgeMaterial }));
    }
    const result = question.evaluate(answer, question.id === 'q3-material' ? answer as FootbridgeMaterial : state.material, defaultFootbridgeScenario);
    const penalty = result.correct ? 0 : (result.integrityPenalty ?? 5);
    setState((current) => ({
      ...current,
      answers: { ...current.answers, [question.id]: answer },
      integrity: Math.max(0, current.integrity - penalty),
      warnings: result.correct ? current.warnings : [...current.warnings, `${question.title}: ${result.note}`],
      currentQuestion: Math.min(current.currentQuestion + 1, buildQuestionSet(question.id === 'q3-material' ? answer as FootbridgeMaterial : current.material).length),
      phase: current.currentQuestion >= 14 ? 'build' : current.currentQuestion >= 5 ? 'design' : current.currentQuestion >= 2 ? 'decision' : 'survey',
    }));
    setFeedback(result.correct ? `✓ ${result.note}` : `⚠ ${result.note} The project can continue, but this mistake weakens the final bridge.`);
    setInput('');
  }

  function runFinalTest() {
    const completed = state.currentQuestion >= questions.length;
    const pass = completed && state.integrity >= 70 && Boolean(state.material);
    setTestResult(pass ? 'pass' : 'fail');
    setState((current) => ({ ...current, phase: pass ? 'complete' : 'test' }));
    sendUnityCommand({ type: 'FOOTBRIDGE_TEST', payload: { pass, integrity: state.integrity, material: state.material } });
  }

  function resetMission() {
    localStorage.removeItem(FOOTBRIDGE_STORAGE_KEY);
    setState(initialFootbridgeState);
    setDiscovered([]);
    setFeedback('');
    setTestResult('idle');
    setInput('');
  }

  const material = state.material ? materialProfiles[state.material] : null;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="card overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">Mezzo Virtual Reality Project</p>
              <h1 className="mt-2 text-3xl font-black sm:text-5xl">Build the Community Footbridge</h1>
              <p className="mt-4 max-w-4xl text-slate-300">Two communities are separated by a river. Your team must survey the crossing, collect the missing information, choose a construction route, calculate quantities and loads, build the bridge, and finally test it. Wrong decisions are not blocked automatically: they reduce structural integrity and may cause the finished bridge to fail.</p>
            </div>
            <button onClick={resetMission} className="btn-secondary flex items-center gap-2"><RotateCcw size={18}/> Restart project</button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">Bridge length</p><p className="mt-1 text-2xl font-black">{totalBridgeLengthM(defaultFootbridgeScenario)} m</p></div>
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">Integrity</p><p className={`mt-1 text-2xl font-black ${state.integrity >= 70 ? 'text-emerald-300' : 'text-amber-300'}`}>{state.integrity}%</p></div>
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">Questions</p><p className="mt-1 text-2xl font-black">{Math.min(state.currentQuestion, questions.length)}/{questions.length}</p></div>
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">Route</p><p className="mt-1 text-xl font-black capitalize">{state.material ?? 'Not chosen'}</p></div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }}/></div>
        </section>

        {!allFactsDiscovered && (
          <section className="card p-6 sm:p-8">
            <div className="flex items-center gap-3"><Users className="text-cyan-300"/><div><h2 className="text-2xl font-black">Scene 1 — Survey and interviews</h2><p className="text-slate-300">Do not calculate yet. First collect the information hidden in the environment.</p></div></div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {discoveryFacts.map((fact) => {
                const found = discovered.includes(fact.key);
                return <button key={fact.key} disabled={found} onClick={() => discoverFact(fact.key)} className={`rounded-3xl border p-5 text-left transition ${found ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <p className="text-sm font-bold text-cyan-200">{found ? 'Recorded in notebook' : 'Explore / ask'}</p>
                  <p className="mt-2 text-lg font-black">{fact.label}</p>
                  <p className="mt-2 text-sm text-slate-400">{found ? `${fact.value} — ${fact.source}` : 'Click to inspect the scene or speak to the relevant character.'}</p>
                </button>;
              })}
            </div>
          </section>
        )}

        {allFactsDiscovered && state.currentQuestion < questions.length && (
          <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="card p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-wider text-yellow-300">Decision {state.currentQuestion + 1} of {questions.length}</p>
              <h2 className="mt-2 text-3xl font-black">{question.title}</h2>
              <p className="mt-4 text-lg text-slate-200">{question.prompt}</p>
              {question.hint && <p className="mt-3 rounded-2xl bg-cyan-400/10 p-4 text-sm text-cyan-100">Hint: {question.hint}</p>}

              {question.type === 'number' ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <div className="flex flex-1 items-center rounded-2xl border border-white/10 bg-slate-950 px-4">
                    <input className="w-full bg-transparent py-4 text-lg outline-none" type="number" step="any" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Enter your calculation"/>
                    {question.unit && <span className="text-slate-400">{question.unit}</span>}
                  </div>
                  <button disabled={!input.trim()} onClick={()=>submit(input)} className="btn-primary">Submit decision</button>
                </div>
              ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {question.options?.map((option)=><button key={option} onClick={()=>submit(option)} className="btn-secondary capitalize">{option}</button>)}
                </div>
              )}
              {feedback && <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm">{feedback}</div>}
            </div>

            <aside className="card p-6">
              <div className="flex items-center gap-2"><BookOpen className="text-emerald-300"/><h3 className="text-xl font-black">Project Notebook</h3></div>
              <div className="mt-4 space-y-3">
                {state.notebook.map((entry)=><div key={entry.key} className="rounded-2xl bg-white/5 p-3"><p className="text-sm font-bold">{entry.label}</p><p className="text-emerald-200">{entry.value}</p><p className="mt-1 text-xs text-slate-500">{entry.source}</p></div>)}
              </div>
              {material && <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4"><p className="font-black text-yellow-200">{material.title}</p><p className="mt-2 text-sm text-slate-300">{material.summary}</p></div>}
            </aside>
          </section>
        )}

        {allFactsDiscovered && state.currentQuestion >= questions.length && (
          <section className="card p-8 text-center">
            <Construction className="mx-auto text-yellow-300" size={54}/>
            <h2 className="mt-4 text-3xl font-black">Construction complete. Test the bridge.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-300">The simulator will use the accumulated integrity from every decision. A project with serious measurement, load, foundation or safety errors can reach the end and still fail.</p>
            <button onClick={runFinalTest} className="btn-primary mt-6 px-10">Run progressive load test</button>
          </section>
        )}

        {testResult !== 'idle' && (
          <section className={`rounded-3xl border p-8 text-center ${testResult === 'pass' ? 'border-emerald-300/50 bg-emerald-400/10' : 'border-red-300/50 bg-red-400/10'}`}>
            {testResult === 'pass' ? <ShieldCheck className="mx-auto text-emerald-300" size={64}/> : <AlertTriangle className="mx-auto text-red-300" size={64}/>}
            <h2 className="mt-4 text-4xl font-black">{testResult === 'pass' ? 'Bridge passes the controlled test' : 'Bridge fails the controlled test'}</h2>
            <p className="mx-auto mt-3 max-w-3xl text-slate-200">{testResult === 'pass' ? 'Your design retained enough structural integrity and completed the required calculations and safety decisions.' : 'The bridge has accumulated too many weak decisions. Review the warnings and redesign before allowing community use.'}</p>
            <p className="mt-4 text-2xl font-black">Final integrity: {state.integrity}%</p>
          </section>
        )}

        {state.warnings.length > 0 && (
          <section className="card p-6">
            <div className="flex items-center gap-2"><AlertTriangle className="text-amber-300"/><h3 className="text-xl font-black">Engineering log</h3></div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">{state.warnings.map((warning,index)=><div key={`${warning}-${index}`} className="rounded-2xl bg-amber-300/10 p-3 text-sm text-amber-100">{warning}</div>)}</div>
          </section>
        )}

        <section className="rounded-3xl border border-cyan-300/20 bg-cyan-400/5 p-5 text-sm text-slate-300">
          <p className="flex items-center gap-2 font-bold text-cyan-100"><CheckCircle2 size={18}/> Unity-ready integration</p>
          <p className="mt-2">Every state update emits <code>mezzo:footbridge-state</code>. Commands are also sent to a Unity WebGL instance, when present, through <code>MezzoBridgeController.ReceiveWebCommand</code>. This lets the same maths and decision engine drive a future immersive Unity scene without rewriting the learning logic.</p>
        </section>
      </div>
    </main>
  );
}
