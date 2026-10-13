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
  isCameraTweening: false,
  isTourMode: false,
  tourIndex: 0,
  tourAutoplay: false,
  tourTimer: null
};

// DOM Elements
const canvas = document.getElementById('canvas');
const loadingEl = document.getElementById('loading');
const depthSlider = document.getElementById('depth-slider');
const percentageEl = document.getElementById('percentage');
const playBtn = document.getElementById('play-btn');
const resetBtn = document.getElementById('reset-btn');
const modeTourBtn = document.getElementById('mode-tour');
const modeDissectBtn = document.getElementById('mode-dissect');
const tourCard = document.getElementById('tour-card');
const tourExitBtn = document.getElementById('tour-exit');
const tourStepNum = document.getElementById('tour-step-num');
const tourProgressFill = document.getElementById('tour-progress-fill');
const tourChapterSubtitle = document.getElementById('tour-chapter-subtitle');
const tourChapterTitle = document.getElementById('tour-chapter-title');
const tourChapterDesc = document.getElementById('tour-chapter-desc');
const tourChapterTags = document.getElementById('tour-chapter-tags');
const tourPrevBtn = document.getElementById('tour-prev-btn');
const tourNextBtn = document.getElementById('tour-next-btn');
const tourAutoplayBtn = document.getElementById('tour-autoplay-btn');
const tourDotsContainer = document.getElementById('tour-dots');
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
const toolSnapshotBtn = document.getElementById('tool-snapshot');
const snapshotDialog = document.getElementById('snapshot-dialog');
const snapshotCloseBtn = document.getElementById('snapshot-close');
const snapshotImg = document.getElementById('snapshot-img');
const snapshotSpinner = document.getElementById('snapshot-spinner');
const snapshotDiskNotice = document.getElementById('snapshot-disk-notice');
const snapshotDiskPath = document.getElementById('snapshot-disk-path');
const snapshotDownloadLink = document.getElementById('snapshot-download-link');
const snapshotCopyBtn = document.getElementById('snapshot-copy-btn');
const snapshotTabLink = document.getElementById('snapshot-tab-link');
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
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN
};

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

      // On mobile screens (< 768px), start with tree panel collapsed so 3D skull is immediately visible
      if (window.innerWidth < 768) {
        if (treePanel) treePanel.hidden = true;
        if (treeToggle) treeToggle.classList.remove('active');
      }
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
  if (!treePanel.hidden && displayPanel) {
    displayPanel.hidden = true;
    displayToggle.classList.remove('active');
  }
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
  if (!displayPanel.hidden && treePanel) {
    treePanel.hidden = true;
    treeToggle.classList.remove('active');
  }
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

// Helper: Synchronously convert base64 DataURL to real Binary Blob
function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/png';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

// High-Resolution Snapshot Export Pipeline (2560x1440 QHD with Studio Radial Composite & Direct Disk Persistence)
let currentSnapshotBlobUrl = null;

