import { useState, useMemo, useEffect, useCallback } from 'react';
import { HexagonalBoard, BoardDimensions } from './HexagonalBoard';
import { PiecesLayer, Move } from './PiecesLayer';
import { Game, ChessPiece as GamePiece, Color } from '../../web/tri-hex-chess';
import { createHex, BoardOrientation } from '../utils/hexagonUtils';
import { Button, Group, Stack, Text } from '@mantine/core';

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
  const [selectedPieceId, setSelectedPieceId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('white');

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

  const handlePieceClick = (piece: GamePiece) => {
    const pieceId = `${piece.player}-${piece.piece}-${piece.coordinates.q}-${piece.coordinates.r}`;
    
    console.log('Piece clicked:', pieceId);

    const legalMoves = game?.queryMoves(piece.coordinates);
    console.log('Legal moves:', legalMoves);

    if (selectedPieceId === pieceId) {
      setSelectedPieceId(undefined);
    } else {
      setSelectedPieceId(pieceId);
    }
  };

  const handlePieceMove = (move: Move) => {
    console.log('Piece moved:', move);
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
          />
          
          <PiecesLayer
            pieces={pieces}
            size={boardSize}
            onPieceMove={handlePieceMove}
            onPieceClick={handlePieceClick}
            selectedPieceId={selectedPieceId}
            boardOrientation={boardOrientation}
          />
        </svg>
      </div>
    </Stack>
  );
} 