/**
 * Clinical Dossiers, Aberrant Muscular Force Vectors, and Disarticulation Vectors
 * Based on: Samuel Berkowitz, "Cleft Lip and Palate: Diagnosis and Management", 3rd Ed.
 */

export const ANATOMICAL_DOSSIERS = {
  greater_maxilla: {
    id: 'greater_maxilla',
    name: 'Greater Maxillary Segment',
    latinName: 'Segmentum Maxillare Majus',
    category: 'Cleft Viscerocranium',
    color: '#38bdf8',
    colorHex: 0x38bdf8,
    berkowitzMorphology:
      'Comprises the premaxillary component and the non-cleft maxillary body/alveolus containing teeth 11, 13–17. Uninhibited anteroposterior growth of the nasal septum (via the septopremaxillary ligament) and tongue thrusting through the palatal gap drive ventro-caudal and lateral rotation of the premaxilla away from the midline.',
    clinicalSignificance:
      'Forms the medial/mesial boundary of the alveolar cleft. In presurgical infant orthopedics (NAM / Latham), it requires controlled palatal retromovement and midline derotation prior to secondary alveolar bone grafting (SABG). Contains healthy canine and central incisor root anchors.',
    surgicalNotes:
      'SABG requires careful subperiosteal dissection of the mesial cleft cortical wall to elevate an attached mucoperiosteal flap while preserving blood supply to tooth 11.',
    volumeEstimate: '11.8 cm³',
    corticalThickness: '1.6 – 2.4 mm',
    sutureBoundaries: 'Median palatine suture (posteriorly), Cleft defect (anteriorly), Zygomaticomaxillary suture (laterally)'
  },

  lesser_maxilla: {
    id: 'lesser_maxilla',
    name: 'Lesser Maxillary Segment',
    latinName: 'Segmentum Maxillare Minus',
    category: 'Cleft Viscerocranium',
    color: '#fb923c',
    colorHex: 0xfb923c,
    berkowitzMorphology:
      'Represents the lateral maxillary segment on the cleft side carrying teeth 23–27. Completely uncoupled from the nasal septum and premaxilla, it suffers medial/transverse collapse and palatal shelf vertical tipping under uninterrupted circumoral and buccinator muscle tension.',
    clinicalSignificance:
      'Presents with severe transverse deficiency and posterior crossbite. The canine adjacent to the cleft often lacks mesial bone support or erupts into the cleft void. Must be expanded laterally and rotated outward prior to SABG.',
    surgicalNotes:
      'Lateral recipient bed for SABG. Flap design must release scarred palatal mucosa to allow tension-free primary closure over the harvested cancellous bone graft.',
    volumeEstimate: '8.4 cm³',
    corticalThickness: '1.2 – 1.8 mm (thinned at cleft margin)',
    sutureBoundaries: 'Zygomaticomaxillary suture, Pterygomaxillary fissure, Alveolar cleft defect'
  },

  zygomatic_complex: {
    id: 'zygomatic_complex',
    name: 'Zygomatic Complex (Bilateral)',
    latinName: 'Os Zygomaticum & Arcus Zygomaticus',
    category: 'Midfacial Buttress',
    color: '#34d399',
    colorHex: 0x34d399,
    berkowitzMorphology:
      'Includes the lateral orbital rim, infrazygomatic crest, and zygomatic arch extending to the articular tubercle of the temporal bone. In cleft patients, midfacial hypoplasia often manifests with posterior displacement of the cleft-side zygoma and malar deficiency.',
    clinicalSignificance:
      'Acts as the lateral Le Fort I anchor. Strictly segregated from the alveolar maxilla to respect Berkowitz disarticulation principles and prevent false-positive fusion in surgical models.',
    surgicalNotes:
      'Provides the key bony buttress for zygomaticomaxillary osteotomies (Le Fort I advancement / distraction) in secondary cleft orthognathic revisions.',
    volumeEstimate: '14.2 cm³ (bilateral)',
    corticalThickness: '2.0 – 3.2 mm',
    sutureBoundaries: 'Zygomaticomaxillary, Zygomaticofrontal, Zygomaticotemporal'
  },

  cranial_vault: {
    id: 'cranial_vault',
    name: 'Cranial Base & Facial Skeleton',
    latinName: 'Basis Cranii & Viscerocranium',
    category: 'Axial Skeleton',
    color: '#ede7d8',
    colorHex: 0xede7d8,
    berkowitzMorphology:
      'Includes the sphenoid, ethmoid, nasal bones, frontal bone, and stable cranial vault. In unilateral clefts, the cranial base angle (Ba-S-N) and spheno-ethmoidal complex establish the master architectural template for facial growth.',
    clinicalSignificance:
      'Stable rigid reference frame for 3D superimposition and cephalometric analysis. Contains the deviated nasal septum and vomer attached exclusively to the greater segment.',
    surgicalNotes:
      'Septoplasty and nasal floor reconstruction rely on nasal crest and pyriform aperture anchoring.',
    volumeEstimate: '420 cm³',
    corticalThickness: '3.0 – 6.5 mm',
    sutureBoundaries: 'Coronal, Sagittal, Lambdoid, Spheno-occipital synchondrosis'
  },

  mandible: {
    id: 'mandible',
    name: 'Mandible & Ramus',
    latinName: 'Mandibula',
    category: 'Lower Facial Skeleton',
    color: '#d8b4fe',
    colorHex: 0xd8b4fe,
    berkowitzMorphology:
      'Symmetric lower jaw with intact condyles and coronoid processes. In unilateral cleft patients, the mandible often exhibits secondary clockwise rotation (hyperdivergent growth) and pseudo-Class III posturing due to maxillary retrusion.',
    clinicalSignificance:
      'Establishes the terminal occlusal target for orthodontic alignment and surgical maxilla repositioning.',
    surgicalNotes:
      'Harvest site for mandibular symphyseal or retromolar bone blocks when intraoral graft sources are preferred for localized SABG.',
    volumeEstimate: '65.2 cm³',
    corticalThickness: '2.5 – 4.2 mm',
    sutureBoundaries: 'Temporomandibular joints (bilateral)'
  },

  greater_teeth: {
    id: 'greater_teeth',
    name: 'Greater Segment Dentition (11, 13–17)',
    latinName: 'Dentes Maxillares Majores',
    category: 'Dental Arches',
    color: '#ffffff',
    colorHex: 0xffffff,
    berkowitzMorphology:
      'Dentition anchored to the premaxillary component and right maxillary body, comprising central incisor tooth 11 and teeth 13–17. Displaces anterolaterally and rotates outward with the greater maxillary segment.',
    clinicalSignificance:
      'Tooth 11 forms the medial dental abutment of the alveolar cleft. Establishes the non-cleft occlusal reference line during presurgical orthopedic alignment.',
    surgicalNotes:
      'Subperiosteal dissection of the mesial cleft margin must preserve periodontal attachment and vascularity to tooth 11.',
    volumeEstimate: '4.5 cm³',
    corticalThickness: 'Enamel/Dentin',
    sutureBoundaries: 'Periodontal ligament space of Greater Maxilla'
  },

  lesser_teeth: {
    id: 'lesser_teeth',
    name: 'Lesser Segment Dentition (23–27)',
    latinName: 'Dentes Maxillares Minores',
    category: 'Dental Arches',
    color: '#ffffff',
    colorHex: 0xffffff,
    berkowitzMorphology:
      'Dentition anchored to the left lateral palatal shelf, comprising canine tooth 23 and teeth 24–27. Lateral incisor tooth 22 is congenitally agenic/absent at the cleft defect. Exhibits medial collapse and posterior crossbite.',
    clinicalSignificance:
      'Canine tooth 23 is the primary functional target for SABG; bone grafting must be timed before or during root elongation (1/2 to 2/3 formed) to allow physiological canine eruption through the graft.',
    surgicalNotes:
      'Graft bed preparation adjacent to tooth 23 must maintain lateral bone coverage to avoid root fenestration.',
    volumeEstimate: '3.6 cm³',
    corticalThickness: 'Enamel/Dentin',
    sutureBoundaries: 'Periodontal ligament space of Lesser Maxilla'
  },

  lower_teeth: {
    id: 'lower_teeth',
    name: 'Mandibular Dentition',
    latinName: 'Dentes Mandibulares',
    category: 'Dental Arches',
    color: '#ffffff',
    colorHex: 0xffffff,
    berkowitzMorphology: 'Complete mandibular dentition with mild anterior crowding.',
    clinicalSignificance: 'Acts as the occlusal template for maxillary transverse expansion.',
    surgicalNotes: 'Orthodontic leveling and alignment prior to orthognathic review.',
    volumeEstimate: '8.1 cm³',
    corticalThickness: 'Enamel/Dentin',
    sutureBoundaries: 'Alveolar periodontal ligament space'
  },

  mandibular_canal: {
    id: 'mandibular_canal',
    name: 'Inferior Alveolar Nerve Canal',
    latinName: 'Canalis Mandibulae',
    category: 'Neurovascular Bundle',
    color: '#ef4444',
    colorHex: 0xef4444,
    berkowitzMorphology: 'Bilateral neurovascular conduit conveying the inferior alveolar nerve and vessels.',
    clinicalSignificance: 'Critical anatomical hazard during mandibular symphyseal or ramus bone graft harvesting.',
    surgicalNotes: 'Must maintain a 5 mm safety margin superior and lateral to the mental foramen during cortical bone harvest.',
    volumeEstimate: '0.9 cm³',
    corticalThickness: 'Cancellous conduit',
    sutureBoundaries: 'Mandibular foramen to Mental foramen'
  },

  graft_void: {
    id: 'graft_void',
    name: 'Complete Alveolar & Palatal Cleft Void',
    latinName: 'Spatium Defectus Alveolaris et Palatini',
    category: 'Surgical Infill Target',
    color: '#f43f5e',
    colorHex: 0xf43f5e,
    berkowitzMorphology:
      'Continuous three-dimensional defect spanning from the anterior pyriform aperture and alveolar crest through the incisive region and along the entire hard palate to the posterior nasal spine (PNS). Bounded medially by the vomer/greater segment margin (OC) and laterally by the lesser palatal shelf (OC_1).',
    clinicalSignificance:
      'Combined defect volume is mathematically computed at 1.72 cm³ (1.44 cm³ alveolar defect + 0.28 cm³ unossified palatal bony cleft gutter). With a standard 30% physiological resorption factor, the targeted harvest volume is 2.20 to 2.35 cm³.',
    surgicalNotes:
      'Alveolar component receives packed autologous cancellous graft to stabilize premaxilla and facilitate tooth 23 eruption; the palatal cleft gutter requires mucoperiosteal flap coverage and secondary palatoplasty closure.',
    volumeEstimate: '1.72 cm³',
    corticalThickness: '0 mm (bony void)',
    sutureBoundaries: 'Bounded by greater segment / vomer line (OC) and lesser palatal shelf (OC_1)'
  },

  skin: {
    id: 'skin',
    name: 'Facial Cutaneous Drape',
    latinName: 'Integumentum Commune Faciei',
    category: 'Soft Tissue',
    color: '#e0b89b',
    colorHex: 0xe0b89b,
    berkowitzMorphology:
      'Patient cutaneous envelope demonstrating left alar base depression, asymmetric philtral ridge, and vermilion border notched deformity.',
    clinicalSignificance:
      'Permits virtual peeling to correlate bone graft support directly with facial soft-tissue projection and alar base symmetry.',
    surgicalNotes: 'Secondary rhinoplasty and lip revision are staged after SABG consolidation.',
    volumeEstimate: '185 cm³',
    corticalThickness: '1.5 – 3.5 mm',
    sutureBoundaries: 'Dermis and subcutis'
  },

  alt_ramec: {
    id: 'alt_ramec',
    name: 'Alt-RAMEC Palatal Expander',
    latinName: 'Apparatus Expansorius Alt-RAMEC',
    category: 'Orthopedic Appliance',
    color: '#38bdf8',
    colorHex: 0x38bdf8,
    berkowitzMorphology:
      'Rigid tooth-borne jackscrew appliance with 4 orthodontic bands on first molars and first premolars, heavy 1.2 mm palatal connector wires, and bilateral anterior extraoral traction hooks emerging into the canine vestibules.',
    clinicalSignificance:
      'Implements Eric Liou’s protocol of alternating weekly rapid expansion (+7mm) and constriction (-7mm) for 7–9 weeks to micro-fracture and disarticulate circummaxillary sutures without causing excessive bite opening or anterior crossbite.',
    surgicalNotes:
      'Crucial for overcoming pterygomaxillary suture resistance prior to reverse-pull maxillary protraction in complete unilateral cleft palate.',
    volumeEstimate: '2.4 cm³ (Appliance Metal)',
    corticalThickness: '1.2 mm Stainless Steel Wire',
    sutureBoundaries: 'Midpalatal seam, Pterygomaxillary, Zygomaticomaxillary'
  },

  facemask: {
    id: 'facemask',
    name: 'Petit Reverse-Pull Orthopedic Facemask',
    latinName: 'Apparatus Extraoralis Protractionis Maxillaris',
    category: 'Orthopedic Appliance',
    color: '#06b6d4',
    colorHex: 0x06b6d4,
    berkowitzMorphology:
      'Extraoral orthopedic appliance consisting of an adjustable midline stainless steel vertical rod, cushioned forehead pad resting on the frontal bone, contoured mental cup resting on the mandibular symphysis, and an adjustable horizontal crossbar.',
    clinicalSignificance:
      'Delivers 400–500 g of forward and downward orthopedic traction per side (900 g total) via heavy elastics angled 20°–30° to the occlusal plane, translating the disarticulated maxilla forward (Le Fort I skeletal advancement).',
    surgicalNotes:
      'Worn 14–16 hours daily. Produces 2.5 to 4.5 mm of skeletal maxillary advancement, improving midfacial retrusion, alar base projection, and correcting Class III skeletal discrepancy.',
    volumeEstimate: '18.5 cm³ (Appliance Assembly)',
    corticalThickness: '4.5 mm Main Rod',
    sutureBoundaries: 'Extraoral support: Frontal bone and Mandibular symphysis'
  }
};