async function exportHighResPNG() {
  const triggerBtn = saveImageBtn || toolSnapshotBtn;
  const originalText = triggerBtn ? triggerBtn.textContent : 'Snapshot';
  if (triggerBtn) {
    triggerBtn.textContent = '⏳ Rendering 2.5K PNG…';
    triggerBtn.disabled = true;
  }

  // If snapshot dialog elements exist, show dialog and spinner
  if (snapshotDialog) {
    if (snapshotSpinner) snapshotSpinner.hidden = false;
    if (snapshotDiskNotice) snapshotDiskNotice.hidden = true;
    snapshotDialog.showModal();
  }

  try {
    const exportWidth = 2560;
    const exportHeight = 1440;

    // 1. Offscreen WebGL Renderer
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = exportWidth;
    offscreenCanvas.height = exportHeight;

    const exportRenderer = new THREE.WebGLRenderer({
      canvas: offscreenCanvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    exportRenderer.setSize(exportWidth, exportHeight, false);
    exportRenderer.setPixelRatio(1);
    exportRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    exportRenderer.toneMappingExposure = renderer.toneMappingExposure;
    exportRenderer.localClippingEnabled = renderer.localClippingEnabled;
    if (renderer.clippingPlanes && renderer.clippingPlanes.length > 0) {
      exportRenderer.clippingPlanes = renderer.clippingPlanes;
    }

    // 2. Clone camera with adjusted 16:9 aspect ratio
    const exportCamera = camera.clone();
    exportCamera.aspect = exportWidth / exportHeight;
    exportCamera.updateProjectionMatrix();

    // Render current 3D state synchronously
    exportRenderer.render(scene, exportCamera);

    // 3. Composite with Museum Studio Background & Typography
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = exportWidth;
    finalCanvas.height = exportHeight;
    const ctx = finalCanvas.getContext('2d');

    // Deep radial museum studio gradient
    const gradient = ctx.createRadialGradient(
      exportWidth * 0.5,
      exportHeight * 0.45,
      exportWidth * 0.05,
      exportWidth * 0.5,
      exportHeight * 0.45,
      exportWidth * 0.65
    );
    gradient.addColorStop(0, '#1c2635');
    gradient.addColorStop(0.65, '#0e1218');
    gradient.addColorStop(1, '#070a0e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, exportWidth, exportHeight);

    // Draw the 3D model
    ctx.drawImage(offscreenCanvas, 0, 0);

    // Editorial Museum Typography
    ctx.fillStyle = '#e8c99b';
    ctx.font = '600 24px "Cinzel", Georgia, serif';
    ctx.fillText('Within · The Human Skull', 60, 75);

    ctx.fillStyle = '#8c99a6';
    ctx.font = '500 12.5px "JetBrains Mono", monospace';
    ctx.fillText('BEAUCHENE DISARTICULATION ATLAS · BODYPARTS3D 4.0 ANATOMICAL GEOMETRY', 60, 102);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#e8c99b';
    ctx.font = '600 15px "Inter", sans-serif';
    ctx.fillText('DenMed AI · Prof. Ameet Vaman Revankar', exportWidth - 60, exportHeight - 65);

    ctx.fillStyle = '#7a8996';
    ctx.font = '400 12px "JetBrains Mono", monospace';
    ctx.fillText('drameetr@gmail.com · 50 Articulated Structures', exportWidth - 60, exportHeight - 42);

    exportRenderer.dispose();

    // 4. Binary Blob & URL Generation
    const dataURL = finalCanvas.toDataURL('image/png');
    const blob = dataURLtoBlob(dataURL);
    
    // Revoke previous blob URL if any
    if (currentSnapshotBlobUrl) {
      URL.revokeObjectURL(currentSnapshotBlobUrl);
    }
    currentSnapshotBlobUrl = URL.createObjectURL(blob);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    const filename = `Within_The_Human_Skull_Beauchene_${dateStr}_${timeStr}.png`;

    // 5. Update Snapshot Dialog
    if (snapshotImg) {
      snapshotImg.src = currentSnapshotBlobUrl;
    }
    if (snapshotSpinner) {
      snapshotSpinner.hidden = true;
    }
    if (snapshotDownloadLink) {
      snapshotDownloadLink.href = currentSnapshotBlobUrl;
      snapshotDownloadLink.setAttribute('download', filename);
    }
    if (snapshotTabLink) {
      snapshotTabLink.href = currentSnapshotBlobUrl;
    }

    // 6. Direct Clipboard Copy Handler
    if (snapshotCopyBtn) {
      snapshotCopyBtn.onclick = async () => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          snapshotCopyBtn.textContent = '✓ Copied to Clipboard!';
          setTimeout(() => {
            snapshotCopyBtn.textContent = '📋 Copy to Clipboard';
          }, 2500);
        } catch (clipErr) {
          console.warn('Clipboard write failed:', clipErr);
          snapshotCopyBtn.textContent = '⚠ Use Download PNG';
          setTimeout(() => {
            snapshotCopyBtn.textContent = '📋 Copy to Clipboard';
          }, 2500);
        }
      };
    }

    // 7. Persist directly to workspace disk via local API
    fetch('/api/save-snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataURL, filename })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && snapshotDiskPath && snapshotDiskNotice) {
          snapshotDiskPath.textContent = `Saved to disk: ${data.path}`;
          snapshotDiskNotice.hidden = false;
        }
      })
      .catch((err) => {
        console.warn('Server disk save endpoint error:', err);
      });

    // 8. Attempt automatic browser download
    if (snapshotDownloadLink) {
      snapshotDownloadLink.click();
    }

    if (triggerBtn) {
      triggerBtn.textContent = '✓ 2.5K PNG Ready!';
      setTimeout(() => {
        triggerBtn.textContent = originalText;
        triggerBtn.disabled = false;
      }, 2500);
    }
  } catch (err) {
    console.error('High-Res export error:', err);
    if (snapshotSpinner) snapshotSpinner.hidden = true;
    if (triggerBtn) {
      triggerBtn.textContent = '⚠ Export Failed';
      setTimeout(() => {
        triggerBtn.textContent = originalText;
        triggerBtn.disabled = false;
      }, 2500);
    }
  }
}

