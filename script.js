const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation');
}));
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle('visible', entry.isIntersecting);
  });
}, { threshold: 0.02, rootMargin: '10% 0px 10% 0px' });
document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));
const navLinks = [...document.querySelectorAll('.nav-link')];
const pageSections = [...document.querySelectorAll('main > section[id]')];
function showSection(id, { scroll = true } = {}) {
  const selected = pageSections.find((section) => section.id === id) || pageSections[0];
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${selected.id}`));
  if (scroll) selected.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
const sectionObserver = new IntersectionObserver((entries) => {
  const visibleSections = entries.filter((entry) => entry.isIntersecting);
  if (!visibleSections.length) return;
  const selected = visibleSections.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0].target;
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${selected.id}`));
}, { threshold: [0.05, 0.2, 0.4], rootMargin: '-15% 0px -55% 0px' });
pageSections.forEach((section) => sectionObserver.observe(section));
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href').slice(1);
  if (!pageSections.some((section) => section.id === id)) return;
  event.preventDefault();
  history.pushState(null, '', `#${id}`);
  showSection(id);
});
window.addEventListener('popstate', () => showSection(location.hash.slice(1) || 'home'));
showSection(location.hash.slice(1) || 'home', { scroll: false });
document.querySelector('.contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const status = form.querySelector('.form-status');
  const submitButton = form.querySelector('button[type="submit"]');
  const values = Object.fromEntries(new FormData(form).entries());
  if (values._honey) return;

  if (window.location.protocol === 'file:') {
    const subject = encodeURIComponent(`Portfolio contact from ${values.name}`);
    const body = encodeURIComponent(`Name: ${values.name}\nEmail: ${values.email}\n\n${values.message}`);
    status.textContent = 'Opening your email app for this local preview.';
    window.location.href = `mailto:nuthalapatibhagyasri55@gmail.com?subject=${subject}&body=${body}`;
    return;
  }

  submitButton.disabled = true;
  status.textContent = 'Sending your message…';
  const endpoint = form.action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name: values.name,
      email: values.email,
      message: values.message,
      _replyto: values.email,
      _subject: `Portfolio contact from ${values.name}`,
      _honey: values._honey,
    }),
  })
    .then(async (response) => {
      const result = await response.json();
      if (!response.ok || result.success === false || result.success === 'false') {
        throw new Error(result.message || 'The message could not be sent.');
      }
      status.textContent = 'Thanks — your message has been sent.';
      form.reset();
    })
    .catch(() => {
      status.textContent = 'Sorry, the message could not be sent. Please email nuthalapatibhagyasri55@gmail.com.';
    })
    .finally(() => { submitButton.disabled = false; });
});
