'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  Compass,
  Sun,
  Activity,
  Heart,
  Dna,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

export type AnatomyGender = 'male' | 'female';

export interface AnatomicalLandmark {
  id: string;
  name: string;
  system: 'Reproductive' | 'Endocrine' | 'Musculoskeletal' | 'Pelvic';
  gender: AnatomyGender;
  position: [number, number, number]; // 3D coordinates in normalized scene space
  ncertReference: string;
  physiologicalRole: string;
  clinicalSignificance: string;
  hormonesInvolved: string[];
}

export const ANATOMICAL_LANDMARKS: AnatomicalLandmark[] = [
  // Male Reproductive System
  {
    id: 'male-testes',
    name: 'Testes & Scrotum (Extra-abdominal)',
    system: 'Reproductive',
    gender: 'male',
    position: [0, -0.05, 0.08],
    ncertReference: 'NCERT Class 12, Chapter 3, Section 3.1: The Male Reproductive System',
    physiologicalRole:
      'Primary male sex organs located outside the abdominal cavity within the scrotum. The scrotum maintains an optimal temperature 2–2.5°C lower than internal core body temperature necessary for spermatogenesis. Houses ~250 testicular lobules with 1–3 highly coiled seminiferous tubules.',
    clinicalSignificance:
      'Cryptorchidism (failure of testes to descend) leads to sterility and testicular malignancies due to elevated intra-abdominal temperature.',
    hormonesInvolved: ['Testosterone (Leydig Cells)', 'Inhibin (Sertoli Cells)', 'FSH', 'LH (ICSH)'],
  },
  {
    id: 'male-epididymis',
    name: 'Epididymis & Vas Deferens',
    system: 'Reproductive',
    gender: 'male',
    position: [0.04, 0.05, 0.04],
    ncertReference: 'NCERT Class 12, Chapter 3, Section 3.1: Accessory Ducts',
    physiologicalRole:
      'A ~6-meter tightly coiled tubule capping the posterior aspect of each testis. Immature immotile spermatozoa undergo a 12–14 day transit gaining forward motility, membrane stabilization, and decapacitation factors before passing into the muscular vas deferens.',
    clinicalSignificance:
      'Vasectomy involves surgical ligation and excision of a small segment of the vas deferens, providing 99.85% effective permanent male contraception.',
    hormonesInvolved: ['Androgens (DHT)'],
  },
  {
    id: 'male-prostate',
    name: 'Prostate Gland & Seminal Vesicles',
    system: 'Reproductive',
    gender: 'male',
    position: [0, 0.22, -0.02],
    ncertReference: 'NCERT Class 12, Chapter 3, Section 3.1: Accessory Glands',
    physiologicalRole:
      'The paired seminal vesicles contribute 60–70% of seminal volume rich in fructose (energy for sperm), prostaglandins (uterine reverse peristalsis), and clotting proteins. The prostate secretes a slightly alkaline, milky fluid with PSA (prostate-specific antigen) and citric acid that neutralizes vaginal acidity.',
    clinicalSignificance:
      'Benign Prostatic Hyperplasia (BPH) causes urethral constriction and dysuria in elderly men; PSA blood serum test is a diagnostic biomarker for prostatic adenocarcinoma.',
    hormonesInvolved: ['Dihydrotestosterone (DHT)'],
  },
  {
    id: 'male-pelvis',
    name: 'Pelvic Girdle & Inguinal Canal',
    system: 'Pelvic',
    gender: 'male',
    position: [-0.15, 0.35, 0],
    ncertReference: 'NCERT Class 11, Chapter 20: Locomotion & Movement',
    physiologicalRole:
      'The bony pelvis supports visceral load and anchors the suspensory ligaments of the penis. The inguinal canal serves as the developmental descent conduit for the spermatic cord and testicular artery/veins.',
    clinicalSignificance:
      'Direct and indirect inguinal hernias occur through weak boundaries of the inguinal canal or deep inguinal ring under intra-abdominal pressure.',
    hormonesInvolved: ['Calcitriol', 'Parathyroid Hormone (Bone remodeling)'],
  },

  // Female Reproductive System
  {
    id: 'female-ovary',
    name: 'Ovaries (Paired Gonads)',
    system: 'Reproductive',
    gender: 'female',
    position: [-0.14, 0.18, -0.02],
    ncertReference: 'NCERT Class 12, Chapter 3, Section 3.2: The Female Reproductive System',
    physiologicalRole:
      'Primary female sex organs located on lateral pelvic walls connected by mesovarium and ovarian ligaments. Produce female gametes (ova) and secrete steroid hormones. Undergo cyclic follicular maturation from primordial follicles to Graafian follicles and ovulatory luteinization.',
    clinicalSignificance:
      'Polycystic Ovarian Syndrome (PCOS) characterized by hyperandrogenism, chronic anovulation, and immature follicular arrest.',
    hormonesInvolved: ['Estrogen (Granulosa cells)', 'Progesterone (Corpus Luteum)', 'Inhibin B'],
  },
  {
    id: 'female-fallopian',
    name: 'Fallopian Tubes (Oviducts & Ampulla)',
    system: 'Reproductive',
    gender: 'female',
    position: [0.15, 0.28, 0.02],
    ncertReference: 'NCERT Class 12, Chapter 3, Section 3.2: Fallopian Tube Segments',
    physiologicalRole:
      '10–12 cm bilateral muscular ducts with ciliated columnar epithelium composed of four anatomical parts: Fimbriae (finger-like sweeps capture ovum), Infundibulum, Ampulla (the physiological site of fertilization), and Isthmus (connecting into uterine cavity).',
    clinicalSignificance:
      'Ectopic tubal pregnancy occurs if blastocyst implants in the ampulla or isthmus, risking catastrophic maternal hemoperitoneum; Tubectomy provides permanent surgical sterilization.',
    hormonesInvolved: ['Estrogen (ciliogenesis & fluid secretion)', 'Progesterone (tubal smooth muscle relaxation)'],
  },
  {
    id: 'female-uterus',
    name: 'Uterus & Endometrial Cavity',
    system: 'Reproductive',
    gender: 'female',
    position: [0, 0.15, 0.04],
    ncertReference: 'NCERT Class 12, Chapter 3, Section 3.2: Uterine Wall Layers',
    physiologicalRole:
      'Inverted pear-shaped muscular organ with three distinct structural layers: Perimetrium (outer serosa), Myometrium (thick middle smooth muscle exhibiting powerful oxytocin contractions during parturition), and Endometrium (inner glandular vascular mucosal lining undergoing cyclical 28-day proliferation and shedding).',
    clinicalSignificance:
      'Endometriosis (ectopic endometrial implants outside uterus causing pelvic pain and infertility) and Uterine Fibroids (leiomyomas).',
    hormonesInvolved: ['Estrogen (Endometrial proliferation)', 'Progesterone (Secretory phase maintenance)', 'Oxytocin (Parturition)'],
  },
  {
    id: 'female-cervix',
    name: 'Cervix & Os (Vaginal Canal Gateway)',
    system: 'Pelvic',
    gender: 'female',
    position: [0, -0.05, 0.02],
    ncertReference: 'NCERT Class 12, Chapter 3, Section 3.2: Cervix & Birth Canal',
    physiologicalRole:
      'The narrow inferior neck of the uterus projecting into the vaginal vault. Secretes mucus whose viscosity changes cyclically: thin, alkaline, receptive ferning mucus during pre-ovulatory estrogen peak to assist sperm swimming; thick, hostile, acidic mucus during luteal progesterone phase to protect against microbial entry.',
    clinicalSignificance:
      'Cervical cancer screening via Pap smear and HPV vaccination (Gardasil/Cervavac) targeting high-risk oncogenic HPV 16 and 18 strains.',
    hormonesInvolved: ['Estrogen', 'Progesterone', 'Relaxin (during labor cervical dilation)'],
  },
];

