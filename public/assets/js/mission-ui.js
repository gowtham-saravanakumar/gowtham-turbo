(function(){
  'use strict';
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const root=document.documentElement, body=document.body;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let motionOff=reduced.matches;
  const missionData={
    camera:['SYS_01','CINEMATIC CAMERA','The camera trails a procedural ship with pointer influence, smooth damping, scroll-driven FOV changes and context-specific framing.'],
    physics:['SYS_02','MOTION SYSTEM','Pointer input becomes ship banking and camera inertia. Scroll velocity adds acceleration cues while impacts create brief, damped camera shake.'],
    combat:['SYS_03','COMBAT FX','Click or press Space in the combat sector to launch energy projectiles at drones. Impacts dissolve into emissive particles instead of graphic violence.'],
    render:['SYS_04','RENDERING','Adaptive pixel ratio, instanced stars, fog, emissive materials, point lights and reduced particle density keep the scene scalable across devices.']
  };
  const stackData={
    frontend:['NODE / 01','FRONTEND','Semantic markup, responsive layout, cinematic UI, mission navigation and progressive enhancement form the visible surface of the system.'],
    realtime:['NODE / 02','REAL-TIME 3D','Three.js and WebGL render the continuous universe, procedural spacecraft, destination geometry, lighting and particles.'],
    interface:['NODE / 03','INTERACTION','Pointer, scroll, keyboard, focus states and reduced-motion preferences are treated as first-class control inputs.'],
    service:['NODE / 04','SERVICE BOUNDARY','The contact panel submits over HTTP to the existing external form relay; success is only shown after the service confirms it.'],
    delivery:['NODE / 05','DELIVERY','The portfolio remains a static-hostable project suitable for GitHub Pages, with no mandatory build step for deployment.']
  };

  function updateMotionUI(){
    body.classList.toggle('motion-off',motionOff);
    const btn=$('#motion-toggle');
    btn.setAttribute('aria-pressed',String(motionOff));
    $('span',btn).textContent=motionOff?'OFF':'ON';
    window.dispatchEvent(new CustomEvent('mission:motion',{detail:{off:motionOff}}));
  }
  updateMotionUI();
  $('#motion-toggle').addEventListener('click',()=>{motionOff=!motionOff;updateMotionUI()});

  const navToggle=$('#nav-toggle'), nav=$('#mission-nav');
  navToggle.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');navToggle.setAttribute('aria-expanded',String(open));$('span',navToggle).textContent=open?'×':'+'});
  $$('#mission-nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');navToggle.setAttribute('aria-expanded','false');$('span',navToggle).textContent='+'}));

  $$('.system-orbit').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.system-orbit').forEach(x=>x.classList.remove('is-active'));btn.classList.add('is-active');
    const d=missionData[btn.dataset.system];$('#system-index').textContent=d[0];$('#system-title').textContent=d[1];$('#system-copy').textContent=d[2];
  }));
  $$('.stack-node').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.stack-node').forEach(x=>x.classList.remove('is-active'));btn.classList.add('is-active');
    const d=stackData[btn.dataset.stack], box=$('#stack-detail');box.innerHTML=`<span>${d[0]}</span><b>${d[1]}</b><p>${d[2]}</p>`;
  }));
  $$('.skill-star').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.skill-star').forEach(x=>x.classList.remove('is-active'));btn.classList.add('is-active');
    $('#skill-title').textContent=btn.dataset.skill;$('#skill-copy').textContent=btn.dataset.copy;
  }));
  $('.skill-star').classList.add('is-active');

  let audioCtx=null, hum=null, humGain=null;
  const audioBtn=$('#audio-toggle');
  audioBtn.addEventListener('click',async()=>{
    const active=audioBtn.getAttribute('aria-pressed')==='true';
    if(active){if(humGain) humGain.gain.setTargetAtTime(0,audioCtx.currentTime,.04);audioBtn.setAttribute('aria-pressed','false');$('span',audioBtn).textContent='OFF';return}
    audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();await audioCtx.resume();
    if(!hum){hum=audioCtx.createOscillator();humGain=audioCtx.createGain();const lfo=audioCtx.createOscillator(),lfoGain=audioCtx.createGain();hum.type='sawtooth';hum.frequency.value=54;lfo.frequency.value=.18;lfoGain.gain.value=5;lfo.connect(lfoGain);lfoGain.connect(hum.frequency);hum.connect(humGain);humGain.connect(audioCtx.destination);humGain.gain.value=0;hum.start();lfo.start()}
    humGain.gain.setTargetAtTime(.018,audioCtx.currentTime,.08);audioBtn.setAttribute('aria-pressed','true');$('span',audioBtn).textContent='ON';
  });

  const combatMessage=$('#combat-message');
  function fire(){window.dispatchEvent(new CustomEvent('mission:fire'));combatMessage.textContent='ENERGY DISCHARGE // TARGET LOCK';combatMessage.classList.add('is-visible');clearTimeout(fire.t);fire.t=setTimeout(()=>combatMessage.classList.remove('is-visible'),800)}
  $('#combat-fire').addEventListener('click',fire);$('#intro-fire').addEventListener('click',fire);
  addEventListener('keydown',e=>{if(e.code==='Space' && !/INPUT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)){e.preventDefault();fire()}});

  const form=$('#contact-form'),status=$('#form-status');
  form.addEventListener('submit',async e=>{
    e.preventDefault();const submit=$('.transmit',form);submit.disabled=true;status.textContent='TRANSMITTING...';
    try{
      const res=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});const data=await res.json().catch(()=>({}));
      if(!res.ok || !(data.success===true||data.success==='true')) throw new Error('Unconfirmed');
      status.textContent='TRANSMISSION SENT // CHANNEL CONFIRMED';form.reset();window.dispatchEvent(new CustomEvent('mission:transmission'));
    }catch(err){status.textContent='TRANSMISSION UNCONFIRMED // USE EMAIL CHANNEL OR RETRY';}
    finally{submit.disabled=false}
  });

  const sections=$$('.scene'), navLinks=$$('#mission-nav a');let active='intro';
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;active=visible.target.id;
    navLinks.forEach(a=>a.classList.toggle('is-active',a.hash==='#'+active));
  },{threshold:[.25,.5,.75],rootMargin:'-20% 0px -40%'});sections.forEach(s=>observer.observe(s));

  function updateScroll(){
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),p=Math.min(1,scrollY/max),section=sections.reduce((acc,s)=>scrollY+innerHeight*.45>=s.offsetTop?s:acc,sections[0]);
    $('#flight-progress').style.transform=`scaleX(${p})`;$('#flight-percent').textContent=String(Math.round(p*100)).padStart(2,'0');
    $('#hud-sector').textContent=section.dataset.sector||'DEEP SPACE';$('#mission-state').textContent=section.dataset.state||'APPROACH VECTOR';
    $('.mission-header').classList.toggle('is-scrolled',scrollY>40);
    root.style.setProperty('--scroll-progress',p);
  }
  addEventListener('scroll',updateScroll,{passive:true});updateScroll();

  addEventListener('load',()=>{
    setTimeout(()=>$('#boot').classList.add('is-done'),650);
    if(window.gsap && !motionOff){gsap.from('.hero-lockup > *',{y:28,opacity:0,duration:1.1,stagger:.11,ease:'power3.out',delay:.35});gsap.from('.hud,.flight-progress',{opacity:0,duration:1,delay:1})}
  });
})();
