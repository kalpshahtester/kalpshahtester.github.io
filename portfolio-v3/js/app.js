const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Sticky navigation + scroll progress
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
function onScroll(){
  nav.classList.toggle('scrolled', window.scrollY > 30);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// Mobile navigation
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

// Theme: default dark, persist preference
const themeBtn = document.getElementById('themeBtn');
const savedTheme = localStorage.getItem('kalp-theme');
if(savedTheme === 'light') document.body.classList.add('light');
function updateTheme(){
  const light = document.body.classList.toggle('light');
  localStorage.setItem('kalp-theme', light ? 'light' : 'dark');
  themeBtn.textContent = light ? '☾' : '☼';
}
themeBtn?.addEventListener('click', updateTheme);
if(savedTheme === 'light') themeBtn.textContent = '☾';

// Lightweight typing animation
const typingText = document.getElementById('typingText');
const phrases = ['Functional Testing','API Testing with Postman','Web & SEO Quality Assurance','Defect Reporting & Retesting','Playwright QA Automation'];
let phraseIndex=0, charIndex=0, deleting=false;
function typeLoop(){
  if(!typingText || prefersReduced){ if(typingText) typingText.textContent=phrases[0]; return; }
  const phrase=phrases[phraseIndex];
  typingText.textContent=deleting ? phrase.slice(0, --charIndex) : phrase.slice(0, ++charIndex);
  let delay=deleting ? 35 : 65;
  if(!deleting && charIndex===phrase.length){ delay=1400; deleting=true; }
  else if(deleting && charIndex===0){ deleting=false; phraseIndex=(phraseIndex+1)%phrases.length; delay=350; }
  setTimeout(typeLoop,delay);
}
typeLoop();

// Reveal-on-scroll
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Count-up metrics
const metricObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count || 0);
    if(prefersReduced){el.textContent = target + (target===62 ? '+' : ''); metricObserver.unobserve(el); return;}
    const start=performance.now(), duration=900;
    function tick(now){
      const p=Math.min((now-start)/duration,1), eased=1-Math.pow(1-p,3);
      el.textContent=Math.floor(target*eased) + (target===62 && p===1 ? '+' : '');
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick); metricObserver.unobserve(el);
  });
},{threshold:.7});
document.querySelectorAll('[data-count]').forEach(el=>metricObserver.observe(el));

// Sequential workflow highlight
const steps=[...document.querySelectorAll('.flow-step')];
let step=0;
if(!prefersReduced){
  setInterval(()=>{steps.forEach(s=>s.classList.remove('active'));steps[step].classList.add('active');step=(step+1)%steps.length;},1800);
}

// QA simulation — visual only; no false claim of a live website scan
const scanBtn=document.getElementById('scanBtn');
const scanResult=document.getElementById('scanResult');
scanBtn?.addEventListener('click',()=>{
  scanBtn.disabled=true;
  scanResult.textContent='Executing checklist…';
  const items=[...document.querySelectorAll('#checkList div')];
  items.forEach((item,i)=>{item.style.opacity='.35';setTimeout(()=>item.style.opacity='1',i*120+200);});
  setTimeout(()=>{scanResult.textContent='Simulation complete · 8 checks demonstrated';scanBtn.disabled=false;},1500);
});

// Magnetic micro-interaction on desktop
if(!prefersReduced && matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.magnetic').forEach(btn=>{
    btn.addEventListener('pointermove',e=>{
      const r=btn.getBoundingClientRect();
      btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`;
    });
    btn.addEventListener('pointerleave',()=>btn.style.transform='');
  });
}

document.getElementById('year').textContent=new Date().getFullYear();