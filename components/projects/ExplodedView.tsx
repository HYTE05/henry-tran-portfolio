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
  geometry: "box" | "sphere" | "cylinder" | "flatbox";
}

/**
 * PRD geometry assignments:
 * - Dialogue Engine: box
 * - Simulation System: sphere
 * - Zone Map: flat wide box (like a map/plane)
 * - Progression System: cylinder
 * - UI Layer: box
 */
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
    geometry: "flatbox",
  },
  {
    name: "Progression System",
    description: "Tracks player milestones and unlocks",
    color: "#f0ece4",
    assembledPos: [0, 0, 0],
    explodedPos: [2, -2, -3],
    geometry: "cylinder",
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
  // Track labels visible state separately to allow fade-in after explosion
  const labelsVisibleRef = useRef(false);

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
      1000,
    );
    camera.position.z = 8;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
      } else if (comp.geometry === "flatbox") {
        // Flat wide box — like a map/plane
        geometry = new THREE.BoxGeometry(1.6, 0.15, 1.1);
      } else {
        // cylinder
        geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 32);
      }

      const material = new THREE.MeshStandardMaterial({
        color: comp.color,
        metalness: 0.3,
        roughness: 0.4,
        transparent: true,
        opacity: 1.0,
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

    // Create labels — initially hidden, fade in after explosion completes
    const labels: HTMLDivElement[] = [];
    COMPONENTS.forEach((comp) => {
      const label = document.createElement("div");
      label.className =
        "absolute pointer-events-auto px-3 py-2 rounded bg-[var(--bg-surface)]/80 backdrop-blur border border-[var(--text-secondary)]/20 text-xs transition-opacity duration-300";
      label.innerHTML = `<div class="font-bold text-[var(--accent-warm)]">${comp.name}</div><div class="text-[var(--text-secondary)] text-[0.7rem] mt-1">${comp.description}</div>`;
      label.style.display = "none";
      label.style.opacity = "0";
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

      // Update label positions (only when visible)
      if (labelsVisibleRef.current) {
        meshes.forEach((mesh, idx) => {
          const vector = mesh.position.clone();
          vector.project(camera);
          const x = (vector.x * 0.5 + 0.5) * containerRef.current!.clientWidth;
          const y = (-(vector.y * 0.5) + 0.5) * containerRef.current!.clientHeight;
          labels[idx]!.style.left = `${x}px`;
          labels[idx]!.style.top = `${y}px`;
          labels[idx]!.style.transform = "translate(-50%, -50%)";
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Raycaster for clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      if (event.target !== renderer.domElement) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const componentIdx = (intersects[0].object as THREE.Mesh).userData
          .componentIdx as number;
        setSelectedComponent((prev) =>
          prev === componentIdx ? null : componentIdx,
        );
      } else {
        setSelectedComponent(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply dim-on-select effect whenever selectedComponent changes
  useEffect(() => {
    const meshes = meshesRef.current;
    if (!meshes.length) return;
    meshes.forEach((mesh, idx) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (selectedComponent === null) {
        // No selection — all full opacity, no emissive
        gsap.to(mat, { opacity: 1.0, duration: 0.25 });
        mat.emissive.setHex(0x000000);
      } else if (selectedComponent === idx) {
        // Selected — full opacity, subtle emissive highlight
        gsap.to(mat, { opacity: 1.0, duration: 0.25 });
        mat.emissive.setHex(0x333333);
      } else {
        // Not selected — dim to 0.4
        gsap.to(mat, { opacity: 0.4, duration: 0.25 });
        mat.emissive.setHex(0x000000);
      }
    });
  }, [selectedComponent]);

  // Toggle exploded/assembled state
  const toggleExploded = () => {
    const meshes = meshesRef.current;
    if (!meshes.length) return;
    const newExploded = !isExploded;
    setIsExploded(newExploded);
    setSelectedComponent(null);

    if (newExploded) {
      // Explode: animate meshes outward, then fade in labels
      labelsVisibleRef.current = false;
      labelsRef.current.forEach((label) => {
        label.style.display = "block";
        label.style.opacity = "0";
      });

      meshes.forEach((mesh, idx) => {
        const comp = COMPONENTS[idx]!;
        gsap.to(mesh.position, {
          x: comp.explodedPos[0],
          y: comp.explodedPos[1],
          z: comp.explodedPos[2],
          duration: 1.0,
          ease: "power2.inOut",
          onComplete:
            idx === meshes.length - 1
              ? () => {
                  // All animations done — fade in labels
                  labelsVisibleRef.current = true;
                  labelsRef.current.forEach((label) => {
                    label.style.transition = "opacity 0.35s ease";
                    label.style.opacity = "1";
                  });
                }
              : undefined,
        });
      });

      if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }
    } else {
      // Assemble: hide labels immediately, animate meshes back
      labelsVisibleRef.current = false;
      labelsRef.current.forEach((label) => {
        label.style.opacity = "0";
        setTimeout(() => {
          label.style.display = "none";
        }, 300);
      });

      meshes.forEach((mesh, idx) => {
        const comp = COMPONENTS[idx]!;
        gsap.to(mesh.position, {
          x: comp.assembledPos[0],
          y: comp.assembledPos[1],
          z: comp.assembledPos[2],
          duration: 1.0,
          ease: "power2.inOut",
        });
      });

      // Reset camera to default position on assemble
      if (cameraRef.current && controlsRef.current) {
        gsap.to(cameraRef.current.position, {
          x: 0,
          y: 0,
          z: 8,
          duration: 1.0,
          ease: "power2.inOut",
          onComplete: () => {
            if (controlsRef.current) {
              controlsRef.current.reset();
              controlsRef.current.autoRotate = true;
            }
          },
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]">
      <div
        ref={containerRef}
        className="relative flex-1"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Controls — Assemble button only shown when exploded; Explode always shown */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
        <button
          onClick={toggleExploded}
          className="rounded bg-[var(--accent-cool)] px-6 py-3 font-bold text-[var(--bg-primary)] transition-colors hover:bg-[var(--accent-cool)]/80"
        >
          {isExploded ? "Assemble" : "Explode"}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded border border-[var(--text-secondary)] px-6 py-3 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface)]/30"
          >
            Close
          </button>
        )}
      </div>

      {/* Selected component detail panel */}
      {selectedComponent !== null && (
        <div className="absolute left-6 top-6 max-w-xs rounded border border-[var(--text-secondary)]/20 bg-[var(--bg-surface)]/80 p-6 backdrop-blur">
          <h3 className="text-lg font-bold text-[var(--accent-warm)]">
            {COMPONENTS[selectedComponent]!.name}
          </h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {COMPONENTS[selectedComponent]!.description}
          </p>
          <button
            onClick={() => setSelectedComponent(null)}
            className="mt-4 text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Deselect
          </button>
        </div>
      )}
    </div>
  );
}