if (saveImageBtn) {
  saveImageBtn.addEventListener('click', exportHighResPNG);
}

if (toolSnapshotBtn) {
  toolSnapshotBtn.addEventListener('click', exportHighResPNG);
}

if (snapshotCloseBtn && snapshotDialog) {
  snapshotCloseBtn.addEventListener('click', () => {
    snapshotDialog.close();
  });
}

// Modal Dialog
notesOpenBtn.addEventListener('click', () => notesDialog.showModal());
notesCloseBtn.addEventListener('click', () => notesDialog.close());

// ==========================================
// GUIDED TOUR SYSTEM (8 Curated Chapters)
// ==========================================
const TOUR_CHAPTERS = [
  {
    title: "The Craniofacial Architecture",
    subtitle: "Beauchene Disarticulation · 50 Units",
    desc: "In classical anatomy, a Beauchene preparation preserves the relative spatial axes of all 22 cranial bones and 28 secondary teeth expanding outward from the skull base. This provides an unobstructed view of deep articular facets without destructive sectioning.",
    explode: 0.0,
    cameraPos: new THREE.Vector3(140, 60, 310),
    cameraTarget: new THREE.Vector3(0, 5, 0),
    highlights: [],
    autoRotate: false,
    tags: [
      { label: "22 Cranial Bones" },
      { label: "28 Secondary Teeth" },
      { label: "Beauchene Prep" }
    ]
  },
  {
    title: "The Sphenoid Keystone",
    subtitle: "Os sphenoidale · Central Coordinate Anchor [0, 0, 0]",
    desc: "Positioned at the geometric center of the cranial base, the Sphenoid articulates with 8 surrounding bones. Its central body houses the pituitary gland in the sella turcica, while the greater wings and pterygoid processes provide vital muscular anchorage for mastication.",
    explode: 0.22,
    cameraPos: new THREE.Vector3(35, 45, 170),
    cameraTarget: new THREE.Vector3(0, 0, 0),
    highlights: ["sphenoid_bone"],
    autoRotate: false,
    tags: [
      { label: "Sphenoid Bone", id: "sphenoid_bone" },
      { label: "Sella Turcica" },
      { label: "Pterygoid Plates" }
    ]
  },
  {
    title: "The Calvaria & Cranial Vault",
    subtitle: "Frontal, Parietals & Occipital · Protective Neurocranium",
    desc: "The neurocranial vault develops via intramembranous ossification. The coronal, sagittal, and lambdoid sutures absorb mechanical masticatory shocks and accommodate cerebral growth. Posteriorly, the occipital bone encloses the foramen magnum and articulates with the cervical spine (C1).",
    explode: 0.45,
    cameraPos: new THREE.Vector3(130, 200, 210),
    cameraTarget: new THREE.Vector3(0, 25, -15),
    highlights: ["frontal_bone", "right_parietal_bone", "left_parietal_bone", "occipital_bone"],
    autoRotate: false,
    tags: [
      { label: "Frontal Bone", id: "frontal_bone" },
      { label: "Right Parietal", id: "right_parietal_bone" },
      { label: "Left Parietal", id: "left_parietal_bone" },
      { label: "Occipital Bone", id: "occipital_bone" }
    ]
  },
  {
    title: "The Deep Cranial Core & Septum",
    subtitle: "Ethmoid, Vomer & Palatines · Nasal Architecture",
    desc: "Deep within the midface, the delicate ethmoid cribriform plate transmits olfactory nerve fascicles. Its perpendicular plate meets the vomer to form the bony nasal septum, while the bilateral L-shaped palatine bones complete the posterior hard palate and lateral nasal walls.",
    explode: 0.65,
    cameraPos: new THREE.Vector3(10, 20, 170),
    cameraTarget: new THREE.Vector3(0, 8, 10),
    highlights: ["ethmoid_bone", "vomer", "right_palatine_bone", "left_palatine_bone", "right_inferior_concha", "left_inferior_concha"],
    autoRotate: false,
    tags: [
      { label: "Ethmoid Bone", id: "ethmoid_bone" },
      { label: "Vomer", id: "vomer" },
      { label: "Palatine Bones", id: "right_palatine_bone" },
      { label: "Inferior Conchae", id: "right_inferior_concha" }
    ]
  },
  {
    title: "The Midface & Zygomatic Arches",
    subtitle: "Maxillae, Zygomatics & Nasals · Facial Projection",
    desc: "The paired maxillae anchor the upper dental arch and form the orbital floors and piriform aperture. Bilateral zygomatic bones define the cheek prominences and bridge to the temporal bones, completing the zygomatic arches that cradle the temporalis and masseter muscles.",
    explode: 0.50,
    cameraPos: new THREE.Vector3(160, 40, 200),
    cameraTarget: new THREE.Vector3(0, 10, 30),
    highlights: ["right_maxilla", "left_maxilla", "right_zygomatic_bone", "left_zygomatic_bone", "right_nasal_bone", "left_nasal_bone", "right_lacrimal_bone", "left_lacrimal_bone"],
    autoRotate: false,
    tags: [
      { label: "Right Maxilla", id: "right_maxilla" },
      { label: "Left Maxilla", id: "left_maxilla" },
      { label: "Zygomatic Bone", id: "right_zygomatic_bone" },
      { label: "Nasal Bones", id: "right_nasal_bone" }
    ]
  },
  {
    title: "The Mandibular Unit & TMJ",
    subtitle: "Mandibula · Sole Mobile Unit of the Head",
    desc: "The mandible houses the 14 lower secondary teeth. Its condylar heads articulate within the temporal glenoid fossae, forming the bilateral temporomandibular joints (TMJ) capable of complex ginglymoarthrodial motion (hinge rotation and translation).",
    explode: 0.55,
    cameraPos: new THREE.Vector3(110, -35, 190),
    cameraTarget: new THREE.Vector3(0, -30, 10),
    highlights: ["mandible", "right_temporal_bone", "left_temporal_bone"],
    autoRotate: false,
    tags: [
      { label: "Mandible", id: "mandible" },
      { label: "Temporomandibular Joints" },
      { label: "Temporal Bones", id: "right_temporal_bone" }
    ]
  },
  {
    title: "Secondary Dentition & Sockets",
    subtitle: "28 Permanent Teeth · Coupled Alveolar Kinematics",
    desc: "All 28 secondary teeth are modeled with coupled socket kinematics. Each tooth translates with its parent jaw bone while extruding vertically (±15 mm), revealing root apex morphologies, periodontal ligament spaces, and alveolar socket margins without tooth-socket collision.",
    explode: 0.70,
    cameraPos: new THREE.Vector3(75, -5, 150),
    cameraTarget: new THREE.Vector3(0, -8, 35),
    highlights: [],
    isTeethSpecial: true,
    autoRotate: false,
    tags: [
      { label: "14 Maxillary Teeth" },
      { label: "14 Mandibular Teeth" },
      { label: "Root Apices & Sockets" }
    ]
  },
  {
    title: "Beauchene Disarticulation Complete",
    subtitle: "All 50 Skeletal & Dental Units Suspended in Space",
    desc: "At 100% disarticulation, all 22 bones and 28 teeth hover suspended in 3D space along physiological trajectory vectors. Drag freely to orbit, zoom into deep suture surfaces, or click any individual unit to inspect its FMA classification.",
    explode: 1.00,
    cameraPos: new THREE.Vector3(180, 120, 280),
    cameraTarget: new THREE.Vector3(0, 0, 0),
    highlights: [],
    autoRotate: true,
    tags: [
      { label: "50 Articulated Units" },
      { label: "100% Disarticulation" },
      { label: "Drag to Orbit" }
    ]
  }
];

