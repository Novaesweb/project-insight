import { memo, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { Group, MathUtils, MeshStandardMaterial } from "three";

interface HeroRobotScene3DProps {
  interactive?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

interface NeonGlyphProps {
  position?: [number, number, number];
  scale?: number;
  onRegisterGlow?: (index: number, material: MeshStandardMaterial | null) => void;
}

const shellMaterial = {
  color: "#141934",
  metalness: 0.72,
  roughness: 0.22,
  emissive: "#0b112a",
  emissiveIntensity: 0.18,
};

const trimMaterial = {
  color: "#24305e",
  metalness: 0.86,
  roughness: 0.18,
  emissive: "#1a2450",
  emissiveIntensity: 0.42,
};

const visorMaterial = {
  color: "#060a18",
  metalness: 0.68,
  roughness: 0.18,
  emissive: "#11193d",
  emissiveIntensity: 0.95,
};

function NeonGlyph({ position = [0, 0, 0], scale = 1, onRegisterGlow }: NeonGlyphProps) {
  const segments = useMemo(
    () => [
      { position: [-0.42 * scale, 0.05 * scale, 0], rotation: [0, 0, 0], size: [0.16 * scale, 0.92 * scale, 0.08 * scale] },
      { position: [0.42 * scale, -0.02 * scale, 0], rotation: [0, 0, 0], size: [0.16 * scale, 0.86 * scale, 0.08 * scale] },
      { position: [0.01 * scale, 0.06 * scale, 0], rotation: [0, 0, -0.68], size: [0.14 * scale, 1.14 * scale, 0.08 * scale] },
      { position: [0.2 * scale, -0.48 * scale, 0], rotation: [0, 0, -0.08], size: [0.48 * scale, 0.14 * scale, 0.08 * scale] },
    ],
    [scale],
  );

  return (
    <group position={position}>
      {segments.map((segment, index) => (
        <mesh
          key={`${segment.position.join("-")}-${index}`}
          position={segment.position as [number, number, number]}
          rotation={segment.rotation as [number, number, number]}
          castShadow
        >
          <boxGeometry args={segment.size as [number, number, number]} />
          <meshStandardMaterial
            ref={(material) => onRegisterGlow?.(index, material)}
            color={index === 0 ? "#78c8ff" : "#ff67c9"}
            metalness={0.38}
            roughness={0.2}
            emissive={index === 0 ? "#5ab6ff" : "#ff57d0"}
            emissiveIntensity={2.25}
          />
        </mesh>
      ))}
    </group>
  );
}

function RobotModel({ interactive = true, reducedMotion = false }: Pick<HeroRobotScene3DProps, "interactive" | "reducedMotion">) {
  const robotRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const glowMaterials = useRef<(MeshStandardMaterial | null)[]>([]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const pointerX = interactive && !reducedMotion ? state.pointer.x * 0.18 : 0;
    const pointerY = interactive && !reducedMotion ? state.pointer.y * 0.12 : 0;
    const baseRotationY = 0.26;
    const baseRotationX = -0.06;
    const floatY = Math.sin(time * 1.45) * (reducedMotion ? 0.04 : 0.14);

    if (robotRef.current) {
      robotRef.current.position.y = MathUtils.lerp(robotRef.current.position.y, -0.1 + floatY, delta * 3.6);
      robotRef.current.rotation.y = MathUtils.lerp(robotRef.current.rotation.y, baseRotationY + pointerX, delta * 2.8);
      robotRef.current.rotation.x = MathUtils.lerp(robotRef.current.rotation.x, baseRotationX - pointerY, delta * 2.2);
      robotRef.current.rotation.z = MathUtils.lerp(robotRef.current.rotation.z, Math.sin(time * 0.92) * (reducedMotion ? 0.006 : 0.02), delta * 2.4);
    }

    if (headRef.current) {
      headRef.current.rotation.z = MathUtils.lerp(headRef.current.rotation.z, Math.sin(time * 1.2) * (reducedMotion ? 0.015 : 0.05), delta * 2.8);
      headRef.current.rotation.y = MathUtils.lerp(headRef.current.rotation.y, pointerX * 0.9, delta * 2.4);
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = MathUtils.lerp(
        rightArmRef.current.rotation.z,
        -1.08 + Math.sin(time * 1.65) * (reducedMotion ? 0.025 : 0.07),
        delta * 3.2,
      );
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = MathUtils.lerp(
        leftArmRef.current.rotation.z,
        0.92 + Math.cos(time * 1.2) * (reducedMotion ? 0.018 : 0.05),
        delta * 3.2,
      );
    }

    glowMaterials.current.forEach((material, index) => {
      if (!material) {
        return;
      }

      const intensity = 2.1 + Math.sin(time * 2.3 + index * 0.48) * (reducedMotion ? 0.08 : 0.42);
      material.emissiveIntensity = intensity;
    });
  });

  const registerGlow = (offset: number) => (index: number, material: MeshStandardMaterial | null) => {
    glowMaterials.current[offset + index] = material;
  };

  return (
    <group ref={robotRef} position={[0, -0.1, 0]} scale={1.04}>
      <group ref={headRef} position={[0, 1.18, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.3, 48, 48]} />
          <meshStandardMaterial {...shellMaterial} />
        </mesh>

        <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[1.08, 0.08, 24, 72]} />
          <meshStandardMaterial color="#202f68" metalness={0.9} roughness={0.14} emissive="#3459d8" emissiveIntensity={0.48} />
        </mesh>

        <mesh position={[0, 0.06, 1.1]} castShadow>
          <cylinderGeometry args={[0.86, 0.86, 0.14, 64]} />
          <meshStandardMaterial {...visorMaterial} />
        </mesh>

        <NeonGlyph position={[0, 0.08, 1.22]} scale={0.94} onRegisterGlow={registerGlow(0)} />

        <mesh position={[1.18, 0.06, 0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.28, 0.11, 18, 48]} />
          <meshStandardMaterial color="#2f5cff" metalness={0.82} roughness={0.16} emissive="#69c4ff" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[-1.18, 0.06, 0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.28, 0.11, 18, 48]} />
          <meshStandardMaterial color="#2438a9" metalness={0.82} roughness={0.16} emissive="#7d52ff" emissiveIntensity={0.78} />
        </mesh>

        <mesh position={[0.42, 1.06, 0.18]} rotation={[0.2, 0.18, -0.28]} castShadow>
          <boxGeometry args={[0.18, 0.6, 0.14]} />
          <meshStandardMaterial {...trimMaterial} />
        </mesh>
        <mesh position={[-0.48, 1.02, 0.16]} rotation={[0.14, -0.22, 0.72]} castShadow>
          <boxGeometry args={[0.18, 0.72, 0.14]} />
          <meshStandardMaterial color="#5a89ff" metalness={0.7} roughness={0.14} emissive="#73bcff" emissiveIntensity={0.88} />
        </mesh>
        <mesh position={[0.58, 1.02, 0.1]} rotation={[0.04, 0.12, 0.9]} castShadow>
          <boxGeometry args={[0.14, 0.42, 0.12]} />
          <meshStandardMaterial color="#6d4dff" metalness={0.72} roughness={0.12} emissive="#8b67ff" emissiveIntensity={1.02} />
        </mesh>
      </group>

      <group position={[0, -1.1, 0]}>
        <RoundedBox args={[2.05, 2.38, 1.26]} radius={0.24} smoothness={6} castShadow receiveShadow>
          <meshStandardMaterial color="#171d3e" metalness={0.74} roughness={0.24} emissive="#101637" emissiveIntensity={0.2} />
        </RoundedBox>

        <mesh position={[0, 0.16, 0.48]} castShadow>
          <cylinderGeometry args={[0.78, 0.78, 0.06, 48]} />
          <meshStandardMaterial color="#1a2246" metalness={0.82} roughness={0.16} emissive="#223775" emissiveIntensity={0.45} />
        </mesh>
        <mesh position={[0, 0.18, 0.68]} castShadow>
          <cylinderGeometry args={[0.72, 0.72, 0.16, 48]} />
          <meshStandardMaterial color="#080c1b" metalness={0.58} roughness={0.2} emissive="#141a3b" emissiveIntensity={0.62} />
        </mesh>

        <NeonGlyph position={[0, 0.19, 0.78]} scale={0.62} onRegisterGlow={registerGlow(8)} />

        <mesh position={[0, -1.3, 0.16]} castShadow>
          <cylinderGeometry args={[0.58, 0.72, 0.34, 32]} />
          <meshStandardMaterial color="#151b38" metalness={0.78} roughness={0.2} emissive="#0d1530" emissiveIntensity={0.12} />
        </mesh>
      </group>

      <group ref={leftArmRef} position={[-1.35, -0.38, 0.2]} rotation={[0.22, 0.14, 0.92]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.22, 0.92, 8, 16]} />
          <meshStandardMaterial color="#273569" metalness={0.82} roughness={0.16} emissive="#183088" emissiveIntensity={0.34} />
        </mesh>
        <group position={[0.46, -0.86, 0.04]} rotation={[0.1, 0.2, -1.18]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.18, 0.68, 8, 16]} />
            <meshStandardMaterial color="#32437e" metalness={0.8} roughness={0.14} emissive="#203f9d" emissiveIntensity={0.28} />
          </mesh>
          <mesh position={[0.44, -0.42, 0.06]} castShadow>
            <sphereGeometry args={[0.22, 24, 24]} />
            <meshStandardMaterial color="#1a2248" metalness={0.72} roughness={0.2} emissive="#0f1635" emissiveIntensity={0.12} />
          </mesh>
          <mesh position={[0.56, -0.42, 0.12]} castShadow>
            <sphereGeometry args={[0.09, 18, 18]} />
            <meshStandardMaterial color="#ff70ca" metalness={0.28} roughness={0.26} emissive="#ff5fcb" emissiveIntensity={0.9} />
          </mesh>
        </group>
      </group>

      <group ref={rightArmRef} position={[1.36, 0.02, 0.24]} rotation={[-0.18, -0.52, -1.08]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.22, 0.9, 8, 16]} />
          <meshStandardMaterial color="#314592" metalness={0.82} roughness={0.14} emissive="#2953cf" emissiveIntensity={0.34} />
        </mesh>
        <group position={[0.6, -0.84, 0.08]} rotation={[0.02, -0.26, -0.44]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.18, 0.84, 8, 16]} />
            <meshStandardMaterial color="#2d3a73" metalness={0.82} roughness={0.14} emissive="#2747ba" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0.56, -0.38, 0.08]} castShadow>
            <sphereGeometry args={[0.19, 22, 22]} />
            <meshStandardMaterial color="#1c2450" metalness={0.72} roughness={0.16} emissive="#10183d" emissiveIntensity={0.18} />
          </mesh>
          <mesh position={[0.78, -0.33, 0.18]} rotation={[0, 0.22, 0.28]} castShadow>
            <capsuleGeometry args={[0.06, 0.34, 4, 10]} />
            <meshStandardMaterial color="#7bc8ff" metalness={0.32} roughness={0.22} emissive="#9ad8ff" emissiveIntensity={1.3} />
          </mesh>
          <mesh position={[0.67, -0.26, 0.14]} rotation={[0.04, -0.12, 0.32]} castShadow>
            <capsuleGeometry args={[0.05, 0.18, 4, 10]} />
            <meshStandardMaterial color="#7bc8ff" metalness={0.32} roughness={0.22} emissive="#9ad8ff" emissiveIntensity={1.05} />
          </mesh>
          <mesh position={[0.6, -0.18, 0.12]} rotation={[0.08, -0.14, 0.3]} castShadow>
            <capsuleGeometry args={[0.045, 0.12, 4, 10]} />
            <meshStandardMaterial color="#7bc8ff" metalness={0.32} roughness={0.22} emissive="#9ad8ff" emissiveIntensity={0.95} />
          </mesh>
        </group>
      </group>

      <group position={[-0.52, -3.06, 0.06]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.25, 1.2, 8, 16]} />
          <meshStandardMaterial color="#263664" metalness={0.82} roughness={0.14} emissive="#1b3d97" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, -0.94, 0.1]} castShadow>
          <RoundedBox args={[0.92, 0.48, 1.12]} radius={0.18} smoothness={4}>
            <meshStandardMaterial color="#10172d" metalness={0.62} roughness={0.28} emissive="#0b1222" emissiveIntensity={0.12} />
          </RoundedBox>
        </mesh>
      </group>

      <group position={[0.54, -3.06, 0.06]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.25, 1.2, 8, 16]} />
          <meshStandardMaterial color="#314c95" metalness={0.82} roughness={0.14} emissive="#2959d0" emissiveIntensity={0.32} />
        </mesh>
        <mesh position={[0, -0.94, 0.1]} castShadow>
          <RoundedBox args={[0.92, 0.48, 1.12]} radius={0.18} smoothness={4}>
            <meshStandardMaterial color="#121932" metalness={0.62} roughness={0.28} emissive="#0b1222" emissiveIntensity={0.12} />
          </RoundedBox>
        </mesh>
      </group>
    </group>
  );
}

function HeroRobotScene3D({ interactive = true, reducedMotion = false, className = "" }: HeroRobotScene3DProps) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.7]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.35, 7.2], fov: 28 }}
        shadows
      >
        <color attach="background" args={["#080713"]} />
        <fog attach="fog" args={["#080713", 8, 18]} />
        <ambientLight intensity={0.72} color="#c5d7ff" />
        <hemisphereLight intensity={0.46} color="#bcd2ff" groundColor="#09070f" />
        <spotLight
          position={[5.4, 6.4, 6.2]}
          angle={0.4}
          intensity={40}
          penumbra={0.75}
          color="#7ca8ff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-4.2, 2.8, 2.6]} intensity={12} color="#ff65d4" />
        <pointLight position={[0.2, -0.4, 4.2]} intensity={8.5} color="#7dd3ff" />
        <RobotModel interactive={interactive} reducedMotion={reducedMotion} />
        <ContactShadows position={[0, -4.2, 0]} opacity={0.52} scale={11} blur={2.6} far={6} color="#090a12" />
      </Canvas>
    </div>
  );
}

export default memo(HeroRobotScene3D);
