import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';

const C = {
  burgundy: '#762d3b',
  burgundyDark: '#3a1d2a',
  royal: '#34558f',
  royalDark: '#182d5a',
  emerald: '#2e806b',
  emeraldDark: '#153d3a',
  gold: '#e0ad50',
  ivory: '#f6e5c5',
  stone: '#9c795d',
  clay: '#b15b4c',
  night: '#14273a',
  ink: '#101b2b'
};

const DISTRICTS = [
  { z: -40, name: 'THE ARCHIVES', color: C.burgundy, mark: '01' },
  { z: -88, name: 'THE GUILD', color: C.royal, mark: '02' },
  { z: -138, name: 'THE MARKET', color: C.emerald, mark: '03' },
  { z: -190, name: 'THE LIBRARY', color: C.burgundy, mark: '04' },
  { z: -242, name: 'THE OBSERVATORY', color: C.royal, mark: '05' },
  { z: -296, name: 'THE WATCHTOWER', color: C.emerald, mark: '06' },
  { z: -338, name: 'THE HIDDEN CHAMBER', color: C.burgundy, mark: '07' }
];

function Building({ position, size, color, accent = C.gold, windows = true }) {
  const [w, h, d] = size;
  const windowRows = useMemo(() => windows ? Array.from({ length: Math.max(1, Math.min(3, Math.floor(h / 2))) }, (_, row) => row) : [], [h, windows]);
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.88} metalness={0.04} />
      </mesh>
      <mesh position={[0, h + 0.35, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[Math.max(w * 0.78, 0.5), 0.8, 4]} />
        <meshStandardMaterial color={accent} roughness={0.75} />
      </mesh>
      {windowRows.map((row) => [-1, 1].map((side) => (
        <mesh key={`${row}-${side}`} position={[side * (w / 2 + 0.012), 1.05 + row * 1.55, 0]} rotation={[0, side < 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
          <planeGeometry args={[0.34, 0.58]} />
          <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.55} roughness={0.55} />
        </mesh>
      )))}
      <mesh position={[0, 0.5, d / 2 + 0.02]}>
        <boxGeometry args={[Math.min(w * 0.32, 0.8), 0.95, 0.05]} />
        <meshStandardMaterial color={C.ink} roughness={0.95} />
      </mesh>
    </group>
  );
}

function Flag({ position, color }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 2.6, 8]} />
        <meshStandardMaterial color={C.gold} metalness={0.45} roughness={0.45} />
      </mesh>
      <mesh position={[0.42, 2.22, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.85, 0.52]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.85} />
      </mesh>
    </group>
  );
}

function Torch({ position, color = C.gold }) {
  const flame = useRef();
  useFrame(({ clock }) => {
    if (flame.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 11 + position[2]) * 0.16;
      flame.current.scale.set(s, 1.15 / s, s);
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1, 8]} />
        <meshStandardMaterial color={C.ink} roughness={0.8} />
      </mesh>
      <mesh ref={flame} position={[0, 1.12, 0]}>
        <coneGeometry args={[0.18, 0.42, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.05, 0]} color={color} intensity={3.2} distance={6} decay={2} />
    </group>
  );
}

function Landmark({ district }) {
  const { z, color } = district;
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7.8, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.18} roughness={1} />
      </mesh>
      <mesh position={[-4.2, 2.8, 0]} castShadow>
        <boxGeometry args={[1.25, 5.6, 1.25]} />
        <meshStandardMaterial color={C.stone} roughness={0.92} />
      </mesh>
      <mesh position={[4.2, 2.8, 0]} castShadow>
        <boxGeometry args={[1.25, 5.6, 1.25]} />
        <meshStandardMaterial color={C.stone} roughness={0.92} />
      </mesh>
      <mesh position={[0, 5.9, 0]} castShadow>
        <boxGeometry args={[9.7, 1, 1.25]} />
        <meshStandardMaterial color={color} roughness={0.76} />
      </mesh>
      <mesh position={[0, 4.35, 0.65]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[3.35, 0.19, 8, 32, Math.PI]} />
        <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.15} roughness={0.55} />
      </mesh>
      <Building position={[-8.7, 0, -3]} size={[3.2, 4.3 + ((-z / 40) % 2), 3.6]} color={color} accent={C.gold} />
      <Building position={[8.7, 0, -3]} size={[3.2, 3.4 + ((-z / 35) % 2), 3.6]} color={C.royalDark} accent={color} />
      <Flag position={[-4.2, 5.7, 0]} color={color} />
      <Flag position={[4.2, 5.7, 0]} color={C.gold} />
      <Torch position={[-3.15, 0, 0.75]} color={C.gold} />
      <Torch position={[3.15, 0, 0.75]} color={C.gold} />
    </group>
  );
}

