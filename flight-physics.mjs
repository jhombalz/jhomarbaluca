export const gatePositions = [[0,0],[-5,2],[4,-2],[-4,-2],[5,2]];

export function createFlightState(topics) {
  return { x:0, y:0, distance:0, steerX:0, steerY:0, gates:topics.map((topic,index)=>({ id:topic.id, x:gatePositions[index%5][0], y:gatePositions[index%5][1], z:-45-index*38, hit:false })) };
}

// World coordinates stay near the origin; the sky approaches the airplane.
export function advanceFlight(state, input, elapsed) {
  const dt=Math.max(0,Math.min(elapsed,.05)),speed=12;
  const length=Math.hypot(input.x,input.y)||1;
  const dx=input.x/Math.max(1,length),dy=input.y/Math.max(1,length);
  state.steerX=dx;state.steerY=dy;
  state.x=Math.max(-10,Math.min(10,state.x+dx*6*dt));
  state.y=Math.max(-5,Math.min(5,state.y+dy*6*dt));
  state.distance+=speed*dt;
  let discovered=null;
  for(const gate of state.gates){
    const previous=gate.z;gate.z+=speed*dt;
    if(!gate.hit&&previous<1.1&&gate.z>=-1.1&&Math.hypot(gate.x-state.x,gate.y-state.y)<2.25){gate.hit=true;discovered=gate.id;}
    if(gate.z>15){gate.z=Math.min(...state.gates.map(other=>other.z))-38;gate.hit=false;}
  }
  return discovered;
}
