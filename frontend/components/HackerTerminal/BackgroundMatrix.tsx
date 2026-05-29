'use client';

import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial, useFrame } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function MatrixField() {
  const points = useMemo(() => {
    const n = 1200;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 9;
      const z = (Math.random() - 0.5) * 10;
      arr[i * 3 + 0] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points | null>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!ref.current) return;
    ref.current.rotation.y = t * 0.05;
    ref.current.rotation.x = Math.sin(t * 0.2) * 0.03;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={points}
          count={points.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointMaterial
        ref={ref}
        color="#39d0ff"
        size={0.03}
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
}

export default function BackgroundMatrix() {
  return (
    <div className="absolute inset-0 -z-0">
      <Canvas
        camera={{ position: [0, 0, 22], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <MatrixField />
      </Canvas>
    </div>
  );
}