function City() {
  const buildings = useMemo(() => {
    const list = [];
    const colors = [C.burgundyDark, C.royalDark, C.emeraldDark, C.stone, C.clay];
    for (let i = 0; i < 27; i += 1) {
      const z = -8 - i * 13.2;
      const leftHeight = 2.8 + ((i * 7) % 5) * 0.72;
      const rightHeight = 2.5 + ((i * 11) % 6) * 0.62;
      list.push({ key: `l-${i}`, position: [-8.4 - (i % 3) * 2.5, 0, z], size: [2.8 + (i % 2) * 0.9, leftHeight, 4.6], color: colors[i % colors.length], accent: i % 3 ? C.gold : C.burgundy });
      list.push({ key: `r-${i}`, position: [8.4 + ((i + 1) % 3) * 2.4, 0, z - 5.2], size: [2.7 + ((i + 1) % 2) * 0.8, rightHeight, 4.4], color: colors[(i + 2) % colors.length], accent: i % 4 ? C.gold : C.royal });
    }
    return list;
  }, []);
  return (
    <group>
      <mesh position={[0, -0.38, -170]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[19, 380]} />
        <meshStandardMaterial color={C.night} roughness={0.98} />
      </mesh>
      <mesh position={[0, -0.34, -170]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.7, 380]} />
        <meshStandardMaterial color={C.stone} roughness={1} />
      </mesh>
      {[-1.3, 1.3].map((x) => (
        <mesh key={x} position={[x, -0.29, -170]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.045, 380]} />
          <meshBasicMaterial color={C.gold} transparent opacity={0.75} />
        </mesh>
      ))}
      {buildings.map((building) => <Building key={building.key} {...building} />)}
      {DISTRICTS.map((district) => <Landmark district={district} key={district.name} />)}
      <mesh position={[0, 0.8, -210]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[9.5, 0.12, 8, 48, Math.PI]} />
        <meshStandardMaterial color={C.gold} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Mountains() {
  const peaks = useMemo(() => [
    [-25, 7, -95, 18, C.burgundyDark], [-13, 6, -120, 13, C.royalDark], [12, 7, -155, 16, C.emeraldDark], [27, 8, -198, 21, C.royalDark], [-29, 8, -255, 22, C.burgundyDark], [28, 7, -305, 19, C.emeraldDark]
  ], []);
  return <group>{peaks.map(([x, y, z, h, color], i) => <mesh key={i} position={[x, y / 2 - 0.35, z]} rotation={[0, (i % 2) * 0.6, 0]}>
    <coneGeometry args={[h * 0.72, h, 7]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>)}</group>;
}

function Protagonist({ progress, pointer, reduced }) {
  const group = useRef();
  const cloak = useRef();
  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const p = progress.current;
    const target = new THREE.Vector3(pointer.current.x * 0.75, 1.05 + pointer.current.y * 0.16, -7 - p * 330);
    group.current.position.lerp(target, 1 - Math.exp(-dt * (reduced ? 9 : 4.5)));
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, Math.sin(p * 10) * 0.08 + pointer.current.x * 0.1, 4, dt);
    if (cloak.current) cloak.current.rotation.z = Math.sin(clock.elapsedTime * 3.5) * (reduced ? 0.02 : 0.09);
  });
  return (
    <group ref={group} name="hooded historical guide">
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.56, 1.35, 10]} />
        <meshStandardMaterial color={C.burgundyDark} roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <sphereGeometry args={[0.43, 16, 12]} />
        <meshStandardMaterial color={C.stone} roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.43, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.66, 0.9, 10]} />
        <meshStandardMaterial color={C.ink} roughness={0.96} />
      </mesh>
      <mesh ref={cloak} position={[0, 1.45, -0.28]} rotation={[0.16, 0, 0]}>
        <planeGeometry args={[1.65, 1.95, 1, 3]} />
        <meshStandardMaterial color={C.burgundy} roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.34, 1.15, 0.06]} rotation={[0, 0, -0.08]}>
        <cylinderGeometry args={[0.055, 0.07, 1.65, 8]} />
        <meshStandardMaterial color={C.gold} metalness={0.65} roughness={0.35} />
      </mesh>
      <mesh position={[0.34, 1.99, 0.06]}>
        <sphereGeometry args={[0.13, 12, 8]} />
        <meshBasicMaterial color={C.gold} toneMapped={false} />
      </mesh>
      <pointLight position={[0.4, 1.9, 0.2]} color={C.gold} intensity={1.8} distance={5} decay={2} />
    </group>
  );
}

