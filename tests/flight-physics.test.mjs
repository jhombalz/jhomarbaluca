import test from 'node:test';
import assert from 'node:assert/strict';
import {createFlightState,advanceFlight} from '../flight-physics.mjs';
const topics=['frontend','backend','databases','cloud','automation'].map(id=>({id}));
test('an aligned plane discovers a gate when crossing its flight depth',()=>{
  const state=createFlightState(topics);state.gates[0].z=-1.3;
  assert.equal(advanceFlight(state,{x:0,y:0},.05),'frontend');
  assert.equal(advanceFlight(state,{x:0,y:0},.05),null,'the same gate must not open every frame');
});
test('missing a gate does not award a discovery; the gate returns later',()=>{
  const state=createFlightState(topics);state.x=8;state.gates[0].z=-1.3;
  assert.equal(advanceFlight(state,{x:0,y:0},.05),null);
  state.gates[0].z=15;advanceFlight(state,{x:0,y:0},.05);
  assert.ok(state.gates[0].z<-100);assert.equal(state.gates[0].hit,false);
});
test('steering respects flight bounds and diagonal movement stays normalized',()=>{
  const straight=createFlightState(topics),diagonal=createFlightState(topics);
  advanceFlight(straight,{x:1,y:0},.05);advanceFlight(diagonal,{x:1,y:1},.05);
  assert.ok(Math.abs(straight.x-Math.hypot(diagonal.x,diagonal.y))<1e-9);
  for(let n=0;n<200;n++)advanceFlight(diagonal,{x:1,y:-1},.05);
  assert.equal(diagonal.x,10);assert.equal(diagonal.y,-5);
});
test('long frame gaps are capped instead of teleporting through the sky',()=>{
  const state=createFlightState(topics);advanceFlight(state,{x:0,y:0},10);
  assert.ok(state.distance<=.6+1e-9);assert.ok(state.gates.every(gate=>gate.z<0));
});
