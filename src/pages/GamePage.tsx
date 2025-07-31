import { Container, Title, Text, Stack, Button, Group, Avatar, Badge } from '@mantine/core';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Manager, Socket } from 'socket.io-client';
import { IGameLean, IUserLean } from '../types/game';
import { API_CONFIG } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { GameWaitingDialog } from '../components/GameWaitingDialog';

export function GamePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const selectedColor = searchParams.get('color') || 'random';
  
  const [game, setGame] = useState<IGameLean | null>(null);
  const [gameSocket, setGameSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showWaitingDialog, setShowWaitingDialog] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const setUpSocket = () => {
    if (!id) return;

    const socketManager = new Manager(API_CONFIG.BASE_URL.replace('/api', ''));
    const socket = socketManager.socket(`/games/${id}`);

    setGameSocket(socket);

    socket.on('connect', () => {
      console.log('Connected to game socket');
      setIsConnected(true);
      setConnectionError(null);
      
      if (user && !hasJoined) {
        socket.emit("join", { 
          player: { 
            user: user, 
            color: selectedColor 
          } 
        });
        setHasJoined(true);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from game socket');
      setIsConnected(false);
    });

    socket.on('game-updated', (updatedGame: IGameLean) => {
      console.log('Game updated:', updatedGame);
      setGame(updatedGame);
      
      if (updatedGame.status === 'active') {
        setShowWaitingDialog(false);
      } else if (updatedGame.status === 'waiting') {
        setShowWaitingDialog(true);
      }
    });

    socket.on('error', (error: any) => {
      console.log('Game socket error:', error);
      setConnectionError(error.message || 'Connection error');
    });

    return () => {
      socket.disconnect();
    };
  };

  useEffect(() => {
    try {
      const cleanup = setUpSocket();
      return cleanup;
    } catch (error) {
      console.error('Failed to set up game socket:', error);
    }
  }, [id]);

  useEffect(() => {
    if (game && game.status === 'waiting') {
      setShowWaitingDialog(true);
    } else if (game && game.status === 'active') {
      setShowWaitingDialog(false);
    }
  }, [game]);

  const handleLeave = () => {
    setShowWaitingDialog(false);
    setGame(null);
    setHasJoined(false);
    navigate('/games');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'waiting':
        return 'yellow';
      case 'finished':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTimeControlText = (timeControl: any) => {
    return `${timeControl.type} - ${timeControl.initialTime}min + ${timeControl.increment}s`;
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Title order={2}>Game {id}</Title>
        
        {connectionError && (
          <Text c="red">Connection error: {connectionError}</Text>
        )}
        
        {game ? (
          <>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>{game.name}</Title>
                <Badge color={getStatusColor(game.status)} size="lg">
                  {game.status.toUpperCase()}
                </Badge>
              </Group>
              
              <Text>Time Control: {getTimeControlText(game.timeControl)}</Text>
              
              <Stack gap="sm">
                <Title order={4}>Players</Title>
                {game.players.map((player, index) => (
                  <Group key={index} gap="sm">
                    <Avatar 
                      src={player.user.profilePictureUrl} 
                      alt={player.user.username}
                      size="md"
                    />
                    <Stack gap={0}>
                      <Text fw={500}>{player.user.username}</Text>
                      <Text size="sm" c="dimmed">{player.color}</Text>
                    </Stack>
                  </Group>
                ))}
              </Stack>
              
              <Stack gap="sm">
                <Title order={4}>Created by</Title>
                <Group gap="sm">
                  <Avatar 
                    src={game.createdBy.profilePictureUrl} 
                    alt={game.createdBy.username}
                    size="md"
                  />
                  <Text fw={500}>{game.createdBy.username}</Text>
                </Group>
              </Stack>
            </Stack>
          </>
        ) : (
          <Text>Loading game information...</Text>
        )}
        
        <Button onClick={() => navigate('/games')} variant="outline">
          Back to Games
        </Button>
      </Stack>

      <GameWaitingDialog 
        opened={showWaitingDialog}
        game={game}
        selectedColor={selectedColor}
        gameSocket={gameSocket}
        user={user}
        onLeave={handleLeave}
      />
    </Container>
  );
} 