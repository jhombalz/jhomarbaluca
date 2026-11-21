import * as THREE from './assets/vendor/three/three.module.min.js';

export function createQuestWorld(host, topics, {destination,onFailure}) {
  const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
  if(!context)throw Error('WebGL 2 is unavailable');
  const renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true});
  renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-6.5,6.5,5.3,-5.3,.1,60);
  camera.position.set(0,11,10);camera.lookAt(0,0,0);
  const geometries=new Set(),materials=new Set(),textures=new Set();
  function own(g){geometries.add(g);return g;}
  function mat(color){const m=new THREE.MeshStandardMaterial({color,roughness:.9});materials.add(m);return m;}
  const grass=mat('#d5dfb7'),edge=mat('#b4c394'),cream=mat('#faf1da'),sage=mat('#8ea571'),dark=mat('#3e593c'),gold=mat('#dbac62');
  const sphere=own(new THREE.SphereGeometry(1,12,8));
  function ball(parent,material,x,y,z,sx,sy=sx,sz=sx){const m=new THREE.Mesh(sphere,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
  function box(parent,material,x,y,z,w,h,d){const m=new THREE.Mesh(own(new THREE.BoxGeometry(w,h,d)),material);m.position.set(x,y,z);parent.add(m);return m;}
  const island=new THREE.Mesh(own(new THREE.CylinderGeometry(6,5.7,.5,8)),edge);island.scale.z=.78;island.position.y=-.37;scene.add(island);
  const top=new THREE.Mesh(own(new THREE.CylinderGeometry(6.02,6.02,.12,8)),grass);top.scale.z=.78;top.position.y=-.06;scene.add(top);
  // Stepping stones and tiny trees add scale without external model assets.
  const stoneGeo=own(new THREE.CylinderGeometry(.19,.21,.045,8));
  for(let i=0;i<15;i++){const m=new THREE.Mesh(stoneGeo,cream);const angle=i*2.4;m.position.set(Math.sin(angle)*(.9+i*.15),.025,Math.cos(angle)*(.7+i*.12));m.scale.z=.7;scene.add(m);}
  for(const [x,z]of[[-4,-2.8],[4,-2.8],[-4.4,.2],[4.4,.2],[-3.8,3.1]]){box(scene,dark,x,.24,z,.09,.5,.09);ball(scene,sage,x,.75,z,.37,.5,.37);ball(scene,grass,x-.12,.95,z,.24);}
  const robot=new THREE.Group();robot.scale.setScalar(1.15);scene.add(robot);
  ball(robot,sage,0,.56,0,.29,.36,.22);
  const head=new THREE.Group();head.position.y=1.03;robot.add(head);
  ball(head,cream,0,0,0,.46,.32,.3);
  ball(head,dark,-.15,.03,.277,.035,.055,.02);ball(head,dark,.15,.03,.277,.035,.055,.02);
  const smile=new THREE.Mesh(own(new THREE.TorusGeometry(.075,.012,5,12,Math.PI)),dark);smile.rotation.z=Math.PI;smile.position.set(0,-.04,.29);head.add(smile);
  box(head,sage,0,.36,0,.035,.12,.035);ball(head,gold,0,.44,0,.055);
  const arms=[-1,1].map(side=>{const g=new THREE.Group();g.position.set(side*.33,.7,0);robot.add(g);ball(g,cream,0,-.18,0,.075,.23,.075);return g;});
  const legs=[-1,1].map(side=>{const g=new THREE.Group();g.position.set(side*.14,.3,0);robot.add(g);ball(g,dark,0,-.12,0,.06,.17,.06);ball(g,cream,0,-.25,.04,.095,.05,.13);return g;});
  const pickables=[];
  const markers=topics.map(topic=>{
    const group=new THREE.Group();group.position.set(topic.x,0,topic.z);scene.add(group);
    const pedestal=new THREE.Mesh(own(new THREE.CylinderGeometry(.49,.58,.16,24)),cream);pedestal.position.y=.08;group.add(pedestal);
    const gemMaterial=mat('#dbaa5d');
    const gem=new THREE.Mesh(own(new THREE.OctahedronGeometry(.23)),gemMaterial);gem.position.y=.65;group.add(gem);
    const halo=new THREE.Mesh(own(new THREE.TorusGeometry(.35,.022,5,32)),gold);halo.rotation.x=-Math.PI/2;halo.position.y=.2;group.add(halo);
    const labelCanvas=document.createElement('canvas');labelCanvas.width=256;labelCanvas.height=72;
    const ctx=labelCanvas.getContext('2d');ctx.fillStyle='#fffaf0';ctx.beginPath();ctx.roundRect(4,4,248,64,20);ctx.fill();
    ctx.fillStyle='#30442d';ctx.font='600 38px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(topic.label,128,38);
    const texture=new THREE.CanvasTexture(labelCanvas);texture.colorSpace=THREE.SRGBColorSpace;textures.add(texture);
    const labelMaterial=new THREE.SpriteMaterial({map:texture,depthTest:false,toneMapped:false});materials.add(labelMaterial);
    const label=new THREE.Sprite(labelMaterial);label.scale.set(1.95,.55,1);label.position.y=1.25;group.add(label);
    group.children.forEach(mesh=>{mesh.userData.destination={x:topic.x,z:topic.z};pickables.push(mesh);});
    return {topic,gem,gemMaterial,halo,collected:false};
  });
  scene.add(new THREE.HemisphereLight(0xfff9e5,0x95a37a,2.8));const key=new THREE.DirectionalLight(0xfff6dd,3);key.position.set(-4,8,5);scene.add(key);
  let disposed=false,lastTime=-Infinity,lastState=null;
  function render(state,time,force=false){
    if(disposed||(!force&&time-lastTime<1000/30))return;lastTime=time;lastState=state;
    const t=time/1000,quiet=state.reduced||state.paused,gait=state.walking&&!quiet?Math.sin(t*15):0;
    robot.position.set(state.x,Math.abs(gait)*.065,state.z);robot.rotation.y=state.yaw;
    head.rotation.z=quiet?0:Math.sin(t*2)*.025;arms[0].rotation.x=gait*.55;arms[1].rotation.x=-gait*.55;
    legs[0].rotation.x=-gait*.6;legs[1].rotation.x=gait*.6;
    markers.forEach(marker=>{const found=state.collected.has(marker.topic.id);marker.gem.position.y=found ? .34 : quiet ? .65 : .65+Math.sin(t*2+marker.topic.x)*.09;marker.gem.rotation.y=quiet?0:t*.65;marker.gem.scale.setScalar(found ? .55 : 1);if(found!==marker.collected){marker.gemMaterial.color.set(found?'#7e9861':'#dbaa5d');marker.collected=found;}marker.halo.visible=!found;});
    renderer.render(scene,camera);
  }
  function resize(){
    if(disposed)return;const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight),ratio=Math.min(devicePixelRatio||1,1.5);
    renderer.setSize(Math.round(w*ratio),Math.round(h*ratio),false);
    const aspect=w/h,halfHeight=Math.max(5.1,6.5/aspect);camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;camera.updateProjectionMatrix();
    if(lastState)render(lastState,performance.now(),true);
  }
  const raycaster=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),hit=new THREE.Vector3();
  function click(event){
    const rect=canvas.getBoundingClientRect(),point=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(point,camera);
    const marker=raycaster.intersectObjects(pickables,false)[0];
    if(marker){destination(marker.object.userData.destination);return;}
    if(raycaster.ray.intersectPlane(plane,hit))destination({x:Math.max(-4.25,Math.min(4.25,hit.x)),z:Math.max(-3.3,Math.min(3.3,hit.z))});
  }
  const observer=new ResizeObserver(resize);
  function dispose(){if(disposed)return;disposed=true;observer.disconnect();canvas.removeEventListener('click',click);canvas.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();canvas.remove();}
  function lost(event){event.preventDefault();dispose();onFailure();}
  try{resize();render({x:0,z:3.3,yaw:0,walking:false,collected:new Set(),reduced:true},0,true);host.append(canvas);observer.observe(host);}catch(error){dispose();throw error;}
  canvas.addEventListener('click',click);canvas.addEventListener('webglcontextlost',lost);
  return {render,dispose};
}
