import * as THREE from './assets/vendor/three/three.module.min.js';

export function createFlightWorld(host,topics,{onFailure}) {
  const canvas=document.createElement('canvas');canvas.className='flight-canvas';canvas.setAttribute('aria-hidden','true');
  const context=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'low-power'});
  if(!context)throw Error('WebGL 2 unavailable');
  const renderer=new THREE.WebGLRenderer({canvas,context,antialias:true});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  const scene=new THREE.Scene();scene.fog=new THREE.Fog('#1e385b',45,190);
  const camera=new THREE.PerspectiveCamera(55,1,.1,260);camera.position.set(0,5,11);camera.lookAt(0,1,-25);
  const geometries=new Set(),materials=new Set(),textures=new Set();
  const sky=document.createElement('canvas');sky.width=2;sky.height=512;
  const skyContext=sky.getContext('2d'),gradient=skyContext.createLinearGradient(0,0,0,512);
  gradient.addColorStop(0,'#071329');gradient.addColorStop(.52,'#1e385b');gradient.addColorStop(1,'#526887');
  skyContext.fillStyle=gradient;skyContext.fillRect(0,0,2,512);
  const skyTexture=new THREE.CanvasTexture(sky);skyTexture.colorSpace=THREE.SRGBColorSpace;textures.add(skyTexture);scene.background=skyTexture;
  const own=g=>{geometries.add(g);return g;};
  function material(color,extra={}){const m=new THREE.MeshStandardMaterial({color,roughness:.9,...extra});materials.add(m);return m;}
  const paper=material('#42d9f3',{side:THREE.DoubleSide,roughness:.5,emissive:'#1479a4',emissiveIntensity:.3});
  const violet=material('#a28aff',{side:THREE.DoubleSide,roughness:.5,emissive:'#6551ba',emissiveIntensity:.28});
  const fold=material('#285ba3',{side:THREE.DoubleSide,emissive:'#163d7c',emissiveIntensity:.2});
  const plane=new THREE.Group();scene.add(plane);
  const outlineMaterial=new THREE.LineBasicMaterial({color:'#adf1ff',transparent:true,opacity:.65});materials.add(outlineMaterial);
  function triangle(points,mat){const g=own(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.computeVertexNormals();const mesh=new THREE.Mesh(g,mat);plane.add(mesh);plane.add(new THREE.LineSegments(own(new THREE.EdgesGeometry(g)),outlineMaterial));}
  triangle([[0,.08,-2.1],[-1.9,-.05,1.1],[-.2,.34,.65]],paper);
  triangle([[0,.08,-2.1],[.2,.34,.65],[1.9,-.05,1.1]],violet);
  triangle([[0,.08,-2.1],[-.2,.34,.65],[0,-.18,1.25]],fold);
  triangle([[0,.08,-2.1],[0,-.18,1.25],[.2,.34,.65]],paper);
  const seamGeometry=own(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.08,-2.1),new THREE.Vector3(0,-.18,1.25)]));
  const seamMaterial=new THREE.LineBasicMaterial({color:'#c5eaff'});materials.add(seamMaterial);plane.add(new THREE.Line(seamGeometry,seamMaterial));
  const sphere=own(new THREE.SphereGeometry(1,24,16)),cloudMaterial=material('#9db2dc');
  const starPositions=[];
  for(let i=0;i<120;i++)starPositions.push(Math.sin(i*12.7)*150,25+(i*17%100),-40-(i*23%190));
  const starGeometry=own(new THREE.BufferGeometry());starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
  const starMaterial=new THREE.PointsMaterial({color:'#cee7ff',size:.15,transparent:true,opacity:.65,fog:false,toneMapped:false});materials.add(starMaterial);scene.add(new THREE.Points(starGeometry,starMaterial));
  const clouds=[];
  // Deterministic, low-poly cloud puffs. No downloads or shader-heavy postprocessing.
  for(let i=0;i<22;i++){
    const cloud=new THREE.Group();
    const side=i%2?-1:1;
    cloud.position.set(side*(11+(i*7%20)),(i*11%23)-11,-i*10-12);
    const size=1.5+(i%4)*.7;cloud.scale.setScalar(size);
    for(let j=0;j<4;j++){const puff=new THREE.Mesh(sphere,cloudMaterial);puff.position.set((j-1.5)*1.1,Math.sin(j*2+i)*.35,Math.cos(j)*.4);puff.scale.set(1.25,j%2?1:.8,1);cloud.add(puff);}
    scene.add(cloud);clouds.push(cloud);
  }
  const gateGeometry=own(new THREE.TorusGeometry(2.4,.095,6,44));
  const gates=new Map(topics.map(topic=>{
    const group=new THREE.Group(),ringMaterial=material('#64e4ff',{emissive:'#22b6ec',emissiveIntensity:1.1});
    const ring=new THREE.Mesh(gateGeometry,ringMaterial);group.add(ring);
    const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=144;const ctx=labelCanvas.getContext('2d');
    ctx.fillStyle='#101f3b';ctx.beginPath();ctx.roundRect(4,4,504,136,28);ctx.fill();ctx.strokeStyle='#628fae';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#e4f6ff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 48px Arial';ctx.fillText(topic.label,256,51);
    ctx.font='23px Arial';ctx.fillStyle='#a9c6e2';ctx.fillText(topic.stack,256,105);
    const texture=new THREE.CanvasTexture(labelCanvas);texture.colorSpace=THREE.SRGBColorSpace;textures.add(texture);
    const labelMaterial=new THREE.SpriteMaterial({map:texture,toneMapped:false});materials.add(labelMaterial);
    const label=new THREE.Sprite(labelMaterial);label.scale.set(5.1,1.44,1);label.position.y=3.4;group.add(label);
    const arrowGeometry=own(new THREE.ConeGeometry(.18,.45,3)),arrow=new THREE.Mesh(arrowGeometry,ringMaterial);arrow.rotation.z=Math.PI;arrow.position.y=2.8;group.add(arrow);
    scene.add(group);return [topic.id,{group,ringMaterial}];
  }));
  scene.add(new THREE.HemisphereLight(0xbcdfff,0x353b70,2));
  const sun=new THREE.DirectionalLight(0xb3dcff,2.4);sun.position.set(-10,20,8);scene.add(sun);
  const rim=new THREE.DirectionalLight(0xa990ff,1.6);rim.position.set(12,5,-8);scene.add(rim);
  let disposed=false,lastState=null,lastTime=0,rendered=-Infinity;
  function render(state,time,force=false){
    if(disposed||(!force&&time-rendered<1000/30))return;
    const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;rendered=time;lastState=state;
    const active=!state.still;
    plane.position.set(state.x,state.y+1,0);
    plane.rotation.z=active?THREE.MathUtils.lerp(plane.rotation.z,-state.steerX*.45,.16):plane.rotation.z;
    plane.rotation.x=active?THREE.MathUtils.lerp(plane.rotation.x,.13+state.steerY*.15,.16):plane.rotation.x;
    if(active){camera.position.x=THREE.MathUtils.lerp(camera.position.x,state.x*.28,.08);camera.position.y=THREE.MathUtils.lerp(camera.position.y,5+state.y*.25,.08);}
    camera.lookAt(state.x*.25,1+state.y*.2,-25);
    state.gates.forEach(gate=>{const model=gates.get(gate.id);model.group.position.set(gate.x,gate.y+1,gate.z);model.ringMaterial.color.set(gate.hit?'#b3a1ff':'#64e4ff');model.ringMaterial.emissive.set(gate.hit?'#7965cf':'#22b6ec');});
    if(active)clouds.forEach((cloud,i)=>{cloud.position.z+=dt*9;if(cloud.position.z>22)cloud.position.z=-210;cloud.rotation.z=Math.sin(state.distance*.003+i)*.025;});
    renderer.render(scene,camera);
  }
  function resize(){
    if(disposed)return;const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight),ratio=Math.min(devicePixelRatio||1,1.25);
    renderer.setSize(Math.round(width*ratio),Math.round(height*ratio),false);camera.aspect=width/height;camera.updateProjectionMatrix();if(lastState)render(lastState,performance.now(),true);
  }
  const observer=new ResizeObserver(resize);
  function dispose(){if(disposed)return;disposed=true;observer.disconnect();canvas.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();canvas.remove();}
  function lost(event){event.preventDefault();dispose();onFailure();}
  try{resize();host.append(canvas);observer.observe(host);}catch(error){dispose();throw error;}
  canvas.addEventListener('webglcontextlost',lost);
  return {render,dispose};
}
