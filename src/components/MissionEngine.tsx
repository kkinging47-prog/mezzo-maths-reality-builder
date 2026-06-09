import { useMemo, useState } from 'react';
import { Award, CheckCircle2, LockKeyhole, Sparkles, Wrench } from 'lucide-react';
import type { Project } from '../data/projects';
import TwoDView from './TwoDView';
import ThreeDView from './ThreeDView';
import VRPreview from './VRPreview';

type ViewMode = '2d' | '3d' | 'vr';

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default function MissionEngine({ project }: { project: Project }) {
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [finalTestCompleted, setFinalTestCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const currentStep = project.steps[currentStepIndex];
  const progress = Math.round((completedStepIds.length / project.steps.length) * 100);
  const finalTestUnlocked = completedStepIds.length === project.steps.length;
  const unlockedTools = useMemo(
    () => project.steps.filter((step) => completedStepIds.includes(step.id)).map((step) => step.unlockedTool),
    [completedStepIds, project.steps],
  );

  function checkAnswer(answerOverride?: string) {
    const answer = answerOverride ?? selectedAnswer;
    if (!currentStep) return;

    if (normalize(answer) === normalize(currentStep.correctAnswer)) {
      const updated = Array.from(new Set([...completedStepIds, currentStep.id]));
      setCompletedStepIds(updated);
      setFeedback(currentStep.feedback);
      setSelectedAnswer('');
      if (currentStepIndex < project.steps.length - 1) {
        setTimeout(() => {
          setFeedback('');
          setCurrentStepIndex((index) => index + 1);
        }, 700);
      }
      return;
    }

    setFeedback('Not quite. Try again and check the maths carefully.');
  }

  function runFinalTest() {
    setFinalTestCompleted(true);
    setFeedback(project.finalSuccessMessage);
    setTimeout(() => setShowModal(true), 700);
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="card p-6">
            <p className="text-sm font-semibold text-emerald-300">{project.world} • {project.difficulty}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{project.title}</h1>
            <p className="mt-3 max-w-4xl text-slate-300">{project.scenario}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.concepts.map((concept) => (
                <span key={concept} className="rounded-full bg-purple-400/15 px-3 py-1 text-sm text-purple-100">
                  {concept}
                </span>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <p className="text-sm text-slate-300">{project.meterLabel}</p>
            <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-yellow-300 transition-all duration-700"
                style={{ width: `${finalTestCompleted ? 100 : progress}%` }}
              />
            </div>
            <p className="mt-2 text-right font-bold">{finalTestCompleted ? 100 : progress}%</p>
            <div className="mt-4 rounded-2xl bg-slate-900 p-4">
              <p className="flex items-center gap-2 font-bold text-yellow-200"><Wrench size={18} /> Unlocked tools</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {unlockedTools.length ? unlockedTools.map((tool) => (
                  <span key={tool} className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-100">{tool}</span>
                )) : <span className="text-sm text-slate-400">Tools unlock as you solve.</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          <section className="card p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {([
                ['2d', '2D View'],
                ['3d', '3D View'],
                ['vr', 'VR Preview'],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`rounded-2xl px-4 py-2 font-bold transition ${
                    viewMode === mode ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {viewMode === '2d' && <TwoDView project={project} completedCount={completedStepIds.length} finalTestCompleted={finalTestCompleted} />}
            {viewMode === '3d' && <ThreeDView project={project} completedCount={completedStepIds.length} finalTestCompleted={finalTestCompleted} />}
            {viewMode === 'vr' && <VRPreview project={project} unlockedTools={unlockedTools} />}
          </section>

          <aside className="card p-5">
            <h2 className="text-2xl font-black">Mission steps</h2>
            <div className="mt-4 space-y-2">
              {project.steps.map((step, index) => {
                const done = completedStepIds.includes(step.id);
                const active = index === currentStepIndex && !finalTestUnlocked;
                return (
                  <div key={step.id} className={`rounded-2xl border p-3 ${done ? 'border-emerald-300 bg-emerald-400/10' : active ? 'border-yellow-300 bg-yellow-300/10' : 'border-white/10 bg-white/5'}`}>
                    <p className="flex items-center gap-2 font-bold">
                      {done ? <CheckCircle2 className="text-emerald-300" size={18} /> : <LockKeyhole className="text-slate-400" size={18} />}
                      Step {index + 1}: {step.title}
                    </p>
                  </div>
                );
              })}
            </div>

            {!finalTestUnlocked ? (
              <div className="mt-5 rounded-3xl bg-slate-900 p-5">
                <p className="text-sm font-bold text-emerald-300">Current challenge</p>
                <h3 className="mt-2 text-lg font-black">{currentStep.title}</h3>
                <p className="mt-2 text-slate-300">{currentStep.question}</p>

                {currentStep.type === 'number' && (
                  <div className="mt-4 flex gap-2">
                    <input className="input" type="number" value={selectedAnswer} onChange={(event) => setSelectedAnswer(event.target.value)} placeholder="Enter answer" />
                    <button className="btn-primary" onClick={() => checkAnswer()}>Check</button>
                  </div>
                )}

                {['multiple-choice', 'command-sequence'].includes(currentStep.type) && (
                  <div className="mt-4 grid gap-2">
                    {currentStep.options?.map((option) => (
                      <button key={option} className="btn-secondary text-left" onClick={() => checkAnswer(option)}>{option}</button>
                    ))}
                  </div>
                )}

                {currentStep.type === 'yes-no' && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button className="btn-secondary" onClick={() => checkAnswer('yes')}>Yes</button>
                    <button className="btn-secondary" onClick={() => checkAnswer('no')}>No</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-3xl border border-emerald-300/40 bg-emerald-400/10 p-5">
                <p className="font-bold text-emerald-200">All maths steps completed.</p>
                <p className="mt-2 text-slate-300">Now run the practical test to complete the project.</p>
                <button className="btn-primary mt-4 w-full" onClick={runFinalTest}>{project.finalTestButton}</button>
              </div>
            )}

            {feedback && <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-100">{feedback}</div>}
          </aside>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
          <div className="card max-w-lg p-8 text-center">
            <Sparkles className="mx-auto text-yellow-300" size={48} />
            <h2 className="mt-4 text-3xl font-black">Mission Completed!</h2>
            <p className="mt-3 text-slate-300">{project.finalSuccessMessage}</p>
            <div className="mt-5 rounded-3xl bg-yellow-300/15 p-5 text-yellow-100">
              <Award className="mx-auto" />
              <p className="mt-2 text-xl font-black">{project.badge}</p>
            </div>
            <button className="btn-primary mt-6" onClick={() => setShowModal(false)}>Continue Learning</button>
          </div>
        </div>
      )}
    </div>
  );
}
