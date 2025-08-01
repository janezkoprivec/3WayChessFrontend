import { useEffect, useState, useRef } from 'react';
import { Container, Title, Stack, Group, Button, ScrollArea, Text } from '@mantine/core';
import { Manager, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Game, TimeControl } from '../types/game';
import { GameListItem } from './GameListItem';
import { GameJoinDialog } from './GameJoinDialog';
import { CreateGameDialog } from './CreateGameDialog';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

export function GamesComponent() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [joinDialogOpened, setJoinDialogOpened] = useState(false);
  const [createDialogOpened, setCreateDialogOpened] = useState(false);
  const [gamesSocket, setGamesSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const lastCreatedGameColorRef = useRef<string>('random');

  const { user } = useAuth();
  const navigate = useNavigate();

  const setUpSockets = () => {
    const socketManager = new Manager(API_CONFIG.BASE_URL.replace('/api', ''));
    const gamesSocket = socketManager.socket('/games');

    setGamesSocket(gamesSocket);

    gamesSocket.on('connect', () => {
      console.log('Connected to games socket');
      setIsConnected(true);
      setConnectionError(null);
    });

    gamesSocket.on('disconnect', () => {
      console.log('Disconnected from games socket');
      setIsConnected(false);
    });

    gamesSocket.on('waiting-games', (games: Game[]) => {
      console.log('Received games:', games);
      setGames(games);
    });

    gamesSocket.on('game-created', (game: any) => {
      if (user) {
        navigate(`/game/${game._id}?color=${lastCreatedGameColorRef.current}`);
      }
    });

    gamesSocket.on('error', (error: any) => {
      console.log('Server error:', error);
      setConnectionError(error.message || 'Connection error');
    });

    return () => {
      gamesSocket.disconnect();
    };
  };

  useEffect(() => {
    try {
      const cleanup = setUpSockets();
      return cleanup;
    } catch (error) {
      console.error('Failed to set up sockets:', error);
    }
  }, []);

  const handleGamePress = (game: Game) => {
    setSelectedGame(game);
    setJoinDialogOpened(true);
  };

  const handleJoinGame = (game: Game, selectedColor: string) => {
    setJoinDialogOpened(false);
    setSelectedGame(null);
    navigate(`/game/${game.id}?color=${selectedColor}`);
  };

  const handleCreateGame = (
    gameName: string,
    selectedColor: string,
    timeControl: TimeControl
  ) => {
    setCreateDialogOpened(false);
    lastCreatedGameColorRef.current = selectedColor;
    if (user) {
      console.log('User found:', user);
      const createData = { 
        gameName, 
        selectedColor, 
        timeControl, 
        user: {
          id: user.id
        }
      };
      console.log('Creating game with data:', createData);
      gamesSocket?.emit('create', createData);
    } else {
      console.log('User not found');
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Online Games</Title>
          <Group gap="xs">
            {isConnected ? (
              <Text size="sm" c="green">Connected</Text>
            ) : (
              <Text size="sm" c="red">Disconnected</Text>
            )}
          </Group>
        </Group>

        {connectionError && (
          <Text c="red" size="sm">
            Connection error: {connectionError}
          </Text>
        )}

        <ScrollArea h={400} type="auto">
          <Stack gap="md">
            {games.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No games available. Create a new game to get started!
              </Text>
            ) : (
              games.map((game) => (
                <div key={game.id} onClick={() => handleGamePress(game)} style={{ cursor: 'pointer' }}>
                  <GameListItem game={game} />
                </div>
              ))
            )}
          </Stack>
        </ScrollArea>

        <Group gap="md">
          <Button 
            size="lg" 
            onClick={() => setCreateDialogOpened(true)}
            style={{ flex: 1 }}
          >
            New Online Game
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/offline-game')}
            style={{ flex: 1 }}
          >
            New Offline Game
          </Button>
        </Group>

        <GameJoinDialog
          game={selectedGame}
          opened={joinDialogOpened}
          onClose={() => setJoinDialogOpened(false)}
          onJoin={handleJoinGame}
        />

        <CreateGameDialog
          opened={createDialogOpened}
          onClose={() => setCreateDialogOpened(false)}
          onCreate={handleCreateGame}
        />
      </Stack>
    </Container>
  );
} 