import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Crown, 
  Gem,
  Shield,
  Sword,
  Castle,
  CircleDot,
  Package,
  ChevronRight,
  Loader2,
  Check,
  AlertCircle,
  Palette,
  Star
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useContracts } from '../hooks/useContracts';
import { useGameStore } from '../store/gameStore';
import { TRAITS } from '../lib/contracts';

interface MintOption {
  id: string;
  title: string;
  description: string;
  pieces: number;
  price: string;
  icon: React.ElementType;
  gradient: string;
  popular?: boolean;
}

const mintOptions: MintOption[] = [
  {
    id: 'full',
    title: 'Full Set',
    description: 'Complete army - Black & White (32 pieces)',
    pieces: 32,
    price: '0.01',
    icon: Package,
    gradient: 'from-primary via-purple-500 to-accent',
    popular: true,
  },
  {
    id: 'white',
    title: 'White Army',
    description: 'Complete white set (16 pieces)',
    pieces: 16,
    price: '0.006',
    icon: Crown,
    gradient: 'from-white/80 to-gray-300',
  },
  {
    id: 'black',
    title: 'Black Army',
    description: 'Complete black set (16 pieces)',
    pieces: 16,
    price: '0.006',
    icon: Shield,
    gradient: 'from-gray-700 to-gray-900',
  },
];

const individualPieces = [
  { type: 'King', typeIndex: 0, icon: Crown, rarity: 'Legendary', color: 'text-yellow-400' },
  { type: 'Queen', typeIndex: 1, icon: Gem, rarity: 'Epic', color: 'text-purple-400' },
  { type: 'Rook', typeIndex: 2, icon: Castle, rarity: 'Rare', color: 'text-blue-400' },
  { type: 'Bishop', typeIndex: 3, icon: Sword, rarity: 'Rare', color: 'text-blue-400' },
  { type: 'Knight', typeIndex: 4, icon: Shield, rarity: 'Common', color: 'text-gray-400' },
  { type: 'Pawn', typeIndex: 5, icon: CircleDot, rarity: 'Common', color: 'text-gray-400' },
];