function Eagle({ progress, reduced }) {
  const ref = useRef();
  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    const p = progress.current;
    ref.current.position.x = Math.sin(clock.elapsedTime * 0.33) * 10;
    ref.current.position.y = 11 + Math.sin(clock.elapsedTime * 0.7) * 0.8;
    ref.current.position.z = -18 - p * 330;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.33) * 0.2;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * (reduced ? 1.5 : 4)) * 0.06;
    ref.current.children[0].rotation.z = Math.sin(clock.elapsedTime * (reduced ? 1.5 : 6)) * 0.25;
    ref.current.children[1].rotation.z = -ref.current.children[0].rotation.z;
  });
  return <group ref={ref} scale={0.8}>
    <mesh><coneGeometry args={[0.14, 1.45, 5]} /><meshStandardMaterial color={C.gold} roughness={0.65} /></mesh>
    <mesh position={[-0.58, 0, 0]} rotation={[0, 0, 0.15]}><planeGeometry args={[1.2, 0.38]} /><meshStandardMaterial color={C.ivory} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0.58, 0, 0]} rotation={[0, 0, -0.15]}><planeGeometry args={[1.2, 0.38]} /><meshStandardMaterial color={C.ivory} side={THREE.DoubleSide} /></mesh>
  </group>;
}

function EagleScan({ progress, pointer, fireSignal, reduced }) {
  const ring = useRef();
  const pulse = useRef(0);
  const last = useRef(fireSignal);
  useEffect(() => {
    if (fireSignal !== last.current) {
      last.current = fireSignal;
      pulse.current = 1;
    }
  }, [fireSignal]);
  useFrame((_, dt) => {
    if (!ring.current) return;
    pulse.current = Math.max(0, pulse.current - dt * (reduced ? 1.8 : 2.8));
    const p = progress.current;
    ring.current.position.set(pointer.current.x * 0.6, 0.04, -7 - p * 330);
    ring.current.scale.setScalar(1.2 + pulse.current * 5.8);
    ring.current.material.opacity = 0.2 + pulse.current * 0.7;
    ring.current.rotation.z += dt * 0.8;
  });
  return <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
    <torusGeometry args={[1.65, 0.035, 8, 64]} />
    <meshBasicMaterial color={C.gold} transparent opacity={0.2} toneMapped={false} />
  </mesh>;
}

