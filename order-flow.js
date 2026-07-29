/* ===================================
   ORDER FLOW - payment before details
   Loaded after script.js on index.html and thank-you.html.

   The flow:
   1. script.js builds the order FormData (incl. Cloudinary gallery
      link + dynamic _subject) and calls OrderFlow.startPayment().
   2. startPayment() persists the full order to localStorage, sends
      a minimal pre-payment lead to Formspree (so an abandoned
      payment is a recoverable lead, not a ghost), then redirects
      to the payment page of the selected package.
   3. The payment page redirects back to
      thank-you.html?order=<id>&paid=1&pkg=<pkg>.
   4. thank-you.html sends the stored order to Formspree, fires the
      Purchase pixel exactly once per order id, and clears the
      stored order only after a successful send. On failure the
      order stays saved and a retry button + email fallback appear.
   5. Cancel/abandon: the order stays in localStorage and index.html
      shows a "complete your payment" banner instead of forcing a
      full re-fill.
=================================== */
(function () {
    'use strict';

    /* -----------------------------------------------------------
       GROW PAYMENT INTEGRATION (LIVE)
       Single package: the real hosted Grow payment page (fixed
       amount ₪450). The Grow page is configured, on a SUCCESSFUL
       payment, to redirect the customer to a STATIC thank-you URL:
         https://savethedateai.co.il/thank-you.html?paid=1&pkg=regular
       Grow may append its own params (e.g. &response=success).
       The redirect is the SAME for every customer, so it does NOT
       carry our per-order id and there is no webhook. The order id
       is therefore carried by the browser's localStorage
       (PENDING_KEY) and resolved on thank-you.html as the single
       source of truth. paymentUrlFor() still appends ?order=<id>
       as a harmless best-effort (Grow may echo it back), but the
       return flow must never depend on it.
    ----------------------------------------------------------- */
    /* SINGLE PACKAGE: only the ₪450 Grow page is used. The VIP tier was
       cancelled; its Grow link/price were removed so no code path can reach
       it. The 'regular' key is the single package (₪450). */
    const PAYMENT_URLS = {
        regular: 'https://pay.grow.link/MTAzMzEx~e23fb7f011acc26805e1b524653392f9-MzcxNDY4Mw'
    };

    const PACKAGE_PRICES = { regular: 450 };
    const DEFAULT_PKG = 'regular';

    const FORMSPREE_URL = 'https://formspree.io/f/xkoeqydl';
    const PENDING_KEY   = 'sd_pending_order';
    const LAST_DELIVERED_KEY = 'sd_last_delivered'; /* survives pending clear: lets a paid refresh show success, not "order lost" */
    const STATE_PREFIX  = 'sd_order_state_';   /* per-order sent/pixel flags */
    const STATE_MAX_AGE_DAYS = 60;
    const DELIVERED_MAX_AGE_MS = 24 * 60 * 60 * 1000; /* breadcrumb only counts as a fresh success for 24h */

    /* ---------- safe localStorage helpers ---------- */
    function readJSON(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }
    function writeJSON(key, obj) {
        try { localStorage.setItem(key, JSON.stringify(obj)); return true; }
        catch { return false; }
    }
    function removeKey(key) {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
    }

    /* Prune old per-order state flags so localStorage never fills up */
    function pruneOldStates() {
        try {
            const cutoff = Date.now() - STATE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
            const stale = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key || key.indexOf(STATE_PREFIX) !== 0) continue;
                const state = readJSON(key);
                if (!state || !state.createdAt || new Date(state.createdAt).getTime() < cutoff) {
                    stale.push(key);
                }
            }
            stale.forEach(removeKey);
        } catch { /* ignore */ }
    }

    /* ---------- shared helpers ---------- */
    function generateOrderNumber() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        /* no 0/O/1/I/L so the number is easy to read over the phone */
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        let suffix = '';
        for (let i = 0; i < 4; i++) {
            suffix += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return 'SD-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + suffix;
    }

    function paymentUrlFor(order) {
        const base = PAYMENT_URLS[order.pkg] || PAYMENT_URLS[DEFAULT_PKG];
        const sep = base.indexOf('?') === -1 ? '?' : '&';
        return base + sep + 'order=' + encodeURIComponent(order.id);
    }

    async function postToFormspree(entries, timeoutMs) {
        const fd = new FormData();
        entries.forEach(pair => fd.append(pair[0], pair[1]));
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
            const res = await fetch(FORMSPREE_URL, {
                method:    'POST',
                body:      fd,
                headers:   { 'Accept': 'application/json' },
                signal:    ctrl.signal,
                keepalive: true
            });
            if (!res.ok) throw new Error('formspree ' + res.status);
        } finally {
            clearTimeout(timer);
        }
    }

    function trackPixelEvent(eventName, params) {
        if (typeof fbq === 'function') fbq('track', eventName, params);
    }

    /* AddPaymentInfo fires at most once per page load (guards against a
       double submit before the redirect actually navigates away). */
    let addPaymentInfoFired = false;

    /* -----------------------------------------------------------
       ENTRY POINT from script.js (order form submit)
       Returns true when the payment redirect was started, false
       when persisting failed (caller falls back to legacy send).
    ----------------------------------------------------------- */
    async function startPayment(formData, meta) {
        const pkg = PAYMENT_URLS[meta.pkg] ? meta.pkg : DEFAULT_PKG;
        const id  = generateOrderNumber();
        formData.append('order_number', id);

        /* Delivery #1 subject (the "paid, awaiting brief" notice that goes out
           silently on payment from thank-you.html). Delivery #2 (brief + photos)
           is sent later by photo-upload.js with its own subject. Both carry the
           same order number so the owner can match them. */
        formData.set('_subject', 'רכישה חדשה (ממתין לפרטים): ' + (meta.names || 'ללא שם') + ' - ' + id);

        const order = {
            id: id,
            pkg: pkg,
            price: PACKAGE_PRICES[pkg],
            createdAt: new Date().toISOString(),
            names: meta.names || '',
            entries: Array.from(formData.entries()).map(pair => [pair[0], String(pair[1])])
        };

        /* No storage means the order would be lost after payment,
           so let script.js fall back to the legacy direct send. */
        if (!writeJSON(PENDING_KEY, order)) return false;
        const check = readJSON(PENDING_KEY);
        if (!check || check.id !== id) return false;

        /* NO pre-payment email: non-payers never reach the owner's inbox.
           Their behavior is still captured by the Meta pixel
           (InitiateCheckout / ViewedPricing / AddPaymentInfo) for
           retargeting. Only PAID customers get their full details
           emailed, post-payment, from thank-you.html. */

        /* Funnel depth: the visitor reached the Grow payment page.
           Fired exactly once, immediately before the redirect. */
        if (!addPaymentInfoFired) {
            addPaymentInfoFired = true;
            trackPixelEvent('AddPaymentInfo');
        }

        window.location.href = paymentUrlFor(order);
        return true;
    }

    /* -----------------------------------------------------------
       INDEX PAGE: pending order banner
       Shown when a saved order is still awaiting payment (cancel
       or abandoned tab). Lets the visitor jump straight back to
       payment instead of re-filling the whole form.
    ----------------------------------------------------------- */
    function initIndexBanner() {
        const banner = document.getElementById('pendingOrderBanner');
        if (!banner) return;

        const order = readJSON(PENDING_KEY);
        if (!order || !order.id || !order.entries) return;

        const numEl = document.getElementById('pendingOrderNumber');
        if (numEl) numEl.textContent = order.id;
        const namesEl = document.getElementById('pendingOrderNames');
        if (namesEl && order.names) namesEl.textContent = ' של ' + order.names;

        const payBtn = document.getElementById('pendingOrderPay');
        if (payBtn) payBtn.addEventListener('click', () => {
            window.location.href = paymentUrlFor(order);
        });

        const resetBtn = document.getElementById('pendingOrderReset');
        if (resetBtn) resetBtn.addEventListener('click', () => {
            removeKey(PENDING_KEY);
            banner.style.display = 'none';
        });

        banner.style.display = '';
    }

    /* -----------------------------------------------------------
       THANK-YOU PAGE: paid mode
       Without ?paid=1 the page keeps its legacy behavior untouched.
    ----------------------------------------------------------- */
    function show(id, on) {
        const el = document.getElementById(id);
        if (el) el.style.display = on ? '' : 'none';
    }

    function setText(selector, text) {
        const el = document.querySelector(selector);
        if (el) el.textContent = text;
    }

    function applyPaidUI(orderId) {
        const card = document.querySelector('.thankyou-card');
        if (card) card.classList.add('paid');
        setText('.thankyou-title', 'הרכישה הושלמה!');
        setText('.thankyou-subtitle', 'התשלום התקבל ואנחנו יוצאים לעבודה. תוך 24-72 שעות הסרטון שלכם יגיע למייל.');
        const firstStep = document.querySelector('.thankyou-steps .tstep .tstep-text');
        if (firstStep) firstStep.textContent = 'התשלום אושר ואנחנו מתחילים לעבוד על הסרטון שלכם';
        const chipNum = document.getElementById('orderNumberText');
        if (chipNum) chipNum.textContent = orderId || '';
        if (orderId) show('orderChip', true);
    }

    async function initThankYou() {
        /* Only on thank-you.html */
        const tyCard = document.querySelector('.thankyou-card');
        if (!tyCard) return;

        const params = new URLSearchParams(window.location.search);
        if (params.get('paid') !== '1') return;   /* legacy path: unchanged */

        /* Resolve the order id from the URL when present, otherwise
           from the pending order in localStorage. Grow's success
           redirect is STATIC (same for everyone) and does NOT carry
           our per-order id, so localStorage is the source of truth:
           when a pending order exists and paid=1, that pending order
           is the one being delivered even if the URL lacks ?order. */
        const pending = readJSON(PENDING_KEY);
        const orderId = ((params.get('order') || (pending && pending.id) || '') + '').trim();
        applyPaidUI(orderId);

        const stateKey = STATE_PREFIX + orderId;
        const state = readJSON(stateKey) || {
            createdAt: new Date().toISOString(),
            price: null,
            formspreeSent: false,
            purchaseFired: false
        };

        const pendingMatches = Boolean(pending && pending.id === orderId && Array.isArray(pending.entries));

        /* Resolve the package price: stored order > saved state > pkg param */
        if (pendingMatches && pending.price) state.price = pending.price;
        if (!state.price) {
            const pkgParam = params.get('pkg');
            if (pkgParam && PACKAGE_PRICES[pkgParam]) state.price = PACKAGE_PRICES[pkgParam];
        }

        /* Purchase pixel: exactly once per order id, guarded in localStorage */
        if (orderId && state.price && !state.purchaseFired) {
            trackPixelEvent('Purchase', { value: state.price, currency: 'ILS' });
            state.purchaseFired = true;
            writeJSON(stateKey, state);
        }

        /* Already delivered on a previous load (refresh): never resend.
           Stay silent: the normal flow shows no delivery UI at all. */
        if (state.formspreeSent) {
            if (pendingMatches) removeKey(PENDING_KEY);
            return;
        }

        /* Paid but the stored order is gone (storage cleared / other
           device). A customer who already paid and simply REFRESHED the
           thank-you page has a fresh breadcrumb, so this is a normal,
           already-delivered visit: stay silent. Only when there is NO
           usable breadcrumb do we show a SMALL, gentle recovery line so a
           genuinely different-device order is never lost. */
        if (!pendingMatches) {
            const delivered = readJSON(LAST_DELIVERED_KEY);
            const urlOrder = (params.get('order') || '').trim();
            const deliveredRecent = Boolean(delivered && delivered.at &&
                (Date.now() - new Date(delivered.at).getTime()) < DELIVERED_MAX_AGE_MS);
            const deliveredMatches = deliveredRecent && (!urlOrder || urlOrder === delivered.id);

            if (deliveredMatches) {
                applyPaidUI(delivered.id);
                return;   /* normal refresh: silent, details already delivered */
            }

            /* Genuine edge case only: paid, but no order details on this
               device. Show the small, gentle recovery line here (and only
               here) so the owner does not miss a paid order. The recovery
               CTA is a static WhatsApp link in the markup. */
            show('sendLost', true);
            return;
        }

        /* Deliver the full order to Formspree SILENTLY in the background.
           No progress/success/fail UI: the customer only sees the paid
           thank-you header + order chip, then the photo section. On success
           we write the breadcrumb and clear the pending order; on failure
           the pending order stays in localStorage so the next thank-you
           load retries automatically. One extra automatic retry per load. */
        async function deliverOrder() {
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    await postToFormspree(pending.entries, 20000);
                    state.formspreeSent = true;
                    writeJSON(stateKey, state);
                    /* Persistent breadcrumb: survives the pending clear so a
                       later refresh of ?paid=1 stays silent, not "lost". */
                    writeJSON(LAST_DELIVERED_KEY, {
                        id:    orderId,
                        pkg:   pending.pkg || '',
                        price: pending.price || state.price || null,
                        at:    new Date().toISOString()
                    });
                    removeKey(PENDING_KEY);   /* only after a confirmed send */
                    return;
                } catch {
                    /* Order stays in localStorage: nothing is lost; the next
                       thank-you load will retry. */
                }
            }
        }

        await deliverOrder();
    }

    /* ---------- boot ---------- */
    pruneOldStates();
    initIndexBanner();
    initThankYou();

    window.OrderFlow = { startPayment: startPayment };
})();