export const MintSection: React.FC = () => {
  const { isConnected, balanceFormatted } = useWallet();
  const { mintFullSet, mintHalfSet, mintPiece, isLoading } = useContracts();
  const { mintingStatus, setMintingStatus, setWalletModalOpen } = useGameStore();
  
  const [selectedOption, setSelectedOption] = useState<string>('full');
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<'white' | 'black'>('white');
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!isConnected) {
      setWalletModalOpen(true);
      return;
    }

    setError(null);
    setMintingStatus('minting');

    try {
      if (selectedPiece) {
        const piece = individualPieces.find(p => p.type === selectedPiece);
        if (piece) {
          await mintPiece(piece.typeIndex, selectedColor === 'white');
        }
      } else if (selectedOption === 'full') {
        await mintFullSet();
      } else {
        await mintHalfSet(selectedOption === 'white');
      }
      
      setMintingStatus('success');
      setTimeout(() => setMintingStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Mint error:', err);
      setError(err.message || 'Failed to mint. Please try again.');
      setMintingStatus('error');
      setTimeout(() => setMintingStatus('idle'), 5000);
    }
  };

  const getPrice = () => {
    if (selectedPiece) return '0.001';
    return mintOptions.find(o => o.id === selectedOption)?.price || '0.01';
  };

  const hasEnoughBalance = () => {
    const price = parseFloat(getPrice());
    const balance = parseFloat(balanceFormatted);
    return balance >= price;
  };

  return (
    <section id="mint" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-gray-300">Build Your Army</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">MINT YOUR PIECES</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Each piece is a unique ERC-721 NFT with 5 randomized traits. 
            Collect full sets to enter competitive matches.
          </p>
        </motion.div>

        {/* Trait Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">5 Unique Traits Per Piece</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Rarity', options: TRAITS.rarities, icon: Star },
              { name: 'Piece Type', options: TRAITS.pieceTypes.slice(0, 6), icon: Crown },
              { name: 'Collection', options: TRAITS.collections, icon: Palette },
              { name: 'Color', options: TRAITS.colors.slice(0, 2), icon: CircleDot },
              { name: 'Background', options: TRAITS.backgrounds, icon: Gem },
            ].map((trait) => (
              <div key={trait.name} className="glass rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <trait.icon className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold">{trait.name}</p>
                </div>
                <p className="text-xs text-gray-400">{trait.options.length} options</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mint Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {mintOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                setSelectedOption(option.id);
                setSelectedPiece(null);
              }}
              className={`relative glass rounded-3xl p-6 cursor-pointer card-hover ${
                selectedOption === option.id && !selectedPiece ? 'ring-2 ring-primary' : ''
              }`}
            >
              {option.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-xs font-semibold">
                  BEST VALUE
                </div>
              )}

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-4`}>
                <option.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="font-display text-xl font-bold mb-2">{option.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{option.description}</p>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="font-display text-2xl font-bold text-gradient">{option.price} ETH</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Pieces</p>
                  <p className="font-semibold">{option.pieces}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Individual Pieces */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              <Gem className="w-5 h-5 text-primary" />
              Individual Pieces
            </h3>
            <p className="text-sm text-gray-400">0.001 ETH each</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {individualPieces.map((piece) => (
              <motion.button
                key={piece.type}
                onClick={() => {
                  setSelectedPiece(piece.type);
                  setSelectedOption('');
                }}
                className={`p-4 rounded-xl border transition-all text-center ${
                  selectedPiece === piece.type
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-surface-light flex items-center justify-center mb-3">
                  <piece.icon className={`w-6 h-6 ${piece.color}`} />
                </div>
                <p className="font-semibold mb-1">{piece.type}</p>
                <p className={`text-xs ${piece.color}`}>{piece.rarity}</p>
              </motion.button>
            ))}
          </div>

          {/* Color Selection for Individual Pieces */}
          {selectedPiece && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-t border-white/10 pt-6"
            >
              <p className="text-sm text-gray-400 mb-3">Select Color:</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedColor('white')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    selectedColor === 'white'
                      ? 'border-white bg-white/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-8 h-8 mx-auto rounded-full bg-white mb-2" />
                  <p className="font-semibold">White</p>
                </button>
                <button
                  onClick={() => setSelectedColor('black')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    selectedColor === 'black'
                      ? 'border-gray-400 bg-gray-800/50'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-8 h-8 mx-auto rounded-full bg-gray-800 border border-gray-600 mb-2" />
                  <p className="font-semibold">Black</p>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">Transaction Failed</p>
                <p className="text-xs text-red-400/70 mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mint Summary & Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                {selectedPiece ? (
                  <Gem className="w-10 h-10 text-white" />
                ) : (
                  <Package className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400">Selected</p>
                <p className="font-display text-2xl font-bold">
                  {selectedPiece 
                    ? `${selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)} ${selectedPiece}`
                    : mintOptions.find(o => o.id === selectedOption)?.title || 'Full Set'
                  }
                </p>
                <p className="text-gray-400">
                  {selectedPiece 
                    ? '1 piece with random traits'
                    : `${mintOptions.find(o => o.id === selectedOption)?.pieces || 32} pieces`
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Price</p>
                <p className="font-display text-3xl font-bold text-gradient">
                  {getPrice()} ETH
                </p>
                <p className="text-xs text-gray-500">
                  {isConnected 
                    ? `Balance: ${balanceFormatted} ETH`
                    : '+ gas fees'
                  }
                </p>
              </div>

              <motion.button
                onClick={handleMint}
                disabled={mintingStatus === 'minting' || (isConnected && !hasEnoughBalance())}
                className={`btn-primary flex items-center gap-3 min-w-[200px] justify-center ${
                  isConnected && !hasEnoughBalance() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {mintingStatus === 'minting' ? (
                    <motion.div
                      key="minting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Minting...
                    </motion.div>
                  ) : mintingStatus === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-green-400"
                    >
                      <Check className="w-5 h-5" />
                      Success!
                    </motion.div>
                  ) : !isConnected ? (
                    <motion.div
                      key="connect"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Connect to Mint
                    </motion.div>
                  ) : !hasEnoughBalance() ? (
                    <motion.div
                      key="insufficient"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <AlertCircle className="w-5 h-5" />
                      Insufficient Balance
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Mint Now
                      <ChevronRight className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
