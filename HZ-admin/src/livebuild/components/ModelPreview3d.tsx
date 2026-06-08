import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Lb3dHotspot } from '../lib/types';

type Props = {
  modelUrl: string;
  hotspots: Lb3dHotspot[];
  height?: number;
  placing?: boolean;
  activeHotspotId?: string | null;
  onPlace?: (point: [number, number, number]) => void;
  onHotspotSelect?: (hotspot: Lb3dHotspot) => void;
};

function GlbModel({ url, onLoaded }: { url: string; onLoaded: (box: THREE.Box3) => void }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    if (!box.isEmpty()) onLoaded(box);
  }, [cloned, onLoaded]);
  return <primitive object={cloned} />;
}

function HotspotMarker({
  hotspot,
  active,
  onSelect,
}: {
  hotspot: Lb3dHotspot;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <group position={hotspot.position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={active ? '#2563eb' : '#f59e0b'}
          emissive={active ? '#1d4ed8' : '#b45309'}
          emissiveIntensity={0.4}
        />
      </mesh>
      <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: active ? '#2563eb' : 'rgba(15,23,42,.85)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 7px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
            fontFamily: 'var(--lb-m, Montserrat, sans-serif)',
          }}
        >
          {hotspot.label}
        </div>
      </Html>
    </group>
  );
}

function ClickPlacer({
  placing,
  onPlace,
}: {
  placing?: boolean;
  onPlace?: (point: [number, number, number]) => void;
}) {
  const { camera, scene, gl } = useThree();
  useEffect(() => {
    if (!placing || !onPlace) return;
    const handler = (ev: PointerEvent) => {
      if (ev.button !== 0) return;
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      if (hits[0]) {
        const p = hits[0].point;
        onPlace([p.x, p.y, p.z]);
      }
    };
    gl.domElement.addEventListener('pointerdown', handler);
    return () => gl.domElement.removeEventListener('pointerdown', handler);
  }, [placing, onPlace, camera, scene, gl]);
  return null;
}

function SceneContent({
  modelUrl,
  hotspots,
  placing,
  activeHotspotId,
  onPlace,
  onHotspotSelect,
}: Omit<Props, 'height'>) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const onLoaded = (box: THREE.Box3) => {
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * 1.8;
    camera.position.set(center.x + dist * 0.6, center.y + dist * 0.4, center.z + dist);
    camera.lookAt(center);
    if (controlsRef.current?.target) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  };

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />
      <directionalLight position={[-4, 6, -3]} intensity={0.35} />
      <Suspense fallback={null}>
        <GlbModel url={modelUrl} onLoaded={onLoaded} />
      </Suspense>
      {hotspots.map((h) => (
        <HotspotMarker
          key={h.id}
          hotspot={h}
          active={h.id === activeHotspotId}
          onSelect={() => onHotspotSelect?.(h)}
        />
      ))}
      <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.08} />
      <ClickPlacer placing={placing} onPlace={onPlace} />
    </>
  );
}

export function ModelPreview3d(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !props.modelUrl) {
    return (
      <div
        style={{
          height: props.height ?? 360,
          background: '#0f172a',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: 13,
        }}
      >
        {props.modelUrl ? 'Loading 3D preview…' : 'Upload a GLB model to preview'}
      </div>
    );
  }

  return (
    <div style={{ height: props.height ?? 360, borderRadius: 12, overflow: 'hidden', background: '#0f172a' }}>
      <Canvas camera={{ fov: 50, near: 0.1, far: 1000, position: [5, 4, 5] }}>
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
}
