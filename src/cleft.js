import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  ANATOMICAL_DOSSIERS,
  DISARTICULATION_VECTORS,
  MUSCLE_VECTORS,
  SABG_SIMULATION_CONFIG,
  ALTRANEC_SIMULATION_CONFIG
} from './berkowitzData.js';

// DOM Element References
const dom = {
  canvas: document.getElementById('canvas-3d'),
  stageContainer: document.getElementById('stage-container'),
  loadingOverlay: document.getElementById('loading-overlay'),
  loadingText: document.getElementById('loading-text'),
  loadingProgress: document.getElementById('loading-progress'),

  // Header Stage Buttons
  stageButtons: document.querySelectorAll('.stage-btn'),
  toolColorMode: document.getElementById('tool-color-mode'),
  toolWireframe: document.getElementById('tool-wireframe'),
  toolXray: document.getElementById('tool-xray'),
  toolResetCam: document.getElementById('tool-reset-cam'),
  toggleTelemetryBtn: document.getElementById('toggle-telemetry-btn'),
  toggleTreeBtn: document.getElementById('toggle-tree-btn'),

  // Floating HUD Panels
  hudDeck: document.getElementById('hud-deck'),
  treePanel: document.getElementById('tree-panel'),
  treeCloseBtn: document.getElementById('tree-close-btn'),
  treeItemsContainer: document.getElementById('tree-items-container'),
  visibleCount: document.getElementById('visible-count'),
  vectorLegend: document.getElementById('vector-legend'),

  // Filter Chips
  filterAll: document.getElementById('filter-all'),
  filterMaxilla: document.getElementById('filter-maxilla'),
  filterTeeth: document.getElementById('filter-teeth'),
  btnResetIsolation: document.getElementById('btn-reset-isolation'),

  // Sliders
  skinOpacitySlider: document.getElementById('skin-opacity-slider'),
  skinOpacityLabel: document.getElementById('skin-opacity-label'),
  boneOpacitySlider: document.getElementById('bone-opacity-slider'),
  boneOpacityLabel: document.getElementById('bone-opacity-label'),

  // Disarticulation Dock
  disarticulationDock: document.getElementById('disarticulation-dock'),
  sliderExplode: document.getElementById('slider-explode'),
  explodeBadge: document.getElementById('explode-percent-badge'),
  dockPresetBtns: document.querySelectorAll('.dock-preset-btn'),

  // SABG Surgical Suite Dock
  sabgDock: document.getElementById('sabg-dock'),
  sabgActiveSourceBadge: document.getElementById('sabg-active-source-badge'),
  sabgTabs: document.querySelectorAll('.sabg-tab-btn'),
  sabgTabContents: document.querySelectorAll('.sabg-tab-content'),
  sabgSourceChips: document.querySelectorAll('.source-chip'),
  sliderPacking: document.getElementById('slider-packing'),
  sabgVolDisplay: document.getElementById('sabg-vol-display'),
  sabgPackStatus: document.getElementById('sabg-pack-status'),
  timelineStepBtns: document.querySelectorAll('.timeline-step-btn'),
  sabgRemodeledVol: document.getElementById('sabg-remodeled-vol'),
  sabgDensityDisplay: document.getElementById('sabg-density-display'),
  sabgBerglandDisplay: document.getElementById('sabg-bergland-display'),
  sabgTimelineNotes: document.getElementById('sabg-timeline-notes'),
  sliderCanineEruption: document.getElementById('slider-canine-eruption'),
  btnAutoErupt: document.getElementById('btn-auto-erupt'),
  btnSabgCamCleft: document.getElementById('btn-sabg-cam-cleft'),
  btnSabgCamOcclusal: document.getElementById('btn-sabg-cam-occlusal'),
  btnSabgCamCanine: document.getElementById('btn-sabg-cam-canine'),
  sabgCanineDesc: document.getElementById('sabg-canine-desc'),

  // Alt-RAMEC & Facemask Dock
  altramecDock: document.getElementById('altramec-dock'),
  altramecTabs: document.querySelectorAll('.altramec-tab-btn'),
  altramecTabContents: document.querySelectorAll('.altramec-tab-content'),
  altramecWeekBtns: document.querySelectorAll('.altramec-week-btn'),
  altramecActiveCycleBadge: document.getElementById('altramec-active-cycle-badge'),
  sliderAltramecWidth: document.getElementById('slider-altramec-width'),
  altramecScrewWidth: document.getElementById('altramec-screw-width'),
  altramecModeDisplay: document.getElementById('altramec-mode-display'),
  altramecCycleNotes: document.getElementById('altramec-cycle-notes'),
  sliderProtractForce: document.getElementById('slider-protract-force'),
  protractForceVal: document.getElementById('protract-force-val'),
  sliderMaxillaAdvancement: document.getElementById('slider-maxilla-advancement'),
  protractAdvancementVal: document.getElementById('protract-advancement-val'),
  btnAutoProtract: document.getElementById('btn-auto-protract'),
  btnCamFacemask: document.getElementById('btn-cam-facemask'),
  btnCamExpander: document.getElementById('btn-cam-expander'),
  btnCamSutures: document.getElementById('btn-cam-sutures'),

  // Raycast Inspector Card
  inspectorCard: document.getElementById('inspector-card'),
  inspectorCloseBtn: document.getElementById('inspector-close-btn'),
  inspColorDot: document.getElementById('insp-color-dot'),
  inspName: document.getElementById('insp-name'),
  inspLatin: document.getElementById('insp-latin'),
  inspMorphology: document.getElementById('insp-morphology'),
  inspClinical: document.getElementById('insp-clinical'),
  inspVol: document.getElementById('insp-vol'),
  inspCortical: document.getElementById('insp-cortical'),
  btnIsolateCurrent: document.getElementById('btn-isolate-current'),
  btnFocusCurrent: document.getElementById('btn-focus-current')
};

// Application State
const state = {
  models: {},
  initialTransforms: {},
  materials: {},
  skinOpacity: 0.25,
  boneOpacity: 0.90,
  explodeFactor: 0.0,
  targetExplodeFactor: 0.0,
  colorMode: 'diagnostic', // 'diagnostic' | 'natural'
  isWireframe: false,
  isXray: false,
  isolatedId: null,
  selectedId: null,
  currentStage: 'pre_op',
  showMuscles: false,
  activeFilter: 'all',

  // SABG State
  sabgTab: 'packing',
  sabgDonorSource: 'iliac',
  sabgPackingDensity: 1.30,
  sabgTimelineStep: 'month6',
  canineEruptionFactor: 0.0,
  isAutoErupting: false,
  autoEruptStartTime: 0,
  lesserTeethMesh: null,
  lesserTeethOriginalPositions: null,
  graftClipPlane: null,
  canineCorridorGroup: null,

  // Alt-RAMEC State
  altramecTab: 'protocol',
  altramecWeek: 1,
  altramecWidthMm: 7.0,
  protractForceGrams: 450,
  maxillaAdvancementMm: 3.8,
  isAutoProtracting: false,
  autoProtractStartTime: 0,
  facemaskElasticGroup: null,
  elasticMeshes: {}
};

// Three.js Globals
let scene, camera, renderer, controls;
const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let muscleGroup = null;

// Clock for animation pulses
const clock = new THREE.Clock();

init();

async function init() {
  setupScene();
  setupLighting();
  setupEventListeners();
  await loadAllModels();
  setupMuscleVectors();
  setupSABGSimulation();
  setupAltRAMECSimulation();
  buildStructureTree();
  animate();
  hideLoading();
}

