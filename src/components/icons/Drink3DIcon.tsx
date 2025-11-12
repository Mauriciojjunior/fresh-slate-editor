import { Canvas } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';

function Drink3D() {

  return (
    <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.7}>
      <group rotation={[0.2, 0.3, 0]}>
        {/* Wine Bottle Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.4, 2, 32]} />
          <meshStandardMaterial 
            color="#10B981" 
            transparent 
            opacity={0.7} 
            metalness={0.3} 
            roughness={0.2} 
          />
        </mesh>
        
        {/* Bottle Neck */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.6, 32]} />
          <meshStandardMaterial 
            color="#059669" 
            transparent 
            opacity={0.7} 
            metalness={0.3} 
            roughness={0.2} 
          />
        </mesh>
        
        {/* Cork */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.13, 0.12, 0.2, 32]} />
          <meshStandardMaterial color="#D97706" />
        </mesh>

        {/* Label */}
        <mesh position={[0, 0.3, 0.36]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshStandardMaterial color="#FCD34D" />
        </mesh>

        {/* Wine Glass */}
        <mesh position={[0.8, -0.5, 0]}>
          <cylinderGeometry args={[0.25, 0.15, 0.6, 32]} />
          <meshStandardMaterial 
            color="#DC2626" 
            transparent 
            opacity={0.6} 
            metalness={0.5} 
            roughness={0.1} 
          />
        </mesh>
        
        {/* Glass Stem */}
        <mesh position={[0.8, -0.95, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 32]} />
          <meshStandardMaterial 
            color="#F3F4F6" 
            transparent 
            opacity={0.8} 
            metalness={0.8} 
            roughness={0.1} 
          />
        </mesh>
        
        {/* Glass Base */}
        <mesh position={[0.8, -1.25, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
          <meshStandardMaterial 
            color="#F3F4F6" 
            transparent 
            opacity={0.8} 
            metalness={0.8} 
            roughness={0.1} 
          />
        </mesh>
      </group>
      
      <ambientLight intensity={0.7} />
      <pointLight position={[3, 3, 3]} intensity={1.2} color="#10B981" />
      <pointLight position={[-3, 2, 2]} intensity={0.8} color="#FCD34D" />
    </Float>
  );
}

export const Drink3DIcon = () => {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        <Drink3D />
      </Canvas>
    </div>
  );
};
