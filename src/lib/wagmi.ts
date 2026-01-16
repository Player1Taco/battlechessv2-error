import { createConfig, http } from 'wagmi';
import { sepolia, mainnet } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

// WalletConnect Project ID - Get from https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

// Metadata for WalletConnect
const metadata = {
  name: 'Battle Chess NFT',
  description: 'Stake your NFT chess pieces and battle for glory',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://battlechess.io',
  icons: ['https://battlechess.io/icon.png'],
};

// Configure chains
export const chains = [sepolia, mainnet] as const;

// Create wagmi config
export const config = createConfig({
  chains,
  connectors: [
    walletConnect({
      projectId,
      metadata,
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark',
        themeVariables: {
          '--wcm-accent-color': '#9E7FFF',
          '--wcm-background-color': '#171717',
        },
      },
    }),
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
  ],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_RPC_URL || 'https://rpc.sepolia.org'),
    [mainnet.id]: http(),
  },
});

// Export chain config for use elsewhere
export const SUPPORTED_CHAINS = {
  [sepolia.id]: {
    name: 'Sepolia',
    currency: 'ETH',
    explorer: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://rpc.sepolia.org',
  },
  [mainnet.id]: {
    name: 'Ethereum',
    currency: 'ETH',
    explorer: 'https://etherscan.io',
    rpcUrl: 'https://eth.llamarpc.com',
  },
};

export const DEFAULT_CHAIN = sepolia;
