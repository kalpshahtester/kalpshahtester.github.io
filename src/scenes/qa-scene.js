import * as THREE from "three";

export function createQAScene(canvas) {
  if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches || innerWidth < 760) return () => {};
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch { canvas.hidden = true; return () => {}; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 7);
  const root = new THREE.Group(); scene.add(root);
  const gold = new THREE.LineBasicMaterial({ color: 0xe2c08d, transparent: true, opacity: .72 });
  const pale = new THREE.LineBasicMaterial({ color: 0xf5f5f7, transparent: true, opacity: .32 });
  const layers = [];
  for (let i = 0; i < 4; i++) {
    const layer = new THREE.Group();
    const box = new THREE.BoxGeometry(3.65 - i * .08, 2.45 - i * .08, .12);
    layer.add(new THREE.LineSegments(new THREE.EdgesGeometry(box), i === 0 ? gold : pale));
    const bar = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.55, .82, .07), new THREE.Vector3(1.55, .82, .07),
      new THREE.Vector3(-1.55, .55, .07), new THREE.Vector3(.15, .55, .07)
    ]);
    layer.add(new THREE.LineSegments(bar, pale));
    layer.position.z = (1.5 - i) * .13; root.add(layer); layers.push(layer);
  }
  const pins = [];
  const pinMaterial = new THREE.MeshBasicMaterial({ color: 0xe2c08d });
  for (let i = 0; i < 5; i++) {
    const pin = new THREE.Mesh(new THREE.SphereGeometry(.065, 12, 12), pinMaterial.clone());
    pin.position.set(-1.25 + (i % 3) * 1.1, .25 - Math.floor(i / 3) * .72, .16);
    root.add(pin); pins.push(pin);
  }
  let pointerX = 0, pointerY = 0, frame = 0, active = true;
  const onPointer = e => { pointerX = (e.clientX / innerWidth - .5) * .35; pointerY = (e.clientY / innerHeight - .5) * .2; };
  const onScroll = () => {
    const rect = canvas.getBoundingClientRect(), p = THREE.MathUtils.clamp((innerHeight - rect.top) / (innerHeight + rect.height), 0, 1);
    layers.forEach((layer, i) => { layer.position.z = (1.5 - i) * .13 + p * (i - 1.5) * .2; });
    pins.forEach((pin, i) => { pin.material.color.setHex(i < Math.ceil(p * 5) ? 0xe2c08d : 0xf5f5f7); });
  };
  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); };
  const animate = () => {
    if (!active) return;
    root.rotation.y += (pointerX - root.rotation.y) * .035;
    root.rotation.x += (-pointerY - root.rotation.x) * .035;
    renderer.render(scene, camera); frame = requestAnimationFrame(animate);
  };
  const visibility = new IntersectionObserver(entries => {
    active = entries[0].isIntersecting;
    if (active && !frame) animate(); else if (!active && frame) { cancelAnimationFrame(frame); frame = 0; }
  });
  visibility.observe(canvas); addEventListener("pointermove", onPointer, { passive: true });
  addEventListener("resize", resize); addEventListener("scroll", onScroll, { passive: true });
  onScroll(); animate();
  return () => {
    active = false; cancelAnimationFrame(frame); visibility.disconnect();
    removeEventListener("pointermove", onPointer); removeEventListener("resize", resize); removeEventListener("scroll", onScroll);
    root.traverse(object => { object.geometry?.dispose(); if (Array.isArray(object.material)) object.material.forEach(m => m.dispose()); else object.material?.dispose(); });
    renderer.dispose();
  };
}
