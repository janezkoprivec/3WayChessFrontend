import { useState, useMemo, useEffect } from 'react';
import { HexagonalBoard } from './HexagonalBoard';
import { PiecesLayer } from './PiecesLayer';
import { GameInteractionLayer } from './GameInteractionLayer';
import { Game, ChessPiece as GamePiece, Move } from '../../web/tri-hex-chess';
import { createHex, BoardOrientation } from '../utils/hexagonUtils';
import { encodePieceId } from '../utils/pieceIdUtils';
import { Group, Stack, Text, Avatar, Paper } from '@mantine/core';
import { useCurrentTurn } from '../hooks/useCurrentTurn';
import { Socket } from 'socket.io-client';
import { IGameLean } from '../types/game';

interface OnlineChessGameProps {
  height: number;
  showCoordinates?: boolean;
  playerColor: string;
  gameSocket: Socket | null;
  currentTurn: string;
  isMyTurn: boolean;
  onMoveReceived?: (move: Move) => void;
  game: IGameLean | null;
  playerTimes: Record<string, number>;
}

const useCountdownTimer = (initialTime: number, isActive: boolean) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds <= 0) return "0:00";
    
    let adjustedSeconds = totalSeconds;
    if (totalSeconds > 3600) {  
      adjustedSeconds = Math.min(totalSeconds, 3600); 
    }
    
    const minutes = Math.floor(adjustedSeconds / 60);
    const seconds = adjustedSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return { timeLeft, formatTime };
};

export function OnlineChessGame({ 
  height, 
  showCoordinates = false,
  playerColor,
  gameSocket,
  currentTurn,
  isMyTurn,
  onMoveReceived,
  game,
  playerTimes
}: OnlineChessGameProps) {
  const [gameState, setGameState] = useState<Game | null>(null);
  const [pieces, setPieces] = useState<GamePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<GamePiece | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('white');
  const { currentTurn: gameCurrentTurn, updateTurn } = useCurrentTurn(gameState);

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

  const playerInfo = useMemo(() => {
    if (!game) return { topLeft: null, topRight: null, bottom: null };
    
    const players = game.players;
    const currentPlayer = players.find(p => p.color === playerColor);
    const otherPlayers = players.filter(p => p.color !== playerColor);
    
    return {
      topLeft: otherPlayers[1] || null,
      topRight: otherPlayers[0] || null,
      bottom: currentPlayer || null
    };
  }, [game, playerColor]);

  const { timeLeft: currentPlayerTime, formatTime } = useCountdownTimer(
    playerTimes[playerColor] || 0,
    currentTurn === playerColor
  );

  const { timeLeft: topLeftPlayerTime } = useCountdownTimer(
    playerTimes[playerInfo.topLeft?.color || ''] || 0,
    currentTurn === playerInfo.topLeft?.color
  );

  const { timeLeft: topRightPlayerTime } = useCountdownTimer(
    playerTimes[playerInfo.topRight?.color || ''] || 0,
    currentTurn === playerInfo.topRight?.color
  );



  useEffect(() => {
    const initializeGame = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const newGame = Game.newDefault();
        setGameState(newGame);
        
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
      if (!gameState) return;
      
      try {
        const pieces = gameState.getPieces();
        const fromPiece = pieces.find(piece => 
          piece.coordinates.q === moveData.from.q && 
          piece.coordinates.r === moveData.from.r
        );
        
        if (!fromPiece) {
          console.error('No piece found at from coordinates');
          return;
        }
        
        const legalMoves = gameState.queryMoves(fromPiece.coordinates);
        const matchingMove = legalMoves.find(move => 
          move.to.q === moveData.to.q && 
          move.to.r === moveData.to.r && 
          move.move_type === moveData.move_type &&
          move.color === moveData.color &&
          move.piece === moveData.piece
        );
        
        if (matchingMove) {
          gameState.commitMove(matchingMove, null, true);
          setPieces(gameState.getPieces());
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
  }, [gameSocket, gameState, onMoveReceived, updateTurn]);

  useEffect(() => {
    setBoardOrientation(playerColor as BoardOrientation);
  }, [playerColor]);

  const handlePieceSelect = (piece: GamePiece | null) => {
    if (!isMyTurn) return;
    setSelectedPiece(piece);
  };

  const handleMoveSelect = (move: Move) => {
    if (!gameState || !selectedPiece || !isMyTurn || !gameSocket) return;
        
    gameState.commitMove(move, null, true);
    setPieces(gameState.getPieces());
    
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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      height: `${height}px`
    }}>
      <div style={{ position: 'relative', width: boardDimensions.width }}>
        <Group justify="space-between" style={{ position: 'absolute', top: 10, left: 0, right: 0, zIndex: 10 }}>
          <Stack gap="xs">
            <Paper p="xs" withBorder>
              {playerInfo.topLeft && (
                <Group gap="xs">
                  <Avatar 
                    src={playerInfo.topLeft.user.profilePictureUrl} 
                    size="sm"
                    radius="xl"
                  />
                  <Stack gap={0}>
                    <Text size="xs" fw={500}>{playerInfo.topLeft.user.username}</Text>
                  </Stack>
                </Group>
              )}
            </Paper>
            {playerInfo.topLeft && (
              <Paper p="xs" withBorder>
                <Text size="xs" c={currentTurn === playerInfo.topLeft.color ? 'red' : 'dimmed'} fw={500} ta="center">
                  {formatTime(topLeftPlayerTime)}
                </Text>
              </Paper>
            )}
          </Stack>

          <Stack gap="xs">
            <Paper p="xs" withBorder>
              {playerInfo.topRight && (
                <Group gap="xs">
                  <Avatar 
                    src={playerInfo.topRight.user.profilePictureUrl} 
                    size="sm"
                    radius="xl"
                  />
                  <Stack gap={0}>
                    <Text size="xs" fw={500}>{playerInfo.topRight.user.username}</Text>
                  </Stack>
                </Group>
              )}
            </Paper>
            {playerInfo.topRight && (
              <Paper p="xs" withBorder>
                <Text size="xs" c={currentTurn === playerInfo.topRight.color ? 'red' : 'dimmed'} fw={500} ta="center">
                  {formatTime(topRightPlayerTime)}
                </Text>
              </Paper>
            )}
          </Stack>
        </Group>

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
            game={gameState}
            pieces={pieces}
            size={boardSize}
            onPieceSelect={handlePieceSelect}
            onMoveSelect={handleMoveSelect}
            boardOrientation={boardOrientation}
            currentTurn={gameCurrentTurn}
            isMyTurn={isMyTurn}
          />
        </svg>

        {playerInfo.bottom && (
          <Stack gap="xs" style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
            <Paper p="xs" withBorder>
              <Group gap="xs">
                <Avatar 
                  src={playerInfo.bottom.user.profilePictureUrl} 
                  size="sm"
                  radius="xl"
                />
                <Stack gap={0}>
                  <Text size="xs" fw={500}>{playerInfo.bottom.user.username}</Text>
                </Stack>
              </Group>
            </Paper>
            <Paper p="xs" withBorder>
              <Text size="xs" c={currentTurn === playerInfo.bottom.color ? 'red' : 'dimmed'} fw={500} ta="center">
                {formatTime(currentPlayerTime)}
              </Text>
            </Paper>
          </Stack>
        )}
      </div>
    </div>
  );
} 