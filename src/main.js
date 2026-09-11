import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Application State
const state = {
  metadata: [],
  boneMap: new Map(), // id -> { mesh, meta, basePos, explodeVec }
  selectedBoneId: null,
  hoveredBoneId: null,
  targetExplode: 0.0,
  currentExplode: 0.0,
  autoplayProgress: 0.0,
  currentOpacity: 1.0,
  isPlaying: false,
  playDirection: 1,
  shadingMode: 'bone',
  clippingPlane: null,
  clippingAxis: 'off',
  clippingPos: 0,
  clippingInvert: false,
  autoRotate: false,
  cameraTarget: new THREE.Vector3(0, 0, 0),
  cameraTargetPos: new THREE.Vector3(0, 40, 320),
  isCameraTweening: false
};

// DOM Elements
const canvas = document.getElementById('canvas');
const loadingEl = document.getElementById('loading');
const depthSlider = document.getElementById('depth-slider');
const percentageEl = document.getElementById('percentage');
const playBtn = document.getElementById('play-btn');
const resetBtn = document.getElementById('reset-btn');
const treePanel = document.getElementById('tree-panel');
const treeToggle = document.getElementById('tree-toggle');
const treeClose = document.getElementById('tree-close');
const treeItems = document.getElementById('tree-items');
const treeOpacity = document.getElementById('tree-opacity');
const opacityValue = document.getElementById('opacity-value');
const showAllBtn = document.getElementById('show-all-bones');
const hideAllBtn = document.getElementById('hide-all-bones');
const filterBonesOnlyBtn = document.getElementById('filter-bones-only');
const filterTeethOnlyBtn = document.getElementById('filter-teeth-only');
const displayPanel = document.getElementById('display-panel');
const displayToggle = document.getElementById('display-toggle');
const displayClose = document.getElementById('display-close');
const surfaceModeSelect = document.getElementById('surface-mode');
const clippingModeSelect = document.getElementById('clipping-mode');
const clippingSliderGroup = document.getElementById('clipping-slider-group');
const clippingPosInput = document.getElementById('clipping-position');
const clippingInvertInput = document.getElementById('clipping-invert');
const saveImageBtn = document.getElementById('save-image');
const detailCard = document.getElementById('detail');
const closeDetailBtn = document.getElementById('close-detail');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const notesDialog = document.getElementById('notes-dialog');
const notesOpenBtn = document.getElementById('notes-open');
const notesCloseBtn = document.getElementById('notes-close');

// Three.js Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, window.innerWidth / (window.innerHeight - 160), 1, 2500);
camera.position.set(0, 30, 320);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.localClippingEnabled = true;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);
controls.maxDistance = 800;
controls.minDistance = 60;

// Lighting Rig
const ambientLight = new THREE.AmbientLight(0xfff7ea, 0.9);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xfff4e6, 0x1f2937, 0.6);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffedd5, 1.4);
keyLight.position.set(160, 220, 250);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xa5c9eb, 0.75);
fillLight.position.set(-180, -40, 160);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xd4b494, 1.1);
rimLight.position.set(0, 180, -220);
scene.add(rimLight);

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Load Metadata and GLB Model
async function initAtlas() {
  try {
    const baseUrl = import.meta.env.BASE_URL || './';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    const res = await fetch(cleanBase + 'data/skull_metadata.json');
    state.metadata = await res.json();

    const loader = new GLTFLoader();
    loader.load(cleanBase + 'models/skull_atlas.glb', (gltf) => {
      const root = gltf.scene;
      scene.add(root);

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          const meta = state.metadata.find((m) => m.id === child.name) || {
            id: child.name,
            name: child.name,
            color: '#d4b494',
            is_tooth: false
          };

          const isTooth = meta.is_tooth === true;
          // Configure Material with transparency and enamel/bone differentiation
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(meta.color),
            roughness: isTooth ? 0.18 : 0.45,
            metalness: isTooth ? 0.05 : 0.02,
            transparent: true,
            opacity: 1.0,
            depthWrite: true,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
          });
          child.material = mat;

          const basePos = child.position.clone();
          const explodeVec = meta.explode_vector
            ? new THREE.Vector3(...meta.explode_vector)
            : new THREE.Vector3();

          state.boneMap.set(child.name, {
            id: child.name,
            mesh: child,
            meta,
            basePos,
            explodeVec,
            originalColor: new THREE.Color(meta.color),
            visible: true
          });
        }
      });

      populateStructureTree();
      loadingEl.classList.add('fade-out');
      setTimeout(() => loadingEl.remove(), 500);
    });
  } catch (err) {
    console.error('Failed to initialize atlas:', err);
    loadingEl.innerHTML = `<p style="color:#ef4444">Error loading skull models</p>`;
  }
}

