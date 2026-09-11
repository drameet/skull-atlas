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

*For Professor Revankar's Clinical Validation.*
