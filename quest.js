(() => {
  const topics = [
    {id:'frontend',label:'Frontend',icon:'▦',stack:'ReactJS · Vue.js · JavaScript',title:'Make the complex feel simple.',text:'I build responsive web interfaces with HTML5, CSS3, JavaScript, jQuery, ReactJS, and Vue.js. For Treffas, I worked on an online booking system; at Iconcept IT Solutions, my responsive UI work improved engagement by 35%, as reported in my resume.',href:'#web-stack',link:'Explore my frontend stack ↗'},
    {id:'backend',label:'Backend',icon:'⌘',stack:'PHP · Laravel · Node.js · REST APIs',title:'Connect all the moving parts.',text:'I develop application logic and RESTful APIs with PHP, Laravel, and Node.js. My experience includes authentication systems and payment gateways at Infimax Health Products, plus backend work for Treffas and Piccatune.',href:'#projects',link:'See the projects behind the APIs ↗'},
    {id:'databases',label:'Databases',icon:'▤',stack:'MySQL · PostgreSQL · MongoDB',title:'Good experiences start with good data.',text:'My database toolkit includes MySQL, PostgreSQL, and MongoDB. API and query optimizations improved Treffas performance by 40%, while database query work at Infimax improved data retrieval speed by 50%, as reported in my resume.',href:'#web-stack',link:'Explore my data layer ↗'},
    {id:'cloud',label:'Cloud',icon:'☁',stack:'AWS S3 · EC2 · Route53 · MediaConvert',title:'Give good work room to grow.',text:'I integrated AWS S3, EC2, and Route53 for Treffas infrastructure and deployment automation. For Piccatune, I used AWS MediaConvert for video processing and transcoding across its mobile video experience.',href:'#experience',link:'See my cloud experience ↗'},
    {id:'automation',label:'Automation',icon:'✳',stack:'n8n · Zapier · Connected workflows',title:'More creating. Less repeating.',text:'At Iconcept IT Solutions, I implemented n8n and Zapier workflows that reduced manual processes by 60%, as reported in my resume. I also managed project lifecycles and mentored junior developers.',href:'#experience',link:'Follow my development journey ↗'}
  ];
  const root=document.querySelector('#portfolio-quest');
  const dialog=document.querySelector('#plane-mode');
  const viewport=dialog.querySelector('.flight-viewport');
  const info=dialog.querySelector('.flight-info');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const found=new Set(),keys=new Set(),topicButtons=new Map();
  let state=null,physics=null,world=null,generation=0,frame=0,last=0;
  let ready=false,paused=false,reading=null,fallback=false,opener=null,previousOverflow='';

  const canFly=()=>dialog.open&&ready&&world&&!paused&&!reading&&!fallback&&!reduced.matches&&!document.hidden;
  function announce(text){dialog.querySelector('.flight-announcement').textContent=text;}
  function updateProgress(){
    root.querySelector('#quest-count').textContent=`${found.size} / ${topics.length}`;
    root.querySelector('.quest-progress-track>span').style.width=`${found.size/topics.length*100}%`;
    root.querySelector('.quest-complete').hidden=found.size!==topics.length;
    dialog.querySelector('.flight-counter').textContent=`${found.size} / ${topics.length} explored`;
    topicButtons.forEach((buttons,id)=>buttons.forEach(button=>button.setAttribute('aria-pressed',String(found.has(id)))));
    dialog.querySelector('.flight-info-complete').hidden=found.size!==topics.length;
  }
  function showPreview(topic){
    found.add(topic.id);updateProgress();
    const note=root.querySelector('.quest-note');note.querySelector('.quest-note-icon').textContent=topic.icon;
    note.querySelector('h3').textContent=topic.title;note.querySelector('p').textContent=topic.text;
    const link=note.querySelector('a');link.href=topic.href;link.textContent=topic.link;
    root.querySelector('.quest-discovery').textContent=`${topic.label} discovered. ${found.size} of ${topics.length} field notes explored.`;
  }
  topics.forEach(topic=>{
    const buttons=[];
    for(const [container,handler]of[[root.querySelector('.quest-topics'),()=>showPreview(topic)],[dialog.querySelector('.flight-topics'),()=>showDiscovery(topic)]]){
      const button=document.createElement('button');button.type='button';button.textContent=`${topic.icon} ${topic.label}`;
      button.setAttribute('aria-pressed','false');button.addEventListener('click',handler);container.append(button);buttons.push(button);
    }
    topicButtons.set(topic.id,buttons);
  });
  function clearInput(){keys.clear();if(state){state.steerX=0;state.steerY=0;}}
  function paint(){if(state&&world){state.still=!canFly();world.render(state,performance.now(),true);}}
  function syncUI(){
    dialog.classList.toggle('is-reading',Boolean(reading));
    dialog.classList.toggle('is-flight-paused',paused&&!reading);
    dialog.querySelector('.flight-pause').textContent=paused?'Resume':'Pause';
    dialog.querySelector('.flight-pause').setAttribute('aria-pressed',String(paused));
    dialog.querySelector('.flight-pause').disabled=!ready||fallback||reduced.matches||Boolean(reading);
    dialog.querySelectorAll('[data-flight-move]').forEach(button=>button.disabled=!canFly());
    dialog.querySelector('.flight-continue').textContent=fallback||reduced.matches?'Back to the sky ↗':'Continue flying ↗';
  }
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;clearInput();}
  function schedule(){if(!frame&&canFly()){last=0;frame=requestAnimationFrame(tick);}}
  function showDiscovery(topic){
    if(!dialog.open)return;
    stop();reading=topic;showPreview(topic);
    info.querySelector('.flight-info-icon').textContent=topic.icon;
    info.querySelector('h3').textContent=topic.title;info.querySelector('.flight-info-text').textContent=topic.text;
    const stack=info.querySelector('.flight-info-stack');stack.replaceChildren();
    topic.stack.split(' · ').forEach(item=>{const tag=document.createElement('span');tag.textContent=item;stack.append(tag);});
    const link=info.querySelector('a');link.href=topic.href;link.textContent=topic.link;
    info.hidden=false;syncUI();paint();
    announce(`${topic.label} discovered. Flight paused. ${found.size} of ${topics.length} explored.`);
    info.querySelector('h3').focus({preventScroll:true});
  }
  function nextGuidance(){
    if(!state||reading)return;
    const gate=state.gates.filter(g=>!g.hit&&g.z<0).sort((a,b)=>b.z-a.z)[0];
    const text=gate?`${topics.find(topic=>topic.id===gate.id).label} ahead · ${Math.ceil(-gate.z/5)*5} m · ${Math.abs(gate.x-state.x)<1.5?'center':gate.x<state.x?'steer left':'steer right'}${Math.abs(gate.y-state.y)<1.5?'':gate.y>state.y?' + climb':' + descend'}`:'Keep flying. The next discovery is coming around.';
    const guide=dialog.querySelector('.flight-guidance');if(guide.textContent!==text)guide.textContent=text;
    dialog.querySelector('.flight-distance').textContent=`${Math.floor(state.distance)} m traveled`;
  }
  function tick(time){
    frame=0;if(!canFly())return;
    const dt=last?Math.min((time-last)/1000,.05):0;last=time;
    const hit=physics.advanceFlight(state,{x:Number(keys.has('right'))-Number(keys.has('left')),y:Number(keys.has('up'))-Number(keys.has('down'))},dt);
    state.still=false;world.render(state,time);nextGuidance();
    if(hit){showDiscovery(topics.find(topic=>topic.id===hit));return;}
    frame=requestAnimationFrame(tick);
  }
  function readingMode(message){
    fallback=true;stop();world?.dispose();world=null;ready=true;
    dialog.querySelector('.flight-fallback').hidden=false;
    dialog.querySelector('.flight-fallback-message').textContent=message;
    dialog.querySelector('.flight-guidance').textContent='Quiet skies · choose any topic below';syncUI();
  }
  async function open(event){
    if(dialog.open)return;
    opener=event?.currentTarget||document.activeElement;paused=false;reading=null;ready=false;fallback=false;
    info.hidden=true;dialog.querySelector('.flight-fallback').hidden=true;
    dialog.showModal();previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    window.dispatchEvent(new CustomEvent('portfolio-game-state',{detail:{open:true}}));
    viewport.focus({preventScroll:true});dialog.querySelector('.flight-guidance').textContent='Preparing the skies…';
    updateProgress();syncUI();const token=++generation;
    try{
      physics=await import('./flight-physics.mjs');if(token!==generation||!dialog.open)return;
      state=physics.createFlightState(topics);
      if(reduced.matches){readingMode('Reduced motion is on. Explore every gate with the topic buttons, without automatic flight.');return;}
      const {createFlightWorld}=await import('./flight-world.js');if(token!==generation||!dialog.open)return;
      if(reduced.matches){readingMode('Reduced motion is on. Explore every gate with the topic buttons, without automatic flight.');return;}
      world=createFlightWorld(viewport,topics,{onFailure(){readingMode('The 3D sky is unavailable on this device. Every discovery is still available below.');}});
      ready=true;syncUI();paint();nextGuidance();schedule();
    }catch{if(token===generation&&dialog.open)readingMode('The 3D sky could not load. Choose a topic below to discover the same experience.');}
  }
  function close(){
    ++generation;stop();world?.dispose();world=null;state=null;ready=false;reading=null;
    document.body.style.overflow=previousOverflow;
    window.dispatchEvent(new CustomEvent('portfolio-game-state',{detail:{open:false}}));opener?.focus({preventScroll:true});
  }
  document.querySelectorAll('[data-open-flight]').forEach(button=>button.addEventListener('click',open));
  dialog.querySelector('.flight-exit').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',close);
  info.querySelector('a').addEventListener('click',()=>dialog.close());
  dialog.querySelector('.flight-continue').addEventListener('click',()=>{
    reading=null;paused=false;info.hidden=true;clearInput();syncUI();paint();nextGuidance();schedule();viewport.focus({preventScroll:true});announce('Ready to explore the next gate.');
  });
  dialog.querySelector('.flight-pause').addEventListener('click',()=>{paused=!paused;stop();syncUI();paint();if(!paused)schedule();announce(paused?'Flight paused. Press Resume to continue.':'Flight resumed.');});
  dialog.querySelector('.flight-restart').addEventListener('click',()=>{
    if(!physics)return;stop();state=physics.createFlightState(topics);found.clear();updateProgress();reading=null;paused=false;info.hidden=true;
    syncUI();paint();nextGuidance();schedule();viewport.focus({preventScroll:true});announce('New flight. Five discoveries ahead.');
  });
  const keyMap={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
  dialog.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey)return;
    const key=keyMap[event.key]||keyMap[event.key.toLowerCase()];if(!key||!canFly())return;
    event.preventDefault();keys.add(key);
  });
  document.addEventListener('keyup',event=>{const key=keyMap[event.key]||keyMap[event.key.toLowerCase()];if(key)keys.delete(key);});
  dialog.querySelectorAll('[data-flight-move]').forEach(button=>{
    button.addEventListener('pointerdown',event=>{if(!canFly())return;event.preventDefault();keys.add(button.dataset.flightMove);button.setPointerCapture(event.pointerId);});
    const release=()=>keys.delete(button.dataset.flightMove);
    button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
    button.addEventListener('click',event=>{if(event.detail!==0||!canFly())return;const key=button.dataset.flightMove;keys.add(key);setTimeout(()=>keys.delete(key),180);});
  });
  function loseFocus(){clearInput();if(dialog.open&&ready&&!reading){paused=true;stop();syncUI();paint();}}
  window.addEventListener('blur',loseFocus);document.addEventListener('visibilitychange',()=>{if(document.hidden)loseFocus();});
  reduced.addEventListener('change',()=>{
    if(!dialog.open)return;stop();syncUI();paint();
    if(reduced.matches){dialog.querySelector('.flight-guidance').textContent='Quiet skies · choose any topic below';announce('Reduced motion enabled. Automatic flight stopped.');}
    else if(!fallback){nextGuidance();schedule();}
    else dialog.querySelector('.flight-fallback-message').textContent='Explore a topic below, or exit and re-enter Plane Mode to start a new flight.';
  });
  window.addEventListener('pagehide',event=>{stop();if(!event.persisted){world?.dispose();world=null;}});
})();
