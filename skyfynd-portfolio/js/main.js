/* ========================================
   SKYFYND PORTFOLIO PROTOTYPE - Main JS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTabSwitcher();
  initScrollAnimations();
  initSmoothScroll();
});

/* ===== TAB SWITCHER ===== */
function initTabSwitcher() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      // Update buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update panels
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `panel-${tabId}`) {
          panel.classList.add('active');
        }
      });
    });
  });
}

/* ===== SCROLL ANIMATIONS ===== */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.section-label, .section-headline, .section-body, .gallery-item, .feature-card, .campaign-card, .device-frame'
  );

  // Add animation class
  animatedElements.forEach(el => {
    el.classList.add('fade-in-up');
  });

  // Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  animatedElements.forEach(el => observer.observe(el));
}

/* ===== SMOOTH SCROLL ===== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
