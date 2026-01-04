import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, RoundedBox, Stars } from '@react-three/drei';
import * as THREE from 'three';

const AccentColor = new THREE.Color('#6366f1'); // Indigo
const SecondaryColor = new THREE.Color('#a855f7'); // Purple

// Glass Cube Component
const GlassCube = ({ position, rotation, scale, color, type = 'cube' }) => {
    const meshRef = useRef();

    // Random rotation speed
    const rotSpeed = useMemo(() => [
        (Math.random() - 0.5) * 0.2, // increased speed slightly
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
    ], []);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += rotSpeed[0] * delta;
            meshRef.current.rotation.y += rotSpeed[1] * delta;
            // meshRef.current.rotation.z += rotSpeed[2] * delta; 
        }
    });

    return (
        <Float
            floatIntensity={2}
            rotationIntensity={1}
            speed={1.5}
            floatingRange={[-0.2, 0.2]} // Subtle float
        >
            <group position={position} rotation={rotation} scale={scale}>
                <RoundedBox
                    ref={meshRef}
                    args={[1, 1, 1]} // Base size
                    radius={0.05}
                    smoothness={4}
                >
                    <meshPhysicalMaterial
                        color={color}
                        roughness={0.15}
                        metalness={0.1}
                        transmission={0.95} // High transmission for glass
                        thickness={2} // Refraction
                        ior={1.5}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        attenuationDistance={0.5}
                        attenuationColor="#ffffff"
                        transparent
                        opacity={0.8}
                        side={THREE.DoubleSide}
                        emissive={color}
                        emissiveIntensity={0.1} // Subtle glow
                    />
                </RoundedBox>
            </group>
        </Float>
    );
};

// Camera Rig for Parallax
const Rig = () => {
    const { camera, mouse } = useThree();
    const vec = new THREE.Vector3();

    useFrame(() => {
        camera.position.lerp(vec.set(mouse.x * 2, mouse.y * 2, camera.position.z), 0.05);
        camera.lookAt(0, 0, 0);
    });
    return null;
}

const FloatingCubes = ({ count = 20 }) => {
    // Generate random data
    const items = useMemo(() => {
        const temp = [];
        const colors = [
            '#a855f7', // Purple (Primary from reference)
            '#6366f1', // Indigo
            '#ec4899', // Pink
            '#3b82f6', // Blue
        ];

        for (let i = 0; i < count; i++) {
            // Reduce panels, make mostly cubes like the reference image
            const isPanel = Math.random() > 0.8;
            const scale = isPanel
                ? [Math.random() * 3 + 2, Math.random() * 3 + 2, 0.2] // Large panels
                : [Math.random() * 2 + 1, Math.random() * 2 + 1, Math.random() * 2 + 1]; // Large chunky cubes

            temp.push({
                position: [
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 12,
                    (Math.random() - 0.5) * 10
                ],
                rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
                scale: scale,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
        return temp;
    }, [count]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0, // Ensure it's not behind the background color (-10 was too low)
            pointerEvents: 'none',
        }}>
            <Canvas
                camera={{ position: [0, 0, 18], fov: 40 }}
                gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
                dpr={[1, 1.5]}
            >
                <fog attach="fog" args={['#050510', 10, 30]} /> {/* Match dark background */}

                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
                <pointLight position={[-10, -10, -10]} intensity={2} color="#3b82f6" />

                <group>
                    {items.map((props, i) => (
                        <GlassCube key={i} {...props} />
                    ))}
                </group>

                <Rig />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};

export default FloatingCubes;
