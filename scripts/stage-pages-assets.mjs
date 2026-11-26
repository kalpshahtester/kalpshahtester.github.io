import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });

for (const directory of ["assets", "projects"]) {
  fs.cpSync(path.join(root, directory), path.join(publicDir, directory), { recursive: true });
}

for (const file of [
  "Kalp Shah Profile Photo.png",
  "Kalp Shah Manual Tester Resume.pdf",
  "TOPS_Certificate_Kalp_Shah.pdf",
  "NSDC_Certificate_Kalp_Shah.pdf",
  "Kalp Shah HCL GUVI Certification.png",
  "Kalp Shah Generative AI Mastermind Course Certificate.jpeg",
  "Kalp Shah Outskill Certificate.png",
  "favicon.ico",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml"
]) {
  fs.copyFileSync(path.join(root, file), path.join(publicDir, file));
}

console.log("Staged legacy image, résumé, certificate, favicon, project-page and metadata URLs into public/.");
