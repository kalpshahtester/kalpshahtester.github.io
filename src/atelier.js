// Native scrolling with continuously scrubbed perspective; no hidden content.
const motion = matchMedia("(prefers-reduced-motion: no-preference)");
const scenes = [...document.querySelectorAll("main > section, .site-footer")];
const layers = scenes.map((section,index)=>{
 const nodes=[...section.querySelectorAll(".hero-copy,.hero-evidence,.manifesto > div,.section-heading,.inspection-stage,.inspection-steps article,.work-card,.approach-track article,.lab-panel,.timeline article,.education-panel,.toolkit-grid article,.certificate-card,.footer-primary")];
 return {section,index,nodes};
});
let frame=0;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function paint(){
 frame=0;
 const vh=innerHeight, compact=innerWidth<760;
 for(const {section,index,nodes} of layers){
  const r=section.getBoundingClientRect();
  if(r.bottom< -100 || r.top>vh+100) continue;
  const p=clamp((vh-r.top)/(vh+Math.min(r.height,vh)),0,1);
  section.style.setProperty("--scene-progress",p.toFixed(3));
  for(const [i,node] of nodes.entries()){
   const b=node.getBoundingClientRect();
   const q=clamp((vh-b.top)/(vh+Math.min(b.height,vh)),0,1);
   const entry=clamp(1-q*2.5,0,1);
   const exit=clamp((q-.72)/.28,0,1);
   const strength=compact?.35:1;
   node.style.setProperty("--cinema-y",((entry*36-exit*16)*strength).toFixed(2)+"px");
   node.style.setProperty("--cinema-x",((i%2?1:-1)*entry*12*strength).toFixed(2)+"px");
   node.style.setProperty("--cinema-rx",((entry*9-exit*3)*strength).toFixed(2)+"deg");
   node.style.setProperty("--cinema-ry",((i%2?1:-1)*entry*7*strength).toFixed(2)+"deg");
  }
 }
}
function schedule(){if(motion.matches&&!frame)frame=requestAnimationFrame(paint)}
function configure(){
 document.documentElement.classList.toggle("cinema-enabled",motion.matches);
 if(!motion.matches){cancelAnimationFrame(frame);frame=0;}
 else schedule();
}
addEventListener("scroll",schedule,{passive:true});
addEventListener("resize",schedule,{passive:true});
motion.addEventListener("change",configure);
configure();

async function mountSpatialPortfolio(){
 if(!motion.matches)return;
 const THREE=await import("three");
 if(!motion.matches)return;
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 renderer.setClearColor(0,0);
 const canvas=renderer.domElement;
 canvas.className="spatial-portfolio";canvas.setAttribute("aria-hidden","true");
 document.body.prepend(canvas);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,100);
 camera.position.z=8;
 const group=new THREE.Group();scene.add(group);
 const material=new THREE.MeshStandardMaterial({color:0xbcbcbc,metalness:.65,roughness:.28,transparent:true,opacity:.72});
 const shapes=[new THREE.TorusGeometry(1.5,.075,12,100),new THREE.IcosahedronGeometry(1.15,0),new THREE.BoxGeometry(1.7,1.7,1.7),new THREE.TorusKnotGeometry(.9,.12,80,10)];
 const meshes=shapes.map((geometry,i)=>{const m=new THREE.Mesh(geometry,material);m.visible=i===0;group.add(m);return m});
 const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(4,5,6);scene.add(light,new THREE.AmbientLight(0xffffff,1.2));
 let tick=0,disposed=false;
 function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();scheduleScene()}
 function draw(){
 tick=0;if(disposed||!motion.matches)return;
 const vh=innerHeight;
 let index=0;
 scenes.forEach((s,i)=>{if(s.getBoundingClientRect().top<vh*.55)index=i});
 const rect=scenes[index].getBoundingClientRect();
 const p=clamp((vh*.55-rect.top)/Math.max(rect.height,1),0,1);
 meshes.forEach((m,i)=>m.visible=i===index%meshes.length);
 group.rotation.set(p*2+index*.5,p*3+index*.7,p*.8);
 group.position.set(camera.aspect>1?2.5*Math.sin(index*1.7+.8):0,1.1*Math.cos(p*Math.PI),0);
 group.scale.setScalar(camera.aspect<1?.65:1.15);
 renderer.render(scene,camera);
 }
 function scheduleScene(){if(!tick&&!disposed&&motion.matches)tick=requestAnimationFrame(draw)}
 function stop(){if(disposed)return;disposed=true;cancelAnimationFrame(tick);removeEventListener("scroll",scheduleScene);removeEventListener("resize",resize);motion.removeEventListener("change",onMotion);shapes.forEach(g=>g.dispose());material.dispose();renderer.dispose();canvas.remove()}
 function onMotion(){if(!motion.matches)stop()}
 canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();stop()},{once:true});
 addEventListener("scroll",scheduleScene,{passive:true});addEventListener("resize",resize);motion.addEventListener("change",onMotion);resize();
}
mountSpatialPortfolio().catch(()=>{/* CSS perspective remains available without WebGL. */});
