import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Center } from '@react-three/drei';
import * as THREE from 'three';

// ────────── Ring model (interno) ──────────
function RingModel({ scrollProgress, autoRotate }: { scrollProgress: number; autoRotate: boolean }) {
  const { scene } = useGLTF('/models/anel.glb');
  const groupRef = useRef<THREE.Group>(null);
  const currentY = useRef(0);
  const autoAngle = useRef(0);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const replaced = mats.map((m) => {
          const orig = m as THREE.MeshStandardMaterial;
          const name = orig.name?.toLowerCase() ?? '';
          const isDiamond =
            name.includes('diamond') ||
            name.includes('gem') ||
            name.includes('stone') ||
            name.includes('crystal');
          if (isDiamond) {
            return new THREE.MeshPhysicalMaterial({
              color: 0xddf4ff,
              metalness: 0,
              roughness: 0,
              transmission: 0.95,
              thickness: 0.5,
              ior: 2.4,
              envMapIntensity: 3,
            });
          }
          return new THREE.MeshStandardMaterial({
            color: 0xd4a017,
            metalness: 0.85,
            roughness: 0.22,
            envMapIntensity: 2.5,
            emissive: new THREE.Color(0x3a2800),
            emissiveIntensity: 0.18,
          });
        });
        mesh.material = replaced.length === 1 ? replaced[0] : replaced;
      }
    });
    return c;
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (autoRotate) {
      autoAngle.current += delta * 0.6;
      groupRef.current.rotation.y = autoAngle.current;
    } else {
      const targetY = scrollProgress * Math.PI * 6;
      currentY.current += (targetY - currentY.current) * Math.min(delta * 4, 1);
      groupRef.current.rotation.y = currentY.current;
    }
    groupRef.current.position.y = Math.sin(Date.now() * 0.0008) * 0.06;
  });

  return (
    <Center>
      <group ref={groupRef} rotation={[Math.PI * 0.05, 0, 0]}>
        <primitive object={cloned} />
      </group>
    </Center>
  );
}

// ────────── Exported canvas component ──────────
export function Ring3DCanvas({
  scrollProgress = 0,
  autoRotate = false,
  size = 340,
  fov = 36,
  cameraZ = 4,
}: {
  scrollProgress?: number;
  autoRotate?: boolean;
  size?: number;
  fov?: number;
  cameraZ?: number;
}) {
  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 2.2,
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.5} />
        <spotLight position={[4, 6, 5]} intensity={6} angle={0.4} penumbra={0.5} color="#fff8e7" castShadow />
        <spotLight position={[-4, 4, -3]} intensity={3} angle={0.5} penumbra={0.8} color="#d4af37" />
        <pointLight position={[0, -2, 3]} intensity={2} color="#ffffff" />
        <Suspense fallback={null}>
          <RingModel scrollProgress={scrollProgress} autoRotate={autoRotate} />
          <Environment preset="city" />
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.45}
            scale={6}
            blur={3}
            far={2}
            color="#c8a010"
          />
        </Suspense>
      </Canvas>
      {/* Glow dourado */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: size * 0.6,
          height: 40,
          background: 'radial-gradient(ellipse, rgba(212,175,55,0.28) 0%, transparent 70%)',
          filter: 'blur(12px)',
        }}
      />
    </div>
  );
}

useGLTF.preload('/models/anel.glb');