// Populate the Structure Tree
function populateStructureTree() {
  treeItems.innerHTML = '';
  const categories = {};

  state.metadata.forEach((m) => {
    if (!categories[m.category]) categories[m.category] = [];
    categories[m.category].push(m);
  });

  for (const [catName, bones] of Object.entries(categories)) {
    const header = document.createElement('div');
    header.className = 'tree-category-title';
    header.textContent = catName;
    treeItems.appendChild(header);

    bones.forEach((bone) => {
      const row = document.createElement('div');
      row.className = 'tree-row';
      row.id = `tree-row-${bone.id}`;

      const label = document.createElement('div');
      label.className = 'tree-label';
      const fdiBadge = bone.fdi ? `<span class="fdi-badge">#${bone.fdi}</span>` : '';
      label.innerHTML = `
        <span class="color-dot" style="background: ${bone.color}"></span>
        <span>${fdiBadge}${bone.name}</span>
      `;
      label.addEventListener('click', () => selectBone(bone.id, true));

      const switchLabel = document.createElement('label');
      switchLabel.className = 'switch';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      checkbox.addEventListener('change', (e) => {
        setBoneVisibility(bone.id, e.target.checked);
      });

      const sliderSpan = document.createElement('span');
      sliderSpan.className = 'slider';

      switchLabel.appendChild(checkbox);
      switchLabel.appendChild(sliderSpan);

      row.appendChild(label);
      row.appendChild(switchLabel);
      treeItems.appendChild(row);
    });
  }
  updateVisibleCount();
}

// Bone Visibility & Opacity
function setBoneVisibility(id, visible) {
  const item = state.boneMap.get(id);
  if (!item) return;
  item.visible = visible;
  item.mesh.visible = visible;

  const row = document.getElementById(`tree-row-${id}`);
  if (row) {
    row.classList.toggle('hidden-bone', !visible);
    const cb = row.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = visible;
  }
  updateVisibleCount();
}

function updateVisibleCount() {
  let count = 0;
  state.boneMap.forEach((b) => { if (b.visible) count++; });
  const el = document.getElementById('tree-visible');
  if (el) el.textContent = `${count} visible`;
  const scopeEl = document.getElementById('scope-count');
  if (scopeEl) scopeEl.textContent = `${state.boneMap.size} structures`;
}

// Select Bone and Display Detail HUD
function selectBone(id, centerCam = false) {
  state.selectedBoneId = id;
  const item = state.boneMap.get(id);

  if (!item) {
    detailCard.hidden = true;
    return;
  }

  // Update detail card
  document.getElementById('detail-category').textContent = item.meta.category.toUpperCase();
  document.getElementById('detail-name').textContent = item.meta.name;
  document.getElementById('detail-latin').textContent = item.meta.latin || '';
  document.getElementById('detail-fma').textContent = item.meta.universal ? `${item.meta.universal} · ${item.meta.fma}` : (item.meta.fma || '');
  document.getElementById('detail-desc').textContent = item.meta.description || '';

  const isolateBtn = document.getElementById('btn-isolate');
  if (isolateBtn) {
    isolateBtn.textContent = item.meta.is_tooth ? 'Isolate Tooth' : 'Isolate Bone';
  }

  const articContainer = document.getElementById('detail-articulations');
  articContainer.innerHTML = '';
  if (item.meta.articulations && item.meta.articulations.length > 0) {
    item.meta.articulations.forEach((art) => {
      const tag = document.createElement('span');
      tag.textContent = art;
      articContainer.appendChild(tag);
    });
  } else {
    articContainer.innerHTML = '<span>Independent skeletal unit</span>';
  }

  detailCard.hidden = false;

  // Highlight mesh
  state.boneMap.forEach((b) => {
    if (b.id === id) {
      b.mesh.material.emissive.setHex(0x382c1f);
      b.mesh.material.roughness = b.meta.is_tooth ? 0.12 : 0.25;
    } else {
      b.mesh.material.emissive.setHex(0x000000);
      b.mesh.material.roughness = b.meta.is_tooth ? 0.18 : 0.45;
    }
  });

  if (centerCam) {
    const worldPos = new THREE.Vector3();
    item.mesh.getWorldPosition(worldPos);
    tweenCamera(worldPos.clone().add(new THREE.Vector3(0, 15, 140)), worldPos);
  }
}