function setupScene() {
  scene = new THREE.Scene();

  const width = dom.stageContainer.clientWidth;
  const height = dom.stageContainer.clientHeight;

  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 3000);
  camera.up.set(0, 0, 1); // Anatomical Z-up

  renderer = new THREE.WebGLRenderer({
    canvas: dom.canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.localClippingEnabled = true;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;

  // Set default clinical camera viewing cleft and facial skeleton
  resetCameraView();

  window.addEventListener('resize', onWindowResize);
}

function resetCameraView() {
  // Focus camera directly on midfacial complex and alveolar cleft [0, 25, -46] (elevated above bottom dock)
  controls.target.set(0, 25, -46);
  // Position camera anteriorly (+Y in RAS) looking at the patient's face
  camera.position.set(0, 360, -22);
  controls.update();
}

function setupLighting() {
  const ambient = new THREE.AmbientLight(0xffffff, 0.72);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.45);
  keyLight.position.set(160, -220, 280);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.9);
  fillLight.position.set(-200, 180, 120);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x06b6d4, 0.65);
  rimLight.position.set(0, 260, -180);
  scene.add(rimLight);
}

function onWindowResize() {
  const width = dom.stageContainer.clientWidth;
  const height = dom.stageContainer.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

async function loadAllModels() {
  const modelDefs = [
    { id: 'cranial_vault', file: 'cranial_vault.glb', defaultColor: '#ede7d8', opacity: 0.85 },
    { id: 'greater_maxilla', file: 'greater_maxilla.glb', defaultColor: '#38bdf8', opacity: 0.90 },
    { id: 'greater_teeth', file: 'greater_teeth.glb', defaultColor: '#f1f5f9', opacity: 1.0 },
    { id: 'lesser_maxilla', file: 'lesser_maxilla.glb', defaultColor: '#fb923c', opacity: 0.90 },
    { id: 'lesser_teeth', file: 'lesser_teeth.glb', defaultColor: '#f1f5f9', opacity: 1.0 },
    { id: 'zygomatic_complex', file: 'zygomatic_complex.glb', defaultColor: '#34d399', opacity: 0.90 },
    { id: 'mandible', file: 'mandible.glb', defaultColor: '#d8b4fe', opacity: 0.85 },
    { id: 'lower_teeth', file: 'lower_teeth.glb', defaultColor: '#f1f5f9', opacity: 1.0 },
    { id: 'mandibular_canal', file: 'mandibular_canal.glb', defaultColor: '#ef4444', opacity: 0.95 },
    { id: 'graft_void', file: 'graft_void.glb', defaultColor: '#f43f5e', opacity: 0.85 },
    { id: 'skin', file: 'skin.glb', defaultColor: '#e0b89b', opacity: state.skinOpacity },
    { id: 'alt_ramec', file: 'alt_ramec.glb', defaultColor: '#c4cbd4', opacity: 1.0 },
    { id: 'facemask', file: 'facemask.glb', defaultColor: '#38bdf8', opacity: 1.0 }
  ];

  const total = modelDefs.length;
  let loaded = 0;

  for (const def of modelDefs) {
    dom.loadingText.textContent = `Loading ${def.id.replace('_', ' ')}…`;
    try {
      const gltf = await loadGLTFPromise(`/cases/patient_cleft/models/${def.file}`);
      const root = gltf.scene;

      const mat = createSegmentMaterial(def.id, def.defaultColor, def.opacity);
      state.materials[def.id] = mat;

      root.traverse((child) => {
        if (child.isMesh) {
          child.material = mat;
          child.userData.segmentId = def.id;
          child.castShadow = true;
          child.receiveShadow = true;

          if (def.id === 'lesser_teeth') {
            state.lesserTeethMesh = child;
            state.lesserTeethOriginalPositions = new Float32Array(child.geometry.attributes.position.array);
          }
          if (def.id === 'graft_void') {
            state.graftClipPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 58.0);
            child.material.clippingPlanes = [state.graftClipPlane];
            child.material.clipShadows = true;
          }
        }
      });

      root.userData.segmentId = def.id;
      // Alt-RAMEC and Facemask are hidden by default unless in alt_ramec stage
      if (def.id === 'alt_ramec' || def.id === 'facemask') {
        root.visible = false;
      }

      state.models[def.id] = root;
      scene.add(root);

      // Record initial transform for disarticulation and protraction interpolation
      state.initialTransforms[def.id] = {
        position: root.position.clone(),
        rotation: root.rotation.clone(),
        scale: root.scale.clone()
      };
    } catch (err) {
      console.warn(`Could not load ${def.file}:`, err);
    }

    loaded++;
    dom.loadingProgress.style.width = `${(loaded / total) * 100}%`;
  }
}

function loadGLTFPromise(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

function createSegmentMaterial(id, colorHex, opacity) {
  if (id === 'skin') {
    return new THREE.MeshStandardMaterial({
      color: 0xe0b89b,
      roughness: 0.65,
      metalness: 0.05,
      transparent: true,
      opacity: state.skinOpacity,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  }

  if (id === 'graft_void') {
    return new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.35,
      metalness: 0.2,
      emissive: 0x881337,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  }

  if (id === 'alt_ramec') {
    return new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Polished Orthodontic Surgical Steel
      metalness: 0.96,
      roughness: 0.12,
      transparent: false,
      depthWrite: true,
      side: THREE.DoubleSide
    });
  }

  if (id === 'facemask') {
    return new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.65,
      roughness: 0.35,
      transparent: false,
      side: THREE.DoubleSide
    });
  }

  const isTeeth = id.includes('teeth');
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: isTeeth ? 0.25 : 0.45,
    metalness: isTeeth ? 0.1 : 0.05,
    transparent: opacity < 1.0,
    opacity: opacity,
    depthWrite: opacity >= 0.8,
    side: THREE.DoubleSide
  });
}

// -------------------------------------------------------------
// Berkowitz Aberrant Muscular Force Vectors (3D Shaders/Tubes)
// -------------------------------------------------------------
function setupMuscleVectors() {
  muscleGroup = new THREE.Group();
  muscleGroup.name = 'BerkowitzMuscleVectors';

  for (const vec of MUSCLE_VECTORS) {
    const vStart = new THREE.Vector3(...vec.origin);
    const vEnd = new THREE.Vector3(...vec.target);
    const dir = new THREE.Vector3().subVectors(vEnd, vStart);
    const length = dir.length();
    dir.normalize();

    // Tube shaft
    const path = new THREE.LineCurve3(vStart, vEnd);
    const tubeGeo = new THREE.TubeGeometry(path, 16, 0.85, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(vec.color),
      emissive: new THREE.Color(vec.color),
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.2
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);

    // Arrow Cone Head
    const coneGeo = new THREE.ConeGeometry(2.4, 6.0, 16);
    const coneMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(vec.color),
      emissive: new THREE.Color(vec.color),
      emissiveIntensity: 0.6,
      roughness: 0.3
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);

    coneMesh.position.copy(vEnd);
    coneMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    const singleVecGroup = new THREE.Group();
    singleVecGroup.add(tubeMesh);
    singleVecGroup.add(coneMesh);
    singleVecGroup.userData = vec;

    muscleGroup.add(singleVecGroup);
  }

  muscleGroup.visible = state.showMuscles;
  scene.add(muscleGroup);
}

// -------------------------------------------------------------
// Beauchene Disarticulation (Exploded View Engine)
// -------------------------------------------------------------
function updateDisarticulation(factor) {
  state.explodeFactor = factor;

  for (const [id, vec] of Object.entries(DISARTICULATION_VECTORS)) {
    const root = state.models[id];
    const initial = state.initialTransforms[id];
    if (!root || !initial) continue;

    // Position interpolation
    root.position.x = initial.position.x + vec.pos[0] * factor;
    root.position.y = initial.position.y + vec.pos[1] * factor;
    root.position.z = initial.position.z + vec.pos[2] * factor;

    // Rotation interpolation
    root.rotation.x = initial.rotation.x + vec.rot[0] * factor;
    root.rotation.y = initial.rotation.y + vec.rot[1] * factor;
    root.rotation.z = initial.rotation.z + vec.rot[2] * factor;
  }

  // Synchronize Mandibular Dentition and Canal with Mandible
  const lowerTeeth = state.models['lower_teeth'];
  const mandible = state.models['mandible'];
  if (lowerTeeth && mandible && state.initialTransforms['lower_teeth']) {
    lowerTeeth.position.copy(mandible.position);
    lowerTeeth.rotation.copy(mandible.rotation);
  }

  const canal = state.models['mandibular_canal'];
  if (canal && mandible) {
    canal.position.copy(mandible.position);
    canal.rotation.copy(mandible.rotation);
  }

  // Update badge in UI
  const pct = Math.round(factor * 100);
  dom.explodeBadge.textContent = `${pct}%`;
  dom.sliderExplode.value = pct;
}

