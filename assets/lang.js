/* Language routing for SINAI Global sites (same rules as jasale.app and sinaiclub.com).
   1. A language picked in the menu is saved (localStorage 'sg-lang') and always wins.
   2. Otherwise the first browser language we support (he, en, ru, ar, es, de, it, fr, pt, hi) is used;
      an English browser in Israel (timezone Asia/Jerusalem) gets Hebrew.
   3. No match: Israel -> Hebrew, everywhere else -> English.
   A language is only offered where the page has a twin in it (hi: home and solutions pages).
   Each page lists its twins as <link rel="alternate" hreflang="xx" href="..."> and sets <html lang>. */
(function(){
  document.documentElement.classList.add('js');
  var here=(document.documentElement.lang||'en').slice(0,2), P={};
  var links=document.querySelectorAll('link[rel="alternate"][hreflang]');
  for(var i=0;i<links.length;i++){var h=links[i].getAttribute('hreflang');if(h!=='x-default')P[h]=new URL(links[i].href).pathname}
  function isIL(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone==='Asia/Jerusalem'}catch(e){return false}}
  function pick(){
    var il=isIL(), ls=navigator.languages||[navigator.language||''];
    for(var i=0;i<ls.length;i++){var c=(ls[i]||'').slice(0,2).toLowerCase();if(c==='iw')c='he';
      if(P[c]){return (c==='en'&&il&&P.he)?'he':c}}
    return il&&P.he?'he':'en';
  }
  var saved=null;try{saved=localStorage.getItem('sg-lang')}catch(e){}
  var want=(saved&&P[saved])?saved:pick();
  if(want!==here&&P[want]){location.replace(P[want]+location.search+location.hash);return}
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-setlang]');
    if(a){try{localStorage.setItem('sg-lang',a.getAttribute('data-setlang'))}catch(err){}}
    var b=e.target.closest&&e.target.closest('[data-copy]');
    if(b){
      var el=document.getElementById(b.getAttribute('data-copy')), label=b.textContent;
      var done=function(){b.textContent=b.getAttribute('data-done')||'✓';setTimeout(function(){b.textContent=label},1500)};
      var fb=function(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r)};
      try{navigator.clipboard.writeText(el.textContent.trim()).then(done,fb)}catch(err){fb()}
    }
  });
  // Fade sections in as they scroll into view
  document.addEventListener('DOMContentLoaded',function(){
    if(!('IntersectionObserver' in window))return;
    var els=document.querySelectorAll('.sec-head,.row,.method > div,.grid2 > *,.feats > div');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    for(var i=0;i<els.length;i++){els[i].classList.add('rv');io.observe(els[i])}
  });
})();
