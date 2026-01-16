import { ethers } from 'ethers';

// Sepolia Chain Configuration
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';

export const CHAIN_CONFIG = {
  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY', 'https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

// Contract addresses (to be deployed)
export const CONTRACT_ADDRESSES = {
  BattleChessNFT: '0x0000000000000000000000000000000000000000', // Deploy and update
  GameStaking: '0x0000000000000000000000000000000000000000', // Deploy and update
};

// Pricing constants (in ETH)
export const PRICING = {
  FULL_SET: '0.01',
  HALF_SET: '0.006',
  INDIVIDUAL: '0.001',
  ENTRY_FEE: '0.001',
};

// Connect wallet
export async function connectWallet(): Promise<{
  provider: ethers.BrowserProvider;
  signer: ethers.Signer;
  address: string;
}> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  
  // Request account access
  await provider.send('eth_requestAccounts', []);
  
  // Check network
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
    // Switch to Sepolia
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CHAIN_CONFIG],
        });
      } else {
        throw switchError;
      }
    }
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

// Get balance
export async function getBalance(address: string): Promise<string> {
  if (!window.ethereum) return '0';
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

// Format address
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format ETH
export function formatEth(wei: bigint | string): string {
  const value = typeof wei === 'string' ? wei : ethers.formatEther(wei);
  return parseFloat(value).toFixed(4);
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
