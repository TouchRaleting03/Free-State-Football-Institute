export function initNavigation() {
  const navbar = document.getElementById('navbar');
  const navLinks = navbar.querySelectorAll('a');
  const bMenu = document.getElementById('b-menu');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      if (href.startsWith('#')) {
        e.preventDefault();

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }

        if (navbar.classList.contains('active')) {
          navbar.classList.remove('active');
          document.getElementById('b-container').classList.remove('open');
        }
      }
    });
  });

  bMenu.addEventListener('click', () => {
    navbar.classList.toggle('active');
    document.getElementById('b-container').classList.toggle('open');
    const expanded = navbar.classList.contains('active');
    bMenu.setAttribute('aria-expanded', expanded);
  });

  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}
