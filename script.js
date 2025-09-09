// Basic CSS-driven interactions
const ctaButton = document.querySelector('.cta');
if (ctaButton) {
  ctaButton.addEventListener('mouseenter', () => {
    ctaButton.style.background = '#f2f2f2';
  });
  ctaButton.addEventListener('mouseleave', () => {
    ctaButton.style.background = '#ffffff';
  });
}

// GSAP Motion Design
window.addEventListener('DOMContentLoaded', () => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.nav', { y: -40, opacity: 0, duration: 0.6 })
    .from('.hero__bg', { scale: 1.18, duration: 1.2 }, '<')
    .from('.hero__overlay', { opacity: 0, duration: 0.8 }, '<')
    .from('.hero__title .line', { yPercent: 120, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.2')
    .from('.hero__subtitle', { y: 20, opacity: 0, duration: 0.6 }, '-=0.35')
    .from('.cta', { y: 20, opacity: 0, duration: 0.6 }, '-=0.45')
    .from('.partners__rail', { scaleX: 0, transformOrigin: 'left center', duration: 0.7 }, '-=0.2')
    .from('.logos .logo', { y: 12, opacity: 0, duration: 0.5, stagger: 0.12 }, '-=0.2');

  // Parallax on mouse move (subtle)
  const bg = document.querySelector('.hero__bg');
  if (bg) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(bg, { duration: 1.2, ease: 'power2.out', x: x * 12, y: y * 8, scale: 1.12 });
    });
  }
});

