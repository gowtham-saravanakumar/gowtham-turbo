import * as THREE from './three.module.js';

const canvas=document.getElementById('space-world');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});}catch(err){document.documentElement.classList.add('no-webgl');throw err;}
renderer.setClearColor(0x02050c,1);
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
renderer.shadowMap.enabled=false;
const mobile=matchMedia('(max-width: 760px)').matches;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let motionOff=reduced;
let adaptiveDpr=Math.min(devicePixelRatio,mobile?1.2:1.65);
renderer.setPixelRatio(adaptiveDpr);
renderer.setSize(innerWidth,innerHeight,false);

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x030712,mobile?.013:.009);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,500);
camera.position.set(0,2.4,12);

const ambient=new THREE.HemisphereLight(0x7ddfff,0x080410,1.1);scene.add(ambient);
const key=new THREE.DirectionalLight(0xb9f5ff,2.9);key.position.set(-8,12,8);scene.add(key);
const rim=new THREE.PointLight(0x7c5cff,30,45,2);rim.position.set(9,2,-8);scene.add(rim);

function glowMat(color,intensity=2){return new THREE.MeshStandardMaterial({color:new THREE.Color(color).multiplyScalar(.24),metalness:.65,roughness:.24,emissive:new THREE.Color(color),emissiveIntensity:intensity})}
const metal=new THREE.MeshStandardMaterial({color:0x172330,metalness:.92,roughness:.26});
const metalDark=new THREE.MeshStandardMaterial({color:0x060b12,metalness:.9,roughness:.35});
const glass=new THREE.MeshPhysicalMaterial({color:0x17435a,metalness:.2,roughness:.08,transmission:.18,transparent:true,opacity:.82,emissive:0x092838,emissiveIntensity:.9});
const cyan=glowMat(0x55e6ff,2.6), violet=glowMat(0x7f62ff,2.2), orange=glowMat(0xff6f4b,2.2);

function createShip(){
  const g=new THREE.Group();g.name='Asterion';
  const fuselage=new THREE.Mesh(new THREE.CapsuleGeometry(.62,3.6,8,16),metal);fuselage.rotation.z=Math.PI/2;g.add(fuselage);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.62,1.7,16),metal);nose.rotation.z=-Math.PI/2;nose.position.x=2.65;g.add(nose);
  const cockpit=new THREE.Mesh(new THREE.SphereGeometry(.52,20,12,0,Math.PI*2,0,Math.PI*.62),glass);cockpit.scale.set(1.65,.72,.9);cockpit.rotation.z=-.15;cockpit.position.set(1.0,.47,0);g.add(cockpit);
  for(const z of [-1,1]){
    const wing=new THREE.Mesh(new THREE.BoxGeometry(2.8,.13,1.05),metal);wing.position.set(-.15,-.2,z*.95);wing.rotation.y=z*.13;wing.rotation.z=z*.02;g.add(wing);
    const tip=new THREE.Mesh(new THREE.BoxGeometry(1.5,.22,.28),metalDark);tip.position.set(-.8,-.05,z*1.58);g.add(tip);
    const gun=new THREE.Mesh(new THREE.CylinderGeometry(.055,.08,.85,8),metalDark);gun.rotation.z=Math.PI/2;gun.position.set(.75,-.05,z*1.56);g.add(gun);
  }
  const spine=new THREE.Mesh(new THREE.BoxGeometry(2.7,.22,.5),metalDark);spine.position.set(-.45,.5,0);g.add(spine);
  const reactor=new THREE.Mesh(new THREE.TorusGeometry(.45,.09,10,30),cyan);reactor.rotation.y=Math.PI/2;reactor.position.set(-.55,.58,0);g.add(reactor);
  for(const y of [-.33,.33])for(const z of [-.48,.48]){const eng=new THREE.Mesh(new THREE.CylinderGeometry(.18,.26,.8,12),metalDark);eng.rotation.z=Math.PI/2;eng.position.set(-2.05,y,z);g.add(eng);const burn=new THREE.Mesh(new THREE.ConeGeometry(.15,1.35,12,1,true),cyan);burn.rotation.z=Math.PI/2;burn.position.set(-2.8,y,z);g.add(burn)}
  const shipLight=new THREE.PointLight(0x50dfff,22,12,2);shipLight.position.set(-2.7,0,0);g.add(shipLight);
  g.scale.setScalar(.82);return g;
}
const ship=createShip();scene.add(ship);