/**
 * Exploded view displacement vectors (Beauchene Disarticulation)
 * [dx, dy, dz] in mm, [rx, ry, rz] in radians
 */
export const DISARTICULATION_VECTORS = {
  greater_maxilla: {
    pos: [18.0, 22.0, -8.0],
    rot: [0.05, 0.08, -0.06]
  },
  greater_teeth: {
    pos: [18.0, 22.0, -8.0],
    rot: [0.05, 0.08, -0.06]
  },
  lesser_maxilla: {
    pos: [-24.0, 16.0, -6.0],
    rot: [0.03, -0.10, 0.08]
  },
  lesser_teeth: {
    pos: [-24.0, 16.0, -6.0],
    rot: [0.03, -0.10, 0.08]
  },
  zygomatic_complex: {
    pos: [0.0, -12.0, 0.0],
    rot: [0.0, 0.0, 0.0],
    // Zygoma expands laterally
    scaleOffset: [1.25, 1.0, 1.0]
  },
  cranial_vault: {
    pos: [0.0, -15.0, 35.0],
    rot: [-0.04, 0.0, 0.0]
  },
  mandible: {
    pos: [0.0, 10.0, -32.0],
    rot: [0.15, 0.0, 0.0]
  },
  graft_void: {
    pos: [-3.5, 20.0, -7.0],
    rot: [0.04, 0.0, 0.0]
  }
};

