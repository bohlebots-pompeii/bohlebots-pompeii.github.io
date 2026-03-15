You are working on the BohleBots Pompeii website — a GitHub Pages static site
for a RoboCup Junior Soccer 2vs2 Lightweight team from Gymnasium Haan, Germany.
Repository: https://github.com/bohlebots-pompeii/bohlebots-pompeii.github.io

=== VISION ===
Build an Apple-style scroll-driven product reveal experience for the robot.
Reference: apple.com/airpods-pro, apple.com/mac-pro — the kind where the
product sits center screen, you scroll, and it animates in response.

The experience has two acts:
ACT 1 — HERO: Robot enters dramatically, sits center screen, glowing.
ACT 2 — EXPLODE: As the user scrolls, the robot's parts drift apart in 3D
with labeled annotation arrows pointing to each component,
exactly like Apple's chip exploded-view pages.

=== TECH STACK ===
- Three.js r128 via CDN:
  https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
- GLTFLoader (load after Three.js):
  https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js
- Pure HTML/CSS/JS — no frameworks, no npm, GitHub Pages compatible
- Model: /_models/robot-compressed.glb

=== ACT 1 — HERO SECTION ===

Full viewport height section. Dark background. Robot centered.

On page load:
1. Loading screen: centered amber spinner + percentage, fades out when ready
2. Robot drops in from slightly above with an ease-out (translateY animation
   on the group: starts at y+0.8, lands at y=0 over 1.2s)
3. Ambient particle field: ~120 tiny white/amber dots drifting slowly in the
   background (use Points geometry with a BufferGeometry of random positions,
   animate slowly — gives depth without distraction)
4. Subtle golden glow halo behind the robot: a large sprite or PlaneGeometry
   with a radial gradient texture, additive blending, pulsing opacity 0.3→0.6
5. Robot auto-rotates slowly on Y axis (0.003 rad/frame)
6. Gentle float animation (sin wave, ±0.03 units, period 3s)

Hero text overlay (HTML, positioned over canvas with CSS):
Top area:
<p class="hero-eyebrow">ROBOCUP JUNIOR 2VS2 LIGHTWEIGHT</p>
<h1>BOHLEBOTS<br><span class="accent">POMPEII</span></h1>
Bottom area (above scroll cue):
<p class="hero-sub">Built from scratch. Competing in 2026.</p>
Bottom center:
Animated scroll cue — a thin vertical line that pulses downward,
with text "SCROLL TO EXPLORE" in tiny spaced caps

=== SCROLL SYSTEM ===

Use a tall sentinel div to drive the scroll progress:

  <div id="scroll-driver" style="height: 400vh;"></div>

The canvas is position:sticky, top:0, height:100vh — it stays fixed
while the user scrolls through the 400vh of scroll-driver.

Compute scroll progress 0→1:
const driver = document.getElementById('scroll-driver');
window.addEventListener('scroll', () => {
const rect = driver.getBoundingClientRect();
const total = driver.offsetHeight - window.innerHeight;
const scrolled = -rect.top;
progress = Math.max(0, Math.min(1, scrolled / total));
onScrollProgress(progress);
});

Divide progress into phases:
Phase 0 (0.00 → 0.15): Robot assembled, hero text fades OUT
Phase 1 (0.15 → 0.40): Explosion begins — parts drift apart, labels fade IN
Phase 2 (0.40 → 0.75): Full explosion — all parts separated, all labels visible
Phase 3 (0.75 → 1.00): Parts drift back together, robot reassembles,
reassembly text fades in: "Every part. One purpose."

=== ACT 2 — EXPLODE VIEW ===

After the GLTFLoader loads robot-compressed.glb, traverse the scene graph
and separate it into named part groups. The Fusion 360 export will have
named meshes/nodes — map them to these logical parts:

Define an explosionMap array. Each entry:
{
keywords: ['wheel', 'motor'],   // match against node.name.toLowerCase()
label: 'Mecanum Wheels',
description: '4× brushless · maxon ESCON drivers',
explodeOffset: new THREE.Vector3(-1.8, -0.4, 0),  // where it drifts to
labelAnchor: 'left'
}

