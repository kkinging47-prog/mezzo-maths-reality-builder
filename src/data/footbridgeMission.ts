export type FootbridgeMaterial = 'wood' | 'block' | 'metal';

export type FootbridgeScenario = {
  riverWidthM: number;
  leftBankAllowanceM: number;
  rightBankAllowanceM: number;
  walkwayWidthM: number;
  safetyFactor: number;
  expectedPeople: number;
  assumedPersonMassKg: number;
};

export type NotebookEntry = {
  key: string;
  label: string;
  value: string;
  source: string;
};

export type FootbridgeState = {
  phase: 'briefing' | 'survey' | 'decision' | 'design' | 'build' | 'test' | 'complete';
  currentQuestion: number;
  material?: FootbridgeMaterial;
  answers: Record<string, string>;
  notebook: NotebookEntry[];
  integrity: number;
  warnings: string[];
};

export const FOOTBRIDGE_STORAGE_KEY = 'mezzo-footbridge-project-v2';

export const defaultFootbridgeScenario: FootbridgeScenario = {
  riverWidthM: 12,
  leftBankAllowanceM: 1.5,
  rightBankAllowanceM: 1.5,
  walkwayWidthM: 1.8,
  safetyFactor: 1.5,
  expectedPeople: 12,
  assumedPersonMassKg: 70,
};

export const initialFootbridgeState: FootbridgeState = {
  phase: 'briefing',
  currentQuestion: 0,
  answers: {},
  notebook: [],
  integrity: 100,
  warnings: [],
};

export const discoveryFacts = [
  { key: 'river-width', label: 'Measured river width', value: '12 m', source: 'Survey tape between the safe bank markers' },
  { key: 'bank-allowance', label: 'Required bank anchorage', value: '1.5 m on each side', source: 'Engineer Ama safety briefing' },
  { key: 'walkway-width', label: 'Minimum clear walkway', value: '1.8 m', source: 'Community access requirement' },
  { key: 'people-load', label: 'Design occupancy', value: '12 people × 70 kg', source: 'Community leader interview' },
  { key: 'safety-factor', label: 'Required safety factor', value: '1.5', source: 'Engineer Ama structural note' },
];

export const totalBridgeLengthM = (scenario: FootbridgeScenario) =>
  scenario.riverWidthM + scenario.leftBankAllowanceM + scenario.rightBankAllowanceM;

export const designPeopleLoadKg = (scenario: FootbridgeScenario) =>
  scenario.expectedPeople * scenario.assumedPersonMassKg;

export const designLoadKg = (scenario: FootbridgeScenario) =>
  designPeopleLoadKg(scenario) * scenario.safetyFactor;

export const materialProfiles = {
  wood: {
    title: 'Treated timber footbridge',
    summary: 'Fast to build and locally understandable, but it needs enough beams, bracing and protected supports.',
    minimumMainBeams: 4,
    supportSpacingM: 3,
    deckBoardWidthM: 0.2,
    beamCapacityKg: 360,
    estimatedCostPerMetre: 520,
  },
  block: {
    title: 'Block and reinforced-concrete crossing',
    summary: 'Heavy and durable, but it needs foundations, sand, cement, aggregate, water and reinforcement.',
    blocksPerMetre: 28,
    sandTripsBase: 4,
    waterLitresPerMetre: 95,
    estimatedCostPerMetre: 1240,
  },
  metal: {
    title: 'Steel-frame footbridge',
    summary: 'Strong for longer spans when properly braced and anchored, but fabrication and corrosion protection matter.',
    minimumMainGirders: 3,
    crossBeamSpacingM: 1.5,
    girderCapacityKg: 650,
    estimatedCostPerMetre: 1680,
  },
} as const;

export type FootbridgeQuestion = {
  id: string;
  title: string;
  prompt: string;
  type: 'number' | 'choice';
  options?: string[];
  unit?: string;
  hint?: string;
  evaluate: (answer: string, material: FootbridgeMaterial | undefined, scenario: FootbridgeScenario) => { correct: boolean; note: string; integrityPenalty?: number };
};

const near = (a: number, b: number, tolerance = 0.01) => Number.isFinite(a) && Math.abs(a - b) <= tolerance;

