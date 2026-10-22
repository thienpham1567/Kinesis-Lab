import assert from 'node:assert/strict';
import { HYPERTROPHY_EXERCISES as exercises, MUSCLE_GROUP_ATLAS as muscles } from '../src/lib/clinical/muscle-hypertrophy-atlas.ts';
import { filterTrainingExercises, exercisesForMuscle, resolveTrainingSelection, atlasGroupHref, trainingHref, matchingGroupStructures } from '../src/lib/clinical/training-atlas.ts';
assert(filterTrainingExercises(exercises,'nguc','all').some(e=>e.id==='incline-db-press'));
assert(filterTrainingExercises(exercises,'nguc','all').some(e=>e.id==='cable-chest-fly'));
assert.equal(filterTrainingExercises(exercises,'zzzzzz','all').length,0);
assert(filterTrainingExercises(exercises,'','Pull').every(e=>e.pattern==='Pull'));
assert(exercisesForMuscle(exercises,'glutes').every(e=>e.targets.some(t=>t.muscleId==='glutes')));
assert.equal(resolveTrainingSelection(exercises,muscles,{exerciseId:'missing',muscleId:'bad',mode:'nonsense'}).exercise.id,exercises[0].id);
assert.equal(resolveTrainingSelection(exercises,muscles,{exerciseId:'barbell-hip-thrust'}).muscle.id,'glutes');
assert.equal(resolveTrainingSelection(exercises,muscles,{muscleId:'calves'}).mode,'muscle');
assert.equal(atlasGroupHref('glutes'),'/atlas?area=hip&group=glutes');
assert.equal(trainingHref('exercise','barbell-hip-thrust'),'/atlas?tab=hypertrophy&exercise=barbell-hip-thrust');
assert.equal(trainingHref('muscle','chest'),'/atlas?tab=hypertrophy&muscle=chest');
assert.deepEqual(matchingGroupStructures([{id:'a',english:'Gluteus maximus muscle',group:'glutes',layer:'muscle'},{id:'b',english:'Gluteus maximus muscle',group:'glutes',layer:'bone'}],'glutes').map(s=>s.id),['a']);
const {readFileSync}=await import('node:fs');
const manifest=JSON.parse(readFileSync(new URL('../public/anatomy/3d/manifest.json',import.meta.url)));
const {trainingGroupForStructure}=await import('../src/lib/clinical/training-atlas.ts');
for(const group of ['upper_back_traps','lats_teres']) {
 const url=new URL(atlasGroupHref(group),'http://localhost');
 assert.equal(url.searchParams.get('area'),'trunk');
 assert(matchingGroupStructures(manifest.structures,group).some(s=>s.areas.includes('trunk')));
}
for(const english of ['Oblique head of adductor hallucis','Oblique head of adductor pollicis','Popliteus muscle','Coracobrachialis muscle']) {
 const s=manifest.structures.find(s=>s.english===english);assert(s);
 assert.equal(trainingGroupForStructure(s),null,english+' must not inherit an unsupported training group');
}
for (const [name, group] of [['pectineus','quads_adductors'],['tibialis anterior','calves']]) {
 const matches=manifest.structures.filter(s=>s.layer==='muscle'&&s.english.toLowerCase().includes(name));
 assert(matches.length>0, `${name}: actual source meshes required`);
 for(const structure of matches)assert.equal(trainingGroupForStructure(structure),group,`${name}: teaching membership must match its card`);
 assert.equal(trainingGroupForStructure({english:matches[0].english,layer:'bone'}),null,'membership requires a muscle-layer structure');
}
assert.equal(muscles.find(m=>m.id==='deltoids').name,'Cơ Delta','card title must match its actual three deltoid subdivisions');
for(const m of muscles)assert(matchingGroupStructures(manifest.structures,m.id).length>0,m.id);

for (const exercise of exercises) {
  for (const target of exercise.targets) {
    const area = new URL(atlasGroupHref(target.muscleId), 'http://localhost').searchParams.get('area');
    const meshes = matchingGroupStructures(manifest.structures, target.muscleId).filter(s => s.areas.includes(area));
    assert(meshes.length > 0, `${exercise.id}/${target.muscleId}: no anatomy in ${area}`);
  }
}
console.log(`Training Atlas checks passed: ${exercises.length} exercises, ${muscles.length} groups, every target has source meshes in its linked region`);