// -------------------------------------------------------------
// Structure Tree (Beauchene Layers & Parts)
// -------------------------------------------------------------
function buildStructureTree() {
  dom.treeItemsContainer.innerHTML = '';

  const order = [
    'greater_maxilla',
    'greater_teeth',
    'lesser_maxilla',
    'lesser_teeth',
    'zygomatic_complex',
    'cranial_vault',
    'mandible',
    'lower_teeth',
    'mandibular_canal',
    'graft_void',
    'alt_ramec',
    'facemask',
    'skin'
  ];

  for (const id of order) {
    const dossier = ANATOMICAL_DOSSIERS[id];
    if (!dossier) continue;

    const row = document.createElement('div');
    row.className = 'tree-row';
    row.dataset.id = id;

    const isVisible = state.models[id] ? state.models[id].visible : true;
    row.innerHTML = `
      <div class="tree-row-info">
        <span class="tree-color-swatch" style="background: ${dossier.color};"></span>
        <span class="tree-row-name">${dossier.name}</span>
      </div>
      <div class="tree-row-btns">
        <button class="tree-btn btn-solo" title="Solo/Isolate">Solo</button>
        <button class="tree-btn btn-vis ${isVisible ? 'active' : ''}" title="Toggle Visibility">${isVisible ? '👁' : '─'}</button>
      </div>
    `;

    // Click on info selects and opens inspector
    row.querySelector('.tree-row-info').addEventListener('click', () => {
      selectSegment(id);
    });

    // Toggle Visibility
    const visBtn = row.querySelector('.btn-vis');
    visBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSegmentVisibility(id, visBtn);
    });

    // Solo / Isolate
    const soloBtn = row.querySelector('.btn-solo');
    soloBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isolateSegment(id);
    });

    dom.treeItemsContainer.appendChild(row);
  }

  updateTreeCount();
}

function updateTreeCount() {
  let count = 0;
  for (const [id, model] of Object.entries(state.models)) {
    if (model.visible) count++;
  }
  dom.visibleCount.textContent = `${count} / ${Object.keys(state.models).length} Active`;
}

function toggleSegmentVisibility(id, btn) {
  const model = state.models[id];
  if (!model) return;
  model.visible = !model.visible;
  if (btn) {
    btn.classList.toggle('active', model.visible);
    btn.textContent = model.visible ? '👁' : '─';
  }
  updateTreeCount();
}

function setSegmentVisibility(id, visible) {
  const model = state.models[id];
  if (model) {
    model.visible = visible;
  }
  const row = document.querySelector(`.tree-row[data-id="${id}"]`);
  if (row) {
    const visBtn = row.querySelector('.btn-vis');
    if (visBtn) {
      visBtn.classList.toggle('active', visible);
      visBtn.textContent = visible ? '👁' : '─';
    }
  }
  updateTreeCount();
}

function isolateSegment(id) {
  if (state.isolatedId === id) {
    // Reset isolation
    state.isolatedId = null;
    for (const [mId, model] of Object.entries(state.models)) {
      model.visible = true;
    }
    document.querySelectorAll('.btn-solo').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.btn-vis').forEach(b => {
      b.classList.add('active');
      b.textContent = '👁';
    });
  } else {
    state.isolatedId = id;
    for (const [mId, model] of Object.entries(state.models)) {
      model.visible = (mId === id);
    }
    document.querySelectorAll('.tree-row').forEach(row => {
      const isTarget = row.dataset.id === id;
      const soloBtn = row.querySelector('.btn-solo');
      const visBtn = row.querySelector('.btn-vis');
      soloBtn.classList.toggle('active', isTarget);
      visBtn.classList.toggle('active', isTarget);
      visBtn.textContent = isTarget ? '👁' : '─';
    });
  }
  updateTreeCount();
  selectSegment(id);
}

// -------------------------------------------------------------
// Raycast Anatomical Inspection
// -------------------------------------------------------------
function setupRaycastInteraction() {
  dom.canvas.addEventListener('pointerdown', onPointerDown);
}

let pointerDownTime = 0;
let pointerDownPos = { x: 0, y: 0 };

function onPointerDown(e) {
  pointerDownTime = performance.now();
  pointerDownPos = { x: e.clientX, y: e.clientY };
  dom.canvas.addEventListener('pointerup', onPointerUp, { once: true });
}

function onPointerUp(e) {
  const elapsed = performance.now() - pointerDownTime;
  const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);

  // Consider it a click if under 280ms and small drag distance
  if (elapsed < 280 && dist < 5) {
    performRaycast(e);
  }
}

function performRaycast(e) {
  const rect = dom.canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const meshes = [];
  for (const [id, root] of Object.entries(state.models)) {
    if (!root.visible) continue;
    root.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });
  }

  const intersects = raycaster.intersectObjects(meshes, false);
  if (intersects.length > 0) {
    // Pick the first hit mesh
    const hitMesh = intersects[0].object;
    const segId = hitMesh.userData.segmentId;
    if (segId) {
      selectSegment(segId);
    }
  }
}

function selectSegment(id) {
  state.selectedId = id;
  const dossier = ANATOMICAL_DOSSIERS[id];
  if (!dossier) return;

  // Populate Inspector Card
  dom.inspColorDot.style.background = dossier.color;
  dom.inspName.textContent = dossier.name;
  dom.inspLatin.textContent = dossier.latinName;
  dom.inspMorphology.textContent = dossier.berkowitzMorphology;
  dom.inspClinical.textContent = dossier.clinicalSignificance;
  dom.inspVol.textContent = dossier.volumeEstimate;
  dom.inspCortical.textContent = dossier.corticalThickness;

  dom.inspectorCard.classList.remove('hidden');

  // Highlight row in tree
  document.querySelectorAll('.tree-row').forEach(r => {
    r.classList.toggle('selected', r.dataset.id === id);
  });
}

function focusCameraOnSegment(id) {
  const model = state.models[id];
  if (!model) return;

  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);

  controls.target.copy(center);
  controls.update();
}

// -------------------------------------------------------------
// Color Mode, Wireframe, & Visual Styling
// -------------------------------------------------------------
function toggleColorMode() {
  if (state.colorMode === 'diagnostic') {
    state.colorMode = 'natural';
    dom.toolColorMode.textContent = 'Palette: Natural ◈';
    dom.toolColorMode.classList.remove('active');
  } else {
    state.colorMode = 'diagnostic';
    dom.toolColorMode.textContent = 'Palette: Diagnostic ◈';
    dom.toolColorMode.classList.add('active');
  }

  updateAllMaterials();
}

function updateAllMaterials() {
  for (const [id, model] of Object.entries(state.models)) {
    const dossier = ANATOMICAL_DOSSIERS[id];
    if (!dossier) continue;

    let targetColor = dossier.color;
    if (state.colorMode === 'natural') {
      if (id === 'skin') targetColor = '#e0b89b';
      else if (id.includes('teeth')) targetColor = '#f8fafc';
      else if (id === 'mandibular_canal') targetColor = '#ef4444';
      else if (id === 'graft_void') targetColor = '#f43f5e';
      else targetColor = '#ede7d8'; // Natural Bone
    }

    model.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.color.set(targetColor);
        child.material.wireframe = state.isWireframe;
      }
    });
  }
}

