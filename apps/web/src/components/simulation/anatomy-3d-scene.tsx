'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView } from '@prismora/ui';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye as EyeIcon,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Activity,
  Heart,
  Dna,
  CheckCircle2,
  X,
  Brain as BrainIcon,
  Shield,
  Sliders,
  ChevronRight,
  Sun,
  Zap,
  Compass,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export type AnatomySystemMode = 'full-body' | 'eye' | 'brain' | 'skeleton';
export type AnatomyGender = 'male' | 'female';

export interface AnatomicalLandmark {
  id: string;
  name: string;
  system: 'Reproductive' | 'Endocrine' | 'Nervous' | 'Sensory/Optical' | 'Skeletal' | 'Circulatory';
  mode: AnatomySystemMode;
  gender?: AnatomyGender;
  position: [number, number, number]; // 3D coordinates in normalized space
  cameraFocus: [number, number, number]; // Optimal camera viewing position
  lookAt: [number, number, number]; // Target look-at point
  ncertReference: string;
  physiologicalRole: string;
  clinicalSignificance: string;
  keyBiomolecules: string[];
}

export const COMPREHENSIVE_LANDMARKS: AnatomicalLandmark[] = [
  // ==========================================
  // FULL BODY - REPRODUCTIVE & PELVIC
  // ==========================================
  {
    id: 'male-testes',
    name: 'Testes & Scrotum (Extra-Abdominal)',
    system: 'Reproductive',
    mode: 'full-body',
    gender: 'male',
    position: [0, -0.06, 0.08],
    cameraFocus: [0, -0.06, 0.8],
    lookAt: [0, -0.06, 0],
    ncertReference: 'NCERT Class 12, Chapter 3, Section 3.1: Male Reproductive System',
    physiologicalRole:
      'Primary male gonads suspended outside the abdominopelvic cavity within the scrotum. The scrotum functions as a biological thermoregulator, maintaining testicular temperature 2.0–2.5°C lower than internal core body temperature (37°C), essential for continuous spermatogenesis. Houses ~250 testicular lobules with 1–3 highly coiled seminiferous tubules containing spermatogonia and nurse Sertoli cells.',
    clinicalSignificance:
      'Cryptorchidism (undescended testes) leads to irreversible azoospermia and elevated risk of testicular seminoma due to chronic intra-abdominal thermal stress.',
    keyBiomolecules: ['Testosterone (Leydig cells)', 'Inhibin B (Sertoli cells)', 'Androgen-Binding Protein (ABP)', 'FSH & LH'],
  },
  {
    id: 'male-vas-deferens',
    name: 'Vas Deferens & Inguinal Canal',
    system: 'Reproductive',
    mode: 'full-body',
    gender: 'male',
    position: [0.05, 0.08, 0.04],
    cameraFocus: [0.05, 0.08, 0.7],
    lookAt: [0.05, 0.08, 0],
    ncertReference: 'NCERT Class 12, Chapter 3, Section 3.1: Accessory Ducts',
    physiologicalRole:
      'A ~45 cm muscular tube ascending from the tail of the epididymis through the inguinal canal into the pelvis. Its thick three-layered smooth muscle wall generates rapid peristaltic contractions during ejaculation, propelling spermatozoa into the ejaculatory duct.',
    clinicalSignificance:
      'Vasectomy involves bilateral surgical transection and ligation of a small section of the vas deferens, serving as a permanent, 99.85% effective sterilization procedure without altering testosterone or seminal volume.',
    keyBiomolecules: ['Smooth Muscle Actomyosin', 'Sympathetic Norepinephrine Receptors'],
  },
  {
    id: 'female-ovary',
    name: 'Ovaries & Folliculogenesis',
    system: 'Reproductive',
    mode: 'full-body',
    gender: 'female',
    position: [-0.14, 0.16, -0.02],
    cameraFocus: [-0.14, 0.16, 0.7],
    lookAt: [-0.14, 0.16, 0],
    ncertReference: 'NCERT Class 12, Chapter 3, Section 3.2: Female Reproductive System',
    physiologicalRole:
      'Primary female gonads located in the lateral pelvic wall attached to the broad ligament by the mesovarium. Produces haploid female gametes (ova) and secretes steroid sex hormones. Undergoes cyclic folliculogenesis from primordial follicles (~300,000 at puberty) to Graafian follicles, ovulating a secondary oocyte arrested in Metaphase II under the Day 14 LH surge.',
    clinicalSignificance:
      'Polycystic Ovarian Syndrome (PCOS) characterized by hyperandrogenism, multiple subcapsular follicular cysts, chronic anovulation, and insulin resistance.',
    keyBiomolecules: ['17β-Estradiol (Granulosa cells)', 'Progesterone (Corpus Luteum)', 'Inhibin B', 'Anti-Müllerian Hormone (AMH)'],
  },
  {
    id: 'female-uterus',
    name: 'Uterus, Myometrium & Endometrium',
    system: 'Reproductive',
    mode: 'full-body',
    gender: 'female',
    position: [0, 0.12, 0.04],
    cameraFocus: [0, 0.12, 0.75],
    lookAt: [0, 0.12, 0],
    ncertReference: 'NCERT Class 12, Chapter 3, Section 3.2: Uterine Architecture',
    physiologicalRole:
      'Inverted hollow muscular organ with three distinct functional layers: Perimetrium (outer serosa), Myometrium (thick interlacing smooth muscle generating powerful oxytocin-driven rhythmic contractions during labor), and Endometrium (inner vascular glandular mucosal lining undergoing cyclic shedding during menses and vascular proliferation for blastocyst decidual implantation).',
    clinicalSignificance:
      'Endometriosis (aberrant growth of endometrial glands and stroma outside uterine cavity) and Uterine Leiomyomas (fibroids) causing menorrhagia and subfertility.',
    keyBiomolecules: ['Estrogen (Proliferative Phase)', 'Progesterone (Secretory Phase)', 'Oxytocin Receptors', 'Prostaglandins (PGF2α)'],
  },

  // ==========================================
  // EYE - PHOTORECEPTOR OPTICAL SYSTEM
  // ==========================================
  {
    id: 'eye-cornea',
    name: 'Cornea (Anterior Optical Refractor)',
    system: 'Sensory/Optical',
    mode: 'eye',
    position: [0, 0, 0.52],
    cameraFocus: [0, 0, 1.2],
    lookAt: [0, 0, 0.5],
    ncertReference: 'NCERT Class 11, Chapter 21, Section 21.6: The Eye & Optics',
    physiologicalRole:
      'The anterior transparent, avascular dome of the fibrous tunic. Possesses a refractive index n = 1.376 and contributes approximately 43 diopters (~70%) of the eye’s total 60-diopter optical refractive power. Five distinct microscopic layers: anterior epithelium, Bowman membrane, stroma (organized lamellar collagen fibril spacing maintaining optical transparency), Descemet membrane, and posterior endothelium with Na+/K+ metabolic pumps preventing corneal edema.',
    clinicalSignificance:
      'Keratoconus (progressive stromal thinning causing conical cornea and high irregular astigmatism) and Corneal Transplantation (Keratoplasty) enjoying high graft survival due to ocular immune privilege.',
    keyBiomolecules: ['Type I & V Collagen', 'Keratan Sulfate Proteoglycans', 'Endothelial Na+/K+ ATPase'],
  },
  {
    id: 'eye-iris-pupil',
    name: 'Iris & Pupil (Aperture Diaphragm)',
    system: 'Sensory/Optical',
    mode: 'eye',
    position: [0, 0, 0.38],
    cameraFocus: [0.2, 0.1, 1.0],
    lookAt: [0, 0, 0.38],
    ncertReference: 'NCERT Class 11, Chapter 21, Section 21.6: Iris & Pupil Control',
    physiologicalRole:
      'The pigmented contractile diaphragm separating anterior and posterior chambers. Regulates illumination entering the retina through the central pupil (diameter 2–8 mm). Modulated by two antagonistic smooth muscles: Sphincter pupillae (parasympathetic CN III via Edinger-Westphal nucleus producing miosis in bright light) and Dilator pupillae (sympathetic postganglionic fibers from superior cervical ganglion producing mydriasis in low light/stress).',
    clinicalSignificance:
      'Horner Syndrome (triad of miosis, partial ptosis, and anhidrosis caused by interruption of the cervical sympathetic chain) and Argyll Robertson Pupil.',
    keyBiomolecules: ['Melanin & Eumelanin Granules', 'Acetylcholine (Muscarinic M3)', 'Norepinephrine (Alpha-1)'],
  },
  {
    id: 'eye-crystalline-lens',
    name: 'Crystalline Lens & Accommodation',
    system: 'Sensory/Optical',
    mode: 'eye',
    position: [0, 0, 0.22],
    cameraFocus: [0.3, 0.2, 0.9],
    lookAt: [0, 0, 0.22],
    ncertReference: 'NCERT Class 11, Chapter 21, Section 21.6: Mechanism of Vision',
    physiologicalRole:
      'Transparent, biconvex, elastic protein structure held by zonular fibers (Suspensory Ligament of Zinn) attached to the ciliary body. Provides dynamic variable optical power (+15 to +20 D) via Helmholtz accommodation: For near vision, ciliary smooth muscle contracts, relaxing zonular tension, allowing the elastic lens capsule to become more spherical, increasing optical vergence to focus divergent light rays onto the fovea.',
    clinicalSignificance:
      'Presbyopia (age-related loss of lens elasticity after age 40, requiring convex reading glasses) and Cataract (lens crystallin protein denaturation and opacification treated with phacoemulsification and IOL implantation).',
    keyBiomolecules: ['Alpha, Beta & Gamma Crystallins', 'Elastic Capsule Elastin', 'Zonular Fibrillin-1'],
  },
  {
    id: 'eye-retina-fovea',
    name: 'Retina, Fovea Centralis & Photoreceptors',
    system: 'Sensory/Optical',
    mode: 'eye',
    position: [0, 0, -0.42],
    cameraFocus: [0, 0.3, -1.1],
    lookAt: [0, 0, -0.4],
    ncertReference: 'NCERT Class 11, Chapter 21, Section 21.6: Photoreceptors & Retinal Layers',
    physiologicalRole:
      'Ten-layered neurosensory tissue lining the posterior eye. Houses ~120 million Rods (containing Rhodopsin; high light sensitivity for scotopic night vision) and ~6 million Cones (containing photopsins for photopic color vision: S-cones 420nm, M-cones 530nm, L-cones 560nm). The Fovea Centralis (0.35 mm rod-free avascular pit within macula lutea) features 1:1 cone-to-ganglion cell convergence, conferring maximum spatial visual acuity (20/20 vision).',
    clinicalSignificance:
      'Age-Related Macular Degeneration (AMD; leading cause of irreversible central blindness), Retinal Detachment (separation of neurosensory retina from retinal pigment epithelium), and Diabetic Retinopathy.',
    keyBiomolecules: ['11-cis-Retinal & Opsin (Rhodopsin)', 'cGMP & Transducin (G-protein cascade)', 'Glutamate'],
  },

  // ==========================================
  // BRAIN - CENTRAL NERVOUS SYSTEM
  // ==========================================
  {
    id: 'brain-cerebrum-frontal',
    name: 'Cerebrum: Frontal Lobe & Motor Cortex',
    system: 'Nervous',
    mode: 'brain',
    position: [0, 0.15, 0.28],
    cameraFocus: [0, 0.4, 1.2],
    lookAt: [0, 0.1, 0.1],
    ncertReference: 'NCERT Class 11, Chapter 21, Section 21.4: Human Brain Anatomy',
    physiologicalRole:
      'The largest division of the forebrain (prosencephalon). The Prefrontal Cortex governs executive functions: working memory, complex decision making, impulse control, abstract reasoning, and personality. The Precentral Gyrus hosts the Primary Motor Cortex (Brodmann Area 4) organized as the motor homunculus controlling voluntary skeletal muscle contraction. Broca Area (Brodmann 44/45 in dominant left hemisphere) coordinates motor speech production.',
    clinicalSignificance:
      'Frontal lobe syndrome (disinhibition, emotional blunting, dysexecutive syndrome as in the classic Phineas Gage lesion) and Broca expressive motor aphasia.',
    keyBiomolecules: ['Dopamine (Mesocortical reward & focus)', 'Glutamate (Pyramidal NMDA/AMPA)', 'GABA'],
  },
  {
    id: 'brain-cerebrum-occipital',
    name: 'Occipital Lobe: Primary Visual Cortex (V1)',
    system: 'Nervous',
    mode: 'brain',
    position: [0, 0.08, -0.32],
    cameraFocus: [0, 0.3, -1.2],
    lookAt: [0, 0.05, -0.1],
    ncertReference: 'NCERT Class 11, Chapter 21, Section 21.4: Visual Cortex',
    physiologicalRole:
      'Located at the posterior pole of each cerebral hemisphere along the calcarine sulcus (Brodmann Area 17, Striate Cortex). Receives retinotopically mapped visual input from the lateral geniculate nucleus (LGN) of the thalamus via optic radiations. Simple and complex Hubel-Wiesel cortical neurons process oriented edges, line segments, motion vectors, stereoscopic binocular disparity, and spatial frequencies.',
    clinicalSignificance:
      'Cortical blindness (Anton-Babinski syndrome) and Visual Agnosia caused by posterior cerebral artery (PCA) ischemic infarction.',
    keyBiomolecules: ['Glutamate', 'Parvalbumin GABAergic Interneurons', 'Brain-Derived Neurotrophic Factor (BDNF)'],
  },
  {
    id: 'brain-cerebellum',
    name: 'Cerebellum ("Little Brain" Coordination)',
    system: 'Nervous',
    mode: 'brain',
    position: [0, -0.22, -0.22],
    cameraFocus: [0, -0.2, -1.1],
    lookAt: [0, -0.15, 0],
    ncertReference: 'NCERT Class 11, Chapter 21, Section 21.4: Hindbrain & Equilibrium',
    physiologicalRole:
      'Constitutes only 10% of total brain volume but packs over 50% (~70 billion) of all central nervous system neurons! Features the arbor vitae branching white matter and giant GABAergic Purkinje cells receiving climbing and mossy fibers. Coordinates smooth motor execution, precision timing, predictive velocity compensation, postural balance, and motor learning (e.g. bicycling, typing, musical instruments).',
    clinicalSignificance:
      'Cerebellar Ataxia manifested by intention tremor, past-pointing (dysmetria), scanning staccato speech, and broad-based gait (tested in sobriety field evaluations).',
    keyBiomolecules: ['GABA (Purkinje output)', 'Glutamate (Granule parallel fibers)', 'Aspartate (Climbing fibers)'],
  },
  {
    id: 'brain-brainstem',
    name: 'Brainstem: Medulla Oblongata & Pons',
    system: 'Nervous',
    mode: 'brain',
    position: [0, -0.32, -0.05],
    cameraFocus: [0.6, -0.2, 0.8],
    lookAt: [0, -0.25, 0],
    ncertReference: 'NCERT Class 11, Chapter 21, Section 21.4: Brainstem & Autonomic Centers',
    physiologicalRole:
      'Vital stalk connecting cerebral hemispheres to the spinal cord. Houses autonomic nuclei: Respiratory rhythmicity center (dorsal and ventral respiratory groups responding to arterial pCO2 and CSF H+ concentrations via central chemoreceptors), Cardiovascular center (baroreceptor reflex heart rate and vasomotor tone control), and protective reflex centers (vomiting, coughing, swallowing, sneezing). Conduit for ascending sensory and descending pyramidal tracts.',
    clinicalSignificance:
      'Brain herniation (uncal or tonsillar herniation through foramen magnum compressing medulla, causing fatal respiratory arrest) and Locked-in Syndrome (ventral pontine infarction).',
    keyBiomolecules: ['Serotonin (Raphe nuclei)', 'Norepinephrine (Locus coeruleus)', 'Substance P & Acetylcholine'],
  },

  // ==========================================
  // SKELETAL - BIOMECHANICAL ARCHITECTURE
  // ==========================================
  {
    id: 'skel-cranium',
    name: 'Cranium & Axial Skeletal Armor',
    system: 'Skeletal',
    mode: 'skeleton',
    position: [0, 0.65, 0],
    cameraFocus: [0, 0.65, 1.0],
    lookAt: [0, 0.65, 0],
    ncertReference: 'NCERT Class 11, Chapter 20, Section 20.3: Axial Skeleton & Cranium',
    physiologicalRole:
      'Composed of 22 bones (8 cranial bones: frontal, 2 parietal, 2 temporal, occipital, sphenoid, ethmoid, and 14 facial bones) joined by immovable fibrous suture joints (synarthroses). Forms a protective rigid vault enclosing the delicate cerebral parenchyma against mechanical trauma and provides skeletal origins for masticatory muscles.',
    clinicalSignificance:
      'Basilar skull fracture (Battle sign mastoid ecchymosis, raccoon eyes, and CSF rhinorrhea/otorrhea risking pneumococcal meningitis).',
    keyBiomolecules: ['Hydroxyapatite Crystals Ca10(PO4)6(OH)2', 'Type I Collagen Matrix', 'Osteocalcin'],
  },
  {
    id: 'skel-spine',
    name: 'Vertebral Column & Neural Canal',
    system: 'Skeletal',
    mode: 'skeleton',
    position: [0, 0.15, -0.06],
    cameraFocus: [0.5, 0.15, 0.8],
    lookAt: [0, 0.15, 0],
    ncertReference: 'NCERT Class 11, Chapter 20, Section 20.3: Vertebral Column',
    physiologicalRole:
      'Comprises 26 serially arranged units: 7 cervical (C1 atlas, C2 axis enabling cranial rotation), 12 thoracic, 5 lumbar (thickest bodies bearing trunk mass), 1 sacrum (5 fused), and 1 coccyx (4 fused). Houses the neural canal shielding the spinal cord and provides four physiological curvatures conferring shock-absorbing spring elasticity during locomotion.',
    clinicalSignificance:
      'Herniated Intervertebral Disc (nucleus pulposus rupture compressing spinal nerve roots producing sciatica) and Scoliosis.',
    keyBiomolecules: ['Proteoglycan Aggrecan (Nucleus pulposus)', 'Annulus Fibrosus Fibrocartilage', 'Elastin'],
  },
  {
    id: 'skel-pelvic-girdle',
    name: 'Pelvic Girdle & Femoral Ball-and-Socket',
    system: 'Skeletal',
    mode: 'skeleton',
    position: [0, -0.22, 0],
    cameraFocus: [0, -0.22, 1.1],
    lookAt: [0, -0.22, 0],
    ncertReference: 'NCERT Class 11, Chapter 20, Section 20.3: Pelvic Girdle & Synovial Joints',
    physiologicalRole:
      'Formed by two coxal (hip) bones joined anteriorly at the fibrocartilaginous pubic symphysis and posteriorly to the sacrum. The deep cup-shaped acetabulum articulates with the spherical head of the femur to form a multiaxial synovial ball-and-socket joint, engineered to withstand compressive loads up to 4–5 times body weight during running.',
    clinicalSignificance:
      'Osteoarthritis of the hip (acetabular cartilage erosion treated by total hip arthroplasty) and Subcapital Femoral Neck Fractures in osteoporotic elderly patients.',
    keyBiomolecules: ['Synovial Fluid Hyaluronic Acid & Lubricin', 'Articular Chondroitin Sulfate'],
  },
];