// Camera Tweening
function tweenCamera(pos, target) {
  state.cameraTargetPos.copy(pos);
  state.cameraTarget.copy(target);
  state.isCameraTweening = true;
}

// Disarticulation / Explode Animation Frame Update
function updateExplode(delta) {
  // Autoplay loop driven by elapsed time
  if (state.isPlaying) {
    const speed = 14.0; // percent per second (~7 seconds for full excursion)
    state.autoplayProgress += speed * delta * state.playDirection;
    if (state.autoplayProgress >= 100.0) {
      state.autoplayProgress = 100.0;
      state.playDirection = -1;
    } else if (state.autoplayProgress <= 0.0) {
      state.autoplayProgress = 0.0;
      state.playDirection = 1;
    }
    depthSlider.value = state.autoplayProgress.toFixed(1);
    state.targetExplode = state.autoplayProgress / 100.0;
    updateActiveNavButton(state.autoplayProgress);
  }

  // Smoothly lerp currentExplode towards targetExplode
  state.currentExplode += (state.targetExplode - state.currentExplode) * 0.15;
  const val = Math.round(state.currentExplode * 100);
  percentageEl.textContent = `${val.toString().padStart(2, '0')}%`;

  state.boneMap.forEach((item) => {
    item.mesh.position
      .copy(item.basePos)
      .addScaledVector(item.explodeVec, state.currentExplode);
  });
}

function updateActiveNavButton(progress) {
  const buttons = document.querySelectorAll('.depth-nav button');
  let activeIdx = 0;
  if (progress >= 85) activeIdx = 3;
  else if (progress >= 50) activeIdx = 2;
  else if (progress >= 15) activeIdx = 1;
  else activeIdx = 0;

  buttons.forEach((b, idx) => {
    b.classList.toggle('active', idx === activeIdx);
  });
}

// Clipping Planes Configuration
function updateClippingPlane() {
  const mode = clippingModeSelect.value;
  const val = parseFloat(clippingPosInput.value);
  const invert = clippingInvertInput.checked ? -1 : 1;

  if (mode === 'off') {
    renderer.clippingPlanes = [];
    clippingSliderGroup.hidden = true;
    state.clippingPlane = null;
    return;
  }

  clippingSliderGroup.hidden = false;
  let normal = new THREE.Vector3(1, 0, 0);

  if (mode === 'sagittal') normal.set(1 * invert, 0, 0);
  else if (mode === 'axial') normal.set(0, 1 * invert, 0);
  else if (mode === 'coronal') normal.set(0, 0, 1 * invert);

  // Range scaled to mm dimension of skull (-90 to +90)
  const constant = (val / 100.0) * 80.0 * invert;
  state.clippingPlane = new THREE.Plane(normal, constant);
  renderer.clippingPlanes = [state.clippingPlane];
}

// Surface Shading Modes
function setShadingMode(mode) {
  state.shadingMode = mode;
  state.boneMap.forEach((item) => {
    const mat = item.mesh.material;
    const isTooth = item.meta.is_tooth === true;
    if (mode === 'bone') {
      mat.color.copy(item.originalColor);
      mat.roughness = isTooth ? 0.18 : 0.45;
      mat.metalness = isTooth ? 0.05 : 0.02;
      mat.wireframe = false;
      mat.transparent = true;
      mat.opacity = state.currentOpacity;
      mat.depthWrite = state.currentOpacity >= 0.85;
    } else if (mode === 'porcelain') {
      mat.color.setHex(isTooth ? 0xffffff : 0xf5ede3);
      mat.roughness = isTooth ? 0.12 : 0.22;
      mat.metalness = 0.02;
      mat.wireframe = false;
      mat.transparent = true;
      mat.opacity = state.currentOpacity;
      mat.depthWrite = state.currentOpacity >= 0.85;
    } else if (mode === 'wireframe') {
      mat.color.setHex(isTooth ? 0xfffae6 : 0xd4b494);
      mat.wireframe = true;
      mat.transparent = true;
      mat.opacity = state.currentOpacity;
      mat.depthWrite = true;
    } else if (mode === 'ghost') {
      // In X-ray mode, teeth are more radiopaque (denser) than cortical bone
      mat.color.setHex(isTooth ? 0xf0f6ff : 0x8ea8b8);
      mat.roughness = 0.1;
      mat.wireframe = false;
      mat.transparent = true;
      mat.opacity = isTooth ? 0.85 * state.currentOpacity : 0.18 * state.currentOpacity;
      mat.depthWrite = false;
    }
  });
}

