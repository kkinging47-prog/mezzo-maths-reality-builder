import { buildQuestionSet, defaultFootbridgeScenario, projectConsequences, projectMath, type FootbridgeState } from './footbridgeMission';

export type CompetencyReport = {
  mathematicalAccuracy:number;
  measurementData:number;
  planningReasoning:number;
  resourceBudget:number;
  inspectionDiagnosis:number;
  environmentalSafety:number;
  redesignReflection:number;
  total:number;
  correct:number;
  assessed:number;
  misconceptions:string[];
};

const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,n));
const pct=(a:number,b:number)=>b?Math.round(a/b*100):0;

export function buildCompetencyReport(state:FootbridgeState):CompetencyReport {
  const qs=buildQuestionSet(state.material);
  const evaluated=qs.filter(q=>state.answers[q.id]!==undefined).map(q=>({q,ok:q.evaluate(state.answers[q.id],state.material,defaultFootbridgeScenario).correct}));
  const correct=evaluated.filter(x=>x.ok).length, assessed=evaluated.length;
  const scoreFor=(ids:string[])=>{const rows=evaluated.filter(x=>ids.some(id=>x.q.id.includes(id)));return pct(rows.filter(x=>x.ok).length,rows.length)};
  const math=pct(correct,assessed);
  const measurement=scoreFor(['q1-distance','q2-percent','q3-river','q4-scale']);
  const planning=scoreFor(['q5-material','modules','area']);
  const resources=scoreFor(['deck','connections','allowance','packages','secondary','cost','transport','labour','project-budget']);
  const inspection=scoreFor(['inspection']);
  const environment=scoreFor(['flood-check']);
  const diagnosisAttempts=state.diagnosisAttempts||0, redesigns=state.redesignCount||0;
  const redesign=redesigns?clamp(100-Math.max(0,diagnosisAttempts-redesigns)*10):100;
  const weighted=Math.round(math*.30+measurement*.15+planning*.15+resources*.15+inspection*.10+environment*.05+redesign*.10);
  const misconceptions:string[]=[];
  evaluated.filter(x=>!x.ok).forEach(({q})=>{
    const id=q.id;
    const tag=id.includes('percent')?'PERCENTAGE_ERROR':id.includes('scale')?'SCALE_ERROR':id.includes('river')?'MEASUREMENT_ERROR':id.includes('area')?'AREA_ERROR':id.includes('packages')?'ROUNDING_PACK_SIZE_ERROR':id.includes('transport')?'TRANSPORT_CAPACITY_ERROR':id.includes('budget')||id.includes('cost')?'BUDGET_TOTAL_ERROR':id.includes('flood')?'ENVIRONMENTAL_REASONING_ERROR':id.includes('deck')||id.includes('connections')||id.includes('allowance')?'PROCUREMENT_ERROR':'LOGICAL_REASONING_ERROR';
    if(!misconceptions.includes(tag))misconceptions.push(tag);
  });
  return {mathematicalAccuracy:Math.round(math*.30),measurementData:Math.round(measurement*.15),planningReasoning:Math.round(planning*.15),resourceBudget:Math.round(resources*.15),inspectionDiagnosis:Math.round(inspection*.10),environmentalSafety:Math.round(environment*.05),redesignReflection:Math.round(redesign*.10),total:weighted,correct,assessed,misconceptions};
}

export function buildFinalProjectReport(state:FootbridgeState, reflection='') {
  const c=projectConsequences(state), m=state.material?projectMath(state.material):null, competency=buildCompetencyReport(state);
  const distanceSaved=defaultFootbridgeScenario.originalJourneyKm-defaultFootbridgeScenario.newJourneyM/1000;
  const outcome=state.phase==='complete'?(state.redesignCount||0)>0?'APPROVED AFTER REDESIGN':c.overBudget?'STRUCTURALLY SUCCESSFUL – OVER BUDGET':'PROJECT APPROVED':!c.constructionComplete?'CONSTRUCTION INCOMPLETE':c.floodRisk?'ENVIRONMENTAL TEST FAILURE':'MODIFICATION REQUIRED';
  return {
    projectType:'CONNECTING_COMMUNITIES_FOOTBRIDGE',
    outcome,
    bridgeSystem:state.material||'not selected',
    communityProblem:state.notebook.find(x=>x.key==='problem')?.value||'',
    measuredRiverSpan:defaultFootbridgeScenario.riverWidthM,
    requiredWidth:defaultFootbridgeScenario.walkwayWidthM,
    peakUsers:defaultFootbridgeScenario.expectedPeople,
    floodRise:defaultFootbridgeScenario.floodRiseM,
    originalJourneyKm:defaultFootbridgeScenario.originalJourneyKm,
    newJourneyKm:defaultFootbridgeScenario.newJourneyM/1000,
    distanceSavedKm:Number(distanceSaved.toFixed(2)),
    percentageReduction:Number((distanceSaved/defaultFootbridgeScenario.originalJourneyKm*100).toFixed(1)),
    modules:m?.modules,deckArea:m?.area,packages:m?.packages,transportTrips:m?.trips,
    materialCost:m?.materialCost,transportCost:m?.transportCost,labourCost:m?.labourCost,contingency:m?.contingency,totalCost:m?.total,communityBudget:defaultFootbridgeScenario.communityBudget,
    issues:c.issues,
    diagnosisAttempts:state.diagnosisAttempts||0,
    redesignCount:state.redesignCount||0,
    redesignHistory:state.redesignHistory||[],
    competency,
    reflection,
    completedAt:new Date().toISOString()
  };
}

export function emitTeacherAnalytics(state:FootbridgeState, reflection='') {
  const report=buildFinalProjectReport(state,reflection);
  window.dispatchEvent(new CustomEvent('mezzo:footbridge-analytics',{detail:report}));
  return report;
}
