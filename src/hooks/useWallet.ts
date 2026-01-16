import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { sepolia } from 'wagmi/chains';

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  address: string | undefined;
  chainId: number | undefined;
  balance: string;
  balanceFormatted: string;
  isCorrectChain: boolean;
  error: Error | null;
}

export function useWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending: isConnectPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  
  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address,
    chainId: sepolia.id,
  });

  const [error, setError] = useState<Error | null>(null);

  // Check if on correct chain (Sepolia)
  const isCorrectChain = chainId === sepolia.id;

  // Format balance
  const balance = balanceData?.value?.toString() || '0';
  const balanceFormatted = balanceData?.formatted 
    ? parseFloat(balanceData.formatted).toFixed(4) 
    : '0.0000';

  // Handle connection errors
  useEffect(() => {
    if (connectError) {
      setError(connectError);
      // Clear error after 5 seconds
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [connectError]);

  // Connect wallet
  const connectWallet = useCallback(async (connectorId?: string) => {
    setError(null);
    try {
      const connector = connectorId 
        ? connectors.find(c => c.id === connectorId) 
        : connectors[0];
      
      if (connector) {
        connect({ connector });
      }
    } catch (err) {
      setError(err as Error);
    }
  }, [connect, connectors]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setError(null);
    disconnect();
  }, [disconnect]);

  // Switch to Sepolia
  const switchToSepolia = useCallback(async () => {
    setError(null);
    try {
      switchChain({ chainId: sepolia.id });
    } catch (err) {
      setError(err as Error);
    }
  }, [switchChain]);

  // Get available connectors with metadata
  const availableConnectors = connectors.map(connector => ({
    id: connector.id,
    name: connector.name,
    icon: connector.icon,
    ready: true,
  }));

  return {
    // State
    isConnected,
    isConnecting: isConnecting || isConnectPending,
    isReconnecting,
    isSwitchingChain: isSwitchPending,
    address,
    chainId,
    balance,
    balanceFormatted,
    isCorrectChain,
    isBalanceLoading,
    error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    refetchBalance,
    
    // Connectors
    connectors: availableConnectors,
  };
}