// Event Listeners
depthSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  state.targetExplode = val / 100.0;
  state.autoplayProgress = val;
  updateActiveNavButton(val);
});

// Chapter Buttons in Nav
document.querySelectorAll('.depth-nav button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const depth = parseFloat(btn.dataset.depth);
    depthSlider.value = depth;
    state.targetExplode = depth / 100.0;
    state.autoplayProgress = depth;
    updateActiveNavButton(depth);
  });
});

// Play / Reset
playBtn.addEventListener('click', () => {
  state.isPlaying = !state.isPlaying;
  playBtn.textContent = state.isPlaying ? '⏸ Pause' : '▶ Play Exploration';
  playBtn.style.color = state.isPlaying ? '#f0d8c0' : '';
  if (state.isPlaying) {
    state.autoplayProgress = parseFloat(depthSlider.value) || 0;
    if (state.autoplayProgress >= 99.0) state.playDirection = -1;
    else if (state.autoplayProgress <= 1.0) state.playDirection = 1;
  }
});

resetBtn.addEventListener('click', () => {
  state.isPlaying = false;
  state.autoplayProgress = 0;
  playBtn.textContent = '▶ Play Exploration';
  playBtn.style.color = '';
  depthSlider.value = 0;
  state.targetExplode = 0;
  updateActiveNavButton(0);
  tweenCamera(new THREE.Vector3(0, 30, 320), new THREE.Vector3(0, 0, 0));
});

// Structure Tree Toggles
treeToggle.addEventListener('click', () => {
  treePanel.hidden = !treePanel.hidden;
  treeToggle.classList.toggle('active', !treePanel.hidden);
});
treeClose.addEventListener('click', () => {
  treePanel.hidden = true;
  treeToggle.classList.remove('active');
});

showAllBtn.addEventListener('click', () => {
  state.boneMap.forEach((_, id) => setBoneVisibility(id, true));
});

hideAllBtn.addEventListener('click', () => {
  state.boneMap.forEach((_, id) => setBoneVisibility(id, false));
});

if (filterBonesOnlyBtn) {
  filterBonesOnlyBtn.addEventListener('click', () => {
    state.boneMap.forEach((item, id) => {
      setBoneVisibility(id, !item.meta.is_tooth);
    });
  });
}

if (filterTeethOnlyBtn) {
  filterTeethOnlyBtn.addEventListener('click', () => {
    state.boneMap.forEach((item, id) => {
      setBoneVisibility(id, item.meta.is_tooth === true);
    });
  });
}

treeOpacity.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value) / 100.0;
  state.currentOpacity = val;
  opacityValue.textContent = `${e.target.value}%`;
  state.boneMap.forEach((b) => {
    b.mesh.material.transparent = true;
    if (state.shadingMode === 'ghost') {
      b.mesh.material.opacity = 0.22 * val;
    } else {
      b.mesh.material.opacity = val;
    }
    b.mesh.material.depthWrite = val >= 0.85;
  });
});

// Display / Clipping Panel Toggles
displayToggle.addEventListener('click', () => {
  displayPanel.hidden = !displayPanel.hidden;
  displayToggle.classList.toggle('active', !displayPanel.hidden);
});
displayClose.addEventListener('click', () => {
  displayPanel.hidden = true;
  displayToggle.classList.remove('active');
});

surfaceModeSelect.addEventListener('change', (e) => setShadingMode(e.target.value));
clippingModeSelect.addEventListener('change', updateClippingPlane);
clippingPosInput.addEventListener('input', updateClippingPlane);
clippingInvertInput.addEventListener('change', updateClippingPlane);

// Top View Tools
document.getElementById('tool-orbit').addEventListener('click', (e) => {
  state.autoRotate = !state.autoRotate;
  e.target.classList.toggle('active', state.autoRotate);
  controls.autoRotate = state.autoRotate;
  controls.autoRotateSpeed = 2.0;
});

document.getElementById('tool-wireframe').addEventListener('click', (e) => {
  const active = e.target.classList.toggle('active');
  document.getElementById('tool-xray').classList.remove('active');
  setShadingMode(active ? 'wireframe' : 'bone');
  surfaceModeSelect.value = active ? 'wireframe' : 'bone';
});

document.getElementById('tool-xray').addEventListener('click', (e) => {
  const active = e.target.classList.toggle('active');
  document.getElementById('tool-wireframe').classList.remove('active');
  setShadingMode(active ? 'ghost' : 'bone');
  surfaceModeSelect.value = active ? 'ghost' : 'bone';
});

