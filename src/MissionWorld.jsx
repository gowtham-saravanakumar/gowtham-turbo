import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

const C = {
  cyan: '#66e8ff',
  cyan2: '#14b8ff',
  violet: '#806cff',
  orange: '#ff6c47',
  mint: '#56ffd2',
  metal: '#152331',
  dark: '#050910'
};

function HologramLabel({ text, subtext, position, scale = [12, 3], color = C.cyan, opacity = 0.6 }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1536;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 36;
    ctx.fillStyle = color;
    ctx.font = '900 170px Arial Black, Arial, sans-serif';
    ctx.fillText(text, canvas.width / 2, 165);
    if (subtext) {
      ctx.shadowBlur = 14;
      ctx.globalAlpha = 0.85;
      ctx.font = '500 42px monospace';
      ctx.letterSpacing = '12px';
      ctx.fillText(subtext, canvas.width / 2, 305);
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    map.needsUpdate = true;
    return map;
  }, [text, subtext, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} scale={[scale[0], scale[1], 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

function useQuality() {
  const [quality, setQuality] = useState(() => {
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const cores = navigator.hardwareConcurrency || 4;
    return mobile || cores <= 4 ? 'low' : cores <= 8 ? 'medium' : 'high';
  });
  useEffect(() => {
    let raf = 0;
    let previous = performance.now();
    let frames = 0;
    let slowFrames = 0;
    const sample = (now) => {
      const dt = now - previous;
      previous = now;
      frames += 1;
      if (dt > 34) slowFrames += 1;
      if (frames >= 180) {
        const slowRatio = slowFrames / frames;
        if (slowRatio > 0.42) setQuality('low');
        else if (slowRatio > 0.18) setQuality((q) => q === 'high' ? 'medium' : q);
        frames = 0;
        slowFrames = 0;
      }
      raf = requestAnimationFrame(sample);
    };
    raf = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(raf);
  }, []);
  return quality;
}

function Ship({ progress, pointer, reduced, fireSignal }) {
  const group = useRef();
  const engineA = useRef();
  const engineB = useRef();
  const reactor = useRef();
  const velocity = useRef(new THREE.Vector3());
  const previous = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const p = progress.current;
    const boot = THREE.MathUtils.smoothstep(state.clock.elapsedTime, 0.65, 2.4);
    group.current.scale.setScalar(0.38 + boot * 0.62);
    const z = -8 - p * 468;
    const x = Math.sin(p * Math.PI * 5.4) * (reduced ? 0.45 : 3.4) + pointer.current.x * 1.25;
    const y = Math.sin(p * Math.PI * 8.0) * (reduced ? 0.2 : 1.2) + pointer.current.y * 0.75;
    target.current.set(x, y, z);
    velocity.current.copy(target.current).sub(previous.current).divideScalar(Math.max(dt, 0.001));
    previous.current.lerp(target.current, 1 - Math.exp(-dt * 8));
    group.current.position.lerp(target.current, 1 - Math.exp(-dt * (reduced ? 7 : 4.2)));

    const bank = THREE.MathUtils.clamp(-velocity.current.x * 0.012 - pointer.current.x * 0.22, -0.48, 0.48);
    const pitch = THREE.MathUtils.clamp(velocity.current.y * 0.01 + pointer.current.y * 0.12, -0.22, 0.22);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, bank, 4.2, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pitch, 4.2, dt);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.current.x * 0.08, 5, dt);

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 18) * 0.14;
    engineA.current.scale.x = THREE.MathUtils.damp(engineA.current.scale.x, pulse, 10, dt);
    engineB.current.scale.x = engineA.current.scale.x;
    reactor.current.rotation.x += dt * 1.8;
    reactor.current.rotation.y += dt * 2.4;
  });

  return (
    <group ref={group} name="Asterion-X signature ship">
      <group rotation={[0, Math.PI / 2, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.62, 3.5, 8, 16]} />
        <meshStandardMaterial color={C.metal} metalness={0.92} roughness={0.22} />
      </mesh>
      <mesh position={[2.65, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.62, 1.7, 20]} />
        <meshStandardMaterial color="#1b2c3b" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[1.0, 0.45, 0]} scale={[1.55, 0.7, 0.9]} rotation={[0, 0, -0.14]}>
        <sphereGeometry args={[0.52, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshPhysicalMaterial color="#14516d" transmission={0.24} transparent opacity={0.86} metalness={0.28} roughness={0.08} emissive="#082a3a" emissiveIntensity={1.5} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[-0.1, -0.18, side * 1.02]} rotation={[0, side * 0.1, side * 0.02]} castShadow>
            <boxGeometry args={[3.25, 0.12, 1.12]} />
            <meshStandardMaterial color="#142330" metalness={0.96} roughness={0.24} />
          </mesh>
          <mesh position={[-0.85, -0.03, side * 1.65]}>
            <boxGeometry args={[1.75, 0.22, 0.28]} />
            <meshStandardMaterial color="#050a0f" metalness={0.92} roughness={0.3} />
          </mesh>
          <mesh position={[0.92, -0.02, side * 1.66]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.055, 0.08, 1.1, 10]} />
            <meshStandardMaterial color="#071018" metalness={1} roughness={0.22} />
          </mesh>
          <mesh position={[1.48, -0.02, side * 1.66]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.075, 0.075, 0.16, 12]} />
            <meshStandardMaterial color={C.orange} emissive={C.orange} emissiveIntensity={4} />
          </mesh>
        </group>
      ))}
      <mesh position={[-0.5, 0.55, 0]} ref={reactor}>
        <torusKnotGeometry args={[0.34, 0.075, 72, 10]} />
        <meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={4} metalness={0.45} roughness={0.18} />
      </mesh>
      {[-0.46, 0.46].map((z, i) => (
        <group key={z} position={[-2.05, i ? 0.31 : -0.31, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.19, 0.27, 0.82, 14]} />
            <meshStandardMaterial color="#04090d" metalness={0.92} roughness={0.32} />
          </mesh>
          <mesh ref={i ? engineB : engineA} position={[-0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.18, 1.7, 16, 1, true]} />
            <meshBasicMaterial color={C.cyan} transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <pointLight position={[-0.6, 0, 0]} color={C.cyan} intensity={11} distance={8} decay={2} />
        </group>
      ))}
      </group>
      <ShipWeapons fireSignal={fireSignal} />
    </group>
  );
}