Full explosionMap (7 parts — covers the whole robot):
1. keywords: ['wheel','motor','mecanum']
   label: 'Mecanum Drive'
   description: '4× omnidirectional wheels\nbrushed maxon motors'
   explodeOffset: (-1.8, -0.5, 0)
   labelAnchor: 'left'

2. keywords: ['mirror','vision','camera','lens','plexiglass','glas']
   label: '360° Vision Tower'
   description: 'Raspberry Pi Camera 3\nHyperbolic mirror · 60fps YOLO8n'
   explodeOffset: (0, 2.2, 0)
   labelAnchor: 'right'

3. keywords: ['pcb','board','circuit','ai','raspberry','hailo','compute']
   label: 'AI Board'
   description: 'Raspberry Pi CM5 + Hailo8L\nYOLO object detection @ 60fps'
   explodeOffset: (1.8, 0.6, 0)
   labelAnchor: 'right'

4. keywords: ['motor_board','driver','escon','brushless_board']
   label: 'Motor Controller'
   description: 'Custom PCB · 5× ESCON drivers\nDribbler + 4 drive motors'
   explodeOffset: (1.8, -0.3, 0.6)
   labelAnchor: 'right'

5. keywords: ['dribbler','roller','cylinder']
   label: 'Dribbler'
   description: 'Spinning rubber roller\nCaptures & holds the ball'
   explodeOffset: (0, -0.3, 2.0)
   labelAnchor: 'right'

6. keywords: ['kicker','solenoid','electromagnet']
   label: 'Electromagnetic Kicker'
   description: '16V capacitor discharge\nFires iron pin at high speed'
   explodeOffset: (-0.8, -0.5, 1.8)
   labelAnchor: 'left'

7. keywords: ['plate','chassis','body','base','frame','shell']
   label: 'Chassis'
   description: '3D printed plates\nAluminium angle connectors'
   explodeOffset: (0, -1.6, 0)
   labelAnchor: 'left'

Fallback: any node NOT matched by keywords goes into a group called
'unmatched' and stays at offset (0,0,0) — i.e. it doesn't move.
This is important because the Fusion export node names are unknown;
the keyword matching is best-effort.

Explosion interpolation:
Each part stores:
part.userData.homePosition  = original position (cloned on load)
part.userData.explodeTarget = homePosition + explodeOffset

In onScrollProgress(p):
const t = smoothstep(phase1Start, phase2End, p); // 0→1 over phases 1+2
parts.forEach(part => {
part.position.lerpVectors(
part.userData.homePosition,
part.userData.explodeTarget,
easeInOutCubic(t)
);
});

smoothstep and easeInOutCubic helpers:
function smoothstep(edge0, edge1, x) {
const t = Math.max(0, Math.min(1, (x-edge0)/(edge1-edge0)));
return t*t*(3-2*t);
}
function easeInOutCubic(t) {
return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
}

=== ANNOTATION LABELS (HTML overlay, not Three.js) ===

Create a <div id="annotations"> absolutely positioned over the canvas.
For each part in explosionMap, create one annotation element:

  <div class="annotation" data-part="Vision Tower">
    <div class="annotation-line"></div>
    <div class="annotation-content">
      <span class="annotation-title">360° Vision Tower</span>
      <span class="annotation-desc">Raspberry Pi Camera 3 · Hyperbolic mirror</span>
    </div>
  </div>

Positioning the annotations:
Each frame, project the exploded part's world position to screen coords:
const projected = part.userData.explodeTarget.clone()
.add(robotGroup.position)
.project(camera);
const x = (projected.x * 0.5 + 0.5) * canvasWidth;
const y = (-projected.y * 0.5 + 0.5) * canvasHeight;

Then position the annotation div near (x, y) and draw an SVG line
from the part position to the label box.

Fade annotations: opacity = easeInOutCubic(smoothstep(0.20, 0.45, progress))
During reassembly phase (>0.75): fade back out

