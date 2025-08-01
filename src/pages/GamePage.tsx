import { Container, Title, Text, Stack, Button, Group, Avatar, Badge } from '@mantine/core';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Manager, Socket } from 'socket.io-client';
import { IGameLean, IUserLean } from '../types/game';
import { API_CONFIG } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { GameWaitingDialog } from '../components/GameWaitingDialog';
import { OnlineChessGame } from '../components/OnlineChessGame';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export function GamePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const selectedColor = searchParams.get('color') || 'random';
  const { height: windowHeight } = useWindowSize();
  
  const [game, setGame] = useState<IGameLean | null>(null);
  const [gameSocket, setGameSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showWaitingDialog, setShowWaitingDialog] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<string>('white');

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

    socket.on('turn-updated', (turnData: { currentTurn: string }) => {
      console.log('Turn updated:', turnData);
      setCurrentTurn(turnData.currentTurn);
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

  return (
    <Container size="lg" py="xl">

      {game && game.status === 'active' && (
        <OnlineChessGame
          height={windowHeight - 200}
          showCoordinates={false}
          playerColor={selectedColor}
          gameSocket={gameSocket}
          currentTurn={currentTurn}
          isMyTurn={currentTurn === selectedColor}
        />
      )}

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