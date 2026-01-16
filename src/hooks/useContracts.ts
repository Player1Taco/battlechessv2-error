import { useCallback, useEffect, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { 
  CONTRACT_ADDRESSES, 
  BATTLE_CHESS_NFT_ABI, 
  GAME_STAKING_ABI,
  TRAITS,
  formatPieceTraits 
} from '../lib/contracts';

export interface ChessPiece {
  id: string;
  tokenId: number;
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
  traits: {
    rarity: string;
    pieceType: string;
    collection: string;
    color: string;
    background: string;
  };
  image: string;
  staked: boolean;
}

export interface PlayerStats {
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  totalEthWon: string;
  totalEthLost: string;
  matchesPlayed: number;
  points: number;
  isStaked: boolean;
  currentGameId: number;
}

export interface Game {
  id: number;
  player1: string;
  player2: string | null;
  prizePool: string;
  timePerPlayer: number;
  status: 'created' | 'active' | 'completed' | 'cancelled';
  winner: string | null;
}

const PIECE_TYPE_MAP: Record<number, 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'> = {
  0: 'king',
  1: 'queen',
  2: 'rook',
  3: 'bishop',
  4: 'knight',
  5: 'pawn',
};

export function useContracts() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [ownedPieces, setOwnedPieces] = useState<ChessPiece[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [hasWhiteSet, setHasWhiteSet] = useState(false);
  const [hasBlackSet, setHasBlackSet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get ethers provider and signer from wagmi clients
  const getProvider = useCallback(() => {
    if (!publicClient) return null;
    return new ethers.BrowserProvider(publicClient.transport);
  }, [publicClient]);

  const getSigner = useCallback(async () => {
    if (!walletClient) return null;
    const provider = new ethers.BrowserProvider(walletClient.transport);
    return provider.getSigner();
  }, [walletClient]);

  // Fetch player's NFT pieces
  const fetchOwnedPieces = useCallback(async () => {
    if (!address || !publicClient) return;

    setIsLoading(true);
    setError(null);

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not available');

      const nftContract = new ethers.Contract(
        CONTRACT_ADDRESSES.BattleChessNFT,
        BATTLE_CHESS_NFT_ABI,
        provider
      );

      // Check if contract is deployed
      const code = await provider.getCode(CONTRACT_ADDRESSES.BattleChessNFT);
      if (code === '0x') {
        console.log('NFT contract not deployed, using mock data');
        // Return mock data for demo
        setOwnedPieces(generateMockPieces());
        setHasWhiteSet(true);
        setHasBlackSet(true);
        return;
      }

      // Get player's token IDs
      const tokenIds: bigint[] = await nftContract.getPlayerPieces(address);
      
      // Fetch traits for each token
      const pieces: ChessPiece[] = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const traits = await nftContract.pieceTraits(tokenId);
          const formattedTraits = formatPieceTraits({
            rarity: Number(traits.rarity),
            pieceType: Number(traits.pieceType),
            collection: Number(traits.collection),
            color: Number(traits.color),
            background: Number(traits.background),
          });

          const pieceType = PIECE_TYPE_MAP[Number(traits.pieceType)] || 'pawn';
          const color = Number(traits.color) === 0 ? 'white' : 'black';

          return {
            id: `${color}-${pieceType}-${tokenId.toString()}`,
            tokenId: Number(tokenId),
            type: pieceType,
            color,
            traits: formattedTraits,
            image: `https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=200`,
            staked: false,
          };
        })
      );

      setOwnedPieces(pieces);

      // Check for complete sets
      const whiteSet = await nftContract.hasCompleteSet(address, true);
      const blackSet = await nftContract.hasCompleteSet(address, false);
      setHasWhiteSet(whiteSet);
      setHasBlackSet(blackSet);

    } catch (err) {
      console.error('Error fetching pieces:', err);
      setError(err as Error);
      // Fallback to mock data
      setOwnedPieces(generateMockPieces());
      setHasWhiteSet(true);
      setHasBlackSet(true);
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient, getProvider]);

  // Fetch player stats
  const fetchPlayerStats = useCallback(async () => {
    if (!address || !publicClient) return;

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not available');

      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.GameStaking,
        GAME_STAKING_ABI,
        provider
      );

      // Check if contract is deployed
      const code = await provider.getCode(CONTRACT_ADDRESSES.GameStaking);
      if (code === '0x') {
        console.log('Staking contract not deployed, using mock data');
        setPlayerStats({
          elo: 1200,
          wins: 0,
          losses: 0,
          draws: 0,
          totalEthWon: '0',
          totalEthLost: '0',
          matchesPlayed: 0,
          points: 0,
          isStaked: false,
          currentGameId: 0,
        });
        return;
      }

      const stats = await stakingContract.getPlayerStats(address);
      
      setPlayerStats({
        elo: Number(stats.elo) || 1200,
        wins: Number(stats.wins),
        losses: Number(stats.losses),
        draws: Number(stats.draws),
        totalEthWon: ethers.formatEther(stats.totalEthWon),
        totalEthLost: ethers.formatEther(stats.totalEthLost),
        matchesPlayed: Number(stats.matchesPlayed),
        points: Number(stats.points),
        isStaked: stats.isStaked,
        currentGameId: Number(stats.currentGameId),
      });

    } catch (err) {
      console.error('Error fetching player stats:', err);
      // Fallback to default stats
      setPlayerStats({
        elo: 1200,
        wins: 0,
        losses: 0,
        draws: 0,
        totalEthWon: '0',
        totalEthLost: '0',
        matchesPlayed: 0,
        points: 0,
        isStaked: false,
        currentGameId: 0,
      });
    }
  }, [address, publicClient, getProvider]);

  // Fetch available games
  const fetchAvailableGames = useCallback(async () => {
    if (!publicClient) return;

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not available');

      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.GameStaking,
        GAME_STAKING_ABI,
        provider
      );

      // Check if contract is deployed
      const code = await provider.getCode(CONTRACT_ADDRESSES.GameStaking);
      if (code === '0x') {
        setAvailableGames([]);
        return;
      }

      const gameIds: bigint[] = await stakingContract.getAvailableGames();
      
      const games: Game[] = await Promise.all(
        gameIds.map(async (gameId) => {
          const info = await stakingContract.getGameInfo(gameId);
          return {
            id: Number(gameId),
            player1: info.player1,
            player2: info.player2 === ethers.ZeroAddress ? null : info.player2,
            prizePool: ethers.formatEther(info.prizePool),
            timePerPlayer: Number(info.timePerPlayer),
            status: ['created', 'active', 'completed', 'cancelled', 'disputed'][Number(info.status)] as Game['status'],
            winner: info.winner === ethers.ZeroAddress ? null : info.winner,
          };
        })
      );

      setAvailableGames(games);

    } catch (err) {
      console.error('Error fetching games:', err);
      setAvailableGames([]);
    }
  }, [publicClient, getProvider]);

  // Mint functions
  const mintFullSet = useCallback(async () => {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');

    const nftContract = new ethers.Contract(
      CONTRACT_ADDRESSES.BattleChessNFT,
      BATTLE_CHESS_NFT_ABI,
      signer
    );

    const tx = await nftContract.mintFullSet({
      value: ethers.parseEther('0.01'),
    });

    await tx.wait();
    await fetchOwnedPieces();
  }, [getSigner, fetchOwnedPieces]);

  const mintHalfSet = useCallback(async (isWhite: boolean) => {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');

    const nftContract = new ethers.Contract(
      CONTRACT_ADDRESSES.BattleChessNFT,
      BATTLE_CHESS_NFT_ABI,
      signer
    );

    const tx = await nftContract.mintHalfSet(isWhite, {
      value: ethers.parseEther('0.006'),
    });

    await tx.wait();
    await fetchOwnedPieces();
  }, [getSigner, fetchOwnedPieces]);

  const mintPiece = useCallback(async (pieceType: number, isWhite: boolean) => {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');

    const nftContract = new ethers.Contract(
      CONTRACT_ADDRESSES.BattleChessNFT,
      BATTLE_CHESS_NFT_ABI,
      signer
    );

    const tx = await nftContract.mintPiece(pieceType, isWhite, {
      value: ethers.parseEther('0.001'),
    });

    await tx.wait();
    await fetchOwnedPieces();
  }, [getSigner, fetchOwnedPieces]);

  // Game functions
  const createGame = useCallback(async (tokenIds: number[], isWhite: boolean, timePerPlayer: number) => {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');

    const stakingContract = new ethers.Contract(
      CONTRACT_ADDRESSES.GameStaking,
      GAME_STAKING_ABI,
      signer
    );

    const tx = await stakingContract.stakeAndCreateGame(tokenIds, isWhite, timePerPlayer, {
      value: ethers.parseEther('0.001'),
    });

    await tx.wait();
    await fetchPlayerStats();
    await fetchAvailableGames();
  }, [getSigner, fetchPlayerStats, fetchAvailableGames]);

  const joinGame = useCallback(async (gameId: number, tokenIds: number[], isWhite: boolean) => {
    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected');

    const stakingContract = new ethers.Contract(
      CONTRACT_ADDRESSES.GameStaking,
      GAME_STAKING_ABI,
      signer
    );

    // Get game info to match entry fee
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');
    
    const readContract = new ethers.Contract(
      CONTRACT_ADDRESSES.GameStaking,
      GAME_STAKING_ABI,
      provider
    );
    const gameInfo = await readContract.getGameInfo(gameId);

    const tx = await stakingContract.stakeAndJoinGame(gameId, tokenIds, isWhite, {
      value: gameInfo.prizePool,
    });

    await tx.wait();
    await fetchPlayerStats();
    await fetchAvailableGames();
  }, [getSigner, getProvider, fetchPlayerStats, fetchAvailableGames]);

  // Fetch data when connected
  useEffect(() => {
    if (isConnected && address) {
      fetchOwnedPieces();
      fetchPlayerStats();
      fetchAvailableGames();
    } else {
      setOwnedPieces([]);
      setPlayerStats(null);
      setAvailableGames([]);
      setHasWhiteSet(false);
      setHasBlackSet(false);
    }
  }, [isConnected, address, fetchOwnedPieces, fetchPlayerStats, fetchAvailableGames]);

  return {
    // Data
    ownedPieces,
    playerStats,
    availableGames,
    hasWhiteSet,
    hasBlackSet,
    isLoading,
    error,

    // Actions
    fetchOwnedPieces,
    fetchPlayerStats,
    fetchAvailableGames,
    mintFullSet,
    mintHalfSet,
    mintPiece,
    createGame,
    joinGame,
  };
}