document.getElementById('tool-reset-cam').addEventListener('click', () => {
  tweenCamera(new THREE.Vector3(0, 30, 320), new THREE.Vector3(0, 0, 0));
});

// Camera Angle Presets
document.querySelectorAll('.angles button[data-angle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.angles button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const angle = btn.dataset.angle;
    if (angle === 'perspective') tweenCamera(new THREE.Vector3(180, 120, 260), new THREE.Vector3(0, 0, 0));
    else if (angle === 'front') tweenCamera(new THREE.Vector3(0, 10, 320), new THREE.Vector3(0, 0, 0));
    else if (angle === 'side') tweenCamera(new THREE.Vector3(320, 10, 0), new THREE.Vector3(0, 0, 0));
    else if (angle === 'back') tweenCamera(new THREE.Vector3(0, 20, -320), new THREE.Vector3(0, 0, 0));
    else if (angle === 'top') tweenCamera(new THREE.Vector3(0, 340, 20), new THREE.Vector3(0, 0, 0));
    else if (angle === 'base') tweenCamera(new THREE.Vector3(0, -340, 10), new THREE.Vector3(0, 0, 0));
  });
});

// Detail HUD Actions
closeDetailBtn.addEventListener('click', () => {
  detailCard.hidden = true;
  state.selectedBoneId = null;
  state.boneMap.forEach((b) => b.mesh.material.emissive.setHex(0x000000));
});

document.getElementById('btn-focus').addEventListener('click', () => {
  if (state.selectedBoneId) selectBone(state.selectedBoneId, true);
});

document.getElementById('btn-isolate').addEventListener('click', () => {
  if (!state.selectedBoneId) return;
  state.boneMap.forEach((b, id) => {
    setBoneVisibility(id, id === state.selectedBoneId);
  });
});

document.getElementById('btn-hide').addEventListener('click', () => {
  if (state.selectedBoneId) {
    setBoneVisibility(state.selectedBoneId, false);
    detailCard.hidden = true;
  }
});

document.getElementById('btn-restore').addEventListener('click', () => {
  state.boneMap.forEach((_, id) => setBoneVisibility(id, true));
});

// Search Filtering
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    searchResults.hidden = true;
    return;
  }

  const matches = state.metadata.filter(
    (m) =>
      m.name.toLowerCase().includes(query) ||
      (m.latin && m.latin.toLowerCase().includes(query)) ||
      (m.fma && m.fma.toLowerCase().includes(query)) ||
      (m.fdi && m.fdi.toString() === query) ||
      (m.universal && m.universal.toLowerCase().includes(query)) ||
      (m.tooth_type && m.tooth_type.toLowerCase().includes(query))
  );

  searchResults.innerHTML = '';
  if (matches.length > 0) {
    matches.forEach((m) => {
      const btn = document.createElement('button');
      btn.innerHTML = `${m.name} <small>${m.latin || m.fma}</small>`;
      btn.addEventListener('click', () => {
        selectBone(m.id, true);
        searchResults.hidden = true;
        searchInput.value = '';
      });
      searchResults.appendChild(btn);
    });
    searchResults.hidden = false;
  } else {
    searchResults.innerHTML = '<p style="padding:8px;font-size:10px;color:#7e8d9a">No matching bones found</p>';
    searchResults.hidden = false;
  }
});

// Snapshot Export
saveImageBtn.addEventListener('click', () => {
  renderer.render(scene, camera);
  const dataURL = renderer.domElement.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = `human_skull_beauchene_${new Date().toISOString().slice(0, 10)}.png`;
  a.click();
});

// Modal Dialog
notesOpenBtn.addEventListener('click', () => notesDialog.showModal());
notesCloseBtn.addEventListener('click', () => notesDialog.close());

// Canvas Click Raycaster
window.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  if (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  ) return;

  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const meshes = Array.from(state.boneMap.values())
    .filter((b) => b.visible)
    .map((b) => b.mesh);

  const intersects = raycaster.intersectObjects(meshes, false);
  if (intersects.length > 0) {
    const hitMesh = intersects[0].object;
    selectBone(hitMesh.name, false);
  }
});

// Window Resize
window.addEventListener('resize', () => {
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  updateExplode(delta);

  // Smooth Camera Tween
  if (state.isCameraTweening) {
    camera.position.lerp(state.cameraTargetPos, 0.08);
    controls.target.lerp(state.cameraTarget, 0.08);
    if (
      camera.position.distanceTo(state.cameraTargetPos) < 1.0 &&
      controls.target.distanceTo(state.cameraTarget) < 0.5
    ) {
      state.isCameraTweening = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

// Launch
initAtlas();
animate();
