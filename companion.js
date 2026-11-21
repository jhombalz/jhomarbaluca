// The SVG stays visible until the optional local Three.js scene renders successfully.
(() => {
  const buddy = document.querySelector('.scroll-buddy');
  const character = buddy.querySelector('.buddy-character');
  const pauseButton = buddy.querySelector('.buddy-pause');
  const bubble = buddy.querySelector('.buddy-bubble');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('main section')];
  const messages = {
    home: 'Hey, I’m JB. Scroll with me!',
    about: 'A little about the human behind the code.',
    skills: 'Tools of the trade. Curiosity included.',
    projects: 'This is where ideas become real.',
    experience: 'Every chapter taught me something.',
    services: 'Got an idea? We can build it.',
    contact: 'Your next great idea starts with hello.'
  };
  let paused = false, hidden = false, frame = 0, lastY = window.scrollY;
  let target = 0, position = 0, lastTime = 0, settleTimer, waveTimer;
  let scene3D = null, loading3D = false, failed3D = false, currentSection = 'home';
  let scrollImpulse = 0;
  buddy.hidden = false;

  function canMove() { return !paused && !reduced.matches && !hidden; }
  function render(time) {
    frame = 0;
    if (!canMove()) return;
    const step = lastTime ? Math.min(3, (time - lastTime) / 16.67) : 1;
    lastTime = time;
    position += (target - position) * (1 - Math.pow(0.86, step));
    const drift = Math.sin(window.scrollY / 180) * (window.innerWidth > 700 ? 10 : 4);
    buddy.style.transform = `translate3d(${drift}px, ${-position}px, 0)`;
    if (Math.abs(target - position) > 0.1) frame = requestAnimationFrame(render);
    else lastTime = 0;
  }
  function queueMotion() { if (!frame && canMove()) frame = requestAnimationFrame(render); }
  function update() {
    const y = window.scrollY;
    const distance = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, y / distance));
    target = progress * Math.min(window.innerWidth > 700 ? 180 : 55, window.innerHeight * 0.22);
    const delta = y - lastY;
    scrollImpulse = Math.max(-1, Math.min(1, delta / 60));
    scene3D?.scroll(scrollImpulse);
    if (delta && canMove()) {
      character.style.setProperty('--buddy-lean', `${Math.max(-12, Math.min(12, delta * 0.45))}deg`);
      buddy.style.setProperty('--buddy-look', `${delta > 0 ? 2 : -2}px`);
      buddy.classList.add('is-scrolling');
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        buddy.classList.remove('is-scrolling');
        character.style.setProperty('--buddy-lean', '0deg');
        buddy.style.setProperty('--buddy-look', '0px');
      }, 180);
    }
    lastY = y;
    let current = sections[0];
    for (const section of sections) if (section.getBoundingClientRect().top <= window.innerHeight * 0.55) current = section;
    const key = current?.id || (current?.classList.contains('services') ? 'services' : 'home');
    if (key !== currentSection) { currentSection = key; scene3D?.section(key); }
    const message = messages[key] || messages.home;
    if (bubble.textContent !== message) bubble.textContent = message;
    queueMotion();
  }
  function syncMotion() {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    clearTimeout(settleTimer);
    buddy.classList.remove('is-scrolling');
    buddy.classList.toggle('is-paused', paused || reduced.matches);
    scene3D?.setMotion(canMove());
    character.style.setProperty('--buddy-lean', '0deg');
    buddy.style.setProperty('--buddy-look', '0px');
    if (!canMove()) buddy.style.transform = 'none';
    else { position = target; update(); }
  }
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    const label = paused ? 'Resume companion animation' : 'Pause companion animation';
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', label); pauseButton.title = label;
    pauseButton.textContent = paused ? '▶' : 'Ⅱ';
    syncMotion();
  });
  character.addEventListener('click', () => {
    if (!canMove()) return;
    scene3D?.wave();
    buddy.classList.remove('is-greeting');
    void character.offsetWidth;
    buddy.classList.add('is-greeting');
    clearTimeout(waveTimer);
    waveTimer = setTimeout(() => buddy.classList.remove('is-greeting'), 1100);
  });
  async function load3D() {
    if (loading3D || scene3D || failed3D || hidden || reduced.matches) return;
    loading3D = true;
    try {
      const { createCompanion } = await import('./companion-3d.js');
      if (hidden || reduced.matches) return;
      scene3D = createCompanion(character, {
        onFailure() {
          buddy.classList.remove('has-3d'); scene3D = null; failed3D = true;
        }
      });
      buddy.classList.add('has-3d');
      scene3D.section(currentSection); scene3D.setMotion(canMove());
    } catch {
      // Includes unavailable WebGL, a failed import, and file:// module restrictions.
      failed3D = true; buddy.classList.remove('has-3d');
    } finally { loading3D = false; }
  }
  function onMotionPreference() {
    syncMotion();
    if (reduced.matches) buddy.classList.remove('is-greeting');
    else load3D();
  }
  buddy.querySelector('.buddy-hide').addEventListener('click', () => {
    hidden = true; syncMotion(); buddy.hidden = true;
    clearTimeout(waveTimer); scene3D?.dispose(); scene3D = null;
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
    reduced.removeEventListener('change', onMotionPreference);
  });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  reduced.addEventListener('change', onMotionPreference);
  update(); syncMotion();
  if ('requestIdleCallback' in window) requestIdleCallback(load3D, { timeout: 1800 });
  else setTimeout(load3D, 300);
})();
