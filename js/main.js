/* ========================================
   GUAC & ROLL - Main JavaScript
   ======================================== */

// Check for tour mode BEFORE DOMContentLoaded
// Supports both sessionStorage AND URL parameter (?tour=true)
const urlParams = new URLSearchParams(window.location.search);
if (sessionStorage.getItem('autoTour') === 'true' || urlParams.get('tour') === 'true') {
  window._tourActive = true;

  // Immediately disable scroll snapping before page renders
  const tourStyle = document.createElement('style');
  tourStyle.id = 'tour-snap-disable';
  tourStyle.textContent = `
    html, body, .hero, .pre-menu, .carousel-row, .contact-section, .parallax-menu-section {
      scroll-snap-type: none !important;
      scroll-snap-align: none !important;
      scroll-snap-stop: normal !important;
      scroll-behavior: auto !important;
    }
  `;
  document.head.appendChild(tourStyle);
}

document.addEventListener("DOMContentLoaded", function () {
  // ===== NUTRITION DATA =====
  const nutritionData = {
    "cancun-crunch": { Calories: 520, Protein: "24 g", Carbs: "48 g", Fat: "24 g", Sodium: "880 mg" },
    "acapulco-heat": { Calories: 540, Protein: "26 g", Carbs: "46 g", Fat: "26 g", Sodium: "920 mg" },
    "taco-santana": { Calories: 560, Protein: "28 g", Carbs: "42 g", Fat: "28 g", Sodium: "900 mg" },
    "mana-mango-taco": { Calories: 510, Protein: "25 g", Carbs: "45 g", Fat: "23 g", Sodium: "860 mg" },
    "tulum-verde": { Calories: 430, Protein: "16 g", Carbs: "44 g", Fat: "18 g", Sodium: "760 mg" },
    "cdmx-street-classic": { Calories: 540, Protein: "27 g", Carbs: "47 g", Fat: "25 g", Sodium: "910 mg" },
    "baja-rocker": { Calories: 550, Protein: "25 g", Carbs: "46 g", Fat: "27 g", Sodium: "930 mg" },
    "santana-solo": { Calories: 820, Protein: "36 g", Carbs: "78 g", Fat: "32 g", Sodium: "1120 mg" },
    "mana-mix-tour": { Calories: 780, Protein: "34 g", Carbs: "80 g", Fat: "28 g", Sodium: "1080 mg" },
    "acapulco-wave": { Calories: 840, Protein: "35 g", Carbs: "82 g", Fat: "34 g", Sodium: "1180 mg" },
    "guadalajara-groove": { Calories: 790, Protein: "33 g", Carbs: "76 g", Fat: "30 g", Sodium: "1100 mg" },
    "viva-veggie-tour": { Calories: 720, Protein: "20 g", Carbs: "86 g", Fat: "24 g", Sodium: "960 mg" },
    "riviera-maya-bowl": { Calories: 760, Protein: "32 g", Carbs: "78 g", Fat: "26 g", Sodium: "1040 mg" },
    "oaxacan-ember-bowl": { Calories: 730, Protein: "30 g", Carbs: "74 g", Fat: "27 g", Sodium: "1010 mg" },
    "rock-verde-bowl": { Calories: 710, Protein: "30 g", Carbs: "70 g", Fat: "25 g", Sodium: "980 mg" },
    "guac-roll-chips": { Calories: 520, Protein: "7 g", Carbs: "50 g", Fat: "32 g", Sodium: "680 mg" },
    "fiesta-fries": { Calories: 610, Protein: "7 g", Carbs: "63 g", Fat: "34 g", Sodium: "740 mg" },
    "cabo-elote-cup": { Calories: 380, Protein: "10 g", Carbs: "38 g", Fat: "20 g", Sodium: "620 mg" },
    "rockstar-salsa-trio": { Calories: 140, Protein: "3 g", Carbs: "18 g", Fat: "6 g", Sodium: "380 mg" },
    "jalisco-jam-horchata": { Calories: 260, Protein: "4 g", Carbs: "46 g", Fat: "6 g", Sodium: "120 mg" },
    "lime-roll-agua": { Calories: 120, Protein: "0 g", Carbs: "30 g", Fat: "0 g", Sodium: "15 mg" },
    "mango-mana-refresher": { Calories: 160, Protein: "1 g", Carbs: "38 g", Fat: "0 g", Sodium: "25 mg" },
    "cafe-tacvba-cold-brew": { Calories: 110, Protein: "2 g", Carbs: "22 g", Fat: "2 g", Sodium: "40 mg" }
  };

  // ===== CART STATE =====
  const cart = {};
  const CART_STORAGE_KEY = "gr_cart_v1";
  const TIP_STORAGE_KEY = "gr_tip_v1";
  const TAX_RATE = 0.0875;
  let tipPercent = 0;

  // ===== DOM REFS =====
  const cartItemsEl = document.getElementById("cart-items");
  const cartEmptyEl = document.getElementById("cart-empty");
  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");
  const cartDrawer = document.getElementById("cart");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartToggleBtn = document.getElementById("cart-toggle");
  const cartToggleBadge = document.getElementById("cart-toggle-badge");
  const subtotalEl = document.getElementById("subtotal");
  const taxEl = document.getElementById("tax");
  const finalEl = document.getElementById("final");
  const heroCta = document.getElementById("hero-cta");
  const heroOverlay = document.querySelector(".hero-overlay");

  // ===== HERO ANIMATIONS =====
  const heroVideo = document.querySelector(".hero-video");
  const ellipses = document.querySelectorAll('.ellipse');

  // Force video to play (handle autoplay restrictions)
  if (heroVideo) {
    // Try to play immediately
    heroVideo.play().catch(function(error) {
      console.log("Video autoplay prevented, will try on user interaction");
    });

    // Also try when video has loaded enough data
    heroVideo.addEventListener('canplay', function() {
      heroVideo.play().catch(function() {});
    });

    // Fallback: try on any user interaction
    document.addEventListener('click', function playOnClick() {
      heroVideo.play().catch(function() {});
      document.removeEventListener('click', playOnClick);
    }, { once: true });
  }

  if (heroCta) {
    // Fade in after 2 seconds
    setTimeout(() => {
      heroCta.classList.add("pop-in");

      // Trigger ellipse dancing animation when button appears
      // Animation includes 3s dancing + 2s smooth fade-out built in
      if (ellipses.length) {
        ellipses.forEach(el => el.classList.add('dancing'));
      }
    }, 2000);

    heroCta.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("tacos");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Overlay transition: start at 2s, gradually increase over ~8s
  if (heroOverlay) {
    // Set transition duration (adjust to match your video length minus 2s)
    heroOverlay.style.transition = "background 8s ease, backdrop-filter 8s ease, -webkit-backdrop-filter 8s ease";

    // Start transition after 2 second delay
    setTimeout(function() {
      heroOverlay.classList.add("fade-in");
    }, 2000);
  }

  // ===== CARDS ANIMATION =====
  const grid = document.querySelector(".cards-grid");
  if (grid) {
    const cards = Array.from(grid.querySelectorAll(".cards-card"));
    let animationTriggered = false;

    function isInViewport(el) {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
    }

    function triggerAnimation() {
      if (animationTriggered || cards.length < 5) return;
      animationTriggered = true;

      const center = cards[2];
      const wave1Left = cards[1];
      const wave1Right = cards[3];
      const wave2Left = cards[0];
      const wave2Right = cards[4];

      center.classList.add("animate-center");
      setTimeout(() => {
        wave1Left.classList.add("animate-wave-1-left");
        wave1Right.classList.add("animate-wave-1-right");
      }, 250);
      setTimeout(() => {
        wave2Left.classList.add("animate-wave-2-left");
        wave2Right.classList.add("animate-wave-2-right");
      }, 450);
      setTimeout(() => {
        cards.forEach(card => {
          card.style.opacity = "1";
          card.style.transform = "translateY(0) scale(1)";
          card.classList.add("floating");
        });
      }, 900);
    }

    function onScroll() {
      if (!animationTriggered && isInViewport(grid)) triggerAnimation();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ===== PARALLAX CAROUSEL MODULE =====
  (function initParallaxCarousel() {
    const parallaxSection = document.querySelector('.parallax-menu-section');
    if (!parallaxSection) return;

    // Skip parallax effects during tour to prevent jitter
    const skipParallax = window._tourActive;

    // Parallax background layers
    const layerFar = document.querySelector('.parallax-layer--far');
    const layerMid = document.querySelector('.parallax-layer--mid');
    const layerNear = document.querySelector('.parallax-layer--near');

    // Parallax scroll effect
    let ticking = false;
    function updateParallax() {
      const scrollY = window.scrollY;
      const sectionTop = parallaxSection.offsetTop;
      const offset = scrollY - sectionTop;

      if (layerFar) layerFar.style.transform = `translateY(${offset * 0.1}px)`;
      if (layerMid) layerMid.style.transform = `translateY(${offset * 0.3}px)`;
      if (layerNear) layerNear.style.transform = `translateY(${offset * 0.5}px)`;

      ticking = false;
    }

    // Only add parallax scroll listener if not in tour mode
    if (!skipParallax) {
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      }, { passive: true });
    }

    // Card text sweep animations with IntersectionObserver
    const menuCards = document.querySelectorAll('.menu-card');
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          entry.target.classList.add('is-active');
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px'
    });

    menuCards.forEach(card => cardObserver.observe(card));

    // Carousel navigation and dots
    const carouselRows = document.querySelectorAll('.carousel-row');

    carouselRows.forEach(row => {
      const track = row.querySelector('.carousel-track');
      const prevBtn = row.querySelector('.carousel-nav--prev');
      const nextBtn = row.querySelector('.carousel-nav--next');
      const dotsContainer = row.querySelector('.carousel-dots');
      const cards = row.querySelectorAll('.menu-card');

      if (!track || cards.length === 0) return;

      // Create dots
      if (dotsContainer) {
        cards.forEach((_, idx) => {
          const dot = document.createElement('button');
          dot.className = 'carousel-dot' + (idx === 0 ? ' active' : '');
          dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
          dot.addEventListener('click', () => {
            const cardWidth = cards[0].offsetWidth + 24; // card width + gap
            track.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
          });
          dotsContainer.appendChild(dot);
        });
      }

      // Update active dot on scroll
      let scrollTimeout;
      track.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const scrollLeft = track.scrollLeft;
          const cardWidth = cards[0].offsetWidth + 24;
          const activeIndex = Math.round(scrollLeft / cardWidth);

          if (dotsContainer) {
            dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
              dot.classList.toggle('active', idx === activeIndex);
            });
          }
        }, 100);
      }, { passive: true });

      // Arrow navigation
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          const cardWidth = cards[0].offsetWidth + 24;
          track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const cardWidth = cards[0].offsetWidth + 24;
          track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
      }

      // Touch swipe enhancement (for mobile)
      let startX = 0;
      let scrollStart = 0;

      track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
        scrollStart = track.scrollLeft;
      }, { passive: true });

      track.addEventListener('touchmove', (e) => {
        const diff = startX - e.touches[0].pageX;
        track.scrollLeft = scrollStart + diff;
      }, { passive: true });

      track.addEventListener('touchend', () => {
        // Snap to nearest card
        const cardWidth = cards[0].offsetWidth + 24;
        const targetIndex = Math.round(track.scrollLeft / cardWidth);
        track.scrollTo({ left: targetIndex * cardWidth, behavior: 'smooth' });
      }, { passive: true });
    });
  })();

  // ===== SMOOTH SCROLL UTILITY =====
  // Custom smooth scroll with easeOutCubic for buttery transitions
  function smoothScrollTo(targetY, duration = 800) {
    const startY = window.scrollY;
    const distance = targetY - startY;
    let startTime = null;

    // easeOutCubic - starts fast, ends slow (feels natural)
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  function smoothScrollToElement(element, duration = 800) {
    if (!element) return;
    const targetY = element.getBoundingClientRect().top + window.scrollY;
    smoothScrollTo(targetY, duration);
  }

  // ===== PRE-MENU SCROLL SNAPPING =====
  // DISABLED - scroll snapping removed for smooth scrolling
  (function initPreMenuScrollSnap() {
    return; // Disable scroll snapping entirely

    const preMenu = document.querySelector('.pre-menu');
    const heroSection = document.querySelector('.hero');
    const menuSection = document.querySelector('.parallax-menu-section');

    if (!preMenu || !heroSection) return;

    let isLocked = false;
    let lockTimeout = null;
    const LOCK_DURATION = 900;
    const SCROLL_DURATION = 700;

    function lock(duration = LOCK_DURATION) {
      isLocked = true;
      clearTimeout(lockTimeout);
      lockTimeout = setTimeout(() => {
        isLocked = false;
      }, duration);
    }

    // Check if scrolling down from hero into pre-menu area
    function isTransitioningFromHero() {
      const heroRect = heroSection.getBoundingClientRect();
      const preMenuRect = preMenu.getBoundingClientRect();
      // Hero is mostly scrolled past but pre-menu isn't fully in view yet
      return heroRect.bottom < window.innerHeight * 0.3 && preMenuRect.top > -100 && preMenuRect.top < window.innerHeight * 0.5;
    }

    // Handle wheel events on pre-menu section
    preMenu.addEventListener('wheel', (e) => {
      if (isLocked) {
        e.preventDefault();
        return;
      }

      const preMenuRect = preMenu.getBoundingClientRect();
      const isPreMenuVisible = preMenuRect.top < window.innerHeight * 0.5 && preMenuRect.bottom > window.innerHeight * 0.5;

      if (!isPreMenuVisible) return;

      const scrollDelta = Math.abs(e.deltaY);
      if (scrollDelta < 10) return;

      e.preventDefault();
      e.stopPropagation();

      const direction = e.deltaY > 0 ? 1 : -1;

      if (direction > 0) {
        // Scrolling down - go to tacos
        lock();
        const tacos = document.getElementById('tacos');
        if (tacos) {
          smoothScrollToElement(tacos, SCROLL_DURATION);
        }
      } else {
        // Scrolling up - go to hero
        lock();
        smoothScrollToElement(heroSection, SCROLL_DURATION);
      }
    }, { passive: false });

    // Snap to pre-menu when entering from hero
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      if (isLocked) {
        lastScrollY = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;

      if (isTransitioningFromHero() && scrollingDown) {
        // Snap to pre-menu
        lock();
        smoothScrollToElement(preMenu, SCROLL_DURATION);
      }

      lastScrollY = currentScrollY;
    }, { passive: true });

    // Handle touch on pre-menu
    preMenu.addEventListener('touchmove', (e) => {
      if (isLocked) {
        e.preventDefault();
      }
    }, { passive: false });

  })();

  // ===== MENU SECTION SCROLL SNAPPING =====
  // DISABLED - scroll snapping removed for smooth scrolling
  (function initMenuScrollSnap() {
    return; // Disable scroll snapping entirely

    const menuSection = document.querySelector('.parallax-menu-section');
    const carouselRows = document.querySelectorAll('.carousel-row');
    const preMenu = document.querySelector('.pre-menu');

    if (!menuSection || carouselRows.length === 0) return;

    const rows = Array.from(carouselRows);
    let currentIndex = 0;
    let isLocked = false;
    let lockTimeout = null;
    const LOCK_DURATION = 900; // Lock duration for normal scrolls
    const SCROLL_DURATION = 700; // Smooth scroll duration

    // Thresholds for scroll intensity
    const NORMAL_SCROLL_THRESHOLD = 10;   // Minimum to trigger
    const HARD_SCROLL_THRESHOLD = 150;    // Skip 1 category
    const VERY_HARD_SCROLL_THRESHOLD = 300; // Skip 2 categories

    // Get the currently active row based on position
    function getCurrentRowIndex() {
      let bestIndex = 0;
      let bestDistance = Infinity;

      rows.forEach((row, index) => {
        const rect = row.getBoundingClientRect();
        const distance = Math.abs(rect.top);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      return bestIndex;
    }

    // Check if we're in the menu section
    function isInMenuSection() {
      const rect = menuSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      return rect.top <= 100 && rect.bottom >= viewportHeight - 100;
    }

    // Lock scrolling for a duration
    function lock(duration = LOCK_DURATION) {
      isLocked = true;
      clearTimeout(lockTimeout);
      lockTimeout = setTimeout(() => {
        isLocked = false;
      }, duration);
    }

    // Snap to a specific row index
    function snapToIndex(index, lockDuration = LOCK_DURATION) {
      if (index < 0 || index >= rows.length) return;

      currentIndex = index;
      lock(lockDuration);

      smoothScrollToElement(rows[index], SCROLL_DURATION);
    }

    // Handle wheel events - supports hard scrolling to skip categories
    menuSection.addEventListener('wheel', (e) => {
      // Always prevent default in menu section to take full control
      if (isInMenuSection()) {
        e.preventDefault();
        e.stopPropagation();
      }

      // If locked, ignore all wheel events
      if (isLocked || !isInMenuSection()) return;

      const scrollDelta = Math.abs(e.deltaY);

      // Require minimum scroll delta to trigger (prevents trackpad micro-scrolls)
      if (scrollDelta < NORMAL_SCROLL_THRESHOLD) return;

      // Get current position
      currentIndex = getCurrentRowIndex();

      // Determine direction
      const direction = e.deltaY > 0 ? 1 : -1;

      // Calculate how many categories to skip based on scroll intensity
      let skip = 1;
      if (scrollDelta >= VERY_HARD_SCROLL_THRESHOLD) {
        skip = 3;
      } else if (scrollDelta >= HARD_SCROLL_THRESHOLD) {
        skip = 2;
      }

      const targetIndex = currentIndex + (direction * skip);

      // Snap to target category (clamped to valid range)
      if (targetIndex >= 0 && targetIndex < rows.length) {
        snapToIndex(targetIndex);
      } else if (targetIndex < 0) {
        // Scrolling up past first category - scroll to pre-menu
        lock();
        if (preMenu) {
          smoothScrollToElement(preMenu, SCROLL_DURATION);
        }
      } else if (targetIndex >= rows.length) {
        // Scrolling down past last category - scroll to contact section
        lock();
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          smoothScrollToElement(contactSection, SCROLL_DURATION);
        }
      }
    }, { passive: false });

    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!isInMenuSection() || isLocked) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        currentIndex = getCurrentRowIndex();
        const targetIndex = currentIndex + 1;
        if (targetIndex < rows.length) {
          snapToIndex(targetIndex);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        currentIndex = getCurrentRowIndex();
        const targetIndex = currentIndex - 1;
        if (targetIndex >= 0) {
          snapToIndex(targetIndex);
        }
      }
    });

    // When entering the menu section from outside, snap to nearest
    let wasInMenu = false;
    window.addEventListener('scroll', () => {
      const inMenu = isInMenuSection();

      if (inMenu && !wasInMenu && !isLocked) {
        // Just entered menu section - snap to nearest row
        const nearestIndex = getCurrentRowIndex();
        const rect = rows[nearestIndex].getBoundingClientRect();

        // Only snap if not already aligned (threshold of 50px)
        if (Math.abs(rect.top) > 50) {
          setTimeout(() => {
            if (!isLocked) snapToIndex(nearestIndex);
          }, 150);
        } else {
          currentIndex = nearestIndex;
        }
      }

      wasInMenu = inMenu;
    }, { passive: true });

    // Also block touchmove to prevent touch scrolling bypassing the snap
    menuSection.addEventListener('touchmove', (e) => {
      if (isInMenuSection() && isLocked) {
        e.preventDefault();
      }
    }, { passive: false });

  })();

  // ===== CART PERSISTENCE =====
  function saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.warn("Could not save cart:", err);
    }
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      Object.keys(cart).forEach(k => delete cart[k]);

      Object.entries(parsed).forEach(([id, item]) => {
        if (!item || typeof item !== "object") return;
        const name = String(item.name || "").trim();
        const price = Number(item.price);
        const qty = Number(item.qty);

        if (!id || !name) return;
        if (!Number.isFinite(price) || price < 0) return;
        if (!Number.isFinite(qty) || qty < 1) return;

        cart[id] = { name, price, qty: Math.floor(qty) };
      });
    } catch (err) {
      console.warn("Could not load cart:", err);
    }
  }

  // ===== CART DRAWER =====
  function openCartDrawer() {
    if (cartDrawer) cartDrawer.classList.add("open");
    if (cartOverlay) cartOverlay.classList.add("open");
    if (cartToggleBtn) cartToggleBtn.style.display = "none";
  }

  function closeCartDrawer() {
    if (cartDrawer) cartDrawer.classList.remove("open");
    if (cartOverlay) cartOverlay.classList.remove("open");
    if (cartToggleBtn) cartToggleBtn.style.display = "";
  }

  function toggleCartDrawer() {
    const isOpen = cartDrawer && cartDrawer.classList.contains("open");
    isOpen ? closeCartDrawer() : openCartDrawer();
  }

  if (cartToggleBtn) cartToggleBtn.addEventListener("click", toggleCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCartDrawer);
  if (cartDrawer) {
    cartDrawer.addEventListener("click", (e) => e.stopPropagation());
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCartDrawer();
  });

  // ===== UTILITY FUNCTIONS =====
  function formatMoney(num) {
    return Number(num).toFixed(2);
  }

  function computeSubtotal() {
    return Object.values(cart).reduce((sum, item) => sum + item.qty * item.price, 0);
  }

  // ===== TIP HANDLING =====
  function saveTip() {
    try {
      const payload = {
        tipPercent: Number(tipPercent) || 0,
        tipMode: document.querySelector('.tip-btn[data-tip="other"]')?.classList.contains("active")
          ? "other"
          : "preset"
      };
      localStorage.setItem(TIP_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("Could not save tip:", err);
    }
  }

  const tipBtns = document.querySelectorAll(".tip-btn");
  const otherBtn = document.querySelector('.tip-btn[data-tip="other"]');
  const tipOtherInput = document.getElementById("tip-other-input");

  function setActiveTipButton(activeBtn) {
    tipBtns.forEach(b => b.classList.remove("active"));
    if (activeBtn) activeBtn.classList.add("active");
  }

  function clampWholePercent(v) {
    const n = Math.round(Number(String(v).replace(/[^\d]/g, "")));
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function updateTotalsUI() {
    const subtotal = computeSubtotal();
    const tax = subtotal * TAX_RATE;
    const tip = subtotal * (tipPercent / 100);
    const final = subtotal + tax + tip;

    if (subtotalEl) subtotalEl.textContent = "$" + formatMoney(subtotal);
    if (taxEl) taxEl.textContent = "$" + formatMoney(tax);
    if (finalEl) finalEl.textContent = "$" + formatMoney(final);

    saveTip();
  }

  function resetTipUI() {
    tipPercent = 0;
    tipBtns.forEach(b => b.classList.remove("active"));
    if (tipOtherInput) tipOtherInput.value = "";
    updateTotalsUI();
  }

  function loadTip() {
    try {
      const raw = localStorage.getItem(TIP_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      const v = Number(parsed.tipPercent);
      tipPercent = Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 0;

      tipBtns.forEach(b => b.classList.remove("active"));

      const isPreset = [0, 10, 15, 20].includes(tipPercent) && parsed.tipMode !== "other";

      if (!isPreset && otherBtn) {
        otherBtn.classList.add("active");
        if (tipOtherInput) tipOtherInput.value = String(tipPercent);
      } else {
        const match = Array.from(tipBtns).find(b => Number(b.dataset.tip) === tipPercent);
        if (match) match.classList.add("active");
        if (tipOtherInput) tipOtherInput.value = "";
      }
    } catch (err) {
      console.warn("Could not load tip:", err);
    }
  }

  // Tip button wiring
  tipBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tipVal = btn.dataset.tip;

      if (tipVal === "other") {
        setActiveTipButton(btn);
        if (tipOtherInput) {
          tipOtherInput.value = String(clampWholePercent(tipPercent));
          tipOtherInput.focus();
          tipOtherInput.select();
        }
        updateTotalsUI();
        return;
      }

      tipPercent = clampWholePercent(tipVal);
      setActiveTipButton(btn);
      if (tipOtherInput) tipOtherInput.value = "";
      updateTotalsUI();
    });
  });

  if (tipOtherInput) {
    tipOtherInput.addEventListener("input", () => {
      const v = clampWholePercent(tipOtherInput.value);
      tipOtherInput.value = String(v);
      tipPercent = v;
      if (otherBtn) setActiveTipButton(otherBtn);
      updateTotalsUI();
    });

    tipOtherInput.addEventListener("blur", () => {
      const v = clampWholePercent(tipOtherInput.value);
      tipOtherInput.value = String(v);
      tipPercent = v;
      updateTotalsUI();
    });
  }

  // ===== CART UI =====
  function updateCartUI() {
    if (!cartItemsEl) return;

    const ids = Object.keys(cart);

    if (!ids.length) {
      cartItemsEl.innerHTML = "";
      if (cartEmptyEl) {
        cartItemsEl.appendChild(cartEmptyEl);
        cartEmptyEl.style.display = "block";
      }

      if (cartCountEl) cartCountEl.textContent = "0";
      if (cartToggleBadge) cartToggleBadge.textContent = "0";
      if (cartTotalEl) cartTotalEl.textContent = "$0.00";

      resetTipUI();
      updateTotalsUI();
      saveCart();
      return;
    }

    if (cartEmptyEl) cartEmptyEl.style.display = "none";
    cartItemsEl.innerHTML = "";

    let totalQty = 0;
    let totalPrice = 0;

    ids.forEach(id => {
      const item = cart[id];
      totalQty += item.qty;
      totalPrice += item.qty * item.price;

      const li = document.createElement("li");
      li.className = "cart-item";
      li.setAttribute("data-item-id", id);

      li.innerHTML = `
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-qty-row">
            <div class="cart-qty-control">
              <button class="cart-qty-btn" type="button" data-action="decrease">-</button>
              <span class="cart-qty">${item.qty}</span>
              <button class="cart-qty-btn" type="button" data-action="increase">+</button>
            </div>
            <button class="cart-remove-btn" type="button" data-action="remove">Remove</button>
          </div>
        </div>
        <div class="cart-item-meta">$${formatMoney(item.qty * item.price)}</div>
      `;

      cartItemsEl.appendChild(li);
    });

    if (cartCountEl) cartCountEl.textContent = String(totalQty);
    if (cartToggleBadge) cartToggleBadge.textContent = String(totalQty);
    if (cartTotalEl) cartTotalEl.textContent = "$" + formatMoney(totalPrice);

    updateTotalsUI();
    saveCart();
  }

  if (cartItemsEl) {
    cartItemsEl.addEventListener("click", function (e) {
      const btn = e.target.closest(".cart-qty-btn, .cart-remove-btn");
      if (!btn) return;

      const li = btn.closest(".cart-item");
      if (!li) return;

      const id = li.getAttribute("data-item-id");
      if (!id || !cart[id]) return;

      const action = btn.getAttribute("data-action");

      if (action === "increase") cart[id].qty += 1;
      else if (action === "decrease") cart[id].qty = Math.max(1, cart[id].qty - 1);
      else if (action === "remove") delete cart[id];

      updateCartUI();
      openCartDrawer();
    });
  }

  // ===== CHECKOUT MODAL =====
  const checkoutBackdrop = document.getElementById("checkout-backdrop");
  const checkoutBtn = document.getElementById("cart-checkout");
  const checkoutClose = document.getElementById("checkout-close");
  const checkoutList = document.getElementById("checkout-list");
  const checkoutCountEl = document.getElementById("checkout-count");
  const checkoutTotalEl = document.getElementById("checkout-total");
  const checkoutConfirm = document.getElementById("checkout-confirm");

  function buildOrderPayload() {
    const items = Object.entries(cart).map(([id, item]) => ({
      id,
      name: item.name,
      qty: item.qty,
      price: item.price,
      lineTotal: Number((item.qty * item.price).toFixed(2))
    }));

    const subtotal = computeSubtotal();
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const tip = Number((subtotal * (tipPercent / 100)).toFixed(2));
    const final = Number((subtotal + tax + tip).toFixed(2));

    return {
      createdAt: new Date().toISOString(),
      items,
      totals: {
        subtotal: Number(subtotal.toFixed(2)),
        taxRate: TAX_RATE,
        tax,
        tipPercent,
        tip,
        final
      }
    };
  }

  function openCheckoutModal() {
    const ids = Object.keys(cart);
    if (!ids.length) {
      alert("Your cart is empty. Add something delicious first!");
      return;
    }

    if (!checkoutList) return;
    checkoutList.innerHTML = "";
    let totalQty = 0;
    let totalPrice = 0;

    ids.forEach(id => {
      const item = cart[id];
      totalQty += item.qty;
      totalPrice += item.qty * item.price;

      const li = document.createElement("li");
      li.className = "checkout-item";
      li.innerHTML = `
        <div class="checkout-item-name">${item.name}</div>
        <div class="checkout-item-meta">x${item.qty} &bull; $${formatMoney(item.qty * item.price)}</div>
      `;
      checkoutList.appendChild(li);
    });

    if (checkoutCountEl) checkoutCountEl.textContent = String(totalQty);

    const subtotal = totalPrice;
    const tax = subtotal * TAX_RATE;
    const tip = subtotal * (tipPercent / 100);
    const finalTotal = subtotal + tax + tip;

    const checkoutSubtotal = document.getElementById("checkout-subtotal");
    const checkoutTax = document.getElementById("checkout-tax");
    const checkoutTipPercent = document.getElementById("checkout-tip-percent");
    const checkoutTip = document.getElementById("checkout-tip");

    if (checkoutSubtotal) checkoutSubtotal.textContent = "$" + formatMoney(subtotal);
    if (checkoutTax) checkoutTax.textContent = "$" + formatMoney(tax);
    if (checkoutTipPercent) checkoutTipPercent.textContent = String(tipPercent);
    if (checkoutTip) checkoutTip.textContent = "$" + formatMoney(tip);
    if (checkoutTotalEl) checkoutTotalEl.textContent = "$" + formatMoney(finalTotal);

    if (checkoutBackdrop) checkoutBackdrop.classList.add("open");
  }

  function closeCheckoutModal() {
    if (checkoutBackdrop) checkoutBackdrop.classList.remove("open");
  }

  if (checkoutBtn) checkoutBtn.addEventListener("click", openCheckoutModal);
  if (checkoutClose) checkoutClose.addEventListener("click", closeCheckoutModal);

  if (checkoutBackdrop) {
    checkoutBackdrop.addEventListener("click", (e) => {
      if (e.target === checkoutBackdrop) closeCheckoutModal();
    });
  }

  if (checkoutConfirm) {
    checkoutConfirm.addEventListener("click", async () => {
      const payload = buildOrderPayload();
      console.log("Order payload:", payload);

      // For demo purposes, just show success
      alert("Order submitted successfully! Thank you for your order.");
      closeCheckoutModal();

      // Clear cart after successful order
      Object.keys(cart).forEach(k => delete cart[k]);
      updateCartUI();
      closeCartDrawer();
    });
  }

  // ===== NUTRITION MODAL =====
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalTitle = document.getElementById("modal-title");
  const modalSubtitle = document.getElementById("modal-subtitle");
  const modalBody = document.getElementById("nutrition-body");
  const modalClose = document.getElementById("modal-close");

  function openNutritionModal(itemId, name) {
    const data = nutritionData[itemId];
    if (modalTitle) modalTitle.textContent = (name || "Item details").replace(/^\d+\.\s*/, "");
    if (modalSubtitle) modalSubtitle.textContent = "Per portion";

    if (modalBody) {
      modalBody.innerHTML = "";
      ["Calories", "Protein", "Carbs", "Fat", "Sodium"].forEach(label => {
        const row = document.createElement("tr");
        const value = data && data[label] ? data[label] : "—";
        row.innerHTML = `<th>${label}</th><td>${value}</td>`;
        modalBody.appendChild(row);
      });
    }

    if (modalBackdrop) modalBackdrop.classList.add("open");
  }

  function closeNutritionModal() {
    if (modalBackdrop) modalBackdrop.classList.remove("open");
  }

  if (modalClose) modalClose.addEventListener("click", closeNutritionModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeNutritionModal();
    });
  }

  // ===== MENU ITEMS WIRING =====
  // Support both old .menu-item and new .menu-card classes
  document.querySelectorAll(".menu-item, .menu-card").forEach(itemEl => {
    const itemId = itemEl.getAttribute("data-item-id");
    const price = parseFloat(itemEl.getAttribute("data-price") || "0");

    // Support both old and new class naming conventions
    const name =
      itemEl.querySelector(".menu-item-name-text")?.textContent.trim() ||
      itemEl.querySelector(".menu-item-name")?.textContent.trim() ||
      itemEl.querySelector(".menu-card__title")?.textContent.trim() ||
      "Menu item";

    const qtyInput = itemEl.querySelector(".qty-input");
    const addBtn = itemEl.querySelector(".add-btn") || itemEl.querySelector(".btn-add");
    const detailsBtn = itemEl.querySelector(".details-btn") || itemEl.querySelector(".btn-details");
    const qtyBtns = itemEl.querySelectorAll(".qty-btn");

    if (!itemId || !qtyInput || !addBtn) return;

    qtyBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        let current = parseInt(qtyInput.value, 10);
        if (isNaN(current) || current < 1) current = 1;
        if (action === "increase") current += 1;
        if (action === "decrease") current = Math.max(1, current - 1);
        qtyInput.value = String(current);
      });
    });

    qtyInput.addEventListener("input", () => {
      let v = qtyInput.value.replace(/[^\d]/g, "");
      if (v === "" || v === "0") v = "1";
      qtyInput.value = v;
    });

    addBtn.addEventListener("click", () => {
      const qty = parseInt(qtyInput.value, 10) || 1;

      if (!cart[itemId]) cart[itemId] = { name, qty, price };
      else cart[itemId].qty += qty;

      updateCartUI();
      openCartDrawer();
    });

    if (detailsBtn) {
      detailsBtn.addEventListener("click", () => openNutritionModal(itemId, name));
    }
  });

  // ===== MOBILE NAV =====
  const navToggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const mobileNavClose = document.getElementById("mobile-nav-close");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      mobileNav.classList.add("open");
    });
  }

  if (mobileNavClose && mobileNav) {
    mobileNavClose.addEventListener("click", () => {
      mobileNav.classList.remove("open");
    });
  }

  if (mobileNav) {
    mobileNav.addEventListener("click", (e) => {
      if (e.target === mobileNav) {
        mobileNav.classList.remove("open");
      }
    });

    // Mobile nav cards
    mobileNav.querySelectorAll(".mobile-nav-card").forEach(card => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = card.getAttribute("data-target");
        const targetEl = document.getElementById(targetId);
        mobileNav.classList.remove("open");
        if (targetEl) {
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      });
    });
  }

  // ===== SMOOTH SCROLL FOR NAV LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href && href !== "#") {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    let lastScroll = 0;
    const scrollThreshold = 50;

    function handleNavbarScroll() {
      const currentScroll = window.scrollY;

      if (currentScroll > scrollThreshold) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll(); // Run once on load
  }

  // ===== CART TOGGLE VISIBILITY ON SCROLL =====
  // Show cart toggle only after scrolling past the hero section
  const heroSection = document.querySelector('.hero');
  if (cartToggleBtn && heroSection) {
    function handleCartToggleVisibility() {
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      const currentScroll = window.scrollY + window.innerHeight;

      // Show cart toggle when scrolled past the hero section
      if (window.scrollY > heroBottom - 100) {
        cartToggleBtn.classList.add('visible');
      } else {
        cartToggleBtn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', handleCartToggleVisibility, { passive: true });
    handleCartToggleVisibility(); // Run once on load
  }

  // ===== ENHANCED ANIMATIONS MODULE =====
  (function initEnhancedAnimations() {

    // --- Live Tile Breathing Effect ---
    const menuCards = document.querySelectorAll('.menu-card');

    // Add tile-alive class with staggered timing
    menuCards.forEach((card, index) => {
      // Stagger the animation start
      setTimeout(() => {
        card.classList.add('tile-alive');
      }, index * 200);

      // Pause animation on hover
      card.addEventListener('mouseenter', () => {
        card.style.animationPlayState = 'paused';
      });

      card.addEventListener('mouseleave', () => {
        card.style.animationPlayState = 'running';
      });
    });

    // --- Section Reveal on Scroll ---
    const revealElements = document.querySelectorAll('.carousel-header, .contact-info, .contact-image');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });

    // --- Cart Badge Pulse when has items ---
    function updateCartBadgeAnimation() {
      const badge = document.getElementById('cart-toggle-badge');
      if (badge) {
        const count = parseInt(badge.textContent, 10) || 0;
        if (count > 0) {
          badge.classList.add('has-items');
        } else {
          badge.classList.remove('has-items');
        }
      }
    }

    // Watch for badge changes
    const cartBadge = document.getElementById('cart-toggle-badge');
    if (cartBadge) {
      const badgeObserver = new MutationObserver(updateCartBadgeAnimation);
      badgeObserver.observe(cartBadge, { childList: true, characterData: true, subtree: true });
      updateCartBadgeAnimation();
    }

    // --- Staggered Star Rating Animation ---
    document.querySelectorAll('.menu-card__rating').forEach(rating => {
      rating.querySelectorAll('.star').forEach((star, index) => {
        star.style.setProperty('--star-index', index);
      });
    });

    // --- Contact Section Stagger Reveal ---
    const contactDetails = document.querySelector('.contact-details');
    if (contactDetails) {
      contactDetails.classList.add('reveal-stagger');

      const contactObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, { threshold: 0.3 });

      contactObserver.observe(contactDetails);
    }

    // --- Pre-menu title shimmer effect ---
    const preMenuTitle = document.querySelector('.pre-menu h2');
    if (preMenuTitle) {
      preMenuTitle.classList.add('shimmer-text');
    }

    // --- Mouse magnetic effect for buttons ---
    document.querySelectorAll('.contact-btn, .cart-checkout-btn').forEach(btn => {
      btn.classList.add('magnetic-hover');

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });

    // --- Parallax on mouse move for hero section ---
    const heroContent = document.querySelector('.hero-content');
    const heroSection = document.querySelector('.hero');

    if (heroContent && heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

        heroContent.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
      });

      heroSection.addEventListener('mouseleave', () => {
        heroContent.style.transform = '';
      });
    }

    // --- Glow effect following mouse on cards ---
    menuCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    // --- Smooth counter animation for prices ---
    function animateValue(element, start, end, duration) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = start + (end - start) * progress;
        element.textContent = '$' + current.toFixed(2);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }

    // --- Intersection Observer for price animations ---
    const priceElements = document.querySelectorAll('.menu-card__price');
    const priceObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          const finalPrice = parseFloat(entry.target.textContent.replace('$', ''));
          if (!isNaN(finalPrice)) {
            animateValue(entry.target, 0, finalPrice, 800);
          }
        }
      });
    }, { threshold: 0.5 });

    priceElements.forEach(el => priceObserver.observe(el));

  })();

  // ===== INIT =====
  loadCart();
  loadTip();
  updateCartUI();

  // ===== TEMPORARY PORTFOLIO RECORDING TOUR =====
  // Remove this entire section after recording!
  if (window._tourActive) {
    sessionStorage.removeItem('autoTour');

    // Wait for DOM to be fully ready
    setTimeout(async function runTour() {
      const pause = ms => new Promise(r => setTimeout(r, ms));

      // Simple smooth scroll
      const smoothScrollTo = (targetY, duration) => {
        return new Promise(resolve => {
          const startY = window.scrollY;
          const distance = targetY - startY;
          const startTime = performance.now();

          const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out curve
            const ease = 1 - Math.pow(1 - progress, 3);

            const newY = Math.round(startY + distance * ease);
            window.scrollTo(0, newY);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              resolve();
            }
          };

          requestAnimationFrame(step);
        });
      };

      // Ensure we start at the top
      window.scrollTo(0, 0);

      console.log('🎬 Portfolio tour starting in 5 seconds...');

      // Wait 5 seconds for hero animations to play
      await pause(5000);

      const sectionData = [
        { id: '#pre-menu', name: 'Pre-Menu', pauseAfter: 2000, scrollDuration: 1400 },
        { id: '#tacos', name: 'Headliner Tacos', pauseAfter: 1500, scrollDuration: 1600 },
        { id: '#burritos', name: 'Burritos', pauseAfter: 1500, scrollDuration: 1400 },
        { id: '#bowls', name: 'Bowls', pauseAfter: 1500, scrollDuration: 1400 },
        { id: '#sides', name: 'Sides', pauseAfter: 1500, scrollDuration: 1400 },
        { id: '#drinks', name: 'Drinks', pauseAfter: 1500, scrollDuration: 1400 },
        { id: '#contact', name: 'Contact', pauseAfter: 1500, scrollDuration: 1400 }
      ];

      for (const section of sectionData) {
        const el = document.querySelector(section.id);
        if (el) {
          // Center the section content in viewport
          // Get the carousel header to use as anchor point
          const header = el.querySelector('.carousel-header') || el;
          const headerRect = header.getBoundingClientRect();
          const headerTop = headerRect.top + window.scrollY;

          // Position header about 8% from top of viewport for better centering
          const targetY = headerTop - (window.innerHeight * 0.08);
          console.log('→ ' + section.name);

          // Reset horizontal carousel scroll to start (left)
          const carousel = el.querySelector('.carousel-track');
          if (carousel) {
            carousel.scrollLeft = 0;
          }

          await smoothScrollTo(targetY, section.scrollDuration);
          await pause(section.pauseAfter);
        }
      }

      console.log('✅ Tour complete!');
      window._tourActive = false;
    }, 200);
  }
  // ===== END TEMPORARY TOUR CODE =====

});
