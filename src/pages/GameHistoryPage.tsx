import { useState, useEffect } from 'react';
import { Container, Paper, Stack, Text, Title, Group, Badge, Card, Button, Avatar, ScrollArea } from '@mantine/core';
import { useParams, Link } from 'react-router-dom';
import { ApiService } from '../services/api';
import { ChessGame } from '../components/ChessGame';
import { ApiMove } from '../utils/moveUtils';
import { BoardOrientation } from '../utils/hexagonUtils';

interface GameMovesResponse {
  gameId: string;
  name: string;
  totalMoves: number;
  moves: ApiMove[];
  players: {
    color: string;
    user: {
      _id: string;
      username: string;
      profilePictureUrl?: string;
    }
  }[]
}

export function GameHistoryPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [gameData, setGameData] = useState<GameMovesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('white');

  useEffect(() => {
    const fetchGameMoves = async () => {
      if (!gameId) return;

      setLoading(true);
      try {
        const response = await ApiService.get<GameMovesResponse>(`/history/games/${gameId}/moves`);
        console.log('Game moves response:', response);
        setGameData(response.data);
      } catch (error) {
        console.error('Failed to fetch game moves:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameMoves();
  }, [gameId]);

  const handleMoveIndexChange = (index: number) => {
    setCurrentMoveIndex(index);
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <Text>Loading game moves...</Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (!gameData) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <Text>Game not found or failed to load.</Text>
            <Link to="/profile">Back to Profile</Link>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const letters = 'ABCDEFGHIJKLMNO'; 
  const getMoveCoordinates = (q: number, r: number) => {
    return `${letters[q+7]}${r+8}`; 
  }

  const getMoveDescription = (move: ApiMove) => {
    const pieceNames = ['', 'Pawn', 'Knight', 'Bishop', 'Rook', 'Queen', 'King'];
    const colorNames = ['White', 'Gray', 'Black'];
    const moveTypeNames = ['Move', 'DoublePawnPush', 'Capture', 'EnPassant', 'EnPassantPromotion', 'Promotion', 'CapturePromotion', 'CastleKingSide', 'CastleQueenSide'];
    
    const pieceName = pieceNames[move.piece] || 'Unknown';
    const colorName = colorNames[move.color] || 'Unknown';
    const moveTypeName = moveTypeNames[move.move_type] || 'Unknown';
    
    return `${colorName} ${pieceName} ${moveTypeName}`;
  };

  return (
    <Container size="xl" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="xl">
          <Group justify="space-between" align="flex-start">
            <Title order={2}>{gameData.name}</Title>
            <Group>
              <Text size="sm" fw={500}>Board Orientation:</Text>
              <Button 
                size="xs" 
                variant={boardOrientation === 'white' ? 'filled' : 'outline'}
                onClick={() => setBoardOrientation('white')}
              >
                White
              </Button>
              <Button 
                size="xs" 
                variant={boardOrientation === 'black' ? 'filled' : 'outline'}
                onClick={() => setBoardOrientation('black')}
              >
                Black
              </Button>
              <Button 
                size="xs" 
                variant={boardOrientation === 'grey' ? 'filled' : 'outline'}
                onClick={() => setBoardOrientation('grey')}
              >
                Grey
              </Button>
            </Group>
          </Group>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                height: '700px'
              }}>
                <div style={{ position: 'relative', width: '600px' }}>
                  <ChessGame
                    height={600}
                    showCoordinates={false}
                    moves={gameData.moves}
                    isReplayMode={true}
                    onMoveIndexChange={handleMoveIndexChange}
                    currentMoveIndex={currentMoveIndex}
                    players={gameData.players}
                    boardOrientation={boardOrientation}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ width: '300px' }}>
              <Stack gap="md">
                <Title order={3}>Moves ({gameData.moves.length})</Title>
                <ScrollArea h={600}>
                  <Stack gap="sm">
                    {gameData.moves.map((move, index) => (
                      <Card 
                        key={move._id} 
                        shadow="sm" 
                        padding="md" 
                        radius="md" 
                        withBorder
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: index === currentMoveIndex ? 'var(--mantine-color-blue-0)' : undefined
                        }}
                        onClick={() => handleMoveIndexChange(index)}
                      >
                        <Group justify="space-between">
                          <Group gap="md">
                            <Text fw={500} size="sm">#{move.moveNumber}</Text>
                            <Text size="sm">{getMoveDescription(move)}</Text>
                          </Group>
                          <Text size="xs" c="dimmed">
                            {new Date(move.timestamp).toLocaleTimeString()}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed" mt="xs">
                          {getMoveCoordinates(move.from.q, move.from.r)} → {getMoveCoordinates(move.to.q, move.to.r)}
                        </Text>
                      </Card>
                    ))}
                  </Stack>
                </ScrollArea>
              </Stack>
            </div>
          </div>

          <Group justify="center">
            <Link to="/profile">Back to Profile</Link>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
} 