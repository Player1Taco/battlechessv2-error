import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Bot, 
  Swords, 
  Clock, 
  Trophy,
  Zap,
  Shield,
  Target,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Flame,
  Loader2
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useContracts } from '../hooks/useContracts';
import { useGameStore } from '../store/gameStore';

interface GameMode {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  features: string[];
  stakes: string;
  stakesColor: string;
}

const gameModes: GameMode[] = [
  {
    id: 'pvp',
    title: 'Player vs Player',
    description: 'Challenge real opponents. Stake your pieces. Winner takes 90% + picks a piece.',
    icon: Users,
    gradient: 'from-primary to-purple-600',
    features: [
      'Real-time matchmaking',
      'ELO ranking system',
      '0.001 ETH entry fee',
      'Winner picks piece from loser',
    ],
    stakes: 'Real Stakes',
    stakesColor: 'bg-red-500/20 text-red-400',
  },
  {
    id: 'ai',
    title: 'Player vs AI',
    description: 'Practice against our AI. Must stake pieces but no entry fee or piece loss.',
    icon: Bot,
    gradient: 'from-secondary to-cyan-400',
    features: [
      '3 difficulty levels',
      'Tricky & aggressive AI',
      'Stake required (no loss)',
      'Earn XP & practice',
    ],
    stakes: 'Practice Mode',
    stakesColor: 'bg-green-500/20 text-green-400',
  },
];

const difficulties = [
  { level: 'Easy', elo: '~800', color: 'text-green-400', description: 'Learning the ropes', personality: 'Predictable' },
  { level: 'Medium', elo: '~1400', color: 'text-yellow-400', description: 'Solid challenge', personality: 'Tricky' },
  { level: 'Hard', elo: '~2000', color: 'text-red-400', description: 'Expert level', personality: 'Aggressive' },
];

const timeControls = [
  { name: 'Bullet', time: '1+0', icon: Zap, description: '1 min total' },
  { name: 'Blitz', time: '3+2', icon: Clock, description: '3 min + 2s/move' },
  { name: 'Rapid', time: '10+5', icon: Target, description: '10 min + 5s/move' },
  { name: 'Standard', time: '30+3', icon: Shield, description: '30 min + 3s/move', default: true },
];

