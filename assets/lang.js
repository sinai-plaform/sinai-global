/* Language routing: Israel (timezone or Hebrew browser) -> Hebrew, everywhere else -> English.
   A choice made with the language switch is remembered in localStorage('sg-lang') and always wins.
   Same key as jasale.app and sinaiclub.com. Each page sets data-alt on <html> = path of its other-language twin. */
(function(){
  var h=document.documentElement, lang=h.lang==='he'?'he':'en', alt=h.getAttribute('data-alt');
  function isIL(){
    try{if((Intl.DateTimeFormat().resolvedOptions().timeZone||'')==='Asia/Jerusalem')return true}catch(e){}
    var ls=navigator.languages||[navigator.language||''];
    for(var i=0;i<ls.length;i++){if(/^(he|iw)/i.test(ls[i]))return true}
    return false;
  }
  var saved=null; try{saved=localStorage.getItem('sg-lang')}catch(e){}
  var want=saved||(isIL()?'he':'en');
  if(alt&&want!==lang){location.replace(alt+location.search+location.hash);return}
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[data-setlang]');
    if(a){try{localStorage.setItem('sg-lang',a.getAttribute('data-setlang'))}catch(err){}}
    var b=e.target.closest&&e.target.closest('[data-copy]');
    if(b){
      var el=document.getElementById(b.getAttribute('data-copy')), label=b.textContent;
      var done=function(){b.textContent=b.getAttribute('data-done')||'✓';setTimeout(function(){b.textContent=label},1500)};
      var fb=function(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r)};
      try{navigator.clipboard.writeText(el.textContent.trim()).then(done,fb)}catch(err){fb()}
    }
  });
})();
