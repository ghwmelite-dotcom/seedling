import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/format';

// Individual 3D Node for a family member
const FamilyNode = ({ member, position, onClick, selected, delay = 0 }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  // Delayed appearance
  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + delay * 0.01) * 0.1;
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  // Color based on financial health
  const getColor = () => {
    switch (member.financialHealth) {
      case 'thriving': return '#22c55e';
      case 'growing': return '#4ade80';
      case 'stable': return '#3b82f6';
      case 'distressed': return '#ef4444';
      default: return '#60a5fa';
    }
  };

  if (!visible) return null;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={position}>
        {/* Main sphere */}
        <mesh
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onClick(member); }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[0.5 + member.branchThickness * 0.3, 32, 32]} />
          <MeshDistortMaterial
            color={getColor()}
            speed={2}
            distort={hovered ? 0.4 : 0.2}
            radius={1}
            emissive={getColor()}
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
        </mesh>

        {/* Glow ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6 + member.branchThickness * 0.3, 0.7 + member.branchThickness * 0.3, 32]} />
          <meshBasicMaterial color={getColor()} transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Selection ring */}
        {selected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 0.9, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Name label */}
        <Text
          position={[0, -0.9, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {member.name}
        </Text>

        {/* Net worth label */}
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.15}
          color={getColor()}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {formatCurrency(member.netWorth)}
        </Text>

        {/* Sparkles for thriving members */}
        {member.financialHealth === 'thriving' && (
          <Sparkles count={20} scale={2} size={3} speed={0.4} color={getColor()} />
        )}
      </group>
    </Float>
  );
};

// Connection line between nodes
const ConnectionLine = ({ start, end, color, delay = 0 }) => {
  const lineRef = useRef();
  const [visible, setVisible] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2 - 0.5,
        (start[2] + end[2]) / 2
      ),
      new THREE.Vector3(...end),
    ]);
    return curve.getPoints(50);
  }, [start, end]);

  if (!visible) return null;

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.6} />
    </line>
  );
};

// Main 3D Scene
const Scene = ({ simulation, onSelectMember, selectedMember }) => {
  const members = simulation?.baseline?.members || [];

  // Calculate positions for each generation
  const getPositions = () => {
    const positions = {};
    const generations = {};

    // Group members by generation
    members.forEach((member) => {
      if (!generations[member.generation]) {
        generations[member.generation] = [];
      }
      generations[member.generation].push(member);
    });

    // Calculate positions
    Object.keys(generations).forEach((gen) => {
      const genMembers = generations[gen];
      const genNum = parseInt(gen);
      const y = -genNum * 3; // Vertical spacing
      const spacing = 3;
      const startX = -(genMembers.length - 1) * spacing / 2;

      genMembers.forEach((member, idx) => {
        positions[member.name] = [startX + idx * spacing, y, Math.sin(idx) * 0.5];
      });
    });

    return positions;
  };

  const positions = getPositions();

  // Create connections
  const connections = useMemo(() => {
    const conns = [];
    members.forEach((member) => {
      if (member.parentId) {
        const parent = members.find((m) => m.name === member.parentId || m.id === member.parentId);
        if (parent && positions[parent.name] && positions[member.name]) {
          conns.push({
            start: positions[parent.name],
            end: positions[member.name],
            color: member.branchColor || '#4ade80',
          });
        }
      }
    });
    return conns;
  }, [members, positions]);

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.4} />

      {/* Directional lights */}
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} color="#4ade80" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#22c55e" />

      {/* Background particles */}
      <Sparkles count={100} scale={30} size={2} speed={0.2} color="#22c55e" opacity={0.3} />

      {/* Connection lines */}
      {connections.map((conn, idx) => (
        <ConnectionLine
          key={idx}
          start={conn.start}
          end={conn.end}
          color={conn.color}
          delay={idx * 100}
        />
      ))}

      {/* Family member nodes */}
      {members.map((member, idx) => (
        <FamilyNode
          key={member.name}
          member={member}
          position={positions[member.name] || [0, 0, 0]}
          onClick={onSelectMember}
          selected={selectedMember?.name === member.name}
          delay={member.generation * 300 + idx * 100}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
};

// Main component wrapper
const Tree3D = ({ simulation, onSelectMember, selectedMember }) => {
  const { viewMode, setViewMode } = useStore();

  if (!simulation?.baseline?.members?.length) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-6xl mb-4">🌳</div>
        <p className="text-slate-400">Run a simulation to see your 3D family tree</p>
      </div>
    );
  }

  return (
    <motion.div
      className="glass-card overflow-hidden relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <span className="text-xl">🌳</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">3D Family Tree</h3>
          <p className="text-slate-400 text-sm">Orbit, zoom, and explore</p>
        </div>
      </div>

      {/* View toggle */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <motion.button
          onClick={() => setViewMode('2d')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            viewMode === '2d'
              ? 'bg-purple-500 text-white'
              : 'bg-slate-700/50 text-slate-400 hover:text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          2D
        </motion.button>
        <motion.button
          onClick={() => setViewMode('3d')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            viewMode === '3d'
              ? 'bg-purple-500 text-white'
              : 'bg-slate-700/50 text-slate-400 hover:text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          3D
        </motion.button>
      </div>

      {/* 3D Canvas */}
      <div className="h-[500px] w-full">
        <Canvas
          camera={{ position: [0, 5, 15], fov: 60 }}
          dpr={[1, 2]}
          style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
        >
          <Scene
            simulation={simulation}
            onSelectMember={onSelectMember}
            selectedMember={selectedMember}
          />
        </Canvas>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="px-4 py-2 bg-slate-900/80 rounded-xl text-slate-400 text-sm flex items-center gap-4">
          <span>🖱️ Drag to rotate</span>
          <span>📜 Scroll to zoom</span>
          <span>👆 Click node for details</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Tree3D;
