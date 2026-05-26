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
   FADE IN — intersection observer
=================================== */
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        fadeObserver.unobserve(entry.target);
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* ===================================
   VIDEO CAROUSEL
   Carousel track is direction:ltr (set in CSS).
   translateX(-index * 100%) navigates correctly.
=================================== */
const track   = document.getElementById('carouselTrack');
const slides  = track ? Array.from(track.querySelectorAll('.carousel-slide')) : [];
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dots    = Array.from(document.querySelectorAll('.dot'));
let current   = 0;

function goToSlide(index) {
    slides.forEach(slide => {
        const video = slide.querySelector('video');
        const card  = slide.querySelector('.video-card');
        if (video) { video.pause(); video.currentTime = 0; video.muted = true; }
        if (card)  card.classList.remove('playing');
    });

    current = ((index % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
}

if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(current - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(current + 1));
dots.forEach(dot => dot.addEventListener('click', () => goToSlide(+dot.dataset.index)));

// Swipe support
let touchStartX = 0;
if (track) {
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) goToSlide(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });
}

// Auto-detect video aspect ratio and apply portrait/landscape class
slides.forEach(slide => {
    const video = slide.querySelector('video');
    const card  = slide.querySelector('.video-card');
    if (!video || !card) return;

    video.addEventListener('loadedmetadata', () => {
        if (video.videoHeight > video.videoWidth) {
            card.classList.add('portrait');
        } else {
            card.classList.add('landscape');
        }
    });

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
            ? 'כבר אמרתם לנו — תפתיעו אותנו!'
            : 'יש לכם רעיון ספציפי? ספרו לנו (עד 10 שניות של סרטון)';
        if (surpriseCheck.checked) descField.value = '';
    });
}

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
            submitBtn.querySelector('.btn-text').textContent = 'לרכישה ושליחת הפרטים';
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
