/* SINAI "journey line" — continues the hero's signature motif down the page.
   A faint dashed route leaves the hero's focal dot and travels between the sections (behind the cards),
   stopping at a "station" beside each section; a solid line draws itself as you scroll and the stations light up.
   Config: window.JOURNEY = {start, stations:[selector | 'top:selector'], end:'top:selector', base, prog, dot, bg}.
   Layering: svg z-index 1; each section's .wrap (content) z-index 2; section/hero/night backgrounds stay below. */
(function(){
var C=window.JOURNEY;if(!C)return;
var NS='http://www.w3.org/2000/svg',reduce=false;
try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var svg,base,prog,marks=[],samples=[],len=0,yA=0,yB=1,W=0,H=0,built=false;
var st=document.createElement('style');
st.textContent='.jr-svg{position:absolute;top:0;left:0;z-index:1;pointer-events:none;overflow:visible}'+
 'section>.wrap,header.hero>.wrap,.night>section>.wrap{position:relative;z-index:2}'+
 '.jr-st{transition:fill .5s,r .5s}.jr-ring{opacity:0;transition:opacity .5s}.jr-on .jr-ring{opacity:1}'+
 '@media (prefers-reduced-motion:no-preference){.jr-on .jr-ring{animation:jrPulse 2.4s ease-out infinite}}'+
 '@keyframes jrPulse{0%{r:6;opacity:.55}100%{r:18;opacity:0}}'+
 'html,body{overflow-x:clip}';
document.head.appendChild(st);
function rtl(){return (document.documentElement.dir||document.body.dir||'').toLowerCase()==='rtl';}
function box(el){var r=el.getBoundingClientRect();return {x:r.left+window.scrollX,y:r.top+window.scrollY,w:r.width,h:r.height};}
function clampX(x){return Math.max(14,Math.min(W-14,x));}
function point(q){
 var top=q.indexOf('top:')===0,sel=top?q.slice(4):q,el=document.querySelector(sel);if(!el)return null;
 var b=box(el);if(!b.w&&!b.h)return null;var R=rtl();
 if(top)return [clampX(R?b.x+b.w-46:b.x+46),b.y-16];
 return [clampX(R?b.x+b.w+34:b.x-34),b.y+b.h/2];}
function el(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);return e;}
function build(){
 W=document.documentElement.clientWidth;H=document.documentElement.scrollHeight;
 /* phones: the side gutter is too narrow for a line beside the text — the night zone carries the signature there */
 if(W<760){if(svg){svg.remove();svg=null;}built=false;return;}
 var P=[],s=document.querySelector(C.start);
 if(s){var b=box(s);if(b.w||b.h)P.push([b.x+b.w/2,b.y+b.h/2]);}
 (C.stations||[]).forEach(function(q){var p=point(q);if(p)P.push(p);});
 var e=C.end&&point(C.end);if(e)P.push(e);
 P=P.filter(function(p,i){return i===0||p[1]>P[i-1][1]+40;});
 if(P.length<2)return;
 var d='M'+P[0][0].toFixed(1)+' '+P[0][1].toFixed(1),cx=W/2;
 for(var i=1;i<P.length;i++){var a=P[i-1],c=P[i],dy=c[1]-a[1],k=i%2?0.85:0.45;
  /* leave each station straight down along the margin (never across the headline under it), swing inward behind the
     section's cards, and arrive at the next station from above */
  var c1x=a[0],c2x=c[0]+(cx-c[0])*k;
  var c1y=a[1]+dy*.5,c2y=c[1]-dy*.3;
  /* first leg: drop straight out of the hero, then sweep in ABOVE the first station so it never crosses the section headline */
  if(i===1){c1x=a[0];c1y=a[1]+dy*.75;c2x=c[0]+(cx-c[0])*.15;c2y=c[1]-dy*.2;}
  d+=' C'+c1x.toFixed(1)+' '+c1y.toFixed(1)+' '+c2x.toFixed(1)+' '+c2y.toFixed(1)+' '+c[0].toFixed(1)+' '+c[1].toFixed(1);}
 if(svg)svg.remove();
 svg=el('svg',{'class':'jr-svg',width:W,height:H,viewBox:'0 0 '+W+' '+H,'aria-hidden':'true'});
 base=el('path',{d:d,fill:'none',stroke:C.base,'stroke-width':1.6,'stroke-dasharray':'2 9','stroke-linecap':'round'});
 prog=el('path',{d:d,fill:'none',stroke:C.prog,'stroke-width':2.2,'stroke-linecap':'round'});
 svg.appendChild(base);svg.appendChild(prog);
 marks=P.slice(1).map(function(p,i){var g=el('g',{});
  g.appendChild(el('circle',{'class':'jr-ring',cx:p[0],cy:p[1],r:6,fill:'none',stroke:C.prog,'stroke-width':1.5}));
  g.appendChild(el('circle',{'class':'jr-st',cx:p[0],cy:p[1],r:i===P.length-2?6:4.5,fill:C.bg,stroke:C.prog,'stroke-width':2}));
  svg.appendChild(g);return {g:g,y:p[1],dot:g.lastChild};});
 document.body.appendChild(svg);
 len=prog.getTotalLength();samples=[];for(var l=0;l<=len;l+=12){samples.push([l,prog.getPointAtLength(l).y]);}samples.push([len,P[P.length-1][1]]);
 prog.style.strokeDasharray=len+' '+len;yA=P[0][1];yB=P[P.length-1][1];built=true;draw();}
function lenAt(y){if(y<=yA)return 0;if(y>=yB)return len;var best=0;for(var i=0;i<samples.length;i++){if(samples[i][1]<=y)best=samples[i][0];else if(samples[i][1]>y+60)break;}return best;}
function draw(){if(!built)return;
 var y=reduce?1e9:window.scrollY+window.innerHeight*0.62,L=lenAt(y);
 prog.style.strokeDashoffset=String(len-L);
 marks.forEach(function(m){var on=y>=m.y;m.g.classList.toggle('jr-on',on);m.dot.setAttribute('fill',on?C.dot:C.bg);});}
var tm=null;function later(){clearTimeout(tm);tm=setTimeout(build,180);}
window.addEventListener('scroll',function(){window.requestAnimationFrame(draw);},{passive:true});
window.addEventListener('resize',later);window.addEventListener('load',later);
try{new ResizeObserver(later).observe(document.body);}catch(e){}
if(document.readyState!=='loading')later();else document.addEventListener('DOMContentLoaded',later);
})();
