import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ChevronDown, 
  LogOut, 
  Copy, 
  ExternalLink,
  Loader2,
  Crown,
  Swords,
  Trophy,
  User,
  Settings,
  Check,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useContracts } from '../hooks/useContracts';
import { useGameStore } from '../store/gameStore';

export const Navbar: React.FC = () => {
  const { 
    isConnected, 
    isConnecting,
    address, 
    balanceFormatted, 
    isCorrectChain,
    disconnectWallet,
    switchToSepolia,
    isSwitchingChain,
    refetchBalance,
    isBalanceLoading,
  } = useWallet();
  
  const { playerStats, isLoading: isStatsLoading } = useContracts();
  const { setWalletModalOpen } = useGameStore();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-strong rounded-2xl px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Swords className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-wider">BATTLE CHESS</h1>
              <p className="text-xs text-gray-400 tracking-widest">SEPOLIA TESTNET</p>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {['Play', 'Mint', 'Collection', 'Leaderboard'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-300 hover:text-white transition-colors relative group"
                whileHover={{ y: -2 }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="relative">
            {!isConnected ? (
              <motion.button
                onClick={() => setWalletModalOpen(true)}
                disabled={isConnecting}
                className="btn-primary flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </>
                )}
              </motion.button>
            ) : !isCorrectChain ? (
              <motion.button
                onClick={switchToSepolia}
                disabled={isSwitchingChain}
                className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl px-4 py-2 flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.02 }}
              >
                {isSwitchingChain ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                Switch to Sepolia
              </motion.button>
            ) : (
              <motion.button
                onClick={() => setShowDropdown(!showDropdown)}
                className="glass rounded-xl px-4 py-2 flex items-center gap-3 hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{truncateAddress(address!)}</p>
                  <p className="text-xs text-gray-400">
                    {isBalanceLoading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      `${balanceFormatted} ETH`
                    )}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </motion.button>
            )}

            <AnimatePresence>
              {showDropdown && isConnected && isCorrectChain && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 glass-strong rounded-xl overflow-hidden"
                >
                  {/* Wallet Info */}
                  <div className="p-4 border-b border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono">{truncateAddress(address!)}</p>
                      <button 
                        onClick={copyAddress}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <a 
                        href={`https://sepolia.etherscan.io/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => refetchBalance()}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Refresh balance"
                      >
                        <RefreshCw className={`w-3 h-3 ${isBalanceLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-4 border-b border-white/10">
                    {isStatsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="glass rounded-lg p-2 text-center">
                          <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-400">ELO</p>
                          <p className="font-display font-bold text-primary">
                            {playerStats?.elo || 1200}
                          </p>
                        </div>
                        <div className="glass rounded-lg p-2 text-center">
                          <Swords className="w-4 h-4 text-accent mx-auto mb-1" />
                          <p className="text-xs text-gray-400">W/L</p>
                          <p className="font-display font-bold">
                            <span className="text-green-400">{playerStats?.wins || 0}</span>
                            <span className="text-gray-500">/</span>
                            <span className="text-red-400">{playerStats?.losses || 0}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-2">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">
                      <User className="w-4 h-4" />
                      My Collection
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