// Generate mock pieces for demo when contracts aren't deployed
function generateMockPieces(): ChessPiece[] {
  const pieces: ChessPiece[] = [];
  const colors: ('white' | 'black')[] = ['white', 'black'];
  
  colors.forEach((color, colorIndex) => {
    const pieceConfigs = [
      { type: 'king' as const, count: 1 },
      { type: 'queen' as const, count: 1 },
      { type: 'rook' as const, count: 2 },
      { type: 'bishop' as const, count: 2 },
      { type: 'knight' as const, count: 2 },
      { type: 'pawn' as const, count: 8 },
    ];

    let tokenId = colorIndex * 16 + 1;

    pieceConfigs.forEach(config => {
      for (let i = 0; i < config.count; i++) {
        pieces.push({
          id: `${color}-${config.type}-${tokenId}`,
          tokenId: tokenId++,
          type: config.type,
          color,
          traits: {
            rarity: TRAITS.rarities[Math.floor(Math.random() * 8)],
            pieceType: config.type.charAt(0).toUpperCase() + config.type.slice(1),
            collection: TRAITS.collections[Math.floor(Math.random() * 8)],
            color: color.charAt(0).toUpperCase() + color.slice(1),
            background: TRAITS.backgrounds[Math.floor(Math.random() * 8)],
          },
          image: `https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=200`,
          staked: false,
        });
      }
    });
  });

  return pieces;
}