function applyTourHighlights(highlightIds = [], isTeethSpecial = false) {
  state.boneMap.forEach((item, id) => {
    const isTarget = highlightIds.includes(id) || (isTeethSpecial && item.meta.is_tooth);
    if (isTarget) {
      item.mesh.material.emissive.setHex(item.meta.is_tooth ? 0x2e2518 : 0x483620);
      item.mesh.material.roughness = item.meta.is_tooth ? 0.1 : 0.25;
      item.mesh.material.opacity = 1.0;
    } else {
      item.mesh.material.emissive.setHex(0x000000);
      item.mesh.material.roughness = item.meta.is_tooth ? 0.18 : 0.45;
      if (highlightIds.length > 0 || isTeethSpecial) {
        item.mesh.material.opacity = 0.55 * state.currentOpacity;
      } else {
        item.mesh.material.opacity = state.currentOpacity;
      }
    }
  });
}

function startTour(chapterIdx = 0) {
  state.isTourMode = true;
  document.body.classList.add('touring');
  document.body.classList.remove('dissecting');

  if (modeTourBtn) {
    modeTourBtn.classList.add('active');
    modeTourBtn.setAttribute('aria-pressed', 'true');
  }
  if (modeDissectBtn) {
    modeDissectBtn.classList.remove('active');
    modeDissectBtn.setAttribute('aria-pressed', 'false');
  }

  // Close other floating panels
  if (treePanel) {
    treePanel.hidden = true;
    treeToggle.classList.remove('active');
  }
  if (displayPanel) {
    displayPanel.hidden = true;
    displayToggle.classList.remove('active');
  }
  if (detailCard) detailCard.hidden = true;

  if (tourCard) {
    tourCard.hidden = false;
    tourCard.style.display = 'flex';
  }
  setTourChapter(chapterIdx);
}

