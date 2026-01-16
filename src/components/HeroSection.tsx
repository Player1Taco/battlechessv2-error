import React, { Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import { Play, Sparkles, Shield, Trophy, Zap, Crown, Gem } from 'lucide-react';
import * as THREE from 'three';
import { useWallet } from '../hooks/useWallet';
import { useGameStore } from '../store/gameStore';

// 3D Chess Piece Component
const ChessPiece3D: React.FC<{ 
  position: [number, number, number]; 
  color: string;
  emissive: string;
  scale?: number;
}> = ({ position, color, emissive, scale = 1 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
      <group position={position} scale={scale}>
        {/* Base */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.4, 0.5, 0.3, 32]} />
          <meshStandardMaterial 
            color={color} 
            metalness={0.9} 
            roughness={0.1}
            emissive={emissive}
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Body */}
        <mesh ref={meshRef} position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.25, 0.35, 1, 32]} />
          <MeshDistortMaterial
            color={color}
            metalness={0.8}
            roughness={0.2}
            emissive={emissive}
            emissiveIntensity={0.3}
            distort={0.1}
            speed={2}
          />
        </mesh>
        {/* Crown */}
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            metalness={1} 
            roughness={0}
            emissive={emissive}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </Float>
  );
};

// Floating particles
const Particles: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 100;
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#9E7FFF" transparent opacity={0.6} />
    </points>
  );
};

const ChessScene: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#9E7FFF" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#38bdf8" />
      <spotLight position={[0, 15, 0]} intensity={1} color="#f472b6" angle={0.4} penumbra={1} />
      
      {/* Chess pieces */}
      <ChessPiece3D position={[-3, 0, 0]} color="#9E7FFF" emissive="#9E7FFF" scale={1.2} />
      <ChessPiece3D position={[0, 0.5, -2]} color="#38bdf8" emissive="#38bdf8" scale={1} />
      <ChessPiece3D position={[3, 0, 0]} color="#f472b6" emissive="#f472b6" scale={1.1} />
      <ChessPiece3D position={[-1.5, -0.3, 2]} color="#ffffff" emissive="#ffffff" scale={0.9} />
      <ChessPiece3D position={[2, 0.2, -1]} color="#10b981" emissive="#10b981" scale={0.85} />
      
      <Particles />
      
      {/* Glowing board base */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial 
          color="#0a0a0f" 
          metalness={0.9} 
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      <Environment preset="night" />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4}
      />
    </>
  );
};

export const HeroSection: React.FC = () => {
  const { isConnected } = useWallet();
  const { setWalletModalOpen } = useGameStore();

  const features = [
    { icon: Shield, text: 'Stake to Play', color: 'from-primary to-purple-600' },
    { icon: Trophy, text: 'Win NFT Pieces', color: 'from-secondary to-cyan-400' },
    { icon: Zap, text: '0.001 ETH Entry', color: 'from-accent to-pink-400' },
  ];

  const handlePlayClick = () => {
    if (!isConnected) {
      setWalletModalOpen(true);
    } else {
      // Scroll to game modes section
      document.getElementById('play')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMintClick = () => {
    if (!isConnected) {
      setWalletModalOpen(true);
    } else {
      // Scroll to mint section
      document.getElementById('mint')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Background Effects */}
      <div className="absolute inset-0 hex-pattern" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 50, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-accent/15 rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-gray-300">Live on Sepolia Testnet</span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl font-black leading-tight mb-6">
            <motion.span 
              className="text-gradient inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              STAKE.
            </motion.span>
            <br />
            <motion.span 
              className="text-white inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              PLAY.
            </motion.span>
            <br />
            <motion.span 
              className="text-gradient inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              CONQUER.
            </motion.span>
          </h1>

          <motion.p 
            className="text-xl text-gray-400 mb-8 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Own your chess pieces as unique ERC-721 NFTs. Stake them to battle. 
            <span className="text-white font-semibold"> Winner takes 90% + picks a piece</span> from the loser's army.
          </motion.p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 mb-10">
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 glass rounded-full"
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              onClick={handlePlayClick}
              className="btn-primary flex items-center gap-2 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5" />
              {isConnected ? 'Start Playing' : 'Connect to Play'}
            </motion.button>
            <motion.button
              onClick={handleMintClick}
              className="btn-secondary flex items-center gap-2 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              {isConnected ? 'Mint Pieces' : 'Connect to Mint'}
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            {[
              { value: '0.01', label: 'ETH Full Set', icon: Crown },
              { value: '0.001', label: 'ETH Entry Fee', icon: Gem },
              { value: '90%', label: 'Winner Takes', icon: Trophy },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <p className="font-display text-2xl md:text-3xl font-bold text-gradient">{stat.value}</p>
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right - 3D Scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative h-[500px] lg:h-[600px]"
        >
          <div className="absolute inset-0 neon-border rounded-3xl overflow-hidden">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-surface">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <Canvas camera={{ position: [0, 4, 8], fov: 45 }}>
                <ChessScene />
              </Canvas>
            </Suspense>
          </div>
          
          {/* Floating badges */}
          <motion.div
            className="absolute -top-4 -right-4 glass-strong rounded-xl px-4 py-2"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <p className="text-xs text-gray-400">Platform Fee</p>
            <p className="font-display font-bold text-accent">10%</p>
          </motion.div>
          
          <motion.div
            className="absolute -bottom-4 -left-4 glass-strong rounded-xl px-4 py-2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <p className="text-xs text-gray-400">Winner Gets</p>
            <p className="font-display font-bold text-green-400">90% + Piece</p>
          </motion.div>

          <motion.div
            className="absolute top-1/2 -right-8 glass-strong rounded-xl px-4 py-2"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <p className="text-xs text-gray-400">NFT Standard</p>
            <p className="font-display font-bold text-secondary">ERC-721</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};