export function Anatomy3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const pinSpritesRef = useRef<{ id: string; sprite: THREE.Sprite }[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Smooth camera animation state
  const cameraAnimRef = useRef<{
    isAnimating: boolean;
    startPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    startLookAt: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    startTime: number;
    duration: number;
  } | null>(null);

  // State
  const [activeMode, setActiveMode] = useState<AnatomySystemMode>('full-body');
  const [gender, setGender] = useState<AnatomyGender>('male');
  const [transparency, setTransparency] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<AnatomicalLandmark | null>(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Interactive Eye Simulation parameters (Snell's Law & Refraction)
  const [eyeRefractionCondition, setEyeRefractionCondition] = useState<'normal' | 'myopia' | 'hyperopia'>('normal');
  const [correctiveLensApplied, setCorrectiveLensApplied] = useState(false);
  const [pupilDiameterMm, setPupilDiameterMm] = useState(4.0);
  const [isAccommodated, setIsAccommodated] = useState(false);

  // Interactive Brain Simulation parameters (Hodgkin-Huxley & Synapse)
  const [actionPotentialTimeMs, setActionPotentialTimeMs] = useState(0);
  const [isPlayingNeuronFiring, setIsPlayingNeuronFiring] = useState(true);
  const [activeNeurotransmitter, setActiveNeurotransmitter] = useState<'dopamine' | 'acetylcholine' | 'serotonin' | 'gaba'>('dopamine');

  // Filter landmarks for active mode & gender
  const currentLandmarks = useMemo(() => {
    return COMPREHENSIVE_LANDMARKS.filter((lm) => {
      if (lm.mode !== activeMode) return false;
      if (activeMode === 'full-body' && lm.gender && lm.gender !== gender) return false;
      return true;
    });
  }, [activeMode, gender]);

  // Smooth Camera Lerp Trigger
  const triggerCameraGlide = useCallback((
    targetPos: [number, number, number],
    targetLookAt: [number, number, number],
    duration = 900
  ) => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraAnimRef.current = {
      isAnimating: true,
      startPos: cameraRef.current.position.clone(),
      targetPos: new THREE.Vector3(...targetPos),
      startLookAt: controlsRef.current.target.clone(),
      targetLookAt: new THREE.Vector3(...targetLookAt),
      startTime: performance.now(),
      duration,
    };
  }, []);

  // Zoom Out / Reset View
  const handleResetView = useCallback(() => {
    setSelectedLandmark(null);
    if (activeMode === 'full-body') {
      triggerCameraGlide([0, 0.4, 2.3], [0, 0.1, 0], 800);
    } else if (activeMode === 'eye') {
      triggerCameraGlide([0, 0, 1.4], [0, 0, 0], 800);
    } else if (activeMode === 'brain') {
      triggerCameraGlide([0, 0.2, 1.5], [0, 0, 0], 800);
    } else {
      triggerCameraGlide([0, 0.1, 2.2], [0, 0.1, 0], 800);
    }
  }, [activeMode, triggerCameraGlide]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070B16'); // Deep scientific midnight blue
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.4, 2.3);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 6.0;
    controls.minDistance = 0.3;
    controls.target.set(0, 0.1, 0);
    controlsRef.current = controls;

    // 5. Lighting Setup (Key, Fill, Rim & Ambient)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4); // Cool cyan fill
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf472b6, 1.8); // Subtle pink anatomical rim
    rimLight.position.set(0, -3, -3);
    scene.add(rimLight);

    // 6. Ground Grid & Pedestal Ring
    const grid = new THREE.GridHelper(4, 40, 0x38bdf8, 0x1e293b);
    grid.position.y = -0.95;
    scene.add(grid);

    // 7. Animation Loop with Smooth Camera Lerp
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Handle Camera Lerp Glide
      if (cameraAnimRef.current?.isAnimating) {
        const anim = cameraAnimRef.current;
        const elapsed = performance.now() - anim.startTime;
        const progress = Math.min(1, elapsed / anim.duration);

        // Smooth cubic ease-in-out
        const ease =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        camera.position.lerpVectors(anim.startPos, anim.targetPos, ease);
        controls.target.lerpVectors(anim.startLookAt, anim.targetLookAt, ease);
        controls.update();

        if (progress >= 1) {
          anim.isAnimating = false;
        }
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.autoRotateSpeed = 1.6;
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [autoRotate]);

  // Load Model based on activeMode and gender
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    setLoadingModel(true);
    setLoadError(null);
    setSelectedLandmark(null);

    // Dispose old model
    if (currentModelGroupRef.current) {
      scene.remove(currentModelGroupRef.current);
      currentModelGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      currentModelGroupRef.current = null;
    }

    // Clear landmark pin sprites
    pinSpritesRef.current.forEach(({ sprite }) => scene.remove(sprite));
    pinSpritesRef.current = [];

    const handleModelLoaded = (model: THREE.Object3D, defaultScale = 1.5, yOffset = 0) => {
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = defaultScale / (maxDim || 1);
      model.scale.set(scale, scale, scale);

      model.position.x = -center.x * scale;
      model.position.y = -center.y * scale + yOffset;
      model.position.z = -center.z * scale;

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
              if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshBasicMaterial) {
                m.transparent = transparency;
                m.opacity = transparency ? 0.4 : 1.0;
                m.wireframe = wireframe;
              }
            });
          }
        }
      });

      const group = new THREE.Group();
      group.add(model);
      scene.add(group);
      currentModelGroupRef.current = group;

      // Add 3D Landmark Pins
      const landmarks = COMPREHENSIVE_LANDMARKS.filter((lm) => {
        if (lm.mode !== activeMode) return false;
        if (activeMode === 'full-body' && lm.gender && lm.gender !== gender) return false;
        return true;
      });

      landmarks.forEach((lm) => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.beginPath();
          ctx.arc(32, 32, 24, 0, Math.PI * 2);
          ctx.fillStyle = activeMode === 'eye' ? '#38BDF8' : activeMode === 'brain' ? '#A855F7' : activeMode === 'skeleton' ? '#E2E8F0' : gender === 'male' ? '#38BDF8' : '#EC4899';
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#FFFFFF';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(32, 32, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: false,
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(lm.position[0], lm.position[1], lm.position[2]);
        sprite.scale.set(0.08, 0.08, 0.08);
        sprite.userData = { landmarkId: lm.id };

        scene.add(sprite);
        pinSpritesRef.current.push({ id: lm.id, sprite });
      });

      setLoadingModel(false);
    };

    // Load appropriate model by activeMode
    if (activeMode === 'full-body') {
      const gltfLoader = new GLTFLoader();
      const modelUrl = gender === 'male' ? '/models/male_anatomy_figure.glb' : '/models/female/scene.gltf';
      gltfLoader.load(
        modelUrl,
        (gltf) => handleModelLoaded(gltf.scene, 1.6, 0.15),
        undefined,
        (err) => {
          console.warn('GLTF load failed, using procedural torso:', err);
          buildProceduralFullBody(scene);
        }
      );
    } else if (activeMode === 'eye') {
      // Load OBJ eye with MTLLoader
      const mtlLoader = new MTLLoader();
      mtlLoader.setPath('/models/eye/');
      mtlLoader.load(
        'eye.mtl',
        (materials) => {
          materials.preload();
          const objLoader = new OBJLoader();
          objLoader.setMaterials(materials);
          objLoader.setPath('/models/eye/');
          objLoader.load(
            'eye.obj',
            (obj) => handleModelLoaded(obj, 1.0, 0),
            undefined,
            (err) => {
              console.warn('Eye obj load failed, using procedural eye:', err);
              buildProceduralEye(scene);
            }
          );
        },
        undefined,
        (err) => {
          console.warn('Eye mtl load failed, using procedural eye:', err);
          buildProceduralEye(scene);
        }
      );
    } else if (activeMode === 'brain') {
      // Load Brain FBX
      const fbxLoader = new FBXLoader();
      fbxLoader.load(
        '/models/brain/Brain.fbx',
        (fbx) => handleModelLoaded(fbx, 1.1, 0),
        undefined,
        (err) => {
          console.warn('Brain FBX load failed, using procedural brain:', err);
          buildProceduralBrain(scene);
        }
      );
    } else if (activeMode === 'skeleton') {
      // Load Skeleton FBX
      const fbxLoader = new FBXLoader();
      fbxLoader.load(
        '/models/skeleton/skeleton_animated.FBX',
        (fbx) => handleModelLoaded(fbx, 1.8, 0.1),
        undefined,
        (err) => {
          console.warn('Skeleton FBX load failed, using procedural skeleton:', err);
          buildProceduralSkeleton(scene);
        }
      );
    }

    // Procedural Fallback Generators
    function buildProceduralFullBody(s: THREE.Scene) {
      const g = new THREE.Group();
      const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.22, 0.7, 32),
        new THREE.MeshStandardMaterial({
          color: gender === 'male' ? 0x64748b : 0xf472b6,
          roughness: 0.5,
          transparent: transparency,
          opacity: transparency ? 0.4 : 1,
          wireframe,
        })
      );
      torso.position.y = 0.25;
      g.add(torso);
      s.add(g);
      currentModelGroupRef.current = g;
      setLoadingModel(false);
    }

    function buildProceduralEye(s: THREE.Scene) {
      const g = new THREE.Group();
      // Sclera sphere
      const sclera = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
      );
      g.add(sclera);
      // Iris disc
      const iris = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.05, 32),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
      );
      iris.rotation.x = Math.PI / 2;
      iris.position.z = 0.47;
      g.add(iris);
      // Cornea dome
      const cornea = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, roughness: 0.05 })
      );
      cornea.position.z = 0.4;
      g.add(cornea);
      s.add(g);
      currentModelGroupRef.current = g;
      setLoadingModel(false);
    }

    function buildProceduralBrain(s: THREE.Scene) {
      const g = new THREE.Group();
      // Left hemisphere
      const leftHemi = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 32, 24),
        new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.6 })
      );
      leftHemi.position.set(-0.16, 0, 0);
      leftHemi.scale.set(0.9, 1.1, 1.3);
      g.add(leftHemi);
      // Right hemisphere
      const rightHemi = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 32, 24),
        new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.6 })
      );
      rightHemi.position.set(0.16, 0, 0);
      rightHemi.scale.set(0.9, 1.1, 1.3);
      g.add(rightHemi);
      s.add(g);
      currentModelGroupRef.current = g;
      setLoadingModel(false);
    }

    function buildProceduralSkeleton(s: THREE.Scene) {
      const g = new THREE.Group();
      const spine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
      );
      g.add(spine);
      s.add(g);
      currentModelGroupRef.current = g;
      setLoadingModel(false);
    }
  }, [activeMode, gender, transparency, wireframe]);

  // Handle Raycasting click on Landmark Pins
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!container || !camera || !scene) return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
      -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const sprites = pinSpritesRef.current.map((p) => p.sprite);
    const intersects = raycaster.intersectObjects(sprites, false);

    if (intersects.length > 0) {
      const hit = intersects[0]!;
      const landmarkId = hit.object.userData['landmarkId'] as string;
      const found = COMPREHENSIVE_LANDMARKS.find((lm) => lm.id === landmarkId);
      if (found) {
        setSelectedLandmark(found);
        // Smoothly zoom in & glide to landmark position!
        triggerCameraGlide(found.cameraFocus, found.lookAt, 900);
      }
    }
  };

  // Landmark Selection handler with camera fly-to
  const handleSelectLandmark = (lm: AnatomicalLandmark) => {
    if (selectedLandmark?.id === lm.id) {
      setSelectedLandmark(null);
      handleResetView();
    } else {
      setSelectedLandmark(lm);
      triggerCameraGlide(lm.cameraFocus, lm.lookAt, 900);
    }
  };

  // Mode change handler with camera repositioning
  const handleModeChange = (newMode: AnatomySystemMode) => {
    setActiveMode(newMode);
    setSelectedLandmark(null);
    if (newMode === 'full-body') {
      triggerCameraGlide([0, 0.4, 2.3], [0, 0.1, 0], 800);
    } else if (newMode === 'eye') {
      triggerCameraGlide([0, 0, 1.4], [0, 0, 0], 800);
    } else if (newMode === 'brain') {
      triggerCameraGlide([0, 0.2, 1.5], [0, 0, 0], 800);
    } else if (newMode === 'skeleton') {
      triggerCameraGlide([0, 0.1, 2.2], [0, 0.1, 0], 800);
    }
  };

  // Action potential animation ticker for brain
  useEffect(() => {
    if (activeMode !== 'brain' || !isPlayingNeuronFiring) return;
    const interval = setInterval(() => {
      setActionPotentialTimeMs((t) => (t >= 5 ? 0 : t + 0.1));
    }, 50);
    return () => clearInterval(interval);
  }, [activeMode, isPlayingNeuronFiring]);

  // Calculate Action Potential Voltage (Hodgkin-Huxley curve)
  const neuronVoltageMv = useMemo(() => {
    const t = actionPotentialTimeMs;
    if (t < 1.0) return -70; // Resting potential
    if (t < 1.8) return -70 + ((t - 1.0) / 0.8) * 105; // Depolarization up to +35 mV
    if (t < 2.8) return 35 - ((t - 1.8) / 1.0) * 120; // Repolarization down to -85 mV
    if (t < 4.0) return -85 + ((t - 2.8) / 1.2) * 15; // Hyperpolarization refractory recovery back to -70 mV
    return -70;
  }, [actionPotentialTimeMs]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#070B16] shadow-2xl flex flex-col ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[680px]'
      }`}
    >
      {/* Top HUD Controls Bar */}
      <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-[#070B16]/95 via-[#070B16]/75 to-transparent flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: System Mode Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <div className="inline-flex rounded-xl bg-slate-900/90 p-1 border border-slate-700/60 shadow-lg backdrop-blur-md">
            <button
              onClick={() => handleModeChange('full-body')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'full-body'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-300" />
              Full Body (3D)
            </button>
            <button
              onClick={() => handleModeChange('eye')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'eye'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <EyeIcon className="w-3.5 h-3.5 text-cyan-300" />
              Human Eye (Optics)
            </button>
            <button
              onClick={() => handleModeChange('brain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'brain'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BrainIcon className="w-3.5 h-3.5 text-purple-300" />
              Brain (CNS)
            </button>
            <button
              onClick={() => handleModeChange('skeleton')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'skeleton'
                  ? 'bg-zinc-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-zinc-300" />
              Skeleton (3D)
            </button>
          </div>

          {/* Gender toggle if full-body */}
          {activeMode === 'full-body' && (
            <div className="inline-flex rounded-xl bg-slate-900/90 p-1 border border-slate-700/60 shadow-lg backdrop-blur-md">
              <button
                onClick={() => setGender('male')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                  gender === 'male' ? 'bg-blue-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setGender('female')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                  gender === 'female' ? 'bg-pink-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Female
              </button>
            </div>
          )}

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            WebGL 60 FPS
          </span>
        </div>

        {/* Right: View Toggles & Zoom-Out Camera Reset */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Zoom Out / Overview Camera Reset */}
          <button
            onClick={handleResetView}
            title="Reset Camera & Zoom Out"
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-blue-600/20 text-blue-300 border border-blue-500/50 hover:bg-blue-600/30 backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <ZoomOut className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          {/* Transparency / X-Ray Mode */}
          <button
            onClick={() => setTransparency((prev) => !prev)}
            title="Toggle Internal X-Ray Transparency"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border backdrop-blur-md transition-all flex items-center gap-1.5 ${
              transparency
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-inner'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            X-Ray
          </button>

          {/* Wireframe */}
          <button
            onClick={() => setWireframe((prev) => !prev)}
            title="Toggle Polygonal Mesh"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border backdrop-blur-md transition-all flex items-center gap-1.5 ${
              wireframe
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-inner'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Mesh
          </button>

          {/* Auto-rotate */}
          <button
            onClick={() => setAutoRotate((prev) => !prev)}
            title="Toggle 360° Orbit"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border backdrop-blur-md transition-all flex items-center gap-1.5 ${
              autoRotate
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            Orbit
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullScreen((prev) => !prev)}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-lg bg-slate-900/80 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-all"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="w-full flex-1 relative cursor-grab active:cursor-grabbing outline-hidden"
      >
        {/* Loading Overlay */}
        {loadingModel && (
          <div className="absolute inset-0 z-30 bg-[#070B16]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-slate-300 tracking-wider">
              LOADING {activeMode.toUpperCase()} 3D MESH & HIGH-RES TEXTURES...
            </span>
          </div>
        )}

        {/* Floating Quick Landmark Selector (Bottom Center) */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Preset Camera Views */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mr-1">
              Angle:
            </span>
            <button
              onClick={() => triggerCameraGlide([0, 0.2, 2.0], [0, 0, 0], 800)}
              className="px-2.5 py-1 text-[11px] font-mono bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 rounded-md transition-all shadow-xs"
            >
              Anterior (Front)
            </button>
            <button
              onClick={() => triggerCameraGlide([2.0, 0.2, 0], [0, 0, 0], 800)}
              className="px-2.5 py-1 text-[11px] font-mono bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 rounded-md transition-all shadow-xs"
            >
              Lateral (Profile)
            </button>
            <button
              onClick={() => triggerCameraGlide([0, 2.0, 0.01], [0, 0, 0], 800)}
              className="px-2.5 py-1 text-[11px] font-mono bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 rounded-md transition-all shadow-xs"
            >
              Superior (Top)
            </button>
          </div>

          {/* Organ Landmark Chips (Clicking smooth-glides camera!) */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto max-w-xl justify-end">
            {currentLandmarks.map((lm) => {
              const isSelected = selectedLandmark?.id === lm.id;
              return (
                <button
                  key={lm.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectLandmark(lm);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded-md border transition-all flex items-center gap-1.5 shadow-xs ${
                    isSelected
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow-md ring-1 ring-cyan-300'
                      : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        activeMode === 'eye'
                          ? '#38BDF8'
                          : activeMode === 'brain'
                          ? '#C084FC'
                          : activeMode === 'skeleton'
                          ? '#E2E8F0'
                          : gender === 'male'
                          ? '#38BDF8'
                          : '#F472B6',
                    }}
                  />
                  {lm.name.split(' (')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Landmark Detail Drawer (Flyout Inspector) */}
      <AnimatePresence>
        {selectedLandmark && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute top-16 right-4 z-30 w-[420px] max-w-[92vw] bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl text-slate-200"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  {selectedLandmark.system} System ({selectedLandmark.mode.toUpperCase()})
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedLandmark.name}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetView}
                  title="Zoom Out to Full View"
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedLandmark(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-3.5 space-y-3 text-xs leading-relaxed max-h-[420px] overflow-y-auto pr-1">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Physiological & Anatomical Role:
                </span>
                <p className="text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                  {selectedLandmark.physiologicalRole}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wide block mb-1">
                  Clinical & Medical Relevance:
                </span>
                <p className="text-slate-300 bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/40">
                  {selectedLandmark.clinicalSignificance}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wide block mb-1">
                  Key Biomolecules & Neuroendocrine Factors:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLandmark.keyBiomolecules.map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                <span className="text-slate-400 font-semibold">NCERT Curriculum Reference: </span>
                {selectedLandmark.ncertReference}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE MOTION GRAPHICS & PHYSIOLOGY TOOLBAR (Bottom Tray) */}
      <div className="border-t border-slate-800 bg-[#0B1222] px-4 py-3 flex flex-wrap items-center justify-between gap-4 z-20">
        {/* EYE OPTICS & REFRACTION CONTROLS */}
        {activeMode === 'eye' && (
          <div className="w-full flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <EyeIcon className="w-4 h-4" />
                Refractive Vision Simulator:
              </span>
              <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
                <button
                  onClick={() => setEyeRefractionCondition('normal')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all ${
                    eyeRefractionCondition === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Emmetropia (20/20)
                </button>
                <button
                  onClick={() => setEyeRefractionCondition('myopia')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all ${
                    eyeRefractionCondition === 'myopia' ? 'bg-amber-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Myopia (Nearsighted)
                </button>
                <button
                  onClick={() => setEyeRefractionCondition('hyperopia')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all ${
                    eyeRefractionCondition === 'hyperopia' ? 'bg-rose-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Hyperopia (Farsighted)
                </button>
              </div>

              {/* Corrective Lens Toggle */}
              {eyeRefractionCondition !== 'normal' && (
                <button
                  onClick={() => setCorrectiveLensApplied((prev) => !prev)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 ${
                    correctiveLensApplied
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {correctiveLensApplied
                    ? `Corrective ${eyeRefractionCondition === 'myopia' ? 'Concave (-D)' : 'Convex (+D)'} Lens Applied`
                    : 'Apply Corrective Glasses'}
                </button>
              )}
            </div>

            {/* Pupil Aperture & Accommodation */}
            <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <span>Pupil Aperture:</span>
                <span className="text-cyan-400 font-bold">{pupilDiameterMm.toFixed(1)} mm</span>
                <input
                  type="range"
                  min="2.0"
                  max="8.0"
                  step="0.5"
                  value={pupilDiameterMm}
                  onChange={(e) => setPupilDiameterMm(parseFloat(e.target.value))}
                  className="w-24 accent-cyan-500"
                />
              </div>

              <button
                onClick={() => setIsAccommodated((prev) => !prev)}
                className={`px-2.5 py-1 rounded-md text-[11px] border transition-all ${
                  isAccommodated
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {isAccommodated ? 'Near Accommodation Active (+3.0 D)' : 'Distant Focus (Relaxed)'}
              </button>
            </div>
          </div>
        )}

        {/* BRAIN & NEUROTRANSMISSION OSCILLOSCOPE */}
        {activeMode === 'brain' && (
          <div className="w-full flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                Action Potential Voltage:
              </span>
              <div className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Vm: </span>
                <span className={`font-bold ${neuronVoltageMv > 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {neuronVoltageMv.toFixed(1)} mV
                </span>
                <span className="text-slate-500 ml-2">
                  {neuronVoltageMv === -70
                    ? '(Resting -70mV)'
                    : neuronVoltageMv > 0
                    ? '(Depolarization Peak)'
                    : '(Repolarization / Hyperpolarization)'}
                </span>
              </div>

              <button
                onClick={() => setIsPlayingNeuronFiring((prev) => !prev)}
                className="px-2.5 py-1 rounded bg-purple-950/80 text-purple-300 border border-purple-800 text-xs font-mono"
              >
                {isPlayingNeuronFiring ? 'Pause Pulse' : 'Resume Firing'}
              </button>
            </div>

            {/* Neurotransmitter Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Synaptic Neurotransmitter:</span>
              {(['dopamine', 'acetylcholine', 'serotonin', 'gaba'] as const).map((nt) => (
                <button
                  key={nt}
                  onClick={() => setActiveNeurotransmitter(nt)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize transition-all ${
                    activeNeurotransmitter === nt
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {nt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FULL BODY & SKELETON STATUS */}
        {(activeMode === 'full-body' || activeMode === 'skeleton') && (
          <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>
                Tip: Click any 3D organ landmark to trigger a smooth camera zoom-in. Use &quot;Overview&quot; to glide back out.
              </span>
            </div>
            <span className="text-slate-500">
              Spatial Resolution: High-Poly Anatomical Tessellation • PBR Lighting
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