function exitTour() {
  state.isTourMode = false;
  stopTourAutoplay();
  document.body.classList.remove('touring');
  document.body.classList.add('dissecting');

  if (modeTourBtn) {
    modeTourBtn.classList.remove('active');
    modeTourBtn.setAttribute('aria-pressed', 'false');
  }
  if (modeDissectBtn) {
    modeDissectBtn.classList.add('active');
    modeDissectBtn.setAttribute('aria-pressed', 'true');
  }

  if (tourCard) {
    tourCard.hidden = true;
    tourCard.style.display = 'none';
  }

  // Restore the LHS bone structure tree menu in Dissect mode
  if (treePanel) {
    treePanel.hidden = false;
    if (treeToggle) {
      treeToggle.classList.add('active');
      treeToggle.setAttribute('aria-expanded', 'true');
    }
  }

  controls.autoRotate = state.autoRotate;

  applyTourHighlights([]);
}

function setTourChapter(index) {
  if (index < 0) index = 0;
  if (index >= TOUR_CHAPTERS.length) index = TOUR_CHAPTERS.length - 1;
  state.tourIndex = index;

  const ch = TOUR_CHAPTERS[index];

  if (tourStepNum) {
    tourStepNum.textContent = `CHAPTER ${(index + 1).toString().padStart(2, '0')} / ${TOUR_CHAPTERS.length.toString().padStart(2, '0')}`;
  }
  if (tourProgressFill) {
    tourProgressFill.style.width = `${((index + 1) / TOUR_CHAPTERS.length) * 100}%`;
  }
  if (tourChapterSubtitle) tourChapterSubtitle.textContent = ch.subtitle;
  if (tourChapterTitle) tourChapterTitle.textContent = ch.title;
  if (tourChapterDesc) tourChapterDesc.textContent = ch.desc;

  if (tourChapterTags) {
    tourChapterTags.innerHTML = '';
    if (ch.tags) {
      ch.tags.forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'tour-tag';
        span.textContent = tag.label;
        if (tag.id) {
          span.title = `Inspect ${tag.label}`;
          span.addEventListener('click', (e) => {
            e.stopPropagation();
            selectBone(tag.id, true);
          });
        }
        tourChapterTags.appendChild(span);
      });
    }
  }

  renderTourDots();

  if (tourPrevBtn) {
    tourPrevBtn.disabled = index === 0;
    tourPrevBtn.style.opacity = index === 0 ? '0.4' : '1';
  }
  if (tourNextBtn) {
    tourNextBtn.textContent = index === TOUR_CHAPTERS.length - 1 ? 'Finish ↺' : 'Next →';
  }

  state.targetExplode = ch.explode;
  depthSlider.value = (ch.explode * 100).toFixed(1);
  updateActiveNavButton(ch.explode * 100);

  tweenCamera(ch.cameraPos.clone(), ch.cameraTarget.clone());

  controls.autoRotate = ch.autoRotate || state.autoRotate;
  if (ch.autoRotate) controls.autoRotateSpeed = 1.0;

  applyTourHighlights(ch.highlights || [], ch.isTeethSpecial || false);
}

