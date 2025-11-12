import { Canvas } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';

function Book3D() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group rotation={[0.3, -0.5, 0]}>
        {/* Book Cover */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[1.2, 1.6, 0.1]} />
          <meshStandardMaterial color="#8B5CF6" />
        </mesh>
        
        {/* Book Pages */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[1.15, 1.55, 0.15]} />
          <meshStandardMaterial color="#F3F4F6" />
        </mesh>
        
        {/* Book Spine */}
        <mesh position={[-0.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.2, 1.6, 0.1]} />
          <meshStandardMaterial color="#7C3AED" />
        </mesh>

        {/* Decorative elements */}
        <mesh position={[0, 0.5, 0.11]}>
          <boxGeometry args={[0.8, 0.3, 0.02]} />
          <meshStandardMaterial color="#FCD34D" />
        </mesh>
      </group>
      
      <ambientLight intensity={0.8} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} />
    </Float>
  );
}

export const Book3DIcon = () => {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        <Book3D />
      </Canvas>
    </div>
  );
};
