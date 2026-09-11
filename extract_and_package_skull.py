import os
import json
import numpy as np
import trimesh

# Directory setup
base_dir = r"d:\partof_BP3D_4.0_obj_99"
public_dir = os.path.join(base_dir, "public")
models_dir = os.path.join(public_dir, "models")
data_dir = os.path.join(public_dir, "data")
os.makedirs(models_dir, exist_ok=True)
os.makedirs(data_dir, exist_ok=True)

skull_obj_dir = os.path.join(base_dir, "partof_BP3D_4.0_obj_99")
teeth_obj_dir = os.path.join(base_dir, "isa_BP3D_4.0_obj_99", "isa_BP3D_4.0_obj_99")

# 22 Cranial and Facial Bones (Verified 100% against English names)
SKULL_CATALOG = [
    {
        "file": "FJ3394.obj",
        "id": "sphenoid_bone",
        "name": "Sphenoid Bone",
        "latin": "Os sphenoidale",
        "fma": "FMA52736",
        "category": "Neurocranium (Cranial Base)",
        "subgroup": "Central Anchor",
        "color": "#e8c99b",
        "description": "Keystone bone of the cranial base. Articulates with almost every cranial bone, houses the pituitary gland in the sella turcica, and transmits optic and cranial nerves through its fissures and foramina.",
        "articulations": ["Frontal", "Occipital", "Parietals", "Temporals", "Ethmoid", "Zygomatics", "Palatines", "Vomer"],
        "is_anchor": True,
        "explode_factor": 0.0
    },
    {
        "file": "FJ3200.obj",
        "id": "frontal_bone",
        "name": "Frontal Bone",
        "latin": "Os frontale",
        "fma": "FMA52734",
        "category": "Neurocranium (Calvaria)",
        "subgroup": "Vault",
        "color": "#d9b897",
        "description": "Forms the forehead, superior rims of the orbits, and anterior cranial fossa. Contains the frontal sinuses and meets the parietals at the coronal suture.",
        "articulations": ["Parietals (Coronal suture)", "Sphenoid", "Ethmoid", "Nasal bones", "Maxillae", "Zygomatics", "Lacrimals"],
        "is_anchor": False,
        "explode_factor": 1.15
    },
    {
        "file": "FJ3309.obj",
        "id": "occipital_bone",
        "name": "Occipital Bone",
        "latin": "Os occipitale",
        "fma": "FMA52735",
        "category": "Neurocranium (Calvaria)",
        "subgroup": "Vault",
        "color": "#c8b09b",
        "description": "Forms the posterior and base of the neurocranium. Traversed by the foramen magnum transmitting the spinal cord, and presents bilateral condyles articulating with the atlas (C1).",
        "articulations": ["Parietals (Lambdoid suture)", "Temporals", "Sphenoid (Spheno-occipital synchondrosis)", "Atlas (C1)"],
        "is_anchor": False,
        "explode_factor": 1.1
    },
    {
        "file": "FJ3380.obj",
        "id": "right_parietal_bone",
        "name": "Right Parietal Bone",
        "latin": "Os parietale dextrum",
        "fma": "FMA52788",
        "category": "Neurocranium (Calvaria)",
        "subgroup": "Vault",
        "color": "#e0c2a8",
        "description": "Quadrilateral bone forming the superior-lateral vault of the cranium. Meets the contralateral parietal at the sagittal suture.",
        "articulations": ["Left Parietal (Sagittal)", "Frontal (Coronal)", "Occipital (Lambdoid)", "Right Temporal (Squamosal)", "Sphenoid"],
        "is_anchor": False,
        "explode_factor": 1.2
    },
    {
        "file": "FJ3274.obj",
        "id": "left_parietal_bone",
        "name": "Left Parietal Bone",
        "latin": "Os parietale sinistrum",
        "fma": "FMA52789",
        "category": "Neurocranium (Calvaria)",
        "subgroup": "Vault",
        "color": "#e0c2a8",
        "description": "Quadrilateral bone forming the left superior-lateral vault of the cranium.",
        "articulations": ["Right Parietal (Sagittal)", "Frontal (Coronal)", "Occipital (Lambdoid)", "Left Temporal (Squamosal)", "Sphenoid"],
        "is_anchor": False,
        "explode_factor": 1.2
    },
    {
        "file": "FJ3386.obj",
        "id": "right_temporal_bone",
        "name": "Right Temporal Bone",
        "latin": "Os temporale dextrum",
        "fma": "FMA52738",
        "category": "Neurocranium (Cranial Base)",
        "subgroup": "Lateral Base",
        "color": "#c2a890",
        "description": "Complex bone situated at the lateral base of the skull. Encloses the middle and inner ear organs, external auditory meatus, and forms the glenoid fossa for the TMJ.",
        "articulations": ["Right Parietal", "Sphenoid", "Occipital", "Right Zygomatic", "Mandible (TMJ)"],
        "is_anchor": False,
        "explode_factor": 1.25
    },
    {
        "file": "FJ3281.obj",
        "id": "left_temporal_bone",
        "name": "Left Temporal Bone",
        "latin": "Os temporale sinistrum",
        "fma": "FMA52739",
        "category": "Neurocranium (Cranial Base)",
        "subgroup": "Lateral Base",
        "color": "#c2a890",
        "description": "Complex bone situated at the left lateral base of the skull.",
        "articulations": ["Left Parietal", "Sphenoid", "Occipital", "Left Zygomatic", "Mandible (TMJ)"],
        "is_anchor": False,
        "explode_factor": 1.25
    },
    {
        "file": "FJ3199.obj",
        "id": "ethmoid_bone",
        "name": "Ethmoid Bone",
        "latin": "Os ethmoidale",
        "fma": "FMA52737",
        "category": "Neurocranium (Cranial Base)",
        "subgroup": "Anterior Base",
        "color": "#dfd0bc",
        "description": "Porous, lightweight bone positioned at the anterior cranial base between the two orbits. Supports the olfactory bulbs on the cribriform plate and forms the superior nasal septum.",
        "articulations": ["Sphenoid", "Frontal", "Vomer", "Inferior Nasal Conchae", "Nasal bones", "Maxillae", "Lacrimals", "Palatines"],
        "is_anchor": False,
        "explode_factor": 0.85
    },
    {
        "file": "FJ3375.obj",
        "id": "right_maxilla",
        "name": "Right Maxilla",
        "latin": "Maxilla dextra",
        "fma": "FMA52748",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Upper Jaw",
        "color": "#ecd8c2",
        "description": "Forms the right upper jaw, hard palate floor, orbital floor, and lateral nasal aperture. Houses the right maxillary secondary dentition (FDI 11–17).",
        "articulations": ["Left Maxilla (Intermaxillary suture)", "Frontal", "Ethmoid", "Nasal", "Zygomatic", "Lacrimal", "Inferior Concha", "Palatine", "Vomer"],
        "is_anchor": False,
        "explode_factor": 1.15
    },
    {
        "file": "FJ3269.obj",
        "id": "left_maxilla",
        "name": "Left Maxilla",
        "latin": "Maxilla sinistra",
        "fma": "FMA52749",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Upper Jaw",
        "color": "#ecd8c2",
        "description": "Forms the left upper jaw, hard palate floor, orbital floor, and lateral nasal aperture. Houses the left maxillary secondary dentition (FDI 21–27).",
        "articulations": ["Right Maxilla (Intermaxillary suture)", "Frontal", "Ethmoid", "Nasal", "Zygomatic", "Lacrimal", "Inferior Concha", "Palatine", "Vomer"],
        "is_anchor": False,
        "explode_factor": 1.15
    },
    {
        "file": "FJ3289.obj",
        "id": "mandible",
        "name": "Mandible",
        "latin": "Mandibula",
        "fma": "FMA52747",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Lower Jaw",
        "color": "#d9c3ad",
        "description": "The strongest and only mobile bone of the skull. Comprises a curved horizontal body housing the 14 mandibular teeth (FDI 31–37, 41–47) and bilateral rami articulating with the temporal glenoid fossae (TMJ).",
        "articulations": ["Temporals (Bilateral Temporomandibular Joints)"],
        "is_anchor": False,
        "explode_factor": 1.35
    },
    {
        "file": "FJ3392.obj",
        "id": "right_zygomatic_bone",
        "name": "Right Zygomatic Bone",
        "latin": "Os zygomaticum dextrum",
        "fma": "FMA52750",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Cheek & Orbit",
        "color": "#d3bc9f",
        "description": "Cheekbone forming the prominence of the right cheek, inferolateral orbital margin, and anterior half of the zygomatic arch.",
        "articulations": ["Right Maxilla", "Right Temporal (Zygomatic arch)", "Frontal", "Sphenoid"],
        "is_anchor": False,
        "explode_factor": 1.3
    },
    {
        "file": "FJ3287.obj",
        "id": "left_zygomatic_bone",
        "name": "Left Zygomatic Bone",
        "latin": "Os zygomaticum sinistrum",
        "fma": "FMA52751",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Cheek & Orbit",
        "color": "#d3bc9f",
        "description": "Cheekbone forming the prominence of the left cheek, inferolateral orbital margin, and anterior half of the zygomatic arch.",
        "articulations": ["Left Maxilla", "Left Temporal (Zygomatic arch)", "Frontal", "Sphenoid"],
        "is_anchor": False,
        "explode_factor": 1.3
    },
    {
        "file": "FJ3378.obj",
        "id": "right_nasal_bone",
        "name": "Right Nasal Bone",
        "latin": "Os nasale dextrum",
        "fma": "FMA52756",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Nasal Complex",
        "color": "#e2d2be",
        "description": "Small oblong bone forming the right superior bridge of the nose.",
        "articulations": ["Left Nasal", "Frontal (Internasal)", "Right Maxilla", "Ethmoid"],
        "is_anchor": False,
        "explode_factor": 1.35
    },
    {
        "file": "FJ3272.obj",
        "id": "left_nasal_bone",
        "name": "Left Nasal Bone",
        "latin": "Os nasale sinistrum",
        "fma": "FMA52757",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Nasal Complex",
        "color": "#e2d2be",
        "description": "Small oblong bone forming the left superior bridge of the nose.",
        "articulations": ["Right Nasal", "Frontal (Internasal)", "Left Maxilla", "Ethmoid"],
        "is_anchor": False,
        "explode_factor": 1.35
    },
    {
        "file": "FJ3379.obj",
        "id": "right_palatine_bone",
        "name": "Right Palatine Bone",
        "latin": "Os palatinum dextrum",
        "fma": "FMA52752",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Deep Facial",
        "color": "#d6c1a8",
        "description": "L-shaped bone forming the posterior portion of the hard palate and lateral wall of the nasal cavity.",
        "articulations": ["Left Palatine", "Right Maxilla", "Sphenoid", "Ethmoid", "Vomer", "Inferior Concha"],
        "is_anchor": False,
        "explode_factor": 0.95
    },
    {
        "file": "FJ3273.obj",
        "id": "left_palatine_bone",
        "name": "Left Palatine Bone",
        "latin": "Os palatinum sinistrum",
        "fma": "FMA52753",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Deep Facial",
        "color": "#d6c1a8",
        "description": "L-shaped bone forming the posterior left portion of the hard palate.",
        "articulations": ["Right Palatine", "Left Maxilla", "Sphenoid", "Ethmoid", "Vomer", "Inferior Concha"],
        "is_anchor": False,
        "explode_factor": 0.95
    },
    {
        "file": "FJ3371.obj",
        "id": "right_lacrimal_bone",
        "name": "Right Lacrimal Bone",
        "latin": "Os lacrimale dextrum",
        "fma": "FMA52754",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Orbit",
        "color": "#eae0d3",
        "description": "Smallest and most fragile bone of the face, situated at the anterior medial wall of the right orbit. Contributes to the nasolacrimal canal.",
        "articulations": ["Frontal", "Ethmoid", "Right Maxilla", "Inferior Concha"],
        "is_anchor": False,
        "explode_factor": 1.1
    },
    {
        "file": "FJ3265.obj",
        "id": "left_lacrimal_bone",
        "name": "Left Lacrimal Bone",
        "latin": "Os lacrimale sinistrum",
        "fma": "FMA52755",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Orbit",
        "color": "#eae0d3",
        "description": "Small, fragile bone forming the anterior medial wall of the left orbit.",
        "articulations": ["Frontal", "Ethmoid", "Left Maxilla", "Inferior Concha"],
        "is_anchor": False,
        "explode_factor": 1.1
    },
    {
        "file": "FJ3369.obj",
        "id": "right_inferior_nasal_concha",
        "name": "Right Inferior Nasal Concha",
        "latin": "Concha nasalis inferior dextra",
        "fma": "FMA52758",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Nasal Complex",
        "color": "#ded0be",
        "description": "Curved lamina extending horizontally along the lateral wall of the right nasal cavity, optimizing airflow warming and humidification.",
        "articulations": ["Ethmoid", "Right Maxilla", "Lacrimal", "Palatine"],
        "is_anchor": False,
        "explode_factor": 1.05
    },
    {
        "file": "FJ3263.obj",
        "id": "left_inferior_nasal_concha",
        "name": "Left Inferior Nasal Concha",
        "latin": "Concha nasalis inferior sinistra",
        "fma": "FMA52759",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Nasal Complex",
        "color": "#ded0be",
        "description": "Curved lamina extending along the lateral wall of the left nasal cavity.",
        "articulations": ["Ethmoid", "Left Maxilla", "Lacrimal", "Palatine"],
        "is_anchor": False,
        "explode_factor": 1.05
    },
    {
        "file": "FJ3395.obj",
        "id": "vomer",
        "name": "Vomer",
        "latin": "Vomer",
        "fma": "FMA52760",
        "category": "Viscerocranium (Facial)",
        "subgroup": "Nasal Complex",
        "color": "#cbbaa5",
        "description": "Unpaired ploughshare-shaped bone forming the posterior and postero-inferior portion of the bony nasal septum.",
        "articulations": ["Sphenoid", "Ethmoid", "Left & Right Maxillae", "Left & Right Palatines"],
        "is_anchor": False,
        "explode_factor": 0.9
    }
]

