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
