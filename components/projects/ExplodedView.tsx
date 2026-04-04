"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import gsap from "gsap";

interface ComponentData {
  name: string;
  description: string;
  color: string;
  assembledPos: [number, number, number];
  explodedPos: [number, number, number];
  geometry: "box" | "sphere" | "cylinder";
}

const COMPONENTS: ComponentData[] = [
  {
    name: "Dialogue Engine",
    description: "Drives NPC conversations and hints",
    color: "#e8a84c",
    assembledPos: [0, 0, 0],
    explodedPos: [-3, 2, -2],
    geometry: "box",
  },
  {
    name: "Simulation System",
    description: "Physics and flight model engine",
    color: "#4fa8d5",
    assembledPos: [0, 0, 0],
    explodedPos: [3, 2, 2],
    geometry: "sphere",
  },
  {
    name: "Zone Map",
    description: "World layout and progression gates",
    color: "#e05a6a",
    assembledPos: [0, 0, 0],
    explodedPos: [-2, -2, 3],
    geometry: "cylinder",
  },
  {
    name: "Progression System",
    description: "Tracks player milestones and unlocks",
    color: "#f0ece4",
    assembledPos: [0, 0, 0],
    explodedPos: [2, -2, -3],
    geometry: "box",
  },
  {
    name: "UI Layer",
    description: "HUD, menus, and feedback overlays",
    color: "#8a8680",
    assembledPos: [0, 0, 0],
    explodedPos: [0, 3, 0],
    geometry: "box",
  },
];

interface ExplodedViewProps {
  onClose?: () => void;
}

export function ExplodedView({ onClose }: ExplodedViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const labelsRef = useRef<HTMLDivElement[]>([]);
  const [isExploded, setIsExploded] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<number | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090d);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 8;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Create component meshes
    const meshes: THREE.Mesh[] = [];
    COMPONENTS.forEach((comp, idx) => {
      let geometry: THREE.BufferGeometry;
      if (comp.geometry === "box") {
        geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      } else if (comp.geometry === "sphere") {
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
      } else {
        geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 32);
      }

      const material = new THREE.MeshStandardMaterial({
        color: comp.color,
        metalness: 0.3,
        roughness: 0.4,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...comp.assembledPos);
      mesh.userData = { componentIdx: idx };
      scene.add(mesh);
      meshes.push(mesh);
    });
    meshesRef.current = meshes;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2;
    controlsRef.current = controls;

    // Create labels
    const labels: HTMLDivElement[] = [];
    COMPONENTS.forEach((comp) => {
      const label = document.createElement("div");
      label.className =
        "absolute pointer-events-auto px-3 py-2 rounded bg-[var(--bg-surface)]/80 backdrop-blur border border-[var(--text-secondary)]/20 text-xs";
      label.innerHTML = `<div class="font-bold text-[var(--accent-warm)]">${comp.name}</div><div class="text-[var(--text-secondary)] text-[0.7rem] mt-1">${comp.description}</div>`;
      label.style.display = "none";
      containerRef.current!.appendChild(label);
      labels.push(label);
    });
    labelsRef.current = labels;

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      controls.update();

      // Update label positions
      meshes.forEach((mesh, idx) => {
        const vector = mesh.position.clone();
        vector.project(camera);
        const x = (vector.x * 0.5 + 0.5) * containerRef.current!.clientWidth;
        const y = (-(vector.y * 0.5) + 0.5) * containerRef.current!.clientHeight;
        labels[idx].style.left = `${x}px`;
        labels[idx].style.top = `${y}px`;
        labels[idx].style.transform = "translate(-50%, -50%)";

        // Highlight selected
        if (selectedComponent === idx) {
          (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x444444);
        } else {
          (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Raycaster for clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      if (event.target !== renderer.domElement) return;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const componentIdx = (intersects[0].object as THREE.Mesh).userData.componentIdx;
        setSelectedComponent(componentIdx);
      }
    };
    renderer.domElement.addEventListener("click", handleClick);

    // Cleanup
    const containerEl = containerRef.current;
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      if (containerEl && containerEl.contains(renderer.domElement)) {
        containerEl.removeChild(renderer.domElement);
      }
      labels.forEach((label) => label.remove());
    };
  }, [selectedComponent]);

  // Toggle exploded/assembled state
  const toggleExploded = () => {
    if (!meshesRef.current) return;
    const newExploded = !isExploded;
    setIsExploded(newExploded);

    meshesRef.current.forEach((mesh, idx) => {
      const comp = COMPONENTS[idx];
      const targetPos = newExploded ? comp.explodedPos : comp.assembledPos;
      gsap.to(mesh.position, {
        x: targetPos[0],
        y: targetPos[1],
        z: targetPos[2],
        duration: 1,
        ease: "power2.inOut",
      });
    });

    if (controlsRef.current) {
      controlsRef.current.autoRotate = !newExploded;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]">
      <div
        ref={containerRef}
        className="flex-1"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        <button
          onClick={toggleExploded}
          className="px-6 py-3 bg-[var(--accent-cool)] text-[var(--bg-primary)] font-bold rounded hover:bg-[var(--accent-cool)]/80 transition-colors"
        >
          {isExploded ? "Assemble" : "Explode"}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-3 border border-[var(--text-secondary)] text-[var(--text-secondary)] rounded hover:bg-[var(--bg-surface)]/30 transition-colors"
          >
            Close
          </button>
        )}
      </div>

      {/* Selected component detail */}
      {selectedComponent !== null && (
        <div className="absolute top-6 left-6 max-w-xs bg-[var(--bg-surface)]/80 backdrop-blur border border-[var(--text-secondary)]/20 p-6 rounded">
          <h3 className="font-bold text-lg text-[var(--accent-warm)]">
            {COMPONENTS[selectedComponent].name}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            {COMPONENTS[selectedComponent].description}
          </p>
          <button
            onClick={() => setSelectedComponent(null)}
            className="mt-4 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Deselect
          </button>
        </div>
      )}
    </div>
  );
}
