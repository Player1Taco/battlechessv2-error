import { create } from 'zustand';
import { ChessPiece, PlayerStats, Game } from '../hooks/useContracts';

interface GameState {
  // Selection state
  selectedPieces: ChessPiece[];
  selectedColor: 'white' | 'black' | null;
  
  // Minting state
  mintingStatus: 'idle' | 'minting' | 'success' | 'error';
  mintingError: string | null;
  
  // Game state
  currentGame: Game | null;
  gameStatus: 'idle' | 'creating' | 'joining' | 'playing' | 'completed';
  
  // UI state
  isWalletModalOpen: boolean;
  
  // Actions
  selectPiece: (piece: ChessPiece) => void;
  deselectPiece: (pieceId: string) => void;
  clearSelection: () => void;
  setSelectedColor: (color: 'white' | 'black' | null) => void;
  
  setMintingStatus: (status: 'idle' | 'minting' | 'success' | 'error', error?: string) => void;
  
  setCurrentGame: (game: Game | null) => void;
  setGameStatus: (status: 'idle' | 'creating' | 'joining' | 'playing' | 'completed') => void;
  
  setWalletModalOpen: (open: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  selectedPieces: [],
  selectedColor: null,
  mintingStatus: 'idle',
  mintingError: null,
  currentGame: null,
  gameStatus: 'idle',
  isWalletModalOpen: false,
  
  // Selection actions
  selectPiece: (piece) => set((state) => ({
    selectedPieces: [...state.selectedPieces, piece],
  })),
  
  deselectPiece: (pieceId) => set((state) => ({
    selectedPieces: state.selectedPieces.filter(p => p.id !== pieceId),
  })),
  
  clearSelection: () => set({
    selectedPieces: [],
    selectedColor: null,
  }),
  
  setSelectedColor: (color) => set({ selectedColor: color }),
  
  // Minting actions
  setMintingStatus: (status, error) => set({
    mintingStatus: status,
    mintingError: error || null,
  }),
  
  // Game actions
  setCurrentGame: (game) => set({ currentGame: game }),
  setGameStatus: (status) => set({ gameStatus: status }),
  
  // UI actions
  setWalletModalOpen: (open) => set({ isWalletModalOpen: open }),
}));

// Re-export types for convenience
export type { ChessPiece, PlayerStats, Game };
