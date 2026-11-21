const skillGroups = [
  ['⌘', 'Frontend', ['HTML5 & CSS3', 'JavaScript', 'jQuery', 'ReactJS', 'Vue.js']],
  ['▯', 'Mobile', ['Flutter', 'React Native']],
  ['▦', 'Backend & data', ['PHP', 'Laravel', 'Node.js', 'MySQL', 'PostgreSQL', 'MongoDB']],
  ['☁', 'Cloud & automation', ['AWS S3', 'AWS EC2', 'Route53', 'MediaConvert', 'n8n', 'Zapier']]
];
const grid = document.querySelector('#skill-grid');
skillGroups.forEach(([icon, title, skills]) => {
  const card = document.createElement('article');
  const symbol = document.createElement('span'); symbol.className = 'skill-icon'; symbol.textContent = icon;
  const heading = document.createElement('h3'); heading.textContent = title;
  const tags = document.createElement('div'); tags.className = 'skill-tags';
  skills.forEach(skill => { const tag = document.createElement('span'); tag.textContent = skill; tags.append(tag); });
  card.append(symbol, heading, tags); grid.append(card);
});
document.querySelector('#year').textContent = new Date().getFullYear();
const toggle = document.querySelector('.menu-toggle'), nav = document.querySelector('nav');
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }));
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) nav.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id)); }), { rootMargin: '-20% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
const projects = {
  treffas: { title: 'Treffas — online booking', description: 'An online booking system developed using ReactJS, Node.js, and Laravel.', features: ['Implemented RESTful APIs to connect application services.', 'Optimized database queries, improving performance by 40%.', 'Integrated AWS S3, EC2, and Route53 for cloud infrastructure and deployment automation.'] },
  piccatune: { title: 'Piccatune — social meets commerce', description: 'A Flutter-based social media application combining short-form video with e-commerce bidding.', features: ['Built a scalable Node.js backend with RESTful APIs.', 'Integrated Firebase for real-time database, authentication, and cloud storage.', 'Used AWS MediaConvert for video processing and transcoding.', 'Optimized video streaming across iOS and Android.'] }
};
const dialog = document.querySelector('#project-dialog');
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => { const project = projects[button.dataset.project]; document.querySelector('#dialog-title').textContent = project.title; document.querySelector('#dialog-description').textContent = project.description; const list = document.querySelector('#dialog-features'); list.replaceChildren(); project.features.forEach(feature => { const li = document.createElement('li'); li.textContent = feature; list.append(li); }); dialog.showModal(); }));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
document.querySelector('#dialog-contact').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
document.querySelector('#contact-form').addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.currentTarget); const body = `Hi Jhomar,\n\n${data.get('message')}\n\nFrom: ${data.get('name')}\nEmail: ${data.get('email')}`; window.location.href = `mailto:jhomar.baluca@gmail.com?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(body)}`; document.querySelector('#form-status').textContent = 'Your email draft is ready in your email app. If it did not open, email jhomar.baluca@gmail.com directly.'; });

// Use native scrolling so keyboard, touch, and anchor navigation stay familiar.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const pageHeader = document.querySelector('header');
const workspace = document.querySelector('.workspace');
let scrollFrame = 0;
function updateScrollEffects() {
  scrollFrame = 0;
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
  document.documentElement.style.setProperty('--scroll-progress', progress);
  pageHeader.classList.toggle('is-scrolled', window.scrollY > 20);
  if (workspace) {
    const offset = !motionPreference.matches && window.innerWidth > 700 ? Math.min(1, Math.max(0, window.scrollY / 650)) : 0;
    workspace.style.setProperty('--workspace-y', `${offset * -20}px`);
    workspace.style.setProperty('--workspace-tilt', `${offset * 3}deg`);
  }
}
function requestScrollUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollEffects);
}
window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate, { passive: true });
let revealObserver;
const revealTargets = document.querySelectorAll('.section-heading, .about > div, .skill-grid article, .project-card, .experience > div:first-child, .timeline article, .services > h2, .services-grid article, .contact > div, .contact > form');
function configureReveals() {
  revealObserver?.disconnect();
  revealTargets.forEach(element => element.classList.remove('reveal-pending', 'is-visible'));
  if (!motionPreference.matches && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
    revealTargets.forEach(element => {
      // Leave content already on screen visible, including after a deep-link load.
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      const siblings = [...element.parentElement.children];
      const index = siblings.indexOf(element);
      element.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 70}ms`);
      element.classList.add('reveal-pending');
      revealObserver.observe(element);
    });
  }
  requestScrollUpdate();
}
motionPreference.addEventListener('change', configureReveals);
configureReveals();