export const coreFootbridgeQuestions: FootbridgeQuestion[] = [
  {
    id: 'q1-river-width',
    title: 'Survey the river',
    prompt: 'What distance did the survey tape show between the two safe river-bank markers?',
    type: 'number', unit: 'm', hint: 'Read the survey fact in your Project Notebook.',
    evaluate: (answer, _material, s) => ({ correct: near(Number(answer), s.riverWidthM), note: `The measured river width is ${s.riverWidthM} m.`, integrityPenalty: 8 }),
  },
  {
    id: 'q2-total-length',
    title: 'Allow for anchorage',
    prompt: 'Calculate the total bridge length, including the required bank anchorage on both sides.',
    type: 'number', unit: 'm', hint: 'River width + left anchorage + right anchorage.',
    evaluate: (answer, _material, s) => ({ correct: near(Number(answer), totalBridgeLengthM(s)), note: `The bridge should be ${totalBridgeLengthM(s)} m long.`, integrityPenalty: 10 }),
  },
  {
    id: 'q3-material',
    title: 'Choose the structural route',
    prompt: 'Which construction route do you want to engineer?',
    type: 'choice', options: ['wood', 'block', 'metal'],
    evaluate: (answer) => ({ correct: ['wood', 'block', 'metal'].includes(answer), note: 'Your later calculations will now follow this construction route.' }),
  },
  {
    id: 'q4-load',
    title: 'Calculate the live load',
    prompt: 'What is the total mass of the expected 12 users before applying the safety factor?',
    type: 'number', unit: 'kg', hint: 'Number of people × assumed mass per person.',
    evaluate: (answer, _material, s) => ({ correct: near(Number(answer), designPeopleLoadKg(s)), note: `Expected people load = ${designPeopleLoadKg(s)} kg.`, integrityPenalty: 8 }),
  },
  {
    id: 'q5-design-load',
    title: 'Apply the safety factor',
    prompt: 'What design load should the bridge resist after applying the safety factor?',
    type: 'number', unit: 'kg', hint: 'People load × safety factor.',
    evaluate: (answer, _material, s) => ({ correct: near(Number(answer), designLoadKg(s)), note: `Minimum design load = ${designLoadKg(s)} kg.`, integrityPenalty: 12 }),
  },
];

