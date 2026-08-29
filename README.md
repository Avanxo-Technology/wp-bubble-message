# whatsapp-bubble

Plugin vanilla JavaScript para un widget de chat de WhatsApp. Sin dependencias, configurable via atributos `data-*`, listo para usar en cualquier página.

## Instalación

### Opción 1 – GitHub como CDN (recomendado)

Copia la URL raw del archivo y úsala directamente:

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

| Atributo | Default | Descripción |
|---|---|---|
| `data-phone` | `573001234567` | Número de WhatsApp con código de país (sin `+` ni espacios) |
| `data-name` | `Soporte` | Nombre que aparece en el header del panel |
| `data-avatar` | *(none)* | URL de la imagen de perfil (cuadrada, recomendado 80x80+) |
| `data-color` | `#25D366` | Color primario (botón, header, acentos) |
| `data-greeting` | `Te estábamos esperando...` | Mensaje de bienvenida dentro del chat |
| `data-default-message` | `Hola, vengo de la web...` | Mensaje que se envía si el usuario escribe vacío |
| `data-teaser` | `¡Hola! ¿Necesitas ayuda?` | Texto del teaser emergente |
| `data-teaser-subtitle` | `Escríbenos por WhatsApp` | Subtítulo del teaser |
| `data-position` | `right` | Posición: `right` o `left` |
| `data-bubble-size` | `56` | Diámetro del botón flotante en px |
| `data-panel-width` | `340` | Ancho del panel de chat en px |
| `data-online-text` | `En línea` | Texto del indicador de estado |
| `data-input-placeholder` | `Escribe tu mensaje…` | Placeholder del input |
| `data-footer-note` | `Se abre WhatsApp...` | Nota debajo del input |
| `data-aria-open` | `Abrir chat` | Label de accesibilidad del botón |
| `data-aria-close` | `Cerrar chat` | Label de accesibilidad al cerrar |
| `data-font-family` | `system fonts` | Fuente usada en el widget |
| `data-trigger-id` | *(none)* | ID de un elemento que, al hacerse visible, muestra el teaser |
| `data-remember` | `false` | Si `true`, el teaser no vuelve a mostrar en la misma sesión |

## Ejemplo completo

```html
<script src="https://raw.githubusercontent.com/Avanxo-Technology/wp-bubble-message/main/whatsapp-bubble.js"
  data-phone="573001234567"
  data-name="Avanxo"
  data-avatar="https://example.com/logo.png"
  data-color="#4285F4"
  data-position="right"
  data-greeting="Te estábamos esperando. Cuéntanos hacia dónde quieres llevar tu marca."
  data-default-message="Hola, vengo de la web y quiero un diagnóstico."
  data-teaser="¿Necesitas asesoría?"
  data-teaser-subtitle="Estamos en línea"
  data-trigger-id="hero"
  data-remember="true"
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
></script>
```

## Comportamiento

- **Teaser**: Aparece automáticamente cuando el usuario hace scroll hasta el elemento `data-trigger-id` (si se define). Si no hay trigger, no aparece teaser.
- **Session remember**: Con `data-remember="true"`, el teaser solo se muestra una vez por sesión (usando `sessionStorage`).
- **Teclado**: La tecla `Escape` cierra el panel.
- **Accesibilidad**: El widget incluye `role="dialog"`, `aria-expanded`, `aria-label` y `aria-live`.
- **Reduced motion**: Desactiva animaciones si el usuario prefiere movimiento reducido.
- **Sin dependencias**: JavaScript vanilla puro. No necesita jQuery, Alpine, ni ninguna librería.

## Licencia

MIT
