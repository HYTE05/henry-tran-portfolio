"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

/**
 * Low-poly fuselage + nose as wireframe — lazy-loaded from BuildSection.
 */
export default function WireframeFuselage() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const lineColor = 0x4fa8d5;
    const mat = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.85,
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 11;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const group = new THREE.Group();
    const body = new THREE.CylinderGeometry(0.48, 0.58, 4.8, 14, 2, true);
    const bodyLines = new THREE.LineSegments(new THREE.EdgesGeometry(body), mat);
    group.add(bodyLines);

    const nose = new THREE.ConeGeometry(0.48, 1.45, 14);
    const noseLines = new THREE.LineSegments(new THREE.EdgesGeometry(nose), mat);
    noseLines.position.y = 3.1;
    group.add(noseLines);

    const wing = new THREE.BoxGeometry(3.4, 0.1, 1.1);
    const wingLines = new THREE.LineSegments(new THREE.EdgesGeometry(wing), mat);
    wingLines.position.y = 0.15;
    wingLines.rotation.z = 0.08;
    group.add(wingLines);

    group.rotation.x = 0.22;
    scene.add(group);

    host.appendChild(renderer.domElement);
    const style = renderer.domElement.style;
    style.display = "block";
    style.width = "100%";
    style.height = "100%";

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      group.rotation.y += 0.0028;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      bodyLines.geometry.dispose();
      noseLines.geometry.dispose();
      wingLines.geometry.dispose();
      body.dispose();
      nose.dispose();
      wing.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="pointer-events-none h-72 w-full max-w-lg md:h-96"
      aria-hidden
    />
  );
}