function makeStars(count=2400){
  const geo=new THREE.BufferGeometry(),pos=new Float32Array(count*3),size=new Float32Array(count);
  for(let i=0;i<count;i++){const r=25+Math.random()*180,theta=Math.random()*Math.PI*2,phi=Math.acos(THREE.MathUtils.randFloatSpread(2));pos[i*3]=Math.sin(phi)*Math.cos(theta)*r;pos[i*3+1]=Math.cos(phi)*r*.7;pos[i*3+2]=-Math.abs(Math.sin(phi)*Math.sin(theta)*r)-10;size[i]=Math.random()}
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const mat=new THREE.PointsMaterial({color:0xaeeaff,size:mobile?.07:.095,sizeAttenuation:true,transparent:true,opacity:.82,depthWrite:false});
  const pts=new THREE.Points(geo,mat);pts.name='starfield';return pts;
}
const stars=makeStars(mobile?900:2800);scene.add(stars);

function createPlanet(radius,color,glowColor){
  const group=new THREE.Group();const p=new THREE.Mesh(new THREE.SphereGeometry(radius,mobile?32:64,mobile?20:40),new THREE.MeshStandardMaterial({color,roughness:.82,metalness:.05}));group.add(p);
  const wire=new THREE.Mesh(new THREE.SphereGeometry(radius*1.018,22,12),new THREE.MeshBasicMaterial({color:glowColor,wireframe:true,transparent:true,opacity:.055}));group.add(wire);
  const atmo=new THREE.Mesh(new THREE.SphereGeometry(radius*1.08,32,20),new THREE.MeshBasicMaterial({color:glowColor,transparent:true,opacity:.055,side:THREE.BackSide}));group.add(atmo);return group;
}
const aboutPlanet=createPlanet(7.6,0x102332,0x58dbff);aboutPlanet.position.set(13,-5,-32);scene.add(aboutPlanet);
const projectPlanet=createPlanet(5.1,0x251827,0xa17bff);projectPlanet.position.set(-13,4,-67);scene.add(projectPlanet);
const digitalPlanet=createPlanet(4.2,0x0b2a2d,0x55ffda);digitalPlanet.position.set(12,1,-103);scene.add(digitalPlanet);

function createRings(){const g=new THREE.Group();for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(3.8+i*.58,.035+(i%2)*.02,8,90),i%2?violet:cyan);m.rotation.set(Math.PI/2+i*.2,.15*i,.25*i);g.add(m)}return g}
const portal=createRings();portal.position.set(0,0,-82);portal.scale.set(.01,.01,.01);scene.add(portal);

function createStation(){
  const g=new THREE.Group();
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.9,6,18),metal);hub.rotation.z=Math.PI/2;g.add(hub);
  const core=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,7.4,16),cyan);core.rotation.z=Math.PI/2;g.add(core);
  for(let i=0;i<4;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(5+i*1.55,.16,10,80),i===0?cyan:metal);ring.rotation.set(Math.PI/2,i*.2,i*.34);g.add(ring)}
  for(let i=0;i<8;i++){const arm=new THREE.Mesh(new THREE.BoxGeometry(7.5,.18,.36),metalDark);arm.rotation.z=i*Math.PI/4;g.add(arm)}
  for(let i=0;i<14;i++){const light=new THREE.Mesh(new THREE.BoxGeometry(.22,.22,.65),i%3===0?violet:cyan);const a=i/14*Math.PI*2;light.position.set(Math.cos(a)*6.6,Math.sin(a)*6.6,0);g.add(light)}
  return g;
}
const station=createStation();station.position.set(0,0,-161);station.rotation.x=.52;station.scale.setScalar(1.15);scene.add(station);

