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

    var chatUrl = (script && (script.getAttribute('data-chat-url') || script.dataset.chatUrl)) || origin + '/';
    var btnText = (script && (script.getAttribute('data-button-text') || script.dataset.buttonText)) || 'Chat with SmartRoute';
    var primary = (script && (script.getAttribute('data-primary') || script.dataset.primary)) || '#0ea5e9';
    var zBase = 2147483600; // near max z-index

    function ready(fn) {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(fn, 0);
      } else {
        document.addEventListener('DOMContentLoaded', fn);
      }
    }

    ready(function () {
      if (document.getElementById('srl-chat-launcher')) return;

      // Styles (minimal, inline for portability)
      var btn = document.createElement('button');
      btn.id = 'srl-chat-launcher';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Open SmartRoute Chat');
      btn.textContent = btnText;
      btn.style.cssText = [
        'position:fixed',
        'right:24px',
        'bottom:24px',
        'padding:12px 16px',
        'border-radius:24px',
        'background:' + primary,
        'color:#fff',
        'border:none',
        'font:600 14px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
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
        'right:24px',
        'bottom:84px',
        'width:380px',
        'max-width:92vw',
        'height:560px',
        'border:1px solid #e5e7eb',
        'border-radius:12px',
        'box-shadow:0 10px 28px rgba(0,0,0,.18)',
        'z-index:' + (zBase + 2),
        'background:#fff'
      ].join(';');
      frame.hidden = true;

      btn.addEventListener('click', function () {
        frame.hidden = !frame.hidden;
        btn.setAttribute('aria-expanded', String(!frame.hidden));
      });

      // Close on Escape when frame is open
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !frame.hidden) {
          frame.hidden = true;
          btn.setAttribute('aria-expanded', 'false');
        }
      });

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

