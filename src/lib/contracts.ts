import { ethers } from 'ethers';

// Contract ABIs (simplified for key functions)
export const BATTLE_CHESS_NFT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function pieceTraits(uint256 tokenId) view returns (uint8 rarity, uint8 pieceType, uint8 collection, uint8 color, uint8 background)',
  'function hasCompleteSet(address player, bool isWhite) view returns (bool)',
  'function getPlayerPieces(address player) view returns (uint256[])',
  'function mintFullSet() payable',
  'function mintHalfSet(bool isWhite) payable',
  'function mintPiece(uint8 pieceType, bool isWhite) payable',
  'function FULL_SET_PRICE() view returns (uint256)',
  'function HALF_SET_PRICE() view returns (uint256)',
  'function INDIVIDUAL_PRICE() view returns (uint256)',
  'event PieceMinted(address indexed player, uint256 indexed tokenId, tuple(uint8 rarity, uint8 pieceType, uint8 collection, uint8 color, uint8 background) traits)',
  'event SetMinted(address indexed player, bool isFullSet, bool isWhite, uint256[] tokenIds)',
];

export const GAME_STAKING_ABI = [
  'function stakes(address) view returns (bool isStaked, bool isWhite, uint256 stakedAt, uint256 gameId)',
  'function games(uint256) view returns (address player1, address player2, bool player1IsWhite, bool player2IsWhite, uint256 prizePool, uint256 timePerPlayer, uint256 timeIncrement, uint256 startTime, uint256 maxDuration, uint8 status, address winner, uint256 claimedPieceId, bytes32 gameHash)',
  'function playerStats(address) view returns (uint256 elo, uint256 wins, uint256 losses, uint256 draws, uint256 totalEthWon, uint256 totalEthLost, uint256 matchesPlayed, uint256 points)',
  'function getPlayerStats(address player) view returns (uint256 elo, uint256 wins, uint256 losses, uint256 draws, uint256 totalEthWon, uint256 totalEthLost, uint256 matchesPlayed, uint256 points, bool isStaked, uint256 currentGameId)',
  'function getAvailableGames() view returns (uint256[])',
  'function getGameInfo(uint256 gameId) view returns (address player1, address player2, uint256 prizePool, uint256 timePerPlayer, uint256 startTime, uint8 status, address winner)',
  'function stakeAndCreateGame(uint256[] tokenIds, bool isWhite, uint256 timePerPlayer) payable',
  'function stakeAndJoinGame(uint256 gameId, uint256[] tokenIds, bool isWhite) payable',
  'function completeGame(uint256 gameId, bytes32 gameHash, uint256 claimedPieceId)',
  'function cancelGame(uint256 gameId)',
  'function ENTRY_FEE() view returns (uint256)',
  'function PLATFORM_FEE_PERCENT() view returns (uint256)',
  'function currentSeason() view returns (uint256)',
  'function seasonPoints(uint256, address) view returns (uint256)',
  'event GameCreated(uint256 indexed gameId, address indexed player1, uint256 entryFee, uint256 timePerPlayer)',
  'event GameJoined(uint256 indexed gameId, address indexed player2)',
  'event GameCompleted(uint256 indexed gameId, address indexed winner, uint256 prizeAmount, bytes32 gameHash)',
];

// Contract addresses from environment
export const CONTRACT_ADDRESSES = {
  BattleChessNFT: import.meta.env.VITE_BATTLE_CHESS_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
  GameStaking: import.meta.env.VITE_GAME_STAKING_ADDRESS || '0x0000000000000000000000000000000000000000',
};

// Pricing constants (fallback values, should be read from contract)
export const PRICING = {
  FULL_SET: '0.01',
  HALF_SET: '0.006',
  INDIVIDUAL: '0.001',
  ENTRY_FEE: '0.001',
};

// Trait mappings
export const TRAITS = {
  rarities: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Divine', 'Cosmic'],
  pieceTypes: ['King', 'Queen', 'Rook', 'Bishop', 'Knight', 'Pawn', 'Champion', 'Guardian'],
  collections: ['Realistic', 'Fantasy', 'Sci-Fi', 'Stylized', 'Cyberpunk', 'Medieval', 'Ethereal', 'Void'],
  colors: ['White', 'Black', 'Gold', 'Silver', 'Crimson', 'Azure', 'Emerald', 'Obsidian'],
  backgrounds: ['Classic', 'Nebula', 'Forest', 'Volcanic', 'Ocean', 'Crystal', 'Shadow', 'Aurora'],
};

// Helper to get contract instance
export function getContract(
  address: string,
  abi: string[],
  signerOrProvider: ethers.Signer | ethers.Provider
): ethers.Contract {
  return new ethers.Contract(address, abi, signerOrProvider);
}

// Helper to format piece traits from contract response
export function formatPieceTraits(traits: {
  rarity: number;
  pieceType: number;
  collection: number;
  color: number;
  background: number;
}) {
  return {
    rarity: TRAITS.rarities[traits.rarity] || 'Unknown',
    pieceType: TRAITS.pieceTypes[traits.pieceType] || 'Unknown',
    collection: TRAITS.collections[traits.collection] || 'Unknown',
    color: TRAITS.colors[traits.color] || 'Unknown',
    background: TRAITS.backgrounds[traits.background] || 'Unknown',
  };
}
