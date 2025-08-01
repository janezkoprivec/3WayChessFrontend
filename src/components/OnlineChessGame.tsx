import { useState, useMemo, useEffect } from 'react';
import { HexagonalBoard } from './HexagonalBoard';
import { PiecesLayer } from './PiecesLayer';
import { GameInteractionLayer } from './GameInteractionLayer';
import { Game, ChessPiece as GamePiece, Move } from '../../web/tri-hex-chess';
import { createHex, BoardOrientation } from '../utils/hexagonUtils';
import { encodePieceId } from '../utils/pieceIdUtils';
import { Group, Stack, Text } from '@mantine/core';
import { useCurrentTurn } from '../hooks/useCurrentTurn';
import { Socket } from 'socket.io-client';

interface OnlineChessGameProps {
  height: number;
  showCoordinates?: boolean;
  playerColor: string;
  gameSocket: Socket | null;
  currentTurn: string;
  isMyTurn: boolean;
  onMoveReceived?: (move: Move) => void;
}

export function OnlineChessGame({ 
  height, 
  showCoordinates = false,
  playerColor,
  gameSocket,
  currentTurn,
  isMyTurn,
  onMoveReceived
}: OnlineChessGameProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [pieces, setPieces] = useState<GamePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<GamePiece | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('white');
  const { currentTurn: gameCurrentTurn, updateTurn } = useCurrentTurn(game);

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

  useEffect(() => {
    if (!gameSocket) return;

    const handleMoveReceived = (moveData: any) => {
      if (!game) return;
      
      try {
        const pieces = game.getPieces();
        const fromPiece = pieces.find(piece => 
          piece.coordinates.q === moveData.from.q && 
          piece.coordinates.r === moveData.from.r
        );
        
        if (!fromPiece) {
          console.error('No piece found at from coordinates');
          return;
        }
        
        const legalMoves = game.queryMoves(fromPiece.coordinates);
        const matchingMove = legalMoves.find(move => 
          move.to.q === moveData.to.q && 
          move.to.r === moveData.to.r && 
          move.move_type === moveData.move_type &&
          move.color === moveData.color &&
          move.piece === moveData.piece
        );
        
        if (matchingMove) {
          game.commitMove(matchingMove, null, true);
          setPieces(game.getPieces());
          updateTurn();
          
          if (onMoveReceived) {
            onMoveReceived(matchingMove);
          }
        } else {
          console.error('Received move does not match any legal moves');
        }
      } catch (err) {
        console.error('Failed to process received move:', err);
      }
    };

    gameSocket.on('move', handleMoveReceived);

    return () => {
      gameSocket.off('move', handleMoveReceived);
    };
  }, [gameSocket, game, onMoveReceived, updateTurn]);

  useEffect(() => {
    setBoardOrientation(playerColor as BoardOrientation);
  }, [playerColor]);

  const handlePieceSelect = (piece: GamePiece | null) => {
    if (!isMyTurn) return;
    setSelectedPiece(piece);
  };

  const handleMoveSelect = (move: Move) => {
    if (!game || !selectedPiece || !isMyTurn || !gameSocket) return;
        
    game.commitMove(move, null, true);
    setPieces(game.getPieces());
    
    updateTurn();
    
    gameSocket.emit('move', {
      from: move.from,
      to: move.to,
      move_type: move.move_type,
      color: move.color,
      piece: move.piece
    });
    
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
        <Text size="sm" fw={500}>Current Turn: {currentTurn}</Text>
        <Text size="sm" c={isMyTurn ? 'green' : 'red'}>
          {isMyTurn ? 'Your turn' : 'Opponent\'s turn'}
        </Text>
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
              currentTurn={gameCurrentTurn}
              isMyTurn={isMyTurn}
            />
          </svg>
        </div>
      </div>
    </Stack>
  );
} 