// -------------------------------------------------------------
// Event Listeners & Clinical Stage Navigation
// -------------------------------------------------------------
function setupEventListeners() {
  setupRaycastInteraction();

  // Color mode
  dom.toolColorMode.addEventListener('click', toggleColorMode);

  // Wireframe
  dom.toolWireframe.addEventListener('click', () => {
    state.isWireframe = !state.isWireframe;
    dom.toolWireframe.classList.toggle('active', state.isWireframe);
    updateAllMaterials();
  });

  // X-ray / Ghost
  dom.toolXray.addEventListener('click', () => {
    state.isXray = !state.isXray;
    dom.toolXray.classList.toggle('active', state.isXray);
    const op = state.isXray ? 0.35 : state.boneOpacity;
    for (const [id, model] of Object.entries(state.models)) {
      if (id !== 'skin' && id !== 'graft_void') {
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = op;
          }
        });
      }
    }
  });

  // Reset Camera
  dom.toolResetCam.addEventListener('click', resetCameraView);

  // Panel Toggles
  dom.toggleTelemetryBtn.addEventListener('click', () => {
    dom.hudDeck.classList.toggle('hidden');
    dom.toggleTelemetryBtn.classList.toggle('active', !dom.hudDeck.classList.contains('hidden'));
  });

  dom.toggleTreeBtn.addEventListener('click', () => {
    dom.treePanel.classList.toggle('hidden');
    dom.toggleTreeBtn.classList.toggle('active', !dom.treePanel.classList.contains('hidden'));
  });

  dom.treeCloseBtn.addEventListener('click', () => {
    dom.treePanel.classList.add('hidden');
    dom.toggleTreeBtn.classList.remove('active');
  });

  // Inspector card actions
  dom.inspectorCloseBtn.addEventListener('click', () => {
    dom.inspectorCard.classList.add('hidden');
    state.selectedId = null;
    document.querySelectorAll('.tree-row').forEach(r => r.classList.remove('selected'));
  });

  dom.btnIsolateCurrent.addEventListener('click', () => {
    if (state.selectedId) isolateSegment(state.selectedId);
  });

  dom.btnFocusCurrent.addEventListener('click', () => {
    if (state.selectedId) focusCameraOnSegment(state.selectedId);
  });

  // Sliders: Skin & Bone Opacity
  dom.skinOpacitySlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value) / 100;
    state.skinOpacity = val;
    dom.skinOpacityLabel.textContent = `${Math.round(val * 100)}%`;
    if (state.models['skin']) {
      state.models['skin'].traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity = val;
          child.material.transparent = val < 1.0;
        }
      });
    }
  });

  dom.boneOpacitySlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value) / 100;
    state.boneOpacity = val;
    dom.boneOpacityLabel.textContent = `${Math.round(val * 100)}%`;
    for (const [id, model] of Object.entries(state.models)) {
      if (id !== 'skin' && id !== 'graft_void') {
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.opacity = val;
            child.material.transparent = val < 1.0;
          }
        });
      }
    }
  });

  // Disarticulation Slider
  dom.sliderExplode.addEventListener('input', (e) => {
    const factor = parseFloat(e.target.value) / 100;
    updateDisarticulation(factor);
    dom.dockPresetBtns.forEach(b => b.classList.remove('active'));
  });

  // Disarticulation Presets
  dom.dockPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.dockPresetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetVal = parseFloat(btn.dataset.explode) / 100;
      animateDisarticulationTo(targetVal);
    });
  });

  // Filter Chips
  dom.filterAll.addEventListener('click', () => applyFilter('all'));
  dom.filterMaxilla.addEventListener('click', () => applyFilter('maxilla'));
  dom.filterTeeth.addEventListener('click', () => applyFilter('teeth'));
  dom.btnResetIsolation.addEventListener('click', () => {
    state.isolatedId = null;
    for (const model of Object.values(state.models)) model.visible = true;
    document.querySelectorAll('.btn-solo').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.btn-vis').forEach(b => {
      b.classList.add('active');
      b.textContent = '👁';
    });
    updateTreeCount();
  });

  // Clinical Stage Buttons
  dom.stageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.stageButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setClinicalStage(btn.dataset.stage);
    });
  });

  // SABG Phase Tab Switcher
  dom.sabgTabs.forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      dom.sabgTabs.forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');
      const tabId = tabBtn.dataset.tab;
      state.sabgTab = tabId;
      dom.sabgTabContents.forEach(content => {
        content.classList.toggle('active', content.id === `sabg-tab-${tabId}`);
      });
      if (state.canineCorridorGroup) {
        state.canineCorridorGroup.visible = (tabId === 'canine');
      }
    });
  });

  // SABG Donor Harvest Source Selection
  dom.sabgSourceChips.forEach(chip => {
    chip.addEventListener('click', () => {
      dom.sabgSourceChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const srcId = chip.dataset.source;
      state.sabgDonorSource = srcId;
      const donor = SABG_SIMULATION_CONFIG.donorSites.find(d => d.id === srcId);
      if (donor) {
        dom.sabgActiveSourceBadge.textContent = `${donor.name.split(' ')[0]} (+30%)`;
      }
    });
  });

  // SABG Packing Slider
  dom.sliderPacking.addEventListener('input', (e) => {
    const density = parseFloat(e.target.value) / 100;
    updateSABGPacking(density);
  });

  // SABG Timeline Milestone Step Buttons
  dom.timelineStepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.timelineStepBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateSABGTimeline(btn.dataset.step);
    });
  });

  // Canine Tooth 23 Eruption Slider
  dom.sliderCanineEruption.addEventListener('input', (e) => {
    state.isAutoErupting = false;
    dom.btnAutoErupt.classList.remove('playing');
    dom.btnAutoErupt.textContent = '▶ Auto-Erupt Tooth 23';
    const factor = parseFloat(e.target.value) / 100;
    updateCanineEruption(factor);
  });

  // Canine Auto-Erupt Toggle
  dom.btnAutoErupt.addEventListener('click', toggleAutoErupt);

  // Camera shortcuts for SABG
  dom.btnSabgCamCleft.addEventListener('click', () => {
    setCameraView([-2.0, 50.0, -50.0], [-2.0, 18.0, -32.0]);
  });
  dom.btnSabgCamOcclusal.addEventListener('click', () => {
    setCameraView([-2.0, 45.0, -50.0], [-2.0, 45.0, -170.0]);
  });
  dom.btnSabgCamCanine.addEventListener('click', () => {
    setCameraView([-5.0, 50.0, -48.0], [-55.0, 38.0, -32.0]);
  });

  // Alt-RAMEC Phase Tab Switcher
  dom.altramecTabs.forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      switchAltRAMECTab(tabBtn.dataset.tab);
    });
  });

  // Alt-RAMEC Weekly Pill Buttons
  dom.altramecWeekBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setAltRAMECWeek(parseInt(btn.dataset.week));
    });
  });

  // Hyrax Screw Transverse Width Slider
  dom.sliderAltramecWidth.addEventListener('input', (e) => {
    const widthMm = parseFloat(e.target.value) / 10;
    updateAltRAMECWidth(widthMm);
  });

  // Facemask Elastic Traction Force Slider
  dom.sliderProtractForce.addEventListener('input', (e) => {
    const grams = parseInt(e.target.value);
    state.protractForceGrams = grams;
    dom.protractForceVal.textContent = `${grams} g / side (${grams * 2} g Total)`;
    if (state.elasticMeshes.right && state.elasticMeshes.left) {
      const scaleThick = 0.8 + (grams / 500) * 0.4;
      state.elasticMeshes.right.mesh.scale.x = scaleThick;
      state.elasticMeshes.right.mesh.scale.y = scaleThick;
      state.elasticMeshes.left.mesh.scale.x = scaleThick;
      state.elasticMeshes.left.mesh.scale.y = scaleThick;
    }
  });

  // Skeletal Le Fort I Advancement Slider
  dom.sliderMaxillaAdvancement.addEventListener('input', (e) => {
    state.isAutoProtracting = false;
    dom.btnAutoProtract.classList.remove('playing');
    dom.btnAutoProtract.textContent = '▶ Auto-Simulate Protraction';
    const advMm = parseFloat(e.target.value) / 10;
    updateMaxillaryAdvancement(advMm);
  });

  // Protraction Play / Pause
  dom.btnAutoProtract.addEventListener('click', toggleAutoProtract);

  // Alt-RAMEC & Facemask Camera Shortcuts
  dom.btnCamFacemask.addEventListener('click', () => {
    // Restore Mandible, Mandibular Dentition, and IAN for profile view
    setSegmentVisibility('mandible', true);
    setSegmentVisibility('lower_teeth', true);
    setSegmentVisibility('mandibular_canal', true);
    setCameraView([0, 25, -42], [-320, 85, -20]);
  });
  dom.btnCamExpander.addEventListener('click', () => {
    // Automatically turn off Mandible, Mandibular Dentition, and IAN in Layers & Parts
    setSegmentVisibility('mandible', false);
    setSegmentVisibility('lower_teeth', false);
    setSegmentVisibility('mandibular_canal', false);
    setCameraView([0, 36, -42], [0, 24, -165]);
  });
  dom.btnCamSutures.addEventListener('click', () => {
    // Restore Mandible, Mandibular Dentition, and IAN for suture view
    setSegmentVisibility('mandible', true);
    setSegmentVisibility('lower_teeth', true);
    setSegmentVisibility('mandibular_canal', true);
    setCameraView([0, 20, -25], [190, 190, 35]);
  });
}