function ShipWeapons({ fireSignal }) {
  const [shots, setShots] = useState([]);
  const lastSignal = useRef(fireSignal);
  useEffect(() => {
    if (fireSignal === lastSignal.current) return;
    lastSignal.current = fireSignal;
    const seed = performance.now();
    setShots((s) => [
      ...s.slice(-8),
      { id: `${seed}-a`, position: [-1.66, -0.02, -1.55] },
      { id: `${seed}-b`, position: [1.66, -0.02, -1.55] }
    ]);
  }, [fireSignal]);
  return shots.map((shot) => <Projectile key={shot.id} shot={shot} onDone={() => setShots((s) => s.filter((x) => x.id !== shot.id))} />);
}

function Projectile({ shot, onDone }) {
  const ref = useRef();
  const life = useRef(0);
  useFrame((_, dt) => {
    if (!ref.current) return;
    life.current += dt;
    ref.current.position.z -= dt * 62;
    ref.current.position.x += Math.sin(life.current * 8) * 0.02;
    if (life.current > 1.2) onDone();
  });
  return (
    <mesh ref={ref} position={shot.position} rotation={[Math.PI / 2, 0, 0]}>
      <capsuleGeometry args={[0.045, 1.1, 4, 8]} />
      <meshBasicMaterial color={C.cyan} toneMapped={false} />
      <pointLight color={C.cyan} intensity={8} distance={4} />
    </mesh>
  );
}

