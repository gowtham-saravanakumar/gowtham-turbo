(function () {
"use strict";
/* Original real-time signed-distance-field renderer. No models or external runtime. */
window.createPortfolioWorld = function createWorld(canvas) {
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});
 if(!gl) throw new Error('WebGL unavailable');
 const vertex='attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}';
 const fragment=`
precision highp float;
uniform vec2 resolution, pointer;
uniform float time, journey, velocity, lightTheme, service, intro;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float torus(vec3 p,vec2 t){return length(vec2(length(p.xz)-t.x,p.y))-t.y;}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
vec2 nearer(vec2 a,vec2 b){return a.x<b.x?a:b;}
vec3 shapePoint(vec3 p){
 p.xz*=rot(.23*time+pointer.x*.25+journey*.8);
 p.xy*=rot(-.48+sin(time*.16)*.09);
 return p;
}
vec2 map(vec3 p){
 vec3 q=shapePoint(p);
 float breathe=sin(time*.5)*.035;
 vec2 d=vec2(length(q)-(.58+breathe),2.);
 if(journey<3.95 || journey>6.6){
  vec3 a=q; a.yz*=rot(.38+sin(journey)*.7);
  d=nearer(d,vec2(torus(a,vec2(1.46,.22)),1.));
  a=q;a.xy*=rot(1.2);a.yz*=rot(.72);
  d=nearer(d,vec2(torus(a,vec2(1.28,.15)),1.));
  a=q;a.yz*=rot(1.7);a.xy*=rot(-.3);
  d=nearer(d,vec2(torus(a,vec2(1.91,.022)),3.));
  a=q-vec3(1.95,sin(time*.5)*.35,.3);
  d=nearer(d,vec2(length(a)-.14,1.));
  a=q-vec3(-1.72,.65,1.);
  d=nearer(d,vec2(length(a)-.08,3.));
 }else if(journey<4.9){
  for(int i=0;i<8;i++){
   vec3 a=p; a.z=mod(a.z+float(i)*2.+time*.15,16.)-8.;
   a.xy*=rot(float(i)*.1+journey*.15);
   float frame=abs(box(a,vec3(2.6,1.8,.035)))-.025;
   float cut=-box(a,vec3(2.52,1.72,1.));
   d=nearer(d,vec2(max(frame,cut),float(i)==0.?3.:1.));
  }
 }else if(journey<5.9){
  float kind=mod(service,3.);
  if(kind<.5){
   for(int i=0;i<5;i++){vec3 a=q;a.y+=float(i)*.39-.78;a.xz*=rot(float(i)*.12);d=nearer(d,vec2(box(a,vec3(1.18,.065,.85))-.065,1.));}
  }else if(kind<1.5){
   for(int i=0;i<6;i++){float f=float(i);vec3 a=q-vec3(cos(f*1.047)*1.35,sin(f*2.1)*.65,sin(f*1.047)*1.35);d=nearer(d,vec2(length(a)-.25,1.));}
   d=nearer(d,vec2(torus(q,vec2(1.35,.025)),3.));
  }else{
   vec3 a=q;a.yz*=rot(.6);
   d=nearer(d,vec2(torus(a,vec2(1.2,.19)),1.));
   a.xy*=rot(1.57);d=nearer(d,vec2(torus(a,vec2(1.2,.09)),3.));
  }
 }else{
  for(int i=0;i<5;i++){vec3 a=q; a.yz*=rot(float(i)*.64); d=nearer(d,vec2(torus(a,vec2(1.65,.016)),3.));}
 }
 return d;
}
vec3 normalAt(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x));}
vec3 environment(vec3 r){
 vec3 col=mix(vec3(.025,.042,.05),vec3(.18,.24,.22),clamp(r.y*.5+.5,0.,1.));
 float softbox=pow(max(dot(r,normalize(vec3(-.7,1.,1.))),0.),20.);
 float strip=pow(max(dot(r,normalize(vec3(1.,.1,-.8))),0.),65.);
 col+=vec3(.9,1.,.91)*softbox*2.3+vec3(.75,.87,1.)*strip*2.4;
 col+=vec3(.58,.7,.45)*pow(max(dot(r,normalize(vec3(-1.,-.4,-.3))),0.),10.)*.55;
 return col;
}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;
 float mobile=step(resolution.x/resolution.y,1.);
 float xshift=mix(.92,.15,mobile);
 if(journey>4.9&&journey<5.9)xshift=mix(-1.4,.1,mobile);
 if(journey>6.6)xshift=.7;
 uv.x-=xshift*.22;
 uv.y+=mix(.18,-.04,mobile);
 float zoom=6.7;
 zoom+=sin(journey*1.7)*.65;
 if(journey>7.3)zoom+=(journey-7.3)*6.;
 vec3 ro=vec3(pointer.x*.4,pointer.y*.3,zoom);
 if(journey>3.95&&journey<4.9)ro.z=5.-fract(journey)*3.;
 vec3 target=vec3(0.);
 vec3 ww=normalize(target-ro),uu=normalize(cross(vec3(0.,1.,0.),ww)),vv=cross(ww,uu);
 vec3 rd=normalize(uv.x*uu+uv.y*vv+1.6*ww);
 rd.xy*=rot(sin(journey*.75)*.045+velocity*.006);
 float t=0.;vec2 hit=vec2(0.);bool found=false;
 for(int i=0;i<64;i++){
  vec3 p=ro+rd*t;hit=map(p);
  if(hit.x<.004){found=true;break;}
  t+=hit.x*.8;
  if(t>20.)break;
 }
 vec3 base=mix(vec3(.043,.055,.067),vec3(.941,.949,.929),lightTheme);
 vec3 color=base;
 float glow=exp(-length(uv-vec2(-.03,0.)) * 2.2);
 color+=mix(vec3(.025,.045,.036),vec3(-.035,-.028,-.02),lightTheme)*glow;
 if(found){
  vec3 p=ro+rd*t,n=normalAt(p),r=reflect(rd,n);
  vec3 l=normalize(vec3(-3.+pointer.x*2.,4.+pointer.y,5.));
  float diffuse=max(dot(n,l),0.);
  float fresnel=pow(1.-max(dot(n,-rd),0.),3.);
  float ao=clamp(map(p+n*.18).x/.18,.25,1.);
  vec3 metal=environment(r)*(.6+.6*fresnel);
  vec3 surface=vec3(.19,.25,.24)*diffuse*.45+metal;
  if(hit.y>1.5&&hit.y<2.5){
   surface=vec3(.23,.33,.28)*diffuse+environment(r)*.55;
   surface+=vec3(.12,.19,.12)*fresnel;
  }
  if(hit.y>2.5)surface=vec3(.53,.78,.3)*(.4+diffuse*.65)+environment(r)*.45;
  surface*=ao;
  surface+=vec3(1.)*pow(max(dot(reflect(-l,n),-rd),0.),70.)*.7;
  color=mix(surface,base,smoothstep(9.,20.,t));
 }
 // Sparse dust in multiple planes. Its projection changes with camera and scroll.
 for(int j=0;j<3;j++){
  float layer=float(j)+1.;
  vec2 st=(uv+pointer*.018/layer+vec2(time*.001,-journey*.03)/layer)*(25.+layer*16.);
  vec2 id=floor(st),gv=fract(st)-.5;
  float seed=hash(id+layer);
  float point=(1.-smoothstep(.005,.043,length(gv)))*step(.983,seed);
  color+=point*mix(vec3(.27,.35,.23),vec3(-.1),lightTheme)*(.7/layer);
 }
 color=mix(base,color,smoothstep(0.,1.,intro));
 gl_FragColor=vec4(color,1.);
}`;
 const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const a=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 const uniforms={};for(const n of ['resolution','pointer','time','journey','velocity','lightTheme','service','intro'])uniforms[n]=gl.getUniformLocation(program,n);
 let scale=innerWidth<760?.7:Math.min(devicePixelRatio,1.15),slow=0,frames=0,previous=0;
 function resize(){canvas.width=Math.round(innerWidth*scale);canvas.height=Math.round(innerHeight*scale);gl.viewport(0,0,canvas.width,canvas.height)}
 resize();addEventListener('resize',resize);
 return {draw(state){
  if(gl.isContextLost())return;
  const stamp=performance.now();if(previous&&stamp-previous>30)slow++;previous=stamp;frames++;
  if(frames===100&&slow>55&&scale>.55){scale*=.7;resize()}
  gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);gl.uniform2f(uniforms.pointer,state.x,state.y);
  for(const n of ['time','journey','velocity','lightTheme','service','intro'])gl.uniform1f(uniforms[n],state[n]);
  gl.drawArrays(gl.TRIANGLES,0,6);
 },dispose(){removeEventListener('resize',resize);gl.deleteBuffer(buffer);gl.deleteProgram(program)}};
}

})();
