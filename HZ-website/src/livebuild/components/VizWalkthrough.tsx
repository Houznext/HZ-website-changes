import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Lb3dCamera, Lb3dHotspot } from '@/livebuild/lib/types';

type Props = {
  modelUrl: string;
  hotspots: Lb3dHotspot[];
  activeHotspotId?: string | null;
  flyTarget: Lb3dCamera | null;
  onHotspotClick: (hotspot: Lb3dHotspot) => void;
  onReady?: () => void;
  height?: number | string;
};

function GlbModel({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => {
    onLoaded();
  }, [cloned, onLoaded]);
  return <primitive object={cloned} />;
}

function HotspotPin({
  hotspot,
  active,
  onClick,
}: {
  hotspot: Lb3dHotspot;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <group position={hotspot.position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshStandardMaterial
          color={active ? '#2f80ed' : '#f59e0b'}
          emissive={active ? '#1d4ed8' : '#b45309'}
          emissiveIntensity={0.45}
        />
      </mesh>
      <Html distanceFactor={12} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: active ? '#2f80ed' : 'rgba(15,23,42,.88)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: 8,
            whiteSpace: 'nowrap',
            fontFamily: 'Montserrat, sans-serif',
            boxShadow: '0 4px 14px rgba(0,0,0,.25)',
          }}
        >
          {hotspot.label}
        </div>
      </Html>
    </group>
  );
}

function CameraFly({ flyTarget, controlsRef }: { flyTarget: Lb3dCamera | null; controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  const anim = useRef<{ from: THREE.Vector3; to: THREE.Vector3; targetFrom: THREE.Vector3; targetTo: THREE.Vector3; t: number } | null>(null);

  useEffect(() => {
    if (!flyTarget) return;
    anim.current = {
      from: camera.position.clone(),
      to: new THREE.Vector3(...flyTarget.position),
      targetFrom: controlsRef.current?.target?.clone() ?? new THREE.Vector3(),
      targetTo: new THREE.Vector3(...flyTarget.target),
      t: 0,
    };
  }, [flyTarget, camera, controlsRef]);

  useFrame((_, delta) => {
    if (!anim.current) return;
    anim.current.t = Math.min(1, anim.current.t + delta * 1.8);
    const ease = 1 - Math.pow(1 - anim.current.t, 3);
    camera.position.lerpVectors(anim.current.from, anim.current.to, ease);
    if (controlsRef.current?.target) {
      controlsRef.current.target.lerpVectors(anim.current.targetFrom, anim.current.targetTo, ease);
      controlsRef.current.update();
    }
    if (anim.current.t >= 1) anim.current = null;
  });

  return null;
}

function Scene({
  modelUrl,
  hotspots,
  activeHotspotId,
  flyTarget,
  onHotspotClick,
  onReady,
}: Omit<Props, 'height'>) {
  const { camera, scene } = useThree();
  const controlsRef = useRef<any>(null);
  const framed = useRef(false);

  const frameModel = () => {
    if (framed.current) return;
    const box = new THREE.Box3();
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) box.expandByObject(obj);
    });
    if (box.isEmpty()) return;
    framed.current = true;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * 1.75;
    camera.position.set(center.x + dist * 0.55, center.y + dist * 0.35, center.z + dist);
    camera.lookAt(center);
    if (controlsRef.current?.target) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
    onReady?.();
  };

  useEffect(() => {
    framed.current = false;
  }, [modelUrl]);

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 10, 6]} intensity={1.15} />
      <directionalLight position={[-5, 8, -4]} intensity={0.35} />
      <Suspense fallback={null}>
        <GlbModel url={modelUrl} onLoaded={frameModel} />
      </Suspense>
      {hotspots.map((h) => (
        <HotspotPin
          key={h.id}
          hotspot={h}
          active={h.id === activeHotspotId}
          onClick={() => onHotspotClick(h)}
        />
      ))}
      <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.06} minDistance={0.5} maxDistance={80} />
      <CameraFly flyTarget={flyTarget} controlsRef={controlsRef} />
    </>
  );
}

export function VizWalkthrough({
  modelUrl,
  hotspots,
  activeHotspotId,
  flyTarget,
  onHotspotClick,
  onReady,
  height = 420,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.7)' }}>
        Loading 3D…
      </div>
    );
  }

  return (
    <Canvas camera={{ fov: 48, near: 0.05, far: 2000, position: [4, 3, 4] }} style={{ width: '100%', height: '100%' }}>
      <Scene
        modelUrl={modelUrl}
        hotspots={hotspots}
        activeHotspotId={activeHotspotId}
        flyTarget={flyTarget}
        onHotspotClick={onHotspotClick}
        onReady={onReady}
      />
    </Canvas>
  );
}
