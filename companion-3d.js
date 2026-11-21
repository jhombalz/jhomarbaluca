import * as THREE from './assets/vendor/three/three.module.min.js';

// A procedural model: no model downloads, textures, tracking, or external services.
export function createCompanion(host, { onFailure }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'buddy-canvas'; canvas.setAttribute('aria-hidden', 'true');
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
  if (!context) throw new Error('WebGL 2 is unavailable');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true }); }
  catch (error) { context.getExtension('WEBGL_lose_context')?.loseContext(); throw error; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
  camera.position.set(0, 1.9, 8.1); camera.lookAt(0, 1.7, 0);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const geometries = new Set(), materials = new Set();
  const ownGeometry = g => { geometries.add(g); return g; };
  function material(color) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.02 });
    materials.add(m); return m;
  }
  const cream = material('#f6edd8'), sage = material('#a8bd8d'), dark = material('#304838');
  const blush = material('#d9a18d'), gold = material('#cba56d'), lightSage = material('#d6dfbf');
  const ball = ownGeometry(new THREE.SphereGeometry(1, 16, 12));
  const limb = ownGeometry(new THREE.CapsuleGeometry(0.12, 0.36, 4, 8));
  function sphere(parent, mat, x, y, z, sx, sy = sx, sz = sx) {
    const mesh = new THREE.Mesh(ball, mat); mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); parent.add(mesh); return mesh;
  }
  function rounded(width, height, depth, radius) {
    const s = new THREE.Shape(), x = -width / 2, y = -height / 2, r = radius;
    s.moveTo(x+r,y); s.lineTo(x+width-r,y); s.quadraticCurveTo(x+width,y,x+width,y+r);
    s.lineTo(x+width,y+height-r); s.quadraticCurveTo(x+width,y+height,x+width-r,y+height);
    s.lineTo(x+r,y+height); s.quadraticCurveTo(x,y+height,x,y+height-r);
    s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y);
    const g = ownGeometry(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.065, bevelThickness: 0.065, bevelSegments: 3, steps: 1, curveSegments: 8 }));
    g.translate(0,0,-depth/2); return g;
  }
  function tube(parent, points, radius, mat) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const mesh = new THREE.Mesh(ownGeometry(new THREE.TubeGeometry(curve, 12, radius, 6, false)), mat);
    parent.add(mesh); return mesh;
  }
  const robot = new THREE.Group(); scene.add(robot);
  const body = new THREE.Mesh(rounded(1.15, 0.97, 0.65, 0.23), sage); body.position.y=1.07; robot.add(body);
  sphere(robot, dark, 0, 1.58, 0, 0.18, 0.14, 0.18);
  const head = new THREE.Group(); head.position.y = 2.27; robot.add(head);
  head.add(new THREE.Mesh(rounded(1.87, 1.13, 0.72, 0.3), cream));
  for (const side of [-1, 1]) {
    sphere(head, sage, side * 1.02, 0, 0, 0.13, 0.23, 0.23);
    sphere(head, blush, side * 0.59, -0.19, 0.431, 0.14, 0.046, 0.015);
  }
  const eyes = [-0.36,0.36].map(x => sphere(head, dark, x, 0.06, 0.437, 0.073, 0.115, 0.035));
  tube(head, [[-0.17,-0.18,0.44],[0,-0.26,0.45],[0.17,-0.18,0.44]], 0.023, dark);
  tube(head, [[0,0.59,0],[0,0.88,0]],0.035,sage);
  const antenna = sphere(head,gold,0,0.94,0,0.11);
  // Code brackets are geometry, so the chest stays crisp at any display scale.
  tube(robot,[[-0.2,1.2,0.4],[-0.33,1.08,0.4],[-0.2,0.96,0.4]],0.025,dark);
  tube(robot,[[0.2,1.2,0.4],[0.33,1.08,0.4],[0.2,0.96,0.4]],0.025,dark);
  tube(robot,[[0.06,1.25,0.4],[-0.06,0.91,0.4]],0.023,dark);
  const arms = [-1,1].map(side => {
    const pivot=new THREE.Group(); pivot.position.set(side*0.74,1.38,0); robot.add(pivot);
    const arm=new THREE.Mesh(limb,lightSage); arm.position.y=-0.25; pivot.add(arm);
    sphere(pivot,cream,0,-0.58,0,0.16); return pivot;
  });
  const legs = [-1,1].map(side => {
    const pivot=new THREE.Group();pivot.position.set(side*0.31,0.58,0);robot.add(pivot);
    const leg=new THREE.Mesh(limb,dark);leg.scale.set(0.8,0.6,0.8);leg.position.y=-0.18;pivot.add(leg);
    sphere(pivot,sage,0,-0.36,0.1,0.19,0.1,0.25);return pivot;
  });
  const shadowMaterial = new THREE.MeshBasicMaterial({color:'#637552',transparent:true,opacity:0.12,depthWrite:false});materials.add(shadowMaterial);
  const shadow=new THREE.Mesh(ownGeometry(new THREE.CircleGeometry(0.75,24)),shadowMaterial);
  shadow.rotation.x=-Math.PI/2;shadow.scale.y=0.55;shadow.position.set(0,0.04,0);scene.add(shadow);
  scene.add(new THREE.HemisphereLight(0xfffbeb,0x82916b,2.8));
  const key=new THREE.DirectionalLight(0xfff5dd,3.1);key.position.set(-3,5,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xe5f0db,1.4);fill.position.set(3,2,-2);scene.add(fill);
  let disposed=false,moving=true,frame=0,lastFrame=0,impulse=0,waveStarted=-Infinity,section='home';
  let aimX=0,aimY=0,lookX=0,lookY=0;
  function size() {
    if(disposed)return;
    const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
    // Small transparent canvas, capped to 1.5x for mobile battery use.
    const ratio=Math.min(window.devicePixelRatio||1,1.5);
    renderer.setSize(Math.round(width*ratio),Math.round(height*ratio),false);
    camera.aspect=width/height;camera.updateProjectionMatrix();
    if(!moving)pose(performance.now());
  }
  function pose(time) {
    const t=time/1000;
    impulse*=0.9;
    lookX+=(aimX-lookX)*0.12;lookY+=(aimY-lookY)*0.12;
    const wave=moving?Math.max(0,1-(time-waveStarted)/1600):0;
    const gait=moving?Math.sin(t*13)*Math.abs(impulse):0;
    robot.position.y=moving?Math.sin(t*2)*0.025+Math.abs(gait)*0.12+Math.sin(wave*Math.PI)*0.18:0;
    robot.rotation.set(0,moving?-0.2+Math.sin(t*0.8)*0.05:-0.2,moving?-impulse*0.13:0);
    head.rotation.set(moving?lookY*0.16:0,moving?lookX*0.38:0,moving?Math.sin(t)*0.025:0);
    arms[0].rotation.z=-0.27+gait*0.5;
    arms[1].rotation.z=wave>0?2.3+Math.sin(t*18)*0.3:0.27-gait*0.5;
    legs[0].rotation.x=gait*0.6;legs[1].rotation.x=-gait*0.6;
    const blink=moving&&t%5.3>5.12?0.15:1;
    eyes.forEach(eye=>{eye.scale.y=0.115*blink});
    antenna.scale.setScalar(moving?0.11+wave*0.02:0.11);
    shadow.scale.x=1-robot.position.y*0.7;
    renderer.render(scene,camera);
  }
  function loop(time) {
    frame=0;
    if(disposed||!moving||document.hidden)return;
    if(time-lastFrame>=1000/30){pose(time);lastFrame=time;}
    frame=requestAnimationFrame(loop);
  }
  function schedule(){if(!frame&&!disposed&&moving&&!document.hidden)frame=requestAnimationFrame(loop);}
  function pointer(event){if(!moving||event.pointerType==='touch')return;aimX=Math.max(-1,Math.min(1,event.clientX/window.innerWidth*2-1));aimY=Math.max(-1,Math.min(1,event.clientY/window.innerHeight*2-1));}
  function visibility(){cancelAnimationFrame(frame);frame=0;lastFrame=0;schedule();}
  function dispose(){
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();
    window.removeEventListener('pointermove',pointer);document.removeEventListener('visibilitychange',visibility);
    canvas.removeEventListener('webglcontextlost',lost);
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
    renderer.dispose();canvas.remove();
  }
  function lost(event){event.preventDefault();dispose();onFailure();}
  const resizeObserver=new ResizeObserver(size);
  try { size();pose(performance.now());host.append(canvas);resizeObserver.observe(host); }
  catch(error){dispose();throw error;}
  canvas.addEventListener('webglcontextlost',lost);
  window.addEventListener('pointermove',pointer,{passive:true});document.addEventListener('visibilitychange',visibility);
  schedule();
  return {
    scroll(delta){impulse=delta;},
    section(value){if(value!==section){section=value;if(value==='contact'&&moving)waveStarted=performance.now();}},
    wave(){if(moving)waveStarted=performance.now();},
    setMotion(value){moving=value;cancelAnimationFrame(frame);frame=0;lastFrame=0;if(!value){impulse=0;pose(performance.now());}else schedule();},
    dispose
  };
}
