import { Canvas } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';

function Game3D() {
  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={0.6}>
      <group rotation={[0.3, 0.4, 0]}>
        {/* Game Controller Body */}
        <mesh>
          <boxGeometry args={[2, 1, 0.4]} />
          <meshStandardMaterial color="#3B82F6" />
        </mesh>
        
        {/* Left Grip */}
        <mesh position={[-0.7, -0.4, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.5, 0.6, 0.4]} />
          <meshStandardMaterial color="#2563EB" />
        </mesh>
        
        {/* Right Grip */}
        <mesh position={[0.7, -0.4, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.5, 0.6, 0.4]} />
          <meshStandardMaterial color="#2563EB" />
        </mesh>

        {/* D-Pad */}
        <group position={[-0.5, 0.2, 0.25]}>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.1, 0.15, 0.05]} />
            <meshStandardMaterial color="#1F2937" />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[0.1, 0.15, 0.05]} />
            <meshStandardMaterial color="#1F2937" />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <boxGeometry args={[0.15, 0.1, 0.05]} />
            <meshStandardMaterial color="#1F2937" />
          </mesh>
          <mesh position={[-0.15, 0, 0]}>
            <boxGeometry args={[0.15, 0.1, 0.05]} />
            <meshStandardMaterial color="#1F2937" />
          </mesh>
        </group>

        {/* Action Buttons */}
        <group position={[0.5, 0.2, 0.25]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
            <meshStandardMaterial color="#FCD34D" />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
            <meshStandardMaterial color="#10B981" />
          </mesh>
          <mesh position={[-0.15, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
            <meshStandardMaterial color="#06B6D4" />
          </mesh>
        </group>

        {/* Analog Sticks */}
        <mesh position={[-0.2, -0.1, 0.25]}>
          <cylinderGeometry args={[0.15, 0.15, 0.08, 32]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>
        <mesh position={[0.3, -0.3, 0.25]}>
          <cylinderGeometry args={[0.15, 0.15, 0.08, 32]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>
      </group>
      
      <ambientLight intensity={0.7} />
      <pointLight position={[3, 3, 3]} intensity={1.5} color="#3B82F6" />
      <pointLight position={[-3, -2, 2]} intensity={1} color="#FCD34D" />
    </Float>
  );
}

export const Game3DIcon = () => {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        <Game3D />
      </Canvas>
    </div>
  );
};
