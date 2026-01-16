import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Sparkles, 
  Lock, 
  Swords, 
  Trophy,
  ArrowRight,
  Shield,
  Gem,
  Coins
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useGameStore } from '../store/gameStore';

const steps = [
  {
    number: '01',
    title: 'Connect Wallet',
    description: 'Link your MetaMask to Sepolia testnet',
    icon: Wallet,
    color: 'from-blue-500 to-cyan-400',
  },
  {
    number: '02',
    title: 'Mint Pieces',
    description: 'Get your ERC-721 chess pieces (0.01 ETH full set)',
    icon: Sparkles,
    color: 'from-primary to-purple-500',
  },
  {
    number: '03',
    title: 'Stake Your Set',
    description: 'Lock 16 pieces of one color to enter matches',
    icon: Lock,
    color: 'from-accent to-pink-500',
  },
  {
    number: '04',
    title: 'Battle & Win',
    description: 'Play chess, winner gets 90% + picks a piece',
    icon: Swords,
    color: 'from-orange-500 to-red-500',
  },
  {
    number: '05',
    title: 'Claim Rewards',
    description: 'Winner pays gas to verify & claim on-chain',
    icon: Trophy,
    color: 'from-yellow-500 to-amber-400',
  },
];

export const HowItWorks: React.FC = () => {
  const { isConnected } = useWallet();
  const { setWalletModalOpen } = useGameStore();

  const handleConnectClick = () => {
    if (!isConnected) {
      setWalletModalOpen(true);
    }
  };

  const handleMintClick = () => {
    if (!isConnected) {
      setWalletModalOpen(true);
    } else {
      document.getElementById('mint')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 hex-pattern opacity-30" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4">
            <Shield className="w-4 h-4 text-secondary" />
            <span className="text-sm text-gray-300">Simple Process</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">HOW IT WORKS</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From connecting your wallet to claiming victory. Game state is off-chain until match end, 
            then winner verifies on-chain.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-primary/50" />
                  </div>
                )}

                <div className="glass rounded-3xl p-6 h-full card-hover relative overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                  <div className="absolute top-4 right-4 font-display text-4xl font-black text-white/5">
                    {step.number}
                  </div>

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="font-display text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid md:grid-cols-3 gap-6"
        >
          <div className="glass rounded-2xl p-6 border border-green-500/20">
            <Coins className="w-8 h-8 text-green-400 mb-4" />
            <h4 className="font-display font-bold mb-2">Low Entry Cost</h4>
            <p className="text-sm text-gray-400">
              Full set: 0.01 ETH<br />
              Entry fee: 0.001 ETH<br />
              Affordable for everyone
            </p>
          </div>
          <div className="glass rounded-2xl p-6 border border-primary/20">
            <Trophy className="w-8 h-8 text-primary mb-4" />
            <h4 className="font-display font-bold mb-2">Winner Takes All</h4>
            <p className="text-sm text-gray-400">
              90% of prize pool<br />
              + Pick any piece from loser<br />
              Only 10% platform fee
            </p>
          </div>
          <div className="glass rounded-2xl p-6 border border-secondary/20">
            <Shield className="w-8 h-8 text-secondary mb-4" />
            <h4 className="font-display font-bold mb-2">Fair & Secure</h4>
            <p className="text-sm text-gray-400">
              Off-chain gameplay<br />
              On-chain verification<br />
              Winner pays gas to claim
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="glass-strong rounded-3xl p-8 md:p-12 max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Gem className="w-8 h-8 text-primary" />
                <h3 className="font-display text-2xl md:text-3xl font-bold">Ready to Battle?</h3>
                <Gem className="w-8 h-8 text-accent" />
              </div>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join the arena on Sepolia testnet. Mint your pieces, stake your army, 
                and prove your chess mastery.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.button
                  onClick={handleConnectClick}
                  className="btn-primary flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Wallet className="w-5 h-5" />
                  {isConnected ? 'Wallet Connected' : 'Connect & Play'}
                </motion.button>
                <motion.button
                  onClick={handleMintClick}
                  className="btn-secondary flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-5 h-5" />
                  {isConnected ? 'Mint Pieces' : 'Connect to Mint'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