const asteroidGeo=new THREE.IcosahedronGeometry(.55,1),asteroidMat=new THREE.MeshStandardMaterial({color:0x181c22,roughness:.92,metalness:.12});
const asteroids=new THREE.InstancedMesh(asteroidGeo,asteroidMat,mobile?45:105);const dummy=new THREE.Object3D();
for(let i=0;i<asteroids.count;i++){const z=-52-Math.random()*32;dummy.position.set(THREE.MathUtils.randFloatSpread(28),THREE.MathUtils.randFloatSpread(16),z);dummy.scale.setScalar(.25+Math.random()*2.5);dummy.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);dummy.updateMatrix();asteroids.setMatrixAt(i,dummy.matrix)}scene.add(asteroids);

function createDrone(){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.OctahedronGeometry(.55,0),metalDark);g.add(body);const ring=new THREE.Mesh(new THREE.TorusGeometry(.8,.06,8,30),orange);ring.rotation.x=Math.PI/2;g.add(ring);const eye=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),orange);eye.position.z=.47;g.add(eye);return g}
const drones=[];for(let i=0;i<5;i++){const d=createDrone();d.position.set((i-2)*3.1+(i%2)*1.2,(i%2?1.7:-1.4),-60-i*3.3);d.userData.alive=true;drones.push(d);scene.add(d)}

const particles=[];const projectiles=[];
function explode(pos,color=0xff7a58){
  const count=motionOff?10:(mobile?24:48);const geo=new THREE.BufferGeometry(),arr=new Float32Array(count*3),vel=[];for(let i=0;i<count;i++){arr[i*3]=pos.x;arr[i*3+1]=pos.y;arr[i*3+2]=pos.z;vel.push(new THREE.Vector3().randomDirection().multiplyScalar(.06+Math.random()*.16))}geo.setAttribute('position',new THREE.BufferAttribute(arr,3));const mat=new THREE.PointsMaterial({color,size:.1,transparent:true,opacity:1,depthWrite:false});const p=new THREE.Points(geo,mat);p.userData={vel,life:1};particles.push(p);scene.add(p)
}
function fire(){
  if(motionOff)return;
  const living=drones.filter(d=>d.userData.alive);const target=living.sort((a,b)=>a.position.distanceTo(ship.position)-b.position.distanceTo(ship.position))[0];
  const shot=new THREE.Mesh(new THREE.CapsuleGeometry(.045,.55,4,8),cyan);shot.rotation.z=Math.PI/2;shot.position.copy(ship.position).add(new THREE.Vector3(1.9,-.15,0));shot.userData={target:target||null,life:1.6,velocity:new THREE.Vector3(1,0,0)};if(target)shot.userData.velocity.copy(target.position).sub(shot.position).normalize().multiplyScalar(1.65);projectiles.push(shot);scene.add(shot);shake=Math.max(shake,.11)
}
window.addEventListener('mission:fire',fire);window.addEventListener('mission:motion',e=>{motionOff=e.detail.off});window.addEventListener('mission:transmission',()=>{explode(ship.position.clone().add(new THREE.Vector3(3,1,0)),0x55e6ff)});

const dataGroup=new THREE.Group();for(let i=0;i<36;i++){const node=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.12),i%5===0?violet:cyan);node.position.set(THREE.MathUtils.randFloatSpread(16),THREE.MathUtils.randFloatSpread(10),-110+THREE.MathUtils.randFloatSpread(18));dataGroup.add(node)}scene.add(dataGroup);
for(let i=0;i<24;i++){const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(THREE.MathUtils.randFloatSpread(12),THREE.MathUtils.randFloatSpread(7),THREE.MathUtils.randFloatSpread(12))]);const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x5eeaff,transparent:true,opacity:.08}));line.position.set(0,0,-112);dataGroup.add(line)}

