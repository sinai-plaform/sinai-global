/* Flow: light streaks travel along the signature drawing. The SVG is injected inline and animated with the
   Web Animations API (reliable on iPhone Safari, unlike animations inside SVG images). Off with reduced motion,
   paused while off-screen. Usage: <i class="flow" data-flow="/assets/x-flow.svg"></i>
   2026-10-26: on touch devices the streaks also pause while the page scrolls (re-drawing them every frame during a
   scroll made Android phones flicker) and resume a moment after the finger lets go. */
(function(){
  if(!window.fetch||!Element.prototype.animate)return;
  var mq=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)');
  if(mq&&mq.matches)return;
  var touch=!!(window.matchMedia&&matchMedia('(hover: none) and (pointer: coarse)').matches);
  var runs=[], scrolling=false, st=null;
  function sync(r){var go=r.seen&&!scrolling;r.anims.forEach(function(a){go?a.play():a.pause()})}
  if(touch){
    window.addEventListener('scroll',function(){
      if(!scrolling){scrolling=true;runs.forEach(sync)}
      clearTimeout(st);st=setTimeout(function(){scrolling=false;runs.forEach(sync)},220);
    },{passive:true});
  }
  function run(el){
    fetch(el.getAttribute('data-flow')).then(function(r){return r.ok?r.text():''}).then(function(t){
      if(!t)return;
      el.innerHTML=t;
      var svg=el.querySelector('svg');if(!svg)return;
      svg.setAttribute('width','100%');svg.setAttribute('height','100%');svg.style.display='block';
      var S=+svg.getAttribute('data-s')/100, G=+svg.getAttribute('data-g')/100, anims=[];
      Array.prototype.forEach.call(svg.querySelectorAll('path[data-d]'),function(p){
        var L=p.getTotalLength(); if(!L)return;
        var per=L*(S+G); p.style.strokeDasharray=(L*S).toFixed(1)+' '+(L*G).toFixed(1);
        var d=+p.getAttribute('data-d')*1000, rev=p.getAttribute('data-r'), to=rev?per:-per;
        anims.push(p.animate([{strokeDashoffset:0},{strokeDashoffset:to}],{duration:d,iterations:Infinity,delay:-(+p.getAttribute('data-o'))*d,easing:'linear'}));
      });
      svg.style.opacity='1';
      var r={anims:anims,seen:true};runs.push(r);sync(r);
      if('IntersectionObserver' in window)new IntersectionObserver(function(es){
        r.seen=es[0].isIntersecting;sync(r);
      }).observe(el.parentNode||el);
      if(mq&&mq.addEventListener)mq.addEventListener('change',function(e){if(e.matches){anims.forEach(function(a){a.cancel()});el.innerHTML=''}});
    }).catch(function(){});
  }
  function go(){Array.prototype.forEach.call(document.querySelectorAll('[data-flow]'),run)}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go();
})();
