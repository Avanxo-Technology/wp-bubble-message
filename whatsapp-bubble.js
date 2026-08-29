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
 *     data-sound="pop"
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
   * 1. Read configuration
   * ----------------------------------------------------------- */
  var scriptEl = document.currentScript;
  var cfg = {
    phone:             scriptEl?.getAttribute('data-phone')             || '573001234567',
    name:              scriptEl?.getAttribute('data-name')              || 'Soporte',
    avatar:            scriptEl?.getAttribute('data-avatar')            || '',
    color:             scriptEl?.getAttribute('data-color')             || '#25D366',
    bubbleIcon:        scriptEl?.getAttribute('data-bubble-icon')       || 'chat',
    sound:             scriptEl?.getAttribute('data-sound')             || 'none',
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

  /* Auto-detect site font */
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
    return { r: parseInt(hex.substring(0, 2), 16), g: parseInt(hex.substring(2, 4), 16), b: parseInt(hex.substring(4, 6), 16) };
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (c) { return Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0'); }).join('');
  }
  function darken(hex, pct) { var c = hexToRgb(hex); return rgbToHex(c.r * (1 - pct), c.g * (1 - pct), c.b * (1 - pct)); }
  function lighten(hex, pct) { var c = hexToRgb(hex); return rgbToHex(c.r + (255 - c.r) * pct, c.g + (255 - c.g) * pct, c.b + (255 - c.b) * pct); }
  function contrastBg(hex) {
    var c = hexToRgb(hex);
    var lum = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
    return lum > 0.55 ? darken(hex, 0.6) : lighten(hex, 0.55);
  }
  function initials(name) {
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  /* -----------------------------------------------------------
   * 3. Dismiss helpers
   * ----------------------------------------------------------- */
  var STORAGE_KEY = 'wa-bubble-dismissed-' + cfg.phone;
  function isDismissed() {
    if (cfg.dismiss === 'none') return false;
    try {
      if (cfg.dismiss === 'session') return sessionStorage.getItem(STORAGE_KEY) === '1';
      if (cfg.dismiss === 'persistent') return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) { /* noop */ }
    return false;
  }
  function markDismissed() {
    if (cfg.dismiss === 'none') return;
    try {
      if (cfg.dismiss === 'session') sessionStorage.setItem(STORAGE_KEY, '1');
      if (cfg.dismiss === 'persistent') localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) { /* noop */ }
  }

  /* -----------------------------------------------------------
   * 4. Sound synthesis (Web Audio API — no external files)
   * ----------------------------------------------------------- */
  var audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* noop */ }
    }
    return audioCtx;
  }

  var SOUNDS = {
    pop: function () {
      var ctx = getAudioCtx(); if (!ctx) return;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(600, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.12);
      g.gain.setValueAtTime(0.25, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.15);
    },
    ding: function () {
      var ctx = getAudioCtx(); if (!ctx) return;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.25);
    },
    bubble: function () {
      var ctx = getAudioCtx(); if (!ctx) return;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(400, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06);
      o.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.14);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.18);
    },
    chime: function () {
      var ctx = getAudioCtx(); if (!ctx) return;
      [523, 659, 784].forEach(function (freq, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
        g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
        o.start(ctx.currentTime + i * 0.08); o.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    },
    slide: function () {
      var ctx = getAudioCtx(); if (!ctx) return;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(300, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.18, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.12);
    },
  };

  function playSound() {
    if (cfg.sound === 'none' || !SOUNDS[cfg.sound]) return;
    try { SOUNDS[cfg.sound](); } catch (e) { /* noop */ }
  }

  /* -----------------------------------------------------------
   * 5. Build CSS
   * ----------------------------------------------------------- */
  var CSS = `
    .wa-root {
      --wa-font: ${cfg.fontFamily};
      --wa-color: ${cfg.color};
      --wa-color-hover: ${darken(cfg.color, 0.1)};
    }
    .wa-root *, .wa-root *::before, .wa-root *::after {
      box-sizing: border-box; margin: 0; padding: 0; border: 0;
      font: inherit; color: inherit; background: none;
    }
    .wa-container {
      position: fixed; bottom: 20px; z-index: 2147483647;
      display: flex; flex-direction: column; gap: 12px; pointer-events: none;
    }
    .wa-container[data-pos="right"] { right: 20px; align-items: flex-end; }
    .wa-container[data-pos="left"]  { left: 20px;  align-items: flex-start; }

    .wa-panel {
      pointer-events: auto;
      width: min(${cfg.panelWidth}px, calc(100vw - 40px));
      border-radius: 16px; overflow: hidden; background: #fff;
      box-shadow: 0 12px 48px rgba(0,0,0,0.22);
      transform-origin: bottom right;
      animation: waSlideIn .32s cubic-bezier(.22,1,.36,1);
    }
    .wa-container[data-pos="left"] .wa-panel { transform-origin: bottom left; }
    @keyframes waSlideIn {
      from { opacity: 0; transform: translateY(14px) scale(.96); }
      to   { opacity: 1; transform: none; }
    }

    .wa-header {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px; background: var(--wa-color); color: #fff;
    }
    .wa-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; position: relative; overflow: hidden; }
    .wa-avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
    .wa-avatar-fallback {
      width: 100%; height: 100%; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; font-weight: 700; color: #fff; line-height: 1;
    }
    .wa-header-info { flex: 1; min-width: 0; }
    .wa-header-name { font-size: 15px; font-weight: 600; line-height: 1.3; font-family: var(--wa-font); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .wa-header-status { display: flex; align-items: center; gap: 6px; font-size: 12px; line-height: 1.3; opacity: .9; font-family: var(--wa-font); }
    .wa-dot-online { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
    .wa-close-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; color: #fff; cursor: pointer; transition: background .2s; }
    .wa-close-btn:hover { background: rgba(255,255,255,0.15); }

    .wa-body { padding: 16px; }
    .wa-msg-row { display: flex; align-items: flex-end; gap: 8px; }
    .wa-msg-avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; position: relative; overflow: hidden; }
    .wa-msg-avatar .wa-avatar-img { width: 100%; height: 100%; }
    .wa-msg-avatar .wa-avatar-fallback { font-size: 11px; }
    .wa-msg-bubble { max-width: 86%; padding: 12px 14px; border-radius: 12px 12px 12px 4px; background: #f3f4f6; font-size: 14px; line-height: 1.5; color: #1f2937; font-family: var(--wa-font); }

    .wa-form { margin-top: 14px; }
    .wa-input-row { display: flex; align-items: center; gap: 8px; }
    .wa-input { flex: 1; min-width: 0; height: 44px; padding: 0 12px; border-radius: 10px; border: 1px solid #d1d5db; background: #fff; color: #1f2937; font-size: 14px; font-family: var(--wa-font); outline: none; transition: border-color .2s; }
    .wa-input::placeholder { color: #9ca3af; }
    .wa-input:focus { border-color: var(--wa-color); }
    .wa-send-btn { width: 44px; height: 44px; flex-shrink: 0; border-radius: 50%; background: var(--wa-color); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s; }
    .wa-send-btn:hover { background: var(--wa-color-hover); }
    .wa-send-btn svg { width: 20px; height: 20px; }
    .wa-footer-note { margin-top: 10px; text-align: center; font-size: 11px; color: #9ca3af; font-family: var(--wa-font); }

    /* --- Teaser: modern card design --- */
    .wa-teaser {
      pointer-events: auto; width: 300px;
      border-radius: 16px; background: #fff;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
      position: relative; overflow: hidden;
      animation: waTeaserIn .4s cubic-bezier(.16,1,.3,1);
      border: 1px solid rgba(0,0,0,0.04);
    }
    .wa-container[data-pos="left"] .wa-teaser { animation-name: waTeaserInLeft; }
    @keyframes waTeaserIn {
      from { opacity: 0; transform: translateY(20px) scale(.92); }
      to   { opacity: 1; transform: none; }
    }
    @keyframes waTeaserInLeft {
      from { opacity: 0; transform: translateY(20px) scale(.92); }
      to   { opacity: 1; transform: none; }
    }
    .wa-teaser-accent {
      position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
      background: var(--wa-color);
    }
    .wa-teaser-dismiss {
      position: absolute; top: 10px; right: 10px; z-index: 2;
      width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #cbd5e1; cursor: pointer;
      transition: background .15s, color .15s, transform .15s;
    }
    .wa-teaser-dismiss:hover { background: #f1f5f9; color: #475569; transform: scale(1.1); }
    .wa-teaser-dismiss svg { width: 14px; height: 14px; }
    .wa-teaser-btn {
      display: flex; align-items: center; gap: 12px;
      width: 100%; padding: 16px 16px 16px 20px; text-align: left; cursor: pointer;
    }
    .wa-teaser-avatar {
      width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
      position: relative; overflow: hidden;
    }
    .wa-teaser-avatar .wa-avatar-fallback { font-size: 14px; }
    .wa-teaser-content { flex: 1; min-width: 0; }
    .wa-teaser-header {
      display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
    }
    .wa-teaser-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #22c55e; flex-shrink: 0;
      animation: waPulse 2s ease-in-out infinite;
    }
    @keyframes waPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: .6; transform: scale(1.3); }
    }
    .wa-teaser-name {
      font-size: 12px; font-weight: 600; color: var(--wa-color);
      font-family: var(--wa-font); letter-spacing: .01em;
    }
    .wa-teaser-title {
      font-size: 14px; font-weight: 600; line-height: 1.4;
      color: #1e293b; font-family: var(--wa-font);
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .wa-teaser-sub {
      font-size: 12px; line-height: 1.4; color: #94a3b8;
      font-family: var(--wa-font); margin-top: 2px;
    }

    .wa-bubble {
      pointer-events: auto;
      width: ${cfg.bubbleSize}px; height: ${cfg.bubbleSize}px;
      border-radius: 50%; background: var(--wa-color); color: #fff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 6px 22px rgba(0,0,0,0.28);
      transition: background .2s, transform .2s;
    }
    .wa-bubble:hover { background: var(--wa-color-hover); transform: scale(1.06); }
    .wa-bubble:active { transform: scale(.96); }

    @media (prefers-reduced-motion: reduce) {
      .wa-panel, .wa-teaser { animation: none !important; }
      .wa-bubble { transition: none !important; }
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* -----------------------------------------------------------
   * 6. SVG icons
   * ----------------------------------------------------------- */
  var ICONS = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4 21 12 3.4 3.6 3.39 10.1 15.5 12 3.39 13.9z"/></svg>',
  };
  function resolveIcon(key) {
    if (ICONS[key]) return ICONS[key];
    if (key && key.charAt(0) === '<') return key;
    return ICONS.chat;
  }

  /* -----------------------------------------------------------
   * 7. DOM helpers
   * ----------------------------------------------------------- */
  function html(str) { var t = document.createElement('template'); t.innerHTML = str.trim(); return t.content.firstChild; }
  var _avatarId = 0;

  /**
   * Creates an avatar container with image + fallback.
   * Uses DOM events (not inline onerror) for reliability.
   */
  function makeAvatar(size, fallbackSize) {
    var bg = contrastBg(cfg.color);
    var ini = initials(cfg.name);
    var id = 'wa-av-' + (++_avatarId);

    var el = document.createElement('div');
    el.className = 'wa-avatar';
    el.style.width = size + 'px';
    el.style.height = size + 'px';

    /* Fallback (initials) — shown by default if no avatar, or behind image */
    var fallback = document.createElement('span');
    fallback.className = 'wa-avatar-fallback';
    fallback.style.background = bg;
    fallback.style.fontSize = fallbackSize + 'px';
    fallback.textContent = ini;

    if (!cfg.avatar) {
      /* No avatar URL → show initials only */
      el.appendChild(fallback);
    } else {
      /* Has avatar URL → show image, fallback on error */
      var img = document.createElement('img');
      img.className = 'wa-avatar-img';
      img.src = cfg.avatar;
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.loading = 'lazy';
      img.onerror = function () {
        img.remove();
        el.appendChild(fallback);
      };
      el.appendChild(img);
    }
    return el;
  }

  /* -----------------------------------------------------------
   * 8. Create widget
   * ----------------------------------------------------------- */
  var root = html('<div class="wa-root" aria-live="polite"></div>');
  var container = html('<div class="wa-container" data-pos="' + cfg.position + '"></div>');
  root.appendChild(container);
  document.body.appendChild(root);

  var state = { open: false, teaserVisible: false };
  var panelEl, teaserEl, bubbleEl, inputEl;
  var bubbleIconSvg = resolveIcon(cfg.bubbleIcon);

  /* --- Build panel --- */
  function buildPanel() {
    var headerAvatar = makeAvatar(40, 15);
    var bodyAvatar = makeAvatar(28, 11);

    panelEl = html(
      '<div class="wa-panel" role="dialog" aria-label="Chat de WhatsApp" style="display:none">' +
        '<div class="wa-header"></div>' +
        '<div class="wa-body">' +
          '<div class="wa-msg-row"></div>' +
          '<form class="wa-form" autocomplete="off">' +
            '<div class="wa-input-row">' +
              '<input class="wa-input" type="text" placeholder="' + cfg.inputPlaceholder + '" aria-label="Escribe tu mensaje">' +
              '<button class="wa-send-btn" type="submit" aria-label="Enviar por WhatsApp">' + ICONS.send + '</button>' +
            '</div>' +
            '<p class="wa-footer-note">' + cfg.footerNote + '</p>' +
          '</form>' +
        '</div>' +
      '</div>'
    );

    /* Header */
    var header = panelEl.querySelector('.wa-header');
    header.appendChild(headerAvatar);
    var info = html('<div class="wa-header-info"><p class="wa-header-name">' + cfg.name + '</p><p class="wa-header-status"><span class="wa-dot-online"></span> ' + cfg.onlineText + '</p></div>');
    header.appendChild(info);
    var closeBtn = html('<button class="wa-close-btn" aria-label="' + cfg.ariaLabelClose + '">' + ICONS.close + '</button>');
    header.appendChild(closeBtn);

    /* Message body */
    var msgRow = panelEl.querySelector('.wa-msg-row');
    msgRow.appendChild(bodyAvatar);
    msgRow.appendChild(html('<div class="wa-msg-bubble"><p>' + cfg.greeting + '</p></div>'));

    closeBtn.addEventListener('click', closePanel);
    panelEl.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); send(); });
    inputEl = panelEl.querySelector('.wa-input');
  }

  /* --- Build teaser --- */
  function buildTeaser() {
    var teaserAvatar = makeAvatar(44, 14);
    teaserAvatar.className = 'wa-teaser-avatar';

    teaserEl = document.createElement('div');
    teaserEl.className = 'wa-teaser';
    teaserEl.setAttribute('role', 'status');
    teaserEl.style.display = 'none';

    /* Accent bar */
    var accent = document.createElement('span');
    accent.className = 'wa-teaser-accent';
    teaserEl.appendChild(accent);

    /* Dismiss button */
    var dismissBtn = document.createElement('button');
    dismissBtn.className = 'wa-teaser-dismiss';
    dismissBtn.setAttribute('aria-label', 'Cerrar mensaje');
    dismissBtn.innerHTML = ICONS.close;
    dismissBtn.addEventListener('click', dismissTeaser);
    teaserEl.appendChild(dismissBtn);

    /* Main clickable area */
    var btn = document.createElement('button');
    btn.className = 'wa-teaser-btn';
    btn.type = 'button';
    btn.addEventListener('click', function () { dismissTeaser(); openPanel(); });

    btn.appendChild(teaserAvatar);

    var content = document.createElement('div');
    content.className = 'wa-teaser-content';

    var header = document.createElement('div');
    header.className = 'wa-teaser-header';
    header.innerHTML = '<span class="wa-teaser-dot"></span><span class="wa-teaser-name">' + cfg.name + '</span>';

    var title = document.createElement('span');
    title.className = 'wa-teaser-title';
    title.textContent = cfg.teaserText;

    var sub = document.createElement('span');
    sub.className = 'wa-teaser-sub';
    sub.textContent = cfg.teaserSubtitle;

    content.appendChild(header);
    content.appendChild(title);
    content.appendChild(sub);
    btn.appendChild(content);
    teaserEl.appendChild(btn);
  }

  /* --- Build bubble --- */
  function buildBubble() {
    bubbleEl = html(
      '<button class="wa-bubble" type="button" aria-label="' + cfg.ariaLabelOpen + '" aria-expanded="false">' +
        '<span style="width:28px;height:28px">' + bubbleIconSvg + '</span>' +
      '</button>'
    );
    bubbleEl.addEventListener('click', toggle);
  }

  /* --- Actions --- */
  function toggle() { state.open ? closePanel() : openPanel(); }

  function openPanel() {
    state.open = true;
    hideTeaser();
    bubbleEl.setAttribute('aria-expanded', 'true');
    bubbleEl.setAttribute('aria-label', cfg.ariaLabelClose);
    bubbleEl.innerHTML = '<span style="width:24px;height:24px">' + ICONS.close + '</span>';
    panelEl.style.display = '';
    inputEl.value = '';
    setTimeout(function () { inputEl.focus(); }, 80);
  }

  function closePanel() {
    state.open = false;
    bubbleEl.setAttribute('aria-expanded', 'false');
    bubbleEl.setAttribute('aria-label', cfg.ariaLabelOpen);
    bubbleEl.innerHTML = '<span style="width:28px;height:28px">' + bubbleIconSvg + '</span>';
    panelEl.style.display = 'none';
    bubbleEl.focus();
  }

  function showTeaser() {
    /* Don't show teaser if panel is already open or already visible */
    if (state.open || state.teaserVisible) return;
    if (isDismissed()) return;
    state.teaserVisible = true;
    teaserEl.style.display = '';
    playSound();
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
    window.open('https://wa.me/' + cfg.phone + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    inputEl.value = '';
    closePanel();
  }

  /* --- Keyboard --- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.open) closePanel();
  });

  /* --- Scroll trigger: only fires AFTER user has scrolled at least once --- */
  function watchTrigger() {
    var triggerId = scriptEl?.getAttribute('data-trigger-id');
    if (!triggerId) return;
    var trigger = document.getElementById(triggerId);
    if (!trigger) return;
    if (!('IntersectionObserver' in window)) {
      /* Fallback: show after a short delay */
      setTimeout(showTeaser, 2000);
      return;
    }

    var hasScrolled = false;
    function onFirstScroll() {
      hasScrolled = true;
      window.removeEventListener('scroll', onFirstScroll, { passive: true });
    }
    window.addEventListener('scroll', onFirstScroll, { passive: true });

    new IntersectionObserver(function (entries, obs) {
      /* Only show if user has actually scrolled and element is visible */
      if (entries[0].isIntersecting && hasScrolled) {
        showTeaser();
        obs.disconnect();
      }
    }, { threshold: 0.2, rootMargin: '0px 0px -5% 0px' }).observe(trigger);
  }

  /* --- Init --- */
  buildPanel(); buildTeaser(); buildBubble();
  container.appendChild(panelEl);
  container.appendChild(teaserEl);
  container.appendChild(bubbleEl);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchTrigger);
  } else {
    watchTrigger();
  }
})();
