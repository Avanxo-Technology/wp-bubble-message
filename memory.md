# Project Memory – WhatsApp Bubble Plugin

## Current Version: 1.0.0

## What This Project Is
Vanilla JS WhatsApp chat bubble plugin. Zero dependencies, configurable via `data-*` attributes, self-contained (Web Audio API sounds, no external files). Dark mode support.

## Repository
- **Repo**: `git@github.com:Avanxo-Technology/wp-bubble-message.git`
- **CDN**: `https://cdn.jsdelivr.net/gh/Avanxo-Technology/wp-bubble-message@main/whatsapp-bubble.min.js`
- **Demo**: `demo.html` with visual config generator

## Architecture
- **Single file**: `whatsapp-bubble.js` (source), `whatsapp-bubble.min.js` (auto-generated)
- **No external dependencies**: All sounds via Web Audio API oscillators
- **API**: `WhatsAppBubble.update(config)`, `WhatsAppBubble.destroy()`
- **GitHub Action**: Auto-minifies on push to `whatsapp-bubble.js`

## Features Implemented
- Configurable bubble (size, icon: chat/whatsapp/custom SVG, position)
- Chat panel with header (back arrow, avatar, name, video/phone icons)
- Message bubbles (received style, greeting message, timestamp)
- Input area (text input + send button)
- Teaser popup (card with accent bar, avatar, pulse dot, dismiss)
- 5 notification sounds: pop, ding, bubble, chime, slide (Web Audio API)
- Scroll trigger (`data-trigger-id`) with IntersectionObserver
- Dismiss modes: none, session (sessionStorage), persistent (localStorage)
- Dark mode via `prefers-color-scheme: dark`
- Bubble float animation (translateY -5px, pauses on hover)
- Reduced motion support
- Auto-detect host site font
- Avatar fallback with luminance-based contrasting background
- `update()` and `destroy()` API for live config changes
- Semantic versioning with VERSION file

## Key Technical Decisions
1. **AudioContext unlock**: Only on real user gestures (click/touch/keydown/pointerdown). Scroll does NOT count per Chrome autoplay policy. `playSound()` silently returns if context is suspended.
2. **CSS as function**: `buildCSS()` regenerates CSS on `update()` because template literals are evaluated at init time.
3. **Single instance**: Plugin auto-destroys previous instance on load. Demo uses `update()` instead of recreating script tags.

## Changelog
### v1.0.0 (2026-08-29)
- Initial release
- Chat panel with modern UI (header, messages, input)
- Web Audio API sounds (5 types)
- Scroll trigger with IntersectionObserver
- Teaser popup with dismiss modes
- Dark mode support
- Bubble float animation
- `update()`/`destroy()` API
- GitHub Action for auto-minification
- CDN via jsDelivr

## Known Issues
- GitHub Action minification workflow may need debugging (heredoc/YAML issues in CI)
- `workflow_dispatch` trigger sometimes doesn't register properly on GitHub

## Versioning Rules
- **MAJOR**: Breaking changes to API or data attributes
- **MINOR**: New features, new data attributes, backward compatible
- **PATCH**: Bug fixes, CSS tweaks, documentation
- Bump version in `VERSION` file before pushing
- GitHub Action reads VERSION and includes it in banner comment