/**
 * Berkowitz Aberrant Muscular Force Vectors (Physiology Mode)
 * Coordinates in patient RAS space (mm)
 */
export const MUSCLE_VECTORS = [
  {
    id: 'orbicularis_cleft',
    name: 'Cleft Orbicularis Oris (Alar Pull)',
    origin: [-22.0, 48.0, -38.0],   // Lateral lip element on cleft side
    target: [-14.0, 44.0, -26.0],   // Inserts abnormally into cleft alar base
    color: '#f43f5e',
    magnitude: '12 N (Abnormal)',
    description: 'Fibers fail to cross midline; course obliquely upward to insert into the cleft alar base and pyriform margin, causing lateral alar flaring and nostril flattening.'
  },
  {
    id: 'orbicularis_non_cleft',
    name: 'Non-Cleft Orbicularis Oris (Septal Pull)',
    origin: [20.0, 49.0, -38.0],    // Medial lip element on non-cleft side
    target: [2.0, 52.0, -28.0],     // Inserts into columella base & anterior nasal spine
    color: '#06b6d4',
    magnitude: '18 N (Dominant)',
    description: 'Uncountered pull of the larger lip segment pulls the columella and caudal nasal septum towards the non-cleft side.'
  },
  {
    id: 'septopremaxillary_push',
    name: 'Septopremaxillary Growth Vector',
    origin: [0.0, 25.0, -15.0],     // Nasal septum / Vomer junction
    target: [4.0, 50.0, -32.0],     // Pushes premaxilla anteriorly and to the right
    color: '#10b981',
    magnitude: '15 N (Vomerine)',
    description: 'Uninhibited forward growth of the nasal septum pushes the premaxilla forward and rotates it away from the cleft void.'
  },
  {
    id: 'circumoral_collapse',
    name: 'Buccinator Transverse Compression',
    origin: [-45.0, 32.0, -30.0],   // Cheek buccinator muscle
    target: [-26.0, 42.0, -34.0],   // Compresses unsupported lesser segment
    color: '#fbbf24',
    magnitude: '10 N (Compressive)',
    description: 'Unchecked inward pressure of the cheek muscles causes medial collapse and transverse deficiency of the unsupported lesser maxillary segment.'
  },
  {
    id: 'levator_palatini_aberrant',
    name: 'Aberrant Levator Veli Palatini',
    origin: [-24.0, 8.0, -20.0],    // Skull base origin near Eustachian tube
    target: [-12.0, 22.0, -28.0],   // Inserts longitudinally into posterior hard palate border
    color: '#a855f7',
    magnitude: '8 N (Longitudinal)',
    description: 'Instead of forming a continuous transverse velar sling, cleft levator fibers run longitudinally and insert into the posterior hard palate, preventing velopharyngeal closure.'
  }
];

