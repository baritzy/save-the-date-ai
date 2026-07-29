/* ===================================
   PHOTO UPLOAD: thank-you page (photos AFTER payment)
   Photos are collected only after the customer has paid. Files go
   straight from the browser to Cloudinary (unsigned preset); only the
   resulting gallery link + public IDs are sent to Formspree, tied to
   the paid order number. Raw files are NEVER sent to Formspree (the
   free plan rejects them with 400), and exactly ONE link is sent (the
   gallery page) because Formspree's spam filter silently drops
   multi-URL submissions.
=================================== */
(function () {
    'use strict';

    const CLOUDINARY_CONFIG = {
        cloudName: 'lztw1wvc',
        uploadPreset: 'save the date ai'
    };
    const FORMSPREE_URL = 'https://formspree.io/f/xkoeqydl';
    const MAX_PHOTOS  = 20;
    const MAX_FILE_MB = 15;

    /* Elements exist only on thank-you.html's upload widget */
    const fileInput     = document.getElementById('photos');
    const thumbsGrid    = document.getElementById('thumbsGrid');
    const uploadArea    = document.getElementById('fileUploadArea');
    const uploadContent = document.getElementById('uploadContent');
    const submitBtn     = document.getElementById('photoSubmitBtn');
    const successEl     = document.getElementById('photoSuccess');
    const flowEl        = document.getElementById('tyPhotoFlow');
    const briefForm     = document.getElementById('briefForm');
    if (!fileInput || !submitBtn) return; // not on the upload page

    const SUBMIT_LABEL = 'שליחת הפרטים והתמונות';

    let selectedFiles = [];

    /* ---------- order number resolution ----------
       Grow's success redirect is STATIC and does not carry our per-order
       id, so we resolve it (in priority order) from: the URL ?order=,
       the pending order in localStorage, then the delivered breadcrumb
       (order-flow.js clears the pending order after delivering, but the
       breadcrumb survives). Captured once at load. */
    function resolveOrderId() {
        try {
            const params = new URLSearchParams(window.location.search);
            const fromUrl = (params.get('order') || '').trim();
            if (fromUrl) return fromUrl;
        } catch (e) { /* ignore */ }
        try {
            const p = JSON.parse(localStorage.getItem('sd_pending_order'));
            if (p && p.id) return p.id;
        } catch (e) { /* ignore */ }
        try {
            const d = JSON.parse(localStorage.getItem('sd_last_delivered'));
            if (d && d.id) return d.id;
        } catch (e) { /* ignore */ }
        return '';
    }
    const ORDER_ID = resolveOrderId();

    /* ---------- pixel (guarded) ---------- */
    function trackPixelCustom(eventName) {
        if (typeof fbq === 'function') fbq('trackCustom', eventName);
    }

    /* ---------- thumbnail preview with delete ---------- */
    function renderThumbs() {
        if (!thumbsGrid) return;
        thumbsGrid.innerHTML = '';

        if (selectedFiles.length === 0) {
            if (uploadContent) uploadContent.style.display = 'block';
            return;
        }

        if (uploadContent) uploadContent.style.display = 'none';

        selectedFiles.forEach((file, i) => {
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

        if (selectedFiles.length < MAX_PHOTOS) {
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'thumb-add';
            addBtn.setAttribute('aria-label', 'הוסיפו עוד תמונות');
            addBtn.innerHTML = '<span class="thumb-add-plus">+</span><span class="thumb-add-text">הוסיפו עוד</span>';
            thumbsGrid.appendChild(addBtn);
        }
    }

    /* PhotosUploaded pixel: once per page, when the visitor actually adds
       at least one photo here (after payment). */
    let photosUploadedFired = false;
    function firePhotosUploadedOnce() {
        if (photosUploadedFired) return;
        if (selectedFiles.length === 0) return;
        photosUploadedFired = true;
        trackPixelCustom('PhotosUploaded');
    }

    fileInput.addEventListener('change', () => {
        const incoming = Array.from(fileInput.files);
        const messages = [];

        const sized  = incoming.filter(f => f.size <= MAX_FILE_MB * 1024 * 1024);
        const tooBig = incoming.length - sized.length;
        if (tooBig === 1) {
            messages.push(`תמונה אחת גדולה מדי (מעל ${MAX_FILE_MB}MB) ולא נוספה. אפשר לצלם צילום מסך שלה או לשלוח גרסה מוקטנת.`);
        } else if (tooBig > 1) {
            messages.push(`${tooBig} תמונות גדולות מדי (מעל ${MAX_FILE_MB}MB) ולא נוספו. אפשר לשלוח גרסאות מוקטנות שלהן.`);
        }

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
        firePhotosUploadedOnce();
        fileInput.value = ''; // reset so same file can be re-added after removal
    });

    if (thumbsGrid) {
        thumbsGrid.addEventListener('click', e => {
            if (e.target.closest('.thumb-add')) {
                e.stopPropagation();
                fileInput.click();
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

    if (uploadArea) {
        uploadArea.addEventListener('dragover',  e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
        uploadArea.addEventListener('dragleave', ()  => uploadArea.classList.remove('drag-over'));
        uploadArea.addEventListener('drop',      e  => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });
    }

    /* ---------- brief form: interactive fields (moved from index/script.js) ---------- */
    (function initBriefInteractions() {
        if (!briefForm) return;

        // Style "אחר": reveal the free-text input
        const styleOtherRadio = document.getElementById('styleOtherRadio');
        const styleOtherWrap  = document.getElementById('styleOtherWrap');
        const styleOtherInput = document.getElementById('styleOtherInput');
        briefForm.querySelectorAll('input[name="style"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const isOther = styleOtherRadio && styleOtherRadio.checked;
                if (styleOtherWrap) styleOtherWrap.classList.toggle('open', isOther);
                if (isOther && styleOtherInput) setTimeout(() => styleOtherInput.focus(), 350);
                if (!isOther && styleOtherInput) styleOtherInput.value = '';
            });
        });

        // Surprise checkbox: disables the idea textarea
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
    })();

    /* Manual validation of the brief's required fields. We do NOT rely on
       native reportValidity() because the radios are display:none (custom
       styled) and would trigger "not focusable" errors. Returns an array of
       missing field labels (empty = valid). */
    function validateBrief() {
        if (!briefForm) return [];
        const missing = [];
        const dateEl = document.getElementById('weddingDate');
        if (!dateEl || !dateEl.value) missing.push('תאריך האירוע');

        const styleChecked = briefForm.querySelector('input[name="style"]:checked');
        if (!styleChecked) {
            missing.push('סגנון הסרטון');
        } else if (styleChecked.value === 'אחר') {
            const other = document.getElementById('styleOtherInput');
            if (!other || !other.value.trim()) missing.push('פירוט הסגנון (אחר)');
        }

        if (!briefForm.querySelector('input[name="format"]:checked')) missing.push('פורמט הסרטון');
        if (!briefForm.querySelector('input[name="outfit"]:checked')) missing.push('בגדים בסרטון');
        return missing;
    }

    /* ---------- Cloudinary unsigned upload ---------- */
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

    // Max 3 in parallel (mobile-friendly). Each failure retried once.
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

    // ONE link only: the gallery page. Base resolved at runtime so the
    // emailed link matches the domain the order came from.
    function buildGalleryUrl(ids) {
        const base = new URL('photos.html', window.location.href).href;
        return base + '?ids=' + ids.map(encodeURIComponent).join(',');
    }

    // Plain-text backup field (no URLs), with a note on failures.
    function formatPhotoIds(ids, failedCount) {
        let text = ids.join(', ');
        if (failedCount === 1) {
            text += ' (שימו לב: תמונה אחת לא הועלתה)';
        } else if (failedCount > 1) {
            text += ` (שימו לב: ${failedCount} תמונות לא הועלו)`;
        }
        return text;
    }

    function setBtnText(text) {
        const span = submitBtn.querySelector('.btn-text');
        if (span) span.textContent = text;
    }

    /* ---------- submit: validate brief, upload photos, deliver BOTH together ----------
       Delivery #2 of the order: the creative brief (date/style/format/outfit/
       idea + extras) plus the single photo gallery link, tied to the order
       number. Delivery #1 (the paid notice) already went out silently from
       order-flow.js on payment. Both carry the same order_number. */
    submitBtn.addEventListener('click', async () => {
        // 1) Brief required fields
        const missing = validateBrief();
        if (missing.length) {
            alert('נא למלא את שדות החובה:\n• ' + missing.join('\n• '));
            if (briefForm && briefForm.scrollIntoView) {
                briefForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
        }

        // 2) At least one photo
        if (selectedFiles.length === 0) {
            alert('בחרו לפחות תמונה אחת להעלאה.');
            if (uploadArea && uploadArea.scrollIntoView) {
                uploadArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        submitBtn.disabled = true;
        setBtnText(`מעלה תמונות... 0/${selectedFiles.length}`);

        let uploaded = [];
        try {
            uploaded = await uploadAllPhotos(selectedFiles, (uploadedCount, total) => {
                setBtnText(`מעלה תמונות... ${uploadedCount}/${total}`);
            });
        } catch {
            uploaded = [];
        }

        const ids = uploaded.filter(Boolean);
        if (ids.length === 0) {
            submitBtn.disabled = false;
            setBtnText(SUBMIT_LABEL);
            alert('ההעלאה נכשלה. נסו שוב, או כתבו לנו בוואטסאפ.');
            return;
        }

        setBtnText('שולח...');
        const failedCount = uploaded.length - ids.length;

        // Brief text fields + the ONE allowed link (the gallery). Raw files are
        // never sent (they went to Cloudinary); only the gallery URL is a link.
        const fd = briefForm ? new FormData(briefForm) : new FormData();
        fd.set('_subject', 'פרטים ותמונות להזמנה ' + (ORDER_ID || '(ללא מספר)'));
        fd.set('order_number', ORDER_ID);
        fd.append('photo_gallery', buildGalleryUrl(ids)); // the ONE allowed link
        fd.append('photo_ids', formatPhotoIds(ids, failedCount));
        fd.append('photo_count', String(ids.length));

        try {
            const res = await fetch(FORMSPREE_URL, {
                method:  'POST',
                body:    fd,
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) throw new Error('formspree ' + res.status);

            if (flowEl) flowEl.style.display = 'none';
            if (successEl) {
                successEl.style.display = '';
                if (successEl.scrollIntoView) {
                    successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        } catch {
            submitBtn.disabled = false;
            setBtnText(SUBMIT_LABEL);
            alert('השליחה נכשלה כרגע. נסו שוב, או כתבו לנו בוואטסאפ.');
        }
    });
})();