export function Anatomy3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const pinSpritesRef = useRef<{ id: string; sprite: THREE.Sprite }[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const [gender, setGender] = useState<AnatomyGender>('male');
  const [transparency, setTransparency] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [lightingPreset, setLightingPreset] = useState<'studio' | 'clinical' | 'ambient'>('studio');
  const [selectedLandmark, setSelectedLandmark] = useState<AnatomicalLandmark | null>(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Filter landmarks for current gender
  const currentLandmarks = useMemo(() => {
    return ANATOMICAL_LANDMARKS.filter((lm) => lm.gender === gender);
  }, [gender]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0F1D'); // Deep scientific midnight blue
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.4, 2.4);
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
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 6.0;
    controls.minDistance = 0.5;
    controls.target.set(0, 0.1, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    ambientLight.name = 'ambient';
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    keyLight.name = 'keyLight';
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2); // Cool cyan fill
    fillLight.position.set(-3, 2, -2);
    fillLight.name = 'fillLight';
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf472b6, 1.5); // Soft pink rim accent
    rimLight.position.set(0, -3, -3);
    rimLight.name = 'rimLight';
    scene.add(rimLight);

    // 6. Ground Grid & Subtle Pedestal
    const grid = new THREE.GridHelper(3, 30, 0x38bdf8, 0x1e293b);
    grid.position.y = -0.85;
    scene.add(grid);

    // 7. Animation Loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.autoRotateSpeed = 1.5;
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
  }, []);

  // Update lighting preset
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const ambient = scene.getObjectByName('ambient') as THREE.AmbientLight | undefined;
    const key = scene.getObjectByName('keyLight') as THREE.DirectionalLight | undefined;
    const fill = scene.getObjectByName('fillLight') as THREE.DirectionalLight | undefined;

    if (!ambient || !key || !fill) return;

    if (lightingPreset === 'studio') {
      ambient.intensity = 0.9;
      key.intensity = 2.2;
      fill.intensity = 1.2;
    } else if (lightingPreset === 'clinical') {
      ambient.intensity = 1.4;
      key.intensity = 3.0;
      fill.intensity = 1.8;
    } else {
      // ambient mood
      ambient.intensity = 0.5;
      key.intensity = 1.2;
      fill.intensity = 0.6;
    }
  }, [lightingPreset]);

  // Load Model based on gender
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    setLoadingModel(true);
    setLoadError(null);
    setSelectedLandmark(null);

    // Remove existing model group
    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
      modelGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      modelGroupRef.current = null;
    }

    // Clear landmark pins
    pinSpritesRef.current.forEach(({ sprite }) => scene.remove(sprite));
    pinSpritesRef.current = [];

    const loader = new GLTFLoader();
    const modelUrl =
      gender === 'male' ? '/models/male_anatomy_figure.glb' : '/models/female/scene.gltf';

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.name = 'human_anatomy_model';

        // Compute Bounding Box to normalize center and scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.6 / maxDim; // Normalize to ~1.6 units in height
        model.scale.set(scale, scale, scale);

        // Center model vertically on pedestal
        model.position.x = -center.x * scale;
        model.position.y = -center.y * scale + 0.15;
        model.position.z = -center.z * scale;

        // Apply shader materials
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const baseMat = new THREE.MeshStandardMaterial({
              color: gender === 'male' ? 0x94a3b8 : 0xfbcfe8,
              roughness: 0.45,
              metalness: 0.1,
              transparent: transparency,
              opacity: transparency ? 0.35 : 1.0,
              wireframe: wireframe,
            });
            child.material = baseMat;
          }
        });

        const group = new THREE.Group();
        group.add(model);
        scene.add(group);
        modelGroupRef.current = group;

        // Add 3D Landmark Pins for this gender
        const landmarks = ANATOMICAL_LANDMARKS.filter((lm) => lm.gender === gender);
        landmarks.forEach((lm) => {
          // Canvas pin texture with pulsing dot
          const canvas = document.createElement('canvas');
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.beginPath();
            ctx.arc(32, 32, 24, 0, Math.PI * 2);
            ctx.fillStyle = gender === 'male' ? '#38BDF8' : '#EC4899';
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
      },
      undefined,
      (error) => {
        console.warn('Failed to load 3D GLTF model:', error);
        setLoadError(
          '3D WebGL asset could not be rendered directly. Initializing procedural high-fidelity anatomical coordinate mannequin.'
        );

        // Procedural Anatomical Torso Fallback if WebGL loader faces network hitch
        const fallbackGroup = new THREE.Group();

        // Torso
        const torsoGeo = new THREE.CylinderGeometry(0.3, 0.22, 0.7, 32);
        const torsoMat = new THREE.MeshStandardMaterial({
          color: gender === 'male' ? 0x64748b : 0xf472b6,
          roughness: 0.5,
          transparent: transparency,
          opacity: transparency ? 0.4 : 0.95,
          wireframe,
        });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.y = 0.25;
        fallbackGroup.add(torso);

        // Pelvis base
        const pelvisGeo = new THREE.SphereGeometry(0.24, 32, 16);
        const pelvis = new THREE.Mesh(pelvisGeo, torsoMat);
        pelvis.position.y = -0.12;
        fallbackGroup.add(pelvis);

        scene.add(fallbackGroup);
        modelGroupRef.current = fallbackGroup;
        setLoadingModel(false);
      }
    );
  }, [gender, transparency, wireframe]);

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
      const found = ANATOMICAL_LANDMARKS.find((lm) => lm.id === landmarkId);
      if (found) {
        setSelectedLandmark(found);
      }
    }
  };

  // Camera presets
  const handlePresetView = (view: 'anterior' | 'lateral' | 'close') => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (view === 'anterior') {
      camera.position.set(0, 0.3, 2.2);
      controls.target.set(0, 0.1, 0);
    } else if (view === 'lateral') {
      camera.position.set(2.2, 0.3, 0);
      controls.target.set(0, 0.1, 0);
    } else {
      camera.position.set(0, 0.1, 1.0);
      controls.target.set(0, 0.05, 0);
    }
    controls.update();
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-zinc-800 bg-slate-950 shadow-2xl flex flex-col ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[640px]'
      }`}
    >
      {/* Top HUD Controls Bar */}
      <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Model Switcher & Badges */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="inline-flex rounded-xl bg-slate-900/90 p-1 border border-slate-700/60 shadow-lg backdrop-blur-md">
            <button
              onClick={() => setGender('male')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                gender === 'male'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-300" />
              Male Anatomy (3D)
            </button>
            <button
              onClick={() => setGender('female')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                gender === 'female'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-pink-300" />
              Female Anatomy (3D)
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            WebGL 60 FPS
          </span>
        </div>

        {/* Right: Visualization Toggles */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Transparency / X-Ray Mode */}
          <button
            onClick={() => setTransparency((prev) => !prev)}
            title="Toggle X-Ray Internal Transparency"
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
            title="Toggle Polygonal Mesh Wireframe"
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
            title="Toggle 360° Orbit Rotation"
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
            {isFullScreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Container */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="w-full flex-1 relative cursor-grab active:cursor-grabbing outline-none"
      >
        {/* Loading Overlay */}
        {loadingModel && (
          <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-slate-300 tracking-wider">
              LOADING {gender.toUpperCase()} ANATOMICAL 3D MESH...
            </span>
          </div>
        )}

        {/* View Preset Pills (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            View Angle:
          </span>
          <button
            onClick={() => handlePresetView('anterior')}
            className="px-2.5 py-1 text-[11px] font-mono bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 rounded-md transition-all"
          >
            Anterior (Front)
          </button>
          <button
            onClick={() => handlePresetView('lateral')}
            className="px-2.5 py-1 text-[11px] font-mono bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 rounded-md transition-all"
          >
            Sagittal (Lateral)
          </button>
          <button
            onClick={() => handlePresetView('close')}
            className="px-2.5 py-1 text-[11px] font-mono bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 rounded-md transition-all"
          >
            Pelvic Focus
          </button>
        </div>

        {/* Interactive Landmark Pins List (Bottom Center / Floating) */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-wrap items-center gap-1.5 max-w-sm">
          {currentLandmarks.map((lm) => {
            const isSelected = selectedLandmark?.id === lm.id;
            return (
              <button
                key={lm.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLandmark(isSelected ? null : lm);
                }}
                className={`px-2.5 py-1 text-[10px] font-mono rounded-md border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? gender === 'male'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                      : 'bg-pink-600 text-white border-pink-400 shadow-md'
                    : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: gender === 'male' ? '#38BDF8' : '#F472B6' }}
                />
                {lm.name.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Landmark Scientific Detail Drawer (Modal / Floating Sheet) */}
      <AnimatePresence>
        {selectedLandmark && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-4 z-30 w-96 max-w-[90vw] bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl text-slate-200"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400 font-bold">
                  {selectedLandmark.system} System ({selectedLandmark.gender.toUpperCase()})
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedLandmark.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLandmark(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3 text-xs leading-relaxed max-h-[380px] overflow-y-auto pr-1">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Physiological & Anatomical Role:
                </span>
                <p className="text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
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
                  Endocrine & Hormonal Regulation:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLandmark.hormonesInvolved.map((h, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/50 text-cyan-300 border border-cyan-800/60"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                <span className="text-slate-400 font-semibold">NCERT Benchmark: </span>
                {selectedLandmark.ncertReference}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
