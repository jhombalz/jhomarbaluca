import test from 'node:test';
import assert from 'node:assert/strict';
import {createFlightState,advanceFlight,setArcadeEnabled,awardDiscoveryUpgrade} from '../flight-physics.mjs';
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
test('blaster shots destroy a drone and award points once',()=>{
  const state=createFlightState(topics);state.drones[0].z=-5;
  for(let i=0;i<8;i++)advanceFlight(state,{x:0,y:0,fire:true},.05);
  assert.equal(state.score,10);assert.equal(state.shield,3);assert.ok(state.drones[0].z<-100);
});
test('shield collisions grant recovery time and depletion stops flight',()=>{
  const state=createFlightState(topics);
  const hit=()=>{Object.assign(state.drones[0],{x:state.x,y:state.y,z:-1});advanceFlight(state,{x:0,y:0},.05);};
  hit();assert.equal(state.shield,2);hit();assert.equal(state.shield,2,'recovery time prevents stacked damage');
  state.invulnerable=0;hit();assert.equal(state.shield,1);
  state.invulnerable=0;hit();assert.equal(state.crashed,true);
  const distance=state.distance;advanceFlight(state,{x:1,y:0,fire:true},.05);assert.equal(state.distance,distance);
});
test('calm exploration removes hazards while keeping discoveries available',()=>{
  const state=createFlightState(topics);state.shield=0;state.crashed=true;state.drones[0].z=-1;
  setArcadeEnabled(state,false);state.gates[0].z=-1.3;
  assert.equal(advanceFlight(state,{x:0,y:0,fire:true},.05),'frontend');
  assert.equal(state.shield,3);assert.equal(state.shots.length,0);assert.equal(state.crashed,false);
});
test('nearby enemies charge before firing aimed, non-homing shots',()=>{
  const state=createFlightState(topics);state.x=5;state.y=2;
  for(let i=0;i<7;i++)advanceFlight(state,{x:0,y:0},.05);
  assert.equal(state.enemyShots.length,0);assert.equal(state.drones[0].charging,true);
  for(let i=0;i<7;i++)advanceFlight(state,{x:0,y:0},.05);
  assert.ok(state.enemyShots.length>0);
  const shot=state.enemyShots[0],velocity=[shot.vx,shot.vy,shot.vz];assert.ok(shot.vx>0&&shot.vy>0&&shot.vz>0);
  advanceFlight(state,{x:-1,y:-1},.05);assert.deepEqual([shot.vx,shot.vy,shot.vz],velocity);
});
test('enemy projectiles damage the shield once during recovery and can be dodged',()=>{
  const shot=x=>({x,y:0,z:-1,vx:0,vy:0,vz:28,life:1});
  const state=createFlightState(topics);state.enemyShots=[shot(0),shot(0)];
  advanceFlight(state,{x:0,y:0},.05);assert.equal(state.shield,2);assert.equal(state.enemyShots.length,0);
  const dodge=createFlightState(topics);dodge.x=3;dodge.enemyShots=[shot(0)];
  advanceFlight(dodge,{x:0,y:0},.05);assert.equal(dodge.shield,3);
});
test('calm mode clears all incoming fire',()=>{
  const state=createFlightState(topics);state.enemyShots=[{x:0,y:0,z:-1,vx:0,vy:0,vz:28,life:1}];
  setArcadeEnabled(state,false);assert.equal(state.enemyShots.length,0);
  advanceFlight(state,{x:0,y:0},.05);assert.equal(state.shield,3);
});
test('each unique discovery adds one bullet; revisits and unknown gates add none',()=>{
  const state=createFlightState(topics);
  assert.equal(awardDiscoveryUpgrade(state,'backend'),true);assert.equal(state.volleyCount,3);
  assert.equal(awardDiscoveryUpgrade(state,'backend'),false);assert.equal(state.volleyCount,3);
  assert.equal(awardDiscoveryUpgrade(state,'unknown'),false);
  topics.forEach(topic=>awardDiscoveryUpgrade(state,topic.id));assert.equal(state.volleyCount,7);
});
test('upgraded volleys fire the correct number of distinct bullets',()=>{
  const state=createFlightState(topics);topics.forEach(topic=>awardDiscoveryUpgrade(state,topic.id));
  advanceFlight(state,{x:0,y:0,fire:true},0);
  assert.equal(state.shots.length,7);assert.equal(new Set(state.shots.map(shot=>shot.x)).size,7);
  assert.ok(state.shots.every(shot=>shot.z===-2));
});