function applyFilter(filter) {
  state.activeFilter = filter;
  dom.filterAll.classList.toggle('active', filter === 'all');
  dom.filterMaxilla.classList.toggle('active', filter === 'maxilla');
  dom.filterTeeth.classList.toggle('active', filter === 'teeth');

  document.querySelectorAll('.tree-row').forEach(row => {
    const id = row.dataset.id;
    if (filter === 'all') {
      row.style.display = 'flex';
    } else if (filter === 'maxilla') {
      const isMax = id.includes('maxilla') || id === 'graft_void' || id === 'alt_ramec' || id === 'facemask';
      row.style.display = isMax ? 'flex' : 'none';
    } else if (filter === 'teeth') {
      const isTeeth = id.includes('teeth');
      row.style.display = isTeeth ? 'flex' : 'none';
    }
  });
}

function setClinicalStage(stage) {
  state.currentStage = stage;

  // Reset auto-protraction animation if leaving alt_ramec stage
  if (stage !== 'alt_ramec') {
    state.isAutoProtracting = false;
    dom.btnAutoProtract.classList.remove('playing');
    dom.btnAutoProtract.textContent = '▶ Auto-Simulate Protraction';
    dom.altramecDock.classList.add('hidden');
    if (state.models['alt_ramec']) state.models['alt_ramec'].visible = false;
    if (state.models['facemask']) state.models['facemask'].visible = false;
    if (state.facemaskElasticGroup) state.facemaskElasticGroup.visible = false;
    updateMaxillaryAdvancement(0.0);
    updateAltRAMECWidth(0.0);

    // Restore mandibular structures if previously hidden by Palatal Hyrax view
    setSegmentVisibility('mandible', true);
    setSegmentVisibility('lower_teeth', true);
    setSegmentVisibility('mandibular_canal', true);
  }

  if (stage === 'pre_op') {
    dom.disarticulationDock.classList.remove('hidden');
    dom.sabgDock.classList.add('hidden');
    if (state.canineCorridorGroup) state.canineCorridorGroup.visible = false;
    animateDisarticulationTo(0.0);
    setMuscleVectorsVisible(false);
    if (state.models['graft_void']) state.models['graft_void'].visible = false;
    if (state.models['skin']) {
      state.models['skin'].visible = true;
      state.models['skin'].traverse(c => {
        if (c.isMesh && c.material) {
          c.material.transparent = true;
          c.material.opacity = 0.38;
        }
      });
      dom.skinOpacitySlider.value = 38;
      dom.skinOpacityLabel.textContent = '38%';
    }

    // Re-verify mandibular structures are visible
    setSegmentVisibility('mandible', true);
    setSegmentVisibility('lower_teeth', true);
    setSegmentVisibility('mandibular_canal', true);

    // Full Lateral (Profile) View
    setCameraView([0, 25, -42], [-380, 25, -42]);
  } else if (stage === 'berkowitz_vectors') {
    dom.disarticulationDock.classList.remove('hidden');
    dom.sabgDock.classList.add('hidden');
    if (state.canineCorridorGroup) state.canineCorridorGroup.visible = false;
    animateDisarticulationTo(0.0);
    setMuscleVectorsVisible(true);
    if (state.models['graft_void']) state.models['graft_void'].visible = false;
    // Peel skin to 15% for clear vector visibility
    if (state.models['skin']) {
      state.models['skin'].traverse(c => {
        if (c.isMesh && c.material) c.material.opacity = 0.15;
      });
      dom.skinOpacitySlider.value = 15;
      dom.skinOpacityLabel.textContent = '15%';
    }
  } else if (stage === 'exploded') {
    dom.disarticulationDock.classList.remove('hidden');
    dom.sabgDock.classList.add('hidden');
    if (state.canineCorridorGroup) state.canineCorridorGroup.visible = false;
    animateDisarticulationTo(1.0);
    setMuscleVectorsVisible(false);
    if (state.models['graft_void']) state.models['graft_void'].visible = true;
    if (state.models['skin']) state.models['skin'].visible = false;
  } else if (stage === 'graft_infill') {
    dom.disarticulationDock.classList.add('hidden');
    dom.sabgDock.classList.remove('hidden');
    animateDisarticulationTo(0.0);
    setMuscleVectorsVisible(false);

    // Virtual peel skin to 0% for unobstructed surgical view
    if (state.models['skin']) {
      state.models['skin'].traverse(c => {
        if (c.isMesh && c.material) c.material.opacity = 0.0;
      });
      dom.skinOpacitySlider.value = 0;
      dom.skinOpacityLabel.textContent = '0%';
    }

    if (state.models['graft_void']) state.models['graft_void'].visible = true;
    updateSABGPacking(state.sabgPackingDensity);
    if (state.canineCorridorGroup) {
      state.canineCorridorGroup.visible = (state.sabgTab === 'canine');
    }

    // Smoothly focus camera on Cleft Bed (elevated above bottom dock)
    setCameraView([-2.0, 50.0, -50.0], [-2.0, 18.0, -32.0]);
    selectSegment('graft_void');
  } else if (stage === 'alt_ramec') {
    dom.disarticulationDock.classList.add('hidden');
    dom.sabgDock.classList.add('hidden');
    dom.altramecDock.classList.remove('hidden');

    animateDisarticulationTo(0.0);
    setMuscleVectorsVisible(false);
    if (state.canineCorridorGroup) state.canineCorridorGroup.visible = false;
    if (state.models['graft_void']) state.models['graft_void'].visible = false;

    // Close floating overlays so viewport is clear and unobstructed
    dom.inspectorCard.classList.add('hidden');
    dom.treePanel.classList.add('hidden');
    dom.toggleTreeBtn.classList.remove('active');

    // Show Alt-RAMEC expander and Facemask
    if (state.models['alt_ramec']) state.models['alt_ramec'].visible = true;
    if (state.models['facemask']) state.models['facemask'].visible = true;
    if (state.facemaskElasticGroup) state.facemaskElasticGroup.visible = true;

    // Set skin opacity to 30% so the face envelope, forehead pad and chin cup are clear,
    // while the dental arch and expander remain visible inside!
    if (state.models['skin']) {
      state.models['skin'].visible = true;
      state.models['skin'].traverse(c => {
        if (c.isMesh && c.material) {
          c.material.transparent = true;
          c.material.opacity = 0.30;
        }
      });
      dom.skinOpacitySlider.value = 30;
      dom.skinOpacityLabel.textContent = '30%';
    }

    // Apply current Alt-RAMEC week state and maxillary advancement
    setAltRAMECWeek(state.altramecWeek);
    updateMaxillaryAdvancement(state.maxillaAdvancementMm);

    // Ensure mandibular structures are visible for initial Facemask Profile view
    setSegmentVisibility('mandible', true);
    setSegmentVisibility('lower_teeth', true);
    setSegmentVisibility('mandibular_canal', true);

    // Profile Camera view for Facemask (elevated so chin cup and vertical rod are clear of dock)
    setCameraView([0, 25, -42], [-320, 85, -20]);
  }

  updateTreeCount();
}

