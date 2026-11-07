/* ==========================================================================
   STAYENO — installable app
   1. Registers the service worker (sw.js) so the site can be installed.
   2. Shows a small "Install the Stayeno app" button when the browser allows
      it (Chrome / Edge / Samsung on Android and computers). On iPhone,
      visitors use Share → "Add to Home Screen" (Apple has no install button).
   ========================================================================== */
(function(){
  var DISMISS_KEY = 'stayeno-install-dismissed';
  var installEvent = null;

  /* ---- 1. service worker ---- */
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('/sw.js').catch(function(){ /* site still works */ });
    });
  }

  /* ---- 2. install button ---- */
  // [] = removeButton()
  function removeButton(){
    var box = document.getElementById('stayeno-install');
    if(box) box.parentNode.removeChild(box);
  }

  // [] = showButton()
  function showButton(){
    if(document.getElementById('stayeno-install')) return;
    var box = document.createElement('div');
    box.id = 'stayeno-install';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', 'Install the Stayeno app');
    box.style.cssText =
      'position:fixed;right:16px;bottom:16px;z-index:200;display:flex;align-items:center;gap:10px;' +
      'padding:10px 10px 10px 12px;border-radius:16px;background:#070d22;color:#fff;' +
      'border:1px solid rgba(255,255,255,.16);box-shadow:0 20px 50px rgba(7,13,34,.45);' +
      'font:600 14px/1.3 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;max-width:calc(100% - 32px)';
    box.innerHTML =
      '<img src="/favicon.png?v=7" alt="" width="30" height="30" style="border-radius:8px;background:#fff">' +
      '<span>Install the Stayeno app</span>' +
      '<button type="button" id="stayeno-install-yes" style="border:0;border-radius:10px;padding:9px 14px;' +
        'font:800 13px Inter,system-ui,sans-serif;color:#fff;cursor:pointer;' +
        'background:linear-gradient(135deg,#2457ff,#8b5cf6 55%,#22d3ee)">Install</button>' +
      '<button type="button" id="stayeno-install-no" aria-label="Not now" style="border:0;background:none;' +
        'color:#9fb0d6;font-size:20px;line-height:1;cursor:pointer;padding:4px 6px">×</button>';
    document.body.appendChild(box);

    document.getElementById('stayeno-install-yes').addEventListener('click', function(){
      if(!installEvent) return;
      installEvent.prompt();
      installEvent.userChoice.then(function(){ installEvent = null; removeButton(); });
    });
    document.getElementById('stayeno-install-no').addEventListener('click', function(){
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch(e){}
      removeButton();
    });
  }

  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    installEvent = e;
    var dismissed = false;
    try { dismissed = localStorage.getItem(DISMISS_KEY) === '1'; } catch(err){}
    if(!dismissed) showButton();
  });

  window.addEventListener('appinstalled', function(){
    installEvent = null;
    removeButton();
  });
})();
