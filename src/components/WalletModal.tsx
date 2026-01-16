import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useGameStore } from '../store/gameStore';

export const WalletModal: React.FC = () => {
  const { isWalletModalOpen, setWalletModalOpen } = useGameStore();
  const { 
    connectors, 
    connectWallet, 
    isConnecting, 
    error,
    isConnected,
  } = useWallet();

  // Close modal when connected
  React.useEffect(() => {
    if (isConnected) {
      setWalletModalOpen(false);
    }
  }, [isConnected, setWalletModalOpen]);

  const getConnectorIcon = (id: string) => {
    switch (id) {
      case 'walletConnect':
        return '🔗';
      case 'injected':
      case 'metaMask':
        return '🦊';
      case 'coinbaseWallet':
        return '💰';
      default:
        return '👛';
    }
  };

  const getConnectorDescription = (id: string) => {
    switch (id) {
      case 'walletConnect':
        return 'Scan with your mobile wallet';
      case 'injected':
      case 'metaMask':
        return 'Connect using browser extension';
      case 'coinbaseWallet':
        return 'Connect using Coinbase Wallet';
      default:
        return 'Connect your wallet';
    }
  };

  return (
    <AnimatePresence>
      {isWalletModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWalletModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="glass-strong rounded-3xl p-6 mx-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">Connect Wallet</h2>
                    <p className="text-xs text-gray-400">Choose your preferred wallet</p>
                  </div>
                </div>
                <button
                  onClick={() => setWalletModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-400 font-medium">Connection Failed</p>
                    <p className="text-xs text-red-400/70 mt-1">{error.message}</p>
                  </div>
                </motion.div>
              )}

              {/* Connector List */}
              <div className="space-y-3">
                {connectors.map((connector) => (
                  <motion.button
                    key={connector.id}
                    onClick={() => connectWallet(connector.id)}
                    disabled={isConnecting}
                    className="w-full p-4 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-surface-light flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {connector.icon ? (
                        <img src={connector.icon} alt={connector.name} className="w-8 h-8" />
                      ) : (
                        getConnectorIcon(connector.id)
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{connector.name}</p>
                      <p className="text-xs text-gray-400">{getConnectorDescription(connector.id)}</p>
                    </div>
                    {isConnecting ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                  By connecting, you agree to our{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </p>
              </div>

              {/* Network Info */}
              <div className="mt-4 p-3 rounded-xl bg-surface-light flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-gray-400">Connecting to Sepolia Testnet</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
