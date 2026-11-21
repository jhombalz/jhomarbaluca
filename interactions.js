// Progressive pointer effects: the native cursor and all controls remain intact.
(() => {
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.append(ring);
  const cards = [...document.querySelectorAll('.desk-card, .project-card, .skill-grid article, .web-stack-grid article, .services-grid article')];
  cards.forEach(card => card.classList.add('motion-card'));
  let enabled = false, frame = 0, lastTime = 0, visible = false;
  let x = 0, y = 0, aimX = 0, aimY = 0, currentCard = null, bounds = null;
  const interactiveSelector = 'a, button, summary, [role="button"]';
  const editableSelector = 'input, textarea, select, [contenteditable="true"]';
  function resetCard() {
    if (!currentCard) return;
    currentCard.classList.remove('is-tilting');
    currentCard.style.removeProperty('--tilt-x');
    currentCard.style.removeProperty('--tilt-y');
    currentCard.style.removeProperty('--tilt-angle');
    currentCard = null; bounds = null;
  }
  function draw(time) {
    frame = 0;
    if (!enabled || !visible) return;
    const step = lastTime ? Math.min(3, (time - lastTime) / 16.67) : 1;
    lastTime = time;
    const ease = 1 - Math.pow(0.72, step);
    x += (aimX - x) * ease; y += (aimY - y) * ease;
    ring.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
    if (currentCard && bounds) {
      const dx = Math.max(-1, Math.min(1, (aimX - bounds.left) / bounds.width * 2 - 1));
      const dy = Math.max(-1, Math.min(1, (aimY - bounds.top) / bounds.height * 2 - 1));
      currentCard.style.setProperty('--tilt-x', -dy);
      currentCard.style.setProperty('--tilt-y', dx);
      currentCard.style.setProperty('--tilt-angle', `${Math.min(1, Math.hypot(dx, dy)) * 4}deg`);
    }
    if (Math.abs(aimX - x) + Math.abs(aimY - y) > 0.2) frame = requestAnimationFrame(draw);
    else lastTime = 0;
  }
  function move(event) {
    if (!enabled || event.pointerType === 'touch') return;
    const target = event.target instanceof Element ? event.target : null;
    const editing = target?.closest(editableSelector);
    if (editing || document.querySelector('dialog[open]')) { hide(); return; }
    aimX = event.clientX; aimY = event.clientY;
    if (!visible) { x = aimX; y = aimY; }
    visible = true;
    ring.classList.add('is-visible');
    ring.classList.toggle('is-interactive', Boolean(target?.closest(interactiveSelector)));
    const card = target?.closest('.motion-card');
    if (card !== currentCard) {
      resetCard();
      if (card) {
        currentCard = card; bounds = card.getBoundingClientRect();
        card.classList.add('is-tilting');
      }
    }
    if (!frame) frame = requestAnimationFrame(draw);
  }
  function hide() {
    visible = false; cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    ring.classList.remove('is-visible', 'is-interactive'); resetCard();
  }
  function press(event) {
    if (!enabled || event.pointerType === 'touch' || !(event.target instanceof Element)) return;
    if (!event.target.closest(interactiveSelector) || event.target.closest(editableSelector) || document.querySelector('dialog[open]')) return;
    const ripple = document.createElement('span');
    ripple.className = 'pointer-ripple'; ripple.setAttribute('aria-hidden', 'true');
    ripple.style.left = `${event.clientX}px`; ripple.style.top = `${event.clientY}px`;
    document.body.append(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    // Also remove it if the motion preference changes before animationend.
    setTimeout(() => ripple.remove(), 750);
  }
  function configure() {
    enabled = pointer.matches && !reduced.matches;
    document.documentElement.classList.toggle('pointer-effects', enabled);
    hide();
    if (!enabled) document.querySelectorAll('.pointer-ripple').forEach(ripple => ripple.remove());
  }
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerdown', press, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  document.addEventListener('keydown', event => { if (event.key === 'Tab') hide(); });
  window.addEventListener('blur', hide);
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('resize', hide, { passive: true });
  document.querySelectorAll('dialog').forEach(dialog => new MutationObserver(hide).observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  pointer.addEventListener('change', configure); reduced.addEventListener('change', configure);
  configure();
})();
