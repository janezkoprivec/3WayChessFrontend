import { useState, useMemo, useEffect } from 'react';
import { HexagonalBoard } from './HexagonalBoard';
import { PiecesLayer } from './PiecesLayer';
import { GameInteractionLayer } from './GameInteractionLayer';
import { Game, ChessPiece as GamePiece, Move } from '../../web/tri-hex-chess';
import { createHex, BoardOrientation } from '../utils/hexagonUtils';
import { encodePieceId } from '../utils/pieceIdUtils';
import { Button, Group, Stack, Text } from '@mantine/core';
import { useCurrentTurn } from '../hooks/useCurrentTurn';

interface ChessGameProps {
  height: number;
  showCoordinates?: boolean;
}

export function ChessGame({ 
  height, 
  showCoordinates = false
}: ChessGameProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [pieces, setPieces] = useState<GamePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<GamePiece | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('white');
  const { currentTurn, updateTurn } = useCurrentTurn(game);

  const selectedPieceId = useMemo(() => {
    return selectedPiece ? encodePieceId(selectedPiece.player, selectedPiece.piece, selectedPiece.coordinates.q, selectedPiece.coordinates.r) : undefined;
  }, [selectedPiece]);

  const { boardSize, boardDimensions } = useMemo(() => {
    const hexDict: Record<string, any> = {};
    
    for (let q = -4; q < 8; q++) {
      for (let r = -4; r < 4 - q; r++) {
        const s = -1 - q - r;
        hexDict[`${q}${r}`] = createHex(q, r, s);
      }
    }
    
    for (let q = -7; q < 4; q++) {
      for (let r = -4 - q; r < 4; r++) {
        const s = -1 - q - r;
        hexDict[`${q}${r}`] = createHex(q, r, s);
      }
    }
    
    const totalHexagonHeight = height - 40;
    const hexagonHeight = totalHexagonHeight / 12;
    const size = hexagonHeight / Math.sqrt(3);
    
    let minX = hexDict['-73'].getCoordinates(size).x - size;
    let maxX = hexDict['7-4'].getCoordinates(size).x + size;
    let minY = hexDict['-47'].getCoordinates(size).y - size;
    let maxY = hexDict['-4-4'].getCoordinates(size).y + size;
    
    const boardWidth = maxX - minX + size * 2;
    const boardHeight = maxY - minY + size * 2;
    
    return {
      boardSize: size,
      boardDimensions: {
        width: boardWidth,
        height: boardHeight,
        minX: minX - size,
        maxX: maxX + size,
        minY: minY - size,
        maxY: maxY + size
      }
    };
  }, [height]);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const newGame = Game.newDefault();
        setGame(newGame);
        
        const initialPieces = newGame.getPieces();
        setPieces(initialPieces);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize game:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize game');
        setIsLoading(false);
      }
    };

    initializeGame();
  }, []);

  const handlePieceSelect = (piece: GamePiece | null) => {
    setSelectedPiece(piece);
  };

  const handleMoveSelect = (move: Move) => {
    if (!game || !selectedPiece) return;
        
    game.commitMove(move, null, true);
    setPieces(game.getPieces());
    
    updateTurn();
    
    setSelectedPiece(null);
  };


  const handleOrientationChange = (orientation: BoardOrientation) => {
    setBoardOrientation(orientation);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        height: `${height}px`,
        border: '1px solid #ccc'
      }}>
        Loading chess game...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        height: `${height}px`,
        border: '1px solid #ccc',
        color: 'red'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <Stack gap="md" align="center">
      <Group>
        <Text size="sm" fw={500}>Board Orientation:</Text>
        <Button 
          size="xs" 
          variant={boardOrientation === 'white' ? 'filled' : 'outline'}
          onClick={() => handleOrientationChange('white')}
        >
          White
        </Button>
        <Button 
          size="xs" 
          variant={boardOrientation === 'black' ? 'filled' : 'outline'}
          onClick={() => handleOrientationChange('black')}
        >
          Black
        </Button>
        <Button 
          size="xs" 
          variant={boardOrientation === 'grey' ? 'filled' : 'outline'}
          onClick={() => handleOrientationChange('grey')}
        >
          Grey
        </Button>
      </Group>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        <div style={{ position: 'relative' }}>
          <svg
            width={boardDimensions.width}
            height={height}
            viewBox={`${boardDimensions.minX} ${boardDimensions.minY} ${boardDimensions.width} ${boardDimensions.height}`}
            style={{ 
              border: '1px solid #ccc',
              maxWidth: '100%',
              height: 'auto'
            }}
          >
            <HexagonalBoard 
              height={height}
              showCoordinates={showCoordinates}
              boardOrientation={boardOrientation}
              selectedPieceId={selectedPieceId}
            />
            
            <PiecesLayer
              pieces={pieces}
              size={boardSize}
              boardOrientation={boardOrientation}
            />
            
            <GameInteractionLayer
              game={game}
              pieces={pieces}
              size={boardSize}
              onPieceSelect={handlePieceSelect}
              onMoveSelect={handleMoveSelect}
              boardOrientation={boardOrientation}
              currentTurn={currentTurn}
            />
          </svg>
        </div>
      </div>
    </Stack>
  );
} 