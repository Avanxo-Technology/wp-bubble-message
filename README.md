# WhatsApp Chat Bubble

[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/Avanxo-Technology/wp-bubble-message)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Minified](https://img.shields.io/badge/minified-whatsapp--bubble.min.js-orange.svg)](https://cdn.jsdelivr.net/gh/Avanxo-Technology/wp-bubble-message@main/whatsapp-bubble.min.js)

> Widget de chat de WhatsApp para tu página web. Vanilla JS, sin dependencias, configurable con atributos `data-*`.

---

## Instalación rápida

Copia y pega esto en tu HTML. Eso es todo.

```html
<script src="https://cdn.jsdelivr.net/gh/Avanxo-Technology/wp-bubble-message@main/whatsapp-bubble.min.js"
  data-phone="573001234567"
  data-name="Mi Empresa"
  data-color="#25D366"
></script>
```

El widget aparece en la esquina inferior derecha con un botón flotante.

---

## CDN Disponible

| CDN | URL |
|-----|-----|
| **jsDelivr** (recomendado) | `https://cdn.jsdelivr.net/gh/Avanxo-Technology/wp-bubble-message@main/whatsapp-bubble.min.js` |
| **GitHub Raw** | `https://raw.githubusercontent.com/Avanxo-Technology/wp-bubble-message/main/whatsapp-bubble.min.js` |

**Versión fija** (ej: v1.0.0):
```
https://cdn.jsdelivr.net/gh/Avanxo-Technology/wp-bubble-message@v1.0.0/whatsapp-bubble.min.js
```

---

## Configuración

Todos los parámetros se definen como atributos `data-*` en el tag `<script>`.

### Datos de contacto

| Atributo | Default | Descripción |
|----------|---------|-------------|
| `data-phone` | `573001234567` | Número de WhatsApp con código de país (sin `+` ni espacios) |
| `data-name` | `Soporte` | Nombre que aparece en el header del chat |
| `data-avatar` | *(vacío)* | URL de imagen de perfil. Si falla, muestra iniciales automáticamente |

### Colores y estilo

| Atributo | Default | Descripción |
|----------|---------|-------------|
| `data-color` | `#25D366` | Color primario (botón, header, acentos) |
| `data-font-family` | *(auto)* | Fuente del widget. Hereda la del sitio si no se define |
| `data-bubble-size` | `56` | Diámetro del botón flotante en px |
| `data-panel-width` | `340` | Ancho del panel de chat en px |

### Icono del botón

| Atributo | Default | Descripción |
|----------|---------|-------------|
| `data-bubble-icon` | `chat` | `chat`, `whatsapp`, o SVG inline personalizado |

### Sonido de notificación

| Atributo | Default | Descripción |
|----------|---------|-------------|
| `data-sound` | `none` | Sonido al mostrar el teaser. Opciones: `none`, `pop`, `ding`, `bubble`, `chime`, `slide` |

> Los sonidos se generan con Web Audio API (sin archivos externos). Solo suenan después del primer gesto del usuario (política de autoplay del navegador).

### Mensajes

| Atributo | Default | Descripción |
|----------|---------|-------------|
| `data-greeting` | `Te estábamos esperando...` | Mensaje de bienvenida dentro del chat |
| `data-default-message` | `Hola, vengo de la web...` | Mensaje que se envía si el usuario escribe vacío |
| `data-teaser` | `¡Hola! ¿Necesitas ayuda?` | Texto del teaser emergente |
| `data-teaser-subtitle` | `Escríbenos por WhatsApp` | Subtítulo del teaser |
| `data-online-text` | `En línea` | Texto del indicador de estado |
| `data-input-placeholder` | `Escribe tu mensaje…` | Placeholder del input |
| `data-footer-note` | `Se abre WhatsApp...` | Nota debajo del input |

### Comportamiento

| Atributo | Default | Descripción |
|----------|---------|-------------|
| `data-position` | `right` | Posición del widget: `right` o `left` |
| `data-dismiss` | `none` | `none` (siempre visible), `session` (no vuelve al refrescar), `persistent` (no vuelve nunca) |
| `data-trigger-id` | *(vacío)* | ID de un elemento que, al hacerse visible en scroll, muestra el teaser |

### Accesibilidad

| Atributo | Default | Descripción |
|----------|---------|-------------|
| `data-aria-open` | `Abrir chat` | Label de accesibilidad del botón |
| `data-aria-close` | `Cerrar chat` | Label de accesibilidad al cerrar |

---

## Ejemplo completo

```html
<script src="https://cdn.jsdelivr.net/gh/Avanxo-Technology/wp-bubble-message@main/whatsapp-bubble.min.js"
  data-phone="573001234567"
  data-name="Avanxo"
  data-avatar="https://example.com/logo.png"
  data-color="#4285F4"
  data-bubble-icon="whatsapp"
  data-position="right"
  data-dismiss="persistent"
  data-trigger-id="hero"
  data-greeting="Te estábamos esperando. Cuéntanos hacia dónde quieres llevar tu marca."
  data-default-message="Hola, vengo de la web y quiero un diagnóstico."
  data-teaser="¿Necesitas asesoría?"
  data-teaser-subtitle="Estamos en línea"
  data-panel-width="380"
  data-bubble-size="60"
  data-sound="pop"
></script>
```

---

## Funcionalidades

### Avatar con fallback

Si defines `data-avatar` con una URL y la imagen no carga, automáticamente muestra las **iniciales** del nombre sobre un fondo con color de contraste:

```
data-name="Avanxo"    →  "AV"
data-name="Soporte"   →  "SO"
data-name="Mi Tienda" →  "MT"
```

### Dismiss (persistencia del teaser)

Controla qué pasa cuando el usuario cierra el teaser con el botón X:

| Valor | Comportamiento |
|-------|----------------|
| `none` | El teaser siempre vuelve a aparecer |
| `session` | No vuelve hasta cerrar el navegador (sessionStorage) |
| `persistent` | No vuelve nunca más (localStorage) |

### Scroll trigger

El teaser puede aparecer automáticamente cuando el usuario hace scroll hasta una sección:

```html
<section id="pricing">...</section>

<script src="whatsapp-bubble.js"
  data-phone="573001234567"
  data-name="Mi Empresa"
  data-trigger-id="pricing"
  data-teaser="¿Tienes preguntas sobre pricing?"
></script>
```

### Dark mode

Se adapta automáticamente a `prefers-color-scheme: dark`. Sin configuración adicional.

### Múltiples instancias

Puedes tener varios bubbles en la misma página:

```html
<!-- Soporte ventas -->
<script src="whatsapp-bubble.js"
  data-phone="573001111111"
  data-name="Ventas"
  data-color="#25D366"
  data-position="right"
></script>

<!-- Soporte técnico -->
<script src="whatsapp-bubble.js"
  data-phone="573002222222"
  data-name="Soporte"
  data-color="#E53E3E"
  data-position="left"
  data-bubble-icon="whatsapp"
></script>
```

---

## API JavaScript

Después de cargar el plugin, puedes controlarlo programáticamente:

```javascript
// Actualizar configuración en tiempo real
WhatsAppBubble.update({
  name: 'Nuevo Nombre',
  color: '#FF5722',
  greeting: 'Hola, ¿en qué te puedo ayudar?'
});

// Destruir el widget
WhatsAppBubble.destroy();
```

---

## Características técnicas

- **Sin dependencias**: JavaScript vanilla puro
- **Un solo archivo**: Todo autocontenido (CSS + JS + sonidos)
- **Sonidos Web Audio API**: 5 sonidos generados con osciladores, sin archivos externos
- **Dark mode**: Soporte nativo via `prefers-color-scheme`
- **Reduced motion**: Desactiva animaciones si el usuario lo prefiere
- **Fuente heredada**: Detecta la `font-family` del sitio automáticamente
- **Accesibilidad**: `role="dialog"`, `aria-expanded`, `aria-label`, `aria-live`
- **Keyboard**: `Escape` cierra el panel

---

## Desarrollo

### Estructura del proyecto

```
wp-bubble-message/
├── whatsapp-bubble.js      # Código fuente
├── whatsapp-bubble.min.js  # Minificado (auto-generado)
├── demo.html               # Demo con configurador visual
├── VERSION                 # Versión actual (semver)
├── memory.md               # Historial del proyecto
├── LICENSE                 # MIT
└── .github/workflows/
    └── minify.yml          # GitHub Action de minificación
```

### Versionado

Este proyecto usa [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios breaking en la API o atributos
- **MINOR**: Nuevas features, atributos adicionales, backward compatible
- **PATCH**: Bugs fixes, ajustes CSS, documentación

Para bumpear la versión, edita el archivo `VERSION` y haz push. El GitHub Action regenera automáticamente el `.min.js` con el banner comment incluyendo la versión.

---

## Licencia

MIT © [Avanxo Technology](https://github.com/Avanxo-Technology)
