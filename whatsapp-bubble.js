/**
 * WhatsApp Chat Bubble – Vanilla JS Plugin
 *
 * Usage:
 *   <script src="whatsapp-bubble.js"
 *     data-phone="573001234567"
 *     data-name="Mi Empresa"
 *     data-avatar="https://example.com/logo.png"
 *     data-color="#25D366"
 *     data-bubble-icon="whatsapp"
 *     data-greeting="Hola, ¿en qué te podemos ayudar?"
 *     data-default-message="Hola, vengo de la web."
 *     data-teaser="¡Hola! ¿Necesitas ayuda?"
 *     data-teaser-subtitle="Escríbenos por WhatsApp"
 *     data-position="right"
 *     data-dismiss="session"
 *     data-trigger-id="hero"
 *   ></script>
 */
;(function () {
  'use strict';

  /* -----------------------------------------------------------
   * 1. Read configuration from <script> data-* attributes
   * ----------------------------------------------------------- */
  var scriptEl = document.currentScript;
  var cfg = {
    phone:             scriptEl?.getAttribute('data-phone')             || '573001234567',
    name:              scriptEl?.getAttribute('data-name')              || 'Soporte',
    avatar:            scriptEl?.getAttribute('data-avatar')            || '',
    color:             scriptEl?.getAttribute('data-color')             || '#25D366',
    bubbleIcon:        scriptEl?.getAttribute('data-bubble-icon')       || 'chat',
    greeting:          scriptEl?.getAttribute('data-greeting')          || 'Te estábamos esperando. Cuéntanos en qué te podemos ayudar.',
    defaultMessage:    scriptEl?.getAttribute('data-default-message')   || 'Hola, vengo de la web y quiero más información.',
    teaserText:        scriptEl?.getAttribute('data-teaser')            || '¡Hola! ¿Necesitas ayuda?',
    teaserSubtitle:    scriptEl?.getAttribute('data-teaser-subtitle')   || 'Escríbenos por WhatsApp',
    position:          scriptEl?.getAttribute('data-position')          || 'right',
    dismiss:           scriptEl?.getAttribute('data-dismiss')           || 'none',
    bubbleSize:        scriptEl?.getAttribute('data-bubble-size')       || '56',
    panelWidth:        scriptEl?.getAttribute('data-panel-width')       || '340',
    onlineText:        scriptEl?.getAttribute('data-online-text')       || 'En línea',
    inputPlaceholder:  scriptEl?.getAttribute('data-input-placeholder') || 'Escribe tu mensaje…',
    footerNote:        scriptEl?.getAttribute('data-footer-note')       || 'Se abre WhatsApp con tu mensaje listo para enviar.',
    ariaLabelOpen:     scriptEl?.getAttribute('data-aria-open')         || 'Abrir chat',
    ariaLabelClose:    scriptEl?.getAttribute('data-aria-close')        || 'Cerrar chat',
    fontFamily:        scriptEl?.getAttribute('data-font-family')       || '',
  };

  /* Auto-detect site font if not explicitly set */
  if (!cfg.fontFamily) {
    try { cfg.fontFamily = getComputedStyle(document.body).fontFamily; } catch (e) { /* noop */ }
  }
  if (!cfg.fontFamily) {
    cfg.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  }

  /* -----------------------------------------------------------
   * 2. Colour helpers
   * ----------------------------------------------------------- */
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (c) {
      return Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
    }).join('');
  }

  function darken(hex, pct) {
    var c = hexToRgb(hex);
    return rgbToHex(c.r * (1 - pct), c.g * (1 - pct), c.b * (1 - pct));
  }

  function lighten(hex, pct) {
    var c = hexToRgb(hex);
    return rgbToHex(
      c.r + (255 - c.r) * pct,
      c.g + (255 - c.g) * pct,
      c.b + (255 - c.b) * pct
    );
  }

  /** Luminance-based contrasting colour for initials */
  function contrastBg(hex) {
    var c = hexToRgb(hex);
    var lum = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
    return lum > 0.55 ? darken(hex, 0.55) : lighten(hex, 0.55);
  }

  /** Initials from name (max 2 chars) */
  function initials(name) {
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  /* -----------------------------------------------------------
   * 3. Dismiss helpers (session / persistent / none)
   * ----------------------------------------------------------- */
  var STORAGE_KEY = 'wa-bubble-dismissed';

  function isDismissed() {
    if (cfg.dismiss === 'none') return false;
    try {
      if (cfg.dismiss === 'session')  return sessionStorage.getItem(STORAGE_KEY) === '1';
      if (cfg.dismiss === 'persistent') return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) { /* noop */ }
    return false;
  }

  function markDismissed() {
    if (cfg.dismiss === 'none') return;
    try {
      if (cfg.dismiss === 'session')  sessionStorage.setItem(STORAGE_KEY, '1');
      if (cfg.dismiss === 'persistent') localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) { /* noop */ }
  }

  /* -----------------------------------------------------------
   * 4. Build CSS
   * ----------------------------------------------------------- */
  var CSS = /* css */ `
    /* ---------- Root ---------- */
    .wa-root {
      --wa-font: ${cfg.fontFamily};
      --wa-color: ${cfg.color};
      --wa-color-hover: ${darken(cfg.color, 0.1)};
    }

    /* ---------- Reset scoped to the root ---------- */
    .wa-root *, .wa-root *::before, .wa-root *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      border: 0;
      font: inherit;
      color: inherit;
      background: none;
    }

    /* ---------- Container ---------- */
    .wa-container {
      position: fixed;
      bottom: 20px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }
    .wa-container[data-pos="right"] { right: 20px; align-items: flex-end; }
    .wa-container[data-pos="left"]  { left: 20px;  align-items: flex-start; }

    /* ---------- Chat panel ---------- */
    .wa-panel {
      pointer-events: auto;
      width: min(${cfg.panelWidth}px, calc(100vw - 40px));
      border-radius: 16px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 12px 48px rgba(0,0,0,0.22);
      transform-origin: bottom right;
      animation: waSlideIn .32s cubic-bezier(.22,1,.36,1);
    }
    .wa-container[data-pos="left"] .wa-panel { transform-origin: bottom left; }
    @keyframes waSlideIn {
      from { opacity: 0; transform: translateY(14px) scale(.96); }
      to   { opacity: 1; transform: none; }
    }

    /* --- Panel header --- */
    .wa-header {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px;
      background: var(--wa-color);
      color: #fff;
    }
    .wa-header-avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    .wa-header-avatar--initials {
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; font-weight: 700; line-height: 1;
      color: #fff;
    }
    .wa-header-info { flex: 1; min-width: 0; }
    .wa-header-name {
      font-size: 15px; font-weight: 600; line-height: 1.3;
      font-family: var(--wa-font);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .wa-header-status {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; line-height: 1.3; opacity: .9;
      font-family: var(--wa-font);
    }
    .wa-dot-online {
      width: 8px; height: 8px; border-radius: 50%;
      background: #22c55e;
      flex-shrink: 0;
    }
    .wa-close-btn {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 50%;
      color: #fff; cursor: pointer;
      transition: background .2s;
    }
    .wa-close-btn:hover { background: rgba(255,255,255,0.15); }

    /* --- Panel body --- */
    .wa-body { padding: 16px; }

    .wa-msg-row {
      display: flex; align-items: flex-end; gap: 8px;
    }
    .wa-msg-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      object-fit: cover; flex-shrink: 0;
    }
    .wa-msg-avatar--initials {
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; line-height: 1;
      color: #fff;
    }
    .wa-msg-bubble {
      max-width: 86%;
      padding: 12px 14px;
      border-radius: 12px 12px 12px 4px;
      background: #f3f4f6;
      font-size: 14px; line-height: 1.5; color: #1f2937;
      font-family: var(--wa-font);
    }

    /* --- Input area --- */
    .wa-form { margin-top: 14px; }
    .wa-input-row {
      display: flex; align-items: center; gap: 8px;
    }
    .wa-input {
      flex: 1; min-width: 0;
      height: 44px; padding: 0 12px;
      border-radius: 10px;
      border: 1px solid #d1d5db;
      background: #fff; color: #1f2937;
      font-size: 14px; font-family: var(--wa-font);
      outline: none;
      transition: border-color .2s;
    }
    .wa-input::placeholder { color: #9ca3af; }
    .wa-input:focus {       border-color: var(--wa-color); }

    .wa-send-btn {
      width: 44px; height: 44px; flex-shrink: 0;
      border-radius: 50%;
      background: var(--wa-color); color: #fff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background .2s;
    }
    .wa-send-btn:hover { background: var(--wa-color-hover); }

    .wa-footer-note {
      margin-top: 10px;
      text-align: center; font-size: 11px; color: #9ca3af;
      font-family: var(--wa-font);
    }

    /* ---------- Teaser ---------- */
    .wa-teaser {
      pointer-events: auto;
      max-width: 264px;
      border-radius: 14px 14px 14px 4px;
      background: #fff;
      box-shadow: 0 8px 28px rgba(0,0,0,0.16);
      animation: waSlideIn .32s cubic-bezier(.22,1,.36,1);
      position: relative;
    }
    .wa-container[data-pos="left"] .wa-teaser { border-radius: 14px 14px 4px 14px; }
    .wa-teaser-dismiss {
      position: absolute; top: 6px; right: 6px; z-index: 2;
      width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #9ca3af; cursor: pointer;
      transition: background .2s, color .2s;
    }
    .wa-teaser-dismiss:hover { background: #f3f4f6; color: #374151; }
    .wa-teaser-btn {
      display: block; width: 100%; padding: 14px 16px 14px 14px;
      text-align: left; cursor: pointer;
    }
    .wa-teaser-label {
      display: flex; align-items: center; gap: 8px;
      font-size: 11px; font-weight: 700; letter-spacing: .06em;
      text-transform: uppercase; color: var(--wa-color);
      font-family: var(--wa-font);
    }
    .wa-teaser-label-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--wa-color); flex-shrink: 0;
    }
    .wa-teaser-title {
      display: block; margin-top: 8px;
      font-size: 14px; font-weight: 600; line-height: 1.35;
      color: #111827;
      font-family: var(--wa-font);
    }
    .wa-teaser-sub {
      display: block; margin-top: 6px;
      font-size: 13px; line-height: 1.45; color: #6b7280;
      font-family: var(--wa-font);
    }

    /* ---------- Bubble button ---------- */
    .wa-bubble {
      pointer-events: auto;
      width: ${cfg.bubbleSize}px; height: ${cfg.bubbleSize}px;
      border-radius: 50%;
      background: var(--wa-color);
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      box-shadow: 0 6px 22px rgba(0,0,0,0.28);
      transition: background .2s, transform .2s;
    }
    .wa-bubble:hover { background: var(--wa-color-hover); transform: scale(1.06); }
    .wa-bubble:active { transform: scale(.96); }

    /* ---------- Utilities ---------- */
    .wa-sr-only {
      position: absolute; width: 1px; height: 1px;
      padding: 0; margin: -1px; overflow: hidden;
      clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .wa-panel, .wa-teaser { animation: none !important; }
      .wa-bubble { transition: none !important; }
    }
  `;

  /* -----------------------------------------------------------
   * 5. Inject styles
   * ----------------------------------------------------------- */
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* -----------------------------------------------------------
   * 6. SVG icons (inline, no network requests)
   * ----------------------------------------------------------- */
  var ICONS = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    send:  '<svg viewBox="0 0 24 24" fill="currentColor" style="margin-left:2px"><path d="M3.4 20.4 21 12 3.4 3.6 3.39 10.1 15.5 12 3.39 13.9z"/></svg>',
  };

  /* Resolve icon: named key → SVG string, or raw HTML passthrough */
  function resolveIcon(key) {
    if (ICONS[key]) return ICONS[key];
    /* If it looks like an <svg> or <img> tag, use it directly */
    if (key && key.charAt(0) === '<') return key;
    return ICONS.chat;
  }

  /* -----------------------------------------------------------
   * 7. Helper – build DOM from HTML string
   * ----------------------------------------------------------- */
  function html(str) {
    var t = document.createElement('template');
    t.innerHTML = str.trim();
    return t.content.firstChild;
  }

  /* -----------------------------------------------------------
   * 8. Create the widget
   * ----------------------------------------------------------- */
  var root = html('<div class="wa-root" aria-live="polite"></div>');
  var container = html(`<div class="wa-container" data-pos="${cfg.position}"></div>`);
  root.appendChild(container);
  document.body.appendChild(root);

  /* --- State --- */
  var state = { open: false, teaserVisible: false };

  /* --- Elements refs --- */
  var panelEl, teaserEl, bubbleEl, inputEl;

  /* --- Helpers for avatar with fallback --- */
  var fallbackBg = contrastBg(cfg.color);
  var avatarInitials = initials(cfg.name);
  var bubbleIconSvg = resolveIcon(cfg.bubbleIcon);

  /**
   * Build an avatar element that tries to load an image,
   * and falls back to initials on error.
   */
  function makeAvatar(cls, size, withClass) {
    if (!cfg.avatar) {
      return `<span class="${cls} ${withClass}" style="width:${size}px;height:${size}px;border-radius:50%;background:${fallbackBg}" aria-hidden="true">${avatarInitials}</span>`;
    }
    return `<img
      class="${cls}"
      src="${cfg.avatar}"
      alt=""
      aria-hidden="true"
      width="${size}" height="${size}"
      data-wa-fallback-bg="${fallbackBg}"
      data-wa-fallback-text="${avatarInitials}"
      data-wa-fallback-size="${size < 32 ? 11 : 15}"
      onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('span'),{className:this.className+' ${withClass}',textContent:this.dataset.waFallbackText,style:'width:'+this.dataset.waFallbackSize+'px;height:'+this.width+'px;border-radius:50%;background:'+this.dataset.waFallbackBg+';display:flex;align-items:center;justify-content:center;font-size:'+this.dataset.waFallbackSize+'px;font-weight:700;color:#fff'}))"
    >`;
  }

  /* --- Build panel --- */
  function buildPanel() {
    var headerAvatar = makeAvatar('wa-header-avatar', 40, 'wa-header-avatar--initials');
    var bodyAvatar   = makeAvatar('wa-msg-avatar', 28, 'wa-msg-avatar--initials');

    panelEl = html(`
      <div class="wa-panel" role="dialog" aria-label="Chat de WhatsApp" style="display:none">
        <div class="wa-header">
          ${headerAvatar}
          <div class="wa-header-info">
            <p class="wa-header-name">${cfg.name}</p>
            <p class="wa-header-status"><span class="wa-dot-online"></span> ${cfg.onlineText}</p>
          </div>
          <button class="wa-close-btn" aria-label="${cfg.ariaLabelClose}">${ICONS.close}</button>
        </div>
        <div class="wa-body">
          <div class="wa-msg-row">
            ${bodyAvatar}
            <div class="wa-msg-bubble">
              <p>${cfg.greeting}</p>
            </div>
          </div>
          <form class="wa-form" autocomplete="off">
            <div class="wa-input-row">
              <input class="wa-input" type="text" placeholder="${cfg.inputPlaceholder}" aria-label="Escribe tu mensaje">
              <button class="wa-send-btn" type="submit" aria-label="Enviar por WhatsApp">${ICONS.send}</button>
            </div>
            <p class="wa-footer-note">${cfg.footerNote}</p>
          </form>
        </div>
      </div>
    `);

    panelEl.querySelector('.wa-close-btn').addEventListener('click', closePanel);
    panelEl.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      send();
    });
    inputEl = panelEl.querySelector('.wa-input');
  }

  /* --- Build teaser --- */
  function buildTeaser() {
    teaserEl = html(`
      <div class="wa-teaser" role="status" style="display:none">
        <button class="wa-teaser-dismiss" aria-label="Cerrar mensaje">${ICONS.close}</button>
        <button class="wa-teaser-btn" type="button">
          <span class="wa-teaser-label"><span class="wa-teaser-label-dot"></span>${cfg.name}</span>
          <span class="wa-teaser-title">${cfg.teaserText}</span>
          <span class="wa-teaser-sub">${cfg.teaserSubtitle}</span>
        </button>
      </div>
    `);
    teaserEl.querySelector('.wa-teaser-dismiss').addEventListener('click', dismissTeaser);
    teaserEl.querySelector('.wa-teaser-btn').addEventListener('click', function () {
      dismissTeaser();
      openPanel();
    });
  }

  /* --- Build bubble --- */
  function buildBubble() {
    bubbleEl = html(`
      <button class="wa-bubble" type="button" aria-label="${cfg.ariaLabelOpen}" aria-expanded="false" aria-controls="wa-chat-panel">
        <span style="width:28px;height:28px">${bubbleIconSvg}</span>
      </button>
    `);
    bubbleEl.addEventListener('click', toggle);
  }

  /* --- Actions --- */
  function toggle() { state.open ? closePanel() : openPanel(); }

  function openPanel() {
    state.open = true;
    hideTeaser();
    bubbleEl.setAttribute('aria-expanded', 'true');
    bubbleEl.setAttribute('aria-label', cfg.ariaLabelClose);
    bubbleEl.innerHTML = `<span style="width:24px;height:24px">${ICONS.close}</span>`;
    panelEl.style.display = '';
    inputEl.value = '';
    setTimeout(function () { inputEl.focus(); }, 80);
  }

  function closePanel() {
    state.open = false;
    bubbleEl.setAttribute('aria-expanded', 'false');
    bubbleEl.setAttribute('aria-label', cfg.ariaLabelOpen);
    bubbleEl.innerHTML = `<span style="width:28px;height:28px">${bubbleIconSvg}</span>`;
    panelEl.style.display = 'none';
    bubbleEl.focus();
  }

  function showTeaser() {
    if (isDismissed()) return;
    state.teaserVisible = true;
    teaserEl.style.display = '';
  }

  function hideTeaser() {
    state.teaserVisible = false;
    teaserEl.style.display = 'none';
  }

  function dismissTeaser() {
    hideTeaser();
    markDismissed();
  }

  function send() {
    var text = (inputEl.value.trim()) || cfg.defaultMessage;
    window.open(
      'https://wa.me/' + cfg.phone + '?text=' + encodeURIComponent(text),
      '_blank',
      'noopener'
    );
    inputEl.value = '';
    closePanel();
  }

  /* --- Keyboard --- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.open) closePanel();
  });

  /* --- Optional: auto-show teaser when user scrolls past a trigger --- */
  function watchTrigger() {
    var triggerId = scriptEl?.getAttribute('data-trigger-id');
    if (!triggerId) return;
    var trigger = document.getElementById(triggerId);
    if (!trigger) return;
    if (!('IntersectionObserver' in window)) { showTeaser(); return; }
    new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) {
        showTeaser();
        obs.disconnect();
      }
    }, { threshold: 0.25 }).observe(trigger);
  }

  /* -----------------------------------------------------------
   * 9. Initialise
   * ----------------------------------------------------------- */
  buildPanel();
  buildTeaser();
  buildBubble();

  container.appendChild(panelEl);
  container.appendChild(teaserEl);
  container.appendChild(bubbleEl);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchTrigger);
  } else {
    watchTrigger();
  }
})();
