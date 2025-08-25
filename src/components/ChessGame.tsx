import { useState, useMemo, useEffect } from 'react';
import { HexagonalBoard } from './HexagonalBoard';
import { PiecesLayer } from './PiecesLayer';
import { GameInteractionLayer } from './GameInteractionLayer';
import { Game, ChessPiece as GamePiece, Move } from '../../web/tri-hex-chess';
import { createHex, BoardOrientation } from '../utils/hexagonUtils';
import { encodePieceId } from '../utils/pieceIdUtils';
import { Button, Group, Stack, Text, Avatar, Paper } from '@mantine/core';
import { useCurrentTurn } from '../hooks/useCurrentTurn';
import { createMoveFromApiData, ApiMove } from '../utils/moveUtils';

interface Player {
  color: string;
  user: {
    _id: string;
    username: string;
    profilePictureUrl?: string;
  }
}

interface ChessGameProps {
  height: number;
  showCoordinates?: boolean;
  moves?: ApiMove[];
  isReplayMode?: boolean;
  onMoveIndexChange?: (index: number) => void;
  currentMoveIndex?: number;
  players?: Player[];
  boardOrientation?: BoardOrientation;
}

export function ChessGame({ 
  height, 
  showCoordinates = false,
  moves = [],
  isReplayMode = false,
  onMoveIndexChange,
  currentMoveIndex = 0,
  players = [],
  boardOrientation: externalBoardOrientation
}: ChessGameProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [pieces, setPieces] = useState<GamePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<GamePiece | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('white');
  const { currentTurn, updateTurn } = useCurrentTurn(game);

  // Use external board orientation if provided, otherwise use internal state
  const currentBoardOrientation = externalBoardOrientation || boardOrientation;

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
    if (!game || !isReplayMode) return;

    const replayMoves = async () => {
      try {
        console.log('Starting move replay, current index:', currentMoveIndex, 'total moves:', moves.length);
        
        const newGame = Game.newDefault();
        setGame(newGame);
        
        for (let i = 0; i <= currentMoveIndex && i < moves.length; i++) {
          const moveData = moves[i];
          console.log(`Replaying move ${i + 1}/${moves.length}:`, moveData);
          
          const move = createMoveFromApiData(moveData, newGame);
          if (move) {
            console.log(`Successfully applying move ${i + 1}`);
            newGame.commitMove(move, null, true);
          } else {
            console.error(`Failed to create move for move ${i + 1}`);
          }
        }
        
        const finalPieces = newGame.getPieces();
        console.log('Final pieces after replay:', finalPieces.length);
        setPieces(finalPieces);
      } catch (err) {
        console.error('Failed to replay moves:', err);
        setError(err instanceof Error ? err.message : 'Failed to replay moves');
      }
    };

    replayMoves();
  }, [game, moves, currentMoveIndex, isReplayMode]);

  const handlePieceSelect = (piece: GamePiece | null) => {
    if (isReplayMode) return;
    setSelectedPiece(piece);
  };

  const handleMoveSelect = (move: Move) => {
    if (!game || !selectedPiece || isReplayMode) return;
        
    game.commitMove(move, null, true);
    setPieces(game.getPieces());
    
    updateTurn();
    
    setSelectedPiece(null);
  };

  const handleFirstMove = () => {
    if (onMoveIndexChange) {
      onMoveIndexChange(0);
    }
  };

  const handlePreviousMove = () => {
    if (onMoveIndexChange && currentMoveIndex > 0) {
      onMoveIndexChange(currentMoveIndex - 1);
    }
  };

  const handleNextMove = () => {
    if (onMoveIndexChange && currentMoveIndex < moves.length - 1) {
      onMoveIndexChange(currentMoveIndex + 1);
    }
  };

  const handleLastMove = () => {
    if (onMoveIndexChange) {
      onMoveIndexChange(moves.length - 1);
    }
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

  const blackPlayer = players.find(p => p.color === 'black');
  const greyPlayer = players.find(p => p.color === 'grey');
  const whitePlayer = players.find(p => p.color === 'white');

  // Get player positions based on board orientation
  const getPlayerPositions = () => {
    switch (currentBoardOrientation) {
      case 'white':
        return {
          topLeft: blackPlayer,
          topRight: greyPlayer,
          bottom: whitePlayer
        };
      case 'black':
        return {
          topLeft: greyPlayer,
          topRight: whitePlayer,
          bottom: blackPlayer
        };
      case 'grey':
        return {
          topLeft: whitePlayer,
          topRight: blackPlayer,
          bottom: greyPlayer
        };
      default:
        return {
          topLeft: blackPlayer,
          topRight: greyPlayer,
          bottom: whitePlayer
        };
    }
  };

  const playerPositions = getPlayerPositions();

  return (
    <Stack gap="md" align="center">
      {isReplayMode && moves.length > 0 && (
        <Group>
          <Button 
            size="xs" 
            variant="outline"
            onClick={handleFirstMove}
            disabled={currentMoveIndex === 0}
          >
            ⏮️ First
          </Button>
          <Button 
            size="xs" 
            variant="outline"
            onClick={handlePreviousMove}
            disabled={currentMoveIndex === 0}
          >
            ⏪ Previous
          </Button>
          <Text size="sm" fw={500}>
            Move {currentMoveIndex + 1} of {moves.length}
          </Text>
          <Button 
            size="xs" 
            variant="outline"
            onClick={handleNextMove}
            disabled={currentMoveIndex === moves.length - 1}
          >
            ⏩ Next
          </Button>
          <Button 
            size="xs" 
            variant="outline"
            onClick={handleLastMove}
            disabled={currentMoveIndex === moves.length - 1}
          >
            ⏭️ Last
          </Button>
        </Group>
      )}

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
                {playerPositions.topLeft && (
                  <Group gap="xs">
                    <Avatar 
                      src={playerPositions.topLeft.user.profilePictureUrl} 
                      size="sm"
                      radius="xl"
                    />
                    <Stack gap={0}>
                      <Text size="xs" fw={500}>{playerPositions.topLeft.user.username}</Text>
                    </Stack>
                  </Group>
                )}
              </Paper>
            </Stack>

            <Stack gap="xs">
              <Paper p="xs" withBorder>
                {playerPositions.topRight && (
                  <Group gap="xs">
                    <Avatar 
                      src={playerPositions.topRight.user.profilePictureUrl} 
                      size="sm"
                      radius="xl"
                    />
                    <Stack gap={0}>
                      <Text size="xs" fw={500}>{playerPositions.topRight.user.username}</Text>
                    </Stack>
                  </Group>
                )}
              </Paper>
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
              showBoardLabels={true}
              boardOrientation={currentBoardOrientation}
              selectedPieceId={selectedPieceId}
            />
            
            <PiecesLayer
              pieces={pieces}
              size={boardSize}
              boardOrientation={currentBoardOrientation}
            />
            
            {!isReplayMode && (
              <GameInteractionLayer
                game={game}
                pieces={pieces}
                size={boardSize}
                onPieceSelect={handlePieceSelect}
                onMoveSelect={handleMoveSelect}
                boardOrientation={currentBoardOrientation}
                currentTurn={currentTurn}
                isMyTurn={true}
              />
            )}
          </svg>

          {playerPositions.bottom && (
            <Stack gap="xs" style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
              <Paper p="xs" withBorder>
                <Group gap="xs">
                  <Avatar 
                    src={playerPositions.bottom.user.profilePictureUrl} 
                    size="sm"
                    radius="xl"
                  />
                  <Stack gap={0}>
                    <Text size="xs" fw={500}>{playerPositions.bottom.user.username}</Text>
                  </Stack>
                </Group>
              </Paper>
            </Stack>
          )}
        </div>
      </div>
    </Stack>
  );
} 