function Planet({ position, radius, color, glow, rings = false, city = false }) {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <sphereGeometry args={[radius, 64, 36]} />
        <meshStandardMaterial color={color} roughness={0.78} metalness={0.06} />
      </mesh>
      <mesh scale={1.045}>
        <sphereGeometry args={[radius, 48, 28]} />
        <meshBasicMaterial color={glow} transparent opacity={0.18} side={THREE.BackSide} />
      </mesh>
      <mesh scale={1.008}>
        <sphereGeometry args={[radius, 24, 14]} />
        <meshBasicMaterial color={glow} wireframe transparent opacity={0.06} />
      </mesh>
      {rings && (
        <mesh rotation={[Math.PI / 2.35, 0.2, 0]}>
          <torusGeometry args={[radius * 1.45, 0.09, 8, 120]} />
          <meshBasicMaterial color={glow} transparent opacity={0.4} />
        </mesh>
      )}
      {city && <CityArc radius={radius * 1.01} />}
    </group>
  );
}

function CityArc({ radius }) {
  const towers = useMemo(() => Array.from({ length: 34 }, (_, i) => {
    const a = (i / 34) * Math.PI * 1.35 + 0.9;
    const h = 0.22 + Math.random() * 0.8;
    return { a, h, w: 0.08 + Math.random() * 0.14 };
  }), []);
  return towers.map((t, i) => (
    <mesh key={i} position={[Math.cos(t.a) * radius, Math.sin(t.a) * radius, 0]} rotation={[0, 0, t.a - Math.PI / 2]}>
      <boxGeometry args={[t.w, t.h, t.w]} />
      <meshStandardMaterial color={i % 5 ? '#112d3d' : C.cyan} emissive={i % 5 ? '#07131c' : C.cyan} emissiveIntensity={i % 5 ? 0.4 : 2.8} metalness={0.65} roughness={0.3} />
    </mesh>
  ));
}

function AsteroidField({ quality }) {
  const mesh = useRef();
  const count = quality === 'high' ? 150 : quality === 'medium' ? 90 : 48;
  const data = useMemo(() => Array.from({ length: count }, () => ({
    p: [THREE.MathUtils.randFloatSpread(34), THREE.MathUtils.randFloatSpread(18), -98 - Math.random() * 58],
    s: 0.18 + Math.random() * 2.6,
    r: [Math.random() * 3, Math.random() * 3, Math.random() * 3]
  })), [count]);
  useEffect(() => {
    const d = new THREE.Object3D();
    data.forEach((x, i) => {
      d.position.set(...x.p);
      d.rotation.set(...x.r);
      d.scale.setScalar(x.s);
      d.updateMatrix();
      mesh.current.setMatrixAt(i, d.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [data]);
  useFrame((state) => {
    if (mesh.current) mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.07) * 0.03;
  });
  return (
    <instancedMesh ref={mesh} args={[null, null, count]} frustumCulled={false}>
      <icosahedronGeometry args={[0.62, 1]} />
      <meshStandardMaterial color="#171c23" roughness={0.92} metalness={0.18} />
    </instancedMesh>
  );
}

function Drone({ position, index, progress, destroyed }) {
  const ref = useRef();
  useFrame((state, dt) => {
    if (!ref.current || destroyed) return;
    const t = state.clock.elapsedTime;
    const battleActive = progress.current > 0.18 && progress.current < 0.36;
    ref.current.rotation.z += dt * (index % 2 ? 0.8 : -0.8);
    ref.current.position.y = position[1] + Math.sin(t * 1.7 + index) * (battleActive ? 0.8 : 0.25);
    ref.current.position.x = position[0] + Math.cos(t * 1.15 + index) * (battleActive ? 0.55 : 0.18);
  });
  if (destroyed) return null;
  return (
    <Float speed={2 + index * 0.1} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={ref} position={position}>
        <mesh>
          <octahedronGeometry args={[0.58, 0]} />
          <meshStandardMaterial color="#111820" metalness={0.94} roughness={0.28} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.06, 8, 36]} />
          <meshStandardMaterial color={C.orange} emissive={C.orange} emissiveIntensity={4.2} />
        </mesh>
        <mesh position={[0, 0, 0.52]}>
          <sphereGeometry args={[0.12, 14, 10]} />
          <meshBasicMaterial color={C.orange} toneMapped={false} />
        </mesh>
        <pointLight color={C.orange} intensity={7} distance={5} />
      </group>
    </Float>
  );
}

function ExplosionBurst({ position, onDone }) {
  const points = useRef();
  const life = useRef(0);
  const count = 46;
  const { positions, velocity } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocity = Array.from({ length: count }, () => new THREE.Vector3().randomDirection().multiplyScalar(2.5 + Math.random() * 7));
    return { positions, velocity };
  }, []);
  useFrame((_, dt) => {
    if (!points.current) return;
    life.current += dt;
    const attr = points.current.geometry.attributes.position;
    for (let i = 0; i < count; i += 1) {
      attr.array[i * 3] += velocity[i].x * dt;
      attr.array[i * 3 + 1] += velocity[i].y * dt;
      attr.array[i * 3 + 2] += velocity[i].z * dt;
      velocity[i].multiplyScalar(Math.pow(0.985, dt * 60));
    }
    attr.needsUpdate = true;
    points.current.material.opacity = Math.max(0, 1 - life.current / 1.1);
    points.current.scale.setScalar(1 + life.current * 0.35);
    if (life.current > 1.15) onDone();
  });
  return (
    <group position={position}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={C.orange} size={0.15} transparent opacity={1} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <pointLight color={C.orange} intensity={36} distance={18} decay={2} />
    </group>
  );
}

