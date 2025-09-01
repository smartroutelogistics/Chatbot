# Widget Configuration via widget.json

The widget auto-loads a JSON config from the same host as `widget.js` (`/widget.json`) unless `data-config-url` is provided. Values in `data-*` attributes override JSON values.

## Endpoint
- Production: `https://widget.smartroutelogistics.com/widget.json`
- Staging: `https://widget-staging.smartroutelogistics.com/widget.json`

## Server-Side Configuration (Env)
Set in `server/.env` (see `.env.example`), e.g.:
```
WIDGET_CHAT_URL=https://chat.smartroutelogistics.com
WIDGET_BUTTON_TEXT=Chat with SmartRoute
WIDGET_PRIMARY=#0ea5e9
WIDGET_POSITION=right
WIDGET_OFFSET_X=24px
WIDGET_OFFSET_Y=24px
WIDGET_WIDTH=420px
WIDGET_HEIGHT=640px
WIDGET_RADIUS=16px
WIDGET_ICON=💬
WIDGET_OPEN=false
WIDGET_GREETING=Hi! Need help with loads or rates?
```

## Client-Side Overrides (data-*)
Example:
```html
<script src="https://widget.smartroutelogistics.com/widget.js"
        data-config-url="https://widget.smartroutelogistics.com/widget.json"
        data-button-text="Chat with SmartRoute"
        data-primary="#0ea5e9"
        defer></script>
```

## Cache Behavior
- `widget.js`: immutable, 1 year
- `widget.json`: 5 minutes (override quickly without redeploy)

