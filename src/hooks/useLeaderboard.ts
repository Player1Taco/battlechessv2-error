import { useCallback, useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, GAME_STAKING_ABI } from '../lib/contracts';

export interface LeaderboardEntry {
  rank: number;
  address: string;
  elo: number;
  wins: number;
  losses: number;
  winRate: number;
  ethWon: string;
  points: number;
  trend: 'up' | 'down' | 'same';
}

export interface SeasonInfo {
  seasonId: number;
  timeRemaining: string;
  totalPlayers: number;
  prizePool: string;
}

// Mock leaderboard data - in production, this would come from an indexer or backend
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, address: '0x742d...fE21', elo: 2450, wins: 156, losses: 23, winRate: 87.2, ethWon: '2.45', points: 15600, trend: 'up' },
  { rank: 2, address: '0x8f3a...2b4c', elo: 2380, wins: 142, losses: 31, winRate: 82.1, ethWon: '2.12', points: 14200, trend: 'same' },
  { rank: 3, address: '0x1a2b...9c8d', elo: 2290, wins: 128, losses: 38, winRate: 77.1, ethWon: '1.89', points: 12800, trend: 'up' },
  { rank: 4, address: '0x5e6f...3a2b', elo: 2180, wins: 115, losses: 42, winRate: 73.2, ethWon: '1.56', points: 11500, trend: 'down' },
  { rank: 5, address: '0x9d8c...7e6f', elo: 2090, wins: 98, losses: 45, winRate: 68.5, ethWon: '1.23', points: 9800, trend: 'up' },
  { rank: 6, address: '0x4b3a...1d2e', elo: 2010, wins: 89, losses: 51, winRate: 63.6, ethWon: '0.98', points: 8900, trend: 'same' },
  { rank: 7, address: '0x7c6d...5f4e', elo: 1950, wins: 76, losses: 48, winRate: 61.3, ethWon: '0.87', points: 7600, trend: 'down' },
  { rank: 8, address: '0x2e1d...8a9b', elo: 1890, wins: 68, losses: 52, winRate: 56.7, ethWon: '0.72', points: 6800, trend: 'up' },
];

export function useLeaderboard() {
  const publicClient = usePublicClient();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [seasonInfo, setSeasonInfo] = useState<SeasonInfo | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // In production, this would fetch from an indexer or backend API
      // For now, we use mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLeaderboard(MOCK_LEADERBOARD);
      
      // Mock season info
      setSeasonInfo({
        seasonId: 1,
        timeRemaining: '23d 14h 32m',
        totalPlayers: 1247,
        prizePool: '12.5',
      });

    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setLeaderboard(MOCK_LEADERBOARD);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserRank = useCallback(async (address: string) => {
    try {
      // In production, query the indexer for user's rank
      // For now, return a mock rank
      const mockRank = Math.floor(Math.random() * 100) + 1;
      setUserRank(mockRank);
    } catch (err) {
      console.error('Error fetching user rank:', err);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    seasonInfo,
    userRank,
    isLoading,
    fetchLeaderboard,
    fetchUserRank,
  };
}