function CameraRig({ progress, pointer, reduced, cameraMode, shakeSignal }) {
  const { camera } = useThree();
  const shake = useRef(0);
  const lastShake = useRef(shakeSignal);
  useEffect(() => {
    if (shakeSignal !== lastShake.current) {
      lastShake.current = shakeSignal;
      shake.current = 1;
    }
  }, [shakeSignal]);
  useFrame((state, dt) => {
    const p = progress.current;
    const z = -7 - p * 330;
    const sway = reduced ? 0.25 : 1;
    const mode = cameraMode === 'wide' ? { x: 8, y: 15, z: 23, fov: 60 } : cameraMode === 'cockpit' ? { x: 1.4, y: 4.4, z: 8, fov: 52 } : { x: 4.5, y: 9.2, z: 16, fov: 56 };
    const sx = Math.sin(state.clock.elapsedTime * 38) * shake.current * 0.09;
    const sy = Math.cos(state.clock.elapsedTime * 31) * shake.current * 0.07;
    shake.current = Math.max(0, shake.current - dt * 3.3);
    const targetPosition = new THREE.Vector3(pointer.current.x * mode.x * sway + sx, mode.y + pointer.current.y * 1.2 * sway + sy, z + mode.z);
    camera.position.lerp(targetPosition, 1 - Math.exp(-dt * (reduced ? 8 : 4.2)));
    camera.fov = THREE.MathUtils.damp(camera.fov, mode.fov, 4, dt);
    camera.updateProjectionMatrix();
    camera.lookAt(new THREE.Vector3(pointer.current.x * 0.4, 1.6, z - 11));
  });
  return null;
}

function World({ progress, pointer, reduced, fireSignal, cameraMode, shakeSignal }) {
  return (
    <>
      <color attach="background" args={['#d28a64']} />
      <fogExp2 attach="fog" args={['#8e6b78', 0.009]} />
      <hemisphereLight args={['#f8d5a6', '#1f2942', 2.25]} />
      <directionalLight position={[-16, 18, 10]} intensity={3.8} color="#ffe1b0" />
      <directionalLight position={[18, 8, -130]} intensity={1.7} color="#8eb8ff" />
      <pointLight position={[0, 6, -35]} intensity={9} distance={42} color={C.burgundy} />
      <pointLight position={[0, 5, -235]} intensity={8} distance={46} color={C.royal} />
      <Sparkles count={180} scale={[25, 13, 370]} position={[0, 5, -175]} size={2.2} speed={0.12} color="#ffe6b5" opacity={0.65} />
      <Mountains />
      <City />
      <Float speed={0.35} rotationIntensity={0.08} floatIntensity={0.4}>
        <Eagle progress={progress} reduced={reduced} />
      </Float>
      <Protagonist progress={progress} pointer={pointer} reduced={reduced} />
      <EagleScan progress={progress} pointer={pointer} fireSignal={fireSignal} reduced={reduced} />
      <CameraRig progress={progress} pointer={pointer} reduced={reduced} cameraMode={cameraMode} shakeSignal={shakeSignal} />
    </>
  );
}

class SceneBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="world-canvas world-fallback historical-fallback" aria-hidden="true"><i /><b /><span /></div> : this.props.children; }
}

export default function HistoricalWorld(props) {
  const webgl = useMemo(() => {
    try {
      const test = document.createElement('canvas');
      return Boolean(test.getContext('webgl2') || test.getContext('webgl'));
    } catch { return false; }
  }, []);
  if (!webgl) return <div className="world-canvas world-fallback historical-fallback" aria-hidden="true"><i /><b /><span /></div>;
  return (
    <SceneBoundary>
      <div className="world-canvas historical-world" aria-hidden="true">
        <Canvas
          shadows={false}
          dpr={[1, 1.6]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => { gl.setClearColor(0xd28a64, 0); gl.domElement.addEventListener('webglcontextlost', () => { gl.domElement.style.opacity = '0'; gl.domElement.parentElement?.classList.add('world-fallback'); }); }}
          camera={{ position: [0, 9, 9], fov: 56, near: 0.1, far: 600 }}
        >
          <Suspense fallback={null}><World {...props} /></Suspense>
        </Canvas>
      </div>
    </SceneBoundary>
  );
}
