import * as THREE from "three";

export function createQAScene(canvas) {
  if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches || innerWidth < 700) return () => {};
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 7);
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: 0xe2c08d, transparent: true, opacity: 0.75 });
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.8, 2.5, 0.45)), material));
  for (let i = 0; i < 5; i += 1) {
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), new THREE.MeshBasicMaterial({ color: i < 2 ? 0xe2c08d : 0xf5f5f7 }));
    pin.position.set(-1.25 + (i % 3) * 1.1, 0.55 - Math.floor(i / 3) * 0.85, 0.27); group.add(pin);
  }
  scene.add(group);
  let pointerX = 0, pointerY = 0, frameId = 0;
  const onPointer = (event) => { pointerX = (event.clientX / innerWidth - 0.5) * 0.35; pointerY = (event.clientY / innerHeight - 0.5) * 0.2; };
  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); };
  const animate = () => { group.rotation.y += (pointerX - group.rotation.y) * 0.035; group.rotation.x += (-pointerY - group.rotation.x) * 0.035; renderer.render(scene, camera); frameId = requestAnimationFrame(animate); };
  addEventListener("pointermove", onPointer, { passive: true }); addEventListener("resize", resize); animate();
  return () => { cancelAnimationFrame(frameId); removeEventListener("pointermove", onPointer); removeEventListener("resize", resize); renderer.dispose(); material.dispose(); };
}

