import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Flame,
  Star,
  Calendar,
  Users,
  Loader2
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useContracts } from '../hooks/useContracts';
import { useLeaderboard } from '../hooks/useLeaderboard';

export const Leaderboard: React.FC = () => {
  const { isConnected, address } = useWallet();
  const { playerStats } = useContracts();
  const { leaderboard, seasonInfo, userRank, isLoading, fetchUserRank } = useLeaderboard();
  
  const [activeTab, setActiveTab] = useState<'season' | 'allTime'>('season');

  // Fetch user rank when connected
  useEffect(() => {
    if (isConnected && address) {
      fetchUserRank(address);
    }
  }, [isConnected, address, fetchUserRank]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-gray-400 font-mono">#{rank}</span>;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <section id="leaderboard" className="py-24 relative">
      <div className="absolute inset-0 hex-pattern opacity-30" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Top Players</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">LEADERBOARD</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Compete for glory and climb the ranks. Top players earn exclusive rewards each season.
          </p>
        </motion.div>

        {/* Season Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-6 mb-8"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Current Season</p>
                  <p className="font-display text-xl font-bold">Season {seasonInfo?.seasonId || 1}</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Time Remaining</p>
                  <p className="font-display font-bold text-primary">{seasonInfo?.timeRemaining || '—'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Total Players</p>
                  <p className="font-display font-bold">{seasonInfo?.totalPlayers?.toLocaleString() || '—'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Prize Pool</p>
                  <p className="font-display font-bold text-green-400">{seasonInfo?.prizePool || '—'} ETH</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('season')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'season'
                ? 'bg-primary text-white'
                : 'glass hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Season Rankings
          </button>
          <button
            onClick={() => setActiveTab('allTime')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'allTime'
                ? 'bg-primary text-white'
                : 'glass hover:bg-white/5'
            }`}
          >
            <Star className="w-4 h-4" />
            All Time
          </button>
        </div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-surface-light border-b border-white/10 text-sm text-gray-400">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Player</div>
            <div className="col-span-1 text-center">ELO</div>
            <div className="col-span-2 text-center">W/L</div>
            <div className="col-span-1 text-center">Win %</div>
            <div className="col-span-2 text-center">ETH Won</div>
            <div className="col-span-1 text-center">Points</div>
            <div className="col-span-1 text-center">Trend</div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            /* Rows */
            leaderboard.map((entry, index) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 hover:bg-white/5 transition-colors ${
                  entry.rank <= 3 ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''
                }`}
              >
                <div className="col-span-1 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-mono text-sm">{entry.address}</p>
                      {entry.rank === 1 && (
                        <span className="text-xs text-yellow-400 flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Champion
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-1 text-center">
                  <span className="font-display font-bold text-primary">{entry.elo}</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-green-400">{entry.wins}</span>
                  <span className="text-gray-500"> / </span>
                  <span className="text-red-400">{entry.losses}</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className={entry.winRate >= 70 ? 'text-green-400' : entry.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                    {entry.winRate}%
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="font-display font-bold text-green-400">{entry.ethWon} ETH</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="font-display font-bold">{entry.points.toLocaleString()}</span>
                </div>
                <div className="col-span-1 flex justify-center">
                  {getTrendIcon(entry.trend)}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Your Stats */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 glass rounded-2xl p-6 border border-primary/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Your Ranking</p>
                  <p className="font-display text-xl font-bold">
                    #{userRank || '—'} of {seasonInfo?.totalPlayers?.toLocaleString() || '—'}
                  </p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Your ELO</p>
                  <p className="font-display font-bold text-primary">{playerStats?.elo || 1200}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Season Points</p>
                  <p className="font-display font-bold">{playerStats?.points?.toLocaleString() || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">ETH Won</p>
                  <p className="font-display font-bold text-green-400">{playerStats?.totalEthWon || '0'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
