/*
 * Integri: campaign attribution + browser tracking for the top-up pages
 * (/shopping/mobile-top-up/**, /syria, /sudan). See "Campaign and Purchase
 * Tracking Spec" (22 Oct 2026). Plain JS so the React shop and the static
 * Syria / Sudan pages share one implementation.
 *
 *   IntegriTracking.init()                  capture the campaign (Step 2), start GTM + consent (Step 6)
 *   IntegriTracking.checkoutPayload(c, l)   fields for POST /recharge/web/create-intent (Step 3)
 *   IntegriTracking.event(name, params, ecommerce)   dataLayer funnel event (Step 6)
 *   IntegriTracking.operatorGroup(name, iso)         ("MTN Nigeria Data", "NG") -> "mtn"
 *   IntegriTracking.openConsent()           show the cookie banner again ("Cookie settings")
 *
 * The browser never sends `purchase`: the server does, once per paid order (Step 5).
 * The order record is the source of truth and works without any consent.
 */
(function () {
  'use strict';
  if (window.IntegriTracking) return;

  // Google Tag Manager container for integri.app. Empty: no GTM, no consent banner;
  // attribution and the dataLayer still work. This replaces the standard GTM snippet,
  // so the Consent Mode defaults are always set before gtm.js loads.
  var GTM_ID = window.INTEGRI_GTM_ID || 'GTM-K6CLWQ8D';

  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
  var STORE = 'integri_attr';
  var CONSENT_STORE = 'integri_consent';
  var MAX_AGE_DAYS = 30;
  var MAX_LEN = 200;
  var PATHS = /^\/(shopping|syria|sudan)(\/|$)/;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  // ── Step 2: campaign capture ─────────────────────────────────────
  // `first` is never overwritten, `last` is replaced by every visit that carries
  // campaign parameters; a visit without them changes nothing. 30-day window.
  function captureAttribution() {
    var params = new URLSearchParams(window.location.search);
    var touch = {};
    var found = false;
    for (var i = 0; i < KEYS.length; i++) {
      var v = params.get(KEYS[i]);
      if (v) { touch[KEYS[i]] = v.slice(0, MAX_LEN); found = true; }
    }
    var saved = read(STORE);
    var now = Date.now();
    if (!saved || typeof saved !== 'object' || !(now <= saved.expires)) saved = null;
    if (!found) return saved;

    touch.landing_page = window.location.pathname.slice(0, MAX_LEN);
    touch.referrer = (document.referrer || '').slice(0, MAX_LEN);
    touch.ts = new Date(now).toISOString();
    var record = {
      first: saved && saved.first ? saved.first : touch,
      last: touch,
      expires: now + MAX_AGE_DAYS * 86400000,
    };
    write(STORE, record);
    return record;
  }

  // GA4 client ID from the _ga cookie: "GA1.1.123456789.1700000000" -> "123456789.1700000000".
  function gaClientId() {
    try {
      var m = document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/);
      var parts = m ? decodeURIComponent(m[1]).split('.') : [];
      return parts.length >= 4 ? parts.slice(-2).join('.') : null;
    } catch (e) { return null; }
  }

  // ── Step 3: what goes with the order ─────────────────────────────
  function checkoutPayload(pageCountry, pageLanguage) {
    var rec = captureAttribution();
    return {
      attribution: rec ? { first: rec.first, last: rec.last } : null,
      ga_client_id: gaClientId(),
      page_country: pageCountry || null,
      page_language: pageLanguage || null,
    };
  }

  // ── Operator grouping (voice and data products of one operator together) ──
  // Same rule as rechargeOrderTracking on the server (Integri_backend functions/src/tracking.ts),
  // so browser and server group alike. [countryIso] e.g. 'NG'.
  var NOISE = /\b(data|bundles?|airtime|internet|top ?up|pinless|voice|credit|postpaid|prepaid)\b/g;
  function operatorGroup(name, countryIso) {
    var s = String(name || '').toLowerCase();
    var country = '';
    try { country = new Intl.DisplayNames(['en'], { type: 'region' }).of(countryIso) || ''; } catch (e) {}
    // Whole word only: "Sudani" is an operator, not Sudan with a suffix.
    if (country) {
      var word = country.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      s = s.replace(new RegExp('\\b' + word + '\\b', 'g'), ' ');
    }
    s = s.replace(NOISE, ' ').trim();
    var first = s.split(/\s+/)[0] || String(name || '').toLowerCase();
    return first.replace(/[^a-z0-9]/g, '') || 'unknown';
  }

  // ── Step 6: dataLayer funnel ─────────────────────────────────────
  function event(name, params, ecommerce) {
    try {
      var e = { event: name };
      for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) e[k] = params[k];
      if (ecommerce) {
        window.dataLayer.push({ ecommerce: null }); // clear the previous ecommerce object (GA4)
        e.ecommerce = ecommerce;
      }
      window.dataLayer.push(e);
    } catch (err) {}
  }

  // ── Step 6: Consent Mode v2 + GTM ────────────────────────────────
  var BANNER = {
    en: ['We use cookies to measure visits and the success of our ads. Your top up works either way.', 'Accept', 'Reject', 'Privacy policy', 'Cookie settings'],
    ar: ['نستخدم ملفات تعريف الارتباط لقياس الزيارات ونجاح إعلاناتنا. يعمل الشحن في الحالتين.', 'قبول', 'رفض', 'سياسة الخصوصية', 'إعدادات ملفات الارتباط'],
    de: ['Wir verwenden Cookies, um Besuche und den Erfolg unserer Werbung zu messen. Ihre Aufladung funktioniert in jedem Fall.', 'Akzeptieren', 'Ablehnen', 'Datenschutz', 'Cookie-Einstellungen'],
    fr: ['Nous utilisons des cookies pour mesurer les visites et l’efficacité de nos publicités. Votre recharge fonctionne dans tous les cas.', 'Accepter', 'Refuser', 'Confidentialité', 'Paramètres des cookies'],
    es: ['Usamos cookies para medir las visitas y el éxito de nuestros anuncios. Tu recarga funciona en cualquier caso.', 'Aceptar', 'Rechazar', 'Privacidad', 'Configuración de cookies'],
    tr: ['Ziyaretleri ve reklamlarımızın başarısını ölçmek için çerezler kullanıyoruz. Yüklemeniz her durumda çalışır.', 'Kabul et', 'Reddet', 'Gizlilik politikası', 'Çerez ayarları'],
    ur: ['ہم وزٹس اور اپنے اشتہارات کی کامیابی ناپنے کے لیے کوکیز استعمال کرتے ہیں۔ آپ کا ٹاپ اپ دونوں صورتوں میں کام کرتا ہے۔', 'قبول کریں', 'مسترد کریں', 'رازداری کی پالیسی', 'کوکی سیٹنگز'],
    fa: ['ما از کوکی‌ها برای سنجش بازدیدها و موفقیت تبلیغات خود استفاده می‌کنیم. شارژ شما در هر صورت انجام می‌شود.', 'پذیرفتن', 'رد کردن', 'حریم خصوصی', 'تنظیمات کوکی'],
    ru: ['Мы используем файлы cookie, чтобы измерять посещения и эффективность рекламы. Пополнение работает в любом случае.', 'Принять', 'Отклонить', 'Конфиденциальность', 'Настройки cookie'],
    uk: ['Ми використовуємо файли cookie, щоб вимірювати відвідування та ефективність реклами. Поповнення працює в будь-якому разі.', 'Прийняти', 'Відхилити', 'Конфіденційність', 'Налаштування cookie'],
  };
  var RTL = { ar: 1, ur: 1, fa: 1 };

  function pageLang() {
    var seg = window.location.pathname.split('/');
    if (seg[1] === 'shopping' && BANNER[seg[4]]) return seg[4];
    var l = String(document.documentElement.lang || 'en').toLowerCase().split('-')[0];
    return BANNER[l] ? l : 'en';
  }

  function applyConsent(granted) {
    var v = granted ? 'granted' : 'denied';
    gtag('consent', 'update', { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v });
  }

  function saveConsent(granted) {
    write(CONSENT_STORE, { granted: granted, ts: new Date().toISOString() });
    applyConsent(granted);
    var b = document.getElementById('integri-consent');
    if (b) b.remove();
  }

  function openConsent() {
    if (!GTM_ID || document.getElementById('integri-consent') || !document.body) return;
    var lang = pageLang(), t = BANNER[lang];
    var box = document.createElement('div');
    box.id = 'integri-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', t[4]);
    box.dir = RTL[lang] ? 'rtl' : 'ltr';
    box.lang = lang;
    box.style.cssText = 'position:fixed;z-index:2147483000;left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;' +
      'background:#141414;color:#e4e4e7;border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:16px;' +
      'box-shadow:0 10px 40px rgba(0,0,0,.5);font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif';
    var p = document.createElement('p');
    p.style.cssText = 'margin:0 0 12px';
    p.textContent = t[0] + ' ';
    var a = document.createElement('a');
    a.href = '/privacy-policy';
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = t[3];
    a.style.cssText = 'color:#5EEAD4;text-decoration:underline';
    p.appendChild(a);
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    // Accept and Reject carry the same weight (GDPR: refusing is as easy as accepting).
    [[t[2], false], [t[1], true]].forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = b[0];
      btn.style.cssText = 'flex:1 1 120px;cursor:pointer;border-radius:12px;padding:10px 14px;font:600 14px system-ui,sans-serif;' +
        'border:1px solid #5EEAD4;' + (b[1] ? 'background:#5EEAD4;color:#0A0A0A' : 'background:transparent;color:#5EEAD4');
      btn.addEventListener('click', function () { saveConsent(b[1]); });
      row.appendChild(btn);
    });
    box.appendChild(p);
    box.appendChild(row);
    document.body.appendChild(box);
  }

  var gtmStarted = false;
  function startGtm() {
    if (gtmStarted || !GTM_ID) return;
    gtmStarted = true;
    // Consent Mode v2: everything denied until the visitor accepts.
    gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied',
      wait_for_update: 500,
    });
    var saved = read(CONSENT_STORE);
    if (saved && typeof saved.granted === 'boolean') applyConsent(saved.granted);

    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID);
    document.head.appendChild(s);

    if (!saved || typeof saved.granted !== 'boolean') {
      if (document.body) openConsent();
      else document.addEventListener('DOMContentLoaded', openConsent);
    }
  }

  function init() {
    if (!PATHS.test(window.location.pathname)) return;
    captureAttribution();
    startGtm();
  }

  window.IntegriTracking = {
    init: init,
    captureAttribution: captureAttribution,
    checkoutPayload: checkoutPayload,
    gaClientId: gaClientId,
    event: event,
    operatorGroup: operatorGroup,
    openConsent: openConsent,
    gtmEnabled: function () { return !!GTM_ID; },
  };
  init();
})();
