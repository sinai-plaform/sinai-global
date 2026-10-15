/* Phone showcase: cycles the app screens inside each [data-phone] figure.
   Pauses off-screen and on hover/focus; with reduced motion it stays on the first screen. */
(function(){
  var DUR=3200, OUT=1100;
  var mq=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  var figs=document.querySelectorAll('[data-phone]');
  Array.prototype.forEach.call(figs,function(f){
    var scr=f.querySelector('.screen'), imgs=f.querySelectorAll('.screen img'), dots=f.querySelectorAll('.pdots button'), bar=f.querySelector('.pdots');
    if(imgs.length<2)return;
    var i=0, t=null, seen=false, held=false;
    f.style.setProperty('--dur',DUR+'ms');
    if(bar)bar.hidden=false;
    function moving(){return seen&&!held&&!mq.matches}
    function arm(){
      clearTimeout(t); f.classList.remove('run');
      if(!moving())return;
      void f.offsetWidth; f.classList.add('run');
      t=setTimeout(function(){go((i+1)%imgs.length)},DUR);
    }
    function go(n){
      if(n===i){arm();return}
      var next=imgs[n];
      if(!next.complete){next.loading='eager';next.addEventListener('load',function(){go(n)},{once:true});return}
      var prev=imgs[i];
      prev.classList.remove('on');prev.classList.add('out');prev.setAttribute('aria-hidden','true');
      setTimeout(function(){if(!prev.classList.contains('on'))prev.classList.remove('out')},OUT);
      if(next.dataset.sb)scr.style.setProperty('--sb',next.dataset.sb);
      next.classList.remove('out');next.classList.add('on');next.removeAttribute('aria-hidden');
      dots[i]&&dots[i].removeAttribute('aria-current');
      dots[n]&&dots[n].setAttribute('aria-current','true');
      i=n; arm();
    }
    Array.prototype.forEach.call(dots,function(d,k){d.addEventListener('click',function(){go(k)})});
    // hold on mouse hover or keyboard focus (not on touch taps, which would never release)
    f.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'){held=true;arm()}});
    f.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'){held=false;arm()}});
    f.addEventListener('focusin',function(e){var v=false;try{v=e.target.matches(':focus-visible')}catch(x){}if(v){held=true;arm()}});
    f.addEventListener('focusout',function(e){if(!f.contains(e.relatedTarget)&&held&&!f.matches(':hover')){held=false;arm()}});
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){
        es.forEach(function(e){
          seen=e.isIntersecting;
          if(seen)Array.prototype.forEach.call(imgs,function(im){im.loading='eager'});
          arm();
        });
      },{threshold:.3}).observe(f);
    }else{seen=true;arm()}
    if(mq.addEventListener)mq.addEventListener('change',arm);
  });
})();
