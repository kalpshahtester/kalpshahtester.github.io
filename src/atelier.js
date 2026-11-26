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
