/**
 * Srav's Ice Cream Parlour – script.js
 * Handles: dark mode, navbar scroll, menu filtering,
 * slider, scroll animations, cart toast, newsletter, back-to-top
 */

'use strict';

/* =========================================
   1. THEME TOGGLE (Dark / Light Mode)
   ========================================= */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const html        = document.documentElement;

// Persist theme across page loads
const savedTheme = localStorage.getItem('sravs-theme') || 'light';
applyTheme(savedTheme);

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeIcon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
  localStorage.setItem('sravs-theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});


/* =========================================
   2. NAVBAR – scroll state & active links
   ========================================= */
const mainNav   = document.getElementById('mainNav');
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // Compact navbar on scroll
  mainNav.classList.toggle('scrolled', window.scrollY > 60);

  // Active link based on scroll position
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) {
      current = sec.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}, { passive: true });

// Smooth-close mobile menu on link click
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    const bsCollapse = document.getElementById('navMenu');
    if (bsCollapse.classList.contains('show')) {
      bsCollapse.classList.remove('show');
    }
  });
});


/* =========================================
   3. SCROLL ANIMATIONS (IntersectionObserver)
   ========================================= */
const animateEls = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('in-view');
      }, parseInt(delay));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

animateEls.forEach(el => observer.observe(el));


/* =========================================
   4. MENU FILTERING
   ========================================= */
const filterBtns  = document.querySelectorAll('.filter-btn');
const menuItems   = document.querySelectorAll('.menu-item-col');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Toggle active class
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    menuItems.forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;
      if (match) {
        item.classList.remove('hidden');
        // Re-trigger animation
        item.querySelector('.menu-card').style.animation = 'none';
        void item.querySelector('.menu-card').offsetWidth;
        item.querySelector('.menu-card').style.animation = '';
      } else {
        item.classList.add('hidden');
      }
    });
  });
});


/* =========================================
   5. CART TOAST
   ========================================= */
const cartToast = document.getElementById('cartToast');
const cartToastMsg = document.getElementById('cartToastMsg');
let toastTimer = null;

function addToCart(name, price) {
  clearTimeout(toastTimer);
  cartToastMsg.textContent = `${name} added — ₹${price}`;
  cartToast.classList.add('show');
  toastTimer = setTimeout(() => cartToast.classList.remove('show'), 3000);
}

// Expose globally so inline onclick handlers work
window.addToCart = addToCart;


/* =========================================
   6. FEATURED SLIDER
   ========================================= */
const track      = document.getElementById('sliderTrack');
const prevBtn    = document.getElementById('prevSlide');
const nextBtn    = document.getElementById('nextSlide');
const cards      = track ? Array.from(track.children) : [];

let sliderIndex  = 0;
let cardWidth    = 0;
let visibleCount = 3;

function getSliderConfig() {
  cardWidth    = cards[0] ? cards[0].offsetWidth + 20 : 280; // gap = 20px
  visibleCount = window.innerWidth >= 992 ? 3 : window.innerWidth >= 576 ? 2 : 1;
}

function updateSlider() {
  const maxIndex = Math.max(0, cards.length - visibleCount);
  sliderIndex    = Math.min(Math.max(sliderIndex, 0), maxIndex);
  track.style.transform = `translateX(-${sliderIndex * cardWidth}px)`;
}

if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => { sliderIndex--; updateSlider(); });
  nextBtn.addEventListener('click', () => { sliderIndex++; updateSlider(); });
}

// Auto-slide every 4s
let autoSlide = setInterval(() => {
  if (!track) return;
  const maxIndex = Math.max(0, cards.length - visibleCount);
  sliderIndex = sliderIndex >= maxIndex ? 0 : sliderIndex + 1;
  updateSlider();
}, 4000);

// Pause on hover
if (track) {
  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoSlide));
  track.parentElement.addEventListener('mouseleave', () => {
    autoSlide = setInterval(() => {
      const maxIndex = Math.max(0, cards.length - visibleCount);
      sliderIndex = sliderIndex >= maxIndex ? 0 : sliderIndex + 1;
      updateSlider();
    }, 4000);
  });
}

window.addEventListener('resize', () => {
  getSliderConfig();
  updateSlider();
}, { passive: true });

// Init slider
getSliderConfig();
updateSlider();


/* =========================================
   7. NEWSLETTER FORM
   ========================================= */
const newsletterForm  = document.getElementById('newsletterForm');
const newsletterEmail = document.getElementById('newsletterEmail');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterEmail.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      shake(newsletterEmail.closest('.input-wrapper'));
      return;
    }

    // Success state
    const btn = newsletterForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Subscribed!';
    btn.style.background = '#22c55e';
    newsletterEmail.value = '';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
    }, 3500);
  });
}

function shake(el) {
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'shakeInput 0.4s ease';
  el.style.borderColor = '#ff4444';
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.animation = '';
  }, 800);
}

// Inject shake keyframes dynamically
(function() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shakeInput {
      0%,100% { transform: translateX(0); }
      20%,60% { transform: translateX(-6px); }
      40%,80% { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);
})();


/* =========================================
   8. BACK TO TOP
   ========================================= */
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* =========================================
   9. LAZY-LOAD IFRAMES
   ========================================= */
const lazyIframes = document.querySelectorAll('iframe[loading="lazy"]');
const iframeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const iframe = entry.target;
      // iframe already has src, this just ensures it loads on scroll into view
      iframe.style.opacity = '1';
      iframeObserver.unobserve(iframe);
    }
  });
});

lazyIframes.forEach(iframe => {
  iframe.style.opacity = '0';
  iframe.style.transition = 'opacity 0.6s ease';
  iframeObserver.observe(iframe);
});


/* =========================================
   10. GALLERY – keyboard & a11y
   ========================================= */
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'img');
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      item.classList.toggle('focused');
    }
  });
});
