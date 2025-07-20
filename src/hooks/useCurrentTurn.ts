import { useState, useEffect } from 'react';
import { Game, Color } from '../../web/tri-hex-chess';

export function useCurrentTurn(game: Game | null) {
  const [currentTurn, setCurrentTurn] = useState<Color>(Color.White);

  useEffect(() => {
    if (game) {
      const gameState = game.getGameState();
      setCurrentTurn(gameState.turn);
    }
  }, [game]);

  const updateTurn = () => {
    if (game) {
      const gameState = game.getGameState();
      setCurrentTurn(gameState.turn);
    }
  };

  return { currentTurn, updateTurn };
} 