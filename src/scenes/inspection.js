import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export async function mountInspection(section) {
  const stage = section.querySelector(".inspection-stage");
  const viewport = stage.querySelector(".inspection-viewport");
  const canvas = stage.querySelector("canvas");
  const caption = stage.querySelector("#inspection-caption");
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setClearColor(0x302622);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 960/610, 0.1, 30);
  camera.position.z = 5.9;
  const browser = new THREE.Group();
  scene.add(browser);
  const textures = [];
  const materials = [];
  const geometries = [];
  const loader = new THREE.TextureLoader();
  let trigger, resize;
  function dispose() {
    trigger?.kill();
    resize?.disconnect();
    canvas.removeEventListener("webglcontextlost", dispose);
    stage.removeAttribute("data-rendered");
    caption.textContent = "Standard account";
    textures.forEach(texture => texture.dispose());
    materials.forEach(material => material.dispose());
    geometries.forEach(geometry => geometry.dispose());
    renderer.dispose();
  }
  function plane(width, height, options) {
    const material = new THREE.MeshBasicMaterial(options);
    const geometry = new THREE.PlaneGeometry(width, height);
    materials.push(material);
    geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    browser.add(mesh);
    return mesh;
  }
  try {
    for (const user of ["standard_user", "problem_user"]) {
      const texture = await loader.loadAsync("/assets/" + user + ".webp");
      texture.colorSpace = THREE.SRGBColorSpace;
      textures.push(texture);
    }
    const width = 4.6;
    const height = width * 610/960;
    const backing = plane(width+.12, height+.12, {color:0xc2a28b});
    const expected = plane(width, height, {map:textures[0]});
    expected.position.z = .025;
    const observed = plane(width, height, {map:textures[1], transparent:true, opacity:0, depthWrite:false});
    observed.renderOrder = 1;
    const marker = new THREE.Group();
    browser.add(marker);
    // Outline the image column in the captured inventory viewport.
    const left = -width*.485, right = -width*.212;
    const top = height*.25, bottom = -height*.49;
    const points = [[left,top],[right,top],[right,bottom],[left,bottom]].map(([x,y])=>new THREE.Vector3(x,y,0));
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({color:0x884c22});
    geometries.push(lineGeometry);
    materials.push(lineMaterial);
    marker.add(new THREE.LineLoop(lineGeometry,lineMaterial));
    function draw(progress) {
      const mix = THREE.MathUtils.smoothstep(progress,.22,.52);
      const inspect = THREE.MathUtils.smoothstep(progress,.52,.85);
      browser.rotation.y = -.13 + .24 * Math.sin(progress*Math.PI);
      browser.rotation.x = .055 - progress*.08;
      backing.position.set(-.045*inspect, -.055*inspect, -.18*inspect);
      observed.position.z = .045 + inspect*.12;
      observed.material.opacity = mix;
      marker.visible = inspect>.08;
      marker.position.z = observed.position.z + .025;
      caption.textContent = progress<.39 ? "Standard account" : progress<.68 ? "Problem account" : "BUG-001 · Open";
      renderer.render(scene,camera);
    }
    trigger = ScrollTrigger.create({
      trigger:section.querySelector(".inspection-steps"),
      start:"top 65%", end:"bottom 65%",
      onUpdate:self=>draw(self.progress)
    });
    resize = new ResizeObserver(()=>{
      const {width, height} = viewport.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width,height,false);
      camera.aspect = width/height;
      camera.updateProjectionMatrix();
      draw(trigger.progress);
    });
    resize.observe(viewport);
    canvas.addEventListener("webglcontextlost",dispose,{once:true});
    draw(trigger.progress);
    stage.setAttribute("data-rendered","");
    return dispose;
  } catch (error) {
    dispose();
    throw error;
  }
}