# 28 Secondary Permanent Teeth from isa_BP3D_4.0_obj_99
TEETH_CATALOG = [
    # --- QUADRANT 1: Maxillary Right ---
    {
        "file": "FJ1279.obj",
        "id": "tooth_11",
        "fdi": "11",
        "universal": "8 (UR1)",
        "name": "Upper Right Central Incisor (#11)",
        "latin": "Dens incisivus primus superior dexter",
        "fma": "FMA55681",
        "bp": "BP7683",
        "parent_bone": "right_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q1 (Upper Right)",
        "tooth_type": "Central Incisor",
        "roots": "Single Root (conical)",
        "description": "Right maxillary central incisor (FDI 11 / UR1). Shovel-shaped crown with straight incisal edge and conical single root. Critical for anterior aesthetic display, incisal guidance, and phonetics.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1280.obj",
        "id": "tooth_12",
        "fdi": "12",
        "universal": "7 (UR2)",
        "name": "Upper Right Lateral Incisor (#12)",
        "latin": "Dens incisivus secundus superior dexter",
        "fma": "FMA55680",
        "bp": "BP7747",
        "parent_bone": "right_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q1 (Upper Right)",
        "tooth_type": "Lateral Incisor",
        "roots": "Single Root (slight distal apical curve)",
        "description": "Right maxillary lateral incisor (FDI 12 / UR2). Rounded incisal angles with single slender root. Shows highest anatomical variability among anterior teeth (peg laterals, palatogingival grooves).",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1281.obj",
        "id": "tooth_13",
        "fdi": "13",
        "universal": "6 (UR3)",
        "name": "Upper Right Canine (#13)",
        "latin": "Dens caninus superior dexter",
        "fma": "FMA55798",
        "bp": "BP7684",
        "parent_bone": "right_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q1 (Upper Right)",
        "tooth_type": "Canine",
        "roots": "Single Root (longest root in dentition, canine eminence)",
        "description": "Right maxillary canine (FDI 13 / UR3). Cornerstone of the dental arch with prominent labial ridge and canine eminence. Single robust root providing canine-protected mutually protected occlusion.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1277.obj",
        "id": "tooth_14",
        "fdi": "14",
        "universal": "5 (UR4)",
        "name": "Upper Right First Premolar (#14)",
        "latin": "Dens praemolaris primus superior dexter",
        "fma": "FMA55689",
        "bp": "BP7681",
        "parent_bone": "right_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q1 (Upper Right)",
        "tooth_type": "First Premolar",
        "roots": "Bifurcated Root (buccal & palatal)",
        "description": "Right maxillary first premolar (FDI 14 / UR4). Distinctive two-cusp occlusal table with mesial concavity and bifurcated buccal and palatal roots.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1278.obj",
        "id": "tooth_15",
        "fdi": "15",
        "universal": "4 (UR5)",
        "name": "Upper Right Second Premolar (#15)",
        "latin": "Dens praemolaris secundus superior dexter",
        "fma": "FMA55688",
        "bp": "BP7682",
        "parent_bone": "right_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q1 (Upper Right)",
        "tooth_type": "Second Premolar",
        "roots": "Single Root",
        "description": "Right maxillary second premolar (FDI 15 / UR5). Symmetrical cusps of nearly equal height with single oval root.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1276.obj",
        "id": "tooth_16",
        "fdi": "16",
        "universal": "3 (UR6)",
        "name": "Upper Right First Molar (#16)",
        "latin": "Dens molaris primus superior dexter",
        "fma": "FMA55698",
        "bp": "BP7680",
        "parent_bone": "right_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q1 (Upper Right)",
        "tooth_type": "First Molar",
        "roots": "Three Roots (mesiobuccal, distobuccal, palatal)",
        "description": "Right maxillary first molar (FDI 16 / UR6). Key of Angle's Class I occlusion. Rhomboidal occlusal outline with prominent oblique ridge and tripod three-root configuration.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1275.obj",
        "id": "tooth_17",
        "fdi": "17",
        "universal": "2 (UR7)",
        "name": "Upper Right Second Molar (#17)",
        "latin": "Dens molaris secundus superior dexter",
        "fma": "FMA55697",
        "bp": "BP5452",
        "parent_bone": "right_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q1 (Upper Right)",
        "tooth_type": "Second Molar",
        "roots": "Three Roots (less divergent)",
        "description": "Right maxillary second molar (FDI 17 / UR7). Smaller heart-shaped or rhomboid crown with three converging roots.",
        "explode_factor": 1.0
    },

    # --- QUADRANT 2: Maxillary Left ---
    {
        "file": "FJ1265.obj",
        "id": "tooth_21",
        "fdi": "21",
        "universal": "9 (UL1)",
        "name": "Upper Left Central Incisor (#21)",
        "latin": "Dens incisivus primus superior sinister",
        "fma": "FMA55682",
        "bp": "BP5440",
        "parent_bone": "left_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q2 (Upper Left)",
        "tooth_type": "Central Incisor",
        "roots": "Single Root (conical)",
        "description": "Left maxillary central incisor (FDI 21 / UL1). Shovel-shaped crown with straight incisal edge and conical single root. Primary aesthetic key.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1266.obj",
        "id": "tooth_22",
        "fdi": "22",
        "universal": "10 (UL2)",
        "name": "Upper Left Lateral Incisor (#22)",
        "latin": "Dens incisivus secundus superior sinister",
        "fma": "FMA55683",
        "bp": "BP5438",
        "parent_bone": "left_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q2 (Upper Left)",
        "tooth_type": "Lateral Incisor",
        "roots": "Single Root",
        "description": "Left maxillary lateral incisor (FDI 22 / UL2). Single slender root with rounded disto-incisal angle.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1267.obj",
        "id": "tooth_23",
        "fdi": "23",
        "universal": "11 (UL3)",
        "name": "Upper Left Canine (#23)",
        "latin": "Dens caninus superior sinister",
        "fma": "FMA55799",
        "bp": "BP5482",
        "parent_bone": "left_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q2 (Upper Left)",
        "tooth_type": "Canine",
        "roots": "Single Root (longest root in dentition, canine eminence)",
        "description": "Left maxillary canine (FDI 23 / UL3). Strong canine cusp discluding posterior teeth during lateral excursions.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1262.obj",
        "id": "tooth_24",
        "fdi": "24",
        "universal": "12 (UL4)",
        "name": "Upper Left First Premolar (#24)",
        "latin": "Dens praemolaris primus superior sinister",
        "fma": "FMA55690",
        "bp": "BP5468",
        "parent_bone": "left_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q2 (Upper Left)",
        "tooth_type": "First Premolar",
        "roots": "Bifurcated Root (buccal & palatal)",
        "description": "Left maxillary first premolar (FDI 24 / UL4). Two cusps with mesial developmental groove and bifurcated roots.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1264.obj",
        "id": "tooth_25",
        "fdi": "25",
        "universal": "13 (UL5)",
        "name": "Upper Left Second Premolar (#25)",
        "latin": "Dens praemolaris secundus superior sinister",
        "fma": "FMA55691",
        "bp": "BP5466",
        "parent_bone": "left_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q2 (Upper Left)",
        "tooth_type": "Second Premolar",
        "roots": "Single Root",
        "description": "Left maxillary second premolar (FDI 25 / UL5). Symmetrical bicuspid with single tapering root.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1261.obj",
        "id": "tooth_26",
        "fdi": "26",
        "universal": "14 (UL6)",
        "name": "Upper Left First Molar (#26)",
        "latin": "Dens molaris primus superior sinister",
        "fma": "FMA55699",
        "bp": "BP5455",
        "parent_bone": "left_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q2 (Upper Left)",
        "tooth_type": "First Molar",
        "roots": "Three Roots (mesiobuccal, distobuccal, palatal)",
        "description": "Left maxillary first molar (FDI 26 / UL6). Angle Class I key of occlusion with prominent Cusp of Carabelli potential and three tripod roots.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1263.obj",
        "id": "tooth_27",
        "fdi": "27",
        "universal": "15 (UL7)",
        "name": "Upper Left Second Molar (#27)",
        "latin": "Dens molaris secundus superior sinister",
        "fma": "FMA55700",
        "bp": "BP5453",
        "parent_bone": "left_maxilla",
        "arch": "Maxillary",
        "quadrant": "Q2 (Upper Left)",
        "tooth_type": "Second Molar",
        "roots": "Three Roots",
        "description": "Left maxillary second molar (FDI 27 / UL7). Distolingual cusp diminished or absent, three roots closer together.",
        "explode_factor": 1.0
    },

    # --- QUADRANT 3: Mandibular Left ---
    {
        "file": "FJ1258.obj",
        "id": "tooth_31",
        "fdi": "31",
        "universal": "24 (LL1)",
        "name": "Lower Left Central Incisor (#31)",
        "latin": "Dens incisivus primus inferior sinister",
        "fma": "FMA57143",
        "bp": "BP5447",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q3 (Lower Left)",
        "tooth_type": "Central Incisor",
        "roots": "Single Root (narrow, flattened mesiodistally)",
        "description": "Left mandibular central incisor (FDI 31 / LL1). The smallest and most symmetrical tooth in the permanent human dentition with a single flat root.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1259.obj",
        "id": "tooth_32",
        "fdi": "32",
        "universal": "23 (LL2)",
        "name": "Lower Left Lateral Incisor (#32)",
        "latin": "Dens incisivus secundus inferior sinister",
        "fma": "FMA57141",
        "bp": "BP5444",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q3 (Lower Left)",
        "tooth_type": "Lateral Incisor",
        "roots": "Single Root",
        "description": "Left mandibular lateral incisor (FDI 32 / LL2). Slightly larger than central incisor with incisal edge twisted slightly distally on the root base.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1260.obj",
        "id": "tooth_33",
        "fdi": "33",
        "universal": "22 (LL3)",
        "name": "Lower Left Canine (#33)",
        "latin": "Dens caninus inferior sinister",
        "fma": "FMA55687",
        "bp": "BP5480",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q3 (Lower Left)",
        "tooth_type": "Canine",
        "roots": "Single Root (long, stable mandibular anchor)",
        "description": "Left mandibular canine (FDI 33 / LL3). Long, smooth labial contour with single powerful root anchoring the mandibular anterior corner.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1255.obj",
        "id": "tooth_34",
        "fdi": "34",
        "universal": "21 (LL4)",
        "name": "Lower Left First Premolar (#34)",
        "latin": "Dens praemolaris primus inferior sinister",
        "fma": "FMA55693",
        "bp": "BP5472",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q3 (Lower Left)",
        "tooth_type": "First Premolar",
        "roots": "Single Root",
        "description": "Left mandibular first premolar (FDI 34 / LL4). Dominant buccal cusp with small non-functional lingual cusp and single tapering root.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1257.obj",
        "id": "tooth_35",
        "fdi": "35",
        "universal": "20 (LL5)",
        "name": "Lower Left Second Premolar (#35)",
        "latin": "Dens praemolaris secundus inferior sinister",
        "fma": "FMA55692",
        "bp": "BP5475",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q3 (Lower Left)",
        "tooth_type": "Second Premolar",
        "roots": "Single Root",
        "description": "Left mandibular second premolar (FDI 35 / LL5). Frequently three-cusp type (one buccal, two lingual) with square occlusal table and single root.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1254.obj",
        "id": "tooth_36",
        "fdi": "36",
        "universal": "19 (LL6)",
        "name": "Lower Left First Molar (#36)",
        "latin": "Dens molaris primus inferior sinister",
        "fma": "FMA55704",
        "bp": "BP5462",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q3 (Lower Left)",
        "tooth_type": "First Molar",
        "roots": "Two Roots (mesial & distal, broad buccolingually)",
        "description": "Left mandibular first molar (FDI 36 / LL6). Mandibular anchor of Class I occlusion. Features five cusps (3 buccal, 2 lingual) and two strong divergent roots.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1256.obj",
        "id": "tooth_37",
        "fdi": "37",
        "universal": "18 (LL7)",
        "name": "Lower Left Second Molar (#37)",
        "latin": "Dens molaris secundus inferior sinister",
        "fma": "FMA55703",
        "bp": "BP5459",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q3 (Lower Left)",
        "tooth_type": "Second Molar",
        "roots": "Two Roots (less divergent)",
        "description": "Left mandibular second molar (FDI 37 / LL7). Symmetrical four-cusp cross-groove occlusal pattern ('+ shape') with two parallel roots.",
        "explode_factor": 1.0
    },

    # --- QUADRANT 4: Mandibular Right ---
    {
        "file": "FJ1272.obj",
        "id": "tooth_41",
        "fdi": "41",
        "universal": "25 (LR1)",
        "name": "Lower Right Central Incisor (#41)",
        "latin": "Dens incisivus primus inferior dexter",
        "fma": "FMA57142",
        "bp": "BP5446",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q4 (Lower Right)",
        "tooth_type": "Central Incisor",
        "roots": "Single Root (narrow, flattened mesiodistally)",
        "description": "Right mandibular central incisor (FDI 41 / LR1). Smallest tooth in the arch with single slender root.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1273.obj",
        "id": "tooth_42",
        "fdi": "42",
        "universal": "26 (LR2)",
        "name": "Lower Right Lateral Incisor (#42)",
        "latin": "Dens incisivus secundus inferior dexter",
        "fma": "FMA57140",
        "bp": "BP5443",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q4 (Lower Right)",
        "tooth_type": "Lateral Incisor",
        "roots": "Single Root",
        "description": "Right mandibular lateral incisor (FDI 42 / LR2). Single root with distal developmental groove.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1274.obj",
        "id": "tooth_43",
        "fdi": "43",
        "universal": "27 (LR3)",
        "name": "Lower Right Canine (#43)",
        "latin": "Dens caninus inferior dexter",
        "fma": "FMA55686",
        "bp": "BP5479",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q4 (Lower Right)",
        "tooth_type": "Canine",
        "roots": "Single Root (long, stable mandibular anchor)",
        "description": "Right mandibular canine (FDI 43 / LR3). Smooth continuous labial curve with single powerful root protecting occlusion.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1269.obj",
        "id": "tooth_44",
        "fdi": "44",
        "universal": "28 (LR4)",
        "name": "Lower Right First Premolar (#44)",
        "latin": "Dens praemolaris primus inferior dexter",
        "fma": "FMA55694",
        "bp": "BP5471",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q4 (Lower Right)",
        "tooth_type": "First Premolar",
        "roots": "Single Root",
        "description": "Right mandibular first premolar (FDI 44 / LR4). Prominent buccal cusp and small non-functional lingual cusp.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1271.obj",
        "id": "tooth_45",
        "fdi": "45",
        "universal": "29 (LR5)",
        "name": "Lower Right Second Premolar (#45)",
        "latin": "Dens praemolaris secundus inferior dexter",
        "fma": "FMA55695",
        "bp": "BP5474",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q4 (Lower Right)",
        "tooth_type": "Second Premolar",
        "roots": "Single Root",
        "description": "Right mandibular second premolar (FDI 45 / LR5). Square occlusal table with single robust root.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1268.obj",
        "id": "tooth_46",
        "fdi": "46",
        "universal": "30 (LR6)",
        "name": "Lower Right First Molar (#46)",
        "latin": "Dens molaris primus inferior dexter",
        "fma": "FMA55705",
        "bp": "BP5461",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q4 (Lower Right)",
        "tooth_type": "First Molar",
        "roots": "Two Roots (mesial & distal, broad buccolingually)",
        "description": "Right mandibular first molar (FDI 46 / LR6). Five cusps and two broad roots. Master masticatory unit of the right dental arch.",
        "explode_factor": 1.0
    },
    {
        "file": "FJ1270.obj",
        "id": "tooth_47",
        "fdi": "47",
        "universal": "31 (LR7)",
        "name": "Lower Right Second Molar (#47)",
        "latin": "Dens molaris secundus inferior dexter",
        "fma": "FMA55706",
        "bp": "BP5458",
        "parent_bone": "mandible",
        "arch": "Mandibular",
        "quadrant": "Q4 (Lower Right)",
        "tooth_type": "Second Molar",
        "roots": "Two Roots (less divergent)",
        "description": "Right mandibular second molar (FDI 47 / LR7). Four cusps divided by cruciate groove pattern with two parallel roots.",
        "explode_factor": 1.0
    }
]

