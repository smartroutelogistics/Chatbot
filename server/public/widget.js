/*
  SmartRoute Logistics Chatbot Widget
  Usage (production example):
  <script
    src="https://widget.smartroutelogistics.com/widget.js"
    data-chat-url="https://chat.smartroutelogistics.com"
    data-button-text="Chat with SmartRoute"
    data-primary="#0ea5e9"
    defer
  ></script>
*/
(function () {
  try {
    if (window.__SRL_WIDGET_LOADED__) return;
    window.__SRL_WIDGET_LOADED__ = true;

    var script = document.currentScript || (function () {
      var s = document.getElementsByTagName('script');
      return s[s.length - 1];
    })();

    var src = (script && script.src) || '';
    var origin;
    try { origin = new URL(src).origin; } catch (e) { origin = window.location.origin; }

    function attr(name, fallback) {
      if (!script) return fallback;
      var v = script.getAttribute(name);
      return (v === null || v === undefined || v === '') ? fallback : v;
    }

    var chatUrl = attr('data-chat-url', origin + '/');
    var btnText = attr('data-button-text', 'Chat with SmartRoute');
    var primary = attr('data-primary', '#0ea5e9');
    var position = (attr('data-position', 'right').toLowerCase() === 'left') ? 'left' : 'right';
    var offsetX = attr('data-offset-x', '24px');
    var offsetY = attr('data-offset-y', '24px');
    var width = attr('data-width', '380px');
    var height = attr('data-height', '560px');
    var radius = attr('data-radius', '12px');
    var shadow = attr('data-shadow', '0 10px 28px rgba(0,0,0,.18)');
    var font = attr('data-font', '600 14px/1.2 Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif');
    var zIndex = parseInt(attr('data-z-index', '2147483640'), 10);
    var icon = attr('data-icon', ''); // emoji like 💬 or URL to an image
    var openOnLoad = String(attr('data-open', 'false')).toLowerCase() === 'true';
    var greeting = attr('data-greeting', '');
    var greetingOnceKey = '__srl_greeted__';
    var closeOnEscape = String(attr('data-close-on-escape', 'true')).toLowerCase() !== 'false';
    var hideBadge = String(attr('data-hide-badge', 'false')).toLowerCase() === 'true';
    var launchLabel = attr('aria-label', 'Open SmartRoute Chat');
    var storage = window.localStorage || window.sessionStorage;
    var stateKey = '__srl_widget_state__';

    var zBase = isFinite(zIndex) ? zIndex : 2147483600; // near max z-index

    function ready(fn) {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(fn, 0);
      } else {
        document.addEventListener('DOMContentLoaded', fn);
      }
    }

    // Merge order: defaults < remote config < data-attributes
    var defaults = {
      chatUrl: chatUrl,
      buttonText: btnText,
      primary: primary,
      position: position,
      offsetX: offsetX,
      offsetY: offsetY,
      width: width,
      height: height,
      radius: radius,
      shadow: shadow,
      font: font,
      zIndex: zBase,
      icon: icon,
      open: openOnLoad,
      greeting: greeting,
      closeOnEscape: closeOnEscape
    };

    var configUrl = attr('data-config-url', origin + '/widget.json');

    function fetchConfig(url, timeoutMs) {
      return new Promise(function (resolve) {
        try {
          var controller = new AbortController();
          var t = setTimeout(function(){ controller.abort(); resolve({}); }, timeoutMs || 2500);
          fetch(url, { signal: controller.signal, credentials: 'omit' })
            .then(function(r){ return r.ok ? r.json() : {}; })
            .then(function(j){ clearTimeout(t); resolve(j || {}); })
            .catch(function(){ clearTimeout(t); resolve({}); });
        } catch (_e) { resolve({}); }
      });
    }

    function mergeConfig(base, remote, attrs) {
      var out = Object.assign({}, base, remote || {});
      // Attributes override
      out.chatUrl = attr('data-chat-url', out.chatUrl);
      out.buttonText = attr('data-button-text', out.buttonText);
      out.primary = attr('data-primary', out.primary);
      out.position = (attr('data-position', out.position).toLowerCase() === 'left') ? 'left' : 'right';
      out.offsetX = attr('data-offset-x', out.offsetX);
      out.offsetY = attr('data-offset-y', out.offsetY);
      out.width = attr('data-width', out.width);
      out.height = attr('data-height', out.height);
      out.radius = attr('data-radius', out.radius);
      out.shadow = attr('data-shadow', out.shadow);
      out.font = attr('data-font', out.font);
      var z = parseInt(attr('data-z-index', String(out.zIndex)), 10);
      out.zIndex = isFinite(z) ? z : out.zIndex;
      out.icon = attr('data-icon', out.icon);
      out.open = String(attr('data-open', String(out.open))).toLowerCase() === 'true';
      out.greeting = attr('data-greeting', out.greeting);
      out.closeOnEscape = String(attr('data-close-on-escape', String(out.closeOnEscape))).toLowerCase() !== 'false';
      return out;
    }

    ready(async function () {
      var remote = await fetchConfig(configUrl, 2500);
      var cfg = mergeConfig(defaults, remote);
      chatUrl = cfg.chatUrl; btnText = cfg.buttonText; primary = cfg.primary; position = cfg.position;
      offsetX = cfg.offsetX; offsetY = cfg.offsetY; width = cfg.width; height = cfg.height;
      radius = cfg.radius; shadow = cfg.shadow; font = cfg.font; zBase = cfg.zIndex;
      icon = cfg.icon; openOnLoad = cfg.open; greeting = cfg.greeting; closeOnEscape = cfg.closeOnEscape;

      if (document.getElementById('srl-chat-launcher')) return;

      // Styles (minimal, inline for portability)
      var btn = document.createElement('button');
      btn.id = 'srl-chat-launcher';
      btn.type = 'button';
      btn.setAttribute('aria-label', launchLabel);
      btn.textContent = btnText;
      btn.style.cssText = [
        'position:fixed',
        (position === 'left' ? 'left:' + offsetX : 'right:' + offsetX),
        'bottom:' + offsetY,
        'padding:12px 16px',
        'border-radius:24px',
        'background:' + primary,
        'color:#fff',
        'border:none',
        'font:' + font,
        'box-shadow:0 8px 24px rgba(0,0,0,.16)',
        'z-index:' + (zBase + 1),
        'cursor:pointer'
      ].join(';');

      var frame = document.createElement('iframe');
      frame.id = 'srl-chat-frame';
      frame.src = chatUrl;
      frame.title = 'SmartRoute Chatbot';
      frame.allow = 'microphone';
      frame.style.cssText = [
        'position:fixed',
        (position === 'left' ? 'left:' + offsetX : 'right:' + offsetX),
        'bottom:calc(' + offsetY + ' + 60px)',
        'width:' + width,
        'max-width:92vw',
        'height:' + height,
        'border:1px solid #e5e7eb',
        'border-radius:' + radius,
        'box-shadow:' + shadow,
        'z-index:' + (zBase + 2),
        'background:#fff'
      ].join(';');
      frame.hidden = true;

      // Button icon support (emoji or URL image)
      if (icon) {
        if (/^https?:\/\//i.test(icon)) {
          btn.textContent = '';
          var img = document.createElement('img');
          img.src = icon;
          img.alt = btnText;
          img.style.cssText = 'width:20px;height:20px;vertical-align:middle;margin-right:8px;filter:brightness(0) invert(1)';
          btn.appendChild(img);
          var span = document.createElement('span');
          span.textContent = btnText;
          btn.appendChild(span);
        } else {
          btn.textContent = icon + ' ' + btnText;
        }
      }

      btn.addEventListener('click', function () {
        frame.hidden = !frame.hidden;
        btn.setAttribute('aria-expanded', String(!frame.hidden));
        try { storage.setItem(stateKey, frame.hidden ? 'closed' : 'open'); } catch (_e) {}
      });

      // Close on Escape when frame is open
      if (closeOnEscape) {
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && !frame.hidden) {
            frame.hidden = true;
            btn.setAttribute('aria-expanded', 'false');
            try { storage.setItem(stateKey, 'closed'); } catch (_e) {}
          }
        });
      }

      // Greeting bubble (once per browser unless data-greeting is empty)
      if (greeting) {
        var greeted = false;
        try { greeted = storage.getItem(greetingOnceKey) === '1'; } catch (_e) {}
        if (!greeted) {
          var bubble = document.createElement('div');
          bubble.textContent = greeting;
          bubble.style.cssText = [
            'position:fixed',
            (position === 'left' ? 'left:calc(' + offsetX + ' + 4px)' : 'right:calc(' + offsetX + ' + 4px)'),
            'bottom:calc(' + offsetY + ' + 64px)',
            'max-width:260px',
            'background:#111827',
            'color:#fff',
            'padding:10px 12px',
            'border-radius:10px',
            'box-shadow:0 8px 24px rgba(0,0,0,.18)',
            'z-index:' + (zBase + 3),
            'font:500 13px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif'
          ].join(';');
          document.body.appendChild(bubble);
          setTimeout(function () {
            bubble.style.transition = 'opacity .3s ease';
            bubble.style.opacity = '0';
            setTimeout(function () {
              bubble.remove();
            }, 300);
          }, 5000);
          try { storage.setItem(greetingOnceKey, '1'); } catch (_e) {}
        }
      }

      // Restore open state or respect data-open
      try {
        var saved = storage.getItem(stateKey);
        if (saved === 'open' || (saved === null && openOnLoad)) {
          frame.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
        }
      } catch (_e) {
        if (openOnLoad) {
          frame.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
        }
      }

      document.body.appendChild(btn);
      document.body.appendChild(frame);
    });
  } catch (err) {
    // Fail silently to avoid breaking host pages
    if (typeof console !== 'undefined' && console.error) {
      console.error('SRL widget failed to load:', err);
    }
  }
})();
