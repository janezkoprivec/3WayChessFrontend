import { Modal, Loader, Group, Avatar, Stack, Text, Title, Button } from '@mantine/core';
import { IGameLean } from '../types/game';
import { Socket } from 'socket.io-client';

interface GameWaitingDialogProps {
  opened: boolean;
  game: IGameLean | null;
  selectedColor: string;
  gameSocket: Socket | null;
  user: any;
  onLeave: () => void;
}

export function GameWaitingDialog({ 
  opened, 
  game, 
  selectedColor, 
  gameSocket, 
  user, 
  onLeave 
}: GameWaitingDialogProps) {
  
  const handleLeave = () => {
    if (gameSocket && user) {
      gameSocket.emit("leave", { 
        player: { 
          user: user, 
          color: selectedColor 
        } 
      });
      gameSocket.disconnect();
    }
    onLeave();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={() => {}} 
      title="Waiting for players"
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      centered
      size="md"
    >
      <Stack align="center" gap="lg" py="xl">
        <Loader size="lg" />
        <Text ta="center" size="lg">Waiting for other players to join...</Text>
        
        {game && (
          <Stack gap="md" w="100%">
            <Title order={4} ta="center">Players</Title>
            
            {game.players.length > 0 ? (
              <Stack gap="sm">
                {game.players.map((player, index) => (
                  <Group key={index} gap="sm" justify="center">
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
            ) : (
              <Text ta="center" c="dimmed">No players joined yet</Text>
            )}
            
            <Text size="sm" c="dimmed" ta="center">
              The game will start automatically when all players are ready.
            </Text>
          </Stack>
        )}
        
        <Button 
          variant="outline" 
          color="red" 
          onClick={handleLeave}
          fullWidth
        >
          Leave Game
        </Button>
      </Stack>
    </Modal>
  );
} 