import { Canvas } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function Disc3D() {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <group ref={groupRef} rotation={[0.4, 0, 0]}>
        {/* Main Disc */}
        <mesh>
          <cylinderGeometry args={[1, 1, 0.05, 32]} />
          <meshStandardMaterial color="#EC4899" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Inner Circle */}
        <mesh position={[0, 0.026, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 32]} />
          <meshStandardMaterial color="#FDE047" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Center Hole */}
        <mesh position={[0, 0.031, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 32]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>

        {/* Decorative rings */}
        <mesh position={[0, 0.026, 0]}>
          <torusGeometry args={[0.6, 0.02, 16, 32]} />
          <meshStandardMaterial color="#F472B6" />
        </mesh>
      </group>
      
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={1.5} color="#EC4899" />
      <pointLight position={[-3, -3, 3]} intensity={1} color="#FDE047" />
    </Float>
  );
}

export function Disc3DIcon() {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 3.5]} />
        <Disc3D />
      </Canvas>
    </div>
  );
}
