// Move a short stroke along each frame; scrolling never rotates the content itself.
(() => {
  const namespace = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = document.querySelectorAll('.workspace, #portfolio-quest, .desk-card, .project-card, .skill-grid article, .web-stack-grid article, .services-grid article, .project-visual .mock-window, .project-visual .phone');
  const outlines = new Map();
  let frame = 0;

  function fit(element) {
    const entry = outlines.get(element);
    if (!entry) return;
    const width = element.clientWidth, height = element.clientHeight;
    if (!width || !height) return;
    const radius = Math.min(parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0, width / 2, height / 2);
    entry.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    entry.path.setAttribute('width', Math.max(0, width - 4));
    entry.path.setAttribute('height', Math.max(0, height - 4));
    entry.path.setAttribute('rx', Math.max(0, radius - 2));
  }
  function paint() {
    frame = 0;
    const travel = reduced.matches ? 0 : window.scrollY * 0.04;
    outlines.forEach(entry => {
      if (!entry.visible) return;
      entry.path.style.strokeDashoffset = String(-((travel + entry.phase) % 100));
    });
  }
  function queue() { if (!frame) frame = requestAnimationFrame(paint); }
  const visibility = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => { outlines.get(target).visible = isIntersecting; });
    queue();
  }, { rootMargin: '80px' }) : null;
  const resize = 'ResizeObserver' in window ? new ResizeObserver(entries => {
    entries.forEach(({ target }) => fit(target)); queue();
  }) : null;

  targets.forEach((element, index) => {
    const svg = document.createElementNS(namespace, 'svg');
    svg.classList.add('scroll-outline');
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    svg.setAttribute('preserveAspectRatio', 'none');
    const path = document.createElementNS(namespace, 'rect');
    path.setAttribute('x', '2'); path.setAttribute('y', '2');
    path.setAttribute('pathLength', '100');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(path); element.append(svg); element.classList.add('has-scroll-outline');
    outlines.set(element, { svg, path, phase: (index * 17 + 8) % 100, visible: true });
    fit(element); resize?.observe(element); visibility?.observe(element);
  });
  window.addEventListener('scroll', queue, { passive: true });
  if (!resize) window.addEventListener('resize', () => { outlines.forEach((_, element) => fit(element)); queue(); }, { passive: true });
  reduced.addEventListener('change', queue);
  queue();
})();
