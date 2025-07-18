import { useState, useEffect } from 'react';
import { Game, GameState, Color, Piece, Coordinates, Move, ChessPiece } from '../../web/tri-hex-chess';

export interface ChessGameState {
  isInitialized: boolean;
  game: Game | null;
  gameState: GameState | null;
  pieces: ChessPiece[];
  currentTurn: Color;
  isGameOver: boolean;
  winner: Color | undefined;
  isStalemate: boolean;
  moveCount: number;
}

export function useChessGame() {
  const [gameState, setGameState] = useState<ChessGameState>({
    isInitialized: false,
    game: null,
    gameState: null,
    pieces: [],
    currentTurn: Color.White,
    isGameOver: false,
    winner: undefined,
    isStalemate: false,
    moveCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const game = Game.newDefault();
      updateGameState(game);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize game');
      console.error('Game initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateGameState = (game: Game) => {
    const gameState = game.getGameState();
    const pieces = game.getPieces();
    
    setGameState({
      isInitialized: true,
      game,
      gameState,
      pieces,
      currentTurn: gameState.turn,
      isGameOver: gameState.won !== undefined,
      winner: gameState.won || undefined,
      isStalemate: gameState.is_stalemate,
      moveCount: gameState.move_count
    });
  };

  const createNewGame = (fen?: string) => {
    try {
      const game = fen ? Game.new(fen) : Game.newDefault();
      updateGameState(game);
      return game;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create new game');
      throw err;
    }
  };

  const getLegalMoves = (from: Coordinates): Move[] => {
    if (!gameState.game) return [];
    return gameState.game.queryMoves(from);
  };

  const getAllLegalMoves = (): Move[] => {
    if (!gameState.game) return [];
    return gameState.game.queryAllMoves();
  };

  const commitMove = (move: Move, promotion: Piece | null = null, advanceTurn: boolean = true) => {
    if (!gameState.game) {
      throw new Error('No game initialized');
    }
    gameState.game.commitMove(move, promotion, advanceTurn);
    updateGameState(gameState.game);
  };

  const getFen = (): string => {
    if (!gameState.game) return '';
    return gameState.game.getFen();
  };

  const setFen = (fen: string) => {
    if (!gameState.game) {
      throw new Error('No game initialized');
    }
    gameState.game.setFen(fen);
    updateGameState(gameState.game);
  };

  return {
    gameState,
    isLoading,
    error,
    initializeGame,
    createNewGame,
    getLegalMoves,
    getAllLegalMoves,
    commitMove,
    getFen,
    setFen
  };
} 