/* ===================================
   NAVBAR — scroll effect
=================================== */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ===================================
   SMOOTH SCROLL — anchor links
=================================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = navbar.offsetHeight + 16;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    });
});

/* ===================================
   MOTION DESIGN — GSAP + ScrollTrigger
   Content is fully visible by default (CSS hides nothing),
   so if the CDN fails or the user prefers reduced motion,
   the page simply renders instantly with no animation.
   All tweens are transform/opacity only (60fps on mobile).
=================================== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    /* ---- Hero entrance: choreographed invitation opening ---- */
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
        .from('.hero-eyebrow',        { y: 24, opacity: 0, duration: 0.7 }, 0.15)
        .from('.hero-title .w',       { y: 46, opacity: 0, duration: 0.85, stagger: 0.09 }, '-=0.35')
        .from('.hero-script',         { y: 34, opacity: 0, scale: 0.96, duration: 1.05, ease: 'power2.out' }, '-=0.5')
        .from('.hero-subtitle',       { y: 24, opacity: 0, duration: 0.7 }, '-=0.65')
        .from('.hero-ctas > *',       { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.5')
        .from('.hero-proof li',       { y: 14, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.45')
        .from('.hero-visual',         { y: 60, opacity: 0, duration: 1.1 }, 0.4)
        .from('.hero-arch img',       { scale: 1.28, duration: 1.6, ease: 'power2.out' }, 0.4)
        .from('.hero-scroll',         { opacity: 0, duration: 0.8 }, '-=0.3');

    /* ---- Hero parallax (transform-based, never background-attachment) ---- */
    gsap.to('.hero-arch img', {
        yPercent: 9,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero-ornament', {
        yPercent: 24,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    /* ---- Section headers: eyebrow, title, ornament stagger in ---- */
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, {
            y: 34, opacity: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: header, start: 'top 84%', once: true }
        });
    });

    /* ---- How it works: hairline draws, steps rise along it ---- */
    gsap.from('.journey-line', {
        scaleX: 0, duration: 1.3, ease: 'power2.inOut',
        scrollTrigger: { trigger: '.journey', start: 'top 78%', once: true }
    });
    gsap.from('.journey-step', {
        y: 48, opacity: 0, duration: 0.85, stagger: 0.16, ease: 'power3.out',
        scrollTrigger: { trigger: '.journey', start: 'top 78%', once: true }
    });
    gsap.from('.journey-cta', {
        y: 24, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.journey-cta', start: 'top 92%', once: true }
    });

    /* ---- Portfolio: the frame rises like a gallery unveiling ---- */
    gsap.from('.carousel-container', {
        y: 70, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.carousel-wrapper', start: 'top 80%', once: true }
    });
    gsap.from('.carousel-btn', {
        opacity: 0, scale: 0.8, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: '.carousel-wrapper', start: 'top 70%', once: true }
    });
    /* dots are rebuilt in JS, so animate the container (not individual dots) */
    gsap.from('.carousel-dots', {
        y: 12, opacity: 0, duration: 0.45, ease: 'power2.out',
        scrollTrigger: { trigger: '.carousel-dots', start: 'top 95%', once: true }
    });

    /* ---- Order form: fields drift up in small batches ---- */
    ScrollTrigger.batch('.order-form .form-group', {
        start: 'top 90%',
        once: true,
        onEnter: batch => gsap.from(batch, {
            y: 28, opacity: 0, duration: 0.7, stagger: 0.09, ease: 'power2.out'
        })
    });

    /* ---- Pricing: intro, then cards present themselves ---- */
    gsap.from('.pricing-intro', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.pricing-intro', start: 'top 86%', once: true }
    });
    gsap.from('.pricing-card', {
        opacity: 0, duration: 0.85, stagger: 0.16, ease: 'power3.out',
        scrollTrigger: { trigger: '.pricing-cards', start: 'top 84%', once: true }
    });
    gsap.from('.purchase-btn#submitBtn', {
        y: 24, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '#submitBtn', start: 'top 92%', once: true }
    });

    /* ---- FAQ: rows slide in alternating ---- */
    gsap.utils.toArray('.faq-item').forEach((item, i) => {
        gsap.from(item, {
            x: i % 2 ? 32 : -32, opacity: 0, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: item, start: 'top 90%', once: true }
        });
    });

    /* ---- About: text + drifting script ornament ---- */
    gsap.from('.about-text p', {
        y: 28, opacity: 0, duration: 0.8, stagger: 0.18, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-text', start: 'top 85%', once: true }
    });
    gsap.fromTo('.about-ornament',
        { y: 50 },
        {
            y: -50, ease: 'none',
            scrollTrigger: { trigger: '.about-section', start: 'top bottom', end: 'bottom top', scrub: true }
        }
    );
}