const skillGroup=new THREE.Group();const skillPts=[];for(let i=0;i<18;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(i<8?.14:.06,10,8),i%3===0?violet:cyan);const a=i/18*Math.PI*2,r=4.8+(i%3)*1.4;m.position.set(Math.cos(a)*r,Math.sin(a*1.7)*3.2,-135+Math.sin(a)*2);skillGroup.add(m);skillPts.push(m.position.clone())}for(let i=1;i<skillPts.length;i++){const geo=new THREE.BufferGeometry().setFromPoints([skillPts[i-1],skillPts[i]]);skillGroup.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x6fe9ff,transparent:true,opacity:.12})))}scene.add(skillGroup);

const mouse=new THREE.Vector2(),smoothMouse=new THREE.Vector2(),clock=new THREE.Clock();let lastScroll=scrollY,scrollVel=0,shake=0,avgFrame=16,frameCount=0;
addEventListener('pointermove',e=>{mouse.x=(e.clientX/innerWidth-.5)*2;mouse.y=(e.clientY/innerHeight-.5)*-2},{passive:true});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false)});
function progress(){return Math.min(1,Math.max(0,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)))}
function pathAt(p){
  const z=THREE.MathUtils.lerp(5,-170,p),x=Math.sin(p*Math.PI*6.2)*2.2+Math.sin(p*Math.PI*2)*1.2,y=Math.sin(p*Math.PI*4.3)*1.15;
  return new THREE.Vector3(x,y,z);
}
function updateShip(p,dt,t){
  const target=pathAt(p),ahead=pathAt(Math.min(1,p+.0025));ship.position.lerp(target,motionOff?1:Math.min(1,dt*3.5));
  const dir=ahead.clone().sub(target).normalize();const yaw=Math.atan2(dir.z,dir.x)+Math.PI/2;ship.rotation.y=THREE.MathUtils.lerp(ship.rotation.y,yaw,dt*3);ship.rotation.z=motionOff?0:THREE.MathUtils.lerp(ship.rotation.z,-smoothMouse.x*.32-scrollVel*.025,dt*4);ship.rotation.x=motionOff?0:THREE.MathUtils.lerp(ship.rotation.x,smoothMouse.y*.08,dt*3);
  ship.children.forEach((c,i)=>{if(c.material===cyan && c.geometry?.type==='ConeGeometry')c.scale.y=1+Math.min(1.3,Math.abs(scrollVel)*.18)+Math.sin(t*13+i)*.08});
  return target;
}
function updateCamera(p,target,dt){
  let offset=new THREE.Vector3(-7.8,3.2,8.5),lookOffset=new THREE.Vector3(2.7,.25,-1.2);
  if(p<.08){offset.set(-1.5,2.4,10.5);lookOffset.set(0,.2,-2)}
  else if(p>.12&&p<.24){offset.set(-9,4.5,5.8);lookOffset.set(3,-1,-3)}
  else if(p>.28&&p<.39){offset.set(-7.2,2.1,6.6);lookOffset.set(3,0,-4)}
  else if(p>.44&&p<.55){offset.set(-6.5,4.2,7.5);lookOffset.set(2.5,0,-5)}
  else if(p>.65&&p<.78){offset.set(-4.5,5.8,8.8);lookOffset.set(2,-1,-7)}
  else if(p>.78&&p<.91){offset.set(10,5.5,12);lookOffset.set(0,0,-12)}
  else if(p>.92){offset.set(-6.4,3.1,7.1);lookOffset.set(2.8,0,-4)}
  offset.x+=smoothMouse.x*1.4;offset.y+=smoothMouse.y*.8;if(motionOff){offset.x=-7;offset.y=3}
  const desired=target.clone().add(offset);if(shake>0){desired.x+=THREE.MathUtils.randFloatSpread(shake);desired.y+=THREE.MathUtils.randFloatSpread(shake);shake*=.86}
  camera.position.lerp(desired,motionOff?1:Math.min(1,dt*2.7));camera.lookAt(target.clone().add(lookOffset));camera.fov=THREE.MathUtils.lerp(camera.fov,56+Math.min(10,Math.abs(scrollVel)*1.4),dt*2);camera.updateProjectionMatrix();
}
function updateEffects(p,dt,t){
  aboutPlanet.rotation.y+=dt*.06;projectPlanet.rotation.y-=dt*.04;digitalPlanet.rotation.y+=dt*.08;station.rotation.z+=dt*.035;station.rotation.y+=dt*.02;stars.rotation.z=Math.sin(t*.03)*.03;dataGroup.rotation.z=Math.sin(t*.1)*.05;skillGroup.rotation.z+=dt*.012;
  const portalActive=Math.max(0,1-Math.abs(p-.42)/.09),s=THREE.MathUtils.lerp(portal.scale.x,portalActive*1.2,dt*4);portal.scale.setScalar(Math.max(.01,s));portal.rotation.z+=dt*.6;
  asteroids.rotation.z+=dt*.006;asteroids.rotation.y=Math.sin(t*.08)*.03;
  drones.forEach((d,i)=>{if(!d.userData.alive)return;d.rotation.x+=dt*(.5+i*.08);d.rotation.y-=dt*.7;d.position.y+=Math.sin(t*1.3+i)*dt*.18});
  for(let i=projectiles.length-1;i>=0;i--){const s=projectiles[i];s.position.add(s.userData.velocity);s.userData.life-=dt;const target=s.userData.target;if(target&&target.userData.alive&&s.position.distanceTo(target.position)<.8){target.userData.alive=false;target.visible=false;explode(target.position.clone());shake=.5;scene.remove(s);projectiles.splice(i,1);continue}if(s.userData.life<=0){scene.remove(s);projectiles.splice(i,1)}}
  for(let i=particles.length-1;i>=0;i--){const pts=particles[i],pos=pts.geometry.attributes.position.array;pts.userData.life-=dt*1.25;pts.material.opacity=Math.max(0,pts.userData.life);for(let j=0;j<pts.userData.vel.length;j++){pos[j*3]+=pts.userData.vel[j].x;pos[j*3+1]+=pts.userData.vel[j].y;pos[j*3+2]+=pts.userData.vel[j].z;pts.userData.vel[j].multiplyScalar(.985)}pts.geometry.attributes.position.needsUpdate=true;if(pts.userData.life<=0){scene.remove(pts);particles.splice(i,1)}}
}
function updateHud(target){const fx=document.getElementById('coord-x'),fy=document.getElementById('coord-y'),fz=document.getElementById('coord-z');if(fx){fx.textContent=(target.x*10).toFixed(1).padStart(5,'0');fy.textContent=(target.y*10).toFixed(1).padStart(5,'0');fz.textContent=Math.abs(target.z*10).toFixed(1).padStart(5,'0')}}
function animate(){
  const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime,p=progress();smoothMouse.lerp(mouse,motionOff?1:dt*2.5);
  const dy=scrollY-lastScroll;lastScroll=scrollY;scrollVel=THREE.MathUtils.lerp(scrollVel,dy,Math.min(1,dt*8));scrollVel*=.86;
  const target=updateShip(p,dt,t);updateCamera(p,target,dt);updateEffects(p,dt,t);updateHud(target);
  renderer.render(scene,camera);
  avgFrame=avgFrame*.96+dt*1000*.04;frameCount++;if(frameCount%180===0&&!mobile){if(avgFrame>28&&adaptiveDpr>1){adaptiveDpr=Math.max(1,adaptiveDpr-.15);renderer.setPixelRatio(adaptiveDpr)}else if(avgFrame<18&&adaptiveDpr<Math.min(devicePixelRatio,1.65)){adaptiveDpr=Math.min(Math.min(devicePixelRatio,1.65),adaptiveDpr+.1);renderer.setPixelRatio(adaptiveDpr)}}
  requestAnimationFrame(animate);
}
animate();
