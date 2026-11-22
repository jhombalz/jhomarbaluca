export const gatePositions = [[0,0],[-5,2],[4,-2],[-4,-2],[5,2]];

export function createFlightState(topics) {
  return { x:0, y:0, distance:0, steerX:0, steerY:0, arcade:true, score:0, shield:3, crashed:false, invulnerable:0, shotCooldown:0, shots:[], enemyShots:[], effects:[],volleyCount:2,weaponDiscoveries:new Set(),
    drones:Array.from({length:6},(_,index)=>({id:index,x:[0,-5,4,-3,5,0][index],y:[0,2,-2,-2,2,3][index],z:-34-index*29,wave:0,fireCooldown:.65+index*.15,charging:false})),
    gates:topics.map((topic,index)=>({ id:topic.id, x:gatePositions[index%5][0], y:gatePositions[index%5][1], z:-45-index*38, hit:false })) };
}

export function awardDiscoveryUpgrade(state,id){
  if(!state.gates.some(gate=>gate.id===id)||state.weaponDiscoveries.has(id))return false;
  state.weaponDiscoveries.add(id);state.volleyCount=Math.min(7,2+state.weaponDiscoveries.size);return true;
}

export function setArcadeEnabled(state,enabled){
  state.arcade=Boolean(enabled);state.shots=[];state.enemyShots=[];state.effects=[];state.shotCooldown=0;
  if(!enabled){state.crashed=false;state.shield=3;state.invulnerable=0;}
}

function recycleDrone(state,drone){
  drone.z=Math.min(-65,...state.drones.map(other=>other.z))-29;drone.wave++;
  drone.x=[0,-5,4,-3,5][(drone.id+drone.wave)%5];drone.y=[0,2,-2][(drone.id+drone.wave)%3];
  drone.fireCooldown=.75+(drone.id%3)*.2;drone.charging=false;
}

function damagePlayer(state){
  if(state.invulnerable>0)return;
  state.shield=Math.max(0,state.shield-1);state.invulnerable=2;
  state.effects.push({x:state.x,y:state.y,z:0,life:.55});
  if(state.shield===0)state.crashed=true;
}

function advanceArcade(state,input,dt){
  if(!state.arcade)return;
  state.invulnerable=Math.max(0,state.invulnerable-dt);state.shotCooldown=Math.max(0,state.shotCooldown-dt);
  state.effects=state.effects.map(effect=>({...effect,life:effect.life-dt})).filter(effect=>effect.life>0);
  if(input.fire&&state.shotCooldown<=0){
    for(let index=0;index<state.volleyCount;index++)state.shots.push({x:state.x+(index-(state.volleyCount-1)/2)*.46,y:state.y,z:-2,life:1.8});
    state.shotCooldown=.16;
  }
  state.drones.forEach(drone=>{drone.z+=18*dt;});
  const remaining=[];
  for(const shot of state.shots){
    const before=shot.z;shot.z-=55*dt;shot.life-=dt;let hit=false;
    for(const drone of state.drones){
      if(shot.z<=drone.z+.8&&before>=drone.z-.8&&Math.hypot(shot.x-drone.x,shot.y-drone.y)<1){
        state.score+=10;state.effects.push({x:drone.x,y:drone.y,z:drone.z,life:.55});recycleDrone(state,drone);hit=true;break;
      }
    }
    if(!hit&&shot.life>0)remaining.push(shot);
  }
  state.shots=remaining;
  for(const drone of state.drones){
    const inRange=drone.z>-65&&drone.z<-8;
    if(inRange)drone.fireCooldown=Math.max(0,drone.fireCooldown-dt);
    drone.charging=inRange&&drone.fireCooldown<.35;
    if(inRange&&drone.fireCooldown<=0){
      // Aim once when fired. A pilot who moves can dodge; shots never home in.
      const z=drone.z+1,dx=state.x-drone.x,dy=state.y-drone.y,dz=-z,length=Math.hypot(dx,dy,dz);
      if(state.enemyShots.length<24)state.enemyShots.push({x:drone.x,y:drone.y,z,vx:dx/length*28,vy:dy/length*28,vz:dz/length*28,life:4});
      drone.fireCooldown=1.8+(drone.id%3)*.25;drone.charging=false;
    }
  }
  const incoming=[];
  for(const shot of state.enemyShots){
    const before={x:shot.x,y:shot.y,z:shot.z};
    shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.z+=shot.vz*dt;shot.life-=dt;
    let hit=false;
    if(before.z<.7&&shot.z>-.7){
      const fraction=Math.max(0,Math.min(1,-before.z/Math.max(.0001,shot.z-before.z)));
      const x=before.x+(shot.x-before.x)*fraction,y=before.y+(shot.y-before.y)*fraction;
      if(Math.hypot(x-state.x,y-state.y)<.72){damagePlayer(state);hit=true;}
    }
    if(!hit&&shot.life>0&&shot.z<6)incoming.push(shot);
  }
  state.enemyShots=incoming;
  if(state.crashed)return;
  for(const drone of state.drones){
    if(Math.abs(drone.z)<1.2&&Math.hypot(drone.x-state.x,drone.y-state.y)<1.15){
      damagePlayer(state);
      recycleDrone(state,drone);if(state.shield===0){state.crashed=true;return;}
    }else if(drone.z>12)recycleDrone(state,drone);
  }
}

// World coordinates stay near the origin; the sky approaches the airplane.
export function advanceFlight(state, input, elapsed) {
  if(state.crashed)return null;
  const dt=Math.max(0,Math.min(elapsed,.05)),speed=12;
  const length=Math.hypot(input.x,input.y)||1;
  const dx=input.x/Math.max(1,length),dy=input.y/Math.max(1,length);
  state.steerX=dx;state.steerY=dy;
  state.x=Math.max(-10,Math.min(10,state.x+dx*6*dt));
  state.y=Math.max(-5,Math.min(5,state.y+dy*6*dt));
  state.distance+=speed*dt;
  advanceArcade(state,input,dt);
  if(state.crashed)return null;
  let discovered=null;
  for(const gate of state.gates){
    const previous=gate.z;gate.z+=speed*dt;
    if(!gate.hit&&previous<1.1&&gate.z>=-1.1&&Math.hypot(gate.x-state.x,gate.y-state.y)<2.25){gate.hit=true;discovered=gate.id;}
    if(gate.z>15){gate.z=Math.min(...state.gates.map(other=>other.z))-38;gate.hit=false;}
  }
  return discovered;
}
