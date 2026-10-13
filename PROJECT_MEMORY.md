# PROJECT MEMORY: Interactive 3D Exploding Skull & Dentition Atlas ("Within · The Human Skull")

**Project Name:** Within · The Human Skull (Beauchene Disarticulation Atlas)  
**Author:** Professor Ameet Vaman Revankar (drameetr@gmail.com)  
**Entity:** DenMed AI  

### 🔗 Project Access URLs
- **Local Development URL:** [http://localhost:5173/](http://localhost:5173/) (Run locally via `npm run dev`)
- **GitHub Repository URL:** [https://github.com/drameet/skull-atlas](https://github.com/drameet/skull-atlas)
- **Live Production URL (GitHub Pages):** [https://drameet.github.io/skull-atlas/](https://drameet.github.io/skull-atlas/)

**Inspiration:** [@kirallik's *Within · The Human Head*](https://bubblik525.github.io/head/human-head-anatomy.html) & Professor Revankar's 1st BDS anatomical journey at KMC Hubli.

---

## 1. Executive Summary & Clinical Paradigm

This project delivers a 50-structure interactive 3D WebGL anatomical atlas inspired by classical Beauchene disarticulation preparations. It bridges a critical educational gap: visualizing deep cranial structures (e.g., vomer, sphenoid pterygoid plates, ethmoid cribriform plate, palatines) and permanent root-socket morphology without physical skull destruction.

The entire web application runs client-side with zero backend dependencies, packaged into a single **4.14 MB** 3D container, and is deployed globally for free via GitHub Pages.

---

## 2. Anatomical Structure Inventory (50 Units)

Every mesh is derived from the **BodyParts3D 4.0** donor dataset (DBCLS Japan, CC BY-SA 2.1 Japan) mapped to Foundational Model of Anatomy (FMA) identifiers:

### A. 22 Craniofacial Bones
- **Neurocranium (8 bones)**:
  - Sphenoid Bone (`FJ3394.obj`, FMA52736) — **Central anchor at origin $[0, 0, 0]$**
  - Frontal Bone (`FJ3200.obj`, FMA52734)
  - Occipital Bone (`FJ3309.obj`, FMA52735)
  - Right Parietal Bone (`FJ3380.obj`, FMA52788) & Left Parietal Bone (`FJ3274.obj`, FMA52789)
  - Right Temporal Bone (`FJ3386.obj`, FMA52738) & Left Temporal Bone (`FJ3281.obj`, FMA52739)
  - Ethmoid Bone (`FJ3199.obj`, FMA52737)
- **Viscerocranium (14 bones)**:
  - Right Maxilla (`FJ3375.obj`, FMA52748) & Left Maxilla (`FJ3269.obj`, FMA52749)
  - Mandible (`FJ3289.obj`, FMA52747)
  - Right Zygomatic (`FJ3392.obj`, FMA52750) & Left Zygomatic (`FJ3287.obj`, FMA52751)
  - Right Nasal (`FJ3378.obj`, FMA52756) & Left Nasal (`FJ3272.obj`, FMA52757)
  - Right Palatine (`FJ3379.obj`, FMA52752) & Left Palatine (`FJ3273.obj`, FMA52753)
  - Right Lacrimal (`FJ3371.obj`, FMA52754) & Left Lacrimal (`FJ3265.obj`, FMA52755)
  - Right Inferior Concha (`FJ3369.obj`, FMA52758) & Left Inferior Concha (`FJ3263.obj`, FMA52759)
  - Vomer (`FJ3395.obj`, FMA52760)

### B. 28 Secondary Permanent Teeth (`isa_BP3D_4.0_obj_99`)
*Note: BodyParts3D PART-OF tree (macro-skeleton) omitted teeth; they are located in the IS-A tree (`isa_BP3D_4.0_obj_99`).*
- **Maxillary Arch (14 teeth)**:
  - Q1 (Upper Right): 11 (`FJ1279`), 12 (`FJ1280`), 13 (`FJ1281`), 14 (`FJ1277`), 15 (`FJ1278`), 16 (`FJ1276`), 17 (`FJ1275`)
  - Q2 (Upper Left): 21 (`FJ1265`), 22 (`FJ1266`), 23 (`FJ1267`), 24 (`FJ1262`), 25 (`FJ1264`), 26 (`FJ1261`), 27 (`FJ1263`)
- **Mandibular Arch (14 teeth)**:
  - Q3 (Lower Left): 31 (`FJ1258`), 32 (`FJ1259`), 33 (`FJ1260`), 34 (`FJ1255`), 35 (`FJ1257`), 36 (`FJ1254`), 37 (`FJ1256`)
  - Q4 (Lower Right): 41 (`FJ1272`), 42 (`FJ1273`), 43 (`FJ1274`), 44 (`FJ1269`), 45 (`FJ1271`), 46 (`FJ1268`), 47 (`FJ1270`)

---

## 3. Mathematical Coordinate Transformation & Kinematics

### A. Coordinate System Alignment
BodyParts3D uses a raw scanner coordinate frame ($X$ lateral, $Y$ posterior negative, $Z$ superior). The Sphenoid bone centroid $[-0.499, -118.089, 1517.484]\text{ mm}$ was anchored at $[0, 0, 0]$.

The transformation matrix $T_{rot}$ maps BP3D into standard Three.js space ($X$ right/left, $Y$ superior up, $Z$ anterior forward):
$$
T_{rot} = \begin{bmatrix}
1.0 & 0.0 & 0.0 & -X_{sphenoid} \\
0.0 & 0.0 & 1.0 & -Z_{sphenoid} \\
0.0 & -1.0 & 0.0 & +Y_{sphenoid} \\
0.0 & 0.0 & 0.0 & 1.0
\end{bmatrix}
$$

### B. Coupled Alveolar Socket Kinematics
During Beauchene disarticulation (depth $t \in [0, 1]$):
- **Bones**: Displaced along physiologically tuned vectors away from the Sphenoid anchor.
- **Teeth**: Inherit the full translation vector of their parent jaw bone (`right_maxilla`, `left_maxilla`, or `mandible`), plus a gentle vertical socket extrusion vector ($\pm 15\text{ mm}$):
  $$\vec{V}_{tooth\_maxillary} = \vec{V}_{maxilla} + [0, -15, 0]$$
  $$\vec{V}_{tooth\_mandibular} = \vec{V}_{mandible} + [0, +15, 0]$$
This preserves anatomical arch coherence while revealing root tips and alveolar bone margins simultaneously.

---

## 4. Web Application Architecture

- **Core**: HTML5, Vanilla CSS3 (glassmorphic editorial museum aesthetic, Cinzel + Inter + JetBrains Mono), Three.js WebGL.
- **Build Engine**: Vite 5 with `base: './'` for agnostic subdirectory hosting.
- **Shading Engine**:
  - *Bone Tint*: Individual anatomical hues, roughness `0.45`, metalness `0.02`.
  - *Porcelain*: High-key sculpture finish (`#f5ede3`).
  - *Wireframe*: Structural polyhedral inspection.
  - *Ghost / X-Ray*: Semi-translucent cortical bone (`opacity: 0.18`) with dense radiopaque teeth (`opacity: 0.85`), replicating a 3D dental panorex.
- **Tools**: Real-time raycasting inspection HUD, 6-direction camera presets, 3-axis dynamic clipping planes, instant search (by FDI number, universal notation, Latin name, or common name).

---

## 5. Playbook: Step-by-Step Guide for Creating Similar 3D Atlases

When creating future interactive 3D anatomy tools:

### Step 1: Anatomy Auditing & File Resolution
1. Do not assume file naming matches across different databases.
2. In BodyParts3D:
   - Check `partof_parts_list_e.txt` for structural organ systems.
   - Check `isa_parts_list_e.txt` for specific organ components (e.g. teeth, ossicles).
3. Verify OBJ headers programmatically by parsing `# English name :` to avoid incorrect mesh assignment.

### Step 2: Coordinate Space Centering & GLB Packaging
1. Identify a logical skeletal keystone (e.g., Sphenoid in skull, L3 in spine, Pelvis in lower limb).
2. Compute the reference anchor's 3D centroid.
3. Apply rigid transform $T_{rot}$ to convert scanner coordinate frame to standard WebGL coordinate space ($+Y$ Up, $+Z$ Forward).
4. Use `trimesh.Scene()` to consolidate all meshes into a single binary `.glb` file using `scene.export(file_type="glb")`.
   - *Result*: Compresses hundreds of megabytes of raw OBJs down to < 5 MB, enabling instant browser loads without multiple HTTP roundtrips.
5. Export a parallel `metadata.json` with IDs, anatomical classifications, Latin names, and pre-calculated disarticulation vectors.

### Step 3: Frontend WebGL Construction (Three.js + Vite)
1. Initialize Three.js scene, camera, ambient/key/rim lighting rig, and OrbitControls.
2. Fetch `metadata.json` and load `.glb` via `GLTFLoader`.
3. Store meshes in a Map keyed by `meta.id`, retaining `basePos` and `explodeVec`.
4. In the render loop, update positions via:
   `mesh.position.copy(basePos).addScaledVector(explodeVec, currentExplode);`
5. Enable `transparent: true` and conditionally toggle `depthWrite` when opacity drops below 0.85 to avoid sorting artifacts.

### Step 4: GitHub Pages Subpath Compatibility
In `vite.config.js`, set `base: './'`. In JavaScript asset fetching, use:
```javascript
const baseUrl = import.meta.env.BASE_URL || './';
const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
fetch(cleanBase + 'data/metadata.json');
```
This guarantees assets load properly under `https://<user>.github.io/<repo>/` without 404 errors.

### Step 5: Automated GitHub Pages Deployment Workflow
Create `.github/workflows/deploy.yml`:
- Trigger on `push: branches: ["main"]`
- Give `permissions: contents: read, pages: write, id-token: write`
- Steps: `actions/checkout@v4` -> `actions/setup-node@v4` -> `npm ci` -> `npm run build` -> `actions/upload-pages-artifact@v3 (path: ./dist)` -> `actions/deploy-pages@v4`.
- In GitHub repository settings, set **Pages > Source** to **GitHub Actions**.

---

## 6. Guided Tour Architecture & Implementation (8 Clinical Chapters)
- **Problem Resolved:** The "Guided tour" button in the header was dormant without active event binding or tour state.
- **Architectural Solution:**
  - Implemented an interactive 8-chapter museum walkthrough system (`TOUR_CHAPTERS` in `main.js`).
  - Added the glassmorphic `#tour-card` HUD featuring step pulse indicators (`CHAPTER 01 / 08`), smooth progress bars, anatomical kicking titles, clinical rationale, clickable featured structure tags, chapter jumping dots, auto-play with loop/pause timer, and bidirectional chapter stepping.
  - Seamless integration with Three.js camera tweening, disarticulation depth synchronization, and dynamic structure spotlighting (warm radiant emissive glow on featured bones while subtly dimming adjacent structures).
  - Mode switcher toggles between Dissect mode (free exploration) and Guided Tour mode cleanly with body class state management (`body.touring` vs `body.dissecting`).
  - **Closure Specificity Fix:** Enforced global `[hidden] { display: none !important; }`, `#tour-card[hidden] { display: none !important; }`, and inline `style.display = 'none'` upon `exitTour()` to prevent CSS ID selector specificity from overriding the `hidden` attribute. Closed state verified via browser automation.
  - **LHS Structure Tree Restoration:** Enabled default open visibility for the LHS bone menu (`#tree-panel`, "SYSTEMS, BONES & TEETH") in Dissect mode with active header button (`#tree-toggle`, "Layers & parts ☷"). Configured clean mutual coexistence where entering Guided Tour hides the bone tree in favor of `#tour-card`, and returning to Dissect mode restores the bone tree on the LHS immediately.
  - **High-Res Snapshot Export Pipeline & Direct Disk Persistence (2560×1440 QHD):**
    - Addressed browser download sandbox drops where synthetic `a.click()` on short-lived blob URLs failed to persist to disk without user confirmation.
    - Built the **Snapshot Preview Modal (`#snapshot-dialog`)** displaying the generated 2.5K image preview, format specifications (`32-Bit Lossless PNG`, `2560 × 1440 px`, `Lossless Antialiased`), and three instant action buttons:
      1. `⬇ Download PNG File`: Direct user-clickable download link immune to browser popup/download blocking.
      2. `📋 Copy to Clipboard`: 1-click clipboard writing via `navigator.clipboard.write([new ClipboardItem({'image/png': blob})])` for instant pasting into PowerPoint/Word.
      3. `↗ View Full Size`: Opens the lossless QHD render in a new browser tab.
    - Integrated a local dev server persistence endpoint (`POST /api/save-snapshot` in `vite.config.js`) that automatically saves every rendered snapshot directly to the project workspace disk under `d:\partof_BP3D_4.0_obj_99\exports\Within_The_Human_Skull_Beauchene_<date>_<time>.png` (~2.84 MB).
    - Added 1-click access button `Snapshot 📷` (`#tool-snapshot`) directly on the main viewport `.view-tools` bar.

## 7. Sister Application: Stomatognathic Physiology 3D WebGL Lab
- **Repository:** [https://github.com/drameet/stomatognathic-physiology](https://github.com/drameet/stomatognathic-physiology)
- **Live Production URL:** [https://drameet.github.io/stomatognathic-physiology/](https://drameet.github.io/stomatognathic-physiology/)
- **Summary of Advances:**
  - Independent, dedicated GitHub Pages deployment with automated GitHub Actions CI/CD.
  - Interactive craniomandibular biomechanics coupling BodyParts3D v4.0 skeletal frames with validated ground truth from Hannam & Stavness (ArtiSynth / SimTK Dynamic Jaw Model).
  - 3D Posselt Envelope of Motion tracking incisal apex boundaries (Centric Relation, Habitual Occlusion, Maximum Opening, Protrusion, Left Lateral `pLL`, Right Lateral `pRL`).
  - Functional Occlusal Clench guidance presets (Incisal edge-to-edge, L-Canine, R-Canine, L-Molar, R-Molar) with real-time Class III lever mechanical advantage solving and bilateral TMJ compressive reaction vectors.
  - Multi-device responsive design supporting full desktop, iOS Safari touch gestures (`touch-action: none`, `TOUCH.ROTATE`, `TOUCH.DOLLY_PAN`), and Android Chrome viewports.
  - Author attribution integration with direct email (`mailto:drameetr@gmail.com`), official high-contrast LinkedIn badge, and WhatsApp community button.
  - Packaged 7.5s high-density demonstration video with synthesized ambient instrumental soundtrack (`stomatognathic_physiology_demo.mp4`) optimized for LinkedIn feed engagement algorithms.

## 8. Sister Application: Cleft Craniofacial Explorer (Case CL-01) & Surgical-Orthopedic Simulation Suite
- **Interactive Application URL:** [http://localhost:5173/cleft.html](http://localhost:5173/cleft.html)
- **Clinical Lead:** Professor Ameet Vaman Revankar (Senior Orthodontic Consultant AI-SOC Alliance Model).
- **Patient Case CL-01:** Complete Unilateral Left Cleft Lip and Palate (UCLP).
- **Core Clinical Simulations:**
  1. **Beauchene Disarticulation & Berkowitz Muscular Force Vectors:**
     - Dynamic separation of greater and lesser maxillae, zygoma, cranial vault, and mandible.
     - 5 Aberrant Muscular Sling Vectors (cleft and non-cleft orbicularis oris, septopremaxillary vomerine vector, buccinator, and levator veli palatini).
  2. **Secondary Alveolar Bone Grafting (SABG) Suite:**
     - Resorption overpacking slider ($0\% \to 130\%$, $2.24\text{ cm}^3$ harvest target for $1.72\text{ cm}^3$ defect).
     - Biological healing timeline scrubber (Day 0 to Month 12 cortical osteointegration).
     - Flanking permanent canine (Tooth 23) eruption corridor with vertex morphing and Bergland Type I / Chelsea Category A outcome.
  3. **Alt-RAMEC & Petit Reverse-Pull Facemask Biomechanical Simulator:**
     - **Eric Liou Protocol:** 5-cycle alternating rapid expansion and constriction (+7mm / -7mm weekly) uncoupling circummaxillary sutures (pterygomaxillary, zygomaticomaxillary, zygomaticotemporal).
     - **Custom CAD Modeling (Blender `bpy`):** Jackscrew expander (`alt_ramec.glb`) anchored to molar centroids on teeth 16, 14, 26, 24 with anterior extraoral hooks; Petit extraoral facemask (`facemask.glb`) with forehead pad, chin cup, and adjustable crossbar.
     - **Dynamic Orthopedic Traction:** Gold latex elastic tubes delivering $450\text{ g}$ downward and forward $25^\circ$ pull, stretching in real time as the maxilla achieves $0.0 \to 4.5\text{ mm}$ skeletal Le Fort I advancement.
     - Automated protraction loop with live A-point (+3.5 mm) and overjet (+2.5 mm) telemetry.

---

### 8.1 Session Milestone Refinements (2026-09-26)
1. **Full Hyrax Appliance Rectification:**
   - Corrected vertical depth collision (Z = -41.25 mm) to place the appliance cleanly into the oral palatal vault.
   - Modeled 4 hollow anatomical band sleeves with soldered buccal auxiliary tubes and brackets on teeth 16, 14, 26, 24.
   - Fabricated heavy 1.5 mm round stainless steel palatal connector framework and bilateral anterior vestibular extraoral traction hooks (1.8 mm retention spheres).
   - Applied polished orthodontic surgical stainless steel PBR material (#e2e8f0, metalness 0.96, roughness 0.12).
2. **Reverse-Pull Facemask Vertical Realignment:**
   - Translated the Petit facemask downward by delta Z = -14.0 mm.
   - Positioned chin cup at Z = -88.0 mm over the mandibular symphysis/menton, establishing >15 mm vertical clearance below the lower anterior incisors and eliminating tooth/alveolar overlap.
   - Lowered crossbar to Z = -58.0 mm (mouth/lower lip level) to enforce the textbook 25.5 deg forward-and-downward protraction vector.
3. **Viewport Ergonomics & Control Deck Layout:**
   - Moved bottom HUD control decks (.altramec-dock, .sabg-dock, .disarticulation-dock) from center to bottom-left (left: 1.25rem), completely freeing the central and right 65% of the viewport canvas.
   - Elevated .disarticulation-dock to bottom: 4.0rem (64 px from bottom edge) to eliminate clipping on laptop screens and scaled viewports. Companion docks set to bottom: 1.5rem.

### 8.2 Session Milestone Refinements (2026-09-27)
1. **HUD Elevation & Anti-Truncation Optimization:**
   - Elevated `.altramec-dock` and `.sabg-dock` from `bottom: 1.5rem` to `bottom: 4.5rem` ($72\text{ px}$ from bottom edge).
   - Elevated `.disarticulation-dock` from `bottom: 4.0rem` to `bottom: 6.5rem` ($104\text{ px}$ from bottom edge).
   - Added `max-height: calc(100vh - 120px); overflow-y: auto;` to eliminate any possible truncation from taskbars, browser chrome, or display scaling.
2. **Automated Lower Jaw & IAN Layer Hiding on Palatal Hyrax View:**
   - Implemented bidirectional synchronization via `setSegmentVisibility(id, visible)` in [`src/cleft.js`](file:///d:/partof_BP3D_4.0_obj_99/src/cleft.js).
   - When clicking `Palatal Hyrax ⊙` camera view (`dom.btnCamExpander`):
     - Automatically turns off `Mandible & Ramus` (`'mandible'`), `Mandibular Dentition` (`'lower_teeth'`), and `Inferior Alveolar Nerve Canal` (`'mandibular_canal'`).
     - Updates the "Layers & Parts" sidebar in real time: sets buttons to `─`, recalculates counter (`9 / 13 Active`), and grants an unobstructed occlusal inspection of the jackscrew and palatal framework.
   - When switching to `Facemask Profile ☩` (`dom.btnCamFacemask`) or `Suture Buttress` (`dom.btnCamSutures`):
     - Automatically restores mandibular anatomy and IAN canal to visible (`👁`), updating counter to `12 / 13 Active`.

3. **Pre-Op Anatomy Stage Return & Full Lateral Profile Orientation:**
   - When clicking `Pre-Op Anatomy` in the top stage switcher:
     - Automatically restores `Mandible & Ramus` (`'mandible'`), `Mandibular Dentition` (`'lower_teeth'`), and `Inferior Alveolar Nerve Canal` (`'mandibular_canal'`) to visible (`👁`), ensuring the lower jaw is never left hidden after inspecting the Alt-RAMEC palatal expander.
     - Automatically sets the 3D camera to the textbook Full Lateral (Profile) View (`target: [0, 25, -42], position: [-380, 25, -42]`), providing an unobstructed sagittal evaluation of the Class III craniofacial profile, maxillary retrusion, and mandibular symphysis.
     - Restores cutaneous facial drape to 38% opacity so both soft tissue profile and underlying skeletal bases are visible.

---

### 8.3 Session Milestone Refinements (2026-10-13): Mobile & Touch Optimization (iPhone 15 & Small Viewports)
1. **Touch Gesture Isolation & Orbit Controls:**
   - Single-finger drag configured for smooth spherical orbit (`TOUCH.ROTATE`).
   - Two-finger pinch and drag configured for dolly zoom and pan (`TOUCH.DOLLY_PAN`).
   - Added `touch-action: none` to the 3D WebGL canvas to eliminate unwanted native Safari scrolling and pull-to-refresh interference.
   - Introduced a drag-detection threshold ($> 7\text{ px}$ or $> 500\text{ ms}$) in raycasting to ensure orbiting the skull never triggers false-positive bone selections.
2. **Fixed Header & iOS Safe-Area Padding (`env(safe-area-inset-top)`):**
   - Locked the header ribbon with `position: fixed; top: 0; left: 0; right: 0; z-index: 100` and `background: rgba(10, 14, 19, 0.96)`.
   - Added `viewport-fit=cover` to `<meta name="viewport">` and integrated `env(safe-area-inset-top)` to prevent the top navigation bar from hiding beneath the Safari URL pill or Dynamic Island on iPhone 15.
   - Truncated the brand title cleanly on compact screens and converted header button labels to responsive short spans (`Layers ☷` and `Display ◈`) to fit within $393\text{px}$ viewports with zero horizontal clipping.
3. **Drawer Mutuality & Unobstructed 3D Stage on Mobile:**
   - Configured `#tree-panel` to start collapsed by default on screens $< 768\text{px}$ so the 3D skull is immediately in view upon page load.
   - Wired mutual drawer exclusion: opening `Layers ☷` closes `Display ◈`, and opening `Display ◈` closes `Layers ☷`.
4. **Viewport Tool Ergonomics & Camera Angles Unblocking:**
   - Relocated rendering mode pills (`Orbit`, `Wireframe`, `Ghost / X-Ray`, `Snapshot`) to the top right quadrant below the brand watermark.
   - Dedicated the bottom toolbar exclusively to the 6 camera angle presets (`Perspective`, `Front`, `Side`, `Back`, `Superior`, `Base`), eliminating all previous overlapping pill collisions.
   - Styled the `#detail` HUD card to slide up cleanly above the camera bar when individual bones (e.g. Sphenoid) are isolated.
5. **Live Deployment:**
   - Production bundle compiled with Vite and deployed live via GitHub Actions to [https://drameet.github.io/skull-atlas/](https://drameet.github.io/skull-atlas/).

---

## Session Milestone Summary (Saved at 2026-10-13 16:10 IST)
- **Status:** Mobile and iPhone 15 responsive system, touch orbit gestures, safe-area headers, mutual drawer toggling, and camera angle toolbar ergonomics fully implemented, validated, and live in production.
- **Active URLs & Dev Server:**
  - Live Production Atlas: [https://drameet.github.io/skull-atlas/](https://drameet.github.io/skull-atlas/)
  - Local Dev Server: [http://localhost:5173/](http://localhost:5173/)
- **Key Files Modified in Session:**
  - `src/main.js`: OrbitControls touch bindings, tap-vs-drag raycast thresholds, responsive camera FOV ($48^\circ$ mobile vs $36^\circ$ desktop), mutual drawer state management.
  - `src/style.css`: Fixed header ribbon with iOS safe area top/bottom insets, mobile slide-up sheets for `#tree-panel` and `#display-panel`, top-right `.view-tools` placement, dedicated bottom `.angles` toolbar.
  - `index.html`: `viewport-fit=cover` meta tag, responsive `.btn-text-full` / `.btn-text-short` spans on header buttons.
- **Next Session Resume Priorities:**
  1. Continue expanding deep cranial feature labeling or interactive cephalometric plane slices.
  2. Implement any additional clinical case studies or disarticulation animation presets as directed by Professor Revankar.

---

*For Professor Revankar's Clinical Validation.*
