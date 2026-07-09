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

    /* ---- Portfolio: toggle, then frame rises like a gallery unveiling ---- */
    gsap.from('.tier-toggle', {
        y: 24, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.tier-toggle', start: 'top 88%', once: true }
    });
    gsap.from('.carousel-container', {
        y: 70, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.carousel-wrapper', start: 'top 80%', once: true }
    });
    gsap.from('.carousel-btn', {
        opacity: 0, scale: 0.8, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: '.carousel-wrapper', start: 'top 70%', once: true }
    });
    /* dots are rebuilt per tier, so animate the container (not individual dots) */
    gsap.from('.carousel-dots', {
        y: 12, opacity: 0, duration: 0.45, ease: 'power2.out',
        scrollTrigger: { trigger: '.carousel-dots', start: 'top 95%', once: true }
    });

    /* ---- Photo guide: card reveals, examples cascade ---- */
    gsap.from('.photo-guide', {
        y: 56, opacity: 0, duration: 0.95, ease: 'power3.out',
        scrollTrigger: { trigger: '.photo-guide', start: 'top 82%', once: true }
    });
    gsap.from('.photo-guide .example-item', {
        y: 30, opacity: 0, scale: 0.97, duration: 0.7, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.photo-guide .examples-col', start: 'top 85%', once: true }
    });
    gsap.from('.photo-tips-strip li', {
        x: -22, opacity: 0, duration: 0.55, stagger: 0.06, ease: 'power2.out',
        scrollTrigger: { trigger: '.photo-tips-strip', start: 'top 88%', once: true }
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
        y: 46, opacity: 0, scale: 0.97, duration: 0.85, stagger: 0.16, ease: 'power3.out',
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
   VIDEO CAROUSEL — with tier filter (VIP / רגיל)
   Carousel track is direction:ltr (set in CSS).
   translateX(-index * 100%) navigates correctly.
   Only the active tier's slides stay in the flex flow
   (.slide-hidden = display:none), so indexes, wrap-around
   and dots always refer to the visible subset only.
=================================== */
const track      = document.getElementById('carouselTrack');
const allSlides  = track ? Array.from(track.querySelectorAll('.carousel-slide')) : [];
const prevBtn    = document.getElementById('prevBtn');
const nextBtn    = document.getElementById('nextBtn');
const dotsWrap   = document.getElementById('carouselDots');
const tierBtns   = Array.from(document.querySelectorAll('.tier-toggle-btn'));
let slides  = [];   // active subset
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

function setTier(tier) {
    if (!track) return;
    pauseAllVideos();
    allSlides.forEach(slide => {
        const card = slide.querySelector('.video-card');
        slide.classList.toggle('slide-hidden', !card || card.dataset.tier !== tier);
    });
    slides = allSlides.filter(slide => !slide.classList.contains('slide-hidden'));
    tierBtns.forEach(btn => {
        const isActive = btn.dataset.tier === tier;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
    });
    buildDots();
    current = 0;
    // jump (not slide) to the first slide of the new subset
    track.classList.add('no-transition');
    track.style.transform = 'translateX(0%)';
    requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove('no-transition')));
}

tierBtns.forEach(btn => btn.addEventListener('click', () => {
    if (!btn.classList.contains('active')) setTier(btn.dataset.tier);
}));

setTier('vip'); // default view matches the VIP-first pricing

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
   FILE UPLOAD — thumbnail preview with delete
   Max 10 images. Shows thumbnails with ✕ button.
=================================== */
const fileInput   = document.getElementById('photos');
const thumbsGrid  = document.getElementById('thumbsGrid');
const uploadArea  = document.getElementById('fileUploadArea');
const uploadContent = document.getElementById('uploadContent');
let selectedFiles = [];

function renderThumbs() {
    if (!thumbsGrid) return;
    thumbsGrid.innerHTML = '';

    if (selectedFiles.length === 0) {
        if (uploadContent) uploadContent.style.display = 'block';
        return;
    }

    if (uploadContent) uploadContent.style.display = 'none';

    selectedFiles.forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = e => {
            const div = document.createElement('div');
            div.className = 'thumb';
            div.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}" loading="lazy">
                <button type="button" class="thumb-remove" data-index="${i}" aria-label="הסר תמונה">✕</button>
            `;
            thumbsGrid.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

if (fileInput) {
    fileInput.addEventListener('change', () => {
        const incoming = Array.from(fileInput.files);
        const remaining = 10 - selectedFiles.length;
        const toAdd = incoming.slice(0, remaining);
        selectedFiles = [...selectedFiles, ...toAdd];
        if (incoming.length > remaining) {
            alert(`אפשר להעלות עד 10 תמונות. ${incoming.length - remaining} תמונות לא נוספו.`);
        }
        renderThumbs();
        fileInput.value = ''; // reset so same file can be re-added after removal
    });
}

if (thumbsGrid) {
    thumbsGrid.addEventListener('click', e => {
        const btn = e.target.closest('.thumb-remove');
        if (!btn) return;
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index, 10);
        selectedFiles.splice(idx, 1);
        renderThumbs();
    });
}

// Drag-over visual feedback
if (uploadArea) {
    uploadArea.addEventListener('dragover',  e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', ()  => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop',      e  => { e.preventDefault(); uploadArea.classList.remove('drag-over'); });
}

/* ===================================
   SURPRISE CHECKBOX — disables description
=================================== */
const surpriseCheck = document.getElementById('surpriseUs');
const descField     = document.getElementById('description');

if (surpriseCheck && descField) {
    surpriseCheck.addEventListener('change', () => {
        descField.disabled    = surpriseCheck.checked;
        descField.placeholder = surpriseCheck.checked
            ? 'כבר אמרתם לנו, תפתיעו אותנו!'
            : 'יש לכם רעיון ספציפי? ספרו לנו (עד 10 שניות של סרטון)';
        if (surpriseCheck.checked) descField.value = '';
    });
}

/* ===================================
   PACKAGE SELECTOR — VIP / רגיל cards
   Radio inputs already carry the value Formspree
   receives (name="package"). This just keeps the
   submit button text in sync with the selection.
=================================== */
const packageInputs = Array.from(document.querySelectorAll('input[name="package"]'));
const submitBtnTextByPackage = {
    vip: 'לרכישת ה-VIP ושליחת הפרטים',
    regular: 'לרכישת הסרטון הרגיל ושליחת הפרטים'
};

function syncSubmitBtnToPackage() {
    const checked = packageInputs.find(input => input.checked);
    const card = checked ? checked.closest('.pricing-card') : null;
    const pkg = card ? card.dataset.package : 'vip';
    const btn = document.getElementById('submitBtn');
    if (!btn) return;
    const label = submitBtnTextByPackage[pkg] || submitBtnTextByPackage.vip;
    btn.dataset.originalText = label;
    const span = btn.querySelector('.btn-text');
    if (span) span.textContent = label;
}

packageInputs.forEach(input => input.addEventListener('change', syncSubmitBtnToPackage));
syncSubmitBtnToPackage();

/* ===================================
   ORDER FORM — Formspree submission
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
        // Attach selected photos
        data.delete('photos');
        selectedFiles.forEach(f => data.append('photos', f));

        try {
            const res = await fetch(form.action, {
                method:  'POST',
                body:    data,
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                if (typeof fbq !== 'undefined') fbq('track', 'Lead');
                window.location.href = 'thank-you.html';
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
            const res = await fetch(contactForm.action, {
                method:  'POST',
                body:    new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
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