function setMuscleVectorsVisible(vis) {
  state.showMuscles = vis;
  if (muscleGroup) muscleGroup.visible = vis;
  dom.vectorLegend.classList.toggle('hidden', !vis);
}

// -------------------------------------------------------------
// SABG Surgical Simulation Functions
// -------------------------------------------------------------
function setupSABGSimulation() {
  state.canineCorridorGroup = new THREE.Group();
  state.canineCorridorGroup.name = 'CanineEruptionCorridor';

  const vStart = new THREE.Vector3(-6.5, 58.0, -38.0); // Cleft Canine Apex
  const vEnd = new THREE.Vector3(-3.3, 56.5, -49.0);   // Occlusal Alveolar Target
  const dir = new THREE.Vector3().subVectors(vEnd, vStart);
  const len = dir.length();
  dir.normalize();

  const corridorGeo = new THREE.CylinderGeometry(1.2, 1.2, len, 16);
  corridorGeo.translate(0, len / 2, 0);
  corridorGeo.rotateX(Math.PI / 2);

  const corridorMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.45,
    roughness: 0.3
  });
  const corridorMesh = new THREE.Mesh(corridorGeo, corridorMat);
  corridorMesh.position.copy(vStart);
  corridorMesh.lookAt(vEnd);

  // Arrowhead cone
  const coneGeo = new THREE.ConeGeometry(2.0, 3.5, 16);
  coneGeo.rotateX(Math.PI / 2);
  const coneMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 0.8,
    roughness: 0.2
  });
  const coneMesh = new THREE.Mesh(coneGeo, coneMat);
  coneMesh.position.copy(vEnd);
  coneMesh.lookAt(vEnd.clone().add(dir));

  state.canineCorridorGroup.add(corridorMesh);
  state.canineCorridorGroup.add(coneMesh);
  state.canineCorridorGroup.visible = false;
  scene.add(state.canineCorridorGroup);
}

function updateSABGPacking(density) {
  state.sabgPackingDensity = density;
  const graft = state.models['graft_void'];

  if (density <= 0.001) {
    if (state.graftClipPlane) state.graftClipPlane.constant = -1000;
    if (graft) graft.visible = false;
    dom.sabgVolDisplay.textContent = '0.00 cm³';
    dom.sabgPackStatus.textContent = 'Unfilled Bony Defect';
    dom.sabgPackStatus.style.color = '#94a3b8';
    return;
  }

  if (graft) graft.visible = true;

  const p = Math.min(density, 1.0);
  // Z bounds: -34.5 to -57.0 (RAS: top to bottom)
  // Keeps z + d >= 0 <=> z >= -d => d = -Z_cut = 34.5 + 22.5 * p
  if (state.graftClipPlane) {
    state.graftClipPlane.constant = 34.5 + 22.5 * p;
  }

  const over = Math.max(0, (density - 1.0) / 0.3);
  if (graft) {
    graft.scale.set(1.0 + 0.12 * over, 1.0 + 0.08 * over, 1.0 + 0.12 * over);
  }

  const vol = (1.72 * p + 0.52 * over).toFixed(2);
  dom.sabgVolDisplay.textContent = `${vol} cm³`;

  if (density >= 1.25) {
    dom.sabgPackStatus.textContent = '+30% Resorption Overfill';
    dom.sabgPackStatus.style.color = '#10b981';
    setGraftMaterialLook('#fb923c', 0xb45309, 0.45, 0.95);
  } else if (density >= 0.95) {
    dom.sabgPackStatus.textContent = 'Defect 100% Obliterated';
    dom.sabgPackStatus.style.color = '#06b6d4';
    setGraftMaterialLook('#f59e0b', 0x78350f, 0.35, 0.90);
  } else {
    dom.sabgPackStatus.textContent = `Partially Packed (${Math.round(density * 100)}%)`;
    dom.sabgPackStatus.style.color = '#f43f5e';
    setGraftMaterialLook('#f43f5e', 0x881337, 0.55, 0.80);
  }
}

function setGraftMaterialLook(colorHex, emissiveHex, emissiveInt, opacity) {
  const graft = state.models['graft_void'];
  if (!graft) return;
  graft.traverse(child => {
    if (child.isMesh && child.material) {
      child.material.color.set(colorHex);
      child.material.emissive.set(emissiveHex);
      child.material.emissiveIntensity = emissiveInt;
      child.material.opacity = opacity;
    }
  });
}

function updateSABGTimeline(stepId) {
  state.sabgTimelineStep = stepId;
  const config = SABG_SIMULATION_CONFIG.timeline.find(t => t.id === stepId);
  if (!config) return;

  dom.sabgRemodeledVol.textContent = `${config.volume} cm³ (-${config.resorptionPct}%)`;
  dom.sabgDensityDisplay.textContent = config.densityHU;
  dom.sabgBerglandDisplay.textContent = config.berglandScore;
  dom.sabgTimelineNotes.textContent = config.notes;

  setGraftMaterialLook(config.color, config.emissive, stepId === 'month12' ? 0.0 : 0.35, 0.92);

  if (state.colorMode === 'natural' && stepId === 'month12') {
    setGraftMaterialLook('#ede7d8', 0x000000, 0.0, 0.95);
  }
}

function updateCanineEruption(factor) {
  state.canineEruptionFactor = factor;
  if (!state.lesserTeethMesh || !state.lesserTeethOriginalPositions) return;

  const posAttr = state.lesserTeethMesh.geometry.attributes.position;
  const orig = state.lesserTeethOriginalPositions;
  const pos = posAttr.array;

  for (let i = 0; i < orig.length / 3; i++) {
    const x = orig[3 * i];
    const y = orig[3 * i + 1];
    const z = orig[3 * i + 2];

    if (y > 50.0 && x >= -10.5 && x <= -1.8) {
      const w = Math.min(Math.max((y - 50.0) / 2.5, 0), 1.0);
      pos[3 * i] = orig[3 * i] + factor * 3.2 * w;
      pos[3 * i + 1] = orig[3 * i + 1] - factor * 1.5 * w;
      pos[3 * i + 2] = orig[3 * i + 2] - factor * 11.0 * w;
    } else {
      pos[3 * i] = orig[3 * i];
      pos[3 * i + 1] = orig[3 * i + 1];
      pos[3 * i + 2] = orig[3 * i + 2];
    }
  }

  posAttr.needsUpdate = true;
  state.lesserTeethMesh.geometry.computeVertexNormals();

  if (factor >= 0.95) {
    dom.sabgCanineDesc.textContent =
      'Canine (Tooth 23) successfully erupted through consolidated cancellous bridge into functional arch alignment with attached keratinized gingiva (Bergland Type I / Chelsea Category A).';
  } else if (factor > 0.05) {
    dom.sabgCanineDesc.textContent =
      `Canine eruption active (${Math.round(factor * 100)}%): Crown descending through the osteogenic bone bridge corridor.`;
  } else {
    dom.sabgCanineDesc.textContent =
      'Canine (Tooth 23) impacted superior-laterally above cleft void awaiting secondary bone graft bridging.';
  }
}

