(function () {
  // Utilities
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
  const isVisible = (el) => !!(el && el.offsetParent !== null);
  const debounce = (fn, wait = 120) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Elements (support both .menu-toggle or b-menu variants)
    const bMenu = qs('#b-menu') || qs('.menu-toggle');
    const bContainer = qs('#b-container') || (bMenu && bMenu.parentElement);
    const nav = qs('#navbar');
    const bNav = qs('.b-nav'); // <-- new: external burger nav block
    const body = document.body;
    const NAV_BREAKPOINT_PX = 900;
    const compactToggle = qs('#compact-toggle');

    // Focus-trap helper for overlay nav
    function trapFocus(container, enabled) {
      const FOCUSABLE = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
      const nodes = qsa(FOCUSABLE, container).filter(n => !n.hasAttribute('disabled'));
      if (!enabled) {
        container._restoreFocus && container._restoreFocus();
        container.removeAttribute('data-trap-active');
        return;
      }
      if (!nodes.length) return;
      container.setAttribute('data-trap-active', 'true');
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      container._restoreFocus = () => {
        try { first.focus(); } catch (e) {}
      };
      // ensure first focus
      setTimeout(() => first.focus(), 20);

      function handleKey(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      container._focusHandler = handleKey;
      document.addEventListener('keydown', handleKey);
    }
    function releaseTrap(container) {
      if (!container) return;
      document.removeEventListener('keydown', container._focusHandler || (()=>{}));
      container._focusHandler = null;
      container._restoreFocus && container._restoreFocus();
      container._restoreFocus = null;
      container.removeAttribute('data-trap-active');
    }

    // Menu open/close
    function openMenu() {
      if (!nav) return;
      nav.classList.add('active');
      if (bMenu) bMenu.setAttribute('aria-expanded', 'true');
      if (bContainer) bContainer.classList.add('open');
      if (bNav) bNav.classList.add('visible'); // show burger menu content
      body.classList.add('menu-open');
      // focus trap
      trapFocus(nav, true);
    }
    function closeMenu() {
      if (!nav) return;
      nav.classList.remove('active');
      if (bMenu) bMenu.setAttribute('aria-expanded', 'false');
      if (bContainer) bContainer.classList.remove('open');
      if (bNav) bNav.classList.remove('visible'); // hide burger menu content
      body.classList.remove('menu-open');
      // release focus trap
      releaseTrap(nav);
    }
    function toggleMenu() {
      if (!nav) return;
      if (nav.classList.contains('active')) closeMenu();
      else openMenu();
    }

    if (bMenu) {
      // click and keyboard activation
      bMenu.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu();
      });
      bMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleMenu();
        }
      });
    }

    // Close on link click
    if (nav) {
      qsa('a[href]', nav).forEach(link => {
        link.addEventListener('click', (e) => {
          // if anchor to same page, close after a short delay to allow jump
          setTimeout(() => closeMenu(), 50);
        });
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav || !bContainer) return;
      if (!nav.contains(e.target) && !bContainer.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Keep state correct on resize (desktop: ensure closed)
    const mq = window.matchMedia(`(min-width: ${NAV_BREAKPOINT_PX + 1}px)`);
    function handleResize(e) {
      if (e.matches) {
        closeMenu();
      }
    }
    if (mq.addEventListener) mq.addEventListener('change', handleResize);
    else mq.addListener(handleResize);
    handleResize(mq);

    // Smooth scrolling for internal anchors
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      // skip if it's only '#'
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      a.addEventListener('click', (e) => {
        const url = new URL(a.href, location.href);
        if (url.hash && url.pathname === location.pathname) {
          const target = document.getElementById(url.hash.slice(1));
          if (target) {
            e.preventDefault();
            closeMenu();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // update focus for accessibility
            setTimeout(() => {
              try { target.setAttribute('tabindex', '-1'); target.focus(); } catch (err) {}
            }, 400);
          }
        }
      });
    });

    // Contact form handling (light client-side validation)
    const contactForm = qs('#contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(contactForm);
        const name = (fd.get('name') || '').toString().trim();
        const email = (fd.get('email') || '').toString().trim();
        const message = (fd.get('message') || '').toString().trim();
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!name || !email || !message) {
          alert('Please complete all fields before sending.');
          return;
        }
        if (!emailRe.test(email)) {
          alert('Please enter a valid email address.');
          return;
        }

        // Placeholder: send via fetch to server endpoint when ready
        try {
          // Example: await fetch('/contact', { method: 'POST', body: fd });
          // For now, show success and reset form
          alert('Message sent. Thank you!');
          contactForm.reset();
        } catch (err) {
          console.error(err);
          alert('Sorry — something went wrong. Try again later.');
        }
      });
    }

    // Lazy load images using data-src (non-destructive)
    const lazyImgs = qsa('img[data-src]');
    if ('IntersectionObserver' in window && lazyImgs.length) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          obs.unobserve(img);
        });
      }, { rootMargin: '100px 0px', threshold: 0.01 });
      lazyImgs.forEach(img => io.observe(img));
    } else {
      // fallback: load immediately
      lazyImgs.forEach(img => { img.src = img.dataset.src; img.removeAttribute('data-src'); });
    }

    // Ensure images and media never overflow
    // (some pages may override, keep here as a safety)
    document.querySelectorAll('img').forEach(img => {
      img.style.maxWidth = img.style.maxWidth || '100%';
      img.style.height = img.style.height || 'auto';
      img.decoding = img.decoding || 'async';
    });

    // Small UX: show/hide "skip-link" when focused (some older CSS may hide it)
    const skip = qs('.skip-link');
    if (skip) {
      skip.addEventListener('focus', () => skip.classList.add('visible'));
      skip.addEventListener('blur', () => skip.classList.remove('visible'));
    }

    // restore compact preference from localStorage
    (function restoreCompactPref() {
      try {
        const saved = localStorage.getItem('fsfi-compact');
        const enabled = saved === '1';
        if (enabled) {
          body.classList.add('compact');
          if (compactToggle) compactToggle.setAttribute('aria-pressed', 'true');
        } else {
          if (compactToggle) compactToggle.setAttribute('aria-pressed', 'false');
        }
      } catch (e) { /* ignore storage errors */ }
    })();

    // toggle compact mode and persist preference
    if (compactToggle) {
      compactToggle.addEventListener('click', (e) => {
        const enabled = !body.classList.contains('compact');
        body.classList.toggle('compact', enabled);
        compactToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        try { localStorage.setItem('fsfi-compact', enabled ? '1' : '0'); } catch (err) {}
      });
    }

    // Expose minimal API for debugging if needed
    window.__FSFI = {
      openMenu,
      closeMenu,
      toggleMenu,
    };
  });
})();