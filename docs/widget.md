# Widget Configuration

Load the widget via a single script tag. Customize behavior and styling with `data-*` attributes.

## Basic Embed
```html
<script src="https://widget.smartroutelogistics.com/widget.js"
        data-chat-url="https://chat.smartroutelogistics.com"
        defer></script>
```

## Options (data-*)
- `data-chat-url`: URL the iframe loads (chat UI).
- `data-button-text`: Launcher label (default: "Chat with SmartRoute").
- `data-primary`: Button color (hex/rgb) (default: `#0ea5e9`).
- `data-position`: `right` or `left` (default: `right`).
- `data-offset-x`, `data-offset-y`: CSS length for offsets (default: `24px`).
- `data-width`, `data-height`: Frame size (default: `380px`, `560px`).
- `data-radius`: Frame border radius (default: `12px`).
- `data-shadow`: Frame box-shadow (default preset).
- `data-font`: CSS font shorthand for button (default preset).
- `data-z-index`: Base z-index (default: `2147483640`).
- `data-icon`: Emoji (e.g., `💬`) or image URL for the button icon.
- `data-open`: `true` to open on load (default: `false`).
- `data-greeting`: Short one-time greeting bubble text.
- `data-close-on-escape`: `false` to disable ESC close (default: `true`).
- `aria-label`: Custom accessible label for the button.

## Example (Branded)
```html
<script src="https://widget.smartroutelogistics.com/widget.js"
        data-chat-url="https://chat.smartroutelogistics.com"
        data-button-text="Chat with SmartRoute"
        data-icon="💬"
        data-primary="#0ea5e9"
        data-position="right"
        data-offset-x="28px"
        data-offset-y="28px"
        data-width="420px"
        data-height="640px"
        data-radius="16px"
        data-greeting="Hi! Need help with loads or rates?"
        defer></script>
```

State persists (open/closed) per browser session. The ESC key closes the chat by default.

