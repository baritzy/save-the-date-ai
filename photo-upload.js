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

    /* ---------- customer identity for delivery #2 ----------
       The brief form on this page collects ONLY creative fields: no name, no
       email, no phone. Delivery #1 (the paid notice, sent by order-flow.js)
       is the one that carries identity, and it only fires when the return URL
       has paid=1. If that redirect ever comes back without paid=1, or the
       send is swallowed by the Formspree spam filter / monthly cap, this
       submission is the ONLY thing we receive about a customer who already
       paid, and it would be anonymous. So we attach the identity from the
       order that is already stored in this browser.

       order-flow.js writes 'sd_pending_order' as
         { id, pkg, price, createdAt, names, entries: [[field, value], ...] }
       where entries are the pre-payment form fields (groom_name, bride_name,
       email, phone, package). It DELETES that key the moment delivery #1
       succeeds, which normally happens long before the customer finishes this
       brief, so we mirror the identity into our own key at page load and read
       it back at submit time. Everything here is null-guarded and best effort:
       a missing or partial identity must never block the submission, and the
       customer's photos are never dropped over it. */
    const PENDING_KEY   = 'sd_pending_order';
    const DELIVERED_KEY = 'sd_last_delivered';
    const IDENTITY_KEY  = 'sd_customer_identity';
    const NOT_FOUND     = 'לא נמצא בדפדפן';

    function readStored(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function identityFromPending(p) {
        if (!p || !Array.isArray(p.entries)) return null;
        const field = name => {
            const hit = p.entries.find(pair => Array.isArray(pair) && pair[0] === name);
            return hit ? String(hit[1] == null ? '' : hit[1]).trim() : '';
        };
        const identity = {
            id:      String(p.id || '').trim(),
            names:   String(p.names || '').trim(),
            groom:   field('groom_name'),
            bride:   field('bride_name'),
            email:   field('email'),
            phone:   field('phone'),
            pkg:     field('package') || String(p.pkg || '').trim(),
            savedAt: new Date().toISOString()
        };
        const hasSomething = identity.names || identity.groom || identity.bride ||
                             identity.email || identity.phone;
        return hasSomething ? identity : null;
    }

    /* Freshest identity available, mirrored so it survives order-flow.js
       clearing the pending order. Never throws, may return null. */
    function resolveIdentity() {
        try {
            const fresh = identityFromPending(readStored(PENDING_KEY));
            if (fresh) {
                try { localStorage.setItem(IDENTITY_KEY, JSON.stringify(fresh)); }
                catch (e) { /* storage full or blocked: keep the in-memory copy */ }
                return fresh;
            }
            return readStored(IDENTITY_KEY);
        } catch (e) { return null; }
    }

    /* Captured at load, while the pending order is usually still present */
    let IDENTITY = resolveIdentity();

    function identityNames(identity) {
        if (!identity) return '';
        if (identity.names) return identity.names;
        return [identity.groom, identity.bride].filter(Boolean).join(' ו');
    }

    /* Short stamp so an unidentified submission still gets a unique subject:
       Gmail threads messages that share a subject and orders get lost in it. */
    function subjectStamp() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + ' ' +
               pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    /* Adds order number, names, email, phone and package to delivery #2 so
       this one submission is enough to identify and contact the payer.
       Adds NO links (the spam filter drops submissions with several URLs).
       Returns { orderId, names, missing } for the subject line. */
    function attachIdentity(fd) {
        const fresh = resolveIdentity();
        if (fresh) IDENTITY = fresh;
        const known      = IDENTITY;
        const breadcrumb = readStored(DELIVERED_KEY);

        const orderId = ORDER_ID || (known && known.id) || '';
        const names   = identityNames(known);
        const email   = known && known.email ? known.email : '';
        const phone   = known && known.phone ? known.phone : '';
        let   pkg     = known && known.pkg ? known.pkg : '';
        if (!pkg && breadcrumb && breadcrumb.pkg) {
            pkg = breadcrumb.pkg + (breadcrumb.price ? ' (₪' + breadcrumb.price + ')' : '');
        }

        fd.set('order_number', orderId || NOT_FOUND);
        fd.set('couple_names', names || NOT_FOUND);
        if (known && known.groom) fd.set('groom_name', known.groom);
        if (known && known.bride) fd.set('bride_name', known.bride);
        fd.set('email', email || NOT_FOUND);
        fd.set('phone', phone || NOT_FOUND);
        fd.set('package', pkg || NOT_FOUND);

        const missing = [];
        if (!orderId) missing.push('מספר הזמנה');
        if (!names)   missing.push('שמות');
        if (!email)   missing.push('מייל');
        if (!phone)   missing.push('טלפון');

        fd.set('identity_status', missing.length === 0
            ? 'מזוהה: פרטי הלקוח צורפו מההזמנה השמורה בדפדפן'
            : 'שים לב, חסר זיהוי: ' + missing.join(', ') + '. הפרטים לא נמצאו בדפדפן של הלקוח, ' +
              'אבל ההגשה נשלחה כדי שלא לאבד את הפרטים והתמונות. לזיהוי המשלם אפשר להצליב מול ' +
              'התשלומים בלוח Grow לפי מועד ההגשה, ולהשוות לתמונות בגלריה.');

        if (known && known.id && ORDER_ID && known.id !== ORDER_ID) {
            fd.set('identity_note', 'הפרטים שצורפו נשמרו בדפדפן עבור הזמנה ' + known.id +
                ', וההגשה הזו משויכת להזמנה ' + ORDER_ID + '. כנראה אותו לקוח, כדאי לאמת.');
        }

        return { orderId: orderId, names: names, missing: missing };
    }

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
                    : 'יש לכם רעיון ספציפי? ספרו לנו (עד 15 שניות של סרטון)';
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
       order-flow.js on payment. Both carry the same order_number, and this
       one also carries the customer identity (see attachIdentity) so it is
       actionable on its own if delivery #1 never landed. */
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

        /* Identity first, so this submission can stand on its own even if
           delivery #1 never arrived. Best effort by design: if anything here
           throws we still send the brief and the photos. */
        let identity = null;
        try { identity = attachIdentity(fd); }
        catch (e) { fd.set('identity_status', 'שים לב, חסר זיהוי: שליפת פרטי הלקוח מהדפדפן נכשלה'); }

        const idForSubject = (identity && identity.orderId) || ORDER_ID || '';
        let subject = 'פרטים ותמונות להזמנה ' + (idForSubject || '(ללא מספר)');
        if (identity && identity.names) subject += ': ' + identity.names;
        /* Without an order number the subject would repeat across customers,
           so stamp it: Gmail must not thread two different orders together. */
        if (!idForSubject) subject += ' - ' + subjectStamp();
        fd.set('_subject', subject);
        if (!fd.get('order_number')) fd.set('order_number', ORDER_ID || NOT_FOUND);
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
