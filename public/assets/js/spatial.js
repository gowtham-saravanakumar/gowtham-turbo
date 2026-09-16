(function () {
"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const root=document.documentElement, preference=matchMedia('(prefers-reduced-motion: reduce)'), fine=matchMedia('(pointer:fine)');
let paused=preference.matches;
try { paused=paused||localStorage.getItem('gowtham-motion')==='paused'; }catch{}
let targetX=0,targetY=0,mx=0,my=0,vx=0,vy=0,lastScroll=scrollY,smoothScroll=scrollY,scrollVelocity=0,world,service=0;
let state={time:0,journey:0,x:0,y:0,velocity:0,lightTheme:root.dataset.theme==='light'?1:0,service:0,intro:0};
function syncMotion(){root.classList.toggle('motion-paused',paused);$('#motion').textContent=paused?'▷':'Ⅱ';$('#motion').setAttribute('aria-label',paused?'Enable animation':'Pause animation')}
syncMotion();
$('#motion').onclick=()=>{paused=!paused;syncMotion();try{localStorage.setItem('gowtham-motion',paused?'paused':'full')}catch{}};
preference.addEventListener('change',e=>{paused=e.matches;syncMotion()});
function syncTheme(){const light=root.dataset.theme==='light';$('#theme').setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');$('meta[name="theme-color"]').content=light?'#f0f2ee':'#0b0e11'}
syncTheme();$('#theme').onclick=()=>{root.dataset.theme=root.dataset.theme==='light'?'dark':'light';syncTheme();try{localStorage.setItem('gowtham-theme',root.dataset.theme)}catch{}};
$('#menu').onclick=()=>{const open=$('nav').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open));$('#menu').setAttribute('aria-label',open?'Close navigation':'Open navigation')};
$$('nav a').forEach(a=>a.onclick=()=>{$('nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false')});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false')}});
addEventListener('pointermove',e=>{targetX=(e.clientX/innerWidth-.5)*2;targetY=-(e.clientY/innerHeight-.5)*2;cursorTarget=[e.clientX,e.clientY]},{passive:true});
document.addEventListener('pointerleave',()=>{targetX=targetY=0;$('#cursor').style.display='none'});
const services=[
 ['Technical SEO','Crawl analysis, indexation, internal linking, structured data and technical diagnostics.','THE TECHNICAL FOUNDATION'],
 ['On-Page SEO','Titles, descriptions, headings and page-level intent optimisation that connect relevance to demand.','RELEVANCE BY DESIGN'],
 ['Keyword Research','Prioritised keyword maps, cluster planning, gap analysis and opportunity validation.','CONNECTED OPPORTUNITIES'],
 ['Content Strategy','Useful content systems for long sales cycles, technical buyers and specialist markets.','LAYERS OF MEANING'],
 ['Link Building','Targeted editorial outreach focused on relevance and topical authority.','AUTHORITY THROUGH CONNECTION'],
 ['Search Analytics','Google Search Console, GA4 and reporting that turn movement into actionable next steps.','SIGNALS INTO DECISIONS'],
 ['Local SEO','Local intent, Google Business Profile, citations and location-focused content systems.','DISCOVERY, CLOSER TO HOME'],
 ['SEO Strategy','Search strategy for B2B, B2C, D2C, manufacturing, engineering and technical products.','ONE CONNECTED SYSTEM']
];
$('.service-list').innerHTML=services.map((s,i)=>'<div class="service-item '+(i===0?'active':'')+'"><button aria-expanded="'+(i===0)+'" aria-controls="service-body-'+i+'"><span>0'+(i+1)+'</span><b>'+s[0]+'</b><i>'+(i===0?'−':'+')+'</i></button><p id="service-body-'+i+'">'+s[1]+'</p></div>').join('');
$$('.service-item button').forEach((b,i)=>b.onclick=()=>{service=i;$$('.service-item').forEach((el,j)=>{el.classList.toggle('active',i===j);el.querySelector('button').setAttribute('aria-expanded',String(i===j));el.querySelector('i').textContent=i===j?'−':'+'});$('#service-number').textContent='0'+(i+1);$('#service-caption').textContent=services[i][2]});
const cases=[
 {title:'Knowledge. Made discoverable.',category:'01 / WIKIPEDIA — KNOWLEDGE SEO',challenge:'Explain technical and scientific topics clearly while maintaining a structure search systems can interpret.',strategy:'Research-first writing, descriptive headings, entity relationships and tightly scoped information architecture.',result:'A body of 40+ published articles across knowledge-led and search-focused topics. This is a portfolio-wide publishing figure, not a traffic claim for this article.',tools:['Research','Content writing','Entity SEO','Long-tail search'],link:'https://en.wikipedia.org/wiki/Heat_exchanger',label:'View an article example'},
 {title:'Built to feel good. Built to be found.',category:'02 / SEO-FIRST STATIC WEB EXPERIENCES',challenge:'Create fast, legible pages without burying search fundamentals under unnecessary complexity.',strategy:'Semantic HTML, deliberate heading hierarchy, metadata, canonicals, meaningful alt text and performance-conscious implementation.',result:'Clean frontend foundations designed for human usability and technical SEO review. No measured performance or ranking figures were supplied for this project.',tools:['HTML','CSS','Technical SEO','Performance'],link:'#top',label:'Return to the portfolio'},
 {title:'Complex products. Clear paths.',category:'03 / SEARCH CONTENT SYSTEMS',challenge:'Translate complex products into useful search experiences without losing the technical detail serious buyers need.',strategy:'Intent mapping, product and category hierarchy, supporting informational content, internal links and schema-aware structure.',result:'A clearer 0→1 organic growth foundation for businesses starting with limited search visibility. Client-specific traffic and conversion figures are not included in the supplied portfolio.',tools:['SEO','B2B / B2C / D2C content','Schema','GSC'],link:'#contact',label:'Discuss a similar project'}
];
const dialog=$('#case-dialog');
$$('.case-open').forEach(b=>b.onclick=()=>{const c=cases[Number(b.dataset.project)];$('#case-category').textContent=c.category;$('#case-title').textContent=c.title;$('#case-content').innerHTML='<h3>Challenge</h3><p>'+c.challenge+'</p><h3>Strategy</h3><p>'+c.strategy+'</p><h3>Result</h3><p>'+c.result+'</p><h3>Tools & disciplines</h3><div class="tags">'+c.tools.map(t=>'<span>'+t+'</span>').join('')+'</div><a class="round-link" href="'+c.link+'" '+(c.link.startsWith('http')?'target="_blank" rel="noopener"':'')+'>'+c.label+' <span>↗</span></a>';dialog.showModal();document.body.style.overflow='hidden';$('#case-content a').onclick=()=>dialog.close()});
$('.dialog-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{document.body.style.overflow=''});dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
const skills=[
 ['Technical SEO','Crawlability, indexation, canonicalisation and structured data diagnostics.','Screaming Frog · Search Console · PageSpeed'],
 ['Content strategy','Topic architecture, editorial planning and useful content for specialist buyers.','Research · Content briefs · Intent maps'],
 ['GSC','Query segmentation, indexing reports, position decay and search performance analysis.','Google Search Console'],
 ['GA4','Measurement that connects site behaviour to useful business outcomes.','Google Analytics 4 · Looker Studio'],
 ['Schema','Entity-aware structured data and clear relationships between content.','JSON-LD · Rich Results Test'],
 ['Core Web Vitals','Performance-aware implementation and diagnosing loading, interaction and layout stability.','PageSpeed Insights · Lighthouse'],
 ['Ahrefs','Competitor analysis, search opportunities and relevant authority research.','Ahrefs'],
 ['Semrush','Keyword discovery, competitive gaps and search diagnostics.','Semrush'],
 ['HTML / CSS','Semantic pages with clean hierarchy, responsive layouts and accessible content.','HTML · CSS · JavaScript'],
 ['Local SEO','Local intent, business profile optimisation and location-focused content.','Google Business Profile · Maps'],
 ['Entity SEO','Connecting technical concepts through research, context and factual relationships.','Research · Wikipedia · Content structure'],
 ['Intent research','Prioritising the queries and topics that reflect how real buyers search.','Keyword mapping · Topic clusters']
];
let activeSkill=0,angle=.3,tilt=.12,drag=false,dragX=0,dragY=0,spin=0;
const cloud=$('#constellation'),nodes=$('#skill-nodes'),svg=cloud.querySelector('svg');
const points=skills.map((s,i)=>{const y=1-2*(i+.5)/skills.length,r=Math.sqrt(1-y*y),a=i*2.39996;return [Math.cos(a)*r,y,Math.sin(a)*r]});
nodes.innerHTML=skills.map((s,i)=>'<button class="skill-node '+(i===0?'active':'')+'" aria-pressed="'+(i===0)+'">'+s[0]+'</button>').join('');
const nodeButtons=$$('.skill-node'),connections=[];
for(let i=0;i<skills.length;i++)for(let j=i+1;j<skills.length;j++){if(j===i+1||j===(i+4)%skills.length||i===0){const line=document.createElementNS('http://www.w3.org/2000/svg','line');svg.appendChild(line);connections.push({i,j,line})}}
function selectSkill(i){activeSkill=i;$('#skill-name').textContent=skills[i][0];$('#skill-description').textContent=skills[i][1];$('#skill-tools').textContent=skills[i][2];nodeButtons.forEach((b,j)=>{b.classList.toggle('active',i===j);b.setAttribute('aria-pressed',String(i===j))});connections.forEach(c=>c.line.classList.toggle('highlight',c.i===i||c.j===i))}
nodeButtons.forEach((b,i)=>{b.onclick=()=>selectSkill(i);b.onfocus=()=>selectSkill(i);b.onpointerenter=()=>selectSkill(i)});selectSkill(0);
cloud.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag=true;dragX=e.clientX;dragY=e.clientY;cloud.setPointerCapture(e.pointerId)});
cloud.addEventListener('pointermove',e=>{if(drag){spin=(e.clientX-dragX)*.006;angle+=spin;tilt=Math.max(-.8,Math.min(.8,tilt+(e.clientY-dragY)*.004));dragX=e.clientX;dragY=e.clientY}});
for(const event of ['pointerup','pointercancel','lostpointercapture'])cloud.addEventListener(event,()=>drag=false);
function drawSkills(dt){
 const rect=cloud.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)return;
 if(!drag&&!paused){angle+=spin;spin*=.93;angle+=dt*.04}
 const w=cloud.clientWidth,h=cloud.clientHeight,radius=Math.min(h*.35,170),horizontal=Math.max(65,Math.min(300,w/2-100))/1.2,out=[];
 points.forEach((p,i)=>{const x=p[0]*Math.cos(angle)-p[2]*Math.sin(angle),z=p[0]*Math.sin(angle)+p[2]*Math.cos(angle),y=p[1]*Math.cos(tilt)-z*Math.sin(tilt),zz=p[1]*Math.sin(tilt)+z*Math.cos(tilt);const scale=1/(1-zz*.22),px=w/2+x*horizontal*scale,py=h/2+y*radius*scale;out.push([px,py]);const b=nodeButtons[i];b.style.transform='translate('+px+'px,'+py+'px) scale('+scale+') translate(-50%,-50%)';b.style.opacity=String(.6+(zz+1)*.2);b.style.zIndex=String(Math.round((zz+1)*10))});
 connections.forEach(c=>{c.line.setAttribute('x1',out[c.i][0]);c.line.setAttribute('y1',out[c.i][1]);c.line.setAttribute('x2',out[c.j][0]);c.line.setAttribute('y2',out[c.j][1])});
}
let cursorTarget=[-100,-100],cursorPos=[-100,-100];
document.addEventListener('pointerover',e=>{const el=e.target.closest('a,button,.tilt');$('#cursor').classList.toggle('over',!!el);$('#cursor span').textContent=el?(el.dataset.cursor||'OPEN'):''});
$$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{if(paused||!fine.matches)return;const r=el.getBoundingClientRect();el.style.transform='translate('+(e.clientX-r.left-r.width/2)*.12+'px,'+(e.clientY-r.top-r.height/2)*.15+'px)'});el.addEventListener('pointerleave',()=>el.style.transform='')});
$('#contact-form').addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;if(form.elements._honey.value)return;
 const button=form.querySelector('button'),status=$('#form-status');button.disabled=true;button.textContent='Sending…';status.textContent='';
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'},signal:controller.signal});const result=await response.json();if(!response.ok||!(result.success===true||result.success==='true'))throw Error('Submission not confirmed');status.textContent='Thank you. Your project details have been sent.';form.reset();form.classList.add('success');setTimeout(()=>form.classList.remove('success'),800)}
 catch{status.textContent='Your message could not be confirmed. Please email iamgowthamsaravanakumar@gmail.com, or try again. Your details are still here.'}
 finally{clearTimeout(timeout);button.disabled=false;button.innerHTML='Send project details <span>↗</span>'}
});
const scenes=$$('.scene'),depths=$$('.depth'),milestones=$$('.milestone'),visuals=$$('.project-visual');
let sceneMetrics=[],total=1;
// offset coordinates exclude the animated transform, avoiding feedback/jitter.
function layoutCenter(el){let top=el.offsetHeight/2;for(let node=el;node;node=node.offsetParent)top+=node.offsetTop;return top}
function measure(){sceneMetrics=scenes.map(el=>({el,top:el.offsetTop,height:el.offsetHeight,value:Number(el.dataset.scene)}));total=Math.max(1,document.documentElement.scrollHeight-innerHeight)}
measure();addEventListener('resize',measure);document.fonts.ready.then(measure);new ResizeObserver(measure).observe($('#main'));
const names=['INTRODUCTION','ABOUT','SELECTED WORK','SELECTED WORK','EXPERIENCE','SERVICES','SKILLS','CONTACT','GOWTHAM'];
let lastTime=performance.now(),elapsed=0,renderLast=0,initial=performance.now();
function frame(now){
 const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;if(!paused)elapsed+=dt;
 const y=scrollY;scrollVelocity+=(Math.max(-3,Math.min(3,(y-lastScroll)/50))-scrollVelocity)*.1;lastScroll=y;smoothScroll+=(y-smoothScroll)*Math.min(1,dt*10);
 vx=(vx+(targetX-mx)*.016)*.8;vy=(vy+(targetY-my)*.016)*.8;mx+=vx;my+=vy;
 let index=0;for(let i=0;i<sceneMetrics.length;i++)if(y+innerHeight*.35>=sceneMetrics[i].top)index=i;
 const current=sceneMetrics[index],next=sceneMetrics[Math.min(index+1,sceneMetrics.length-1)];
 const f=Math.max(0,Math.min(1,(smoothScroll-current.top)/Math.max(1,next.top-current.top)));
 const journey=current.value+(next.value-current.value)*f;
 state.time=elapsed;state.journey=paused?0:journey;state.x=paused?0:mx;state.y=paused?0:my;state.velocity=paused?0:scrollVelocity;state.service=service;state.intro=paused?1:Math.min(1,(now-initial)/1600);
 state.lightTheme+=(Number(root.dataset.theme==='light')-state.lightTheme)*.15;
 $('#nav').classList.toggle('scrolled',y>60);$('.progress i').style.transform='scaleX('+Math.min(1,y/total)+')';$('#scene-progress').textContent=String(Math.round(y/total*100)).padStart(2,'0')+'%';$('#scene-name').textContent=names[Math.round(current.value)]||'SELECTED WORK';
 const activeId=current.el.id.startsWith('project')?'work':current.el.id;
 $$('nav a').forEach(a=>{const active=a.hash==='#'+activeId;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 if(!paused){
  depths.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<-100||r.top>innerHeight+100)return;const d=Number(el.dataset.depth),off=(layoutCenter(el)-y-innerHeight/2)/innerHeight;el.style.transform='perspective(1200px) translate3d('+mx*d*18+'px,'+(-my*d*13-off*d*35)+'px,'+(-Math.abs(off)*d*65)+'px) rotateY('+mx*d*1.5+'deg)'});
  milestones.forEach(el=>{const r=el.getBoundingClientRect(),off=(layoutCenter(el)-y-innerHeight/2)/innerHeight;if(Math.abs(off)>1.5)return;el.style.transform='translateZ('+(-Math.abs(off)*260)+'px) rotateY('+(off*8)+'deg)';el.style.opacity=String(Math.max(.35,1-Math.abs(off)*.4))});
  visuals.forEach(el=>{const r=el.getBoundingClientRect(),off=(layoutCenter(el)-y-innerHeight/2)/innerHeight;if(Math.abs(off)>1.5)return;el.style.transform='translateZ('+(-Math.abs(off)*150)+'px) rotateY('+(-off*10+mx*3)+'deg) rotateX('+my*-2+'deg)'});
 }
 if(fine.matches&&!paused&&cursorTarget[0]>=0){cursorPos[0]+=(cursorTarget[0]-cursorPos[0])*.22;cursorPos[1]+=(cursorTarget[1]-cursorPos[1])*.22;const c=$('#cursor');c.style.display='flex';c.style.transform='translate('+cursorPos[0]+'px,'+cursorPos[1]+'px) translate(-50%,-50%)'}else $('#cursor').style.display='none';
 drawSkills(dt);
 const fps=paused?5:(innerWidth<760?24:40);if(world&&now-renderLast>1000/fps){world.draw(state);renderLast=now}
 raf=requestAnimationFrame(frame);
}
try { world=window.createPortfolioWorld($('#world')); }
catch(error) { $('#world').style.display='none';root.classList.add('no-webgl');console.warn('3D background unavailable:',error); }
$('#world').addEventListener('webglcontextlost',e=>{e.preventDefault();$('#world').style.display='none'});
$('#world').addEventListener('webglcontextrestored',()=>location.reload());
let raf=requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf)}else{lastTime=performance.now();raf=requestAnimationFrame(frame)}});

})();