print(f"Total catalog entries: {len(SKULL_CATALOG)} bones + {len(TEETH_CATALOG)} teeth = {len(SKULL_CATALOG) + len(TEETH_CATALOG)} structures.")

# 1. Load Skull Bones
loaded_skull_meshes = {}
print("\nLoading 22 skull bone OBJ files...")
for item in SKULL_CATALOG:
    fpath = os.path.join(skull_obj_dir, item["file"])
    m = trimesh.load(fpath, process=False)
    if isinstance(m, trimesh.Scene):
        m = trimesh.util.concatenate(list(m.geometry.values()))
    loaded_skull_meshes[item["id"]] = m
    print(f"  Loaded {item['name']:<32} | {len(m.vertices):>6} vertices | {len(m.faces):>6} faces")

# 2. Load 28 Teeth
loaded_teeth_meshes = {}
print("\nLoading 28 teeth OBJ files...")
for item in TEETH_CATALOG:
    fpath = os.path.join(teeth_obj_dir, item["file"])
    m = trimesh.load(fpath, process=False)
    if isinstance(m, trimesh.Scene):
        m = trimesh.util.concatenate(list(m.geometry.values()))
    loaded_teeth_meshes[item["id"]] = m
    print(f"  Loaded FDI #{item['fdi']:<2} {item['name']:<34} | {len(m.vertices):>5} vertices | {len(m.faces):>5} faces")