export function materialQuestions(material: FootbridgeMaterial): FootbridgeQuestion[] {
  const length = totalBridgeLengthM(defaultFootbridgeScenario);
  const width = defaultFootbridgeScenario.walkwayWidthM;

  if (material === 'wood') {
    const p = materialProfiles.wood;
    return [
      { id: 'wood-q1', title: 'Main beams', prompt: 'How many treated main timber beams will you use?', type: 'number', unit: 'beams', evaluate: (a) => ({ correct: Number(a) >= p.minimumMainBeams, note: `Use at least ${p.minimumMainBeams} main beams.`, integrityPenalty: 18 }) },
      { id: 'wood-q2', title: 'Support bays', prompt: `Supports should be no more than ${p.supportSpacingM} m apart. For a ${length} m bridge, how many support intervals are required?`, type: 'number', unit: 'intervals', evaluate: (a) => ({ correct: Number(a) >= Math.ceil(length / p.supportSpacingM), note: `At least ${Math.ceil(length / p.supportSpacingM)} support intervals are required.`, integrityPenalty: 14 }) },
      { id: 'wood-q3', title: 'Deck boards across width', prompt: `Each deck board covers ${p.deckBoardWidthM} m across the width. How many board widths are needed to cover ${width} m?`, type: 'number', unit: 'boards', evaluate: (a) => ({ correct: Number(a) >= Math.ceil(width / p.deckBoardWidthM), note: `You need at least ${Math.ceil(width / p.deckBoardWidthM)} board widths across.`, integrityPenalty: 10 }) },
      { id: 'wood-q4', title: 'Beam capacity', prompt: `Each main beam is rated at ${p.beamCapacityKg} kg. With 4 beams, what nominal beam capacity is available?`, type: 'number', unit: 'kg', evaluate: (a) => ({ correct: near(Number(a), p.beamCapacityKg * 4), note: `${p.beamCapacityKg} × 4 = ${p.beamCapacityKg * 4} kg nominal beam capacity.`, integrityPenalty: 16 }) },
      { id: 'wood-q5', title: 'Timber cost estimate', prompt: `At GHS ${p.estimatedCostPerMetre} per metre of bridge, estimate the structural cost for ${length} m.`, type: 'number', unit: 'GHS', evaluate: (a) => ({ correct: near(Number(a), p.estimatedCostPerMetre * length), note: `Estimated structural cost = GHS ${p.estimatedCostPerMetre * length}.`, integrityPenalty: 5 }) },
    ];
  }

  if (material === 'block') {
    const p = materialProfiles.block;
    return [
      { id: 'block-q1', title: 'Block quantity', prompt: `The concept requires about ${p.blocksPerMetre} blocks per metre. Estimate the blocks required for ${length} m.`, type: 'number', unit: 'blocks', evaluate: (a) => ({ correct: Number(a) >= p.blocksPerMetre * length, note: `Plan for at least ${p.blocksPerMetre * length} blocks.`, integrityPenalty: 10 }) },
      { id: 'block-q2', title: 'Sand trips', prompt: `The base concrete and masonry require at least ${p.sandTripsBase} full sand trips. How many trips will you order?`, type: 'number', unit: 'trips', evaluate: (a) => ({ correct: Number(a) >= p.sandTripsBase, note: `At least ${p.sandTripsBase} sand trips are needed.`, integrityPenalty: 12 }) },
      { id: 'block-q3', title: 'Water volume', prompt: `Allow ${p.waterLitresPerMetre} litres of water per metre. How many litres are required for ${length} m?`, type: 'number', unit: 'L', evaluate: (a) => ({ correct: near(Number(a), p.waterLitresPerMetre * length), note: `Water allowance = ${p.waterLitresPerMetre * length} L.`, integrityPenalty: 8 }) },
      { id: 'block-q4', title: 'Foundation decision', prompt: 'Can a block/concrete bridge be built directly on soft river-bank soil without reinforced foundations?', type: 'choice', options: ['yes', 'no'], evaluate: (a) => ({ correct: a === 'no', note: 'Reinforced foundations and erosion protection are required.', integrityPenalty: 24 }) },
      { id: 'block-q5', title: 'Concrete route cost', prompt: `At GHS ${p.estimatedCostPerMetre} per metre, estimate the structural cost for ${length} m.`, type: 'number', unit: 'GHS', evaluate: (a) => ({ correct: near(Number(a), p.estimatedCostPerMetre * length), note: `Estimated structural cost = GHS ${p.estimatedCostPerMetre * length}.`, integrityPenalty: 5 }) },
    ];
  }

  const p = materialProfiles.metal;
  return [
    { id: 'metal-q1', title: 'Main girders', prompt: 'How many main steel girders will support the deck?', type: 'number', unit: 'girders', evaluate: (a) => ({ correct: Number(a) >= p.minimumMainGirders, note: `Use at least ${p.minimumMainGirders} main girders.`, integrityPenalty: 18 }) },
    { id: 'metal-q2', title: 'Cross-beam spacing', prompt: `Cross-beams are spaced every ${p.crossBeamSpacingM} m. How many intervals are needed along ${length} m?`, type: 'number', unit: 'intervals', evaluate: (a) => ({ correct: Number(a) >= Math.ceil(length / p.crossBeamSpacingM), note: `At least ${Math.ceil(length / p.crossBeamSpacingM)} intervals are required.`, integrityPenalty: 12 }) },
    { id: 'metal-q3', title: 'Girder capacity', prompt: `Each girder is rated at ${p.girderCapacityKg} kg. What is the nominal capacity of 3 girders?`, type: 'number', unit: 'kg', evaluate: (a) => ({ correct: near(Number(a), p.girderCapacityKg * 3), note: `${p.girderCapacityKg} × 3 = ${p.girderCapacityKg * 3} kg nominal capacity.`, integrityPenalty: 16 }) },
    { id: 'metal-q4', title: 'Corrosion protection', prompt: 'Should exposed steel members receive corrosion protection?', type: 'choice', options: ['yes', 'no'], evaluate: (a) => ({ correct: a === 'yes', note: 'Protective coating is essential for durability.', integrityPenalty: 10 }) },
    { id: 'metal-q5', title: 'Steel route cost', prompt: `At GHS ${p.estimatedCostPerMetre} per metre, estimate the structural cost for ${length} m.`, type: 'number', unit: 'GHS', evaluate: (a) => ({ correct: near(Number(a), p.estimatedCostPerMetre * length), note: `Estimated structural cost = GHS ${p.estimatedCostPerMetre * length}.`, integrityPenalty: 5 }) },
  ];
}

