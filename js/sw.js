/* ==========================================================================
   STAYENO — service worker (makes the site installable and work offline)
   Rule: always try the internet first (so visitors see the newest version);
   use the saved copy only when there is no connection.
   Change CACHE_NAME (v1 -> v2) to clear old saved copies.
   ========================================================================== */
var CACHE_NAME = 'stayeno-v4';
var CORE_FILES = [
  '/', '/index.html', '/how-it-works.html', '/features.html', '/pricing.html',
  '/signup.html', '/book-a-call.html', '/sms.html', '/sms-compliance.html', '/terms.html', '/privacy.html',
  '/css/stayeno.css', '/css/responsive.css', '/js/stayeno.js', '/pwa.js',
  '/favicon.png?v=7', '/icon.svg', '/manifest.webmanifest'
];

/* Install: save the core pages (a missing file never blocks installation). */
self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return Promise.all(CORE_FILES.map(function(url){
        return cache.add(url).catch(function(){ return null; });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

/* Activate: delete saved copies from older versions. */
self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.map(function(name){
        if(name !== CACHE_NAME){ return caches.delete(name); }
        return null;
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Fetch: internet first, saved copy as fallback (same-site GET requests only;
   form submissions and other websites are never touched). */
self.addEventListener('fetch', function(event){
  var request = event.request;
  if(request.method !== 'GET') return;
  if(new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).then(function(response){
      if(response && response.ok){
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(request, copy); });
      }
      return response;
    }).catch(function(){
      return caches.match(request).then(function(saved){
        if(saved) return saved;
        if(request.mode === 'navigate') return caches.match('/index.html');
        return undefined;
      });
    })
  );
});
