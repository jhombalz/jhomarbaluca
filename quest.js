(() => {
  const topics = [
    { id:'web', label:'Web', icon:'▦', x:-3,z:-2, title:'Web experiences that connect.', text:'For Treffas, I developed an online booking system with ReactJS, Node.js, and Laravel. API and database optimizations improved performance by 40%, as reported in my resume.', href:'#projects', link:'Explore Treffas ↗' },
    { id:'mobile', label:'Mobile', icon:'◉', x:3,z:-2, title:'Small screen. Big possibilities.', text:'Piccatune is a Flutter social app blending short-form video and e-commerce bidding. My work included its Node.js backend, Firebase integrations, and video streaming across iOS and Android.', href:'#projects', link:'Discover Piccatune ↗' },
    { id:'backend', label:'Backend', icon:'⌘', x:0,z:0, title:'The work behind the experience.', text:'My web stack includes PHP, Laravel, Node.js, MySQL, PostgreSQL, and MongoDB. At Infimax Health Products, I built authentication and payment integrations and improved data retrieval speed by 50%.', href:'#web-stack', link:'Explore my web stack ↗' },
    { id:'cloud', label:'Cloud', icon:'☁', x:-3,z:2, title:'Built to go beyond one screen.', text:'I integrated AWS S3, EC2, and Route53 for Treffas infrastructure and deployment automation, and used AWS MediaConvert for Piccatune video processing and transcoding.', href:'#experience', link:'See my experience ↗' },
    { id:'automation', label:'Automation', icon:'✳', x:3,z:2, title:'More creating. Less repeating.', text:'At Iconcept IT Solutions, I implemented n8n and Zapier workflows that reduced manual processes by 60%, as reported in my resume. I also managed project lifecycles and mentored junior developers.', href:'#experience', link:'Follow my journey ↗' }
  ];
  const root=document.querySelector('#portfolio-quest'), stage=root.querySelector('.quest-stage');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'), keys=new Set();
  const topicButtons=new Map(), mapMarkers=new Map();
  const player=root.querySelector('.quest-map-player'), note=root.querySelector('.quest-note');
  const pauseButton=root.querySelector('.quest-pause');
  let state, world=null, generation=0, frame=0, last=0, inView=false, loading=false, failed=false;
  const canAnimate=()=>inView&&!state.paused&&!state.reduced&&!document.hidden&&!document.querySelector('dialog[open]');
  function announce(message){root.querySelector('.quest-discovery').textContent=message;}
  function collect(topic){
    if(!state)return;
    const first=!state.collected.has(topic.id); state.collected.add(topic.id);
    topicButtons.get(topic.id).setAttribute('aria-pressed','true');
    mapMarkers.get(topic.id).classList.add('is-collected');
    root.querySelector('#quest-count').textContent=`${state.collected.size} / ${topics.length}`;
    root.querySelector('.quest-progress-track>span').style.width=`${state.collected.size/topics.length*100}%`;
    note.querySelector('.quest-note-icon').textContent=topic.icon;note.querySelector('h3').textContent=topic.title;
    note.querySelector('p').textContent=topic.text;const link=note.querySelector('a');link.href=topic.href;link.textContent=topic.link;
    if(first)announce(`${topic.label} discovered! ${state.collected.size} of ${topics.length} field notes found.`);
    else announce(`Revisiting ${topic.label}.`);
    if(state.collected.size===topics.length){root.querySelector('.quest-complete').hidden=false;announce('All five discoveries found! Let’s build something together.');}
    if(!canAnimate())world?.render(state,performance.now(),true);
  }
  topics.forEach(topic=>{
    const button=document.createElement('button');button.type='button';button.textContent=`${topic.icon} ${topic.label}`;
    button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>collect(topic));
    root.querySelector('.quest-topics').append(button);topicButtons.set(topic.id,button);
    const marker=document.createElement('span');marker.className='quest-map-marker';marker.textContent=topic.label;
    marker.style.left=`${(topic.x+5)/10*100}%`;marker.style.top=`${(topic.z+4)/8*100}%`;
    root.querySelector('.quest-map').append(marker);mapMarkers.set(topic.id,marker);
  });
  function reset(){
    state={x:0,z:3.3,yaw:0,walking:false,collected:new Set(),paused:false,reduced:reduced.matches,target:null};
    player.style.left='50%';player.style.top='91.25%';
    keys.clear();last=0;pauseButton.textContent='Pause';pauseButton.setAttribute('aria-pressed','false');
    root.querySelector('#quest-count').textContent='0 / 5';root.querySelector('.quest-progress-track>span').style.width='0%';
    topicButtons.forEach(b=>b.setAttribute('aria-pressed','false'));mapMarkers.forEach(m=>m.classList.remove('is-collected'));
    root.querySelector('.quest-complete').hidden=true;note.querySelector('.quest-note-icon').textContent='✳';
    note.querySelector('h3').textContent='Curiosity looks good on you.';note.querySelector('p').textContent='Guide JB to the glowing markers, or choose any topic above to explore without playing.';
    note.querySelector('a').href='#about';note.querySelector('a').textContent='Meet Jhomar ↗';
    announce('Pick a path. There’s something to discover in every direction.');
    if(reduced.matches)root.querySelector('#quest-mode').textContent='Quiet mode · choose a topic to explore';
    syncControls();
  }
  function syncControls(){root.querySelectorAll('[data-move]').forEach(button=>button.disabled=state.paused||state.reduced);}
  function tick(time){
    frame=0;if(!canAnimate())return;
    const dt=last?Math.min((time-last)/1000,0.05):0;last=time;
    let dx=Number(keys.has('right'))-Number(keys.has('left')),dz=Number(keys.has('down'))-Number(keys.has('up'));
    if((dx||dz))state.target=null;
    else if(state.target){dx=state.target.x-state.x;dz=state.target.z-state.z;if(Math.hypot(dx,dz)<.08){state.target=null;dx=dz=0;}}
    const distance=Math.hypot(dx,dz);state.walking=distance>0;
    if(distance){const step=Math.min(distance,2.8*dt);state.x=Math.max(-4.25,Math.min(4.25,state.x+dx/distance*step));state.z=Math.max(-3.3,Math.min(3.3,state.z+dz/distance*step));state.yaw=Math.atan2(dx,dz);}
    topics.forEach(topic=>{if(!state.collected.has(topic.id)&&Math.hypot(state.x-topic.x,state.z-topic.z)<.65)collect(topic);});
    player.style.left=`${(state.x+5)/10*100}%`;player.style.top=`${(state.z+4)/8*100}%`;
    world?.render(state,time);frame=requestAnimationFrame(tick);
  }
  function schedule(){if(!frame&&canAnimate()){last=0;frame=requestAnimationFrame(tick);}}
  function stopMovement(){keys.clear();state.target=null;state.walking=false;}
  function syncActivity(){
    cancelAnimationFrame(frame);frame=0;last=0;
    if(!canAnimate())stopMovement();else schedule();
    window.dispatchEvent(new CustomEvent('portfolio-game-state',{detail:{open:inView&&!document.hidden&&!document.querySelector('dialog[open]')}}));
  }
  async function loadWorld(){
    if(world||loading||failed||state.reduced||!inView)return;loading=true;
    const token=++generation,mode=root.querySelector('#quest-mode');mode.textContent='Preparing your little island…';
    try{
      const {createQuestWorld}=await import('./quest-world.js');if(token!==generation||state.reduced)return;
      world=createQuestWorld(stage,topics,{destination(point){if(canAnimate()){stage.focus({preventScroll:true});state.target=point;}},onFailure(){world=null;failed=true;stage.classList.remove('has-world');mode.textContent='Simple map · all discoveries are still here';}});
      world.render(state,performance.now(),true);stage.classList.add('has-world');mode.textContent='Click the island, focus it to use arrows, or choose a topic';
    }catch{if(token===generation){failed=true;mode.textContent='Simple map · all discoveries are still here';}}
    finally{loading=false;}
  }
  root.querySelector('.quest-restart').addEventListener('click',()=>{reset();world?.render(state,performance.now(),true);syncActivity();stage.focus({preventScroll:true});});
  pauseButton.addEventListener('click',()=>{state.paused=!state.paused;stopMovement();pauseButton.textContent=state.paused?'Resume':'Pause';pauseButton.setAttribute('aria-pressed',String(state.paused));syncControls();world?.render(state,performance.now(),true);syncActivity();});
  const keyMap={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
  root.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey||!event.target.closest('.quest-stage,.quest-controls'))return;
    const key=keyMap[event.key]||keyMap[event.key.toLowerCase()];if(!key)return;
    if(canAnimate()){event.preventDefault();keys.add(key);}
  });
  document.addEventListener('keyup',event=>{const key=keyMap[event.key]||keyMap[event.key.toLowerCase()];if(key)keys.delete(key);});
  root.addEventListener('focusout',()=>keys.clear());
  root.querySelectorAll('[data-move]').forEach(button=>{
    button.addEventListener('pointerdown',event=>{if(!canAnimate())return;event.preventDefault();keys.add(button.dataset.move);button.setPointerCapture(event.pointerId);});
    const release=()=>keys.delete(button.dataset.move);button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
    button.addEventListener('click',event=>{if(event.detail===0&&canAnimate()){const offsets={up:[0,-.8],down:[0,.8],left:[-.8,0],right:[.8,0]};const [x,z]=offsets[button.dataset.move];state.target={x:Math.max(-4.25,Math.min(4.25,state.x+x)),z:Math.max(-3.3,Math.min(3.3,state.z+z))};}});
  });
  root.querySelector('.quest-map').addEventListener('click',event=>{if(!canAnimate()||world)return;stage.focus({preventScroll:true});const r=event.currentTarget.getBoundingClientRect();state.target={x:Math.max(-4.25,Math.min(4.25,(event.clientX-r.left)/r.width*10-5)),z:Math.max(-3.3,Math.min(3.3,(event.clientY-r.top)/r.height*8-4))};});
  window.addEventListener('blur',stopMovement);document.addEventListener('visibilitychange',syncActivity);
  document.querySelectorAll('dialog').forEach(dialog=>new MutationObserver(syncActivity).observe(dialog,{attributes:true,attributeFilter:['open']}));
  reduced.addEventListener('change',()=>{state.reduced=reduced.matches;stopMovement();syncControls();world?.render(state,performance.now(),true);syncActivity();if(!state.reduced)loadWorld();root.querySelector('#quest-mode').textContent=state.reduced?'Quiet mode · choose a topic to explore':world?'Click the island, focus it to use arrows, or choose a topic':'Simple map · all discoveries are still here';});
  reset();root.querySelector('#quest-mode').textContent=state.reduced?'Quiet mode · choose a topic to explore':'Explore the island or choose a topic';
  if('IntersectionObserver'in window){new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;syncActivity();if(inView)loadWorld();},{threshold:.03}).observe(stage);}
  else{inView=true;syncActivity();loadWorld();}
  window.addEventListener('pagehide',event=>{if(!event.persisted){++generation;world?.dispose();world=null;}});
})();