function CombatZone({ progress, fireSignal }) {
  const drones = useMemo(() => [
    [-7, 2.5, -116], [-3.5, -2.2, -123], [2.2, 2.9, -131], [6.4, -1.1, -139], [0, 0.2, -148]
  ], []);
  const [destroyed, setDestroyed] = useState([]);
  const [bursts, setBursts] = useState([]);
  const lastFire = useRef(fireSignal);
  useEffect(() => {
    if (fireSignal === lastFire.current) return;
    lastFire.current = fireSignal;
    if (progress.current < 0.16 || progress.current > 0.38) return;
    const target = drones.findIndex((_, i) => !destroyed.includes(i));
    if (target < 0) return;
    setDestroyed((current) => [...current, target]);
    setBursts((b) => [...b, { id: `${fireSignal}-${target}-${performance.now()}`, position: drones[target] }]);
  }, [fireSignal, drones, progress, destroyed]);
  return (
    <group>
      {drones.map((p, i) => <Drone key={i} position={p} index={i} progress={progress} destroyed={destroyed.includes(i)} />)}
      {bursts.map((burst) => <ExplosionBurst key={burst.id} position={burst.position} onDone={() => setBursts((b) => b.filter((x) => x.id !== burst.id))} />)}
    </group>
  );
}

function Portal() {
  const ref = useRef();
  useFrame((state, dt) => {
    ref.current.rotation.z += dt * 0.22;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.18;
  });
  return (
    <group ref={ref} position={[0, 0, -164]}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.08, i * 0.18, i * 0.22]}>
          <torusGeometry args={[4.2 + i * 0.62, 0.04 + (i % 2) * 0.025, 8, 96]} />
          <meshBasicMaterial color={i % 2 ? C.violet : C.cyan} transparent opacity={0.66 - i * 0.07} toneMapped={false} />
        </mesh>
      ))}
      <pointLight color={C.violet} intensity={28} distance={28} />
    </group>
  );
}

function PhysicsLab() {
  const group = useRef();
  const balls = useRef([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    balls.current.forEach((m, i) => {
      if (!m) return;
      const r = 2.2 + i * 0.32;
      m.position.x = Math.sin(t * (0.6 + i * 0.03) + i) * r;
      m.position.y = Math.cos(t * (0.85 + i * 0.02) + i * 0.7) * (1.1 + i * 0.06);
      m.position.z = Math.cos(t * 0.5 + i) * r * 0.28;
    });
    group.current.rotation.y = t * 0.07;
  });
  return (
    <group ref={group} position={[-5, 0, -184]}>
      <mesh>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshStandardMaterial color="#0e1d27" wireframe emissive="#09324a" emissiveIntensity={1.2} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} ref={(m) => { balls.current[i] = m; }}>
          <sphereGeometry args={[0.11 + (i % 3) * 0.05, 12, 8]} />
          <meshStandardMaterial color={i % 3 ? C.cyan : C.violet} emissive={i % 3 ? C.cyan : C.violet} emissiveIntensity={2.2} />
        </mesh>
      ))}
      <pointLight color={C.cyan} intensity={22} distance={20} />
    </group>
  );
}