/**
 * Secondary Alveolar Bone Grafting (SABG) Simulation Configuration
 * Based on Bergland, Kindelan, and Berkowitz clinical protocols.
 */
export const SABG_SIMULATION_CONFIG = {
  baselineVoidVolume: 1.72, // cm³
  targetHarvestMultiplier: 1.30, // +30% for physiological resorption
  targetHarvestVolume: 2.24, // cm³
  donorSites: [
    {
      id: 'iliac',
      name: 'Anterior Iliac Crest',
      tag: 'Gold Standard',
      type: 'Autologous Cancellous Marrow',
      harvestVolume: 2.24,
      cellularity: 'High osteoprogenitor & stem cell density',
      morbidity: 'Moderate donor site gait pain (2–4 weeks)',
      color: '#10b981'
    },
    {
      id: 'symphysis',
      name: 'Mandibular Symphysis',
      tag: 'Intraoral Bed',
      type: 'Corticocancellous Block / Particulate',
      harvestVolume: 1.35,
      cellularity: 'Moderate osteogenicity; membranous bone origin',
      morbidity: 'Low donor site pain, transient mental nerve dysesthesia risk',
      color: '#06b6d4'
    },
    {
      id: 'bmp2',
      name: 'rhBMP-2 / ACS Bio-Composite',
      tag: 'Bioengineered',
      type: 'Osteoinductive Allograft Matrix',
      harvestVolume: 2.24,
      cellularity: 'Concentrated recombinant human morphogenetic protein',
      morbidity: 'Zero donor site surgery; transient localized seroma/edema',
      color: '#a855f7'
    }
  ],
  timeline: [
    {
      id: 'day0',
      label: 'Day 0',
      title: 'Immediate Post-Op (Overpacked)',
      resorptionPct: 0,
      volume: 2.24,
      densityHU: '200 – 350 HU',
      color: '#f43f5e',
      emissive: '#881337',
      berglandScore: 'Evaluation Pending Consolidation',
      notes: 'Autologous cancellous graft chips packed into defect and overfilled +30%. Vascular clot establishes osteogenic hematoma.'
    },
    {
      id: 'month3',
      label: '3 Months',
      title: 'Neovascularization & Woven Callus',
      resorptionPct: 10,
      volume: 2.02,
      densityHU: '450 – 650 HU',
      color: '#fb923c',
      emissive: '#7c2d12',
      berglandScore: 'Developing Bony Bridge',
      notes: 'Capillary ingrowth complete. Woven bone trabeculae bridge between greater and lesser maxillary margins.'
    },
    {
      id: 'month6',
      label: '6 Months',
      title: 'Lamellar Bridging & Cortical Union',
      resorptionPct: 20,
      volume: 1.79,
      densityHU: '750 – 950 HU',
      color: '#fde047',
      emissive: '#713f12',
      berglandScore: 'Bergland Type I (>75% Alveolar Height)',
      notes: 'Mature lamellar bone replacing provisional callus. Continuous cortical plate formed along the alveolar ridge and nasal floor.'
    },
    {
      id: 'month12',
      label: '12 Months',
      title: 'Mature Osteointegration & Remodeling',
      resorptionPct: 25,
      volume: 1.68,
      densityHU: '1000 – 1250 HU',
      color: '#ede7d8',
      emissive: '#000000',
      berglandScore: 'Bergland Type I (Ideal Permanent Integration)',
      notes: 'Stable corticocancellous architecture with complete continuity. Alveolar ridge ready for spontaneous or guided canine eruption.'
    }
  ],
  canineEruption: {
    toothId: '23',
    name: 'Cleft-Side Permanent Canine (Tooth 23)',
    initialStatus: 'Impacted high above cleft void, mesio-angular tip',
    eruptedStatus: 'Spontaneously erupted into attached keratinized gingiva with intact PDL space',
    translationDelta: [3.2, -1.2, -11.0], // [dx, dy, dz] mm
    rotationDelta: [0.05, 0.12, -0.08] // rad
  }
};

