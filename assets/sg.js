/* SINAI Global — company pages: currency, phone screens, mobile menu, brand intro, business form.
   Currency: fixed price per currency (no live conversion). Default ₪ in Israel, $ elsewhere; choice saved in localStorage 'sg-cur'. */
(function(){
  var d=document, root=d.documentElement, lang=(root.lang||'en').slice(0,2);
  var CUR=['ILS','USD','EUR','GBP','INR'];
  var PRICES={ /* edit prices here; one fixed value per currency */
    diag:{ILS:1500,USD:420,EUR:390,GBP:330,INR:35000},
    site:{ILS:4900,USD:1350,EUR:1250,GBP:1090,INR:112000},
    auto:{ILS:3900,USD:1090,EUR:990,GBP:860,INR:89000},
    plat:{ILS:9900,USD:2750,EUR:2490,GBP:2190,INR:229000},
    app:{ILS:29000,USD:7900,EUR:7300,GBP:6300,INR:659000},
    ret:{ILS:[2500,9000],USD:[690,2490],EUR:[640,2290],GBP:[550,1990],INR:[57000,207000]},
    host:{ILS:350,USD:99,EUR:89,GBP:79,INR:7900}
  };
  function isIL(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone==='Asia/Jerusalem'}catch(e){return false}}
  function getCur(){var c=null;try{c=localStorage.getItem('sg-cur')}catch(e){}return CUR.indexOf(c)>-1?c:(isIL()?'ILS':'USD')}
  function fmt(n,c){
    var loc=lang==='hi'?'en-IN':lang;
    try{return new Intl.NumberFormat(loc,{style:'currency',currency:c,currencyDisplay:'narrowSymbol',maximumFractionDigits:0}).format(n)}
    catch(e){return c+' '+n}
  }
  function render(c){
    var els=d.querySelectorAll('[data-price]');
    for(var i=0;i<els.length;i++){
      var el=els[i], v=PRICES[el.getAttribute('data-price')][c], t=el.getAttribute('data-tpl')||'{p}';
      el.textContent=Array.isArray(v)?t.replace('{a}',fmt(v[0],c)).replace('{b}',fmt(v[1],c)):t.replace('{p}',fmt(v,c));
    }
    var sel=d.querySelectorAll('select.cur');for(i=0;i<sel.length;i++)sel[i].value=c;
    var bs=d.querySelectorAll('.seg [data-cur]');for(i=0;i<bs.length;i++)bs[i].setAttribute('aria-pressed',bs[i].getAttribute('data-cur')===c?'true':'false');
  }
  function setCur(c){try{localStorage.setItem('sg-cur',c)}catch(e){}render(c)}
  d.addEventListener('change',function(e){if(e.target.matches&&e.target.matches('select.cur'))setCur(e.target.value)});
  d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.seg [data-cur]');if(b)setCur(b.getAttribute('data-cur'))});

  /* brand intro: removed after 1.5s or on skip */
  function endIntro(){root.classList.remove('intro-on');var o=d.querySelector('.sg-intro');if(o&&o.parentNode)o.parentNode.removeChild(o)}
  if(root.classList.contains('intro-on')){
    setTimeout(endIntro,1500);
    d.addEventListener('keydown',function(e){if(e.key==='Escape')endIntro()});
  }


  d.addEventListener('DOMContentLoaded',function(){
    render(getCur());
    var o=d.querySelector('.sg-intro');
    if(o){o.addEventListener('click',endIntro);if(!root.classList.contains('intro-on'))o.parentNode.removeChild(o)}

    /* mobile menu */
    var nav=d.getElementById('nav'), mb=d.querySelector('.menu-btn'), nc=d.querySelector('.nav-close');
    function openNav(v){if(!nav)return;nav.classList.toggle('open',v);mb&&mb.setAttribute('aria-expanded',v?'true':'false');d.body.style.overflow=v?'hidden':'';if(v&&nc)nc.focus();else if(mb)mb.focus()}
    mb&&mb.addEventListener('click',function(){openNav(true)});
    nc&&nc.addEventListener('click',function(){openNav(false)});
    nav&&nav.addEventListener('click',function(e){if(e.target.closest('a[href*="#"]')&&nav.classList.contains('open'))openNav(false)});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav&&nav.classList.contains('open'))openNav(false)});

    /* phone screens: cycle real app screens; pause off-screen; still with reduced motion */
    var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var devs=d.querySelectorAll('[data-cycle]');
    Array.prototype.forEach.call(devs,function(dev,k){
      var imgs=dev.querySelectorAll('img');if(imgs.length<2||still)return;
      var i=0,t=null,seen=false;
      function tick(){clearTimeout(t);if(!seen)return;t=setTimeout(function(){
        var n=(i+1)%imgs.length, nx=imgs[n];
        if(!nx.complete){nx.loading='eager';nx.addEventListener('load',tick,{once:true});return}
        /* decode the next screen off the main thread first, so the swap itself never stalls a frame */
        var swap=function(){imgs[i].classList.remove('on');nx.classList.add('on');i=n;tick()};
        nx.decode?nx.decode().then(swap,swap):swap();
      },3400+k*500)}
      if('IntersectionObserver' in window){new IntersectionObserver(function(es){seen=es[0].isIntersecting;if(seen)Array.prototype.forEach.call(imgs,function(m){m.loading='eager'});tick()},{threshold:.25}).observe(dev)}
      else{seen=true;tick()}
    });

    /* business form → WhatsApp or email, composed on the device */
    var f=d.querySelector('form.biz');
    if(f){
      var msg=f.querySelector('.form-msg');
      function compose(){
        var v=function(n){return (f.elements[n].value||'').trim()};
        var picked=f.querySelectorAll('.chip[aria-pressed="true"]').length;
        if(!v('name')||(!v('need')&&!picked)||!v('contact')){msg.textContent=f.getAttribute('data-required');msg.className='form-msg err';
          var bad=!v('name')?'name':(!v('need')&&!picked)?'need':'contact';f.elements[bad].focus();return null}
        var L=function(n){return f.querySelector('label[for="f-'+n+'"]').textContent};
        var lines=[f.getAttribute('data-intro'),'',L('name')+': '+v('name')];
        if(v('business'))lines.push(L('business')+': '+v('business'));
        if(v('field'))lines.push(L('field')+': '+v('field'));
        Array.prototype.forEach.call(f.querySelectorAll('.chips'),function(g){
          var on=Array.prototype.map.call(g.querySelectorAll('.chip[aria-pressed="true"]'),function(c){return c.getAttribute('data-v')});
          if(on.length)lines.push(g.querySelector('legend').firstChild.textContent.trim()+' '+on.join(', '));
        });
        if(v('need'))lines.push(L('need')+': '+v('need'));
        lines.push(L('contact')+': '+v('contact'));
        return lines.join('\n');
      }
      f.addEventListener('submit',function(e){e.preventDefault()});
      f.addEventListener('click',function(e){var c=e.target.closest('.chip');if(!c)return;e.preventDefault();var g=c.closest('.chips');
        if(g.getAttribute('data-multi')!=='1')Array.prototype.forEach.call(g.querySelectorAll('.chip'),function(x){if(x!==c)x.setAttribute('aria-pressed','false')});
        c.setAttribute('aria-pressed',c.getAttribute('aria-pressed')==='true'?'false':'true');msg.textContent='';msg.className='form-msg'});
      f.addEventListener('click',function(e){
        var b=e.target.closest('[data-send]');if(!b)return;e.preventDefault();
        var text=compose();if(!text)return;
        if(b.getAttribute('data-send')==='wa')window.open('https://wa.me/972507763923?text='+encodeURIComponent(text),'_blank','noopener');
        else location.href='mailto:hello@sinai-global.com?subject='+encodeURIComponent('SINAI Global · '+(f.elements.business.value||f.elements.name.value))+'&body='+encodeURIComponent(text);
        msg.textContent=f.getAttribute('data-sent');msg.className='form-msg';
      });
    }
  });
})();