function DataSpine() {
  const packetRefs = useRef([]);
  const nodes = useMemo(() => [
    [-7, 3, -228], [-3.5, -1.8, -235], [0, 2, -242], [4.4, -2.2, -249], [8, 2.7, -256]
  ], []);
  const curves = useMemo(() => nodes.slice(0, -1).map((p, i) => new THREE.CatmullRomCurve3([
    new THREE.Vector3(...p),
    new THREE.Vector3((p[0] + nodes[i + 1][0]) / 2, i % 2 ? 3.8 : -3.1, (p[2] + nodes[i + 1][2]) / 2),
    new THREE.Vector3(...nodes[i + 1])
  ])), [nodes]);
  useFrame((state) => {
    packetRefs.current.forEach((p, i) => {
      if (!p) return;
      const curve = curves[i % curves.length];
      const x = (state.clock.elapsedTime * (0.12 + i * 0.01) + i * 0.21) % 1;
      p.position.copy(curve.getPoint(x));
    });
  });
  return (
    <group>
      {nodes.map((p, i) => (
        <group position={p} key={i}>
          <mesh rotation={[i * 0.2, i * 0.14, i * 0.1]}>
            <boxGeometry args={[2.1, 1.3, 1.3]} />
            <meshStandardMaterial color="#0a151f" metalness={0.82} roughness={0.25} emissive={i % 2 ? '#0b2030' : '#10183a'} emissiveIntensity={1.2} />
          </mesh>
          <mesh scale={1.08}>
            <boxGeometry args={[2.1, 1.3, 1.3]} />
            <meshBasicMaterial color={i % 2 ? C.cyan : C.violet} wireframe transparent opacity={0.25} />
          </mesh>
        </group>
      ))}
      {curves.map((curve, i) => {
        const pts = curve.getPoints(28);
        const geometry = new THREE.BufferGeometry().setFromPoints(pts);
        return <line key={i} geometry={geometry}><lineBasicMaterial color={i % 2 ? C.cyan : C.violet} transparent opacity={0.34} /></line>;
      })}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} ref={(m) => { packetRefs.current[i] = m; }}>
          <sphereGeometry args={[0.085, 10, 8]} />
          <meshBasicMaterial color={i % 2 ? C.cyan : C.mint} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function CodeChamber() {
  const refs = useRef([]);
  useFrame((state, dt) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.rotation.y += dt * (0.03 + i * 0.01);
      m.position.y += Math.sin(state.clock.elapsedTime * 0.6 + i) * 0.0015;
    });
  });
  const planes = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    p: [THREE.MathUtils.randFloatSpread(18), THREE.MathUtils.randFloatSpread(10), -276 - Math.random() * 34],
    s: [1.2 + Math.random() * 2.6, 0.24 + Math.random() * 0.7],
    r: [0, THREE.MathUtils.randFloatSpread(1.4), THREE.MathUtils.randFloatSpread(0.35)]
  })), []);
  return (
    <group>
      {planes.map((x, i) => (
        <group key={i} ref={(m) => { refs.current[i] = m; }} position={x.p} rotation={x.r}>
          <mesh>
            <planeGeometry args={x.s} />
            <meshBasicMaterial color={i % 3 === 0 ? C.violet : C.cyan} transparent opacity={0.11 + (i % 4) * 0.04} side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 4 }, (_, j) => (
            <mesh key={j} position={[-x.s[0] * 0.32, x.s[1] * (0.28 - j * 0.17), 0.012]}>
              <boxGeometry args={[x.s[0] * (0.18 + ((i + j) % 4) * 0.12), 0.018, 0.01]} />
              <meshBasicMaterial color={j % 2 ? C.mint : '#b9f7ff'} transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function SkillUniverse() {
  const root = useRef();
  const nodes = useMemo(() => Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2;
    const r = 4 + (i % 5) * 0.85;
    return [Math.cos(a) * r, Math.sin(a) * r * 0.58, -333 + Math.sin(a * 3) * 4];
  }), []);
  useFrame((state, dt) => {
    root.current.rotation.z += dt * 0.018;
    root.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.13) * 0.08;
  });
  return (
    <group ref={root}>
      {nodes.map((p, i) => (
        <React.Fragment key={i}>
          <mesh position={p}>
            <sphereGeometry args={[i % 4 === 0 ? 0.18 : 0.09, 12, 8]} />
            <meshBasicMaterial color={i % 3 === 0 ? C.violet : C.cyan} toneMapped={false} />
          </mesh>
          {i > 0 && <Connection a={nodes[i - 1]} b={p} color={i % 3 === 0 ? C.violet : C.cyan} />}
        </React.Fragment>
      ))}
      <Connection a={nodes[0]} b={nodes[10]} color={C.mint} />
      <Connection a={nodes[5]} b={nodes[15]} color={C.violet} />
    </group>
  );
}

function Connection({ a, b, color }) {
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), [a, b]);
  return <line geometry={geometry}><lineBasicMaterial color={color} transparent opacity={0.18} /></line>;
}