/**
 * Alt-RAMEC & Petit Reverse-Pull Facemask Biomechanical Protocol Configuration
 * Based on: Eric J.W. Liou, "A New Protocol for Maxillary Protraction in Cleft Patients", JCO 2005.
 */
export const ALTRANEC_SIMULATION_CONFIG = {
  protocolName: 'Liou Alt-RAMEC & Petit Maxillary Protraction',
  citation: 'Liou EJ, Tsai WC. J Clin Orthod 2005;39(12):698-709.',
  weeklyCycles: [
    {
      week: 1,
      mode: 'expansion',
      badge: 'Week 1: Expansion (+7mm)',
      dailyRate: '+1.0 mm/day (2 turns morning, 2 turns evening)',
      expansionWidth: 7.0, // mm
      sutureMobility: 'Early circummaxillary micro-fracturing',
      notes: 'Initial rapid transverse expansion uncouples the midpalatal seam and strains the rigid pterygomaxillary junction.'
    },
    {
      week: 2,
      mode: 'constriction',
      badge: 'Week 2: Constriction (-7mm)',
      dailyRate: '-1.0 mm/day (Reversing screw)',
      expansionWidth: 0.0,
      sutureMobility: 'Disorganization of collagen fibers without osseous union',
      notes: 'Constriction prevents excessive posterior crossbite while keeping sutural osteogenic blastema mobilized.'
    },
    {
      week: 3,
      mode: 'expansion',
      badge: 'Week 3: Expansion (+7mm)',
      dailyRate: '+1.0 mm/day (Re-expanding)',
      expansionWidth: 7.0,
      sutureMobility: 'Progressive suture gap widening & hypervascularity',
      notes: 'Second expansion cycle fractures newly formed woven bone bridges, progressively mobilizing midfacial complex.'
    },
    {
      week: 4,
      mode: 'constriction',
      badge: 'Week 4: Constriction (-7mm)',
      dailyRate: '-1.0 mm/day (Re-constricting)',
      expansionWidth: 0.0,
      sutureMobility: 'Complete disarticulation of circummaxillary sutures',
      notes: 'Circummaxillary resistance eliminated. Maxilla is now hypermobile and primed for heavy extraoral orthopedic traction.'
    },
    {
      week: 5,
      mode: 'protraction',
      badge: 'Weeks 5–9: Reverse-Pull Facemask',
      dailyRate: '450g / side (900g total), 14–16 hrs/day',
      expansionWidth: 3.5, // optimal stabilizing transverse width
      sutureMobility: 'True skeletal Le Fort I forward displacement',
      notes: 'Heavy orthopedic traction pulls the mobilized maxilla forward and downward 20°–30° to occlusal plane.'
    }
  ],
  sutures: [
    { id: 'pterygo', name: 'Pterygomaxillary Suture', resistance: 'High (Primary Posterior Buttress)', strain: 'Disarticulated' },
    { id: 'zygomax', name: 'Zygomaticomaxillary Suture', resistance: 'Moderate (Lateral Midfacial Wall)', strain: 'Disarticulated' },
    { id: 'zygotemp', name: 'Zygomaticotemporal Suture', resistance: 'Moderate (Zygomatic Arch)', strain: 'Disarticulated' },
    { id: 'frontomax', name: 'Frontomaxillary / Nasomaxillary', resistance: 'Low-Moderate (Superior Pivot Hinge)', strain: 'Patent Hinge' },
    { id: 'transpal', name: 'Transverse Palatal Suture', resistance: 'High (Palatine Bone Junction)', strain: 'Completely Mobilized' }
  ],
  facemask: {
    forcePerSideGrams: 450,
    forceAngleDeg: 25,
    elasticVectorRight: {
      origin: [18.0, 91.0, -58.0], // Crossbar hook tip (adjusted downward to mouth level)
      target: [24.0, 56.5, -41.5]  // Intraoral Alt-RAMEC hook tip
    },
    elasticVectorLeft: {
      origin: [-18.0, 91.0, -58.0], // Crossbar hook tip (adjusted downward to mouth level)
      target: [-18.0, 55.5, -42.5]  // Intraoral Alt-RAMEC hook tip
    },
    advancementRangeMm: [0.0, 4.5] // mm forward displacement under traction
  }
};


