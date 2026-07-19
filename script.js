/* ===================================
   CLOUDINARY — unsigned upload config
   Photos are uploaded from the browser straight to
   Cloudinary; only the resulting URLs are sent to
   Formspree (free plan rejects file attachments).
=================================== */
const CLOUDINARY_CONFIG = {
    cloudName: 'lztw1wvc',
    uploadPreset: 'save the date ai'
};

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
   Max 20 images, 15MB per file. Shows thumbnails with ✕ button.
=================================== */
const MAX_PHOTOS  = 20;
const MAX_FILE_MB = 15;
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
        // Placeholder appended synchronously so thumbs keep selection order
        // even though FileReader loads finish out of order.
        const div = document.createElement('div');
        div.className = 'thumb';
        thumbsGrid.appendChild(div);
        const reader = new FileReader();
        reader.onload = e => {
            div.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}" loading="lazy">
                <button type="button" class="thumb-remove" data-index="${i}" aria-label="הסר תמונה">✕</button>
            `;
        };
        reader.readAsDataURL(file);
    });

    // "Add more" tile so another round of photos can be added.
    // Hidden only when the cap is reached.
    if (selectedFiles.length < MAX_PHOTOS) {
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'thumb-add';
        addBtn.setAttribute('aria-label', 'הוסיפו עוד תמונות');
        addBtn.innerHTML = '<span class="thumb-add-plus">+</span><span class="thumb-add-text">הוסיפו עוד</span>';
        thumbsGrid.appendChild(addBtn);
    }
}

if (fileInput) {
    fileInput.addEventListener('change', () => {
        const incoming = Array.from(fileInput.files);
        const messages = [];

        // Per-file size guard: skip giant files so uploads never hang
        const sized  = incoming.filter(f => f.size <= MAX_FILE_MB * 1024 * 1024);
        const tooBig = incoming.length - sized.length;
        if (tooBig === 1) {
            messages.push(`תמונה אחת גדולה מדי (מעל ${MAX_FILE_MB}MB) ולא נוספה. אפשר לצלם צילום מסך שלה או לשלוח גרסה מוקטנת.`);
        } else if (tooBig > 1) {
            messages.push(`${tooBig} תמונות גדולות מדי (מעל ${MAX_FILE_MB}MB) ולא נוספו. אפשר לשלוח גרסאות מוקטנות שלהן.`);
        }

        // Dedup: skip files already selected (or picked twice in this batch),
        // matched by name + size
        const seen = new Set(selectedFiles.map(f => `${f.name}|${f.size}`));
        const unique = sized.filter(f => {
            const key = `${f.name}|${f.size}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        const dupes = sized.length - unique.length;
        if (dupes === 1) {
            messages.push('תמונה אחת כבר נבחרה קודם ולא נוספה שוב.');
        } else if (dupes > 1) {
            messages.push(`${dupes} תמונות כבר נבחרו קודם ולא נוספו שוב.`);
        }

        const remaining = MAX_PHOTOS - selectedFiles.length;
        const toAdd = unique.slice(0, Math.max(remaining, 0));
        selectedFiles = [...selectedFiles, ...toAdd];
        if (unique.length > remaining) {
            const skipped = unique.length - remaining;
            messages.push(skipped === 1
                ? `אפשר להעלות עד ${MAX_PHOTOS} תמונות. תמונה אחת לא נוספה.`
                : `אפשר להעלות עד ${MAX_PHOTOS} תמונות. ${skipped} תמונות לא נוספו.`);
        }

        if (messages.length) alert(messages.join('\n'));
        renderThumbs();
        fileInput.value = ''; // reset so same file can be re-added after removal
    });
}

if (thumbsGrid) {
    thumbsGrid.addEventListener('click', e => {
        // "Add more" tile reopens the file picker for another round
        if (e.target.closest('.thumb-add')) {
            e.stopPropagation();
            if (fileInput) fileInput.click();
            return;
        }
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
            ? 'כבר אמרתם לנו, אנחנו על זה!'
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

function cloudinaryReady() {
    return Boolean(CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.uploadPreset);
}

// Upload a single file to Cloudinary (unsigned preset). Returns public_id.
async function uploadToCloudinary(file) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
        method: 'POST',
        body: fd
    });
    if (!res.ok) throw new Error('cloudinary ' + res.status);
    const json = await res.json();
    if (!json.public_id) throw new Error('cloudinary no id');
    return json.public_id;
}