function toggleAutoErupt() {
  state.isAutoErupting = !state.isAutoErupting;
  dom.btnAutoErupt.classList.toggle('playing', state.isAutoErupting);
  dom.btnAutoErupt.textContent = state.isAutoErupting ? '⏸ Pause Eruption' : '▶ Auto-Erupt Tooth 23';
  if (state.isAutoErupting) {
    state.autoEruptStartTime = performance.now() - state.canineEruptionFactor * 3500;
  }
}

// -------------------------------------------------------------
// Alt-RAMEC & Petit Reverse-Pull Facemask Simulation Functions
// -------------------------------------------------------------
function setupAltRAMECSimulation() {
  state.facemaskElasticGroup = new THREE.Group();
  state.facemaskElasticGroup.name = 'FacemaskElastics';

  const cfg = ALTRANEC_SIMULATION_CONFIG.facemask;

  // Right elastic: Crossbar hook to Alt-RAMEC hook
  const rStart = new THREE.Vector3(...cfg.elasticVectorRight.origin);
  const rEnd = new THREE.Vector3(...cfg.elasticVectorRight.target);
  state.elasticMeshes.right = createElasticAssembly(rStart, rEnd, 'right');

  // Left elastic: Crossbar hook to Alt-RAMEC hook
  const lStart = new THREE.Vector3(...cfg.elasticVectorLeft.origin);
  const lEnd = new THREE.Vector3(...cfg.elasticVectorLeft.target);
  state.elasticMeshes.left = createElasticAssembly(lStart, lEnd, 'left');

  state.facemaskElasticGroup.add(state.elasticMeshes.right.group);
  state.facemaskElasticGroup.add(state.elasticMeshes.left.group);
  state.facemaskElasticGroup.visible = false;
  scene.add(state.facemaskElasticGroup);
}

function createElasticAssembly(origin, target, side) {
  const dir = new THREE.Vector3().subVectors(target, origin);
  const len = dir.length();

  // Elastic rubber tube
  const geo = new THREE.CylinderGeometry(1.2, 1.2, len, 16);
  geo.translate(0, len / 2, 0);
  geo.rotateX(Math.PI / 2);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,          // Amber latex elastic
    emissive: 0xd97706,
    emissiveIntensity: 0.45,
    roughness: 0.28,
    metalness: 0.15,
    transparent: true,
    opacity: 0.92
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(origin);
  mesh.lookAt(target);

  // Traction Force Vector Cone Head (at intraoral hook pointing toward crossbar)
  const forceDir = new THREE.Vector3().subVectors(origin, target).normalize();
  const coneGeo = new THREE.ConeGeometry(2.2, 5.0, 16);
  coneGeo.rotateX(Math.PI / 2);
  const coneMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,          // Green traction vector
    emissive: 0x059669,
    emissiveIntensity: 0.8,
    roughness: 0.2
  });
  const coneMesh = new THREE.Mesh(coneGeo, coneMat);
  coneMesh.position.copy(target);
  coneMesh.lookAt(target.clone().add(forceDir));

  const group = new THREE.Group();
  group.add(mesh);
  group.add(coneMesh);

  return {
    group,
    mesh,
    coneMesh,
    mat,
    origin: origin.clone(),
    baseTarget: target.clone(),
    currentTarget: target.clone(),
    baseLength: len
  };
}

function updateElastic(elastic, currentTarget) {
  elastic.currentTarget.copy(currentTarget);
  const dir = new THREE.Vector3().subVectors(currentTarget, elastic.origin);
  const len = dir.length();

  elastic.mesh.position.copy(elastic.origin);
  elastic.mesh.lookAt(currentTarget);
  elastic.mesh.scale.set(1, 1, len / elastic.baseLength);

  const forceDir = new THREE.Vector3().subVectors(elastic.origin, currentTarget).normalize();
  elastic.coneMesh.position.copy(currentTarget);
  elastic.coneMesh.lookAt(currentTarget.clone().add(forceDir));
}

function switchAltRAMECTab(tabId) {
  state.altramecTab = tabId;
  dom.altramecTabs.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  dom.altramecTabContents.forEach(c => c.classList.toggle('active', c.id === `altramec-tab-${tabId}`));
}

function setAltRAMECWeek(weekNum) {
  state.altramecWeek = weekNum;
  dom.altramecWeekBtns.forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.week) === weekNum);
  });

  const cycle = ALTRANEC_SIMULATION_CONFIG.weeklyCycles.find(c => c.week === weekNum)
    || ALTRANEC_SIMULATION_CONFIG.weeklyCycles[ALTRANEC_SIMULATION_CONFIG.weeklyCycles.length - 1];

  dom.altramecActiveCycleBadge.textContent = cycle.badge;
  dom.altramecCycleNotes.textContent = cycle.notes;
  dom.altramecScrewWidth.textContent = `+${cycle.expansionWidth.toFixed(1)} mm`;
  dom.altramecModeDisplay.textContent =
    cycle.mode === 'expansion' ? 'Rapid Expansion Mode' :
    cycle.mode === 'constriction' ? 'Constriction Mode' : 'Reverse-Pull Mode';

  updateAltRAMECWidth(cycle.expansionWidth);
  updateSutureMatrix(weekNum);

  if (weekNum === 5) {
    switchAltRAMECTab('protraction');
  }
}

function updateSutureMatrix(weekNum) {
  const pterygo = document.getElementById('suture-stat-pterygo');
  const zygomax = document.getElementById('suture-stat-zygomax');
  const zygotemp = document.getElementById('suture-stat-zygotemp');
  const frontomax = document.getElementById('suture-stat-frontomax');
  const transpal = document.getElementById('suture-stat-transpal');
  const mobility = document.querySelector('.suture-telem-val');

  if (weekNum === 1) {
    if (pterygo) { pterygo.textContent = 'Strained (Micro-fracturing)'; pterygo.className = 'suture-card-status telem-amber'; }
    if (zygomax) { zygomax.textContent = 'Early Tension'; zygomax.className = 'suture-card-status telem-amber'; }
    if (zygotemp) { zygotemp.textContent = 'Resisting Strain'; zygotemp.className = 'suture-card-status telem-amber'; }
    if (frontomax) { frontomax.textContent = 'Intact Pivot Hinge'; frontomax.className = 'suture-card-status telem-cyan'; }
    if (transpal) { transpal.textContent = 'Midline Gap Opening'; transpal.className = 'suture-card-status telem-amber'; }
    if (mobility) { mobility.textContent = '35% Strained (Buttress Resisting Traction)'; mobility.className = 'suture-telem-val telem-amber'; }
  } else if (weekNum === 2) {
    if (pterygo) { pterygo.textContent = 'Disorganized Blastema'; pterygo.className = 'suture-card-status telem-amber'; }
    if (zygomax) { zygomax.textContent = 'Collagen Disorganization'; zygomax.className = 'suture-card-status telem-amber'; }
    if (zygotemp) { zygotemp.textContent = 'Mobilizing Arch'; zygotemp.className = 'suture-card-status telem-amber'; }
    if (frontomax) { frontomax.textContent = 'Patent Hinge'; frontomax.className = 'suture-card-status telem-cyan'; }
    if (transpal) { transpal.textContent = 'Recoil / Osteogenic Stim'; transpal.className = 'suture-card-status telem-amber'; }
    if (mobility) { mobility.textContent = '55% Mobilizing (Prevents Bony Union)'; mobility.className = 'suture-telem-val telem-amber'; }
  } else if (weekNum === 3) {
    if (pterygo) { pterygo.textContent = 'Progressive Uncoupling'; pterygo.className = 'suture-card-status telem-green'; }
    if (zygomax) { zygomax.textContent = 'Widened Gap & Hypervascular'; zygomax.className = 'suture-card-status telem-green'; }
    if (zygotemp) { zygotemp.textContent = 'Disarticulated'; zygotemp.className = 'suture-card-status telem-green'; }
    if (frontomax) { frontomax.textContent = 'Patent Hinge'; frontomax.className = 'suture-card-status telem-cyan'; }
    if (transpal) { transpal.textContent = 'Bony Bridges Fractured'; transpal.className = 'suture-card-status telem-green'; }
    if (mobility) { mobility.textContent = '80% Disarticulated (Near-Complete Release)'; mobility.className = 'suture-telem-val telem-green'; }
  } else {
    // Week 4 and Week 5+
    if (pterygo) { pterygo.textContent = 'Uncoupled (Disarticulated)'; pterygo.className = 'suture-card-status telem-green'; }
    if (zygomax) { zygomax.textContent = 'Disarticulated'; zygomax.className = 'suture-card-status telem-green'; }
    if (zygotemp) { zygotemp.textContent = 'Disarticulated'; zygotemp.className = 'suture-card-status telem-green'; }
    if (frontomax) { frontomax.textContent = 'Patent Hinge'; frontomax.className = 'suture-card-status telem-cyan'; }
    if (transpal) { transpal.textContent = 'Completely Mobilized'; transpal.className = 'suture-card-status telem-green'; }
    if (mobility) { mobility.textContent = '100% Hypermobile (Prime for Forward Traction)'; mobility.className = 'suture-telem-val telem-green'; }
  }
}