function DockGate() {
  const root = useRef();
  useFrame((state, dt) => {
    if (!root.current) return;
    root.current.rotation.z += dt * 0.05;
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.25;
  });
  return (
    <group ref={root} position={[0, 0, -392]} rotation={[0.12, 0, 0]}>
      <mesh>
        <torusGeometry args={[4.8, 0.3, 12, 80]} />
        <meshStandardMaterial color="#172630" metalness={0.92} roughness={0.22} emissive="#07141c" emissiveIntensity={0.7} />
      </mesh>
      <mesh>
        <torusGeometry args={[3.9, 0.055, 8, 80]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.72} toneMapped={false} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, 0, i * Math.PI / 2]} position={[Math.cos(i * Math.PI / 2) * 5.7, Math.sin(i * Math.PI / 2) * 5.7, 0]}>
          <boxGeometry args={[2.7, 0.22, 0.7]} />
          <meshStandardMaterial color="#0d1922" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
      <pointLight color={C.cyan} intensity={26} distance={28} />
    </group>
  );
}

function OrbitalCrown() {
  const root = useRef();
  useFrame((_, dt) => { root.current.rotation.z += dt * 0.055; root.current.rotation.y += dt * 0.022; });
  return (
    <group ref={root} position={[0, 0, -446]} rotation={[0.6, 0.2, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.5, 1.9, 6.5, 24]} />
        <meshStandardMaterial color="#12212d" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.58, 0.58, 8.2, 20]} />
        <meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={3.8} metalness={0.6} roughness={0.15} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, i * 0.21, i * 0.28]}>
          <torusGeometry args={[4.8 + i * 1.35, 0.14, 10, 96]} />
          <meshStandardMaterial color={i === 0 ? C.cyan : '#16232d'} emissive={i === 0 ? C.cyan : '#07131b'} emissiveIntensity={i === 0 ? 3 : 0.6} metalness={0.88} roughness={0.24} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <mesh key={i} position={[Math.cos(a) * 8.8, Math.sin(a) * 8.8, 0]} rotation={[0, 0, a]}><boxGeometry args={[2.8, 0.18, 0.35]} /><meshStandardMaterial color="#111c25" metalness={0.9} roughness={0.28} /></mesh>;
      })}
      <pointLight color={C.cyan} intensity={48} distance={40} />
    </group>
  );
}

function StarUniverse({ quality }) {
  const count = quality === 'high' ? 2800 : quality === 'medium' ? 1700 : 800;
  return (
    <group>
      <Sparkles count={count} scale={[95, 65, 520]} size={quality === 'low' ? 0.5 : 0.72} speed={0.12} opacity={0.72} color="#b7efff" position={[0, 0, -240]} />
      <Sparkles count={Math.floor(count * 0.18)} scale={[45, 28, 420]} size={1.15} speed={0.05} opacity={0.34} color="#7b6dff" position={[0, 0, -260]} />
    </group>
  );
}