export const commonBuildQuestions: FootbridgeQuestion[] = [
  { id: 'q11-deck-area', title: 'Deck area', prompt: 'Calculate the deck area using the total bridge length and 1.8 m walkway width.', type: 'number', unit: 'm²', evaluate: (a, _m, s) => ({ correct: near(Number(a), totalBridgeLengthM(s) * s.walkwayWidthM), note: `Deck area = ${(totalBridgeLengthM(s) * s.walkwayWidthM).toFixed(1)} m².`, integrityPenalty: 9 }) },
  { id: 'q12-handrails', title: 'Handrails', prompt: 'How many sides of the walkway require continuous handrails?', type: 'number', unit: 'sides', evaluate: (a) => ({ correct: Number(a) === 2, note: 'Both sides require continuous handrails.', integrityPenalty: 12 }) },
  { id: 'q13-approaches', title: 'Approach safety', prompt: 'Should the two bridge approaches be level, compacted and non-slip?', type: 'choice', options: ['yes', 'no'], evaluate: (a) => ({ correct: a === 'yes', note: 'Safe approaches reduce trip and slip risks.', integrityPenalty: 10 }) },
  { id: 'q14-flood-clearance', title: 'Flood clearance', prompt: 'If the seasonal water rise is 0.8 m and you want 0.4 m extra clearance, what clearance above today’s water level should be provided?', type: 'number', unit: 'm', evaluate: (a) => ({ correct: near(Number(a), 1.2), note: '0.8 m seasonal rise + 0.4 m reserve = 1.2 m.', integrityPenalty: 14 }) },
  { id: 'q15-evacuation', title: 'Crowd rule', prompt: 'During testing, should all 12 people stand at the centre at the same time?', type: 'choice', options: ['yes', 'no'], evaluate: (a) => ({ correct: a === 'no', note: 'Loads should be introduced progressively during a controlled test.', integrityPenalty: 20 }) },
  { id: 'q16-inspection', title: 'Inspection checklist', prompt: 'How many critical zones must be checked: foundations, primary members, deck, handrails, approaches?', type: 'number', unit: 'zones', evaluate: (a) => ({ correct: Number(a) === 5, note: 'There are five critical inspection zones.', integrityPenalty: 8 }) },
  { id: 'q17-deflection', title: 'Deflection decision', prompt: 'If the bridge visibly sags excessively during a light test, should the test continue?', type: 'choice', options: ['yes', 'no'], evaluate: (a) => ({ correct: a === 'no', note: 'Stop testing and reinforce before continuing.', integrityPenalty: 25 }) },
  { id: 'q18-erosion', title: 'Erosion control', prompt: 'Should loose soil around the abutments be protected from erosion?', type: 'choice', options: ['yes', 'no'], evaluate: (a) => ({ correct: a === 'yes', note: 'Erosion control protects the supports and approaches.', integrityPenalty: 16 }) },
  { id: 'q19-signage', title: 'Safety information', prompt: 'How many load-limit signs should be placed if one is required at each end?', type: 'number', unit: 'signs', evaluate: (a) => ({ correct: Number(a) === 2, note: 'Place a load-limit sign at both ends.', integrityPenalty: 6 }) },
  { id: 'q20-test-sequence', title: 'Testing sequence', prompt: 'Choose the safest order.', type: 'choice', options: ['12-person load → visual inspection → light load', 'visual inspection → light load → progressively higher load', 'jump test → flood test → inspection'], evaluate: (a) => ({ correct: a === 'visual inspection → light load → progressively higher load', note: 'A controlled progressive test is the safe sequence.', integrityPenalty: 24 }) },
];

export function buildQuestionSet(material?: FootbridgeMaterial) {
  return [...coreFootbridgeQuestions, ...(material ? materialQuestions(material) : []), ...commonBuildQuestions];
}

export const unityBridgeContract = {
  version: 1,
  eventName: 'mezzo:footbridge-state',
  commandName: 'mezzo:unity-command',
  payload: {
    missionId: 'footbridge-stream',
    material: 'wood|block|metal',
    phase: 'briefing|survey|decision|design|build|test|complete',
    integrity: '0-100',
    answers: 'key-value map',
  },
};
