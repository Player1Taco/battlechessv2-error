import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/wagmi';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GameModes } from './components/GameModes';
import { MintSection } from './components/MintSection';
import { Leaderboard } from './components/Leaderboard';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { WalletModal } from './components/WalletModal';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background text-white overflow-x-hidden">
          <Navbar />
          <HeroSection />
          <GameModes />
          <MintSection />
          <Leaderboard />
          <HowItWorks />
          <Footer />
          <WalletModal />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