# Reference anchor center: sphenoid center
sphenoid_center = loaded_skull_meshes["sphenoid_bone"].centroid
print(f"\nSphenoid Center (Anchor Reference): {sphenoid_center}")

# Transformation matrix from BodyParts3D space to Three.js standard space:
# X_3js = X - Sphenoid_X
# Y_3js = Z - Sphenoid_Z  (Superior -> +Y)
# Z_3js = -(Y - Sphenoid_Y) (Anterior -> +Z)
T_rot = np.array([
    [1.0,  0.0,  0.0, -sphenoid_center[0]],
    [0.0,  0.0,  1.0, -sphenoid_center[2]],
    [0.0, -1.0,  0.0,  sphenoid_center[1]],
    [0.0,  0.0,  0.0,  1.0]
])

scene = trimesh.Scene()
final_metadata = []
bone_disp_map = {}

# 3. Transform and Process Skull Bones
print("\nTransforming bones to Three.js space and calculating disarticulation vectors...")
for item in SKULL_CATALOG:
    mesh = loaded_skull_meshes[item["id"]]
    mesh.apply_transform(T_rot)
    
    centroid = mesh.centroid
    bbox_min = mesh.bounds[0]
    bbox_max = mesh.bounds[1]
    
    if item["is_anchor"]:
        disp_vec = np.array([0.0, 0.0, 0.0])
    else:
        disp_vec = centroid.copy()
        
        # Anatomical tuning for clean Beauchene disarticulation:
        if item["id"] == "mandible":
            disp_vec[1] = -1.4 * abs(disp_vec[1])
            disp_vec[2] = 0.5 * abs(disp_vec[2])
        elif item["id"] == "frontal_bone":
            disp_vec[1] = 1.3 * abs(disp_vec[1])
            disp_vec[2] = 1.1 * abs(disp_vec[2])
        elif "parietal" in item["id"]:
            disp_vec[1] = 1.2 * abs(disp_vec[1])
            disp_vec[0] = 1.3 * disp_vec[0]
        elif item["id"] == "occipital_bone":
            disp_vec[2] = -1.5 * abs(disp_vec[2])
            disp_vec[1] = 0.4 * disp_vec[1]
        elif "temporal" in item["id"]:
            disp_vec[0] = 1.6 * disp_vec[0]
            disp_vec[2] = 0.2 * disp_vec[2]
        elif "maxilla" in item["id"]:
            disp_vec[2] = 1.4 * abs(disp_vec[2])
            disp_vec[1] = -0.5 * abs(disp_vec[1])
        elif "zygomatic" in item["id"]:
            disp_vec[0] = 1.5 * disp_vec[0]
            disp_vec[2] = 1.2 * abs(disp_vec[2])
        elif "nasal_bone" in item["id"]:
            disp_vec[2] = 1.8 * abs(disp_vec[2])
            disp_vec[0] = 1.1 * disp_vec[0]
        elif "palatine" in item["id"]:
            disp_vec[1] = -1.1 * abs(disp_vec[1])
            disp_vec[2] = 0.7 * abs(disp_vec[2])
        elif "lacrimal" in item["id"]:
            disp_vec[2] = 1.3 * abs(disp_vec[2])
        elif "inferior_nasal_concha" in item["id"]:
            disp_vec[2] = 1.2 * abs(disp_vec[2])
        elif item["id"] == "vomer":
            disp_vec[1] = -1.2 * abs(disp_vec[1])
            disp_vec[2] = 0.5 * abs(disp_vec[2])

        norm = np.linalg.norm(disp_vec)
        if norm > 1e-6:
            disp_vec = (disp_vec / norm) * 75.0 * item["explode_factor"]

    bone_disp_map[item["id"]] = disp_vec

    mesh.metadata["name"] = item["id"]
    scene.add_geometry(mesh, node_name=item["id"], geom_name=item["id"])
    
    meta_entry = {
        "id": item["id"],
        "name": item["name"],
        "latin": item["latin"],
        "fma": item["fma"],
        "category": item["category"],
        "subgroup": item["subgroup"],
        "color": item["color"],
        "description": item["description"],
        "articulations": item["articulations"],
        "is_anchor": item["is_anchor"],
        "is_tooth": False,
        "vertex_count": len(mesh.vertices),
        "face_count": len(mesh.faces),
        "centroid": [round(float(c), 3) for c in centroid],
        "bbox_min": [round(float(b), 3) for b in bbox_min],
        "bbox_max": [round(float(b), 3) for b in bbox_max],
        "explode_vector": [round(float(v), 3) for v in disp_vec]
    }
    final_metadata.append(meta_entry)