function nextTourChapter() {
  if (state.tourIndex >= TOUR_CHAPTERS.length - 1) {
    setTourChapter(0);
  } else {
    setTourChapter(state.tourIndex + 1);
  }
}

function prevTourChapter() {
  if (state.tourIndex > 0) {
    setTourChapter(state.tourIndex - 1);
  }
}

function renderTourDots() {
  if (!tourDotsContainer) return;
  tourDotsContainer.innerHTML = '';
  TOUR_CHAPTERS.forEach((ch, idx) => {
    const dot = document.createElement('button');
    dot.className = `tour-dot ${idx === state.tourIndex ? 'active' : ''}`;
    dot.title = `Chapter ${idx + 1}: ${ch.title}`;
    dot.setAttribute('aria-label', `Go to Chapter ${idx + 1}`);
    dot.addEventListener('click', () => {
      stopTourAutoplay();
      setTourChapter(idx);
    });
    tourDotsContainer.appendChild(dot);
  });
}

function toggleTourAutoplay() {
  if (state.tourAutoplay) {
    stopTourAutoplay();
  } else {
    startTourAutoplay();
  }
}

function startTourAutoplay() {
  state.tourAutoplay = true;
  if (tourAutoplayBtn) {
    tourAutoplayBtn.textContent = '⏸ Pause';
    tourAutoplayBtn.classList.add('active');
  }

  clearInterval(state.tourTimer);
  state.tourTimer = setInterval(() => {
    if (state.tourIndex >= TOUR_CHAPTERS.length - 1) {
      setTourChapter(0);
    } else {
      nextTourChapter();
    }
  }, 9000);
}

function stopTourAutoplay() {
  state.tourAutoplay = false;
  if (tourAutoplayBtn) {
    tourAutoplayBtn.textContent = '▶ Play';
    tourAutoplayBtn.classList.remove('active');
  }
  if (state.tourTimer) {
    clearInterval(state.tourTimer);
    state.tourTimer = null;
  }
}

// Guided Tour Event Listeners
if (modeTourBtn) {
  modeTourBtn.addEventListener('click', () => {
    startTour(state.tourIndex);
  });
}

if (modeDissectBtn) {
  modeDissectBtn.addEventListener('click', () => {
    exitTour();
  });
}

if (tourExitBtn) {
  tourExitBtn.addEventListener('click', exitTour);
}

if (tourPrevBtn) {
  tourPrevBtn.addEventListener('click', () => {
    stopTourAutoplay();
    prevTourChapter();
  });
}

if (tourNextBtn) {
  tourNextBtn.addEventListener('click', () => {
    stopTourAutoplay();
    nextTourChapter();
  });
}

if (tourAutoplayBtn) {
  tourAutoplayBtn.addEventListener('click', toggleTourAutoplay);
}

// Canvas Tap / Click Raycaster (with drag threshold detection so touch orbiting doesn't trigger false selections)
let pointerDownPos = { x: 0, y: 0 };
let pointerDownTime = 0;

window.addEventListener('pointerdown', (e) => {
  pointerDownPos = { x: e.clientX, y: e.clientY };
  pointerDownTime = performance.now();
});

window.addEventListener('pointerup', (e) => {
  const dx = e.clientX - pointerDownPos.x;
  const dy = e.clientY - pointerDownPos.y;
  const dist = Math.hypot(dx, dy);
  const elapsed = performance.now() - pointerDownTime;

  // If user dragged more than 7px or held down longer than 500ms, it was an orbit/pan gesture, not a tap
  if (dist > 7 || elapsed > 500) return;

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

// Window Resize & Responsive Camera FOV
function handleResize() {
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;
  camera.aspect = w / h;
  // Increase FOV on portrait mobile screens so full skull remains in frame without clipping
  if (w < 768) {
    camera.fov = 48;
  } else {
    camera.fov = 36;
  }
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', handleResize);
handleResize();

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