/* ===================================
   VIDEO CAROUSEL — single carousel, all examples
   Carousel track is direction:ltr (set in CSS).
   translateX(-index * 100%) navigates correctly.
=================================== */
const track      = document.getElementById('carouselTrack');
const allSlides  = track ? Array.from(track.querySelectorAll('.carousel-slide')) : [];
const prevBtn    = document.getElementById('prevBtn');
const nextBtn    = document.getElementById('nextBtn');
const dotsWrap   = document.getElementById('carouselDots');
let slides  = allSlides;   // all slides, no tier filtering
let dots    = [];
let current = 0;

function pauseAllVideos() {
    allSlides.forEach(slide => {
        const video = slide.querySelector('video');
        const card  = slide.querySelector('.video-card');
        if (video) { video.pause(); video.currentTime = 0; video.muted = true; }
        if (card)  card.classList.remove('playing');
    });
}

function goToSlide(index) {
    if (!track || !slides.length) return;
    pauseAllVideos();
    current = ((index % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
}

function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    dots = slides.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `סרטון ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsWrap.appendChild(dot);
        return dot;
    });
}

// Single carousel: show every example, first slide active.
if (track) {
    slides = allSlides;
    buildDots();
    current = 0;
    track.style.transform = 'translateX(0%)';
}

if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(current - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(current + 1));

// Swipe support
let touchStartX = 0;
if (track) {
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) goToSlide(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });
}

// Auto-detect video aspect ratio and apply portrait/landscape class.
// Metadata may already be loaded (cache) before this script runs,
// so check readyState first instead of relying on the event alone.
allSlides.forEach(slide => {
    const video = slide.querySelector('video');
    const card  = slide.querySelector('.video-card');
    if (!video || !card) return;

    function applyOrientation() {
        card.classList.add(video.videoHeight > video.videoWidth ? 'portrait' : 'landscape');
    }
    if (video.readyState >= 1) {
        applyOrientation();
    } else {
        video.addEventListener('loadedmetadata', applyOrientation);
    }

    // Play / pause on card click
    card.addEventListener('click', () => {
        if (video.paused) {
            video.muted = false;
            video.play();
            card.classList.add('playing');
        } else {
            video.pause();
            card.classList.remove('playing');
        }
    });
});

/* ===================================
   FAQ ACCORDION
=================================== */
document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
    });
});

/* ===================================
   STYLE "OTHER" — show text field
=================================== */
const styleOtherRadio = document.getElementById('styleOtherRadio');
const styleOtherWrap  = document.getElementById('styleOtherWrap');
const styleOtherInput = document.getElementById('styleOtherInput');

document.querySelectorAll('input[name="style"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const isOther = styleOtherRadio && styleOtherRadio.checked;
        styleOtherWrap.classList.toggle('open', isOther);
        if (isOther) setTimeout(() => styleOtherInput.focus(), 350);
        if (!isOther && styleOtherInput) styleOtherInput.value = '';
    });
});

/* ===================================
   SURPRISE CHECKBOX — disables description
=================================== */
const surpriseCheck = document.getElementById('surpriseUs');
const descField     = document.getElementById('description');

if (surpriseCheck && descField) {
    surpriseCheck.addEventListener('change', () => {
        descField.disabled    = surpriseCheck.checked;
        descField.placeholder = surpriseCheck.checked
            ? 'כבר אמרתם לנו, אנחנו על זה!'
            : 'יש לכם רעיון ספציפי? ספרו לנו (עד 10 שניות של סרטון)';
        if (surpriseCheck.checked) descField.value = '';
    });
}

/* ===================================
   PACKAGE — single package
   One package only (data-package="regular", the ₪450 Grow page).
   The radio input carries the value Formspree receives
   (name="package"). Kept as a checked radio so the submit +
   order-flow always resolve to this single package.
=================================== */
const packageInputs = Array.from(document.querySelectorAll('input[name="package"]'));

/* ===================================
   ORDER FORM — Formspree submission
   Raw files are NEVER sent to Formspree (free plan
   returns 400 "File Uploads Not Permitted"). Photos go
   to Cloudinary first; Formspree gets only text + URLs.
=================================== */
const form      = document.getElementById('orderForm');
const successEl = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

function setBtnState(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    const span = btn.querySelector('.btn-text');
    if (span) span.textContent = loading ? 'שולח...' : btn.dataset.originalText || 'שלח';
}

function setBtnText(btn, text) {
    if (!btn) return;
    const span = btn.querySelector('.btn-text');
    if (span) span.textContent = text;
}

// Unique email subject per submission: Gmail threads messages with the
// same subject into one conversation, and orders were getting lost in it.
function formatSubjectTimestamp() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

if (submitBtn) submitBtn.dataset.originalText = submitBtn.querySelector('.btn-text')?.textContent;

if (form) {
    form.addEventListener('submit', async e => {
        e.preventDefault();

        if (form.action.includes('YOUR_FORM_ID')) {
            alert('⚠️ Formspree לא הוגדר עדיין.\nיש להגדיר YOUR_FORM_ID בקוד.');
            return;
        }

        setBtnState(submitBtn, true);

        const data = new FormData(form);

        // Unique subject per order (overrides the static hidden _subject input)
        const groomName = (data.get('groom_name') || '').toString().trim();
        const brideName = (data.get('bride_name') || '').toString().trim();
        const coupleNames = [groomName, brideName].filter(Boolean).join(' ו').trim();
        data.set('_subject', `הזמנת Save the Date: ${groomName} ו${brideName} - ${formatSubjectTimestamp()}`);

        // PHOTOS-AFTER-PAYMENT: no photos are collected on this page anymore.
        // The customer uploads them on thank-you.html AFTER paying, which ties
        // them to the order number. Here we only carry the order details.
        data.append('photo_count', '0');
        const redirectUrl = 'thank-you.html';

        // PAYMENT-BEFORE-DETAILS: the order is NOT sent to Formspree
        // here. order-flow.js persists it to localStorage, sends a
        // minimal pre-payment lead, and redirects to the payment page.
        // thank-you.html (arriving with ?paid=1) is what actually delivers
        // the full order to Formspree.
        // Legacy direct send stays only as a fallback for the rare
        // case order-flow.js did not load or storage is unavailable.
        if (window.OrderFlow) {
            const checkedPkg = packageInputs.find(input => input.checked);
            const pkgCard = checkedPkg ? checkedPkg.closest('.pricing-card') : null;
            setBtnText(submitBtn, 'מעבירים לתשלום...');
            const started = await window.OrderFlow.startPayment(data, {
                pkg: pkgCard ? pkgCard.dataset.package : 'regular',
                names: coupleNames
            });
            if (started) return; // redirecting to the payment page
            setBtnText(submitBtn, 'שולח...');
        }

        try {
            const res = await fetch(form.action, {
                method:  'POST',
                body:    data,
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                // Lead fires on thank-you.html only (covers every success
                // path, including the ?photos=email fallback). Firing it
                // here too double-counted every order in Meta.
                window.location.href = redirectUrl;
            } else {
                throw new Error('server');
            }
        } catch {
            setBtnState(submitBtn, false);
            alert('שגיאה בשליחה. אנא נסו שוב.');
        }
    });
}

/* ===================================
   CONTACT MODAL
=================================== */
const contactModal    = document.getElementById('contactModal');
const navContactBtn   = document.getElementById('navContactBtn');
const modalClose      = document.getElementById('modalClose');
const contactForm     = document.getElementById('contactForm');
const contactSuccess  = document.getElementById('contactSuccess');
const contactSubmit   = document.getElementById('contactSubmitBtn');

function openModal()  { contactModal.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal() { contactModal.classList.remove('open'); document.body.style.overflow = ''; }

if (navContactBtn) navContactBtn.addEventListener('click', openModal);
if (modalClose)    modalClose.addEventListener('click', closeModal);

contactModal?.addEventListener('click', e => {
    if (e.target === contactModal) closeModal();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

if (contactSubmit) contactSubmit.dataset.originalText = contactSubmit.querySelector('.btn-text')?.textContent;

if (contactForm) {
    contactForm.addEventListener('submit', async e => {
        e.preventDefault();

        if (contactForm.action.includes('YOUR_FORM_ID')) {
            alert('⚠️ Formspree לא הוגדר עדיין.');
            return;
        }

        setBtnState(contactSubmit, true);

        try {
            const contactData = new FormData(contactForm);
            // Unique subject per inquiry (prevents Gmail threading)
            const contactName = (contactData.get('name') || '').toString().trim();
            contactData.set('_subject', `פנייה מהאתר: ${contactName} - ${formatSubjectTimestamp()}`);
            const res = await fetch(contactForm.action, {
                method:  'POST',
                body:    contactData,
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                // Contact (not Lead): inquiries must not pollute the Lead
                // metric, which should count completed orders only.
                trackPixel('Contact');
                contactForm.style.display    = 'none';
                contactSuccess.style.display = 'block';
                setTimeout(closeModal, 2200);
            } else {
                throw new Error('server');
            }
        } catch {
            setBtnState(contactSubmit, false);
            contactSubmit.querySelector('.btn-text').textContent = 'שלח הודעה';
            alert('שגיאה בשליחה. אנא נסו שוב.');
        }
    });
}

/* ===================================
   META PIXEL — funnel events
   PageView fires from the inline head snippet; this section
   adds the funnel depth events. Every call is guarded so the
   page keeps working even if fbevents.js is blocked.
=================================== */
function trackPixel(eventName) {
    if (typeof fbq === 'function') fbq('track', eventName);
}

// Custom funnel events use trackCustom (not a standard event).
function trackPixelCustom(eventName) {
    if (typeof fbq === 'function') fbq('trackCustom', eventName);
}

// Landing signal: the visitor actually loaded the offer page.
trackPixel('ViewContent');

// Funnel start: first interaction with any order-form field
// (focus/typing) or selecting a package (change on the radio).
// Fired exactly once per page load.
let initiateCheckoutFired = false;
function fireInitiateCheckoutOnce() {
    if (initiateCheckoutFired) return;
    initiateCheckoutFired = true;
    trackPixel('InitiateCheckout');
}
if (form) {
    ['focusin', 'input', 'change'].forEach(evt =>
        form.addEventListener(evt, fireInitiateCheckoutOnce)
    );
}

// NOTE: PhotosUploaded now fires on thank-you.html (photo-upload.js),
// where photos are actually uploaded (after payment), not on this page.

// Funnel depth: the visitor scrolled far enough to actually see the
// pricing/package section. Fired once when it first enters the viewport.
const pricingSection = document.getElementById('pricingCards');
if (pricingSection && 'IntersectionObserver' in window) {
    let viewedPricingFired = false;
    const pricingObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (viewedPricingFired || !entry.isIntersecting || entry.intersectionRatio <= 0) return;
            viewedPricingFired = true;
            trackPixelCustom('ViewedPricing');
            pricingObserver.disconnect();
        });
    });
    pricingObserver.observe(pricingSection);
}