# 4. Transform and Process 28 Teeth
print("\nTransforming teeth to Three.js space and coupling with parent jaw vectors...")
for item in TEETH_CATALOG:
    mesh = loaded_teeth_meshes[item["id"]]
    mesh.apply_transform(T_rot)
    
    centroid = mesh.centroid
    bbox_min = mesh.bounds[0]
    bbox_max = mesh.bounds[1]
    
    parent_vec = bone_disp_map.get(item["parent_bone"], np.array([0.0, 0.0, 0.0])).copy()
    
    if item["arch"] == "Maxillary":
        # Displace slightly inferiorly (-Y) out of socket by 15mm at max explosion
        disp_vec = parent_vec + np.array([0.0, -15.0, 0.0])
    else:
        # Displace slightly superiorly (+Y) out of socket by 15mm at max explosion
        disp_vec = parent_vec + np.array([0.0, 15.0, 0.0])

    mesh.metadata["name"] = item["id"]
    scene.add_geometry(mesh, node_name=item["id"], geom_name=item["id"])
    
    meta_entry = {
        "id": item["id"],
        "fdi": item["fdi"],
        "universal": item["universal"],
        "name": item["name"],
        "latin": item["latin"],
        "fma": item["fma"],
        "bp": item["bp"],
        "category": f"Permanent Dentition ({item['arch']} Arch)",
        "subgroup": item["quadrant"],
        "tooth_type": item["tooth_type"],
        "parent_bone": item["parent_bone"],
        "roots": item["roots"],
        "color": "#faf8f2", # Pearlescent enamel
        "description": item["description"],
        "articulations": [
            f"Alveolus of {item['parent_bone'].replace('_', ' ').title()}",
            item["tooth_type"],
            item["roots"],
            item["quadrant"]
        ],
        "is_anchor": False,
        "is_tooth": True,
        "vertex_count": len(mesh.vertices),
        "face_count": len(mesh.faces),
        "centroid": [round(float(c), 3) for c in centroid],
        "bbox_min": [round(float(b), 3) for b in bbox_min],
        "bbox_max": [round(float(b), 3) for b in bbox_max],
        "explode_vector": [round(float(v), 3) for v in disp_vec]
    }
    final_metadata.append(meta_entry)

# 5. Export Consolidated GLB
glb_path = os.path.join(models_dir, "skull_atlas.glb")
print(f"\nExporting 50-structure consolidated GLB to {glb_path}...")
glb_bytes = scene.export(file_type="glb")
with open(glb_path, "wb") as f:
    f.write(glb_bytes)
print(f"Successfully exported skull_atlas.glb ({len(glb_bytes) / 1024 / 1024:.2f} MB)")

# 6. Export Metadata JSON
json_path = os.path.join(data_dir, "skull_metadata.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(final_metadata, f, indent=2)
print(f"Successfully exported {len(final_metadata)} items to metadata JSON at {json_path}")