function CameraRig({ progress, pointer, reduced, cameraMode, shakeSignal }) {
  const { camera } = useThree();
  const temp = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const shake = useRef(0);
  const lastShake = useRef(shakeSignal);
  useEffect(() => {
    if (shakeSignal !== lastShake.current) {
      lastShake.current = shakeSignal;
      shake.current = 0.42;
    }
  }, [shakeSignal]);

  useFrame((state, dt) => {
    const p = progress.current;
    const shipZ = -8 - p * 468;
    const shipX = Math.sin(p * Math.PI * 5.4) * (reduced ? 0.45 : 3.4) + pointer.current.x * 1.25;
    const shipY = Math.sin(p * Math.PI * 8) * (reduced ? 0.2 : 1.2) + pointer.current.y * 0.75;
    let cx = shipX + pointer.current.x * 0.9;
    let cy = shipY + 2.2 + pointer.current.y * 0.5;
    let cz = shipZ + 10.5;
    let fov = 56;

    if (p < 0.075) {
      const intro = p / 0.075;
      cx = 10 - intro * 7 + Math.sin(intro * Math.PI) * 3;
      cy = 5.5 - intro * 2.2;
      cz = 13 - intro * 7;
      fov = 48 + intro * 8;
    } else if (p > 0.19 && p < 0.29) {
      cz = shipZ + 8.2;
      cy = shipY + 1.4;
      fov = 68;
    } else if (p > 0.72 && p < 0.84) {
      cx = shipX + 9.5;
      cy = shipY + 5.6;
      cz = shipZ + 14;
      fov = 62;
    } else if (p > 0.9) {
      cx = shipX + 12 * ((p - 0.9) / 0.1);
      cy = shipY + 5 + 10 * ((p - 0.9) / 0.1);
      cz = shipZ + 20 + 38 * ((p - 0.9) / 0.1);
      fov = 56 + 12 * ((p - 0.9) / 0.1);
    }

    if (cameraMode === 'cockpit') {
      cx = shipX + 1.5;
      cy = shipY + 0.6;
      cz = shipZ + 0.5;
      fov = 74;
    } else if (cameraMode === 'wide') {
      cx = shipX + 15;
      cy = shipY + 8;
      cz = shipZ + 18;
      fov = 52;
    }

    if (shake.current > 0.001 && !reduced) {
      cx += (Math.random() - 0.5) * shake.current;
      cy += (Math.random() - 0.5) * shake.current;
      shake.current *= Math.exp(-dt * 7);
    }

    temp.set(cx, cy, cz);
    camera.position.lerp(temp, 1 - Math.exp(-dt * (reduced ? 8 : 3.4)));
    camera.fov = THREE.MathUtils.damp(camera.fov, fov, 3.2, dt);
    camera.updateProjectionMatrix();
    look.set(shipX, shipY, shipZ - (cameraMode === 'cockpit' ? 18 : 3.5));
    camera.lookAt(look);
  });
  return null;
}

function PostFX({ quality, reduced }) {
  if (quality === 'low' || reduced) return null;
  return (
    <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
      <Bloom intensity={1.2} luminanceThreshold={0.55} luminanceSmoothing={0.4} mipmapBlur />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.00022, 0.00022)} radialModulation={false} modulationOffset={0} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.03} />
      <Vignette eskil={false} offset={0.12} darkness={0.15} />
    </EffectComposer>
  );
}