Annotation CSS (Apple-style minimal):
.annotation { position: absolute; pointer-events: none; opacity: 0;
transition: opacity 0.3s; }
.annotation-title { display: block; color: #ffffff; font-size: 0.85rem;
font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.annotation-desc { display: block; color: rgba(255,255,255,0.45);
font-size: 0.72rem; letter-spacing: 0.04em; margin-top: 0.2rem; }
.annotation-line { width: 40px; height: 1px; background: rgba(201,168,76,0.6); }
/* For right-anchor labels, flip the line to the other side */

SVG overlay for lines:
Place a <svg id="annotation-svg"> absolutely over the canvas, same size.
Each frame draw lines from projected 3D position → label box corner.
Use amber stroke rgba(201,168,76,0.5), stroke-width 1, no fill.

=== REASSEMBLY MOMENT (Phase 3) ===
When progress > 0.75, parts lerp back to homePosition.
At progress = 0.95, show a centered text overlay that fades in:

  <div id="reassembly-text">
    <p>Every part.</p>
    <p class="accent">One purpose.</p>
  </div>

Style: large, centered, white/amber, same font as rest of site.
Fade out as progress returns to 0 if user scrolls back up.

=== LIGHTING ===
1. AmbientLight:     #1a1a2e, intensity 0.7
2. DirectionalLight: #ffffff, intensity 1.3, pos (4, 6, 3), castShadow true
3. PointLight amber: #c9a84c, intensity 2.5, pos (0, 4, 0)
4. PointLight blue:  #4466ff, intensity 0.4, pos (-4, 1, -3)
5. HemisphereLight:  sky #1a1a3e, ground #000000, intensity 0.5

Renderer:
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

=== MOBILE HANDLING ===
On screens < 768px:
- Explosion offsets scale to 60% (multiply all by 0.6) so parts don't
  leave the viewport on small screens
- Annotations: show only title, hide description text
- Scroll cue hint changes to "SWIPE TO EXPLORE"
- Particle count reduced to 40

=== LOADING SCREEN ===
  <div id="robot-loader">
    <div class="loader-inner">
      <div class="loader-ring"></div>
      <div id="loader-percent">0%</div>
      <div class="loader-label">Initialising…</div>
    </div>
  </div>

Progress: xhr.loaded / xhr.total * 100 → update #loader-percent
If xhr.total === 0: pulse the ring, show "Loading…" without percentage
On load complete: fade out over 0.8s, then set display:none, start hero animation

=== SECTION STRUCTURE IN index.html ===

Replace the existing content area (keep nav + footer) with:

  <!-- HERO + SCROLL EXPERIENCE -->
  <div id="scroll-experience">
    <div id="canvas-sticky-wrapper">
      <canvas id="robot-canvas"></canvas>
      <div id="robot-loader">…</div>
      <div id="hero-text">
        <p class="hero-eyebrow">ROBOCUP JUNIOR 2VS2 LIGHTWEIGHT</p>
        <h1>BOHLEBOTS<br><span class="accent">POMPEII</span></h1>
        <p class="hero-sub">Built from scratch. Competing in 2026.</p>
        <div class="scroll-cue">
          <div class="scroll-line"></div>
          <span>SCROLL TO EXPLORE</span>
        </div>
      </div>
      <div id="annotations">
        <svg id="annotation-svg"></svg>
        <!-- annotation divs injected by JS -->
      </div>
      <div id="reassembly-text" style="opacity:0">
        <p>Every part.</p>
        <p class="accent">One purpose.</p>
      </div>
    </div>
    <div id="scroll-driver" style="height:400vh;"></div>
  </div>

  <!-- REST OF SITE CONTINUES BELOW -->
  <section id="about">…existing content…</section>

#canvas-sticky-wrapper:
position: sticky; top: 0; height: 100vh; width: 100%;
overflow: hidden;
background: linear-gradient(135deg, #06060f 0%, #0a0a1e 50%, #050510 100%);

=== NAV CHANGES ===
Keep existing nav. No new nav link needed — this IS the homepage now.

=== OUTPUT FORMAT ===
1. Complete modified index.html — the full file
2. Summary of all changes made
3. Note about the keyword-matching fallback: if the GLB node names don't match
   the keywords, instruct the developer to open the browser console and run:
   scene.traverse(n => n.isMesh && console.log(n.name))
   Then update the keywords array to match the actual exported node names
   from Fusion 360.

=== CONSTRAINTS ===
- No npm, no bundler, no React — pure HTML/CSS/JS
- No localStorage or sessionStorage
- CDN only for external scripts
- GitHub Pages compatible
- DO NOT use CapsuleGeometry (not in Three.js r128)
- Keep footer intact