function updateAltRAMECWidth(widthMm) {
  state.altramecWidthMm = widthMm;
  dom.altramecScrewWidth.textContent = `+${widthMm.toFixed(1)} mm`;
  dom.sliderAltramecWidth.value = Math.round(widthMm * 10);

  // Subtle lateral transverse displacement of the cleft lesser segment & expander
  const expandRatio = widthMm / 7.0; // 0 to ~1.14
  const altRamec = state.models['alt_ramec'];
  const initAltRamec = state.initialTransforms['alt_ramec'];
  if (altRamec && initAltRamec) {
    altRamec.scale.x = initAltRamec.scale.x * (1.0 + expandRatio * 0.08);
  }

  const lesserMax = state.models['lesser_maxilla'];
  const initLesserMax = state.initialTransforms['lesser_maxilla'];
  if (lesserMax && initLesserMax) {
    // Patient Left is -X, so moving further -X expands the collapsed cleft arch
    lesserMax.position.x = initLesserMax.position.x - expandRatio * 1.5;
  }

  const lesserTeeth = state.models['lesser_teeth'];
  const initLesserTeeth = state.initialTransforms['lesser_teeth'];
  if (lesserTeeth && initLesserTeeth) {
    lesserTeeth.position.x = initLesserTeeth.position.x - expandRatio * 1.5;
  }
}

function updateMaxillaryAdvancement(advMm) {
  state.maxillaAdvancementMm = advMm;
  dom.protractAdvancementVal.textContent = `+${advMm.toFixed(1)} mm`;
  dom.sliderMaxillaAdvancement.value = Math.round(advMm * 10);

  // Traction angle: 25° forward and downward relative to occlusal plane
  const angleRad = 25 * (Math.PI / 180);
  const deltaY = advMm * Math.cos(angleRad);    // Anterior advancement (+Y)
  const deltaZ = -advMm * Math.sin(angleRad);   // Downward translation (-Z)
  const rotX = (advMm / 4.5) * 0.022;           // Counter-clockwise pitch tilt

  // Apply to maxillary bone and dental segments and intraoral expander
  const segments = ['greater_maxilla', 'greater_teeth', 'lesser_maxilla', 'lesser_teeth', 'alt_ramec'];
  for (const id of segments) {
    const root = state.models[id];
    const initT = state.initialTransforms[id];
    if (root && initT) {
      root.position.y = initT.position.y + deltaY;
      root.position.z = initT.position.z + deltaZ;
      root.rotation.x = initT.rotation.x + rotX;
    }
  }

  // Update dynamic traction elastics
  if (state.elasticMeshes.right) {
    const rTarget = state.elasticMeshes.right.baseTarget.clone();
    rTarget.y += deltaY;
    rTarget.z += deltaZ;
    updateElastic(state.elasticMeshes.right, rTarget);
  }
  if (state.elasticMeshes.left) {
    const lTarget = state.elasticMeshes.left.baseTarget.clone();
    lTarget.y += deltaY;
    lTarget.z += deltaZ;
    updateElastic(state.elasticMeshes.left, lTarget);
  }
}

function toggleAutoProtract() {
  state.isAutoProtracting = !state.isAutoProtracting;
  dom.btnAutoProtract.classList.toggle('playing', state.isAutoProtracting);
  dom.btnAutoProtract.textContent = state.isAutoProtracting ? '⏸ Pause Protraction' : '▶ Auto-Simulate Protraction';
  if (state.isAutoProtracting) {
    state.autoProtractStartTime = performance.now() - (state.maxillaAdvancementMm / 4.5) * 4000;
  }
}

function setCameraView(target, position) {
  controls.target.set(...target);
  camera.position.set(...position);
  controls.update();
}

// Smooth disarticulation lerp
let isAnimatingExplode = false;
let explodeStartVal = 0;
let explodeTargetVal = 0;
let explodeStartTime = 0;
const EXPLODE_DURATION = 650; // ms

function animateDisarticulationTo(target) {
  explodeStartVal = state.explodeFactor;
  explodeTargetVal = target;
  explodeStartTime = performance.now();
  isAnimatingExplode = true;
}

// -------------------------------------------------------------
// Animation Render Loop
// -------------------------------------------------------------
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Smooth disarticulation interpolation
  if (isAnimatingExplode) {
    const elapsed = performance.now() - explodeStartTime;
    const progress = Math.min(elapsed / EXPLODE_DURATION, 1.0);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = explodeStartVal + (explodeTargetVal - explodeStartVal) * ease;
    updateDisarticulation(current);

    if (progress >= 1.0) {
      isAnimatingExplode = false;
    }
  }

  // Auto-Erupt Animation Cycle
  if (state.isAutoErupting) {
    const t = (performance.now() - state.autoEruptStartTime) / 3500;
    // Smooth ping-pong cycle
    const cycle = (Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    updateCanineEruption(cycle);
    dom.sliderCanineEruption.value = Math.round(cycle * 100);
  }

  // Auto-Protract Animation Cycle
  if (state.isAutoProtracting) {
    const t = (performance.now() - state.autoProtractStartTime) / 4000;
    const cycle = (Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    const adv = cycle * 4.5;
    updateMaxillaryAdvancement(adv);
  }

  // Alt-RAMEC Elastic Subtle Pulse (when in alt_ramec stage)
  if (state.currentStage === 'alt_ramec' && state.elasticMeshes.right && state.elasticMeshes.left) {
    const elasticPulse = 0.45 + 0.15 * Math.sin(elapsedTime * 3.0);
    state.elasticMeshes.right.mat.emissiveIntensity = elasticPulse;
    state.elasticMeshes.left.mat.emissiveIntensity = elasticPulse;
  }

  // Graft Void Pulsing Glow (only when packing or before month12)
  const graft = state.models['graft_void'];
  if (graft && graft.visible && state.sabgTimelineStep !== 'month12') {
    const pulse = 0.35 + 0.25 * Math.sin(elapsedTime * 3.5);
    graft.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined) {
        child.material.emissiveIntensity = pulse;
      }
    });
  }

  // Aberrant Muscle Vector Pulse
  if (muscleGroup && muscleGroup.visible) {
    const pulse = 0.4 + 0.35 * Math.sin(elapsedTime * 4.0);
    muscleGroup.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined) {
        child.material.emissiveIntensity = pulse;
      }
    });
  }

  controls.update();
  renderer.render(scene, camera);
}

function hideLoading() {
  setTimeout(() => {
    dom.loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      dom.loadingOverlay.style.display = 'none';
    }, 500);
  }, 350);
}
