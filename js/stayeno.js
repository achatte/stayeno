/* ==========================================================================
   STAYENO — shared page behavior (plain JavaScript, no libraries)
   1. Navigation (dark after scroll, mobile menu)
   2. Reveal-on-scroll
   3. Legal pages: "On this page" side menu that follows your reading
   4. 3D tilt for [data-tilt] elements (mouse only)
   ========================================================================== */

/* [reduce] = prefersReducedMotion() : true when the visitor turned off motion */
function prefersReducedMotion(){
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---- 1. Navigation ------------------------------------------------------ */
(function(){
  var nav = document.getElementById('nav');
  if(nav){
    var setNav = function(){ nav.classList.toggle('scrolled', window.scrollY > 20); };
    setNav();
    window.addEventListener('scroll', setNav, {passive:true});
  }

  var btn = document.querySelector('.mobile-menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if(!btn || !menu) return;
  function closeMenu(){
    menu.hidden = true;
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Open menu');
  }
  btn.addEventListener('click', function(){
    var open = menu.hidden;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });
  window.addEventListener('resize', function(){ if(window.innerWidth > 820) closeMenu(); });
})();

/* ---- 2. Reveal-on-scroll ------------------------------------------------ */
(function(){
  var items = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window) || prefersReducedMotion()){
    items.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){ entry.target.classList.add('in'); observer.unobserve(entry.target); }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
  items.forEach(function(el){ observer.observe(el); });
})();

/* ---- 3. Legal side menu (built from the page's own headings) ----------- */
/* The legal text itself is never changed: links are created from the
   existing <h2> headings, and each heading gets an id to jump to.        */
(function(){
  var article = document.querySelector('.legal-article');
  var tocList = document.getElementById('toc-list');
  if(!article || !tocList) return;

  var headings = article.querySelectorAll('h2');
  var links = [];
  headings.forEach(function(h, n){
    if(!h.id){
      h.id = 'section-' + (n + 1) + '-' +
        h.textContent.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
    }
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    tocList.appendChild(a);
    links.push(a);
  });

  var printBtn = document.getElementById('toc-print');
  if(printBtn){ printBtn.addEventListener('click', function(){ window.print(); }); }

  if(!('IntersectionObserver' in window)) return;
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        links.forEach(function(l){
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, {rootMargin:'-90px 0px -65% 0px'});
  headings.forEach(function(h){ observer.observe(h); });
})();

/* ---- 4. 3D tilt --------------------------------------------------------- */
(function(){
  if(prefersReducedMotion()) return;
  if(window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;
  var MAX_DEGREES = 7;
  document.querySelectorAll('[data-tilt]').forEach(function(el){
    el.addEventListener('mousemove', function(e){
      var box = el.getBoundingClientRect();
      var x = (e.clientX - box.left) / box.width - 0.5;
      var y = (e.clientY - box.top) / box.height - 0.5;
      el.style.transform = 'perspective(1100px) rotateY(' + (x * MAX_DEGREES) +
                           'deg) rotateX(' + (-y * MAX_DEGREES) + 'deg)';
    });
    el.addEventListener('mouseleave', function(){ el.style.transform = ''; });
  });
})();