function World({ progress, pointer, reduced, fireSignal, cameraMode, shakeSignal }) {
  const quality = useQuality();
  return (
    <>
      
      <fogExp2 attach="fog" args={['#493087', quality === 'low' ? 0.003 : 0.002]} />
      <hemisphereLight args={['#a6efff', '#a955ce', 2.4]} />
      <directionalLight position={[-9, 12, 8]} intensity={3.5} color="#c6f7ff" />
      <pointLight position={[10, 4, -120]} intensity={24} distance={60} color={C.violet} />
      <pointLight position={[-10, 0, -242]} intensity={28} distance={70} color={C.cyan} />
      <StarUniverse quality={quality} />
      <HologramLabel text="GOWTHAM" subtext="SEO SPECIALIST  ×  DIGITAL GROWTH" position={[0, 3.1, -24]} scale={[19, 4.75]} opacity={0.34} />
      <HologramLabel text="ABOUT" subtext="PLANET AEON-01" position={[7.2, 5.8, -50]} scale={[8.5, 2.1]} opacity={0.28} />
      <HologramLabel text="MISSIONS" subtext="PROJECT WORLDS" position={[-8, 5.4, -104]} scale={[10, 2.5]} color={C.violet} opacity={0.25} />
      <HologramLabel text="KEYWORD WORLD" subtext="INTENT / CONTENT / DISCOVERY" position={[4.5, 5.7, -184]} scale={[10, 2.5]} opacity={0.23} />
      <HologramLabel text="DATA SPINE" subtext="SYSTEM ARCHITECTURE" position={[-5, 5.5, -240]} scale={[11, 2.7]} color={C.mint} opacity={0.22} />
      <HologramLabel text="CODE" subtext="ANALYZE / OPTIMIZE / MEASURE" position={[6, 4.8, -286]} scale={[8, 2]} opacity={0.22} />
      <HologramLabel text="SKILLS" subtext="CONNECTED CONSTELLATION" position={[-5.8, 5.2, -333]} scale={[8.5, 2.1]} color={C.violet} opacity={0.23} />
      <HologramLabel text="ORBITAL CROWN" subtext="CONNECTED ORGANIC GROWTH" position={[0, 10.5, -446]} scale={[15, 3.7]} opacity={0.24} />
      <Planet position={[14, -5, -55]} radius={8.6} color="#176dad" glow={C.cyan} city />
      <Planet position={[-14, 6, -176]} radius={5.1} color="#9a42ba" glow={C.violet} rings />
      <Planet position={[12, -2, -292]} radius={4.4} color="#159b97" glow={C.mint} />
      <AsteroidField quality={quality} />
      <CombatZone progress={progress} fireSignal={fireSignal} />
      <Portal />
      <PhysicsLab />
      <DataSpine />
      <CodeChamber />
      <SkillUniverse />
      <DockGate />
      <OrbitalCrown />
      <Ship progress={progress} pointer={pointer} reduced={reduced} fireSignal={fireSignal} />
      <CameraRig progress={progress} pointer={pointer} reduced={reduced} cameraMode={cameraMode} shakeSignal={shakeSignal} />
      <PostFX quality={quality} reduced={reduced} />
    </>
  );
}

function MissionWorld({ progress, pointer, reduced, fireSignal, cameraMode, shakeSignal }) {
  const webgl = useMemo(() => {
    try {
      const test = document.createElement('canvas');
      return Boolean(test.getContext('webgl2') || test.getContext('webgl'));
    } catch {
      return false;
    }
  }, []);
  if (!webgl) {
    return <div className="world-canvas world-fallback" aria-hidden="true"><i /><b /><span /></div>;
  }
  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        shadows={false}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', logarithmicDepthBuffer: false }}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); gl.domElement.addEventListener("webglcontextlost", () => { gl.domElement.style.opacity = "0"; gl.domElement.parentElement?.classList.add("world-fallback"); }); }}
        camera={{ position: [0, 2.4, 12], fov: 56, near: 0.1, far: 900 }}
      >
        <Suspense fallback={null}>
          <World progress={progress} pointer={pointer} reduced={reduced} fireSignal={fireSignal} cameraMode={cameraMode} shakeSignal={shakeSignal} />
        </Suspense>
      </Canvas>
    </div>
  );
}

class SceneBoundary extends React.Component {
 constructor(props) { super(props); this.state = { failed: false }; }
 static getDerivedStateFromError() { return { failed: true }; }
 render() { return this.state.failed ? <div className="world-canvas world-fallback" aria-hidden="true"><i/><b/><span/></div> : this.props.children; }
}
export default function SafeMissionWorld(props) { return <SceneBoundary><MissionWorld {...props}/></SceneBoundary>; }