// Upload all files with max 3 in parallel (mobile-friendly).
// Each failed upload is retried once. Failures resolve to null,
// never throw: photo problems must not block the order.
async function uploadAllPhotos(files, onProgress) {
    const results = new Array(files.length).fill(null);
    let nextIndex = 0;
    let done = 0;

    async function worker() {
        while (nextIndex < files.length) {
            const i = nextIndex++;
            try {
                results[i] = await uploadToCloudinary(files[i]);
            } catch {
                try { results[i] = await uploadToCloudinary(files[i]); } // one retry
                catch { results[i] = null; }
            }
            done++;
            if (onProgress) onProgress(done, files.length);
        }
    }

    const workers = Array.from({ length: Math.min(3, files.length) }, worker);
    await Promise.all(workers);
    return results;
}

// CRITICAL: send exactly ONE link to Formspree. Its "Suspicious URLs"
// spam classifier silently discards submissions that contain many URLs
// (a 12-16 link photo list triggered it), and the filter cannot be
// disabled on the free plan. So: a single gallery-page link + plain-text
// public IDs as a manual-recovery backup. Never add more URL fields.
// The base is resolved at runtime so the emailed link always matches the
// domain the order came from (github.io today, savethedateai.co.il tomorrow).
function buildGalleryUrl(ids) {
    const base = new URL('photos.html', window.location.href).href;
    return base + '?ids=' + ids.map(encodeURIComponent).join(',');
}

// Plain-text backup field (no URLs at all), with a note on failures.
function formatPhotoIds(ids, failedCount) {
    let text = ids.join(', ');
    if (failedCount === 1) {
        text += ' (שימו לב: תמונה אחת לא הועלתה)';
    } else if (failedCount > 1) {
        text += ` (שימו לב: ${failedCount} תמונות לא הועלו)`;
    }
    return text;
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
        // CRITICAL: never send raw files to Formspree (free plan rejects them with 400)
        data.delete('photos');

        // Unique subject per order (overrides the static hidden _subject input)
        const groomName = (data.get('groom_name') || '').toString().trim();
        const brideName = (data.get('bride_name') || '').toString().trim();
        data.set('_subject', `הזמנת Save the Date: ${groomName} ו${brideName} - ${formatSubjectTimestamp()}`);

        let redirectUrl = 'thank-you.html';

        if (selectedFiles.length > 0) {
            let uploaded = [];
            if (cloudinaryReady()) {
                setBtnText(submitBtn, `מעלה תמונות... 0/${selectedFiles.length}`);
                try {
                    uploaded = await uploadAllPhotos(selectedFiles, (done, total) => {
                        setBtnText(submitBtn, `מעלה תמונות... ${done}/${total}`);
                    });
                } catch {
                    uploaded = []; // belt and suspenders: order always goes through
                }
            }

            const ids = uploaded.filter(Boolean);
            const okCount = ids.length;
            if (okCount > 0) {
                data.append('photo_gallery', buildGalleryUrl(ids));
                data.append('photo_ids', formatPhotoIds(ids, uploaded.length - okCount));
                data.append('photo_count', String(okCount));
            } else {
                // Config empty or every upload failed: send the order anyway,
                // ask the customer to email the photos.
                data.append('photo_ids', 'התמונות לא הועלו, הלקוח יתבקש לשלוח למייל');
                data.append('photo_count', '0');
                const names = [data.get('groom_name'), data.get('bride_name')]
                    .filter(Boolean).join(' ו').trim();
                redirectUrl = 'thank-you.html?photos=email' +
                    (names ? `&names=${encodeURIComponent(names)}` : '');
            }
            setBtnText(submitBtn, 'שולח...');
        } else {
            data.append('photo_count', '0');
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