export const GameModes: React.FC = () => {
  const { isConnected } = useWallet();
  const { ownedPieces, hasWhiteSet, hasBlackSet, isLoading } = useContracts();
  const { setWalletModalOpen } = useGameStore();
  
  const [selectedMode, setSelectedMode] = useState<string>('pvp');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Medium');
  const [selectedTime, setSelectedTime] = useState<string>('Standard');

  const canPlay = hasWhiteSet || hasBlackSet;

  const handleStartGame = () => {
    if (!isConnected) {
      setWalletModalOpen(true);
      return;
    }
    
    if (!canPlay) {
      // Scroll to mint section
      document.getElementById('mint')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // TODO: Implement game start logic
    console.log('Starting game:', { selectedMode, selectedDifficulty, selectedTime });
  };

  return (
    <section id="play" className="py-24 relative">
      <div className="absolute inset-0 circuit-pattern opacity-50" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4">
            <Swords className="w-4 h-4 text-primary" />
            <span className="text-sm text-gray-300">Choose Your Battle</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">GAME MODES</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Compete for real stakes in PvP or practice against our tricky AI. 
            You must have a complete set (16 pieces) of one color to play.
          </p>
        </motion.div>

        {/* Eligibility Check */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`glass rounded-2xl p-6 mb-8 border ${
              canPlay ? 'border-green-500/30' : 'border-yellow-500/30'
            }`}
          >
            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="w-12 h-12 rounded-xl bg-surface-light flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : canPlay ? (
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold">
                  {isLoading 
                    ? 'Loading your collection...'
                    : canPlay 
                      ? 'Ready to Play!' 
                      : 'Complete Set Required'
                  }
                </p>
                <p className="text-sm text-gray-400">
                  {isLoading 
                    ? 'Fetching your NFT pieces from the blockchain'
                    : canPlay 
                      ? `You can play as ${hasWhiteSet ? 'White' : ''}${hasWhiteSet && hasBlackSet ? ' or ' : ''}${hasBlackSet ? 'Black' : ''}`
                      : 'You need 16 pieces of one color (1 King, 1 Queen, 2 Rooks, 2 Bishops, 2 Knights, 8 Pawns)'
                  }
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400">White</p>
                  <p className={`font-display font-bold ${hasWhiteSet ? 'text-green-400' : 'text-gray-500'}`}>
                    {ownedPieces.filter(p => p.color === 'white').length}/16
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Black</p>
                  <p className={`font-display font-bold ${hasBlackSet ? 'text-green-400' : 'text-gray-500'}`}>
                    {ownedPieces.filter(p => p.color === 'black').length}/16
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Game Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              onClick={() => setSelectedMode(mode.id)}
              className={`relative glass rounded-3xl p-8 cursor-pointer card-hover ${
                selectedMode === mode.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-5 rounded-3xl`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center`}>
                    <mode.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${mode.stakesColor}`}>
                    {mode.stakes}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold mb-2">{mode.title}</h3>
                <p className="text-gray-400 mb-6">{mode.description}</p>

                <ul className="space-y-3 mb-6">
                  {mode.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${mode.gradient} flex items-center justify-center`}>
                        <ChevronRight className="w-3 h-3 text-white" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {selectedMode === mode.id && (
                  <motion.div
                    layoutId="selectedMode"
                    className="absolute bottom-4 right-4"
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${mode.gradient} flex items-center justify-center`}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Configuration Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Time Controls */}
            <div>
              <h4 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Time Control
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {timeControls.map((time) => (
                  <motion.button
                    key={time.name}
                    onClick={() => setSelectedTime(time.name)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedTime === time.name
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <time.icon className={`w-5 h-5 mb-2 ${
                      selectedTime === time.name ? 'text-primary' : 'text-gray-400'
                    }`} />
                    <p className="font-semibold">{time.name}</p>
                    <p className="text-xs text-gray-400">{time.description}</p>
                    {time.default && (
                      <span className="text-xs text-primary">Default</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* AI Difficulty or PvP Stakes */}
            {selectedMode === 'ai' ? (
              <div>
                <h4 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-secondary" />
                  AI Difficulty
                </h4>
                <div className="space-y-3">
                  {difficulties.map((diff) => (
                    <motion.button
                      key={diff.level}
                      onClick={() => setSelectedDifficulty(diff.level)}
                      className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                        selectedDifficulty === diff.level
                          ? 'border-secondary bg-secondary/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${diff.color}`}>{diff.level}</span>
                        <span className="text-sm text-gray-400">{diff.description}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{diff.elo} ELO</p>
                        <p className="text-xs text-gray-600">{diff.personality}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent" />
                  Stakes & Rewards
                </h4>
                <div className="glass rounded-xl p-6 border border-accent/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Entry Fee</span>
                      <span className="font-display font-bold text-white">0.001 ETH</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Winner Gets</span>
                      <span className="font-display font-bold text-green-400">90% of Pool</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Platform Fee</span>
                      <span className="font-display font-bold text-gray-500">10%</span>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center gap-2 text-accent">
                        <Flame className="w-4 h-4" />
                        <span className="text-sm font-semibold">Winner picks 1 piece from loser!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Start Game Button */}
          <motion.button
            onClick={handleStartGame}
            className={`w-full mt-8 text-lg flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all ${
              isConnected && canPlay
                ? 'btn-primary'
                : 'bg-gradient-to-r from-primary to-accent text-white hover:opacity-90'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Swords className="w-6 h-6" />
            {!isConnected 
              ? 'Connect Wallet to Play'
              : !canPlay 
                ? 'Mint Pieces to Play'
                : selectedMode === 'pvp' 
                  ? 'Find Opponent' 
                  : 'Start Practice'
            }
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
