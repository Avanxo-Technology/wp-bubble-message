# whatsapp-bubble

Plugin vanilla JavaScript para un widget de chat de WhatsApp. Sin dependencias, configurable via atributos `data-*`, listo para usar en cualquier página.

## Instalación

### Opción 1 – GitHub como CDN (recomendado)

```html
<script src="https://raw.githubusercontent.com/Avanxo-Technology/wp-bubble-message/main/whatsapp-bubble.js"
  data-phone="573001234567"
  data-name="Mi Empresa"
  data-color="#25D366"
></script>
```

### Opción 2 – Descarga local

1. Descarga `whatsapp-bubble.js`
2. Colócalo en tu servidor (ej: `/js/whatsapp-bubble.js`)
3. Referéncialo en tu HTML

## Uso básico

```html
<script src="whatsapp-bubble.js"
  data-phone="573001234567"
  data-name="Mi Empresa"
></script>
```

Eso es todo. El widget aparece en la esquina inferior derecha.

## Configuración

Todos los parámetros se definen como atributos `data-*` en el tag `<script>`:

### Datos de contacto

| Atributo | Default | Descripción |
|---|---|---|
| `data-phone` | `573001234567` | Número de WhatsApp con código de país (sin `+` ni espacios) |
| `data-name` | `Soporte` | Nombre que aparece en el header del panel |
| `data-avatar` | *(none)* | URL de la imagen de perfil. Si falla, muestra iniciales con color de contraste |

### Colores y estilo

| Atributo | Default | Descripción |
|---|---|---|
| `data-color` | `#25D366` | Color primario (botón, header, acentos) |
| `data-font-family` | *(auto)* | Fuente del widget. Si no se define, hereda la del sitio automáticamente |
| `data-bubble-size` | `56` | Diámetro del botón flotante en px |
| `data-panel-width` | `340` | Ancho del panel de chat en px |

### Icono del botón

| Atributo | Default | Descripción |
|---|---|---|
| `data-bubble-icon` | `chat` | Icono del botón flotante. Opciones: `chat`, `whatsapp`, o un string con HTML `<svg>...</svg>` |

### Sonido de notificación

| Atributo | Default | Descripción |
|---|---|---|
| `data-sound` | `none` | Sonido al mostrar el teaser. Opciones: `none`, `pop`, `ding`, `bubble`, `chime`, `slide` |

Los sonidos se generan con Web Audio API (sin archivos externos).

### Mensajes

| Atributo | Default | Descripción |
|---|---|---|
| `data-greeting` | `Te estábamos esperando...` | Mensaje de bienvenida dentro del chat |
| `data-default-message` | `Hola, vengo de la web...` | Mensaje que se envía si el usuario escribe vacío |
| `data-teaser` | `¡Hola! ¿Necesitas ayuda?` | Texto del teaser emergente |
| `data-teaser-subtitle` | `Escríbenos por WhatsApp` | Subtítulo del teaser |
| `data-online-text` | `En línea` | Texto del indicador de estado |
| `data-input-placeholder` | `Escribe tu mensaje…` | Placeholder del input |
| `data-footer-note` | `Se abre WhatsApp...` | Nota debajo del input |

### Comportamiento

| Atributo | Default | Descripción |
|---|---|---|
| `data-position` | `right` | Posición: `right` o `left` |
| `data-dismiss` | `none` | Comportamiento al cerrar el teaser: `none` (siempre visible), `session` (no vuelve al refrescar), `persistent` (no vuelve nunca, usa localStorage) |
| `data-trigger-id` | *(none)* | ID de un elemento que, al hacerse visible en scroll, muestra el teaser |

### Accesibilidad

| Atributo | Default | Descripción |
|---|---|---|
| `data-aria-open` | `Abrir chat` | Label de accesibilidad del botón |
| `data-aria-close` | `Cerrar chat` | Label de accesibilidad al cerrar |

## Avatar con fallback

Si defines `data-avatar` con una URL y la imagen no carga, el widget automáticamente muestra las **iniciales** del nombre sobre un fondo con color de contraste calculado a partir de `data-color`.

```
data-name="Avanxo"  →  muestra "AV"
data-name="Soporte"  →  muestra "SO"
data-name="Mi Tienda"  →  muestra "MT"
```

No necesitas hacer nada额外 — el fallback es automático.

## Icono del botón

El botón flotante soporta 3 modos:

| Valor | Resultado |
|---|---|
| `chat` *(default)* | Icono de burbuja de chat |
| `whatsapp` | Icono oficial de WhatsApp |
| `<svg>...</svg>` | Cualquier SVG inline personalizado |

```html
<!-- Icono de WhatsApp -->
<script src="whatsapp-bubble.js"
  data-phone="573001234567"
  data-name="Mi Empresa"
  data-bubble-icon="whatsapp"
></script>
```

## Dismiss (persistencia del teaser)

Controla qué pasa cuando el usuario cierra el teaser con el botón X:

| Valor | Comportamiento |
|---|---|
| `none` *(default)* | El teaser siempre vuelve a aparecer |
| `session` | No vuelve hasta cerrar el navegador (usa `sessionStorage`) |
| `persistent` | No vuelve nunca más (usa `localStorage`) |

```html
<!-- No vuelve nunca más después de cerrar -->
<script src="whatsapp-bubble.js"
  data-phone="573001234567"
  data-name="Mi Empresa"
  data-dismiss="persistent"
></script>
```

## Scroll trigger

El teaser puede aparecer automáticamente cuando el usuario hace scroll hasta una sección específica:

```html
<!-- El teaser aparece al llegar a #pricing -->
<section id="pricing">...</section>

<script src="whatsapp-bubble.js"
  data-phone="573001234567"
  data-name="Mi Empresa"
  data-trigger-id="pricing"
  data-teaser="¿Tienes preguntas sobre pricing?"
  data-teaser-subtitle="Estamos en línea"
></script>
```

Usa `IntersectionObserver` — si el navegador no lo soporta, el teaser se muestra directamente.

## Ejemplo completo

```html
<script src="https://raw.githubusercontent.com/Avanxo-Technology/wp-bubble-message/main/whatsapp-bubble.js"
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
></script>
```

## Múltiples instancias

Puedes tener varios bubbles en la misma página, cada uno con su propia configuración:

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

## Comportamiento

- **Avatar fallback**: Si la imagen no carga, muestra iniciales con color de contraste automático.
- **Icono configurable**: `chat` (default), `whatsapp`, o SVG personalizado.
- **Dismiss**: `none` (siempre visible), `session` ( sessionStorage ), `persistent` (localStorage).
- **Teaser**: Aparece automáticamente al hacer scroll hasta `data-trigger-id`.
- **Teclado**: La tecla `Escape` cierra el panel.
- **Accesibilidad**: `role="dialog"`, `aria-expanded`, `aria-label`, `aria-live`.
- **Reduced motion**: Desactiva animaciones si el usuario prefiere movimiento reducido.
- **Fuente heredada**: Detecta la `font-family` del sitio automáticamente.
- **Sin dependencias**: JavaScript vanilla puro. Zero librerías externas.

## Licencia

MIT
