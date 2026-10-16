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


  /* Topographic field: slowly breathing contour lines around the summit (logo A as a living map).
     Canvas only, no images. Static single frame with reduced motion; pauses off-screen and in hidden tabs. */
  function topo(cv){
    var x=cv.getContext('2d');if(!x)return;
    var cta=cv.getAttribute('data-topo')==='cta', rtl=root.dir==='rtl';
    var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W=0,H=0,cols=0,rows=0,cell=16,g=null,t=Math.random()*50,raf=0,last=0,on=true,mx=.5,my=.5;
    var LV=16, step=1/(LV+1);
    function size(){
      var r=cv.getBoundingClientRect(), d=Math.min(window.devicePixelRatio||1,2);
      W=Math.max(1,r.width);H=Math.max(1,r.height);cv.width=Math.round(W*d);cv.height=Math.round(H*d);x.setTransform(d,0,0,d,0,0);
      cell=W<700?22:16;cols=Math.ceil(W/cell)+1;rows=Math.ceil(H/cell)+1;g=new Float32Array((cols+1)*(rows+1));
    }
    function fill(){
      var A=W/H, cx=cta?.86:.76, cy=cta?1.05:.95, c2=cta?.2:.28;
      if(rtl)cx=1-cx,c2=1-c2;
      cx+=(mx-.5)*.03;cy+=(my-.5)*.02;
      for(var j=0;j<=rows;j++){var v=j*cell/H;
        for(var i=0;i<=cols;i++){var u=i*cell/W, du=(u-cx)*A, dv=v-cy, du2=(u-c2)*A, dv2=v-1.12;
          var h=Math.exp(-(du*du*.55+dv*dv*.8))+.5*Math.exp(-(du2*du2*1.2+dv2*dv2*1.8))
            +.07*(Math.sin(u*6.1+t*.31)*Math.cos(v*5.3-t*.23)+Math.sin(u*3.7-v*4.9+t*.19)+.6*Math.sin((u+v)*11.0-t*.4));
          g[j*(cols+1)+i]=h;}}
    }
    function lerp(a,b,l){return (l-a)/(b-a)}
    function draw(){
      x.clearRect(0,0,W,H);fill();
      for(var k=1;k<=LV;k++){
        var l=k*step*1.05;
        x.beginPath();
        for(var j=0;j<rows;j++)for(var i=0;i<cols;i++){
          var o=j*(cols+1)+i, a=g[o], b=g[o+1], c=g[o+cols+2], d2=g[o+cols+1];
          var idx=(a>l?8:0)|(b>l?4:0)|(c>l?2:0)|(d2>l?1:0);
          if(idx===0||idx===15)continue;
          var X=i*cell,Y=j*cell,
            top=[X+cell*lerp(a,b,l),Y], rgt=[X+cell,Y+cell*lerp(b,c,l)], bot=[X+cell*lerp(d2,c,l),Y+cell], lft=[X,Y+cell*lerp(a,d2,l)];
          var segs;
          switch(idx){case 1:case 14:segs=[lft,bot];break;case 2:case 13:segs=[bot,rgt];break;case 3:case 12:segs=[lft,rgt];break;
            case 4:case 11:segs=[top,rgt];break;case 6:case 9:segs=[top,bot];break;case 7:case 8:segs=[lft,top];break;
            case 5:segs=[lft,top,bot,rgt];break;case 10:segs=[lft,bot,top,rgt];break}
          x.moveTo(segs[0][0],segs[0][1]);x.lineTo(segs[1][0],segs[1][1]);
          if(segs.length>2){x.moveTo(segs[2][0],segs[2][1]);x.lineTo(segs[3][0],segs[3][1])}
        }
        var hi=k>=LV-2;
        x.strokeStyle=hi?'rgba(234,163,107,'+(cta?.30:.38)+')':(k%4===0?'rgba(233,236,232,.2)':'rgba(233,236,232,.11)');
        x.lineWidth=hi||k%4===0?1.1:.8;x.stroke();
      }
    }
    function loop(ts){
      raf=requestAnimationFrame(loop);
      if(ts-last<(W<700?66:40))return;
      t+=(ts-last>200?40:ts-last)/1000;last=ts;draw();
    }
    function run(){cancelAnimationFrame(raf);if(on&&!still&&!d.hidden){last=performance.now();raf=requestAnimationFrame(loop)}}
    size();draw();
    window.addEventListener('resize',function(){size();draw()});
    if(still)return;
    d.addEventListener('visibilitychange',run);
    window.addEventListener('pointermove',function(e){mx=e.clientX/innerWidth;my=e.clientY/innerHeight});
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){on=es[0].isIntersecting;run()}).observe(cv);
    else run();
  }
  d.addEventListener('DOMContentLoaded',function(){
    render(getCur());
    Array.prototype.forEach.call(d.querySelectorAll('canvas[data-topo]'),topo);
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
        imgs[i].classList.remove('on');nx.classList.add('on');i=n;tick();
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
        if(!v('name')||!v('need')||!v('contact')){msg.textContent=f.getAttribute('data-required');msg.className='form-msg err';
          var bad=!v('name')?'name':!v('need')?'need':'contact';f.elements[bad].focus();return null}
        var L=function(n){return f.querySelector('label[for="f-'+n+'"]').textContent};
        var lines=[f.getAttribute('data-intro'),'',L('name')+': '+v('name')];
        if(v('business'))lines.push(L('business')+': '+v('business'));
        if(v('field'))lines.push(L('field')+': '+v('field'));
        lines.push(L('need')+': '+v('need'),L('contact')+': '+v('contact'));
        return lines.join('\n');
      }
      f.addEventListener('submit',function(e){e.preventDefault()});
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
